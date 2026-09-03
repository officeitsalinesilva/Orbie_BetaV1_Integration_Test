export type CampaignStatus = 'active' | 'draft' | 'expired' | 'archived';
export type CouponStatus = 'active' | 'disabled' | 'exhausted';

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  creditsPerWithdrawal: number;
  validityDays: number;
  withdrawalFrequencyHours: number; // e.g. 24
  maxUsesPerUser: number;           // e.g. 7 withdrawals
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  targetUserUids?: string[];        // If defined, restricted to these users
  createdAt: string;
}

export interface Coupon {
  code: string;
  campaignId: string;
  qrReference: string;              // Secure cryptographically generated token
  maxTotalRedemptions?: number;     // Optional overall usage ceiling
  currentTotalRedemptions: number;
  status: CouponStatus;
  createdAt: string;
}

export interface CouponRedemption {
  id: string;
  couponCode: string;
  campaignId: string;
  userUid: string;
  withdrawalNumber: number;
  creditsGranted: number;
  redeemedAt: string;
  nextAvailableAt: string;
}

export interface CouponWithdrawalReceipt {
  success: boolean;
  couponCode: string;
  campaignTitle: string;
  withdrawalNumber: number;
  maxWithdrawals: number;
  creditsGranted: number;
  newBalance: number;
  redeemedAt: string;
  nextAvailableAt: string | null; // null if last withdrawal
  message: string;
}

export interface UserCouponAlert {
  hasAvailableWithdrawal: boolean;
  couponCode: string;
  campaignTitle: string;
  creditsReady: number;
  currentWithdrawalIndex: number;
  totalWithdrawals: number;
  nextAvailableAt: string | null;
  statusMessage: string;
}
