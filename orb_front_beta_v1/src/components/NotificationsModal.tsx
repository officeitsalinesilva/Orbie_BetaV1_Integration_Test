import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  X,
  Clock,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Gift,
  Check,
  Settings,
  Sliders,
  PanelRightClose,
  Filter,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { useOrb } from '../context/OrbContext';
import { NotificationToggleSettings } from '../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToData?: () => void;
  onOpenWallet?: () => void;
  onOpenCatalog?: () => void;
  isEnglish?: boolean;
};

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'alert' | 'promo' | 'system' | 'renewal';
  quickActionLabel: string;
  action?: () => void;
}

export function NotificationsModal({
  isOpen,
  onClose,
  onNavigateToData,
  onOpenWallet,
  onOpenCatalog,
  isEnglish = false,
}: Props) {
  const { preferences, notificationSettings, saveNotificationSettings } = useOrb();
  const [filter, setFilter] = useState<'all' | 'alert' | 'promo' | 'system' | 'renewal'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set(['notif-5']));
  const [isSettingsSlideOpen, setIsSettingsSlideOpen] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState(notificationSettings.deliverySchedule || '08:00');
  const filterDropdownRef = useRef<HTMLDivElement | null>(null);

  const [notificationList, setNotificationList] = useState<NotificationItem[]>([
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
        onClose();
        onNavigateToData?.();
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
        onClose();
        onNavigateToData?.();
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
        onClose();
        onNavigateToData?.();
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
        onClose();
        onNavigateToData?.();
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
        onClose();
        onOpenWallet?.();
      },
    },
    {
      id: 'notif-6',
      title: isEnglish ? 'Credits running low on balance' : 'Seus créditos estão perto do limite',
      description: isEnglish
        ? 'You have 14 credits remaining before next renewal.'
        : 'Seu saldo avulso de créditos está reduzido. Recarregue para consultas contínuas.',
      time: isEnglish ? 'Yesterday' : 'Ontem',
      type: 'renewal',
      quickActionLabel: isEnglish ? 'Recharge Credits' : 'Recarregar',
      action: () => {
        onClose();
        onOpenWallet?.();
      },
    },
    {
      id: 'notif-7',
      title: isEnglish ? 'Special Matrix Expansion: 20% Off' : 'Promoção Especial: Pacote Matriz 20% Off',
      description: isEnglish
        ? 'Unlock 500 bonus credits + 2 Dossier blueprints this week.'
        : 'Desbloqueie 500 créditos bônus e 2 mapas de arquétipos com condição especial.',
      time: isEnglish ? '2 days ago' : 'Há 2 dias',
      type: 'promo',
      quickActionLabel: isEnglish ? 'View Offer' : 'Ver Oferta',
      action: () => {
        onClose();
        onOpenCatalog?.();
      },
    },
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleToggleSetting = (key: keyof NotificationToggleSettings) => {
    saveNotificationSettings({
      [key]: !notificationSettings[key],
    });
  };

  const handleDeleteNotification = (id: string) => {
    setNotificationList((prev) => prev.filter((item) => item.id !== id));
  };

  const filtered = notificationList.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notificationList.filter((n) => !readIds.has(n.id)).length;

  const toggleRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filterOptions = [
    { id: 'all', label: isEnglish ? 'All Notifications' : 'Todas as Notificações', shortLabel: isEnglish ? 'All' : 'Todas' },
    { id: 'alert', label: isEnglish ? 'Alerts & Risks' : 'Alertas e Riscos', shortLabel: isEnglish ? 'Alerts' : 'Alertas' },
    { id: 'system', label: isEnglish ? 'System & Synthesis' : 'Sistema e Síntese', shortLabel: isEnglish ? 'System' : 'Sistema' },
    { id: 'renewal', label: isEnglish ? 'Renewals & Credits' : 'Renovação de Créditos', shortLabel: isEnglish ? 'Renewals' : 'Renovação' },
    { id: 'promo', label: isEnglish ? 'Promos & Rewards' : 'Promoções e Bônus', shortLabel: isEnglish ? 'Promos' : 'Promoções' },
  ] as const;

  const currentFilterLabel = filterOptions.find((f) => f.id === filter)?.shortLabel || (isEnglish ? 'All' : 'Todas');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[var(--accent)]" />
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              {isEnglish ? 'Notifications & Signals' : 'Notificações & Sinais'}
            </h2>
            {unreadCount > 0 && (
              <span className="ml-1 rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--accent)]">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Close modal button */}
            <button
              type="button"
              onClick={onClose}
              aria-label={isEnglish ? 'Close' : 'Fechar'}
              title={isEnglish ? 'Close' : 'Fechar'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sub-Header Toolbar: Filter dropdown on the Left, Settings icon on the Right */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-2.5 bg-[var(--surface-2)]/40 shrink-0">
          {/* Left: Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--foreground)] text-xs font-mono transition-colors cursor-pointer shadow-2xs"
            >
              <Filter size={13} className="text-[var(--accent)]" />
              <span>{currentFilterLabel}</span>
              <ChevronDown size={13} className={`text-[var(--text-tertiary)] transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 z-30 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[9px] font-mono text-[var(--text-tertiary)] uppercase font-bold tracking-wider border-b border-[var(--border)]/40 mb-1">
                  {isEnglish ? 'Filter By Category' : 'Filtrar Notificações'}
                </div>
                {filterOptions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFilter(f.id);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-left transition-colors cursor-pointer ${
                      filter === f.id
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-bold'
                        : 'text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <span>{f.label}</span>
                    {filter === f.id && <Check size={13} className="text-[var(--accent)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Settings Icon */}
          <button
            type="button"
            onClick={() => setIsSettingsSlideOpen(!isSettingsSlideOpen)}
            aria-label={isEnglish ? 'Notification Settings' : 'Configurações de Notificações'}
            title={isEnglish ? 'Notification Settings' : 'Configurações de Notificações'}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Sliders size={15} className="text-[var(--accent)]" />
          </button>
        </div>

        {/* Notification List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-[var(--text-tertiary)]">
              <CheckCircle2 size={32} className="mb-2 opacity-50 text-[var(--success)]" />
              <span>{isEnglish ? 'No notifications found' : 'Nenhuma notificação encontrada'}</span>
            </div>
          ) : (
            filtered.map((n) => {
              const isRead = readIds.has(n.id);

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isRead
                      ? 'border-[var(--border)] bg-[var(--surface)] opacity-70'
                      : 'border-[var(--accent)]/40 bg-[var(--surface-2)]/60 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="mt-0.5">
                        {n.type === 'alert' && <AlertTriangle size={15} className="text-amber-500 shrink-0" />}
                        {n.type === 'promo' && <Gift size={15} className="text-pink-500 shrink-0" />}
                        {n.type === 'renewal' && <RefreshCw size={15} className="text-emerald-500 shrink-0" />}
                        {n.type === 'system' && <Sparkles size={15} className="text-[var(--accent)] shrink-0" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold text-[var(--foreground)] leading-snug">
                          {n.title}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                          {n.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] whitespace-nowrap">
                        {n.time}
                      </span>
                      {/* Trash icon only */}
                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(n.id)}
                        aria-label={isEnglish ? 'Delete notification' : 'Excluir notificação'}
                        title={isEnglish ? 'Delete notification' : 'Excluir notificação'}
                        className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="mt-3 flex items-center justify-between border-t border-[var(--border)]/40 pt-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleRead(n.id)}
                      className="font-mono text-[10px] text-[var(--text-tertiary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      {isRead
                        ? isEnglish
                          ? 'Mark as unread'
                          : 'Marcar não lida'
                        : isEnglish
                        ? 'Mark as read'
                        : 'Marcar lida'}
                    </button>

                    {n.action && (
                      <button
                        type="button"
                        onClick={n.action}
                        className="flex items-center gap-1 font-mono text-[11px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
                      >
                        <span>{n.quickActionLabel}</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ======================================================================= */}
        {/* SLIDE OVERLAY FOR NOTIFICATION SETTINGS & SCHEDULE (IN TOP-RIGHT)       */}
        {/* ======================================================================= */}
        {isSettingsSlideOpen && (
          <div className="absolute inset-0 z-20 bg-[var(--surface)] flex flex-col animate-in slide-in-from-right duration-250">
            {/* Header of Settings Slide */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface-2)] shrink-0">
              <div className="flex items-center gap-2">
                <Sliders size={17} className="text-[var(--accent)]" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  {isEnglish ? 'Notification Preferences' : 'Preferências de Notificação'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsSlideOpen(false)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
              >
                <PanelRightClose size={18} />
              </button>
            </div>

            {/* Toggles & Scheduling list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                {isEnglish
                  ? 'Configure which alert types are delivered in the background and choose your preferred delivery schedule.'
                  : 'Habilite ou desabilite tipos específicos de alertas emitidos no app e em segundo plano nos horários programados.'}
              </p>

              <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {/* Janelas do Dia */}
                <div className="flex items-center justify-between py-3">
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Daily Windows & Schedule' : 'Janelas do Dia & Horas Planetárias'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Window transitions in background' : 'Notifica viradas de janela no segundo plano'}
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

                {/* Riscos e Trânsitos */}
                <div className="flex items-center justify-between py-3">
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Risk Reminders & Transits' : 'Alertas de Riscos e Trânsitos'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Tension aspects and precautions' : 'Aspectos de cautela e tensão planetária'}
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

                {/* Síntese Diária */}
                <div className="flex items-center justify-between py-3">
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Daily Synthesis' : 'Síntese Diária & Alquimia'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Morning sovereign focal points' : 'Resumo matinal e pontos focais'}
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

                {/* Renovações e Créditos */}
                <div className="flex items-center justify-between py-3">
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Credit Renewals & Balance' : 'Renovação de Créditos e Saldo'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Daily credit deposit notifications' : 'Notificação de recarga diária (+10 ◎)'}
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

                {/* Promoções e Cupons */}
                <div className="flex items-center justify-between py-3">
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Promos, Coupons & Rewards' : 'Promoções, Cupons & Convites'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Daily QR coupon releases & referral bonuses' : 'Liberação de cupons QR e bônus'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationSettings.promosAndCoupons}
                    onClick={() => handleToggleSetting('promosAndCoupons')}
                    className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notificationSettings.promosAndCoupons ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                        notificationSettings.promosAndCoupons ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Delivery Time Selection */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[var(--accent)]" />
                    <span className="text-xs font-semibold text-[var(--foreground)]">
                      {isEnglish ? 'Scheduled Delivery Time' : 'Horário Programado'}
                    </span>
                  </div>
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => {
                      setDeliveryTime(e.target.value);
                      saveNotificationSettings({ deliverySchedule: e.target.value });
                    }}
                    className="bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded px-2 py-0.5 text-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                  {isEnglish
                    ? 'Background push notifications will be delivered at this exact time.'
                    : 'Alertas e sínteses serão acionados em segundo plano no horário definido.'}
                </p>
              </div>
            </div>

            {/* Footer button */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)] shrink-0">
              <button
                type="button"
                onClick={() => setIsSettingsSlideOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-mono text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer text-center"
              >
                {isEnglish ? 'Save & Close' : 'Salvar Preferências'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
