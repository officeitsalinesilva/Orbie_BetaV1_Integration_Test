import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  TrendingUp,
  Sliders,
  Eye,
  FileText,
  Clock,
  MessageSquare,
  ShoppingBag,
  Unlock,
  CreditCard,
  Flame,
  Bell,
  Sparkles,
  Gift,
  Headphones,
  Edit3,
  Paperclip,
  AlertTriangle,
} from 'lucide-react';
import { useOrb } from '../../context/OrbContext';
import { DailyCheckPoint } from '../../types';
import { CHECKPOINT_COLORS, CHECKPOINT_ICONS } from './checkpointConstants';
import { DailyCheckInModal } from './DailyCheckInModal';
import { CheckInDetailModal } from './CheckInDetailModal';
import { DailyTrackAnalysisModal } from './DailyTrackAnalysisModal';

interface Props {
  isEnglish?: boolean;
  scopeEntity?: {
    id: string;
    name: string;
    type?: 'profile' | 'event';
  };
}

export const CheckPointCalendarView: React.FC<Props> = ({ isEnglish = false, scopeEntity }) => {
  const { dailyCheckPoints: globalCheckPoints, saveDailyCheckPoint: globalSaveCheckPoint, deleteDailyCheckPoint: globalDeleteCheckPoint } = useOrb();

  // Storage key and isolated state for secondary entity scopes
  const storageKey = scopeEntity ? `@orb/secondary_checkpoints_${scopeEntity.id}` : null;
  const [localCheckPoints, setLocalCheckPoints] = useState<DailyCheckPoint[]>(() => {
    if (!storageKey) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: `sec-chk-default`,
        date: new Date().toISOString().slice(0, 10),
        title: isEnglish
          ? `Strategic Alignment & Focus for ${scopeEntity?.name || 'Profile'}`
          : `Integração & Alinhamento Estratégico de ${scopeEntity?.name || 'Perfil'}`,
        color: 'emerald',
        icon: 'flame',
        authorComment: isEnglish
          ? `Synastry metrics calibrated for ${scopeEntity?.name || 'Profile'}. Core priorities on track.`
          : `Métricas e foco calibrados para ${scopeEntity?.name || 'Perfil'}. Prioridades centrais em andamento.`,
        attachedComponentKeys: ['daily_synthesis', 'alchemy_metrics'],
        habitsCompleted: ['deep_work', 'strategic_alignment'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  const dailyCheckPoints = scopeEntity ? localCheckPoints : globalCheckPoints;

  const saveDailyCheckPoint = (cp: DailyCheckPoint) => {
    if (scopeEntity && storageKey) {
      setLocalCheckPoints((prev) => {
        const next = [cp, ...prev.filter((item) => item.date !== cp.date)].sort((a, b) =>
          b.date.localeCompare(a.date)
        );
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
    } else {
      globalSaveCheckPoint(cp);
    }
  };

  const deleteDailyCheckPoint = (dateStr: string) => {
    if (scopeEntity && storageKey) {
      setLocalCheckPoints((prev) => {
        const next = prev.filter((item) => item.date !== dateStr);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
    } else {
      globalDeleteCheckPoint(dateStr);
    }
  };

  // Current calendar viewing month
  const today = new Date();
  const [viewDate, setViewDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));

  // Today ISO string: YYYY-MM-DD
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
  const todayDay = String(today.getDate()).padStart(2, '0');
  const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

  // Currently selected date for inspecting checkpoints & day activity history
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Modal states
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedDetailCheckPoint, setSelectedDetailCheckPoint] = useState<DailyCheckPoint | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDailyTrackModalOpen, setIsDailyTrackModalOpen] = useState(false);

  // History Drop-down state
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  // Month navigation
  const prevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const dayAndMonthTitle = isEnglish
    ? `${today.getDate()} ${viewDate.toLocaleDateString('en-US', { month: 'long' })}`
    : `${today.getDate()} de ${viewDate.toLocaleDateString('pt-BR', { month: 'long' })}`;

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Today checkpoint check
  const todayCheckPoint = dailyCheckPoints.find((cp) => cp.date === todayStr);

  // Selected date checkpoint
  const selectedCheckPoint = dailyCheckPoints.find((cp) => cp.date === selectedDateStr);

  // Generate calendar cells
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ type: 'empty', key: `empty-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dayStr === todayStr;
    const isSelected = dayStr === selectedDateStr;
    const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isFuture = new Date(year, month, d) > new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const checkPoint = dailyCheckPoints.find((cp) => cp.date === dayStr);

    calendarCells.push({
      type: 'day',
      dayNumber: d,
      dateStr: dayStr,
      isToday,
      isSelected,
      isPast,
      isFuture,
      checkPoint,
      key: `day-${d}`,
    });
  }

  const handleDayClick = (cell: any) => {
    if (cell.type !== 'day' || cell.isFuture) return;
    setSelectedDateStr(cell.dateStr);
  };

  const weekdays = isEnglish
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const currentMonthChecksCount =
    dailyCheckPoints.filter((cp) => cp.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length || 5;

  // Selected Day color configuration
  const selectedColorConfig = selectedCheckPoint
    ? CHECKPOINT_COLORS.find((c) => c.id === selectedCheckPoint.color) || CHECKPOINT_COLORS[0]
    : CHECKPOINT_COLORS[0];
  const SelectedIcon = selectedCheckPoint
    ? CHECKPOINT_ICONS.find((i) => i.id === selectedCheckPoint.icon)?.icon || Sparkles
    : Sparkles;

  const formattedSelectedDate = () => {
    try {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString(isEnglish ? 'en-US' : 'pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return selectedDateStr;
    }
  };

  // Activity History Items for the selected day in brand shades of blue
  const dailyActivities = [
    {
      id: 'act-purchases',
      category: isEnglish ? 'Purchases' : 'Compras',
      title: isEnglish ? 'Alpha Neuroacoustic Frequency Pack' : 'Pack de Frequências Neuroacústicas Alfa (8Hz - 12Hz)',
      detail: isEnglish ? 'Receipt #ORB-8832 · 40 Credits' : 'Comprovante #ORB-8832 · 40 Créditos',
      time: '09:14',
      icon: ShoppingBag,
      iconColor: 'text-[#001f3f] dark:text-blue-400',
      tagColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
    },
    {
      id: 'act-unlocks',
      category: isEnglish ? 'Unlocks' : 'Desbloqueios',
      title: isEnglish ? 'Advanced Somatic Calibration Dossier' : 'Dossiê Avançado de Calibração Somática & Foco',
      detail: isEnglish ? 'Complete chapter & interactive vectors unlocked' : 'Capítulo completo e vetores interativos liberados',
      time: '10:30',
      icon: Unlock,
      iconColor: 'text-blue-600 dark:text-blue-400',
      tagColor: 'bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20',
    },
    {
      id: 'act-recharges',
      category: isEnglish ? 'Recharges' : 'Recargas',
      title: isEnglish ? 'Credit Balance Top-up' : 'Recarga de Saldo de Créditos (+120 ◎)',
      detail: isEnglish ? 'Current balance: 240 ◎' : 'Saldo atualizado: 240 ◎ na carteira',
      time: '08:45',
      icon: CreditCard,
      iconColor: 'text-[#001f3f] dark:text-sky-400',
      tagColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20',
    },
    {
      id: 'act-streak',
      category: isEnglish ? 'Consecutive Days' : 'Dias Consecutivos',
      title: isEnglish ? '6th Consecutive Active Day' : '6º Dia Consecutivo de Presença Ativa',
      detail: isEnglish ? 'Consistency bonus active (+5% XP/Day)' : 'Bônus de consistência ativo (+5% de eficiência diária)',
      time: '07:00',
      icon: Flame,
      iconColor: 'text-blue-700 dark:text-blue-300',
      tagColor: 'bg-blue-700/10 text-blue-800 dark:text-blue-200 border border-blue-700/20',
    },
    {
      id: 'act-notifications',
      category: isEnglish ? 'Notifications' : 'Notificações',
      title: isEnglish ? 'Peak Productive Window Alert (08h-10h)' : 'Alerta de Janela: Início do Pico Produtivo (08h-10h)',
      detail: isEnglish ? 'Triggered on schedule · Delivered to background' : 'Disparado no horário programado · Entregue com sucesso',
      time: '08:00',
      icon: Bell,
      iconColor: 'text-sky-600 dark:text-sky-400',
      tagColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20',
    },
    {
      id: 'act-materials',
      category: isEnglish ? 'Generated Materials' : 'Materiais Gerados',
      title: isEnglish ? 'Daily Synthesis & Strategic Alchemy Report' : 'Síntese Diária & Relatório de Alquimia Estratégica',
      detail: isEnglish ? 'Exported into Checkpoint Snapshot' : 'Fixado e arquivado no checkpoint do dia',
      time: '14:20',
      icon: Sparkles,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      tagColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20',
    },
    {
      id: 'act-chats',
      category: isEnglish ? 'Conversations' : 'Conversas',
      title: isEnglish ? 'Dialogue with Orb: Career Alignment' : 'Conversa com o Orb: Alinhamento de Prioridades',
      detail: isEnglish ? '4 cognitive messages exchanged & summarized' : '4 interações registradas com plano de ação gerado',
      time: '11:15',
      icon: MessageSquare,
      iconColor: 'text-[#001f3f] dark:text-sky-400',
      tagColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
    },
    {
      id: 'act-benefits',
      category: isEnglish ? 'Activated Benefits' : 'Benefícios Ativados',
      title: isEnglish ? 'VIP Library Pass & 15% Store Discount' : 'Passe Livre de Biblioteca & Desconto de 15% Ativado',
      detail: isEnglish ? 'Perk active until end of cycle' : 'Benefício vigente até o fechamento do ciclo quinzenal',
      time: '15:40',
      icon: Gift,
      iconColor: 'text-blue-600 dark:text-blue-400',
      tagColor: 'bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20',
    },
    {
      id: 'act-audio',
      category: isEnglish ? 'Audio & Focus Time' : 'Áudios / Tempo',
      title: isEnglish ? 'Theta Binaural Waves (6Hz) & Focus Timer' : 'Ondas Binaurais Theta (6Hz) & Timer de Foco',
      detail: isEnglish ? '45 minutes of audio listening · 90 min deep work' : '45 minutos de reprodução de áudio · 90 min de foco profundo',
      time: '16:10',
      icon: Headphones,
      iconColor: 'text-cyan-700 dark:text-cyan-400',
      tagColor: 'bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-500/20',
    },
  ];

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. INFORMATIVO DE CTA PARA CHECK DO DIA (COM APENAS O '+' NO CANTO DIREITO) */}
      {/* ========================================================================= */}
      <div className="pt-0 pb-1 flex items-center justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#001f3f] dark:text-blue-400">
              {isEnglish ? 'DAILY CHECKOUT' : 'CHECK DO DIA'}
            </span>
            {todayCheckPoint ? (
              <span className="rounded-full bg-emerald-500 text-white px-2 py-0.2 text-[9px] font-mono font-bold">
                ✓ {isEnglish ? 'COMPLETED' : 'CONCLUÍDO'}
              </span>
            ) : (
              <span
                className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-xs"
                title={isEnglish ? 'Pending checkpoint' : 'Checkpoint pendente'}
              />
            )}
          </div>

          <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight">
            {todayCheckPoint
              ? todayCheckPoint.title
              : isEnglish
              ? 'Today checkout is pending'
              : 'Seu check-in de hoje está aguardando registro'}
          </h2>
        </div>

        {/* Right side: Minimalist '+' Icon Button in the top right corner */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[#001f3f] dark:text-blue-400 font-mono font-bold text-xs">
            <TrendingUp size={13} className="stroke-[2.5]" />
            <span>6 {isEnglish ? 'days' : 'dias'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-mono text-[11px]">
            <CalendarIcon size={12} className="text-[#001f3f] dark:text-blue-400 shrink-0" />
            <span className="text-xs">
              <strong className="font-bold text-[var(--foreground)]">
                {currentMonthChecksCount}/{daysInMonth}
              </strong>
            </span>
          </div>

          {/* '+' Button: ONLY the icon '+' */}
          <button
            type="button"
            onClick={() => setIsCheckInModalOpen(true)}
            aria-label={isEnglish ? 'Add Checkpoint' : 'Adicionar Checkpoint'}
            title={isEnglish ? 'Add Checkpoint' : 'Registrar Checkpoint'}
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
              todayCheckPoint
                ? 'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] hover:border-[#001f3f]'
                : 'bg-[#001f3f] hover:bg-[#0a192f] dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
            }`}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Box de Alerta sucinto mantido desde o início da sessão caso não haja o checkpoint do dia */}
      {!todayCheckPoint && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/30 p-3.5 flex items-center justify-between gap-3 text-xs max-w-xl mx-auto w-full animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle size={17} className="text-rose-600 dark:text-rose-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-rose-700 dark:text-rose-300 truncate">
                {isEnglish ? "You haven't completed today's checkpoint yet" : 'Você ainda não efetuou o checkpoint do dia'}
              </p>
              <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 leading-tight">
                {isEnglish
                  ? 'The Daily Journal requires a manual save to record your daily progress.'
                  : 'É necessário salvar manualmente o checkpoint de hoje para consolidar seu histórico.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedDateStr(todayStr);
              setIsCheckInModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-[11px] font-bold shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            {isEnglish ? 'Register now' : 'Registrar agora'}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CALENDÁRIO MINIMALISTA COMPACTO                                         */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-3.5 space-y-2 shadow-2xs max-w-xl mx-auto w-full">
        {/* Calendar Month Navigation */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <CalendarIcon size={13} />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] capitalize tracking-tight">
              {dayAndMonthTitle}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              aria-label={isEnglish ? 'Previous Month' : 'Mês Anterior'}
              className="flex h-5 w-5 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <ChevronLeft size={12} />
            </button>

            <button
              type="button"
              onClick={nextMonth}
              aria-label={isEnglish ? 'Next Month' : 'Próximo Mês'}
              className="flex h-5 w-5 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Weekdays Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
          {weekdays.map((w, idx) => (
            <div key={idx} className="py-0.5">
              {w}
            </div>
          ))}
        </div>

        {/* Days Square Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell) => {
            if (cell.type === 'empty') {
              return (
                <div
                  key={cell.key}
                  className="h-7 sm:h-8 rounded-md bg-transparent opacity-20"
                />
              );
            }

            const checkPoint = cell.checkPoint as DailyCheckPoint | undefined;
            const colorOption = checkPoint
              ? CHECKPOINT_COLORS.find((c) => c.id === checkPoint.color) || CHECKPOINT_COLORS[0]
              : null;

            // Day style logic
            let bgClass = 'bg-[var(--surface-2)]/50 text-[var(--text-tertiary)] hover:bg-[var(--surface-2)]';
            let textClass = 'text-[var(--text-secondary)]';

            if (cell.isSelected) {
              bgClass = 'ring-2 ring-[#001f3f] dark:ring-blue-400 bg-[#001f3f]/15 font-bold shadow-xs';
              textClass = 'text-[var(--foreground)] font-bold';
            } else if (cell.isToday) {
              bgClass = 'bg-[#001f3f] dark:bg-blue-600 text-white font-bold shadow-xs';
              textClass = 'text-white';
            } else if (checkPoint) {
              bgClass = colorOption ? `${colorOption.badgeClass} shadow-2xs` : 'bg-blue-600 text-white shadow-2xs';
              textClass = 'text-white';
            } else if (cell.isFuture) {
              bgClass = 'bg-[var(--surface-2)]/20 text-[var(--text-tertiary)] opacity-35 cursor-not-allowed';
              textClass = 'text-[var(--text-tertiary)]';
            }

            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => handleDayClick(cell)}
                disabled={cell.isFuture}
                className={`relative h-7 sm:h-8 rounded-md transition-all flex items-center justify-center font-mono text-[11px] font-bold cursor-pointer select-none active:scale-95 ${bgClass}`}
                title={`${cell.dateStr} ${checkPoint ? `• ${checkPoint.title}` : ''}`}
              >
                <span className={textClass}>{cell.dayNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Compact Legend */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-1.5 text-[8.5px] font-mono text-[var(--text-tertiary)] flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>{isEnglish ? 'Recorded' : 'Com Check'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)]" />
              <span>{isEnglish ? 'Unregistered' : 'Sem Registro'}</span>
            </div>
          </div>
          <span>{isEnglish ? 'Click date to view details & activities' : 'Clique no dia para ver detalhes & atividades'}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HISTÓRICO DE CHECKPOINTS (SEM CARDS / SEM ENCAPSULAMENTO)              */}
      {/* ========================================================================= */}
      <div className="space-y-4 max-w-xl mx-auto w-full pt-1">
        {/* Accordion Toggle Header: EXACT title "HISTÓRICO DE CHECKPOINTS", only Chevron */}
        <button
          type="button"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex items-center justify-between py-1.5 px-0 text-left cursor-pointer border-b border-[var(--border)] transition-colors"
        >
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
            {isEnglish ? 'CHECKPOINT HISTORY' : 'HISTÓRICO DE CHECKPOINTS'}
          </span>

          <div className="text-[var(--text-secondary)]">
            {isHistoryOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </button>

        {isHistoryOpen && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* A. Selected Day Checkpoint (Plain layout - NO CARDS) */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/40">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${selectedColorConfig.borderClass} ${selectedColorConfig.bgClass} ${selectedColorConfig.textClass}`}
                  >
                    <SelectedIcon size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#001f3f] dark:text-blue-400">
                        {selectedDateStr}
                      </span>
                      {selectedDateStr === todayStr && (
                        <span className="rounded bg-[#001f3f] text-white px-1.5 py-0.2 text-[8px] font-mono font-bold">
                          HOJE
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] capitalize">
                      {formattedSelectedDate()}
                    </h4>
                  </div>
                </div>

                {selectedCheckPoint && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDetailCheckPoint(selectedCheckPoint);
                      setIsDetailModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-xs font-mono font-medium hover:border-[#001f3f] transition-colors cursor-pointer"
                  >
                    <Eye size={12} className="text-[#001f3f] dark:text-blue-400" />
                    <span>{isEnglish ? 'Inspect' : 'Inspecionar'}</span>
                  </button>
                )}
              </div>

              {selectedCheckPoint ? (
                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold text-[var(--foreground)]">
                    {selectedCheckPoint.title}
                  </h5>

                  {selectedCheckPoint.authorComment && (
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed p-2 rounded-lg bg-[var(--surface-2)]/30 border border-[var(--border)]/40">
                      {selectedCheckPoint.authorComment}
                    </p>
                  )}

                  {/* Badges for Attached Daily Journal & Custom Digital Report */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedCheckPoint.hasDailyJournalAttachment !== false && (
                      <span className="rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[9px] font-mono font-bold flex items-center gap-1 border border-blue-500/20">
                        <Paperclip size={10} />
                        <span>{isEnglish ? 'Journal Snapshot' : 'Anexo do Journal'}</span>
                      </span>
                    )}

                    {selectedCheckPoint.journalReportBlocks && selectedCheckPoint.journalReportBlocks.length > 0 && (
                      <span className="rounded bg-[#001f3f]/10 dark:bg-blue-400/20 text-[#001f3f] dark:text-blue-300 px-2 py-0.5 text-[9px] font-mono font-bold flex items-center gap-1 border border-[#001f3f]/20">
                        <FileText size={10} />
                        <span>
                          {isEnglish ? 'Digital Report' : 'Relatório do Journal'} (
                          {selectedCheckPoint.journalReportBlocks.filter((b) => !b.excluded).length} {isEnglish ? 'blocks' : 'blocos'})
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-[var(--text-secondary)] italic">
                    {isEnglish
                      ? 'No checkpoint registered for this date yet.'
                      : 'Nenhum checkpoint registrado para esta data ainda.'}
                  </p>

                  {/* Centered Register Button at the bottom center of the topic */}
                  <div className="flex flex-col items-center justify-center pt-2 pb-1 gap-1.5">
                    {selectedDateStr === todayStr && (
                      <span className="rounded bg-rose-600/10 border border-rose-600/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[8.5px] font-mono font-bold animate-pulse inline-flex items-center gap-1">
                        ● {isEnglish ? 'PENDING' : 'PENDENTE'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCheckInModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#001f3f] text-white hover:bg-[#0a192f] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>{isEnglish ? 'Register Checkpoint' : 'Registrar Checkpoint'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* B. Histórico de Atividades do Dia Selecionado (Plain layout - NO CARDS, Blue tones, Scroll with >4 items) */}
            <div className="space-y-2.5 pt-3 border-t border-[var(--border)]/40">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-[#001f3f] dark:text-blue-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
                    {isEnglish ? 'Day Activity History' : 'Histórico de Atividades do Dia'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                  {dailyActivities.length} {isEnglish ? 'activities logged' : 'atividades executadas'}
                </span>
              </div>

              {/* Scrollable activity list for > 4 items (max-h-60 overflow-y-auto) with brand blue styling */}
              <div className="max-h-64 overflow-y-auto divide-y divide-[var(--border)]/40 pr-1 scrollbar-thin">
                {dailyActivities.map((act) => {
                  const IconComp = act.icon;
                  return (
                    <div
                      key={act.id}
                      className="py-2.5 flex items-start justify-between gap-3 hover:bg-[var(--surface-2)]/20 px-1 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 shrink-0 mt-0.5">
                          <IconComp size={14} className={act.iconColor} />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${act.tagColor}`}>
                              {act.category}
                            </span>
                            <span className="text-xs font-semibold text-[var(--foreground)] truncate">
                              {act.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                            {act.detail}
                          </p>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-[var(--text-tertiary)] shrink-0 mt-0.5">
                        {act.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS (CHECK-IN DE HOJE & REVISITAÇÃO COM ANÁLISE DE DAILY TRACK)       */}
      {/* ========================================================================= */}
      <DailyCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        currentDateStr={selectedDateStr || todayStr}
        existingCheckPoint={dailyCheckPoints.find((cp) => cp.date === (selectedDateStr || todayStr))}
        onSave={(cp) => saveDailyCheckPoint(cp)}
        onDelete={(dateStr) => deleteDailyCheckPoint(dateStr)}
        isEnglish={isEnglish}
      />

      <CheckInDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailCheckPoint(null);
        }}
        checkPoint={selectedDetailCheckPoint}
        isToday={selectedDetailCheckPoint?.date === todayStr}
        onEdit={() => setIsCheckInModalOpen(true)}
        onUpdateCheckPoint={(updated) => saveDailyCheckPoint(updated)}
        isEnglish={isEnglish}
      />
    </div>
  );
};
