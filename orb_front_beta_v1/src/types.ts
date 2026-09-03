export type OrbTheme = 'light' | 'dark' | 'automatic';
export type OrbLanguage = 'pt-BR' | 'en';

export type UserRole = 'user' | 'admin';

export type AccountState =
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'hydrating'
  | 'ready'
  | 'error';

export interface UserIdentity {
  uid: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  avatarUrl: string | null;
  plan: 'free' | 'premium';
  credits: number;
  createdAt: string;
  updatedAt: string;
  preferences?: OrbPreferences;
}

export type OrbProfile = {
  id?: string;
  ownerUid?: string;
  fullName: string;
  preferredName: string;
  avatarUrl?: string;
  email?: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  birthHour: string;
  birthMinute: string;
  noExactTime: boolean;
  birthCountry: string;
  birthState: string;
  birthCity: string;
  currentCountry?: string;
  currentCity?: string;
  currency?: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  tz_str?: string;
  houseSystem?: string;
  zodiac?: string;
  theme: OrbTheme;
  language: OrbLanguage;
  dailySynthesis: boolean;
  synthesisHour: string;
  backupGoogleDrive?: boolean;
  backupEmail?: boolean;
  backupLocal?: boolean;
  plan?: 'free' | 'premium';
  planActivatedAt?: string;
  completeness?: number;
  unlockedItems?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CurrencyConfig = {
  code: string;
  symbol: string;
  name: string;
  countryName: string;
};

export type OrbPreferences = {
  theme: OrbTheme;
  language: OrbLanguage;
};

export type EnergyLevel = {
  value: string;
  name: string;
  description: string;
  trackPosition: number;
};

export type AlchemyElement = {
  key: 'fire' | 'earth' | 'air' | 'water';
  name: string;
  value: number;
  description: string;
  archetype: string;
};

export type ProductivityIndex = {
  key: 'focus' | 'vigor' | 'physical' | 'neutrality';
  name: string;
  value: number;
  metric: string;
  description: string;
};

export type DayWindow = {
  id: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  type: 'productive' | 'neutral' | 'low';
  title: string;
  description: string;
};

export type DailyPostItem = {
  id: string;
  area: 'social' | 'career' | 'health' | 'alerts';
  title: string;
  subtitle: string;
  content: string;
};

export type DailySuggestionItem = {
  id: string;
  type: 'audio' | 'exercise' | 'reading';
  title: string;
  action: string;
  tag: string;
  detail: string;
};

export type JournalEntry = {
  id: string;
  date: string;
  content: string;
  actionTaken?: string;
  createdAt: string;
};

export type AdditionalProfile = {
  id: string;
  ownerUid?: string;
  name: string;
  fullName?: string;
  icon?: string;
  relation: string; // 'partner' | 'child' | 'business' | 'family' | 'other'
  relationship?: string;
  role?: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  birthHour?: string;
  birthMinute?: string;
  birthCity: string;
  birthState?: string;
  birthCountry?: string;
  latitude?: number;
  longitude?: number;
  tz_str?: string;
  description?: string;
  bio?: string;
  notifyEnabled?: boolean;
  notificationSettings?: NotificationToggleSettings;
  deliveryTime?: string;
  completeness: number;
  unlockedItems: string[];
  createdAt: string;
  updatedAt?: string;
};

export type RegisteredEvent = {
  id: string;
  ownerUid?: string;
  title: string;
  icon?: string;
  category: string; // 'business' | 'marriage' | 'relocation' | 'milestone' | 'historical' | 'other'
  eventDay: string;
  eventMonth: string;
  eventYear: string;
  eventHour?: string;
  eventMinute?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  tz_str?: string;
  description?: string;
  notifyEnabled?: boolean;
  notificationSettings?: NotificationToggleSettings;
  deliveryTime?: string;
  completeness: number;
  unlockedItems: string[];
  createdAt: string;
  updatedAt?: string;
};

export type NotificationToggleSettings = {
  dailyWindows: boolean;
  transitRisks?: boolean;
  riskAlerts?: boolean;
  dailySynthesis: boolean;
  renewals?: boolean;
  creditRenewals?: boolean;
  promotionsAndInvites?: boolean;
  promosAndCoupons?: boolean;
  backgroundSync?: boolean;
  deliverySchedule?: string;
};

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'alert' | 'promo' | 'system' | 'renewal' | 'invite';
  quickActionLabel?: string;
  read: boolean;
  bonusCredits?: number;
};

export type CouponRedemption = {
  code: string;
  date: string; // YYYY-MM-DD
  monthStr: string; // '2026-08'
  weekNumber: number; // 1, 2, 3, 4
  type: 'weekly' | 'daily';
  creditsGranted: number;
  redeemedAt: string;
};

export type CheckPointAttachedItem = {
  key: string;
  title: string;
  summary: string;
  tag?: string;
  category: 'consciousness' | 'synthesis' | 'alchemy' | 'windows' | 'frequency' | 'spheres' | 'custom';
  excluded?: boolean;
  userComment?: string;
  userDescription?: string;
  userAlert?: 'none' | 'attention' | 'critical' | 'opportunity';
  alertNote?: string;
};

export type JournalItemComment = {
  itemId: string;
  itemTitle: string;
  itemTitleEn?: string;
  comment: string;
  tag?: string;
  updatedAt?: string;
};

export type JournalReportBlock = {
  id: string;
  key: string;
  title: string;
  titleEn: string;
  category: string;
  tag: string;
  excluded: boolean;
  comment: string;
  commentPlacement?: 'below' | 'side';
  showCommentBox?: boolean;
  order: number;
  itemComments?: JournalItemComment[];
  excludedItemIds?: string[];
};

export type DailyCheckPoint = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color: string; // 'emerald' | 'amber' | 'indigo' | 'rose' | 'purple' | 'cyan' | 'slate'
  icon: string; // 'sparkles' | 'flame' | 'target' | 'sun' | 'moon' | 'shield' | 'zap' | 'compass'
  authorComment: string;
  attachedComponentKeys: string[];
  attachedSnapshot?: CheckPointAttachedItem[];
  journalReportBlocks?: JournalReportBlock[];
  hasDailyJournalAttachment?: boolean;
  habitsCompleted?: string[];
  createdAt: string;
  updatedAt: string;
};
