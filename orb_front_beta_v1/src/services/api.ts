/**
 * ORBIE — Centralized API Client & Service Adapters
 * Handles authenticated API requests, token injection, and owner-isolated queries.
 */

import { auth } from '../lib/googleAuth';
import {
  UserIdentity,
  OrbProfile,
  AdditionalProfile,
  RegisteredEvent,
} from '../types';
import { resolveLocationDeterministic, GeoLocationResult } from './geoService';

// Base API configuration
const API_BASE = '/api';

/**
 * Retrieves the current Firebase Auth ID Token for Bearer authentication
 */
export async function getAuthBearerToken(): Promise<string | null> {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken(false);
    }
  } catch (err) {
    console.warn('[API Client] Error obtaining auth token:', err);
  }
  return null;
}

/**
 * Generic HTTP client with automatic Authorization header
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthBearerToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Also include current user email/uid headers as fallback if token parsing on dev server requires it
  if (auth.currentUser) {
    headers['X-User-Uid'] = auth.currentUser.uid;
    if (auth.currentUser.email) {
      headers['X-User-Email'] = auth.currentUser.email;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error || errorJson.message) {
        errorMessage = errorJson.error || errorJson.message;
      }
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

// ==============================================================================
// AUTH & IDENTITY API
// ==============================================================================
export const authApi = {
  async verifySession(userData: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
  }): Promise<UserIdentity> {
    return request<UserIdentity>('/auth/session', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getMe(): Promise<UserIdentity> {
    return request<UserIdentity>('/auth/me', {
      method: 'GET',
    });
  },
};

// ==============================================================================
// USER PREFERENCES API (STRICT OWNER ISOLATION)
// ==============================================================================
export const preferencesApi = {
  async get(): Promise<{ theme: string; language: string } | null> {
    try {
      const res = await request<{ preferences: { theme: string; language: string } }>('/user/preferences', {
        method: 'GET',
      });
      return res.preferences;
    } catch {
      return null;
    }
  },

  async update(patch: { theme?: string; language?: string }): Promise<{ theme: string; language: string } | null> {
    try {
      const res = await request<{ preferences: { theme: string; language: string } }>('/user/preferences', {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      return res.preferences;
    } catch {
      return null;
    }
  },
};

// ==============================================================================
// PROFILES API (PRIMARY & ADDITIONAL WITH OWNER ISOLATION)
// ==============================================================================
export const profileApi = {
  async getPrimary(): Promise<OrbProfile | null> {
    try {
      const res = await request<{ profile: OrbProfile | null }>('/profiles/primary', {
        method: 'GET',
      });
      return res.profile;
    } catch {
      return null;
    }
  },

  async savePrimary(profile: OrbProfile): Promise<OrbProfile> {
    // Automatically enrich with deterministic coordinates if missing and birthCity is present
    if (!profile.latitude || !profile.longitude || !profile.tz_str) {
      if (profile.birthCity) {
        const geo = resolveLocationDeterministic(
          profile.birthCity,
          profile.birthState,
          profile.birthCountry
        );
        if (geo) {
          profile.latitude = geo.latitude;
          profile.longitude = geo.longitude;
          profile.tz_str = geo.timezone;
        }
      }
    }

    const res = await request<{ profile: OrbProfile }>('/profiles/primary', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
    return res.profile;
  },

  async getAdditional(): Promise<AdditionalProfile[]> {
    try {
      const res = await request<{ profiles: AdditionalProfile[] }>('/profiles', {
        method: 'GET',
      });
      return res.profiles || [];
    } catch {
      return [];
    }
  },

  async createAdditional(data: Omit<AdditionalProfile, 'id' | 'createdAt'>): Promise<AdditionalProfile> {
    // Enrich with deterministic coordinates
    if (!data.latitude || !data.longitude || !data.tz_str) {
      if (data.birthCity) {
        const geo = resolveLocationDeterministic(
          data.birthCity,
          data.birthState,
          data.birthCountry
        );
        if (geo) {
          data.latitude = geo.latitude;
          data.longitude = geo.longitude;
          data.tz_str = geo.timezone;
        }
      }
    }

    const res = await request<{ profile: AdditionalProfile }>('/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.profile;
  },

  async updateAdditional(id: string, patch: Partial<AdditionalProfile>): Promise<AdditionalProfile> {
    const res = await request<{ profile: AdditionalProfile }>(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
    return res.profile;
  },

  async deleteAdditional(id: string): Promise<void> {
    await request<{ success: boolean }>(`/profiles/${id}`, {
      method: 'DELETE',
    });
  },

  async resolveForAstra(profileId?: string): Promise<{
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    lat: number;
    lng: number;
    tz_str: string;
  }> {
    const res = await request<{
      astraSubject: {
        name: string;
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        lat: number;
        lng: number;
        tz_str: string;
      };
    }>(`/profiles/resolve${profileId ? `?id=${encodeURIComponent(profileId)}` : ''}`, {
      method: 'GET',
    });
    return res.astraSubject;
  },
};

// ==============================================================================
// REGISTERED EVENTS API (WITH OWNER ISOLATION)
// ==============================================================================
export const eventApi = {
  async getAll(): Promise<RegisteredEvent[]> {
    try {
      const res = await request<{ events: RegisteredEvent[] }>('/events', {
        method: 'GET',
      });
      return res.events || [];
    } catch {
      return [];
    }
  },

  async create(data: Omit<RegisteredEvent, 'id' | 'createdAt'>): Promise<RegisteredEvent> {
    if (!data.latitude || !data.longitude || !data.tz_str) {
      if (data.location) {
        const geo = resolveLocationDeterministic(data.location);
        if (geo) {
          data.latitude = geo.latitude;
          data.longitude = geo.longitude;
          data.tz_str = geo.timezone;
        }
      }
    }

    const res = await request<{ event: RegisteredEvent }>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.event;
  },

  async update(id: string, patch: Partial<RegisteredEvent>): Promise<RegisteredEvent> {
    const res = await request<{ event: RegisteredEvent }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
    return res.event;
  },

  async delete(id: string): Promise<void> {
    await request<{ success: boolean }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==============================================================================
// DETERMINISTIC GEOCODING API
// ==============================================================================
export const geoApi = {
  async resolve(city: string, state?: string, country?: string): Promise<GeoLocationResult | null> {
    try {
      const res = await request<GeoLocationResult>('/geo/resolve', {
        method: 'POST',
        body: JSON.stringify({ city, state, country }),
      });
      return res;
    } catch {
      return resolveLocationDeterministic(city, state, country);
    }
  },
};

// ==============================================================================
// WALLET & DAILY CREDITS API
// ==============================================================================
export interface WalletData {
  wallet: {
    userUid: string;
    balance: number;
    plan: 'free' | 'premium';
    createdAt: string;
    updatedAt: string;
  };
  ledger: Array<{
    id: string;
    userUid: string;
    type: string;
    category: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    referenceId?: string;
    description: string;
    createdAt: string;
  }>;
  entitlements: Array<{
    id: string;
    userUid: string;
    scopeType: string;
    scopeId?: string;
    itemCode: string;
    source: string;
    unlockedAt: string;
  }>;
  dailyStatus: {
    canClaimToday: boolean;
    baseCredits: number;
    streakBonusCredits: number;
    totalAvailableToday: number;
    currentStreak?: number;
    currentStreakDays: number;
    streakActive?: boolean;
    streakStartedAt?: string | null;
    lastClaimAt?: string | null;
    lastClaimPeriod?: string | null;
    lastClaimDate: string | null;
    lastCheckInDate: string | null;
    periodDate?: string;
    timezone?: string;
  };
  couponAlerts: Array<{
    hasAvailableWithdrawal: boolean;
    couponCode: string;
    campaignTitle: string;
    creditsReady: number;
    currentWithdrawalIndex: number;
    totalWithdrawals: number;
    nextAvailableAt: string | null;
    statusMessage: string;
  }>;
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
  nextAvailableAt: string | null;
  message: string;
}

export const walletApi = {
  async getWallet(): Promise<WalletData> {
    return request<WalletData>('/wallet', { method: 'GET' });
  },

  async claimDaily(): Promise<{
    claimed: boolean;
    baseCreditsGranted: number;
    streakBonusGranted: number;
    totalGranted: number;
    newBalance: number;
    streakDays: number;
    message: string;
  }> {
    return request('/wallet/claim-daily', { method: 'POST' });
  },

  async spendCredits(params: {
    amount: number;
    itemCode: string;
    description?: string;
    scopeType?: 'matrix' | 'profile' | 'event';
    scopeId?: string;
  }) {
    return request('/wallet/spend', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// ==============================================================================
// COUPON & QR CODE API
// ==============================================================================
export const couponApi = {
  async redeem(codeOrQr: string): Promise<CouponWithdrawalReceipt> {
    return request<CouponWithdrawalReceipt>('/coupons/redeem', {
      method: 'POST',
      body: JSON.stringify({ code: codeOrQr, qrReference: codeOrQr }),
    });
  },

  async getActiveAlerts() {
    return request<{ alerts: WalletData['couponAlerts'] }>('/coupons/active-alerts', {
      method: 'GET',
    });
  },
};

// ==============================================================================
// ADMIN RBAC API (PROTECTED SERVER-SIDE)
// ==============================================================================
export const adminApi = {
  async getUsers(): Promise<{ users: UserIdentity[]; total: number }> {
    const res = await request<any>('/admin/users', {
      method: 'GET',
    });
    if (Array.isArray(res)) {
      return { users: res, total: res.length };
    }
    return res || { users: [], total: 0 };
  },

  async getMetrics(): Promise<{
    totalUsers: number;
    totalProfiles: number;
    totalEvents: number;
    activeSessions: number;
  }> {
    return request<{
      totalUsers: number;
      totalProfiles: number;
      totalEvents: number;
      activeSessions: number;
    }>('/admin/metrics', {
      method: 'GET',
    });
  },

  async getCampaigns() {
    return request<{ campaigns: any[] }>('/admin/coupons/campaigns', { method: 'GET' });
  },

  async createCampaign(data: any) {
    return request<{ campaign: any }>('/admin/coupons/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCampaignStatus(id: string, status: string) {
    return request<{ campaign: any }>(`/admin/coupons/campaigns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getCoupons() {
    return request<{ coupons: any[] }>('/admin/coupons/list', { method: 'GET' });
  },

  async generateCoupon(data: { campaignId: string; code?: string; maxTotalRedemptions?: number }) {
    return request<{ coupon: any }>('/admin/coupons/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCouponStatus(code: string, status: string) {
    return request<{ coupon: any }>(`/admin/coupons/${code}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async distributeCoupon(data: {
    couponCode: string;
    targetUserUids?: string[];
    sendNotification?: boolean;
    customNotificationMessage?: string;
  }) {
    return request<{ distribution: any }>('/admin/coupons/distribute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getDistributions() {
    return request<{ distributions: any[] }>('/admin/coupons/distributions', { method: 'GET' });
  },

  async getRedemptions() {
    return request<{ redemptions: any[] }>('/admin/coupons/redemptions', { method: 'GET' });
  },

  async getNotifications() {
    return request<{ notifications: any[] }>('/admin/notifications', { method: 'GET' });
  },

  async sendNotification(data: {
    title: string;
    body: string;
    targetUserUid?: string;
    broadcast?: boolean;
    channel?: string;
  }) {
    return request<{ success: boolean; count: number }>('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCommunicationDrafts() {
    return request<{ drafts: any[] }>('/admin/communications/drafts', { method: 'GET' });
  },

  async saveCommunicationDraft(draft: any) {
    return request<{ draft: any }>('/admin/communications/drafts', {
      method: 'POST',
      body: JSON.stringify(draft),
    });
  },

  async getAuditLogs() {
    return request<{ logs: any[] }>('/admin/audit-logs', { method: 'GET' });
  },

  // Commercial Admin
  async getCommercialProducts() {
    return request<{ products: any[] }>('/admin/commercial/products', { method: 'GET' });
  },

  async getCommercialProduct(id: string) {
    return request<{ product: any }>(`/admin/commercial/products/${id}`, { method: 'GET' });
  },

  async createCommercialProduct(product: any) {
    return request<{ product: any }>('/admin/commercial/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateCommercialProduct(id: string, product: any) {
    return request<{ product: any }>(`/admin/commercial/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  async updateCommercialProductStatus(id: string, status: string) {
    return request<{ product: any }>(`/admin/commercial/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getCommercialRegions() {
    return request<{ regions: any[] }>('/admin/commercial/regions', { method: 'GET' });
  },

  async updateCommercialRegion(code: string, region: any) {
    return request<{ region: any }>(`/admin/commercial/regions/${code}`, {
      method: 'PUT',
      body: JSON.stringify(region),
    });
  },

  async getCommercialPlans() {
    return request<{ plans: any[] }>('/admin/commercial/plans', { method: 'GET' });
  },

  async updateCommercialPlan(id: string, plan: any) {
    return request<{ plan: any }>(`/admin/commercial/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    });
  },

  async getCommercialDailyCredits() {
    return request<{ rule: any }>('/admin/commercial/daily-credits', { method: 'GET' });
  },

  async updateCommercialDailyCredits(rule: any) {
    return request<{ rule: any }>('/admin/commercial/daily-credits', {
      method: 'PUT',
      body: JSON.stringify(rule),
    });
  },

  async getCommercialVersions(params?: { entityType?: string; entityId?: string }) {
    const query = new URLSearchParams();
    if (params?.entityType) query.append('entityType', params.entityType);
    if (params?.entityId) query.append('entityId', params.entityId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ versions: any[] }>(`/admin/commercial/versions${qs}`, { method: 'GET' });
  },

  async exportCommercialConfig() {
    return request<any>('/commercial/config', { method: 'GET' });
  },

  async importCommercialConfig(config: any) {
    return request<{ success: boolean; message: string }>('/commercial/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  async rollbackCommercialVersion(versionId: string) {
    return request<{ success: boolean; version: any }>(`/commercial/versions/${versionId}/rollback`, {
      method: 'POST',
    });
  },

  async getPaymentOrders() {
    return request<{ orders: any[] }>('/admin/payments/orders', { method: 'GET' });
  },
};

export const commercialApi = {
  async getCatalog() {
    return request<{ products: any[] }>('/commercial/catalog', { method: 'GET' });
  },

  async getProduct(id: string) {
    return request<{ product: any }>(`/commercial/catalog/${id}`, { method: 'GET' });
  },

  async getPlans() {
    return request<{ plans: any[] }>('/commercial/plans', { method: 'GET' });
  },

  async getDailyCreditsRule() {
    return request<{ rule: any }>('/commercial/daily-credits/rules', { method: 'GET' });
  },

  async getQuote(data: {
    productId: string;
    detectedCountry?: string;
    selectedCountry?: string;
    billingCountry?: string;
    currencyHint?: string;
    couponCode?: string;
  }) {
    return request<any>('/pricing/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async purchaseWithCredits(productId: string, profileId?: string) {
    return request<{
      success: boolean;
      product: any;
      creditsDeducted: number;
      newBalance: number;
      entitlementGranted: string;
      message: string;
    }>('/commercial/purchase-with-credits', {
      method: 'POST',
      body: JSON.stringify({ productId, profileId }),
    });
  },
};

export const paymentsApi = {
  async checkout(data: {
    quoteId: string;
    paymentMethodPreference?: 'pix' | 'credit_card' | 'preference';
    payerEmail?: string;
    payerName?: string;
    payerIdentification?: { type: string; number: string };
    returnUrl?: string;
    notificationUrl?: string;
  }) {
    return request<{
      orderId: string;
      productId: string;
      productName: string;
      amountInCents: number;
      currency: string;
      status: string;
      provider: string;
      providerReference?: string;
      paymentMethod?: string;
      preference?: {
        id: string;
        initPoint: string;
        sandboxInitPoint?: string;
      };
      pix?: {
        paymentId: string;
        status: string;
        qrCode: string;
        qrCodeBase64: string;
        ticketUrl?: string;
        expiresAt?: string;
      };
      createdAt: string;
    }>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getOrder(orderId: string) {
    return request<{ order: any; payments: any[] }>(`/payments/order/${orderId}`, {
      method: 'GET',
    });
  },

  async getUserOrders() {
    return request<{ orders: any[] }>('/payments/user/orders', {
      method: 'GET',
    });
  },

  async simulatePaymentApproval(providerPaymentId: string) {
    return request<any>(`/payments/simulate-approval/${providerPaymentId}`, {
      method: 'POST',
    });
  },
};

