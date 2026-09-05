export interface CommercialProductUI {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  type: string;
  basePriceCents: number;
  baseCurrency: string;
  creditPrice: number;
  allowsCreditPurchase: boolean;
  allowsFiatPurchase: boolean;
  entitlementType: 'PERMANENT' | 'TEMPORARY' | 'USAGE_LIMITED';
  entitlementDurationDays?: number;
  usageLimit?: number;
  policy: {
    freeAllowed: boolean;
    subscriptionIncluded: boolean;
    couponEligible: boolean;
    maxDiscountPercent?: number;
  };
  status: 'draft' | 'active' | 'inactive' | 'archived' | 'planned';
  validFrom?: string;
  validUntil?: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface CommercialRegionUI {
  code: string;
  name: string;
  currency: string;
  multiplier: number;
  discountPercent: number;
  roundingCents: number;
  supportedPaymentMethods: string[];
  active: boolean;
  taxIncluded: boolean;
  validFrom?: string;
  validUntil?: string;
  updatedAt: string;
}

export interface CommercialPlanUI {
  id: string;
  name: string;
  description: string;
  tier: 'FREE' | 'PRO' | 'LIFETIME';
  priceMonthlyCents: number;
  currency: string;
  dailyCreditsGranted: number;
  streakBonusCreditsGranted: number;
  catalogDiscountPercent: number;
  features: string[];
  active: boolean;
  status?: 'draft' | 'active' | 'inactive' | 'archived';
  validFrom?: string;
  validUntil?: string;
  version: number;
  updatedAt: string;
}

export interface CommercialDailyCreditRuleUI {
  id: string;
  baseCredits: number;
  streakBonusCredits: number;
  streakRequiredDays: number;
  maxDailyBenefitCredits: number;
  allowProDoubling: boolean;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface CommercialConfigVersionUI {
  id: string;
  entityType: 'product' | 'plan' | 'daily_credits' | 'regional_policy';
  entityId: string;
  version: number;
  timestamp: string;
  modifiedBy: string;
  changeSummary: string;
  snapshot: any;
}
