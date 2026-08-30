import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Settings,
  User,
  BookOpen,
  Library,
  CreditCard,
  Plus,
  Zap,
  Flame,
  Cloud,
  HardDrive,
  LogOut,
  CheckCircle2,
  Bell,
  Sliders,
  PanelRightClose,
  Clock,
  ExternalLink,
  ShieldCheck,
  Compass,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Gift,
  UserPlus,
  CalendarPlus,
  Building2,
  Trash2,
  Check,
  Layers,
  Sun,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  X,
  Globe,
} from 'lucide-react';
import { OrbBrand } from './OrbBrand';
import { GoogleProfileAvatar } from './common/GoogleProfileAvatar';
import { SystemSlideDrawer } from './common/SystemSlideDrawer';
import { AppFooter } from './common/AppFooter';
import { TermsSupportModal } from './TermsSupportModal';
import { useOrb } from '../context/OrbContext';
import { ALL_CATALOG_ITEMS } from '../data/catalogData';
import { ProfileLibrarySection } from './profile/ProfileLibrarySection';
import { ProfileLibraryItem } from './profile/profileCatalogData';
import { ProfileManagerDropdown } from './profile/ProfileManagerDropdown';
import {
  AddOrEditProfileEventModal,
  getProfileEventIcon,
} from './profile/AddOrEditProfileEventModal';
import { SecondaryProfileDailyJournal } from './profile/SecondaryProfileDailyJournal';
import { SecondaryProfileCheckPoint } from './profile/SecondaryProfileCheckPoint';
import { AdditionalProfile, RegisteredEvent, NotificationToggleSettings } from '../types';

type Props = {
  onBack: () => void;
  onOpenWallet?: () => void;
  onOpenCatalog?: () => void;
  onOpenDailyJournal?: () => void;
  onOpenNeuroacustica?: () => void;
  onOpenChat?: () => void;
  onOpenNotifications?: () => void;
  onSignOut: () => void;
  isEnglish?: boolean;
};

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'alert' | 'promo' | 'system' | 'renewal';
  quickActionLabel: string;
  action: () => void;
}

export function ProfileView({
  onBack,
  onOpenWallet,
  onOpenCatalog,
  onOpenDailyJournal,
  onOpenNeuroacustica,
  onOpenChat,
  onOpenNotifications,
  onSignOut,
  isEnglish = false,
}: Props) {
  const {
    profile,
    preferences,
    journalEntries,
    credits,
    unlockedItems,
    isItemUnlocked,
    saveProfile,
    spendCredits,
    unlockItem,
    additionalProfiles,
    registeredEvents,
    selectedScope,
    setSelectedScope,
    addAdditionalProfile,
    updateAdditionalProfile,
    deleteAdditionalProfile,
    addRegisteredEvent,
    updateRegisteredEvent,
    deleteRegisteredEvent,
    notificationSettings,
    saveNotificationSettings,
  } = useOrb();

  // Navigation tab inside the view: Library, Daily Journal, Checkpoint
  const [activeTab, setActiveTab] = useState<'library' | 'daily-journal' | 'checkpoint'>('library');

  // Slide drawer / System menu & Settings Slide Drawer
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy' | 'support' | null>(null);

  // Notifications central dropdown toggle
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(true);

  // Profile details edit mode state
  const [isEditingProfileDetails, setIsEditingProfileDetails] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    fullName: profile?.fullName || '',
    preferredName: profile?.preferredName || '',
    birthDay: profile?.birthDay || '14',
    birthMonth: profile?.birthMonth || '08',
    birthYear: profile?.birthYear || '1996',
    birthHour: profile?.birthHour || '10',
    birthMinute: profile?.birthMinute || '30',
    noExactTime: profile?.noExactTime || false,
    birthCity: profile?.birthCity || 'São Paulo',
    birthState: profile?.birthState || 'SP',
    birthCountry: profile?.birthCountry || 'Brasil',
    currentCountry: profile?.currentCountry || 'Brasil',
  });

  useEffect(() => {
    if (profile) {
      setProfileDraft({
        fullName: profile.fullName || '',
        preferredName: profile.preferredName || '',
        birthDay: profile.birthDay || '14',
        birthMonth: profile.birthMonth || '08',
        birthYear: profile.birthYear || '1996',
        birthHour: profile.birthHour || '10',
        birthMinute: profile.birthMinute || '30',
        noExactTime: profile.noExactTime || false,
        birthCity: profile.birthCity || 'São Paulo',
        birthState: profile.birthState || 'SP',
        birthCountry: profile.birthCountry || 'Brasil',
        currentCountry: profile.currentCountry || profile.birthCountry || 'Brasil',
      });
    }
  }, [profile, settingsOpen]);

  const handleSaveProfileDetails = async () => {
    if (!profile) return;
    await saveProfile({
      ...profile,
      fullName: profileDraft.fullName,
      preferredName: profileDraft.preferredName,
      birthDay: profileDraft.birthDay,
      birthMonth: profileDraft.birthMonth,
      birthYear: profileDraft.birthYear,
      birthHour: profileDraft.birthHour,
      birthMinute: profileDraft.birthMinute,
      noExactTime: profileDraft.noExactTime,
      birthCity: profileDraft.birthCity,
      birthState: profileDraft.birthState,
      birthCountry: profileDraft.birthCountry,
      currentCountry: profileDraft.currentCountry,
    });
    setIsEditingProfileDetails(false);
  };

  // Unified Add / Edit Modal State
  const [isAddOrEditModalOpen, setIsAddOrEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalInitialType, setModalInitialType] = useState<'person' | 'event'>('person');
  const [editingProfile, setEditingProfile] = useState<AdditionalProfile | null>(null);
  const [editingEvent, setEditingEvent] = useState<RegisteredEvent | null>(null);

  // Settings Slide Drawer state
  const [deliveryTime, setDeliveryTime] = useState(notificationSettings.deliverySchedule || '08:00');
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<'all' | 'alert' | 'promo' | 'system' | 'renewal'>('all');
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set(['notif-5', 'notif-7']));

  const name = profile?.preferredName || profile?.fullName || 'Aline Silva';
  const email = profile?.email || 'alinealv.silv@gmail.com';

  const backupDrive = profile?.backupGoogleDrive ?? true;
  const backupLocal = profile?.backupLocal ?? true;

  const toggleBackup = async (key: 'backupGoogleDrive' | 'backupLocal', currentVal: boolean) => {
    if (profile) {
      await saveProfile({
        ...profile,
        [key]: !currentVal,
      });
    }
  };

  const handleToggleSetting = (key: keyof NotificationToggleSettings) => {
    saveNotificationSettings({
      [key]: !notificationSettings[key],
    });
  };

  const handlePurchaseItem = (item: ProfileLibraryItem) => {
    if (isItemUnlocked(item.code)) {
      return;
    }
    if (credits < item.credits) {
      if (onOpenWallet) {
        onOpenWallet();
      }
      return;
    }
    const success = spendCredits(item.credits);
    if (success) {
      unlockItem(item.code);
    }
  };

  // Handlers para abrir modal de criação e edição
  const handleOpenAddModal = (type: 'person' | 'event' = 'person') => {
    setModalMode('create');
    setModalInitialType(type);
    setEditingProfile(null);
    setEditingEvent(null);
    setIsAddOrEditModalOpen(true);
  };

  const handleEditProfile = (prof: AdditionalProfile) => {
    setModalMode('edit');
    setModalInitialType('person');
    setEditingProfile(prof);
    setEditingEvent(null);
    setIsAddOrEditModalOpen(true);
  };

  const handleEditEvent = (evt: RegisteredEvent) => {
    setModalMode('edit');
    setModalInitialType('event');
    setEditingProfile(null);
    setEditingEvent(evt);
    setIsAddOrEditModalOpen(true);
  };

  const handleSaveProfileModal = (
    data: Omit<AdditionalProfile, 'id' | 'createdAt' | 'completeness' | 'unlockedItems'>,
    editId?: string
  ) => {
    if (editId) {
      updateAdditionalProfile(editId, data);
    } else {
      addAdditionalProfile(data);
    }
  };

  const handleSaveEventModal = (
    data: Omit<RegisteredEvent, 'id' | 'createdAt' | 'completeness' | 'unlockedItems'>,
    editId?: string
  ) => {
    if (editId) {
      updateRegisteredEvent(editId, data);
    } else {
      addRegisteredEvent(data);
    }
  };

  // Gamified metrics computation
  const totalCatalogCount = ALL_CATALOG_ITEMS.length || 24;
  const unlockedCount = unlockedItems.length || 3;
  const checkinsCount = journalEntries.length || 8;

  // Active entity details based on selected scope
  const activeEntity = useMemo(() => {
    if (selectedScope.type === 'profile') {
      const p = additionalProfiles.find((item) => item.id === selectedScope.id);
      return {
        id: p?.id || 'profile-unknown',
        type: 'profile' as const,
        isMatrix: false,
        isEvent: false,
        name: p?.name || p?.fullName || 'Perfil Adicional',
        subLabel: p?.relation || p?.relationship || 'Pessoa / Vínculo',
        cityOrLocation: p?.birthCity || 'São Paulo, SP',
        birthOrEventDate: p?.birthDay ? `${p.birthDay}/${p.birthMonth}/${p.birthYear}` : undefined,
        icon: p?.icon,
        notifyEnabled: p?.notifyEnabled ?? true,
        description: p?.description || p?.bio,
        unlockedCount: p?.unlockedItems?.length || 0,
        completeness: Math.min(100, 60 + (p?.unlockedItems?.length || 0) * 10),
      };
    }
    if (selectedScope.type === 'event') {
      const e = registeredEvents.find((item) => item.id === selectedScope.id);
      return {
        id: e?.id || 'event-unknown',
        type: 'event' as const,
        isMatrix: false,
        isEvent: true,
        name: e?.title || 'Evento Cadastrado',
        subLabel: e?.category || 'Evento / Marco',
        cityOrLocation: e?.location || 'São Paulo, SP',
        birthOrEventDate: e?.eventDay ? `${e.eventDay}/${e.eventMonth}/${e.eventYear}` : undefined,
        icon: e?.icon,
        notifyEnabled: e?.notifyEnabled ?? true,
        description: e?.description,
        unlockedCount: e?.unlockedItems?.length || 0,
        completeness: Math.min(100, 55 + (e?.unlockedItems?.length || 0) * 12),
      };
    }
    // Matrix scope default
    let score = 50;
    if (profile?.fullName) score += 10;
    if (profile?.birthDay && profile?.birthCity) score += 15;
    if (unlockedCount > 0) score += Math.min(15, unlockedCount * 3);
    if (checkinsCount > 0) score += Math.min(10, checkinsCount * 2);
    return {
      id: 'matrix',
      type: 'matrix' as const,
      isMatrix: true,
      isEvent: false,
      name,
      subLabel: isEnglish ? 'Prime Guardian Plan' : 'Plano Guardião Prime',
      cityOrLocation: profile?.birthCity || 'São Paulo, SP',
      birthOrEventDate: profile?.birthDay ? `${profile.birthDay}/${profile.birthMonth}/${profile.birthYear}` : undefined,
      icon: 'star',
      notifyEnabled: true,
      description: undefined,
      unlockedCount,
      completeness: Math.min(100, score),
    };
  }, [selectedScope, additionalProfiles, registeredEvents, profile, unlockedCount, checkinsCount, name, isEnglish]);

  const completeness = activeEntity.completeness;
  const isSecondaryActive = selectedScope.type !== 'matrix';

  // Se trocar de escopo e estiver em aba não suportada pelo matriz, volta para library
  useEffect(() => {
    if (selectedScope.type === 'matrix' && (activeTab === 'daily-journal' || activeTab === 'checkpoint')) {
      setActiveTab('library');
    }
  }, [selectedScope, activeTab]);

  // Lista de Notificações com suporte a notificações em nome dos perfis secundários
  const notificationItems = useMemo<NotificationItem[]>(() => {
    const baseNotifs: NotificationItem[] = [
      {
        id: 'notif-1',
        title: isEnglish ? 'Daily Panel is available' : 'O Daily Panel está disponível',
        description: isEnglish
          ? 'Today’s personal alchemy and planetary hours are calculated.'
          : 'O panorama completo de alquimia diária e horas planetárias foi calculado para hoje.',
        time: isEnglish ? 'Just now' : 'Agora',
        type: 'system',
        quickActionLabel: isEnglish ? 'View Daily Panel' : 'Ver Daily Panel',
        action: () => {
          setSettingsOpen(false);
          onOpenDailyJournal?.();
        },
      },
      {
        id: 'notif-2',
        title: isEnglish ? 'Day window transition: Afternoon began' : 'Janelas do dia virando: Período Tarde iniciou',
        description: isEnglish
          ? 'Solar peak transition. Review the optimal cognitive focus curve.'
          : 'Transição da janela solar. Ritmo metabólico desacelerando. Veja recomendações.',
        time: isEnglish ? '12:00' : '12:00',
        type: 'alert',
        quickActionLabel: isEnglish ? 'View Current Window' : 'Ver Janela Atual',
        action: () => {
          setSettingsOpen(false);
          onOpenDailyJournal?.();
        },
      },
      {
        id: 'notif-3',
        title: isEnglish ? 'Daily risk reminder: Mars square' : 'Alertas e riscos do dia: Lembrete de risco da janela atual',
        description: isEnglish
          ? 'Avoid impulsive financial discussions between 14h and 16h.'
          : 'Evite conversas tensas ou negociações precipitadas na janela das 14h às 16h.',
        time: isEnglish ? '1h ago' : 'Há 1 hora',
        type: 'alert',
        quickActionLabel: isEnglish ? 'View Risk Alert' : 'Ver Alerta de Risco',
        action: () => {
          setSettingsOpen(false);
          onOpenDailyJournal?.();
        },
      },
      {
        id: 'notif-4',
        title: isEnglish ? 'Daily synthesis generated' : 'Síntese do dia disponível',
        description: isEnglish
          ? 'Your 3 focal points for sovereign clarity are ready for reflection.'
          : 'Seus 3 pontos essenciais para alinhamento consciente estão prontos para leitura.',
        time: isEnglish ? '2h ago' : 'Há 2 horas',
        type: 'system',
        quickActionLabel: isEnglish ? 'Read Synthesis' : 'Ver Síntese do Dia',
        action: () => {
          setSettingsOpen(false);
          onOpenDailyJournal?.();
        },
      },
      {
        id: 'notif-5',
        title: isEnglish ? 'Daily credits renewed (+10 ◎)' : 'Créditos diários renovaram (+10 ◎)',
        description: isEnglish
          ? 'Your Guardian Prime daily allowance was added to your balance.'
          : 'Sua cota diária do plano Guardião Prime foi creditada com sucesso.',
        time: isEnglish ? '00:00' : '00:00',
        type: 'renewal',
        quickActionLabel: isEnglish ? 'Open Wallet' : 'Ver Carteira',
        action: () => {
          setSettingsOpen(false);
          onOpenWallet?.();
        },
      },
    ];

    // Adiciona notificações em nome dos perfis adicionais que tiverem notificações habilitadas
    additionalProfiles.forEach((p) => {
      if (p.notifyEnabled) {
        baseNotifs.unshift({
          id: `notif-prof-${p.id}`,
          title: isEnglish ? `Daily synergy alert for ${p.name}` : `Alerta de sinastria diária: ${p.name}`,
          description: isEnglish
            ? `Harmonic resonance window active today. Review joint planetary alignment for ${p.name}.`
            : `Janela de ressonância harmônica ativa hoje para ${p.name}. Veja a calibração dedicada.`,
          time: isEnglish ? '15m ago' : 'Há 15 min',
          type: 'alert',
          quickActionLabel: isEnglish ? 'View Scope Journal' : 'Ver Diário do Perfil',
          action: () => {
            setSelectedScope({ type: 'profile', id: p.id });
            setActiveTab('daily-journal');
            setSettingsOpen(false);
          },
        });
      }
    });

    // Adiciona notificações em nome dos eventos registrados que tiverem notificações habilitadas
    registeredEvents.forEach((ev) => {
      if (ev.notifyEnabled) {
        baseNotifs.unshift({
          id: `notif-evt-${ev.id}`,
          title: isEnglish ? `Milestone alert: ${ev.title}` : `Alerta de marco: ${ev.title}`,
          description: isEnglish
            ? `Strategic timing reminder for ${ev.title} (${ev.category || 'Event'}).`
            : `Lembrete estratégico de momento ideal para ${ev.title} (${ev.category || 'Evento'}).`,
          time: isEnglish ? '30m ago' : 'Há 30 min',
          type: 'system',
          quickActionLabel: isEnglish ? 'View Event Checkpoint' : 'Ver Checkpoint',
          action: () => {
            setSelectedScope({ type: 'event', id: ev.id });
            setActiveTab('checkpoint');
            setSettingsOpen(false);
          },
        });
      }
    });

    return baseNotifs;
  }, [additionalProfiles, registeredEvents, isEnglish, onOpenDailyJournal, onOpenWallet, setSelectedScope]);

  const filteredNotifications = notificationItems.filter((item) => {
    if (selectedNotifFilter === 'all') return true;
    return item.type === selectedNotifFilter;
  });

  const unreadCount = notificationItems.filter((n) => !readNotifIds.has(n.id)).length;

  const markAllAsRead = () => {
    const allIds = new Set(notificationItems.map((n) => n.id));
    setReadNotifIds(allIds);
  };

  const toggleReadStatus = (id: string) => {
    setReadNotifIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const ActiveScopeIcon = getProfileEventIcon(activeEntity.icon, activeEntity.isEvent);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)]/20 flex flex-col pb-8">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR PADRÃO                                                      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-lg px-6 py-3 shrink-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between relative">
          {/* Extrema Esquerda: OrbBrand Compact */}
          <div className="flex items-center">
            <OrbBrand compact />
          </div>

          {/* Eixo Central da Navbar: Ícone de Usuário limpo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none text-[var(--foreground)]">
            <User size={20} strokeWidth={1.75} />
          </div>

          {/* Extrema Direita: Foto do Usuário (Abre Menu Slide) */}
          <div className="flex items-center gap-2">
            <GoogleProfileAvatar
              profile={profile}
              name={name}
              onClick={() => setMenuOpen(true)}
              title={isEnglish ? 'Open system menu' : 'Abrir menu lateral'}
            />
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SUB-HEADER: Seta de Retorno à esquerda e Ícone de Config à direita     */}
      {/* ========================================================================= */}
      <div className="w-full px-6 py-2 shrink-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label={isEnglish ? 'Go back' : 'Voltar'}
            title={isEnglish ? 'Go back' : 'Voltar'}
            className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors p-1 -ml-1 cursor-pointer active:scale-95 flex items-center shrink-0"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label={isEnglish ? 'Account settings and alert configurations' : 'Configurações de alertas e conta'}
            title={isEnglish ? 'Account settings' : 'Ajustes e notificações'}
            className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors p-1 -mr-1 cursor-pointer active:scale-95 flex items-center shrink-0"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CORPO PRINCIPAL DO PERFIL GAMEFICADO                                   */}
      {/* ========================================================================= */}
      <main className="mx-auto w-full max-w-3xl px-6 pt-2 space-y-6 flex-1">
        {/* Topo do Perfil: Nome na esquerda e Componente de Créditos na extrema direita na mesma altura */}
        <div className="pt-1 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] truncate">
              {profile?.preferredName || profile?.fullName || name || 'Aline Silva'}
            </h2>

            {/* Componente de Créditos na extrema direita alinhado com o nome */}
            <button
              type="button"
              onClick={onOpenWallet}
              title={isEnglish ? 'Wallet Balance & Recharge' : 'Saldo da Carteira e Recarga'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--foreground)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-2xs group shrink-0"
            >
              <span className="text-[var(--accent)] font-extrabold text-sm leading-none">◎</span>
              <span>{credits}</span>
              <span className="text-[10px] font-normal text-[var(--text-secondary)] hidden sm:inline">
                {isEnglish ? 'credits' : 'créditos'}
              </span>
              <span className="flex items-center justify-center h-4 w-4 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-[11px] font-bold ml-1 group-hover:scale-110 transition-transform">
                +
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
            <span>{profile?.birthCity || 'São Paulo, SP'}</span>
            <span>·</span>
            <span className="text-[var(--accent)] font-semibold">
              {isEnglish ? 'Prime Guardian Plan' : 'Plano Guardião Prime'}
            </span>
          </div>

          {/* Barra de Completude do Perfil no lugar onde ficava o componente de créditos */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {activeEntity.isEvent
                  ? isEnglish ? 'Event Completeness' : 'Completude do Evento'
                  : isEnglish ? 'Profile Completeness' : 'Completude de Perfil'}
              </span>
              <span className="font-extrabold text-[var(--foreground)] text-xs">{completeness}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)] border border-[var(--border)]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeEntity.isEvent ? 'bg-blue-600' : 'bg-[var(--foreground)]'
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* SELETOR GERENCIADOR DE PERFIL COM DROPDOWN & BOTÃO ADICIONAR            */}
        {/* ======================================================================= */}
        <ProfileManagerDropdown
          selectedScope={selectedScope}
          onSelectScope={setSelectedScope}
          matrixProfile={profile}
          additionalProfiles={additionalProfiles}
          registeredEvents={registeredEvents}
          onOpenAddModal={handleOpenAddModal}
          onEditProfile={handleEditProfile}
          onEditEvent={handleEditEvent}
          onDeleteProfile={deleteAdditionalProfile}
          onDeleteEvent={deleteRegisteredEvent}
          isEnglish={isEnglish}
        />

        {/* Informações Resumidas do Perfil Secundário se Ativo */}
        {isSecondaryActive && (
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2 text-xs font-mono animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">
                {isEnglish ? 'Scope Details' : 'Dados do Registro'}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedScope.type === 'profile') {
                    const p = additionalProfiles.find((item) => item.id === selectedScope.id);
                    if (p) handleEditProfile(p);
                  } else if (selectedScope.type === 'event') {
                    const e = registeredEvents.find((item) => item.id === selectedScope.id);
                    if (e) handleEditEvent(e);
                  }
                }}
                className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
              >
                <Settings size={12} />
                <span>{isEnglish ? 'Edit Data' : 'Editar Dados'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">
                  {activeEntity.isEvent ? 'Data do Evento' : 'Nascimento'}
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  {activeEntity.birthOrEventDate || 'Não informado'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">Localidade</span>
                <span className="font-semibold text-[var(--foreground)] truncate block">
                  {activeEntity.cityOrLocation}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">Notificações</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {activeEntity.notifyEnabled ? 'Ativas' : 'Desativadas'}
                </span>
              </div>
            </div>

            {activeEntity.description && (
              <p className="pt-2 text-[11px] text-[var(--text-secondary)] border-t border-[var(--border)] leading-relaxed italic">
                "{activeEntity.description}"
              </p>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* NAVEGAÇÃO DE ABAS: BIBLIOTECA | DAILY JOURNAL | CHECKPOINT              */}
        {/* ======================================================================= */}
        <div className="flex items-center gap-1.5 border-b border-[var(--border)] pb-2 overflow-x-auto scrollbar-none">
          {/* Aba Biblioteca */}
          <button
            type="button"
            id="tab-library"
            onClick={() => setActiveTab('library')}
            aria-label={isEnglish ? 'Library Catalog' : 'Biblioteca de Serviços'}
            title={isEnglish ? 'Library Catalog' : 'Biblioteca de Serviços'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'bg-[var(--foreground)] text-[var(--background)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <Library size={15} />
            <span>{isEnglish ? 'Library & Artifacts' : 'Biblioteca & Artefatos'}</span>
          </button>

          {/* Abas Secundárias: APENAS quando em perfil secundário / evento */}
          {isSecondaryActive && (
            <>
              {/* Daily Journal do Perfil Secundário */}
              <button
                type="button"
                id="tab-secondary-daily-journal"
                onClick={() => setActiveTab('daily-journal')}
                aria-label={isEnglish ? 'Daily Journal for this profile' : 'Daily Journal deste perfil'}
                title={isEnglish ? 'Daily Journal for this profile' : 'Daily Journal deste perfil'}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'daily-journal'
                    ? 'bg-[var(--foreground)] text-[var(--background)] font-bold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <Sun size={15} className={activeTab === 'daily-journal' ? 'text-[var(--background)]' : 'text-amber-500'} />
                <span>{isEnglish ? 'Daily Journal' : 'Daily Journal'}</span>
              </button>

              {/* Checkpoint do Perfil Secundário */}
              <button
                type="button"
                id="tab-secondary-checkpoint"
                onClick={() => setActiveTab('checkpoint')}
                aria-label={isEnglish ? 'Checkpoint for this profile' : 'Checkpoint deste perfil'}
                title={isEnglish ? 'Checkpoint for this profile' : 'Checkpoint deste perfil'}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'checkpoint'
                    ? 'bg-[var(--foreground)] text-[var(--background)] font-bold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <ShieldCheck size={15} className={activeTab === 'checkpoint' ? 'text-[var(--background)]' : 'text-emerald-500'} />
                <span>{isEnglish ? 'Checkpoint' : 'Checkpoint'}</span>
              </button>
            </>
          )}
        </div>

        {/* ======================================================================= */}
        {/* ABA: BIBLIOTECA DEDICADA & CATÁLOGO                                      */}
        {/* ======================================================================= */}
        {activeTab === 'library' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ProfileLibrarySection
              unlockedItems={unlockedItems}
              isItemUnlocked={isItemUnlocked}
              userCredits={credits}
              onPurchaseItem={handlePurchaseItem}
              onOpenWallet={onOpenWallet}
              isEnglish={isEnglish}
            />
          </div>
        )}

        {/* ======================================================================= */}
        {/* ABA 3: DAILY JOURNAL DO PERFIL SECUNDÁRIO                               */}
        {/* ======================================================================= */}
        {activeTab === 'daily-journal' && isSecondaryActive && (
          <SecondaryProfileDailyJournal
            entity={activeEntity as any}
            isEnglish={isEnglish}
          />
        )}

        {/* ======================================================================= */}
        {/* ABA 4: CHECKPOINT DO PERFIL SECUNDÁRIO                                  */}
        {/* ======================================================================= */}
        {activeTab === 'checkpoint' && isSecondaryActive && (
          <SecondaryProfileCheckPoint
            entity={activeEntity as any}
            isEnglish={isEnglish}
          />
        )}

        {/* Global Footer */}
        <AppFooter
          isEnglish={isEnglish}
          onOpenTerms={() => setTermsModalType('terms')}
          onOpenPrivacy={() => setTermsModalType('privacy')}
          onOpenSupport={() => setTermsModalType('support')}
          className="pt-4"
        />
      </main>

      {/* ========================================================================= */}
      {/* 4. SETTINGS & ALERTS CONFIGURATION SLIDE DRAWER                           */}
      {/* ========================================================================= */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setSettingsOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              {/* Slide Drawer Header */}
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] shrink-0">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-[var(--accent)]" />
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    {isEnglish ? 'Settings & Alerts' : 'Ajustes & Alertas'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  <PanelRightClose size={20} />
                </button>
              </div>

              {/* Slide Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* ================================================================= */}
                {/* TOGGLES PARA CADA TIPO DE ALERTA NO SEGUNDO PLANO E NOTIFICAÇÕES */}
                {/* ================================================================= */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-mono font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                      {isEnglish ? 'ALERT & NOTIFICATION TOGGLES' : 'CONFIGURAÇÃO DE ALERTAS'}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--accent)] font-bold">
                      {isEnglish ? 'BACKGROUND ENGINE' : 'SEGUNDO PLANO'}
                    </span>
                  </div>

                  <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
                    {/* Alertas Diários e Janelas do Dia */}
                    <div className="flex items-center justify-between py-3">
                      <div className="pr-3">
                        <p className="text-xs font-semibold text-[var(--foreground)]">
                          {isEnglish ? 'Daily Windows & Schedule' : 'Janelas do Dia & Horas Planetárias'}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                          {isEnglish ? 'Notifies window transitions in background' : 'Notifica viradas de período no segundo plano'}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notificationSettings.dailyWindows}
                        onClick={() => handleToggleSetting('dailyWindows')}
                        className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationSettings.dailyWindows ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                            notificationSettings.dailyWindows ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Lembrete de Riscos do Dia */}
                    <div className="flex items-center justify-between py-3">
                      <div className="pr-3">
                        <p className="text-xs font-semibold text-[var(--foreground)]">
                          {isEnglish ? 'Risk & Tension Reminders' : 'Alertas e Riscos do Dia'}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                          {isEnglish ? 'Warns about peak tension transits' : 'Avisa momentos de cautela e tensão astrológica'}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notificationSettings.riskAlerts}
                        onClick={() => handleToggleSetting('riskAlerts')}
                        className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationSettings.riskAlerts ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                            notificationSettings.riskAlerts ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Síntese do Dia */}
                    <div className="flex items-center justify-between py-3">
                      <div className="pr-3">
                        <p className="text-xs font-semibold text-[var(--foreground)]">
                          {isEnglish ? 'Daily Synthesis Push' : 'Síntese do Dia'}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                          {isEnglish ? 'Key points and focal guidance for your day' : 'Resumo executivo e diretrizes do dia'}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notificationSettings.dailySynthesis}
                        onClick={() => handleToggleSetting('dailySynthesis')}
                        className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationSettings.dailySynthesis ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                            notificationSettings.dailySynthesis ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Alertas de Renovação de Créditos */}
                    <div className="flex items-center justify-between py-3">
                      <div className="pr-3">
                        <p className="text-xs font-semibold text-[var(--foreground)]">
                          {isEnglish ? 'Credit Balance & Renewals' : 'Renovação e Limite de Créditos'}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                          {isEnglish ? 'Alerts when quota resets or runs low' : 'Informa quando a cota diária renova ou acaba'}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notificationSettings.creditRenewals}
                        onClick={() => handleToggleSetting('creditRenewals')}
                        className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationSettings.creditRenewals ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                            notificationSettings.creditRenewals ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Promoções e Desbloqueios Especiais */}
                    <div className="flex items-center justify-between py-3">
                      <div className="pr-3">
                        <p className="text-xs font-semibold text-[var(--foreground)]">
                          {isEnglish ? 'Exclusive Offers & Blueprints' : 'Ofertas & Desbloqueios Especiais'}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                          {isEnglish ? 'Notifications for seasonal discounts and bundles' : 'Avisos sobre pacotes e artefatos em oferta'}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notificationSettings.promotionsAndInvites}
                        onClick={() => handleToggleSetting('promotionsAndInvites')}
                        className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          notificationSettings.promotionsAndInvites ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                            notificationSettings.promotionsAndInvites ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* LISTA COMPLETA DE NOTIFICAÇÕES EM DROPDOWN COM FILTROS E AÇÕES   */}
                {/* ================================================================= */}
                <div className="space-y-3 border-t border-[var(--border)] pt-5">
                  <div
                    onClick={() => setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen)}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-2">
                      <Bell size={14} className="text-[var(--accent)]" />
                      <span className="text-[10px] font-mono font-semibold tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--foreground)] uppercase transition-colors">
                        {isEnglish ? 'NOTIFICATION FEED' : 'CENTRAL DE NOTIFICAÇÕES'}
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-[9px] font-bold font-mono">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isNotificationsDropdownOpen ? (
                        <ChevronUp size={15} className="text-[var(--text-tertiary)] group-hover:text-[var(--foreground)]" />
                      ) : (
                        <ChevronDown size={15} className="text-[var(--text-tertiary)] group-hover:text-[var(--foreground)]" />
                      )}
                    </div>
                  </div>

                  {/* Dropdown Content */}
                  {isNotificationsDropdownOpen && (
                    <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                      {/* Sub-header com filtros e ação */}
                      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-[10px] font-mono">
                        <div className="flex items-center gap-1 shrink-0">
                          {[
                            { id: 'all', label: isEnglish ? 'All' : 'Todas' },
                            { id: 'alert', label: isEnglish ? 'Alerts' : 'Alertas' },
                            { id: 'system', label: isEnglish ? 'System' : 'Sistema' },
                            { id: 'renewal', label: isEnglish ? 'Credits' : 'Créditos' },
                            { id: 'promo', label: isEnglish ? 'Promos' : 'Ofertas' },
                          ].map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setSelectedNotifFilter(f.id as any)}
                              className={`px-2 py-0.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                                selectedNotifFilter === f.id
                                  ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent font-bold'
                                  : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllAsRead}
                            className="text-[10px] font-mono text-[var(--accent)] hover:underline cursor-pointer shrink-0"
                          >
                            {isEnglish ? 'Mark read' : 'Marcar lidas'}
                          </button>
                        )}
                      </div>

                      {/* Lista de Notificações */}
                      <div className="space-y-2">
                        {filteredNotifications.length === 0 ? (
                          <p className="text-[11px] text-[var(--text-secondary)] font-mono py-3 text-center">
                            {isEnglish ? 'No notifications in this filter.' : 'Nenhuma notificação neste filtro.'}
                          </p>
                        ) : (
                          filteredNotifications.map((notif) => {
                            const isRead = readNotifIds.has(notif.id);
                            return (
                              <div
                                key={notif.id}
                                className={`p-3 rounded-xl border transition-all text-xs ${
                                  isRead
                                    ? 'bg-[var(--surface-2)]/40 border-[var(--border)] opacity-75'
                                    : 'bg-[var(--surface-2)] border-[var(--accent)]/40 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {!isRead && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                                    )}
                                    <h4 className="font-semibold text-[var(--foreground)] text-xs truncate">
                                      {notif.title}
                                    </h4>
                                  </div>
                                  <span className="text-[9px] font-mono text-[var(--text-tertiary)] shrink-0">
                                    {notif.time}
                                  </span>
                                </div>

                                <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                                  {notif.description}
                                </p>

                                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--border)]/50">
                                  <button
                                    type="button"
                                    onClick={notif.action}
                                    className="text-[10px] font-mono font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>{notif.quickActionLabel}</span>
                                    <ExternalLink size={10} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleReadStatus(notif.id)}
                                    className="text-[9px] font-mono text-[var(--text-tertiary)] hover:text-[var(--foreground)] cursor-pointer"
                                  >
                                    {isRead ? (isEnglish ? 'Mark unread' : 'Marcar não lida') : (isEnglish ? 'Mark read' : 'Marcar lida')}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ================================================================= */}
                {/* SESSÃO 2: BACKUPS E SINCRONIZAÇÃO NUVEM                           */}
                {/* ================================================================= */}
                <div className="space-y-4 border-t border-[var(--border)] pt-5">
                  <span className="block text-[10px] font-mono font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                    {isEnglish ? 'BACKUP & SECURITY SYNC' : 'BACKUP & SINCRONIZAÇÃO'}
                  </span>

                  <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
                    {/* Google Cloud Sync */}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Cloud size={16} className="text-[var(--accent)] shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-[var(--foreground)]">
                            {isEnglish ? 'Google Cloud Sync' : 'Sincronização Nuvem Google'}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono">{email}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={backupDrive}
                        onClick={() => void toggleBackup('backupGoogleDrive', backupDrive)}
                        className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          backupDrive ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                            backupDrive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Local Storage Copy */}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <HardDrive size={16} className="text-[var(--accent)] shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-[var(--foreground)]">
                            {isEnglish ? 'Local Storage Sync' : 'Cópia Segura no Dispositivo'}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                            {isEnglish ? 'Encrypted local cache' : 'Cache local encriptado'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={backupLocal}
                        onClick={() => void toggleBackup('backupLocal', backupLocal)}
                        className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          backupLocal ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                            backupLocal ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* SESSÃO 3: DETALHES CADASTRAIS DO PERFIL EDITÁVEL COM ÍCONE DE EDIÇÃO */}
                {/* ================================================================= */}
                {profile && (
                  <div className="space-y-3 border-t border-[var(--border)] pt-5">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] font-mono font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                        {isEnglish ? 'ACCOUNT DETAILS' : 'DETALHES DO PERFIL'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfileDetails(!isEditingProfileDetails)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-[11px] font-mono text-[var(--accent)] transition-colors cursor-pointer"
                        title={isEditingProfileDetails ? (isEnglish ? 'Cancel editing' : 'Cancelar edição') : (isEnglish ? 'Edit details' : 'Editar dados')}
                      >
                        <Edit2 size={12} />
                        <span>{isEditingProfileDetails ? (isEnglish ? 'Cancel' : 'Cancelar') : (isEnglish ? 'Edit' : 'Editar')}</span>
                      </button>
                    </div>

                    {isEditingProfileDetails ? (
                      <div className="p-3.5 rounded-xl border border-[var(--accent)]/40 bg-[var(--surface-2)] space-y-3 text-xs animate-in fade-in duration-150">
                        {/* Nome Completo */}
                        <div>
                          <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                            {isEnglish ? 'Full Name' : 'Nome Completo'}
                          </label>
                          <input
                            type="text"
                            value={profileDraft.fullName}
                            onChange={(e) => setProfileDraft({ ...profileDraft, fullName: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-xs focus:border-[var(--accent)] outline-none"
                          />
                        </div>

                        {/* Nome Preferido */}
                        <div>
                          <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                            {isEnglish ? 'Preferred Name / Nickname' : 'Nome Preferido / Apelido'}
                          </label>
                          <input
                            type="text"
                            value={profileDraft.preferredName}
                            onChange={(e) => setProfileDraft({ ...profileDraft, preferredName: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-xs focus:border-[var(--accent)] outline-none"
                          />
                        </div>

                        {/* Data de Nascimento */}
                        <div>
                          <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                            {isEnglish ? 'Birth Date (Day / Month / Year)' : 'Data de Nascimento (Dia / Mês / Ano)'}
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="DD"
                              maxLength={2}
                              value={profileDraft.birthDay}
                              onChange={(e) => setProfileDraft({ ...profileDraft, birthDay: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-xs text-center font-mono focus:border-[var(--accent)] outline-none"
                            />
                            <input
                              type="text"
                              placeholder="MM"
                              maxLength={2}
                              value={profileDraft.birthMonth}
                              onChange={(e) => setProfileDraft({ ...profileDraft, birthMonth: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-xs text-center font-mono focus:border-[var(--accent)] outline-none"
                            />
                            <input
                              type="text"
                              placeholder="AAAA"
                              maxLength={4}
                              value={profileDraft.birthYear}
                              onChange={(e) => setProfileDraft({ ...profileDraft, birthYear: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-xs text-center font-mono focus:border-[var(--accent)] outline-none"
                            />
                          </div>
                        </div>

                        {/* Horário */}
                        <div>
                          <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                            {isEnglish ? 'Birth Time (Hour : Min)' : 'Horário de Nascimento (Hora : Min)'}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="HH"
                              maxLength={2}
                              disabled={profileDraft.noExactTime}
                              value={profileDraft.birthHour}
                              onChange={(e) => setProfileDraft({ ...profileDraft, birthHour: e.target.value })}
                              className="w-16 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-xs text-center font-mono focus:border-[var(--accent)] outline-none disabled:opacity-50"
                            />
                            <span className="font-mono text-xs">:</span>
                            <input
                              type="text"
                              placeholder="MM"
                              maxLength={2}
                              disabled={profileDraft.noExactTime}
                              value={profileDraft.birthMinute}
                              onChange={(e) => setProfileDraft({ ...profileDraft, birthMinute: e.target.value })}
                              className="w-16 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-xs text-center font-mono focus:border-[var(--accent)] outline-none disabled:opacity-50"
                            />
                            <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] ml-auto cursor-pointer">
                              <input
                                type="checkbox"
                                checked={profileDraft.noExactTime}
                                onChange={(e) => setProfileDraft({ ...profileDraft, noExactTime: e.target.checked })}
                                className="rounded accent-[var(--accent)]"
                              />
                              <span>{isEnglish ? 'Exact time unknown' : 'Não sei a hora'}</span>
                            </label>
                          </div>
                        </div>

                        {/* Localidade de Nascimento e País Atual */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                              {isEnglish ? 'Birth City' : 'Cidade de Origem'}
                            </label>
                            <input
                              type="text"
                              value={profileDraft.birthCity}
                              onChange={(e) => setProfileDraft({ ...profileDraft, birthCity: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-xs focus:border-[var(--accent)] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                              {isEnglish ? 'Birth Country' : 'País de Origem'}
                            </label>
                            <input
                              type="text"
                              value={profileDraft.birthCountry}
                              onChange={(e) => setProfileDraft({ ...profileDraft, birthCountry: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-xs focus:border-[var(--accent)] outline-none"
                            />
                          </div>
                        </div>

                        {/* País Atual (Residência / Moeda) */}
                        <div>
                          <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                            {isEnglish ? 'Current Residence Country (for currency)' : 'País Atual de Residência (para moedas)'}
                          </label>
                          <input
                            type="text"
                            value={profileDraft.currentCountry}
                            onChange={(e) => setProfileDraft({ ...profileDraft, currentCountry: e.target.value })}
                            placeholder="Brasil, USA, Portugal, etc."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-xs focus:border-[var(--accent)] outline-none"
                          />
                        </div>

                        {/* Ações de Salvar e Cancelar */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                          <button
                            type="button"
                            onClick={() => setIsEditingProfileDetails(false)}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                          >
                            {isEnglish ? 'Cancel' : 'Cancelar'}
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveProfileDetails}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-xs font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                          >
                            <Save size={13} />
                            <span>{isEnglish ? 'Save Changes' : 'Salvar Alterações'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-[var(--border)] border-y border-[var(--border)] text-xs">
                        <div className="flex justify-between py-2.5">
                          <span className="text-[var(--text-secondary)]">{isEnglish ? 'Full Name' : 'Nome Completo'}</span>
                          <span className="font-medium text-[var(--foreground)]">{profile.fullName}</span>
                        </div>
                        {profile.preferredName && (
                          <div className="flex justify-between py-2.5">
                            <span className="text-[var(--text-secondary)]">{isEnglish ? 'Preferred Name' : 'Nome Preferido'}</span>
                            <span className="font-medium text-[var(--foreground)]">{profile.preferredName}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2.5">
                          <span className="text-[var(--text-secondary)]">{isEnglish ? 'Birth Date' : 'Data de Nascimento'}</span>
                          <span className="font-mono text-[var(--foreground)]">{`${profile.birthDay}/${profile.birthMonth}/${profile.birthYear}`}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                          <span className="text-[var(--text-secondary)]">{isEnglish ? 'Birth Time' : 'Horário'}</span>
                          <span className="font-mono text-[var(--foreground)]">
                            {profile.noExactTime ? (isEnglish ? 'Not provided' : 'Não informado') : `${profile.birthHour}:${profile.birthMinute}`}
                          </span>
                        </div>
                        <div className="flex justify-between py-2.5">
                          <span className="text-[var(--text-secondary)]">{isEnglish ? 'Birth Place' : 'Local de Origem'}</span>
                          <span className="text-[var(--foreground)]">{`${profile.birthCity}, ${profile.birthCountry}`}</span>
                        </div>
                        {profile.currentCountry && (
                          <div className="flex justify-between py-2.5">
                            <span className="text-[var(--text-secondary)]">{isEnglish ? 'Current Residence' : 'País Atual'}</span>
                            <span className="text-[var(--foreground)] font-semibold">{profile.currentCountry}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Sign Out Button in Slide Panel */}
              <div className="border-t border-[var(--border)] p-4 bg-[var(--surface)] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen(false);
                    onSignOut();
                  }}
                  className="flex w-full items-center justify-center gap-2 py-2.5 text-xs font-semibold text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>{isEnglish ? 'Sign out from Orb' : 'Sair da conta Orb'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Unificado de Adicionar / Editar Perfil e Evento */}
      <AddOrEditProfileEventModal
        isOpen={isAddOrEditModalOpen}
        onClose={() => setIsAddOrEditModalOpen(false)}
        initialMode={modalMode}
        initialType={modalInitialType}
        editingProfile={editingProfile}
        editingEvent={editingEvent}
        onSaveProfile={handleSaveProfileModal}
        onSaveEvent={handleSaveEventModal}
        isEnglish={isEnglish}
      />

      {/* ========================================================================= */}
      {/* 5. SYSTEM SLIDE DRAWER                                                    */}
      {/* ========================================================================= */}
      <SystemSlideDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProfile={() => setMenuOpen(false)}
        onOpenWallet={onOpenWallet || (() => {})}
        onOpenNotifications={onOpenNotifications || (() => {})}
        onOpenDailyJournal={onOpenDailyJournal}
        onOpenNeuroacustica={onOpenNeuroacustica}
        onOpenCatalog={onOpenCatalog}
        onOpenChat={onOpenChat}
        activeScreen="profile"
        onSignOut={onSignOut}
        isEnglish={isEnglish}
      />

      {/* Terms & Support Modal */}
      {termsModalType && (
        <TermsSupportModal
          type={termsModalType}
          onClose={() => setTermsModalType(null)}
          isEnglish={isEnglish}
        />
      )}
    </div>
  );
}
