import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  Paperclip,
  Trash2,
  Palette,
  Smile,
  Check,
  Clock,
  FileText,
  Plus,
  MessageSquare,
  Layers,
  ArrowRight,
  Edit3,
  ChevronDown,
  ChevronUp,
  Save,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { DailyCheckPoint, JournalReportBlock, CheckPointAttachedItem } from '../../types';
import {
  CHECKPOINT_COLORS,
  CHECKPOINT_ICONS,
  CHECKPOINT_ICON_CATEGORIES,
} from './checkpointConstants';
import { DailyJournalReportModal } from './DailyJournalReportModal';
import { DailyJournalAttachmentModal } from './DailyJournalAttachmentModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentDateStr: string; // YYYY-MM-DD
  existingCheckPoint?: DailyCheckPoint;
  onSave: (checkPoint: DailyCheckPoint) => void;
  onDelete?: (dateStr: string) => void;
  isEnglish?: boolean;
}

export const DailyCheckInModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentDateStr,
  existingCheckPoint,
  onSave,
  onDelete,
  isEnglish = false,
}) => {
  // 1. Title (keyboard input only, no suggestions)
  const [title, setTitle] = useState('');
  // 2. Color
  const [color, setColor] = useState('blue');
  // 3. Icon
  const [icon, setIcon] = useState('sparkles');
  // 4. Time
  const [timeStr, setTimeStr] = useState('14:30');
  // 5. Description / Author Comment
  const [description, setDescription] = useState('');

  // Dropdown states for color & icon pickers
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);

  // 6. Daily Journal Attachment state
  const [hasDailyJournalAttachment, setHasDailyJournalAttachment] = useState(true);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);

  // 7. Daily Journal Report state (Digital notebook blocks)
  const [reportBlocks, setReportBlocks] = useState<JournalReportBlock[] | undefined>(undefined);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    setTimeStr(`${currentHours}:${currentMins}`);

    if (existingCheckPoint) {
      setTitle(existingCheckPoint.title || '');
      setColor(existingCheckPoint.color || 'blue');
      setIcon(existingCheckPoint.icon || 'sparkles');
      setDescription(existingCheckPoint.authorComment || '');
      setHasDailyJournalAttachment(
        existingCheckPoint.hasDailyJournalAttachment !== undefined
          ? existingCheckPoint.hasDailyJournalAttachment
          : false
      );
      setReportBlocks(existingCheckPoint.journalReportBlocks);
    } else {
      setTitle(
        isEnglish
          ? 'Strategic Alignment & Focus'
          : 'Alinhamento & Conquistas Estratégicas'
      );
      setColor('blue');
      setIcon('sparkles');
      setDescription('');
      // Daily journal must be saved MANUALLY by the user
      setHasDailyJournalAttachment(false);
      setReportBlocks(undefined);
    }
  }, [existingCheckPoint, isOpen, isEnglish]);

  if (!isOpen) return null;

  const currentColorConfig =
    CHECKPOINT_COLORS.find((c) => c.id === color) || CHECKPOINT_COLORS[0];
  const currentIconConfig =
    CHECKPOINT_ICONS.find((i) => i.id === icon) || CHECKPOINT_ICONS[0];
  const CurrentIconComponent = currentIconConfig.icon || Sparkles;

  const mainColors = CHECKPOINT_COLORS.filter((c) => c.group === 'main');
  const lightColors = CHECKPOINT_COLORS.filter((c) => c.group === 'light');
  const darkColors = CHECKPOINT_COLORS.filter((c) => c.group === 'dark');

  const handleSave = () => {
    const newCheckPoint: DailyCheckPoint = {
      id: existingCheckPoint?.id || `chk-${currentDateStr}`,
      date: currentDateStr,
      title: title.trim() || (isEnglish ? 'Daily Check Point' : 'Check Point do Dia'),
      color,
      icon,
      authorComment: description.trim(),
      attachedComponentKeys: ['consciousness_level', 'daily_synthesis', 'alchemy_metrics'],
      hasDailyJournalAttachment,
      journalReportBlocks: reportBlocks,
      createdAt: existingCheckPoint?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newCheckPoint);
    onClose();
  };

  const handleSaveReportFromModal = (blocks: JournalReportBlock[]) => {
    setReportBlocks(blocks);
  };

  const formattedDate = () => {
    try {
      const [year, month, day] = currentDateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString(isEnglish ? 'en-US' : 'pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return currentDateStr;
    }
  };

  const activeReportBlocksCount = reportBlocks?.filter((b) => !b.excluded).length || 0;
  const reportCommentsCount =
    reportBlocks?.reduce((acc, b) => {
      if (b.excluded) return acc;
      const sectionCount = b.comment?.trim() ? 1 : 0;
      const itemsCount =
        b.itemComments?.filter(
          (ic) => ic.comment.trim().length > 0 && !b.excludedItemIds?.includes(ic.itemId)
        ).length || 0;
      return acc + sectionCount + itemsCount;
    }, 0) || 0;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-[var(--foreground)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ========================================================================= */}
          {/* TOP MODAL HEADER: Title, Icon, Color, Date, Time                          */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)] shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${currentColorConfig.borderClass} ${currentColorConfig.bgClass} ${currentColorConfig.textClass}`}
              >
                <CurrentIconComponent size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                    {existingCheckPoint
                      ? isEnglish
                        ? 'Edit Daily Checkpoint'
                        : 'Editar Checkpoint do Dia'
                      : isEnglish
                      ? 'Daily Checkpoint'
                      : 'Checkpoint do Dia'}
                  </h2>
                  <span className="rounded-full bg-[#001f3f]/10 dark:bg-blue-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#001f3f] dark:text-blue-300">
                    {isEnglish ? 'CHECKOUT' : 'CHECKOUT'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-secondary)] capitalize mt-0.5">
                  <span>{formattedDate()}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} className="text-[#001f3f] dark:text-blue-400" />
                    <span className="font-mono font-bold text-[var(--foreground)]">{timeStr}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={isEnglish ? 'Close' : 'Fechar'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer active:scale-95"
            >
              <X size={18} />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* MODAL BODY (STRICT SCOPE: TÍTULO, COR, ÍCONE, DESCRIÇÃO, ANEXO & RELATÓRIO) */}
          {/* ========================================================================= */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* 1. TÍTULO (APENAS POR TECLADO - SEM TAGS DE SUGESTÃO) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {isEnglish ? 'Checkpoint Title' : 'Título do Checkpoint'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isEnglish
                    ? 'Type checkpoint title with your keyboard...'
                    : 'Digite o título do seu checkpoint...'
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] placeholder:text-[var(--text-tertiary)] focus:outline-hidden focus:border-[#001f3f] dark:focus:border-blue-400 transition-colors"
              />
            </div>

            {/* 2. COR & ÍCONE COM DROPDOWNS FLUTUANTES (OVERLAY SEM EMPURRAR A TELA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative">
              {/* Color Palette Dropdown */}
              <div className="relative">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  {isEnglish ? 'Color Palette (36)' : 'Paleta de Cores (36)'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsColorDropdownOpen(!isColorDropdownOpen);
                    setIsIconDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)]/70 text-xs font-mono font-bold text-[var(--foreground)] transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Palette size={15} className="text-[#001f3f] dark:text-blue-400 shrink-0" />
                    <span
                      className="h-4 w-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: currentColorConfig.hex }}
                    />
                    <span className="truncate">
                      {isEnglish ? currentColorConfig.name : currentColorConfig.namePt}
                    </span>
                  </div>
                  {isColorDropdownOpen ? <ChevronUp size={15} className="text-[var(--text-secondary)] shrink-0" /> : <ChevronDown size={15} className="text-[var(--text-secondary)] shrink-0" />}
                </button>

                {/* Dropdown Menu de Cores Flutuante (36 Opções: 12 Principais + 12 Claros + 12 Escuros) */}
                {isColorDropdownOpen && (
                  <div className="absolute top-full left-0 w-full sm:w-[320px] mt-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-3 h-72 overflow-y-auto space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
                    {/* 12 Cores Principais */}
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-2">
                        {isEnglish ? 'Main Colors (12)' : 'Cores Principais (12)'}
                      </span>
                      <div className="grid grid-cols-6 gap-2">
                        {mainColors.map((c) => {
                          const isSelected = color === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setColor(c.id);
                                setIsColorDropdownOpen(false);
                              }}
                              title={isEnglish ? c.name : c.namePt}
                              className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform cursor-pointer mx-auto ${
                                isSelected
                                  ? 'ring-2 ring-offset-2 ring-[var(--foreground)] scale-110 shadow-xs'
                                  : 'opacity-85 hover:opacity-100 hover:scale-110'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            >
                              {isSelected && <Check size={14} className="text-white drop-shadow-sm" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 12 Subtons Mais Claros */}
                    <div className="pt-2 border-t border-[var(--border)]/60">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-2">
                        {isEnglish ? 'Lighter Subtones (12)' : 'Subtons Mais Claros (12)'}
                      </span>
                      <div className="grid grid-cols-6 gap-2">
                        {lightColors.map((c) => {
                          const isSelected = color === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setColor(c.id);
                                setIsColorDropdownOpen(false);
                              }}
                              title={isEnglish ? c.name : c.namePt}
                              className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform cursor-pointer mx-auto ${
                                isSelected
                                  ? 'ring-2 ring-offset-2 ring-[var(--foreground)] scale-110 shadow-xs'
                                  : 'opacity-85 hover:opacity-100 hover:scale-110'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            >
                              {isSelected && <Check size={14} className="text-slate-800 drop-shadow-sm" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 12 Subtons Mais Escuros */}
                    <div className="pt-2 border-t border-[var(--border)]/60">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-2">
                        {isEnglish ? 'Darker Subtones (12)' : 'Subtons Mais Escuros (12)'}
                      </span>
                      <div className="grid grid-cols-6 gap-2">
                        {darkColors.map((c) => {
                          const isSelected = color === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setColor(c.id);
                                setIsColorDropdownOpen(false);
                              }}
                              title={isEnglish ? c.name : c.namePt}
                              className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform cursor-pointer mx-auto ${
                                isSelected
                                  ? 'ring-2 ring-offset-2 ring-[var(--foreground)] scale-110 shadow-xs'
                                  : 'opacity-85 hover:opacity-100 hover:scale-110'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            >
                              {isSelected && <Check size={14} className="text-white drop-shadow-sm" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Icon Picker Dropdown (Categorizado: Emoções Completas, Lazer/Família/Casa, Natureza/Tempo/Estações, Escritório, Gastronomia) */}
              <div className="relative">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  {isEnglish ? 'Icon Picker' : 'Ícone Temático'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsIconDropdownOpen(!isIconDropdownOpen);
                    setIsColorDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)]/70 text-xs font-mono font-bold text-[var(--foreground)] transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CurrentIconComponent size={15} className="text-[#001f3f] dark:text-blue-400 shrink-0" />
                    <span className="truncate">
                      {isEnglish ? currentIconConfig.name : currentIconConfig.namePt}
                    </span>
                  </div>
                  {isIconDropdownOpen ? <ChevronUp size={15} className="text-[var(--text-secondary)] shrink-0" /> : <ChevronDown size={15} className="text-[var(--text-secondary)] shrink-0" />}
                </button>

                {/* Dropdown Menu de Ícones Flutuante (Mesmo tamanho de box com scroll, z-50 overlay) */}
                {isIconDropdownOpen && (
                  <div className="absolute top-full right-0 w-full sm:w-[320px] mt-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-3 h-72 overflow-y-auto space-y-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
                    {CHECKPOINT_ICON_CATEGORIES.map((cat) => {
                      const iconsInCat = CHECKPOINT_ICONS.filter((i) => i.category === cat.id);
                      return (
                        <div key={cat.id} className="space-y-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                            {isEnglish ? cat.nameEn : cat.namePt}
                          </span>
                          <div className="grid grid-cols-6 gap-1.5">
                            {iconsInCat.map((item) => {
                              const IconComp = item.icon;
                              const isSelected = icon === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setIcon(item.id);
                                    setIsIconDropdownOpen(false);
                                  }}
                                  title={isEnglish ? item.name : item.namePt}
                                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer mx-auto ${
                                    isSelected
                                      ? 'bg-[#001f3f] text-white dark:bg-blue-600 shadow-xs scale-105'
                                      : 'bg-[var(--surface-2)]/60 text-[var(--foreground)] hover:bg-[var(--surface-2)] hover:scale-105'
                                  }`}
                                >
                                  <IconComp size={15} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. DESCRIÇÃO / RELATÓRIO AUTORAL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {isEnglish ? 'Description / Notes' : 'Descrição / Relatório Autoral'}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isEnglish
                    ? 'Describe your key highlights, breakthroughs, or notes from today...'
                    : 'Escreva sua descrição, percepções ou notas do dia...'
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--text-tertiary)] focus:outline-hidden focus:border-[#001f3f] dark:focus:border-blue-400 transition-colors leading-relaxed"
              />
            </div>

            {/* 4. MESMO BOX: SALVAR DAILY JOURNAL -> APÓS SALVAR, OPÇÃO DE ABRIR/GERAR RELATÓRIO */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 p-4 space-y-3.5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 mt-0.5 ${
                      hasDailyJournalAttachment
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#001f3f]/10 dark:bg-blue-400/15 text-[#001f3f] dark:text-blue-400 border border-[var(--border)]'
                    }`}
                  >
                    {hasDailyJournalAttachment ? <Check size={18} /> : <FileText size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-mono font-bold text-[var(--foreground)]">
                        {isEnglish ? 'Daily Journal & Report' : 'Daily Journal & Relatório'}
                      </h3>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold border ${
                          hasDailyJournalAttachment
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {hasDailyJournalAttachment
                          ? isEnglish
                            ? 'JOURNAL SAVED'
                            : 'DAILY JOURNAL SALVO'
                          : isEnglish
                            ? 'NOT SAVED'
                            : 'NÃO SALVO'}
                      </span>
                      {reportBlocks && hasDailyJournalAttachment && (
                        <span className="rounded bg-[#001f3f]/10 dark:bg-blue-400/20 text-[#001f3f] dark:text-blue-300 px-1.5 py-0.2 text-[9px] font-mono font-bold">
                          {activeReportBlocksCount} {isEnglish ? 'blocks' : 'blocos'}
                          {reportCommentsCount > 0 && ` · ${reportCommentsCount} notas`}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                      {hasDailyJournalAttachment
                        ? isEnglish
                          ? 'Daily Journal snapshot attached. You can inspect the document or customize the digital notebook report.'
                          : 'Daily Journal salvo neste checkpoint. Você pode visualizar o documento ou gerar/editar o caderno digital.'
                        : isEnglish
                          ? 'Save the daily journal snapshot (Consciousness 350, Alchemy & Windows) to this checkpoint.'
                          : 'Salve o registro do daily journal com métricas de consciência 350, alquimia e janelas neste checkpoint.'}
                    </p>
                  </div>
                </div>

                {/* Ação primária quando não salvo: Apenas o botão "Salvar daily journal" com ícone de salvar */}
                {!hasDailyJournalAttachment && (
                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setHasDailyJournalAttachment(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#001f3f] text-white hover:bg-[#0a192f] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Save size={15} />
                      <span>{isEnglish ? 'Save Daily Journal' : 'Salvar daily journal'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quando salvo, no MESMO BOX são exibidas as opções de Abrir Daily Journal e Gerar/Abrir Relatório */}
              {hasDailyJournalAttachment && (
                <div className="pt-3 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Botão 1: Abrir Daily Journal Documento */}
                    <button
                      type="button"
                      onClick={() => setIsAttachmentModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-mono font-semibold text-[var(--foreground)] hover:border-[#001f3f] dark:hover:border-blue-400 transition-all cursor-pointer shadow-2xs"
                    >
                      <Paperclip size={13} className="text-[#001f3f] dark:text-blue-400" />
                      <span>{isEnglish ? 'Open Daily Journal' : 'Abrir Daily Journal'}</span>
                    </button>

                    {/* Botão 2: Gerar / Abrir Relatório (Caderno Digital) */}
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#001f3f] text-white hover:bg-[#0a192f] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      {reportBlocks ? <Edit3 size={13} /> : <FileText size={13} />}
                      <span>
                        {reportBlocks
                          ? isEnglish
                            ? 'Open / Edit Report'
                            : 'Abrir / Editar Relatório'
                          : isEnglish
                          ? 'Generate Report'
                          : 'Gerar Relatório'}
                      </span>
                    </button>
                  </div>

                  {/* Opção discreta para desvincular */}
                  <button
                    type="button"
                    onClick={() => {
                      setHasDailyJournalAttachment(false);
                      setReportBlocks(undefined);
                    }}
                    title={isEnglish ? 'Remove daily journal link' : 'Desvincular daily journal'}
                    className="text-[10px] font-mono text-[var(--text-tertiary)] hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    {isEnglish ? 'Remove link' : 'Desvincular'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MODAL FOOTER ACTIONS                                                      */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4 bg-[var(--surface)] shrink-0">
            <div>
              {existingCheckPoint && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(currentDateStr);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>{isEnglish ? 'Delete' : 'Remover'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={handleSave}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold shadow-sm transition-all cursor-pointer active:scale-98 ${currentColorConfig.badgeClass} hover:opacity-90`}
              >
                <CheckCircle2 size={15} />
                <span>{isEnglish ? 'Save Checkpoint' : 'Salvar Checkpoint'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Journal Attachment Modal */}
      <DailyJournalAttachmentModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        currentDateStr={currentDateStr}
        onSaveAttachment={() => setHasDailyJournalAttachment(true)}
        isEnglish={isEnglish}
      />

      {/* Daily Journal Report Modal (Caderno Digital) */}
      <DailyJournalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentDateStr={currentDateStr}
        initialBlocks={reportBlocks}
        onSaveReport={handleSaveReportFromModal}
        isEnglish={isEnglish}
      />
    </>
  );
};
