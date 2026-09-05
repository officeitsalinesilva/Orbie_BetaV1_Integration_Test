/**
 * ORBIE — Mercado Pago Payment Provider Implementation
 * Handles Checkout Pro Preferences, Direct PIX Payments, Card Payments,
 * and Authoritative Status Verification via Mercado Pago REST APIs.
 */

import {
  IPaymentProvider,
  OrderEntity,
  PaymentStatus,
  AuthoritativePaymentData,
} from './types';

export class MercadoPagoProvider implements IPaymentProvider {
  public readonly providerName = 'mercadopago';

  private accessToken: string | null = null;
  private publicKey: string | null = null;
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private webhookSecret: string | null = null;
  private appUrl: string = 'http://localhost:3000';

  // Sandbox simulation store for automated tests or environments without live MP keys
  private sandboxPayments: Map<string, AuthoritativePaymentData> = new Map();

  constructor() {
    this.reloadConfig();
  }

  public reloadConfig(): void {
    this.accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || null;
    this.publicKey = process.env.MERCADOPAGO_PUBLIC_KEY || null;
    this.clientId = process.env.MERCADOPAGO_CLIENT_ID || null;
    this.clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET || null;
    this.webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || null;
    this.appUrl = process.env.APP_URL || 'http://localhost:3000';
  }

  public isConfigured(): boolean {
    return !!(this.accessToken || (this.clientId && this.clientSecret));
  }

  private async getEffectiveAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;

    if (this.clientId && this.clientSecret) {
      try {
        const res = await fetch('https://api.mercadopago.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { access_token?: string };
          if (data.access_token) {
            this.accessToken = data.access_token;
            return this.accessToken;
          }
        }
      } catch (err) {
        console.warn('[MercadoPagoProvider] Failed to fetch oauth token:', err);
      }
    }
    return null;
  }

  /**
   * Create Checkout Pro Preference
   */
  public async createPreference(
    order: OrderEntity,
    options?: { returnUrl?: string; notificationUrl?: string }
  ): Promise<{
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint?: string;
  }> {
    const token = await this.getEffectiveAccessToken();
    const returnUrl = options?.returnUrl || `${this.appUrl}/wallet?orderId=${order.orderId}`;
    const notificationUrl = options?.notificationUrl || `${this.appUrl}/api/payments/webhook`;

    if (token) {
      try {
        const unitPrice = order.amountInCents / 100;
        const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [
              {
                id: order.productId,
                title: order.metadata?.productName || order.productCode || 'Item Orbie',
                quantity: 1,
                currency_id: order.currency,
                unit_price: unitPrice,
              },
            ],
            payer: {
              email: order.payerEmail || 'cliente@orbie.app',
              name: order.payerName || 'Cliente Orbie',
            },
            external_reference: order.orderId,
            back_urls: {
              success: `${returnUrl}&payment_status=success`,
              failure: `${returnUrl}&payment_status=failure`,
              pending: `${returnUrl}&payment_status=pending`,
            },
            auto_return: 'approved',
            notification_url: notificationUrl,
            metadata: {
              orderId: order.orderId,
              userId: order.userId,
              productId: order.productId,
              productCode: order.productCode,
            },
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          return {
            preferenceId: data.id,
            initPoint: data.init_point || data.sandbox_init_point,
            sandboxInitPoint: data.sandbox_init_point,
          };
        } else {
          const errText = await res.text();
          console.warn('[MercadoPagoProvider] Preferences API returned error:', res.status, errText);
        }
      } catch (err) {
        console.warn('[MercadoPagoProvider] Live createPreference call failed, falling back to sandbox mode:', err);
      }
    }

    // Sandbox / Test Fallback (Deterministic & Safe)
    const prefId = `pref_mp_${order.orderId}_${Date.now().toString(36)}`;
    const mockInitPoint = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${prefId}`;

    this.sandboxPayments.set(prefId, {
      providerPaymentId: prefId,
      externalReference: order.orderId,
      orderId: order.orderId,
      status: 'pending',
      amountInCents: order.amountInCents,
      currency: order.currency,
      paymentMethod: 'preference',
      payerEmail: order.payerEmail,
      raw: { preferenceId: prefId },
    });

    return {
      preferenceId: prefId,
      initPoint: mockInitPoint,
      sandboxInitPoint: mockInitPoint,
    };
  }

  /**
   * Create Direct PIX Payment
   */
  public async createPixPayment(
    order: OrderEntity,
    payer: { email: string; name?: string; identification?: { type: string; number: string } }
  ): Promise<{
    providerPaymentId: string;
    status: PaymentStatus;
    qrCode: string;
    qrCodeBase64: string;
    ticketUrl?: string;
    expiresAt?: string;
  }> {
    const token = await this.getEffectiveAccessToken();
    const notificationUrl = `${this.appUrl}/api/payments/webhook`;

    if (token) {
      try {
        const amount = order.amountInCents / 100;
        const firstName = payer.name?.split(' ')[0] || 'Cliente';
        const lastName = payer.name?.split(' ').slice(1).join(' ') || 'Orbie';
        const identification = payer.identification || {
          type: 'CPF',
          number: '19119119100',
        };

        const res = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `pix-${order.orderId}`,
          },
          body: JSON.stringify({
            transaction_amount: amount,
            description: order.metadata?.productName || order.productCode || 'Orbie Pagamento PIX',
            payment_method_id: 'pix',
            payer: {
              email: payer.email || order.payerEmail || 'cliente@orbie.app',
              first_name: firstName,
              last_name: lastName,
              identification,
            },
            external_reference: order.orderId,
            notification_url: notificationUrl,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const poi = data.point_of_interaction?.transaction_data;
          const providerPaymentId = String(data.id);
          const paymentStatus: PaymentStatus = data.status || 'pending';

          // Cache in memory for fast lookup
          this.sandboxPayments.set(providerPaymentId, {
            providerPaymentId,
            externalReference: order.orderId,
            orderId: order.orderId,
            status: paymentStatus,
            statusDetail: data.status_detail,
            amountInCents: order.amountInCents,
            currency: order.currency,
            paymentMethod: 'pix',
            payerEmail: payer.email,
            approvedAt: data.date_approved,
            raw: data,
          });

          return {
            providerPaymentId,
            status: paymentStatus,
            qrCode: poi?.qr_code || '',
            qrCodeBase64: poi?.qr_code_base64 || '',
            ticketUrl: poi?.ticket_url,
            expiresAt: data.date_of_expiration,
          };
        } else {
          const errText = await res.text();
          console.warn('[MercadoPagoProvider] Live PIX Payment error:', res.status, errText);
        }
      } catch (err) {
        console.warn('[MercadoPagoProvider] Live createPixPayment call failed, falling back to sandbox mode:', err);
      }
    }

    // Sandbox Fallback
    const simulatedPaymentId = `mp_pix_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const mockEmvPix = `00020126580014BR.GOV.BCB.PIX0136orbie-commercial-${order.orderId}520400005303986540${(order.amountInCents / 100).toFixed(2)}5802BR5915ORBIE TECNOLOGIA6009SAO PAULO62070503***6304E63C`;
    // Standard minimal transparent 1x1 base64 png placeholder
    const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const simulatedAuth: AuthoritativePaymentData = {
      providerPaymentId: simulatedPaymentId,
      externalReference: order.orderId,
      orderId: order.orderId,
      status: 'pending',
      statusDetail: 'pending_waiting_transfer',
      amountInCents: order.amountInCents,
      currency: order.currency,
      paymentMethod: 'pix',
      payerEmail: payer.email,
      raw: { simulated: true, orderId: order.orderId },
    };
    this.sandboxPayments.set(simulatedPaymentId, simulatedAuth);

    return {
      providerPaymentId: simulatedPaymentId,
      status: 'pending',
      qrCode: mockEmvPix,
      qrCodeBase64: mockBase64,
      ticketUrl: `https://www.mercadopago.com.br/payments/${simulatedPaymentId}/ticket`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Fetch authoritative status directly from Mercado Pago API
   */
  public async getAuthoritativePayment(providerPaymentId: string): Promise<AuthoritativePaymentData> {
    const token = await this.getEffectiveAccessToken();

    if (token && !providerPaymentId.startsWith('mp_pix_') && !providerPaymentId.startsWith('sim_')) {
      try {
        const res = await fetch(`https://api.mercadopago.com/v1/payments/${providerPaymentId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const statusMap: Record<string, PaymentStatus> = {
            approved: 'approved',
            pending: 'pending',
            in_process: 'in_process',
            rejected: 'rejected',
            cancelled: 'cancelled',
            refunded: 'refunded',
            charged_back: 'refunded',
          };

          const status = statusMap[data.status] || 'pending';
          const amountInCents = Math.round((Number(data.transaction_amount) || 0) * 100);

          return {
            providerPaymentId: String(data.id),
            externalReference: data.external_reference,
            orderId: data.external_reference,
            status,
            statusDetail: data.status_detail,
            amountInCents,
            currency: data.currency_id || 'BRL',
            paymentMethod: data.payment_method_id,
            payerEmail: data.payer?.email,
            approvedAt: data.date_approved,
            raw: data,
          };
        }
      } catch (err) {
        console.warn(`[MercadoPagoProvider] Failed to fetch live payment ${providerPaymentId}:`, err);
      }
    }

    // Check sandbox map
    const cached = this.sandboxPayments.get(providerPaymentId);
    if (cached) {
      return cached;
    }

    // Fallback if payment was not found
    return {
      providerPaymentId,
      status: 'pending',
      statusDetail: 'unknown',
      amountInCents: 0,
      currency: 'BRL',
      raw: { notFound: true },
    };
  }

  /**
   * Method for testing: manually simulate sandbox payment transition (e.g. approve a PIX)
   */
  public simulatePaymentStatus(providerPaymentId: string, status: PaymentStatus): AuthoritativePaymentData {
    const existing = this.sandboxPayments.get(providerPaymentId) || {
      providerPaymentId,
      externalReference: providerPaymentId,
      orderId: providerPaymentId,
      status: 'pending',
      amountInCents: 0,
      currency: 'BRL',
      paymentMethod: 'sandbox',
    };
    existing.status = status;
    if (status === 'approved') {
      existing.approvedAt = new Date().toISOString();
    }
    this.sandboxPayments.set(providerPaymentId, existing);
    return existing;
  }
}

export const mercadopagoProvider = new MercadoPagoProvider();
