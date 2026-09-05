/**
 * ORBIE — Payment Service (Phase 4G)
 * Complete, secure, authoritative commercial payment lifecycle:
 * Quote Validation -> Order Creation -> Mercado Pago Execution ->
 * Authoritative Webhook Validation -> Ledger Recording -> Entitlement Granting.
 */

import { orderRepo, paymentRepo, profileRepo, walletRepo, couponRepo } from '../../persistence';
import { commercialService } from '../commercial/commercialService';
import { walletService } from '../wallet/walletService';
import { mercadopagoProvider } from './mercadopagoProvider';
import {
  CreateOrderRequest,
  CheckoutResult,
  OrderEntity,
  PaymentEntity,
  AuthoritativePaymentData,
  OrderStatus,
} from './types';

export class PaymentService {
  /**
   * 1. CREATE ORDER FROM AUTHORITATIVE QUOTE
   * Never trust client price or currency. Everything stems strictly from the Quote.
   */
  public async createOrderFromQuote(request: CreateOrderRequest): Promise<CheckoutResult> {
    const {
      userId,
      quoteId,
      payerEmail,
      payerName,
      payerIdentification,
      paymentMethodPreference = 'preference',
      returnUrl,
      notificationUrl,
    } = request;

    if (!userId) {
      throw new Error('Identificação do usuário (userId) obrigatória.');
    }
    if (!quoteId) {
      throw new Error('ID da cotação (quoteId) obrigatório.');
    }

    // 1. Validate Quote authoritatively from commercialService
    const quote = commercialService.validateQuote(quoteId);

    // 2. Fetch and validate Product
    const product = await commercialService.getProduct(quote.productId);
    if (!product) {
      throw new Error(`Produto não encontrado: ${quote.productId}`);
    }
    if (product.status !== 'active') {
      throw new Error(`Produto ${product.name} não está ativo para comercialização.`);
    }
    if (!product.pricing.allowsFiatPurchase) {
      throw new Error(`Produto ${product.name} não permite aquisição monetária direta.`);
    }

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const now = new Date().toISOString();

    // 3. Construct Order Entity
    const initialOrder: OrderEntity = {
      orderId,
      userId,
      productId: product.id,
      productCode: product.code,
      quoteId: quote.quoteId,
      amountInCents: quote.finalPriceInCents,
      currency: quote.currency,
      status: 'PENDING',
      paymentProvider: 'mercadopago',
      payerEmail: payerEmail || undefined,
      payerName: payerName || undefined,
      metadata: {
        productName: product.name,
        productType: product.type,
        basePriceInCents: quote.basePriceInCents,
        discountInCents: quote.discountInCents,
        discountReason: quote.discountReason,
        appliedCoupon: quote.appliedCoupon,
        regionalMultiplier: quote.regionalMultiplier,
        billingCountry: quote.billingCountry,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Save initial order
    await orderRepo.save(initialOrder);

    // 4. Delegate to Mercado Pago provider based on payment preference
    if (paymentMethodPreference === 'pix') {
      const pixResult = await mercadopagoProvider.createPixPayment(initialOrder, {
        email: payerEmail || 'cliente@orbie.app',
        name: payerName,
        identification: payerIdentification,
      });

      initialOrder.status = 'CHECKOUT_CREATED';
      initialOrder.providerReference = pixResult.providerPaymentId;
      await orderRepo.save(initialOrder);

      // Create pending Payment entity
      const payment: PaymentEntity = {
        paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        orderId: initialOrder.orderId,
        userId: initialOrder.userId,
        provider: 'mercadopago',
        providerPaymentId: pixResult.providerPaymentId,
        status: pixResult.status,
        amountInCents: initialOrder.amountInCents,
        currency: initialOrder.currency,
        paymentMethod: 'pix',
        rawResponse: pixResult,
        createdAt: now,
        updatedAt: now,
      };
      await paymentRepo.save(payment);

      return {
        orderId: initialOrder.orderId,
        productId: initialOrder.productId,
        productName: product.name,
        amountInCents: initialOrder.amountInCents,
        currency: initialOrder.currency,
        status: initialOrder.status,
        provider: 'mercadopago',
        providerReference: pixResult.providerPaymentId,
        paymentMethod: 'pix',
        pix: {
          ...pixResult,
          paymentId: pixResult.providerPaymentId,
        },
        createdAt: initialOrder.createdAt,
      };
    } else {
      // Checkout Pro Preference
      const prefResult = await mercadopagoProvider.createPreference(initialOrder, {
        returnUrl,
        notificationUrl,
      });

      initialOrder.status = 'CHECKOUT_CREATED';
      initialOrder.providerReference = prefResult.preferenceId;
      await orderRepo.save(initialOrder);

      return {
        orderId: initialOrder.orderId,
        productId: initialOrder.productId,
        productName: product.name,
        amountInCents: initialOrder.amountInCents,
        currency: initialOrder.currency,
        status: initialOrder.status,
        provider: 'mercadopago',
        providerReference: prefResult.preferenceId,
        paymentMethod: 'preference',
        preference: prefResult,
        createdAt: initialOrder.createdAt,
      };
    }
  }

  /**
   * 2. AUTHORITATIVE WEBHOOK RECONCILIATION
   * Handles webhook notifications idempotently, querying Mercado Pago directly.
   */
  public async handleWebhook(
    payload: any,
    query: Record<string, any>,
    headers: Record<string, any>
  ): Promise<{
    processed: boolean;
    idempotent?: boolean;
    orderId?: string;
    status?: OrderStatus;
    paymentStatus?: string;
    message: string;
  }> {
    // Extract provider payment ID from webhook payload or query params
    const providerPaymentId = String(
      payload?.data?.id ||
      query?.['data.id'] ||
      query?.id ||
      payload?.id ||
      ''
    ).trim();

    if (!providerPaymentId || providerPaymentId === 'undefined' || providerPaymentId === 'null') {
      return {
        processed: false,
        message: 'No valid providerPaymentId found in webhook notification.',
      };
    }

    // Unique event key for strict idempotency
    const action = payload?.action || query?.topic || 'payment.status_check';
    const eventId = String(headers?.['x-request-id'] || `mp-evt-${providerPaymentId}-${action}`).trim();

    // Check if event was already processed
    const alreadyProcessed = await paymentRepo.isEventProcessed(eventId);
    if (alreadyProcessed) {
      return {
        processed: true,
        idempotent: true,
        message: `Event ${eventId} has already been processed.`,
      };
    }

    // Consult provider API authoritatively
    const authData: AuthoritativePaymentData = await mercadopagoProvider.getAuthoritativePayment(providerPaymentId);

    // Locate internal order
    let order: OrderEntity | null = null;
    if (authData.orderId) {
      order = await orderRepo.get(authData.orderId);
    }
    if (!order && authData.externalReference) {
      order = await orderRepo.get(authData.externalReference);
    }
    if (!order) {
      order = await orderRepo.getByProviderReference(providerPaymentId);
    }

    if (!order) {
      console.warn(`[PaymentService] Webhook: Order not found for provider payment ${providerPaymentId}`);
      await paymentRepo.markEventProcessed(eventId);
      return {
        processed: true,
        message: `Order not found for providerPaymentId ${providerPaymentId}. Event marked as processed.`,
      };
    }

    // Create or update Payment entity
    const existingPayments = await paymentRepo.findByOrder(order.orderId);
    let payment = existingPayments.find((p) => p.providerPaymentId === providerPaymentId);
    const now = new Date().toISOString();

    if (payment) {
      payment.status = authData.status;
      payment.amountInCents = authData.amountInCents || payment.amountInCents;
      payment.paymentMethod = authData.paymentMethod || payment.paymentMethod;
      payment.rawResponse = authData.raw;
      payment.updatedAt = now;
      await paymentRepo.save(payment);
    } else {
      payment = {
        paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        orderId: order.orderId,
        userId: order.userId,
        provider: 'mercadopago',
        providerPaymentId,
        status: authData.status,
        amountInCents: authData.amountInCents || order.amountInCents,
        currency: authData.currency || order.currency,
        paymentMethod: authData.paymentMethod || 'unknown',
        rawResponse: authData.raw,
        createdAt: now,
        updatedAt: now,
      };
      await paymentRepo.save(payment);
    }

    // Reconcile status
    if (authData.status === 'approved') {
      // Idempotency check on order level: do not grant twice if already PAID
      if (order.status !== 'PAID') {
        order.status = 'PAID';
        order.updatedAt = now;
        await orderRepo.save(order);

        // Fulfill entitlements and commercial effects
        await this.fulfillPaidOrder(order, payment);
      }
    } else if (authData.status === 'rejected') {
      if (order.status !== 'PAID') {
        order.status = 'FAILED';
        order.updatedAt = now;
        await orderRepo.save(order);
      }
    } else if (authData.status === 'cancelled') {
      if (order.status !== 'PAID') {
        order.status = 'CANCELLED';
        order.updatedAt = now;
        await orderRepo.save(order);
      }
    }

    // Mark event processed permanently
    await paymentRepo.markEventProcessed(eventId);

    return {
      processed: true,
      orderId: order.orderId,
      status: order.status,
      paymentStatus: authData.status,
      message: `Order ${order.orderId} reconciled to ${order.status}.`,
    };
  }

  /**
   * 3. FULFILL PAID ORDER
   * Grants Entitlement, records immutable Ledger entry, unlocks library item.
   */
  private async fulfillPaidOrder(order: OrderEntity, payment: PaymentEntity): Promise<void> {
    const product = await commercialService.getProduct(order.productId);
    const now = new Date().toISOString();
    const formattedAmount = `${order.currency} ${(order.amountInCents / 100).toFixed(2)}`;

    // 1. Grant Entitlement based on Product Type
    if (product) {
      if (product.type === 'LIBRARY_ITEM') {
        // Unlock item permanently in primary profile
        const primaryProfile = await profileRepo.getPrimary(order.userId);
        if (primaryProfile) {
          const currentUnlocked = primaryProfile.unlockedItems || [];
          if (!currentUnlocked.includes(product.code)) {
            primaryProfile.unlockedItems = [...currentUnlocked, product.code];
            await profileRepo.save(primaryProfile);
          }
        }

        // Add explicit Entitlement record
        await walletService.addEntitlement(
          order.userId,
          product.code,
          'GLOBAL',
          undefined,
          'PURCHASE'
        );
      } else if (product.type === 'SUBSCRIPTION') {
        // Upgrade user plan
        await walletService.updatePlan(order.userId, 'premium');
      } else if (product.type === 'CREDIT_GRANT') {
        // Grant credits to wallet
        const creditAmount = product.pricing.creditPrice || (order.metadata?.creditAmount as number) || 50;
        await walletService.grantCredits(
          order.userId,
          creditAmount,
          'PURCHASE',
          order.orderId,
          `Compra de pacote de créditos (${creditAmount} créditos) via Mercado Pago`,
          {
            orderId: order.orderId,
            paymentId: payment.paymentId,
            amountInCents: order.amountInCents,
            currency: order.currency,
          }
        );
      } else {
        // TOOL or other usage limited items
        await walletService.addEntitlement(
          order.userId,
          product.code,
          'GLOBAL',
          undefined,
          'PURCHASE'
        );
      }
    }

    // 2. Record Financial Ledger Entry (Auditable & Immutable)
    const wallet = await walletRepo.get(order.userId);
    const currentBalance = wallet ? wallet.balance : 0;

    await walletRepo.addLedgerEntry({
      id: `led-pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ownerUid: order.userId,
      userUid: order.userId,
      amount: 0, // Monetary purchase does not alter credit balance unless credit_grant
      balanceBefore: currentBalance,
      balanceAfter: currentBalance,
      type: 'CREDIT',
      category: 'PURCHASE',
      source: 'PURCHASE',
      description: `Pagamento aprovado Mercado Pago (${formattedAmount}) - ${order.metadata?.productName || order.productCode}`,
      referenceId: order.orderId,
      idempotencyKey: `pay-ledger-${order.orderId}`,
      metadata: {
        orderId: order.orderId,
        paymentId: payment.paymentId,
        provider: 'mercadopago',
        providerPaymentId: payment.providerPaymentId,
        productId: order.productId,
        productCode: order.productCode,
        currency: order.currency,
        amountInCents: order.amountInCents,
        formattedAmount,
      },
      createdAt: now,
      timestamp: now,
    });

    // 3. Record coupon redemption if a coupon was used
    if (order.metadata?.appliedCoupon) {
      try {
        const couponCode = String(order.metadata.appliedCoupon).trim().toUpperCase();
        await couponRepo.addRedemption({
          id: `red-ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          couponCode,
          campaignId: 'COMMERCIAL_CHECKOUT',
          userUid: order.userId,
          creditsGranted: 0,
          redeemedAt: now,
          status: 'SUCCESS',
        });
      } catch (err) {
        console.warn('[PaymentService] Error recording coupon redemption:', err);
      }
    }
  }

  /**
   * Helper for testing/admin simulation: Trigger approval of a sandbox payment
   */
  public async simulatePaymentApproval(providerPaymentId: string): Promise<any> {
    mercadopagoProvider.simulatePaymentStatus(providerPaymentId, 'approved');
    return this.handleWebhook(
      { data: { id: providerPaymentId }, action: 'payment.updated' },
      { id: providerPaymentId },
      { 'x-request-id': `sim-approval-${Date.now()}` }
    );
  }

  public async getOrder(orderId: string, requestingUserUid?: string): Promise<OrderEntity | null> {
    const order = await orderRepo.get(orderId);
    if (!order) return null;
    if (requestingUserUid && order.userId !== requestingUserUid) {
      // Check if admin or forbid
      return null;
    }
    return order;
  }

  public async listUserOrders(userId: string): Promise<OrderEntity[]> {
    return orderRepo.findByUser(userId);
  }

  public async listAllOrders(): Promise<OrderEntity[]> {
    return orderRepo.listAll();
  }
}

export const paymentService = new PaymentService();
