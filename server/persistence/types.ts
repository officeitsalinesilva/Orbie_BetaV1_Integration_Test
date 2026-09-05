/**
 * ORBIE — Persistence Layer Entity Types
 * Canonical contract for durable commercial state and account domain.
 */

export type AccountStatus =
  | 'authenticated'
  | 'onboarding_required'
  | 'active'
  | 'suspended'
  | 'deactivated';

export interface UserEntity {
  uid: string;
  email: string | null;
  name: string;
  role: 'user' | 'admin';
  avatarUrl?: string | null;
  accountStatus: AccountStatus;
  plan: 'free' | 'premium';
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileEntity {
  id: string;
  ownerUid: string;
  isPrimary: boolean;
  fullName: string;
  preferredName: string;
  avatarUrl?: string | null;
  email?: string;
  relation?: string;
  role?: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  birthHour: string;
  birthMinute: string;
  noExactTime: boolean;
  birthCountry?: string;
  birthState?: string;
  birthCity?: string;
  currentCountry?: string;
  currentCity?: string;
  currency?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  tz_str?: string;
  houseSystem?: string;
  zodiac?: string;
  theme?: string;
  language?: string;
  dailySynthesis?: boolean;
  synthesisHour?: string;
  completeness: number;
  backupGoogleDrive?: boolean;
  backupLocal?: boolean;
  unlockedItems: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventEntity {
  id: string;
  ownerUid: string;
  title: string;
  category: string;
  eventType: string;
  eventDate: string;
  eventDay: string;
  eventMonth: string;
  eventYear: string;
  eventHour: string;
  eventMinute: string;
  location: string;
  latitude?: number;
  longitude?: number;
  tz_str?: string;
  description?: string;
  completeness?: number;
  unlockedItems?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PreferencesEntity {
  ownerUid: string;
  theme: string;
  language: string;
  updatedAt: string;
}

export interface WalletEntity {
  userUid: string;
  ownerUid?: string;
  balance: number;
  totalPurchased?: number;
  totalSpent?: number;
  plan: 'free' | 'premium';
  createdAt?: string;
  updatedAt: string;
}

export interface LedgerEntryEntity {
  id: string;
  userUid: string;
  ownerUid?: string;
  amount: number;
  balanceBefore?: number;
  balanceAfter: number;
  type: 'CREDIT' | 'DEBIT' | 'CREDIT_GRANT' | 'CREDIT_CONSUMPTION';
  category?: string;
  source?: 'PLATFORM_DAILY' | 'STREAK' | 'COUPON' | 'PURCHASE' | 'ADJUSTMENT' | 'WELCOME' | 'REFERRAL';
  description?: string;
  reason?: string;
  referenceId?: string;
  idempotencyKey?: string;
  refId?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  timestamp: string;
}

export interface EntitlementEntity {
  id: string;
  userUid: string;
  ownerUid?: string;
  itemCode: string;
  scopeType: 'PROFILE' | 'EVENT' | 'GLOBAL' | 'matrix' | 'profile' | 'event';
  scopeId?: string;
  active: boolean;
  grantedAt: string;
}

export interface CampaignEntity {
  id: string;
  title: string;
  name?: string; // alias
  description: string;
  creditsPerWithdrawal: number;
  creditAmount?: number; // alias
  validityDays: number;
  durationDays?: number; // alias
  withdrawalFrequencyHours: number;
  redemptionFrequency?: string; // e.g. '24h', 'once'
  maxUsesPerUser: number;
  totalQuantity?: number;
  eligibility?: 'all' | 'new_users' | 'selected';
  targetUserUids?: string[];
  startDate: string;
  startAt?: string; // alias
  endDate: string;
  endAt?: string; // alias
  status: 'active' | 'paused' | 'expired' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CouponEntity {
  code: string;
  campaignId: string;
  token?: string; // Cryptographic secure token
  qrReference?: string;
  maxTotalRedemptions?: number;
  totalQuantity?: number; // alias
  currentTotalRedemptions: number;
  status: 'active' | 'paused' | 'depleted' | 'ACTIVE' | 'PAUSED' | 'DEPLETED' | 'disabled';
  assignedUserUid?: string;
  assignedUserEmail?: string;
  distributionId?: string;
  createdAt: string;
}

export interface CouponRedemptionEntity {
  id: string;
  couponCode: string;
  campaignId: string;
  userUid: string;
  creditsGranted: number;
  withdrawalNumber?: number;
  period?: string;
  redeemedAt: string;
  nextAllowedWithdrawalAt?: string;
  nextAvailableAt?: string;
  status?: 'SUCCESS' | 'REJECTED';
}

export interface DistributionEntity {
  id: string;
  campaignId: string;
  campaignName?: string;
  couponCode: string;
  token: string;
  recipientUserUid: string;
  recipientEmail: string;
  distributedByAdminUid: string;
  benefitDescription: string;
  status: 'DELIVERED' | 'PENDING' | 'REVOKED';
  createdAt: string;
}

export interface CommunicationDraftEntity {
  id: string;
  header: string;
  body: string;
  benefitOrCoupon?: string;
  cta?: string;
  footer: string;
  recipientUserUids: string[];
  status: 'DRAFT' | 'READY' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLogEntity {
  id: string;
  adminUid: string;
  action: string;
  entityType: 'CAMPAIGN' | 'COUPON' | 'DISTRIBUTION' | 'NOTIFICATION' | 'COMMUNICATION' | 'SYSTEM';
  entityId: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface UserCheckInStateEntity {
  userUid: string;
  ownerUid?: string;
  currentStreak: number;
  streakActive: boolean;
  lastClaimAt: string | null;
  lastClaimPeriod: string | null; // YYYY-MM-DD in user's timezone
  streakStartedAt?: string | null;
  timezone?: string;
  totalClaimedCredits?: number;
  // Compatibility fields
  lastClaimDate?: string | null;
  streakDays?: number;
  totalClaimed?: number;
}

export interface NotificationEntity {
  id: string;
  ownerUid: string; // target user uid
  targetUserUids?: string[];
  title: string;
  message: string;
  benefitRelated?: string;
  cta?: { label: string; url?: string; action?: string };
  startAt?: string;
  expiresAt?: string;
  status?: 'CREATED' | 'SCHEDULED' | 'SENT' | 'FAILED';
  read: boolean;
  createdAt: string;
}

export interface JournalEntryEntity {
  id: string;
  ownerUid: string;
  title?: string;
  content: string;
  tag?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersistenceStatus {
  driver: 'file' | 'firestore' | 'memory';
  connected: boolean;
  isDurable: boolean;
  location?: string;
  details?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CHECKOUT_CREATED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'pending'
  | 'approved'
  | 'in_process'
  | 'rejected'
  | 'refunded'
  | 'cancelled';

export interface OrderEntity {
  orderId: string;
  userId: string;
  productId: string;
  productCode: string;
  quoteId: string;
  amountInCents: number;
  currency: string;
  status: OrderStatus;
  paymentProvider: 'mercadopago' | string;
  providerReference?: string;
  payerEmail?: string;
  payerName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEntity {
  paymentId: string;
  orderId: string;
  userId: string;
  provider: 'mercadopago' | string;
  providerPaymentId?: string;
  status: PaymentStatus;
  amountInCents: number;
  currency: string;
  paymentMethod?: string; // 'pix' | 'credit_card' | 'mp_preference' | etc.
  installments?: number;
  rawResponse?: any;
  createdAt: string;
  updatedAt: string;
}
