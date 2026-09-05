/**
 * ORBIE — Commercial Domain Types (Fase 4F)
 * Canonical definitions for commercial configuration, pricing, entitlements, policies, and versioning.
 */

export type CommercialProductType =
  | 'LIBRARY_ITEM'
  | 'SERVICE'
  | 'TOOL'
  | 'CREDIT_GRANT'
  | 'SUBSCRIPTION'
  | 'FEATURE';

export type CommercialEntitlementType =
  | 'PERMANENT'
  | 'TEMPORARY'
  | 'USAGE_LIMITED'
  | 'CREDIT_BALANCE'
  | 'FEATURE_ACCESS'
  | 'LIBRARY_ACCESS';

export type CommercialProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface CommercialProductPricing {
  basePriceInCents: number; // Stored in integer minor units (e.g. 2900 = R$ 29,00 or USD 29.00)
  baseCurrency: string; // e.g. 'BRL' or 'USD'
  creditPrice: number; // Cost in platform credits (e.g. 100 credits)
  allowsCreditPurchase: boolean;
  allowsFiatPurchase: boolean;
}

export interface CommercialProductEntitlement {
  type: CommercialEntitlementType;
  durationDays?: number; // for TEMPORARY entitlements
  usageLimit?: number; // for USAGE_LIMITED entitlements
  targetScope?: 'profile' | 'matrix' | 'library' | 'global';
}

export interface CommercialProductPolicy {
  freeAllowed: boolean;
  subscriptionIncluded: boolean;
  couponEligible: boolean;
  regionalEligibility?: string[]; // list of country codes or ['*'] for global
}

export interface CommercialProduct {
  id: string; // e.g. 'AST-001', 'FER-001'
  code: string; // e.g. 'AST-001'
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  category: string; // 'ferramentas' | 'perfil-astrologia' | 'perfil-cabala' | 'perfil-chave-mestra' | 'perfil-numerologia' | 'mensais-anuais' | 'creditos' | 'planos'
  type: CommercialProductType;
  status: CommercialProductStatus;
  enabled: boolean;
  validFrom?: string;
  validUntil?: string;
  pricing: CommercialProductPricing;
  entitlement: CommercialProductEntitlement;
  policy: CommercialProductPolicy;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommercialRegion {
  code: string; // e.g. 'BR', 'US', 'EU', 'GB', 'LATAM', 'GLOBAL_TIER3'
  name: string;
  currency: string; // 'BRL', 'USD', 'EUR', 'GBP'
  currencySymbol: string; // 'R$', '$', '€', '£'
  multiplier: number; // e.g. 1.0, 0.5, 0.3
  discountPercent: number; // e.g. 0, 50, 70
  status: CommercialProductStatus;
  validFrom?: string;
  validUntil?: string;
  supportedPaymentMethods: string[]; // ['pix', 'credit_card', 'mercadopago']
}

export interface CommercialDailyCreditRule {
  baseCredits: number; // default: 5
  streakBonusCredits: number; // default: 5
  streakRequiredDays: number; // default: 3
  maxDailyBenefit: number; // default: 10
  isAccumulative: boolean; // default: false
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface CommercialPlan {
  id: 'free' | 'subscription' | string;
  name: string;
  nameEn?: string;
  status: CommercialProductStatus;
  enabled: boolean;
  validFrom?: string;
  validUntil?: string;
  priceInCents: number;
  currency: string;
  billingPeriod: 'none' | 'monthly' | 'annual';
  dailyCredits: number;
  streakBonus: number;
  features: string[];
  featuresEn?: string[];
  catalogAvailability: 'all' | 'restricted' | 'included';
  discountPolicy: {
    discountPercent: number;
    masterKeyDiscountPercent: number;
  };
  couponEligibility: boolean;
  entitlements: string[];
  version: number;
  updatedAt: string;
}

export interface CommercialConfigVersion {
  id: string;
  entityType: 'product' | 'plan' | 'daily_credits' | 'regional_policy';
  entityId: string;
  version: number;
  dataSnapshot: any;
  changeSummary: string;
  validFrom: string;
  validUntil?: string;
  modifiedBy: string;
}

export interface PriceQuoteRequest {
  productId: string;
  detectedCountry?: string;
  selectedCountry?: string;
  billingCountry?: string;
  currencyHint?: string;
  couponCode?: string;
  userId?: string;
}

export interface PriceQuote {
  quoteId: string;
  productId: string;
  productName: string;
  basePriceInCents: number;
  baseCurrency: string;
  detectedCountry: string;
  selectedCountry: string;
  billingCountry: string;
  currency: string;
  currencySymbol: string;
  regionalMultiplier: number;
  regionalAdjustmentInCents: number;
  discountInCents: number;
  discountReason?: string;
  appliedCoupon?: {
    code: string;
    discountInCents: number;
    description?: string;
  };
  finalPriceInCents: number;
  finalPriceFormatted: string;
  allowsCreditPurchase: boolean;
  creditPrice: number;
  couponEligible: boolean;
  createdAt: string;
  expiresAt: string;
}
