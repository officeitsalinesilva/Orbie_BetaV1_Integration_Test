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
    // Automatically enrich with deterministic coordinates if missing
    if (!profile.latitude || !profile.longitude || !profile.tz_str) {
      const geo = resolveLocationDeterministic(
        profile.birthCity,
        profile.birthState,
        profile.birthCountry
      );
      profile.latitude = geo.latitude;
      profile.longitude = geo.longitude;
      profile.tz_str = geo.timezone;
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
      const geo = resolveLocationDeterministic(
        data.birthCity,
        data.birthState,
        data.birthCountry
      );
      data.latitude = geo.latitude;
      data.longitude = geo.longitude;
      data.tz_str = geo.timezone;
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
      const geo = resolveLocationDeterministic(data.location);
      data.latitude = geo.latitude;
      data.longitude = geo.longitude;
      data.tz_str = geo.timezone;
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
  async resolve(city: string, state?: string, country?: string): Promise<GeoLocationResult> {
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
    currentStreakDays: number;
    lastClaimDate: string | null;
    lastCheckInDate: string | null;
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

  async getCoupons() {
    return request<{ coupons: any[] }>('/admin/coupons/list', { method: 'GET' });
  },

  async generateCoupon(data: { campaignId: string; code?: string; maxTotalRedemptions?: number }) {
    return request<{ coupon: any }>('/admin/coupons/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getRedemptions() {
    return request<{ redemptions: any[] }>('/admin/coupons/redemptions', { method: 'GET' });
  },
};
