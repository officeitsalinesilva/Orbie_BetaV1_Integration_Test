import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  CalendarPlus,
  User,
  Heart,
  Sparkles,
  Briefcase,
  Building2,
  Flame,
  Award,
  Compass,
  ShieldCheck,
  Moon,
  Sun,
  Star,
  Crown,
  Globe,
  Calendar,
  Clock,
  MapPin,
  Bell,
  Settings,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { AdditionalProfile, RegisteredEvent } from '../../types';

export const PROFILE_EVENT_ICONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'user', label: 'Pessoa / Usuário', icon: User },
  { id: 'heart', label: 'Coração / Afeto', icon: Heart },
  { id: 'sparkles', label: 'Alquimia / Brilho', icon: Sparkles },
  { id: 'briefcase', label: 'Negócios / Sócio', icon: Briefcase },
  { id: 'building', label: 'Empresa / Fundação', icon: Building2 },
  { id: 'flame', label: 'Fogo / Propósito', icon: Flame },
  { id: 'award', label: 'Marco / Conquista', icon: Award },
  { id: 'compass', label: 'Direção / Viagem', icon: Compass },
  { id: 'shield', label: 'Proteção / Guardião', icon: ShieldCheck },
  { id: 'sun', label: 'Sol / Vitalidade', icon: Sun },
  { id: 'moon', label: 'Lua / Intuição', icon: Moon },
  { id: 'star', label: 'Estrela / Destino', icon: Star },
  { id: 'crown', label: 'Liderança / Soberania', icon: Crown },
  { id: 'globe', label: 'Global / Expansão', icon: Globe },
];

export function getProfileEventIcon(iconId?: string, isEvent: boolean = false): LucideIcon {
  if (!iconId) {
    return isEvent ? Building2 : User;
  }
  const match = PROFILE_EVENT_ICONS.find((item) => item.id === iconId);
  return match ? match.icon : isEvent ? Building2 : User;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'create' | 'edit';
  initialType?: 'person' | 'event';
  editingProfile?: AdditionalProfile | null;
  editingEvent?: RegisteredEvent | null;
  onSaveProfile: (data: Omit<AdditionalProfile, 'id' | 'createdAt' | 'completeness' | 'unlockedItems'>, editId?: string) => void;
  onSaveEvent: (data: Omit<RegisteredEvent, 'id' | 'createdAt' | 'completeness' | 'unlockedItems'>, editId?: string) => void;
  isEnglish?: boolean;
}

export function AddOrEditProfileEventModal({
  isOpen,
  onClose,
  initialMode = 'create',
  initialType = 'person',
  editingProfile = null,
  editingEvent = null,
  onSaveProfile,
  onSaveEvent,
  isEnglish = false,
}: Props) {
  const [targetType, setTargetType] = useState<'person' | 'event'>(
    editingEvent ? 'event' : editingProfile ? 'person' : initialType
  );
  const [nameOrTitle, setNameOrTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('user');
  const [relation, setRelation] = useState<'partner' | 'child' | 'business' | 'family' | 'other'>('partner');
  const [category, setCategory] = useState<'business' | 'marriage' | 'relocation' | 'milestone' | 'historical' | 'other'>('business');
  const [day, setDay] = useState('14');
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('1994');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('00');
  const [cityOrLocation, setCityOrLocation] = useState('São Paulo, SP');
  const [description, setDescription] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [notifyDailyWindows, setNotifyDailyWindows] = useState(true);
  const [notifyRiskAlerts, setNotifyRiskAlerts] = useState(true);
  const [notifyDailySynthesis, setNotifyDailySynthesis] = useState(true);
  const [notifyCreditRenewals, setNotifyCreditRenewals] = useState(true);
  const [notifyPromosAndCoupons, setNotifyPromosAndCoupons] = useState(false);
  const [notifyDeliveryTime, setNotifyDeliveryTime] = useState('08:00');

  useEffect(() => {
    if (editingEvent) {
      setTargetType('event');
      setNameOrTitle(editingEvent.title || '');
      setSelectedIcon(editingEvent.icon || 'building');
      setCategory((editingEvent.category as any) || 'business');
      setDay(editingEvent.eventDay || '01');
      setMonth(editingEvent.eventMonth || '01');
      setYear(editingEvent.eventYear || '2024');
      setHour(editingEvent.eventHour || '10');
      setMinute(editingEvent.eventMinute || '00');
      setCityOrLocation(editingEvent.location || 'São Paulo, SP');
      setDescription(editingEvent.description || '');
      setNotifyEnabled(editingEvent.notifyEnabled ?? true);
      setNotifyDailyWindows(editingEvent.notificationSettings?.dailyWindows ?? true);
      setNotifyRiskAlerts(editingEvent.notificationSettings?.riskAlerts ?? true);
      setNotifyDailySynthesis(editingEvent.notificationSettings?.dailySynthesis ?? true);
      setNotifyCreditRenewals(editingEvent.notificationSettings?.creditRenewals ?? true);
      setNotifyPromosAndCoupons(editingEvent.notificationSettings?.promosAndCoupons ?? false);
      setNotifyDeliveryTime(editingEvent.deliveryTime || editingEvent.notificationSettings?.deliverySchedule || '08:00');
    } else if (editingProfile) {
      setTargetType('person');
      setNameOrTitle(editingProfile.name || editingProfile.fullName || '');
      setSelectedIcon(editingProfile.icon || 'user');
      setRelation((editingProfile.relation as any) || 'partner');
      setDay(editingProfile.birthDay || '01');
      setMonth(editingProfile.birthMonth || '01');
      setYear(editingProfile.birthYear || '1995');
      setHour(editingProfile.birthHour || '12');
      setMinute(editingProfile.birthMinute || '00');
      setCityOrLocation(editingProfile.birthCity || 'São Paulo, SP');
      setDescription(editingProfile.description || editingProfile.bio || '');
      setNotifyEnabled(editingProfile.notifyEnabled ?? true);
      setNotifyDailyWindows(editingProfile.notificationSettings?.dailyWindows ?? true);
      setNotifyRiskAlerts(editingProfile.notificationSettings?.riskAlerts ?? true);
      setNotifyDailySynthesis(editingProfile.notificationSettings?.dailySynthesis ?? true);
      setNotifyCreditRenewals(editingProfile.notificationSettings?.creditRenewals ?? true);
      setNotifyPromosAndCoupons(editingProfile.notificationSettings?.promosAndCoupons ?? false);
      setNotifyDeliveryTime(editingProfile.deliveryTime || editingProfile.notificationSettings?.deliverySchedule || '08:00');
    } else {
      setTargetType(initialType);
      setNameOrTitle('');
      setSelectedIcon(initialType === 'event' ? 'building' : 'user');
      setRelation('partner');
      setCategory('business');
      setDay('15');
      setMonth('06');
      setYear('1995');
      setHour('10');
      setMinute('00');
      setCityOrLocation('São Paulo, SP');
      setDescription('');
      setNotifyEnabled(true);
      setNotifyDailyWindows(true);
      setNotifyRiskAlerts(true);
      setNotifyDailySynthesis(true);
      setNotifyCreditRenewals(true);
      setNotifyPromosAndCoupons(false);
      setNotifyDeliveryTime('08:00');
    }
  }, [isOpen, editingProfile, editingEvent, initialType]);

  if (!isOpen) return null;

  const isEdit = initialMode === 'edit' || !!editingProfile || !!editingEvent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameOrTitle.trim() || !cityOrLocation.trim()) return;

    const notifSettings = {
      dailyWindows: notifyDailyWindows,
      riskAlerts: notifyRiskAlerts,
      dailySynthesis: notifyDailySynthesis,
      creditRenewals: notifyCreditRenewals,
      promosAndCoupons: notifyPromosAndCoupons,
      deliverySchedule: notifyDeliveryTime,
    };

    if (targetType === 'person') {
      onSaveProfile(
        {
          name: nameOrTitle.trim(),
          fullName: nameOrTitle.trim(),
          icon: selectedIcon,
          relation,
          relationship: relation,
          birthDay: day,
          birthMonth: month,
          birthYear: year,
          birthHour: hour,
          birthMinute: minute,
          birthCity: cityOrLocation.trim(),
          description: description.trim() || undefined,
          bio: description.trim() || undefined,
          notifyEnabled,
          notificationSettings: notifSettings,
          deliveryTime: notifyDeliveryTime,
        },
        editingProfile?.id
      );
    } else {
      onSaveEvent(
        {
          title: nameOrTitle.trim(),
          icon: selectedIcon,
          category,
          eventDay: day,
          eventMonth: month,
          eventYear: year,
          eventHour: hour,
          eventMinute: minute,
          location: cityOrLocation.trim(),
          description: description.trim() || undefined,
          notifyEnabled,
          notificationSettings: notifSettings,
          deliveryTime: notifyDeliveryTime,
        },
        editingEvent?.id
      );
    }
    onClose();
  };

  const personRelations = [
    { id: 'partner', label: isEnglish ? 'Partner / Spouse' : 'Parceiro(a) / Cônjuge' },
    { id: 'child', label: isEnglish ? 'Child / Offspring' : 'Filho(a) / Criança' },
    { id: 'business', label: isEnglish ? 'Business Partner' : 'Sócio(a) / Negócios' },
    { id: 'family', label: isEnglish ? 'Family Member' : 'Familiar / Parente' },
    { id: 'other', label: isEnglish ? 'Other Connection' : 'Outro Perfil' },
  ] as const;

  const eventCategories = [
    { id: 'business', label: isEnglish ? 'Company / Business' : 'Empresa / Negócio' },
    { id: 'marriage', label: isEnglish ? 'Marriage / Union' : 'Casamento / União' },
    { id: 'milestone', label: isEnglish ? 'Milestone / Launch' : 'Marco / Lançamento' },
    { id: 'relocation', label: isEnglish ? 'Move / Relocation' : 'Mudança / Viagem' },
    { id: 'historical', label: isEnglish ? 'Historic Event' : 'Histórico / Registro' },
  ] as const;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface-2)]/50 shrink-0">
          <div className="flex items-center gap-2">
            {targetType === 'event' ? (
              <CalendarPlus size={18} className="text-[var(--accent)]" />
            ) : (
              <UserPlus size={18} className="text-[var(--accent)]" />
            )}
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              {isEdit
                ? targetType === 'event'
                  ? isEnglish ? 'Edit Event Data' : 'Configurações do Evento'
                  : isEnglish ? 'Edit Profile Data' : 'Configurações do Perfil'
                : targetType === 'event'
                ? isEnglish ? 'Add Event' : 'Adicionar Novo Evento'
                : isEnglish ? 'Add Additional Profile' : 'Adicionar Perfil Adicional'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isEnglish ? 'Close' : 'Fechar'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Seletor Tipo: Pessoa vs Evento (Apenas quando criando) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
                {isEnglish ? 'Scope Type' : 'Tipo de Cadastro'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('person');
                    setSelectedIcon('user');
                  }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                    targetType === 'person'
                      ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent shadow-2xs'
                      : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <User size={15} />
                  <span>{isEnglish ? 'Person / Profile' : 'Pessoa / Perfil'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetType('event');
                    setSelectedIcon('building');
                  }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                    targetType === 'event'
                      ? 'bg-blue-600 text-white border-transparent shadow-2xs'
                      : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Building2 size={15} />
                  <span>{isEnglish ? 'Event / Milestone' : 'Evento / Marco'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Nome / Título */}
          <div className="space-y-1.5">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {targetType === 'event'
                ? isEnglish ? 'Event Title / Name' : 'Título do Evento / Razão'
                : isEnglish ? 'Full Name' : 'Nome Completo'} *
            </label>
            <input
              type="text"
              required
              value={nameOrTitle}
              onChange={(e) => setNameOrTitle(e.target.value)}
              placeholder={
                targetType === 'event'
                  ? isEnglish ? 'e.g. Orb Tech Foundation' : 'ex: Fundação Orb Tech ou Casamento'
                  : isEnglish ? 'e.g. Lucas Silva' : 'ex: Lucas Silva'
              }
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Seletor de Ícone Customizável */}
          <div className="space-y-1.5">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {isEnglish ? 'Custom Icon' : 'Ícone Representativo'}
            </label>
            <div className="grid grid-cols-7 gap-2 p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50">
              {PROFILE_EVENT_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => setSelectedIcon(item.id)}
                    className={`flex items-center justify-center p-2 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent)] text-[var(--accent-foreground)] scale-105 shadow-2xs font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <IconComponent size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Relação / Categoria */}
          <div className="space-y-1.5">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {targetType === 'event'
                ? isEnglish ? 'Category' : 'Categoria do Evento'
                : isEnglish ? 'Relationship / Role' : 'Parentesco / Relação'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {targetType === 'person'
                ? personRelations.map((rel) => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => setRelation(rel.id)}
                      className={`p-2 rounded-xl border text-[11px] font-mono transition-all cursor-pointer truncate ${
                        relation === rel.id
                          ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent font-bold shadow-2xs'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {rel.label}
                    </button>
                  ))
                : eventCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-xl border text-[11px] font-mono transition-all cursor-pointer truncate ${
                        category === cat.id
                          ? 'bg-blue-600 text-white border-transparent font-bold shadow-2xs'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
            </div>
          </div>

          {/* Data e Hora */}
          <div className="space-y-2">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {targetType === 'event'
                ? isEnglish ? 'Event Date & Time' : 'Data e Hora do Evento'
                : isEnglish ? 'Birth Date & Time' : 'Data e Hora de Nascimento'}
            </label>
            <div className="grid grid-cols-5 gap-2">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">{isEnglish ? 'Day' : 'Dia'}</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) => setDay(e.target.value.padStart(2, '0'))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">{isEnglish ? 'Month' : 'Mês'}</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => setMonth(e.target.value.padStart(2, '0'))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">{isEnglish ? 'Year' : 'Ano'}</span>
                <input
                  type="number"
                  min="1900"
                  max="2050"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">{isEnglish ? 'Hour' : 'Hora'}</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) => setHour(e.target.value.padStart(2, '0'))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">{isEnglish ? 'Min' : 'Min'}</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value.padStart(2, '0'))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Local / Cidade */}
          <div className="space-y-1.5">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {targetType === 'event'
                ? isEnglish ? 'Event Location / City' : 'Localidade / Cidade do Evento'
                : isEnglish ? 'Birth City / Location' : 'Cidade de Nascimento'} *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={cityOrLocation}
                onChange={(e) => setCityOrLocation(e.target.value)}
                placeholder={isEnglish ? 'e.g. São Paulo, SP - Brasil' : 'ex: São Paulo, SP - Brasil'}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] pl-8 pr-3 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
              <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            </div>
          </div>

          {/* Descrição / Bio / Observações */}
          <div className="space-y-1.5">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {isEnglish ? 'Description / Strategic Notes' : 'Descrição / Notas Estratégicas'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                targetType === 'event'
                  ? isEnglish ? 'Objective, milestones, key stakeholders...' : 'Objetivo do evento, sócios, metas estratégicas...'
                  : isEnglish ? 'Personal traits, notes, synastry focus...' : 'Notas sobre o perfil, afinidades, foco da análise...'
              }
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none resize-none"
            />
          </div>

          {/* Notificações em Nome deste Perfil / Evento */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--surface)] text-[var(--accent)] mt-0.5">
                  <Bell size={16} />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-xs text-[var(--foreground)]">
                    {isEnglish ? 'Enable Notifications for this profile/event' : 'Habilitar Notificações em nome deste perfil'}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                    {isEnglish
                      ? 'Receive daily alerts, planetary hours and risk reminders personalized for this profile alongside your main feed.'
                      : 'Receber alertas, sínteses diárias e janelas de ritmo com o nome deste perfil junto das notificações padrão.'}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={notifyEnabled}
                  onChange={(e) => setNotifyEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]" />
              </label>
            </div>

            {/* Configuração Detalhada de Todos os Tipos de Notificações e Horário */}
            {notifyEnabled && (
              <div className="pt-3 border-t border-[var(--border)] space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    {isEnglish ? 'Notification Types & Toggles' : 'Tipos de Notificações Disponíveis'}
                  </span>
                  <span className="text-[9px] font-mono text-[var(--accent)] font-semibold">
                    {isEnglish ? 'PERSONALIZED' : 'PERSONALIZADO'}
                  </span>
                </div>

                {/* 1. Janelas do Dia */}
                <div className="flex items-center justify-between py-2 border-b border-[var(--border)]/50">
                  <div className="pr-2">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Daily Windows & Schedule' : 'Janelas do Dia & Horas Planetárias'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Period transitions in background' : 'Notifica viradas de período no segundo plano'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyDailyWindows}
                    onClick={() => setNotifyDailyWindows(!notifyDailyWindows)}
                    className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyDailyWindows ? 'bg-[var(--accent)]' : 'bg-[var(--surface)]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                        notifyDailyWindows ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Riscos e Trânsitos */}
                <div className="flex items-center justify-between py-2 border-b border-[var(--border)]/50">
                  <div className="pr-2">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Risk Reminders & Transits' : 'Alertas de Riscos e Trânsitos'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Caution aspects and tension windows' : 'Aspectos de cautela e tensão planetária'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyRiskAlerts}
                    onClick={() => setNotifyRiskAlerts(!notifyRiskAlerts)}
                    className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyRiskAlerts ? 'bg-[var(--accent)]' : 'bg-[var(--surface)]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                        notifyRiskAlerts ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Síntese Diária */}
                <div className="flex items-center justify-between py-2 border-b border-[var(--border)]/50">
                  <div className="pr-2">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Daily Synthesis & Alchemy' : 'Síntese Diária & Alquimia'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Executive focal summary for entity' : 'Resumo executivo e pontos focais do dia'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyDailySynthesis}
                    onClick={() => setNotifyDailySynthesis(!notifyDailySynthesis)}
                    className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyDailySynthesis ? 'bg-[var(--accent)]' : 'bg-[var(--surface)]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                        notifyDailySynthesis ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Renovações de Créditos */}
                <div className="flex items-center justify-between py-2 border-b border-[var(--border)]/50">
                  <div className="pr-2">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Credit Renewals & Balance' : 'Renovação de Créditos e Saldo'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Balance refills & dossier alerts' : 'Notificações de recarga diária e saldo'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyCreditRenewals}
                    onClick={() => setNotifyCreditRenewals(!notifyCreditRenewals)}
                    className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyCreditRenewals ? 'bg-[var(--accent)]' : 'bg-[var(--surface)]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                        notifyCreditRenewals ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Promoções & Convites */}
                <div className="flex items-center justify-between py-2 border-b border-[var(--border)]/50">
                  <div className="pr-2">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Promos, Coupons & Rewards' : 'Promoções, Cupons & Convites'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Special releases and reward bonuses' : 'Liberação de cupons QR e bônus'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyPromosAndCoupons}
                    onClick={() => setNotifyPromosAndCoupons(!notifyPromosAndCoupons)}
                    className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyPromosAndCoupons ? 'bg-[var(--accent)]' : 'bg-[var(--surface)]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                        notifyPromosAndCoupons ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 6. Horário Programado */}
                <div className="pt-2 flex items-center justify-between bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[var(--accent)]" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--foreground)]">
                        {isEnglish ? 'Scheduled Delivery Time' : 'Horário Programado'}
                      </p>
                      <p className="text-[9px] text-[var(--text-secondary)] font-mono">
                        {isEnglish ? 'Delivery schedule for alerts' : 'Horário de envio dos alertas em segundo plano'}
                      </p>
                    </div>
                  </div>
                  <input
                    type="time"
                    value={notifyDeliveryTime}
                    onChange={(e) => setNotifyDeliveryTime(e.target.value)}
                    className="bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs font-mono focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] py-3 text-xs font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              <Check size={16} />
              <span>
                {isEdit
                  ? isEnglish ? 'Save Settings' : 'Salvar Alterações'
                  : targetType === 'event'
                  ? isEnglish ? 'Register Event' : 'Cadastrar Evento'
                  : isEnglish ? 'Save Profile' : 'Cadastrar Perfil'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
