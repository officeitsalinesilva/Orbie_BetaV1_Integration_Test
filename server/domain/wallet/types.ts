export type LedgerEntryType = 'CREDIT_GRANT' | 'CREDIT_CONSUMPTION' | 'CREDIT' | 'DEBIT';

export type LedgerCategory =
  | 'DAILY_BASE'
  | 'CHECKIN_STREAK_BONUS'
  | 'COUPON_BENEFIT'
  | 'INVITE_REWARD'
  | 'PURCHASE'
  | 'ITEM_UNLOCK'
  | 'ADMIN_ADJUSTMENT';

export type CreditSource =
  | 'PLATFORM_DAILY'
  | 'STREAK'
  | 'COUPON'
  | 'PURCHASE'
  | 'ADJUSTMENT'
  | 'WELCOME'
  | 'REFERRAL';

export interface LedgerEntry {
  id: string;
  ownerUid: string;
  userUid: string; // compatibility alias
  type: LedgerEntryType;
  category: LedgerCategory | string;
  source?: CreditSource;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  idempotencyKey?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  timestamp: string;
}

export interface Wallet {
  ownerUid: string;
  userUid: string; // compatibility alias
  balance: number;
  plan: 'free' | 'premium';
  createdAt: string;
  updatedAt: string;
}

export interface Entitlement {
  id: string;
  userUid: string;
  ownerUid?: string;
  scopeType: 'matrix' | 'profile' | 'event';
  scopeId?: string;
  itemCode: string;
  source: 'PURCHASE' | 'INCLUDED_IN_PLAN' | 'CREDIT_REDEMPTION' | 'ADMIN';
  unlockedAt: string;
}

