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
// ADMIN RBAC API (PROTECTED SERVER-SIDE)
// ==============================================================================
export const adminApi = {
  async getUsers(): Promise<{ users: UserIdentity[]; total: number }> {
    return request<{ users: UserIdentity[]; total: number }>('/admin/users', {
      method: 'GET',
    });
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
};
