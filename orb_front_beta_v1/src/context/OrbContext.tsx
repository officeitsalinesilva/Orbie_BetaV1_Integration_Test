import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import {
  OrbProfile,
  OrbPreferences,
  OrbTheme,
  JournalEntry,
  DailyCheckPoint,
  AdditionalProfile,
  RegisteredEvent,
  NotificationToggleSettings,
  AppNotification,
  CouponRedemption,
  UserIdentity,
  AccountState,
} from '../types';
import { initAuth, logoutGoogle, auth } from '../lib/googleAuth';
import { authApi, profileApi, eventApi, walletApi, couponApi, preferencesApi, WalletData } from '../services/api';
import { resolveLocationDeterministic } from '../services/geoService';

export type SelectedScope =
  | { type: 'matrix' }
  | { type: 'profile'; id: string }
  | { type: 'event'; id: string };

interface OrbContextValue {
  userIdentity: UserIdentity | null;
  isAdmin: boolean;
  profile: OrbProfile | null;
  preferences: OrbPreferences;
  hydrated: boolean;
  accountState: AccountState;
  isSignedIn: boolean;
  credits: number;
  unlockedItems: string[];
  walletData: WalletData | null;
  refreshWallet: () => Promise<void>;
  claimDailyCredits: () => Promise<{
    claimed: boolean;
    baseCreditsGranted: number;
    streakBonusGranted: number;
    totalGranted: number;
    newBalance: number;
    streakDays: number;
    message: string;
  }>;
  journalEntries: JournalEntry[];
  dailyCheckPoints: DailyCheckPoint[];
  additionalProfiles: AdditionalProfile[];
  registeredEvents: RegisteredEvent[];
  selectedScope: SelectedScope;
  notifications: AppNotification[];
  notificationSettings: NotificationToggleSettings;
  redeemedCoupons: CouponRedemption[];
  inviteCode: string;
  userPlan: 'free' | 'premium';
  upgradeToPlan: (plan: 'free' | 'premium', creditsBonus?: number) => void;
  saveProfile: (profile: OrbProfile) => Promise<void>;
  savePreferences: (patch: Partial<OrbPreferences>) => Promise<void>;
  clearProfile: () => Promise<void>;
  signIn: (email?: string) => Promise<void>;
  signOut: () => Promise<void>;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number, itemCode?: string, scopeType?: 'matrix' | 'profile' | 'event', scopeId?: string) => boolean;
  unlockItem: (code: string, targetScope?: SelectedScope) => void;
  isItemUnlocked: (code: string, targetScope?: SelectedScope) => boolean;
  addJournalEntry: (content: string, actionTaken?: string) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  saveDailyCheckPoint: (checkPoint: DailyCheckPoint) => Promise<void>;
  deleteDailyCheckPoint: (date: string) => Promise<void>;
  getCheckPointForDate: (date: string) => DailyCheckPoint | undefined;
  // Additional profiles & events management
  setSelectedScope: (scope: SelectedScope) => void;
  addAdditionalProfile: (data: Omit<AdditionalProfile, 'id' | 'createdAt' | 'completeness' | 'unlockedItems'>) => void;
  updateAdditionalProfile: (id: string, data: Partial<AdditionalProfile>) => void;
  deleteAdditionalProfile: (id: string) => void;
  addRegisteredEvent: (data: Omit<RegisteredEvent, 'id' | 'createdAt' | 'completeness' | 'unlockedItems'>) => void;
  updateRegisteredEvent: (id: string, data: Partial<RegisteredEvent>) => void;
  deleteRegisteredEvent: (id: string) => void;
  // Notifications management
  addNotification: (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
  toggleNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  saveNotificationSettings: (settings: Partial<NotificationToggleSettings>) => void;
  // Coupons & Invites
  redeemCoupon: (code: string) => Promise<{ success: boolean; message: string; creditsGranted: number }>;
  simulateInviteSignup: () => void;
  simulateInvitePurchase: () => void;
}

const STORAGE_KEY = '@orb/profile';
const PREFERENCES_KEY = '@orb/preferences';
const AUTH_KEY = '@orb/auth_state';
const JOURNAL_KEY = '@orb/journal_entries';
const CREDITS_KEY = '@orb/credits';
const UNLOCKED_ITEMS_KEY = '@orb/unlocked_items';
const CHECKPOINTS_KEY = '@orb/checkpoints';
const PROFILES_KEY = '@orb/additional_profiles';
const EVENTS_KEY = '@orb/registered_events';
const NOTIFICATIONS_KEY = '@orb/notifications';
const NOTIF_SETTINGS_KEY = '@orb/notif_settings';
const COUPONS_KEY = '@orb/redeemed_coupons';

const INITIAL_CHECKPOINTS: DailyCheckPoint[] = [];
const DEFAULT_NOTIFICATIONS: AppNotification[] = [];
const DEFAULT_ADDITIONAL_PROFILES: AdditionalProfile[] = [];
const DEFAULT_REGISTERED_EVENTS: RegisteredEvent[] = [];

const DEFAULT_NOTIF_SETTINGS: NotificationToggleSettings = {
  dailyWindows: true,
  transitRisks: true,
  riskAlerts: true,
  dailySynthesis: true,
  renewals: true,
  creditRenewals: true,
  promotionsAndInvites: true,
  promosAndCoupons: true,
  backgroundSync: true,
  deliverySchedule: '08:00',
};

const OrbContext = createContext<OrbContextValue | null>(null);

export const OrbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userIdentity, setUserIdentity] = useState<UserIdentity | null>(null);
  const [profile, setProfile] = useState<OrbProfile | null>(null);
  const [preferences, setPreferences] = useState<OrbPreferences>({
    theme: 'light',
    language: 'pt-BR',
  });
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [accountState, setAccountState] = useState<AccountState>('unauthenticated');
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(0);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [dailyCheckPoints, setDailyCheckPoints] = useState<DailyCheckPoint[]>(INITIAL_CHECKPOINTS);
  const [additionalProfiles, setAdditionalProfiles] = useState<AdditionalProfile[]>(DEFAULT_ADDITIONAL_PROFILES);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>(DEFAULT_REGISTERED_EVENTS);
  const [selectedScope, setSelectedScope] = useState<SelectedScope>({ type: 'matrix' });
  const [notifications, setNotifications] = useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);
  const [notificationSettings, setNotificationSettings] = useState<NotificationToggleSettings>(DEFAULT_NOTIF_SETTINGS);
  const [redeemedCoupons, setRedeemedCoupons] = useState<CouponRedemption[]>([]);
  const [inviteCode] = useState<string>('ORB-94K8');

  const refreshWallet = async () => {
    try {
      const data = await walletApi.getWallet();
      if (data) {
        setWalletData(data);
        if (data.wallet?.balance !== undefined) {
          setCredits(data.wallet.balance);
          try {
            localStorage.setItem(CREDITS_KEY, data.wallet.balance.toString());
          } catch {}
        }
        if (data.entitlements && data.entitlements.length > 0) {
          const codes = data.entitlements.map((e) => e.itemCode);
          setUnlockedItems((prev) => Array.from(new Set([...prev, ...codes])));
        }
      }
    } catch (err) {
      console.warn('[OrbContext] refreshWallet error:', err);
    }
  };

  const claimDailyCredits = async () => {
    const result = await walletApi.claimDaily();
    await refreshWallet();
    return result;
  };

  // Compute isAdmin strictly from server-verified userIdentity
  const isAdmin = useMemo(() => {
    if (userIdentity?.role === 'admin') return true;
    if (userIdentity?.email && userIdentity.email.trim().toLowerCase() === 'alinealv.silv@gmail.com') return true;
    return false;
  }, [userIdentity]);

  // Apply theme to <html> class and data-theme
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [preferences.theme]);

  // Load from localStorage & initialize auth
  useEffect(() => {
    try {
      const profileValue = localStorage.getItem(STORAGE_KEY);
      const preferencesValue = localStorage.getItem(PREFERENCES_KEY);
      const authValue = localStorage.getItem(AUTH_KEY);
      const journalValue = localStorage.getItem(JOURNAL_KEY);
      const creditsValue = localStorage.getItem(CREDITS_KEY);
      const unlockedValue = localStorage.getItem(UNLOCKED_ITEMS_KEY);
      const checkPointsValue = localStorage.getItem(CHECKPOINTS_KEY);
      const profilesValue = localStorage.getItem(PROFILES_KEY);
      const eventsValue = localStorage.getItem(EVENTS_KEY);
      const notifsValue = localStorage.getItem(NOTIFICATIONS_KEY);
      const notifSettingsValue = localStorage.getItem(NOTIF_SETTINGS_KEY);
      const couponsValue = localStorage.getItem(COUPONS_KEY);

      if (creditsValue !== null) {
        const parsedCredits = parseInt(creditsValue, 10);
        if (!isNaN(parsedCredits)) setCredits(parsedCredits);
      }

      if (unlockedValue) {
        try {
          const parsedUnlocked = JSON.parse(unlockedValue);
          if (Array.isArray(parsedUnlocked)) setUnlockedItems(parsedUnlocked);
        } catch {}
      }

      if (checkPointsValue) {
        try {
          const parsedCheckPoints = JSON.parse(checkPointsValue);
          if (Array.isArray(parsedCheckPoints)) {
            setDailyCheckPoints(parsedCheckPoints);
          }
        } catch {}
      }

      if (profilesValue) {
        try {
          const parsed = JSON.parse(profilesValue);
          if (Array.isArray(parsed)) setAdditionalProfiles(parsed);
        } catch {}
      }

      if (eventsValue) {
        try {
          const parsed = JSON.parse(eventsValue);
          if (Array.isArray(parsed)) setRegisteredEvents(parsed);
        } catch {}
      }

      if (notifsValue) {
        try {
          const parsed = JSON.parse(notifsValue);
          if (Array.isArray(parsed)) setNotifications(parsed);
        } catch {}
      }

      if (notifSettingsValue) {
        try {
          const parsed = JSON.parse(notifSettingsValue);
          if (parsed && typeof parsed === 'object') {
            setNotificationSettings((prev) => ({ ...prev, ...parsed }));
          }
        } catch {}
      }

      if (couponsValue) {
        try {
          const parsed = JSON.parse(couponsValue);
          if (Array.isArray(parsed)) setRedeemedCoupons(parsed);
        } catch {}
      }

      if (profileValue) {
        const parsed = JSON.parse(profileValue) as OrbProfile;
        setProfile(parsed);
      } else {
        setProfile(null);
      }

      if (preferencesValue) {
        setPreferences(JSON.parse(preferencesValue));
      }

      if (authValue !== null) {
        setIsSignedIn(authValue === 'true');
      }

      if (journalValue) {
        setJournalEntries(JSON.parse(journalValue));
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    } finally {
      setHydrated(true);
    }

    // Subscribe to Google Firebase Auth state & sync with backend
    const unsubscribe = initAuth(async (googleUser) => {
      if (googleUser) {
        setAccountState('authenticating');
        setIsSignedIn(true);
        try {
          // Establish/verify authenticated session with backend
          const identity = await authApi.verifySession({
            uid: googleUser.uid,
            email: googleUser.email,
            displayName: googleUser.displayName,
            photoURL: googleUser.photoURL,
          });
          setUserIdentity(identity);
          setAccountState('hydrating');

          // Fetch primary profile from backend
          const serverPrimary = await profileApi.getPrimary();
          if (serverPrimary) {
            // Propagate avatarUrl from Google user if primary profile does not have one
            if (!serverPrimary.avatarUrl && googleUser.photoURL) {
              serverPrimary.avatarUrl = googleUser.photoURL;
              profileApi.savePrimary(serverPrimary).catch(() => {});
            }
            setProfile(serverPrimary);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(serverPrimary));
            } catch {}
          } else {
            // No profile on backend yet - create draft with real Google user info
            const draftProfile: OrbProfile = {
              fullName: googleUser.displayName || 'Novo Usuário',
              preferredName: googleUser.displayName?.split(' ')[0] || 'Usuário',
              avatarUrl: googleUser.photoURL || undefined,
              email: googleUser.email || undefined,
              birthDay: '',
              birthMonth: '',
              birthYear: '',
              birthHour: '12',
              birthMinute: '00',
              birthCountry: 'Brasil',
              birthState: 'São Paulo',
              birthCity: 'São Paulo',
              timezone: 'UTC -3 (Brasília)',
              houseSystem: 'Placidus',
              zodiac: 'Tropical',
              theme: 'dark',
              language: 'pt-BR',
              noExactTime: false,
              dailySynthesis: true,
              synthesisHour: '08:00',
              completeness: 0,
              unlockedItems: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setProfile(draftProfile);
          }

          // Fetch user preferences from backend
          try {
            const prefs = await preferencesApi.get();
            if (prefs) {
              setPreferences((prev) => ({
                ...prev,
                theme: (prefs.theme as OrbTheme) || prev.theme,
                language: (prefs.language as any) || prev.language,
              }));
            }
          } catch (pErr) {
            console.warn('[OrbContext] Preferences sync error:', pErr);
          }

          // Fetch wallet & ledger data from backend
          try {
            await refreshWallet();
          } catch (wErr) {
            console.warn('[OrbContext] Wallet initial sync error:', wErr);
          }

          // Fetch additional profiles
          const serverProfiles = await profileApi.getAdditional();
          if (serverProfiles && serverProfiles.length > 0) {
            setAdditionalProfiles(serverProfiles);
            try {
              localStorage.setItem(PROFILES_KEY, JSON.stringify(serverProfiles));
            } catch {}
          }

          // Fetch events
          const serverEvents = await eventApi.getAll();
          if (serverEvents && serverEvents.length > 0) {
            setRegisteredEvents(serverEvents);
            try {
              localStorage.setItem(EVENTS_KEY, JSON.stringify(serverEvents));
            } catch {}
          }
          setAccountState('ready');
        } catch (backendErr) {
          console.warn('[OrbContext] Backend sync fallback to local store:', backendErr);
          setAccountState('error');
        }
      } else {
        // User is not signed in
        setIsSignedIn(false);
        setUserIdentity(null);
        setAccountState('unauthenticated');
        // Clear previous user's data so nothing leaks
        setProfile(null);
        setWalletData(null);
        setCredits(0);
        setUnlockedItems([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<OrbContextValue>(
    () => ({
      userIdentity,
      isAdmin,
      profile,
      preferences,
      hydrated,
      accountState,
      isSignedIn,
      credits,
      unlockedItems,
      walletData,
      refreshWallet,
      claimDailyCredits,
      journalEntries,
      dailyCheckPoints,
      additionalProfiles,
      registeredEvents,
      selectedScope,
      notifications,
      notificationSettings,
      redeemedCoupons,
      inviteCode,
      userPlan: profile?.plan || 'premium',
      upgradeToPlan: (plan: 'free' | 'premium', creditsBonus: number = 0) => {
        if (profile) {
          const updated = {
            ...profile,
            plan,
            planActivatedAt: new Date().toISOString(),
          };
          setProfile(updated);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {}
        }
        if (creditsBonus > 0) {
          setCredits((prev) => {
            const next = prev + creditsBonus;
            try {
              localStorage.setItem(CREDITS_KEY, next.toString());
            } catch {}
            return next;
          });
        }
      },
      saveProfile: async (nextProfile) => {
        // Deterministic geocoding resolution
        if (!nextProfile.latitude || !nextProfile.longitude || !nextProfile.tz_str) {
          const geo = resolveLocationDeterministic(
            nextProfile.birthCity,
            nextProfile.birthState,
            nextProfile.birthCountry
          );
          nextProfile.latitude = geo.latitude;
          nextProfile.longitude = geo.longitude;
          nextProfile.tz_str = geo.timezone;
        }

        if (!nextProfile.avatarUrl && (userIdentity?.avatarUrl || auth.currentUser?.photoURL)) {
          nextProfile.avatarUrl = userIdentity?.avatarUrl || auth.currentUser?.photoURL || undefined;
        }

        setProfile(nextProfile);
        const nextPreferences = { theme: nextProfile.theme, language: nextProfile.language };
        setPreferences(nextPreferences);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
          localStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
          // Async server persistence with owner-isolation
          const saved = await profileApi.savePrimary(nextProfile);
          if (saved) {
            setProfile(saved);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
          }
        } catch (e) {
          console.warn('Error writing profile to server/localStorage', e);
        }
      },
      savePreferences: async (patch) => {
        const nextPreferences = { ...preferences, ...patch };
        setPreferences(nextPreferences);
        try {
          localStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
          preferencesApi.update(patch).catch((err) => {
            console.warn('[OrbContext] Async server preferences save error:', err);
          });
          if (profile) {
            const nextProfile = { ...profile, ...patch };
            setProfile(nextProfile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
            profileApi.savePrimary(nextProfile).catch(() => {});
          }
        } catch (e) {
          console.warn('Error writing preferences to localStorage', e);
        }
      },
      clearProfile: async () => {
        setProfile(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          console.warn('Error removing profile from localStorage', e);
        }
      },
      signIn: async (email?: string) => {
        setIsSignedIn(true);
        setAccountState('authenticating');
        try {
          localStorage.setItem(AUTH_KEY, 'true');
          const currentUser = auth.currentUser;
          if (currentUser) {
            const identity = await authApi.verifySession({
              uid: currentUser.uid,
              email: email || currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
            });
            setUserIdentity(identity);
            setAccountState('ready');
          }
        } catch (e) {
          console.warn('Error writing auth to localStorage', e);
          setAccountState('error');
        }
      },
      signOut: async () => {
        setIsSignedIn(false);
        setUserIdentity(null);
        setProfile(null);
        setWalletData(null);
        setCredits(0);
        setUnlockedItems([]);
        setAccountState('unauthenticated');
        await logoutGoogle();
        try {
          localStorage.setItem(AUTH_KEY, 'false');
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(CREDITS_KEY);
          localStorage.removeItem(UNLOCKED_ITEMS_KEY);
          localStorage.removeItem(PROFILES_KEY);
          localStorage.removeItem(EVENTS_KEY);
        } catch (e) {
          console.warn('Error clearing storage on signOut', e);
        }
      },
      addCredits: (amount: number) => {
        setCredits((prev) => {
          const next = prev + amount;
          try {
            localStorage.setItem(CREDITS_KEY, next.toString());
          } catch {}
          return next;
        });
      },
      spendCredits: (amount: number, itemCode?: string, scopeType?: 'matrix' | 'profile' | 'event', scopeId?: string) => {
        if (credits < amount) {
          return false;
        }
        setCredits((prev) => {
          const next = Math.max(0, prev - amount);
          try {
            localStorage.setItem(CREDITS_KEY, next.toString());
          } catch {}
          return next;
        });
        if (amount > 0 && itemCode) {
          walletApi.spendCredits({ amount, itemCode, scopeType, scopeId })
            .then(() => refreshWallet())
            .catch((e) => console.warn('[OrbContext] spendCredits sync error:', e));
        }
        return true;
      },
      unlockItem: (code: string, targetScope?: SelectedScope) => {
        const scope = targetScope || selectedScope;
        if (scope.type === 'matrix') {
          setUnlockedItems((prev) => {
            if (prev.includes(code)) return prev;
            const next = [...prev, code];
            try {
              localStorage.setItem(UNLOCKED_ITEMS_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        } else if (scope.type === 'profile') {
          setAdditionalProfiles((prev) => {
            const updated = prev.map((p) => {
              if (p.id === scope.id) {
                const items = p.unlockedItems || [];
                if (!items.includes(code)) {
                  return { ...p, unlockedItems: [...items, code], completeness: Math.min(100, p.completeness + 5) };
                }
              }
              return p;
            });
            try {
              localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        } else if (scope.type === 'event') {
          setRegisteredEvents((prev) => {
            const updated = prev.map((evt) => {
              if (evt.id === scope.id) {
                const items = evt.unlockedItems || [];
                if (!items.includes(code)) {
                  return { ...evt, unlockedItems: [...items, code], completeness: Math.min(100, evt.completeness + 5) };
                }
              }
              return evt;
            });
            try {
              localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      },
      isItemUnlocked: (code: string, targetScope?: SelectedScope) => {
        const scope = targetScope || selectedScope;
        if (scope.type === 'matrix') {
          return unlockedItems.includes(code);
        } else if (scope.type === 'profile') {
          const p = additionalProfiles.find((item) => item.id === scope.id);
          return !!p?.unlockedItems?.includes(code);
        } else if (scope.type === 'event') {
          const evt = registeredEvents.find((item) => item.id === scope.id);
          return !!evt?.unlockedItems?.includes(code);
        }
        return false;
      },
      addJournalEntry: async (content: string, actionTaken?: string) => {
        const now = new Date();
        const newEntry: JournalEntry = {
          id: `entry-${Date.now()}`,
          date: now.toISOString().slice(0, 10),
          content,
          actionTaken,
          createdAt: now.toISOString(),
        };
        const updated = [newEntry, ...journalEntries];
        setJournalEntries(updated);
        try {
          localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Error saving journal entries', e);
        }
      },
      deleteJournalEntry: async (id: string) => {
        const updated = journalEntries.filter((e) => e.id !== id);
        setJournalEntries(updated);
        try {
          localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Error deleting journal entry', e);
        }
      },
      saveDailyCheckPoint: async (checkPoint: DailyCheckPoint) => {
        setDailyCheckPoints((prev) => {
          const filtered = prev.filter((cp) => cp.date !== checkPoint.date);
          const next = [checkPoint, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
          try {
            localStorage.setItem(CHECKPOINTS_KEY, JSON.stringify(next));
          } catch (e) {
            console.warn('Error saving checkpoints to localStorage', e);
          }
          return next;
        });
      },
      deleteDailyCheckPoint: async (date: string) => {
        setDailyCheckPoints((prev) => {
          const next = prev.filter((cp) => cp.date !== date);
          try {
            localStorage.setItem(CHECKPOINTS_KEY, JSON.stringify(next));
          } catch (e) {
            console.warn('Error deleting checkpoint from localStorage', e);
          }
          return next;
        });
      },
      getCheckPointForDate: (date: string) => {
        return dailyCheckPoints.find((cp) => cp.date === date);
      },
      // Additional Profiles
      setSelectedScope: (scope: SelectedScope) => {
        setSelectedScope(scope);
      },
      addAdditionalProfile: (data) => {
        const geo = resolveLocationDeterministic(data.birthCity, data.birthState, data.birthCountry);
        const newProf: AdditionalProfile = {
          ...data,
          id: `prof-${Date.now()}`,
          latitude: geo.latitude,
          longitude: geo.longitude,
          tz_str: geo.timezone,
          completeness: 75,
          unlockedItems: ['VIB-002'],
          createdAt: new Date().toISOString(),
        };
        setAdditionalProfiles((prev) => {
          const next = [...prev, newProf];
          try {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
            profileApi.createAdditional(newProf).catch((err) => {
              console.warn('[OrbContext] Async server additional profile notice:', err);
            });
          } catch {}
          return next;
        });
        setSelectedScope({ type: 'profile', id: newProf.id });
      },
      updateAdditionalProfile: (id: string, data: Partial<AdditionalProfile>) => {
        setAdditionalProfiles((prev) => {
          const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
          try {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
            profileApi.updateAdditional(id, data).catch((err) => {
              console.warn('[OrbContext] Async server profile update notice:', err);
            });
          } catch {}
          return next;
        });
      },
      deleteAdditionalProfile: (id: string) => {
        setAdditionalProfiles((prev) => {
          const next = prev.filter((p) => p.id !== id);
          try {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
            profileApi.deleteAdditional(id).catch((err) => {
              console.warn('[OrbContext] Async server profile delete notice:', err);
            });
          } catch {}
          return next;
        });
        setSelectedScope({ type: 'matrix' });
      },
      // Registered Events
      addRegisteredEvent: (data) => {
        const geo = resolveLocationDeterministic(data.location);
        const newEvt: RegisteredEvent = {
          ...data,
          id: `evt-${Date.now()}`,
          latitude: geo.latitude,
          longitude: geo.longitude,
          tz_str: geo.timezone,
          completeness: 80,
          unlockedItems: ['AST-003'],
          createdAt: new Date().toISOString(),
        };
        setRegisteredEvents((prev) => {
          const next = [...prev, newEvt];
          try {
            localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
            eventApi.create(newEvt).catch((err) => {
              console.warn('[OrbContext] Async server event notice:', err);
            });
          } catch {}
          return next;
        });
        setSelectedScope({ type: 'event', id: newEvt.id });
      },
      updateRegisteredEvent: (id: string, data: Partial<RegisteredEvent>) => {
        setRegisteredEvents((prev) => {
          const next = prev.map((e) => (e.id === id ? { ...e, ...data } : e));
          try {
            localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
            eventApi.update(id, data).catch((err) => {
              console.warn('[OrbContext] Async server event update notice:', err);
            });
          } catch {}
          return next;
        });
      },
      deleteRegisteredEvent: (id: string) => {
        setRegisteredEvents((prev) => {
          const next = prev.filter((e) => e.id !== id);
          try {
            localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
            eventApi.delete(id).catch((err) => {
              console.warn('[OrbContext] Async server event delete notice:', err);
            });
          } catch {}
          return next;
        });
        setSelectedScope({ type: 'matrix' });
      },
      // Notifications
      addNotification: (notif) => {
        const newNotif: AppNotification = {
          ...notif,
          id: `notif-${Date.now()}`,
          time: 'Agora',
          read: false,
        };
        setNotifications((prev) => {
          const next = [newNotif, ...prev];
          try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      },
      toggleNotificationRead: (id: string) => {
        setNotifications((prev) => {
          const next = prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
          try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      },
      markAllNotificationsRead: () => {
        setNotifications((prev) => {
          const next = prev.map((n) => ({ ...n, read: true }));
          try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      },
      saveNotificationSettings: (patch) => {
        setNotificationSettings((prev) => {
          const next = { ...prev, ...patch };
          try {
            localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      },
      // Coupon Redemption
      redeemCoupon: async (rawCode: string) => {
        const code = rawCode.trim().toUpperCase();
        try {
          // Attempt server-side coupon validation first
          const serverRes = await couponApi.redeem(code);
          if (serverRes && serverRes.success) {
            await refreshWallet();
            return {
              success: true,
              message: serverRes.message || `Cupom ${code} resgatado! +${serverRes.creditsGranted} ◎ adicionados à sua carteira.`,
              creditsGranted: serverRes.creditsGranted || 0,
            };
          }
        } catch (serverErr: any) {
          // If server returned a structured business rejection message, return it directly
          if (serverErr?.message && !serverErr.message.includes('fetch') && !serverErr.message.includes('Failed')) {
            return {
              success: false,
              message: serverErr.message,
              creditsGranted: 0,
            };
          }
        }

        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`; // e.g. '2026-08'
        
        // Calculate current week of the month (1 to 5)
        const dayOfMonth = today.getDate();
        const currentWeekNum = Math.ceil(dayOfMonth / 7); // 1, 2, 3, 4

        // Check coupon definitions
        // 1SMES.10-LINE | 1° 1x por dia, na semana de mes vigente (+10 credits)
        // 2SMES.10-LINE | 2° 1x por dia, na semana de mês vigente (+10 credits)
        // 3SMES.10-LINE | 3° 1x por dia, na semana de mês vigente (+10 credits)
        // 4SMES.10-LINE | 4° 1x por dia, na semana de mês vigente (+10 credits)
        // 24HR.10-LINE | 24hr pra usar 1x no dia vigente (+10 credits)
        const weeklyMatch = code.match(/^([1-4])SMES\.10-LINE$/);
        const is24h = code === '24HR.10-LINE';

        if (!weeklyMatch && !is24h) {
          return {
            success: false,
            message: 'Código de QR Code inválido ou não reconhecido no sistema.',
            creditsGranted: 0,
          };
        }

        if (is24h) {
          // Check if already used today
          const alreadyUsedToday = redeemedCoupons.some(
            (c) => c.code === '24HR.10-LINE' && c.date === todayStr
          );
          if (alreadyUsedToday) {
            return {
              success: false,
              message: 'Cupom de 24 horas já resgatado hoje! Válido 1x por dia vigente.',
              creditsGranted: 0,
            };
          }

          const newRedemption: CouponRedemption = {
            code: '24HR.10-LINE',
            date: todayStr,
            monthStr: currentMonth,
            weekNumber: currentWeekNum,
            type: 'daily',
            creditsGranted: 10,
            redeemedAt: new Date().toISOString(),
          };

          setRedeemedCoupons((prev) => {
            const next = [newRedemption, ...prev];
            try {
              localStorage.setItem(COUPONS_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });

          // Add credits
          setCredits((prev) => {
            const next = prev + 10;
            try {
              localStorage.setItem(CREDITS_KEY, next.toString());
            } catch {}
            return next;
          });

          return {
            success: true,
            message: 'Cupom 24h resgatado com sucesso! +10 ◎ adicionados à sua carteira.',
            creditsGranted: 10,
          };
        }

        if (weeklyMatch) {
          const couponWeek = parseInt(weeklyMatch[1], 10);
          
          // Check if coupon belongs to current week of August/current month
          // For flexibility, if it's the right week or within the current month cycle
          const alreadyUsedTodayForCode = redeemedCoupons.some(
            (c) => c.code === code && c.date === todayStr
          );

          if (alreadyUsedTodayForCode) {
            return {
              success: false,
              message: `Cupom semanal ${code} já foi utilizado hoje. Válido 1x ao dia na semana vigente.`,
              creditsGranted: 0,
            };
          }

          const newRedemption: CouponRedemption = {
            code,
            date: todayStr,
            monthStr: currentMonth,
            weekNumber: couponWeek,
            type: 'weekly',
            creditsGranted: 10,
            redeemedAt: new Date().toISOString(),
          };

          setRedeemedCoupons((prev) => {
            const next = [newRedemption, ...prev];
            try {
              localStorage.setItem(COUPONS_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });

          // Add credits
          setCredits((prev) => {
            const next = prev + 10;
            try {
              localStorage.setItem(CREDITS_KEY, next.toString());
            } catch {}
            return next;
          });

          return {
            success: true,
            message: `Cupom semanal ${code} validado! +10 ◎ adicionados à sua carteira.`,
            creditsGranted: 10,
          };
        }

        return {
          success: false,
          message: 'Não foi possível validar o cupom.',
          creditsGranted: 0,
        };
      },
      simulateInviteSignup: () => {
        setCredits((prev) => {
          const next = prev + 5;
          try {
            localStorage.setItem(CREDITS_KEY, next.toString());
          } catch {}
          return next;
        });

        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          title: 'Novo Amigo Convidado Cadastrado (+5 ◎)',
          description: 'Um novo usuário concluiu o cadastro utilizando seu link de convite. +5 créditos adicionados à sua carteira!',
          time: 'Agora',
          type: 'invite',
          quickActionLabel: 'Ver Carteira',
          read: false,
          bonusCredits: 5,
        };

        setNotifications((prev) => {
          const next = [newNotif, ...prev];
          try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      },
      simulateInvitePurchase: () => {
        setCredits((prev) => {
          const next = prev + 5;
          try {
            localStorage.setItem(CREDITS_KEY, next.toString());
          } catch {}
          return next;
        });

        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          title: 'Primeira Recarga do Convidado Concluída (+5 ◎)',
          description: 'Seu amigo convidado realizou a 1ª recarga na plataforma. Você recebeu mais +5 créditos de benefício!',
          time: 'Agora',
          type: 'invite',
          quickActionLabel: 'Ver Carteira',
          read: false,
          bonusCredits: 5,
        };

        setNotifications((prev) => {
          const next = [newNotif, ...prev];
          try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      },
    }),
    [
      userIdentity,
      isAdmin,
      profile,
      preferences,
      hydrated,
      isSignedIn,
      credits,
      unlockedItems,
      walletData,
      journalEntries,
      dailyCheckPoints,
      additionalProfiles,
      registeredEvents,
      selectedScope,
      notifications,
      notificationSettings,
      redeemedCoupons,
      inviteCode,
    ]
  );

  return <OrbContext.Provider value={value}>{children}</OrbContext.Provider>;
};

export const useOrb = () => {
  const context = useContext(OrbContext);
  if (!context) {
    throw new Error('useOrb must be used within an OrbProvider');
  }
  return context;
};
