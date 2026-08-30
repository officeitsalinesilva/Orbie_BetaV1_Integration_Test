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
} from '../types';
import { initAuth, logoutGoogle } from '../lib/googleAuth';

export type SelectedScope =
  | { type: 'matrix' }
  | { type: 'profile'; id: string }
  | { type: 'event'; id: string };

interface OrbContextValue {
  profile: OrbProfile | null;
  preferences: OrbPreferences;
  hydrated: boolean;
  isSignedIn: boolean;
  credits: number;
  unlockedItems: string[];
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
  spendCredits: (amount: number) => boolean;
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
  redeemCoupon: (code: string) => { success: boolean; message: string; creditsGranted: number };
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

const INITIAL_CHECKPOINTS: DailyCheckPoint[] = [
  {
    id: 'chk-2026-08-21',
    date: '2026-08-21',
    title: 'Integração & Alinhamento Estratégico',
    color: 'emerald',
    icon: 'flame',
    authorComment:
      'Dia com fluxo extraordinário na janela matinal. Todas as pendências estruturais da semana foram resolvidas antes das 12h. Mantive neutralidade em diálogos difíceis à tarde.',
    attachedComponentKeys: ['consciousness_level', 'daily_synthesis', 'alchemy_metrics', 'day_windows'],
    attachedSnapshot: [
      {
        key: 'consciousness_level',
        title: 'Nível 350 — Aceitação',
        summary: 'Perdão, harmonia e transcendência operacional.',
        tag: 'CALIBRAÇÃO',
        category: 'consciousness',
      },
      {
        key: 'daily_synthesis',
        title: 'Síntese Diária',
        summary: 'Condições ótimas para decisões estruturantes e fechamento de backlog.',
        tag: 'SÍNTESE',
        category: 'synthesis',
      },
      {
        key: 'alchemy_metrics',
        title: 'Terra (71%) & Vontade',
        summary: 'Execução e disciplina prática dominaram o dia.',
        tag: 'ALQUIMIA',
        category: 'alchemy',
      },
    ],
    habitsCompleted: ['deep_work', 'hydration', 'active_listening'],
    createdAt: '2026-08-21T21:40:00.000Z',
    updatedAt: '2026-08-21T21:40:00.000Z',
  },
  {
    id: 'chk-2026-08-20',
    date: '2026-08-20',
    title: 'Imersão Analítica & Foco Único',
    color: 'indigo',
    icon: 'target',
    authorComment:
      'Bloco de 25 min de foco executado sem interrupções. Reduzi ruídos externos e priorizei planejamento do ciclo trimestral.',
    attachedComponentKeys: ['daily_synthesis', 'sound_frequency'],
    attachedSnapshot: [
      {
        key: 'daily_synthesis',
        title: 'Síntese Diária',
        summary: 'Foco analítico sustentado na janela solar ascendente.',
        tag: 'SÍNTESE',
        category: 'synthesis',
      },
      {
        key: 'sound_frequency',
        title: 'Frequência 528 Hz',
        summary: 'Ondas binaurais de regeneração e clareza cognitiva.',
        tag: 'ÁUDIO',
        category: 'frequency',
      },
    ],
    habitsCompleted: ['deep_work', 'meditation'],
    createdAt: '2026-08-20T22:15:00.000Z',
    updatedAt: '2026-08-20T22:15:00.000Z',
  },
  {
    id: 'chk-2026-08-18',
    date: '2026-08-18',
    title: 'Desbloqueio Criativo & Alinhamento',
    color: 'amber',
    icon: 'sparkles',
    authorComment:
      'Excelente ressonância com os 4 elementos. O elemento Ar trouxe agilidade mental para fechar a proposta com o time.',
    attachedComponentKeys: ['consciousness_level', 'alchemy_metrics'],
    attachedSnapshot: [
      {
        key: 'consciousness_level',
        title: 'Nível 350 — Aceitação',
        summary: 'Harmonia e ausência de atrito no trabalho em equipe.',
        tag: 'CALIBRAÇÃO',
        category: 'consciousness',
      },
    ],
    habitsCompleted: ['active_listening', 'hydration'],
    createdAt: '2026-08-18T20:10:00.000Z',
    updatedAt: '2026-08-18T20:10:00.000Z',
  },
  {
    id: 'chk-2026-08-15',
    date: '2026-08-15',
    title: 'Pausa Restaurativa & Equilíbrio',
    color: 'purple',
    icon: 'moon',
    authorComment:
      'Dia voltado para descompressão fisiológica e caminhada ao ar livre. Sono restaurador de alta qualidade.',
    attachedComponentKeys: ['day_windows'],
    attachedSnapshot: [
      {
        key: 'day_windows',
        title: 'Janela da Tarde',
        summary: 'Ritmo suave e proteção de vigor somático.',
        tag: 'RITMO',
        category: 'windows',
      },
    ],
    habitsCompleted: ['hydration', 'rest'],
    createdAt: '2026-08-15T19:30:00.000Z',
    updatedAt: '2026-08-15T19:30:00.000Z',
  },
  {
    id: 'chk-2026-08-14',
    date: '2026-08-14',
    title: 'Direcionamento & Clareza Mental',
    color: 'cyan',
    icon: 'compass',
    authorComment:
      'Definição dos três pilares estratégicos do mês. Alinhamento consciente e segurança nas escolhas tomadas.',
    attachedComponentKeys: ['daily_synthesis', 'spheres'],
    attachedSnapshot: [
      {
        key: 'spheres',
        title: 'Esfera Carreira & Estudos',
        summary: 'Decisões arquiteturais sólidas e sem hesitação.',
        tag: 'ESFERAS',
        category: 'spheres',
      },
    ],
    habitsCompleted: ['deep_work', 'active_listening'],
    createdAt: '2026-08-14T21:00:00.000Z',
    updatedAt: '2026-08-14T21:00:00.000Z',
  },
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'O Daily Panel está disponível',
    description: 'O panorama completo de alquimia diária e horas planetárias foi calculado para hoje.',
    time: 'Agora',
    type: 'system',
    quickActionLabel: 'Ver Daily Panel',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Janelas do dia virando: Período Tarde iniciou',
    description: 'Transição da janela solar. Ritmo metabólico desacelerando. Veja recomendações.',
    time: '12:00',
    type: 'alert',
    quickActionLabel: 'Ver Janela Atual',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Alertas e riscos do dia: Lembrete de risco da janela atual',
    description: 'Evite conversas tensas ou negociações precipitadas na janela das 14h às 16h.',
    time: 'Há 1 hora',
    type: 'alert',
    quickActionLabel: 'Ver Alerta de Risco',
    read: false,
  },
  {
    id: 'notif-4',
    title: 'Síntese do dia disponível',
    description: 'Seus 3 pontos essenciais para alinhamento consciente estão prontos para leitura.',
    time: 'Há 2 horas',
    type: 'system',
    quickActionLabel: 'Ver Síntese do Dia',
    read: false,
  },
  {
    id: 'notif-5',
    title: 'Créditos diários renovaram (+10 ◎)',
    description: 'Sua cota diária do plano Guardião Prime foi creditada com sucesso.',
    time: '00:00',
    type: 'renewal',
    quickActionLabel: 'Ver Carteira',
    read: true,
  },
  {
    id: 'notif-6',
    title: 'Bônus de Indicação: Amigo se cadastrou (+5 ◎)',
    description: 'Seu convidado completou o cadastro na plataforma com seu link. +5 créditos adicionados!',
    time: 'Ontem',
    type: 'invite',
    quickActionLabel: 'Ver Carteira',
    read: false,
    bonusCredits: 5,
  },
  {
    id: 'notif-7',
    title: 'Promoção Especial: Pacote Matriz 20% Off',
    description: 'Desbloqueie 500 créditos bônus e 2 mapas de arquétipos com condição especial.',
    time: 'Há 2 dias',
    type: 'promo',
    quickActionLabel: 'Ver Oferta',
    read: true,
  },
];

const DEFAULT_ADDITIONAL_PROFILES: AdditionalProfile[] = [
  {
    id: 'prof-lucas',
    name: 'Lucas Silva',
    relation: 'child',
    birthDay: '20',
    birthMonth: '11',
    birthYear: '2018',
    birthHour: '14',
    birthMinute: '20',
    birthCity: 'São Paulo',
    completeness: 85,
    unlockedItems: ['VIB-002', 'AST-001'],
    createdAt: '2026-08-01T10:00:00.000Z',
  },
];

const DEFAULT_REGISTERED_EVENTS: RegisteredEvent[] = [
  {
    id: 'evt-empresa',
    title: 'Fundação da Empresa Orb Tech',
    category: 'business',
    eventDay: '15',
    eventMonth: '01',
    eventYear: '2024',
    eventHour: '10',
    eventMinute: '00',
    location: 'São Paulo, SP',
    description: 'Data de registro do contrato social e lançamento operacional da marca.',
    completeness: 90,
    unlockedItems: ['AST-003', 'SRV-001'],
    createdAt: '2026-08-05T12:00:00.000Z',
  },
];

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
  const [profile, setProfile] = useState<OrbProfile | null>(null);
  const [preferences, setPreferences] = useState<OrbPreferences>({
    theme: 'light',
    language: 'pt-BR',
  });
  const [isSignedIn, setIsSignedIn] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(240);
  const [unlockedItems, setUnlockedItems] = useState<string[]>(['VIB-002', 'SRV-001']);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [dailyCheckPoints, setDailyCheckPoints] = useState<DailyCheckPoint[]>(INITIAL_CHECKPOINTS);
  const [additionalProfiles, setAdditionalProfiles] = useState<AdditionalProfile[]>(DEFAULT_ADDITIONAL_PROFILES);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>(DEFAULT_REGISTERED_EVENTS);
  const [selectedScope, setSelectedScope] = useState<SelectedScope>({ type: 'matrix' });
  const [notifications, setNotifications] = useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);
  const [notificationSettings, setNotificationSettings] = useState<NotificationToggleSettings>(DEFAULT_NOTIF_SETTINGS);
  const [redeemedCoupons, setRedeemedCoupons] = useState<CouponRedemption[]>([]);
  const [inviteCode] = useState<string>('ALINE-94K8');

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
          if (Array.isArray(parsedCheckPoints) && parsedCheckPoints.length > 0) {
            setDailyCheckPoints(parsedCheckPoints);
          } else {
            setDailyCheckPoints(INITIAL_CHECKPOINTS);
            localStorage.setItem(CHECKPOINTS_KEY, JSON.stringify(INITIAL_CHECKPOINTS));
          }
        } catch {
          setDailyCheckPoints(INITIAL_CHECKPOINTS);
        }
      } else {
        setDailyCheckPoints(INITIAL_CHECKPOINTS);
        localStorage.setItem(CHECKPOINTS_KEY, JSON.stringify(INITIAL_CHECKPOINTS));
      }

      if (profilesValue) {
        try {
          const parsed = JSON.parse(profilesValue);
          if (Array.isArray(parsed)) setAdditionalProfiles(parsed);
        } catch {}
      } else {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_ADDITIONAL_PROFILES));
      }

      if (eventsValue) {
        try {
          const parsed = JSON.parse(eventsValue);
          if (Array.isArray(parsed)) setRegisteredEvents(parsed);
        } catch {}
      } else {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(DEFAULT_REGISTERED_EVENTS));
      }

      if (notifsValue) {
        try {
          const parsed = JSON.parse(notifsValue);
          if (Array.isArray(parsed)) setNotifications(parsed);
        } catch {}
      } else {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
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
        const defaultProfile: OrbProfile = {
          fullName: 'Aline Silva',
          preferredName: 'Aline',
          avatarUrl: '',
          email: 'alinealv.silv@gmail.com',
          birthDay: '14',
          birthMonth: '06',
          birthYear: '1994',
          birthHour: '09',
          birthMinute: '30',
          noExactTime: false,
          birthCountry: 'Brasil',
          birthState: 'São Paulo',
          birthCity: 'São Paulo',
          timezone: 'UTC -3 (Brasília)',
          theme: 'light',
          language: 'pt-BR',
          dailySynthesis: true,
          synthesisHour: '08:00',
          backupGoogleDrive: true,
          backupEmail: true,
          backupLocal: true,
        };
        setProfile(defaultProfile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
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

    // Subscribe to Google Firebase Auth state
    const unsubscribe = initAuth((googleUser) => {
      if (googleUser) {
        setProfile((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            avatarUrl: googleUser.photoURL || prev.avatarUrl || '',
            email: googleUser.email || prev.email || 'alinealv.silv@gmail.com',
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<OrbContextValue>(
    () => ({
      profile,
      preferences,
      hydrated,
      isSignedIn,
      credits,
      unlockedItems,
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
        setProfile(nextProfile);
        const nextPreferences = { theme: nextProfile.theme, language: nextProfile.language };
        setPreferences(nextPreferences);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
          localStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
        } catch (e) {
          console.warn('Error writing profile to localStorage', e);
        }
      },
      savePreferences: async (patch) => {
        const nextPreferences = { ...preferences, ...patch };
        setPreferences(nextPreferences);
        try {
          localStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
          if (profile) {
            const nextProfile = { ...profile, ...patch };
            setProfile(nextProfile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
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
      signIn: async () => {
        setIsSignedIn(true);
        try {
          localStorage.setItem(AUTH_KEY, 'true');
        } catch (e) {
          console.warn('Error writing auth to localStorage', e);
        }
      },
      signOut: async () => {
        setIsSignedIn(false);
        await logoutGoogle();
        try {
          localStorage.setItem(AUTH_KEY, 'false');
        } catch (e) {
          console.warn('Error removing auth to localStorage', e);
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
      spendCredits: (amount: number) => {
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
        const newProf: AdditionalProfile = {
          ...data,
          id: `prof-${Date.now()}`,
          completeness: 75,
          unlockedItems: ['VIB-002'],
          createdAt: new Date().toISOString(),
        };
        setAdditionalProfiles((prev) => {
          const next = [...prev, newProf];
          try {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
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
          } catch {}
          return next;
        });
      },
      deleteAdditionalProfile: (id: string) => {
        setAdditionalProfiles((prev) => {
          const next = prev.filter((p) => p.id !== id);
          try {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
        setSelectedScope({ type: 'matrix' });
      },
      // Registered Events
      addRegisteredEvent: (data) => {
        const newEvt: RegisteredEvent = {
          ...data,
          id: `evt-${Date.now()}`,
          completeness: 80,
          unlockedItems: ['AST-003'],
          createdAt: new Date().toISOString(),
        };
        setRegisteredEvents((prev) => {
          const next = [...prev, newEvt];
          try {
            localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
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
          } catch {}
          return next;
        });
      },
      deleteRegisteredEvent: (id: string) => {
        setRegisteredEvents((prev) => {
          const next = prev.filter((e) => e.id !== id);
          try {
            localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
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
      redeemCoupon: (rawCode: string) => {
        const code = rawCode.trim().toUpperCase();
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
      profile,
      preferences,
      hydrated,
      isSignedIn,
      credits,
      unlockedItems,
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
