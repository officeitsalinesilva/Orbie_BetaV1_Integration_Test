/**
 * ORBIE — Payment & Commercial Reconciliation Domain Types
 * Phase 4G: Real Payments + Mercado Pago + Authoritative Ledger & Entitlements
 */

import { OrderEntity, PaymentEntity, OrderStatus, PaymentStatus } from '../../persistence/types';

export { OrderEntity, PaymentEntity, OrderStatus, PaymentStatus };

export type PaymentMethodType = 'pix' | 'credit_card' | 'preference' | 'all';

export interface CreateOrderRequest {
  userId: string;
  quoteId: string;
  payerEmail?: string;
  payerName?: string;
  payerIdentification?: {
    type: string;
    number: string;
  };
  paymentMethodPreference?: PaymentMethodType;
  cardToken?: string;
  installments?: number;
  returnUrl?: string;
  notificationUrl?: string;
}

export interface CheckoutResult {
  orderId: string;
  productId: string;
  productName: string;
  amountInCents: number;
  currency: string;
  status: OrderStatus;
  provider: 'mercadopago';
  providerReference?: string;
  paymentMethod?: string;
  preference?: {
    id: string;
    initPoint: string;
    sandboxInitPoint?: string;
  };
  pix?: {
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    ticketUrl?: string;
    expiresAt?: string;
  };
  card?: {
    paymentId: string;
    status: PaymentStatus;
    statusDetail?: string;
  };
  createdAt: string;
}

export interface AuthoritativePaymentData {
  providerPaymentId: string;
  externalReference?: string;
  orderId?: string;
  status: PaymentStatus;
  statusDetail?: string;
  amountInCents: number;
  currency: string;
  paymentMethod?: string;
  payerEmail?: string;
  approvedAt?: string;
  raw: any;
}

export interface IPaymentProvider {
  readonly providerName: 'mercadopago' | string;
  isConfigured(): boolean;
  createPreference(order: OrderEntity, options?: { returnUrl?: string; notificationUrl?: string }): Promise<{
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint?: string;
  }>;
  createPixPayment(order: OrderEntity, payer: { email: string; name?: string; identification?: { type: string; number: string } }): Promise<{
    providerPaymentId: string;
    status: PaymentStatus;
    qrCode: string;
    qrCodeBase64: string;
    ticketUrl?: string;
    expiresAt?: string;
  }>;
  createCardPayment?(order: OrderEntity, cardData: { token: string; installments?: number; payer: { email: string; identification?: { type: string; number: string } } }): Promise<{
    providerPaymentId: string;
    status: PaymentStatus;
    statusDetail?: string;
  }>;
  getAuthoritativePayment(providerPaymentId: string): Promise<AuthoritativePaymentData>;
}
