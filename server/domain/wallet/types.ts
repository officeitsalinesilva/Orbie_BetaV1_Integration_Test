export type LedgerEntryType = 'CREDIT_GRANT' | 'CREDIT_CONSUMPTION';

export type LedgerCategory =
  | 'DAILY_BASE'
  | 'CHECKIN_STREAK_BONUS'
  | 'COUPON_BENEFIT'
  | 'INVITE_REWARD'
  | 'PURCHASE'
  | 'ITEM_UNLOCK'
  | 'ADMIN_ADJUSTMENT';

export interface LedgerEntry {
  id: string;
  userUid: string;
  type: LedgerEntryType;
  category: LedgerCategory;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: string;
  timestamp?: string;
}

export interface Wallet {
  userUid: string;
  balance: number;
  plan: 'free' | 'premium';
  createdAt: string;
  updatedAt: string;
}

export interface Entitlement {
  id: string;
  userUid: string;
  scopeType: 'matrix' | 'profile' | 'event';
  scopeId?: string;
  itemCode: string;
  source: 'PURCHASE' | 'INCLUDED_IN_PLAN' | 'CREDIT_REDEMPTION' | 'ADMIN';
  unlockedAt: string;
}
