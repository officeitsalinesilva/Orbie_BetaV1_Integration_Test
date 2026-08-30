import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trash2,
  RotateCcw,
  MessageSquare,
  Check,
  Sparkles,
  Activity,
  Volume2,
  FileText,
  CheckCircle2,
  Clock,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Briefcase,
  Dumbbell,
  BookOpen,
  User,
  Edit3,
  MousePointer,
  ChevronDown,
  ChevronUp,
  Tag,
  Info,
  Sun,
  Moon,
  Feather,
  Compass,
  HeartPulse,
  Brain,
  Coffee,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Radio,
  Zap,
} from 'lucide-react';
import { JournalReportBlock, JournalItemComment } from '../../types';
import {
  ELEMENTS_CALIBRATION_DATA,
  ElementCalibrationData,
  SubIndex,
  SuggestionItem,
} from '../journal/ElementCalibrationSection';
import {
  computeElementSynthesis,
  ElementSynthesisInfo,
} from '../journal/ElementMetricsSection';
import { energyLevels } from '../../constants/energyLevels';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentDateStr: string;
  initialBlocks?: JournalReportBlock[];
  onSaveReport: (blocks: JournalReportBlock[]) => void;
  isEnglish?: boolean;
}

interface BlockDefinition {
  id: string;
  key: string;
  title: string;
  titleEn: string;
  category: string;
  tag: string;
  defaultComment?: string;
}

// 6 sections strictly preceding the chatbot screen
const DEFAULT_REPORT_BLOCKS: BlockDefinition[] = [
  {
    id: 'block-consciousness',
    key: 'consciousness_scale',
    title: 'Escala de Consciência (Nível 350 — Aceitação)',
    titleEn: 'Consciousness Anchor (Level 350 — Acceptance)',
    category: 'Consciência',
    tag: 'ÂNCORA 350',
    defaultComment: 'Excelente estabilidade emocional e ausência de atrito em reuniões matinais.',
  },
  {
    id: 'block-daily-tune',
    key: 'daily_tune',
    title: 'Sintonia do Momento & Frequência Neuroacústica',
    titleEn: 'Current Tune & Neuroacoustic Resonance',
    category: 'Neuroacústica',
    tag: '528 Hz ONDAS ALFA',
    defaultComment: 'Sessão de 20 min com ondas alfa acelerou a clareza para a entrega estruturante.',
  },
  {
    id: 'block-element-metrics',
    key: 'element_metrics',
    title: 'Métricas dos 4 Elementos & Alquimia',
    titleEn: '4 Elements Alchemy Scores',
    category: 'Métricas',
    tag: 'TERRA 71% · EXECUÇÃO',
    defaultComment: 'Ancoragem prática em alta prioridade com ritmo de execução sustentável.',
  },
  {
    id: 'block-element-calibration',
    key: 'element_calibration',
    title: 'Calibração dos Elementos & Recomendações',
    titleEn: 'Element Calibration & Directives',
    category: 'Calibração',
    tag: 'SUB-ÍNDICES',
    defaultComment: '',
  },
  {
    id: 'block-day-windows',
    key: 'day_windows',
    title: 'Janelas do Ritmo Solar (06:00 — 22:00)',
    titleEn: 'Solar Rhythm Windows (06:00 — 22:00)',
    category: 'Ritmo Circadiano',
    tag: 'PICO 08h-10h',
    defaultComment: 'Janela nobre protegida para trabalho focado sem interrupções.',
  },
  {
    id: 'block-daily-post',
    key: 'daily_post_spheres',
    title: 'Daily Post & 4 Esferas do Dia',
    titleEn: 'Daily Post & 4 Spheres',
    category: 'Esferas',
    tag: '4 ESFERAS',
    defaultComment: 'Direcionamento de carreira e hidratação somática cumpridos com rigor.',
  },
];

const VALID_SECTION_KEYS = new Set(DEFAULT_REPORT_BLOCKS.map((b) => b.key));

interface SelectedTarget {
  blockId: string;
  itemId?: string;
  title: string;
  tag?: string;
}

interface CommentingTarget {
  blockId: string;
  itemId?: string;
  title: string;
  currentComment: string;
  tag?: string;
}

export const DailyJournalReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentDateStr,
  initialBlocks,
  onSaveReport,
  isEnglish = false,
}) => {
  const [blocks, setBlocks] = useState<JournalReportBlock[]>([]);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [activeElementKey, setActiveElementKey] = useState<'fire' | 'earth' | 'air' | 'water'>('earth');
  const [featuredSphereKey, setFeaturedSphereKey] = useState<string>('career');
  const [showWindowsGuide, setShowWindowsGuide] = useState(false);

  // Selection & Commenting State
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(null);
  const [commentingTarget, setCommentingTarget] = useState<CommentingTarget | null>(null);
  const [commentDraft, setCommentDraft] = useState('');

  // Toggled sections for exposing ALL comments in a section
  const [exposedSectionPanels, setExposedSectionPanels] = useState<Record<string, boolean>>({});

  // Active single exposed comment when navigating by markers
  const [activeExposedMarker, setActiveExposedMarker] = useState<{ blockId: string; itemId?: string } | null>(null);

  // Initialize blocks strictly filtering out any chatbot or external screens
  useEffect(() => {
    if (!isOpen) return;

    if (initialBlocks && initialBlocks.length > 0) {
      // Filter out any blocks from chatbot or profile that might have existed
      const filtered = initialBlocks.filter((b) => VALID_SECTION_KEYS.has(b.key));
      if (filtered.length > 0) {
        const sorted = [...filtered].sort((a, b) => a.order - b.order);
        setBlocks(sorted);
        return;
      }
    }

    const initial: JournalReportBlock[] = DEFAULT_REPORT_BLOCKS.map((b, idx) => ({
      id: b.id,
      key: b.key,
      title: b.title,
      titleEn: b.titleEn,
      category: b.category,
      tag: b.tag,
      excluded: false,
      comment: b.defaultComment || '',
      commentPlacement: 'below',
      showCommentBox: false,
      order: idx,
      itemComments: [],
      excludedItemIds: [],
    }));
    setBlocks(initial);
  }, [isOpen, initialBlocks]);

  if (!isOpen) return null;

  // Total count of all comments (sections + sub-items)
  const totalAllCommentsCount = blocks.reduce((acc, b) => {
    if (b.excluded) return acc;
    let count = 0;
    if (b.comment && b.comment.trim().length > 0) count++;
    if (b.itemComments && b.itemComments.length > 0) {
      const validItemComments = b.itemComments.filter(
        (ic) => ic.comment.trim().length > 0 && !b.excludedItemIds?.includes(ic.itemId)
      );
      count += validItemComments.length;
    }
    return acc + count;
  }, 0);

  // Excluded counts
  const totalExcludedSectionsCount = blocks.filter((b) => b.excluded).length;
  const totalExcludedSubItemsCount = blocks.reduce((acc, b) => {
    if (b.excluded) return acc;
    return acc + (b.excludedItemIds ? b.excludedItemIds.length : 0);
  }, 0);
  const totalExcludedItemsCount = totalExcludedSectionsCount + totalExcludedSubItemsCount;

  // Toggle Exclude Section
  const toggleExcludeSection = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const willExclude = !b.excluded;
        return {
          ...b,
          excluded: willExclude,
        };
      })
    );
    if (selectedTarget?.blockId === blockId) {
      setSelectedTarget(null);
    }
  };

  // Restore Section
  const restoreSection = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        return { ...b, excluded: false };
      })
    );
  };

  // Exclude specific sub-item
  const excludeSubItem = (blockId: string, itemId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const currentExcluded = b.excludedItemIds || [];
        if (!currentExcluded.includes(itemId)) {
          return { ...b, excludedItemIds: [...currentExcluded, itemId] };
        }
        return b;
      })
    );
    if (selectedTarget?.blockId === blockId && selectedTarget?.itemId === itemId) {
      setSelectedTarget(null);
    }
  };

  // Restore sub-item
  const restoreSubItem = (blockId: string, itemId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          excludedItemIds: (b.excludedItemIds || []).filter((id) => id !== itemId),
        };
      })
    );
  };

  // Open Comment Editor
  const handleOpenCommentEditor = (target: SelectedTarget) => {
    const block = blocks.find((b) => b.id === target.blockId);
    let existingComment = '';
    if (!target.itemId) {
      existingComment = block?.comment || '';
    } else {
      const itemComment = block?.itemComments?.find((ic) => ic.itemId === target.itemId);
      existingComment = itemComment?.comment || '';
    }

    setCommentingTarget({
      blockId: target.blockId,
      itemId: target.itemId,
      title: target.title,
      currentComment: existingComment,
      tag: target.tag,
    });
    setCommentDraft(existingComment);
    setSelectedTarget(null);
  };

  // Save comment draft
  const handleSaveCommentDraft = () => {
    if (!commentingTarget) return;

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== commentingTarget.blockId) return b;

        if (!commentingTarget.itemId) {
          // Section level comment
          return {
            ...b,
            comment: commentDraft.trim(),
          };
        } else {
          // Sub-item level comment
          const currentItems = b.itemComments || [];
          const existingIndex = currentItems.findIndex(
            (ic) => ic.itemId === commentingTarget.itemId
          );

          if (commentDraft.trim().length === 0) {
            // Remove comment if empty
            return {
              ...b,
              itemComments: currentItems.filter(
                (ic) => ic.itemId !== commentingTarget.itemId
              ),
            };
          }

          const updatedCommentObj: JournalItemComment = {
            itemId: commentingTarget.itemId,
            itemTitle: commentingTarget.title,
            comment: commentDraft.trim(),
            tag: commentingTarget.tag || 'NOTA',
            updatedAt: new Date().toISOString(),
          };

          if (existingIndex >= 0) {
            const nextList = [...currentItems];
            nextList[existingIndex] = updatedCommentObj;
            return { ...b, itemComments: nextList };
          } else {
            return { ...b, itemComments: [...currentItems, updatedCommentObj] };
          }
        }
      })
    );

    // Set as active marker so user immediately sees their comment
    setActiveExposedMarker({
      blockId: commentingTarget.blockId,
      itemId: commentingTarget.itemId,
    });

    setCommentingTarget(null);
  };

  // Delete a specific comment
  const handleDeleteComment = (blockId: string, itemId?: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        if (!itemId) {
          return { ...b, comment: '' };
        } else {
          return {
            ...b,
            itemComments: (b.itemComments || []).filter((ic) => ic.itemId !== itemId),
          };
        }
      })
    );
    if (activeExposedMarker?.blockId === blockId && activeExposedMarker?.itemId === itemId) {
      setActiveExposedMarker(null);
    }
  };

  // Toggle Section Full Comment Panel
  const toggleSectionCommentsPanel = (blockId: string) => {
    setExposedSectionPanels((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
    // Clear individual exposed marker when opening full panel
    setActiveExposedMarker(null);
  };

  const handleSaveFinal = () => {
    onSaveReport(blocks);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 500);
  };

  const activeBlocks = blocks.filter((b) => !b.excluded).sort((a, b) => a.order - b.order);
  const excludedBlocks = blocks.filter((b) => b.excluded).sort((a, b) => a.order - b.order);

  // Helper to render interactive selectable items with disabled appearance + markers
  const renderSelectableItem = (
    blockId: string,
    itemId: string,
    itemTitle: string,
    itemTag: string,
    children: React.ReactNode
  ) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || block.excluded) return null;

    // Check if this sub-item is excluded
    if (block.excludedItemIds?.includes(itemId)) {
      return null;
    }

    const itemComment = block.itemComments?.find((ic) => ic.itemId === itemId);
    const hasComment = Boolean(itemComment && itemComment.comment.trim().length > 0);
    const isSelected =
      selectedTarget?.blockId === blockId && selectedTarget?.itemId === itemId;
    const isMarkerActive =
      activeExposedMarker?.blockId === blockId &&
      activeExposedMarker?.itemId === itemId &&
      !exposedSectionPanels[blockId];

    return (
      <div
        key={`${blockId}-${itemId}`}
        id={`item-${blockId}-${itemId}`}
        className={`relative group rounded-xl transition-all duration-200 ${
          isSelected
            ? 'ring-2 ring-[#001f3f] dark:ring-blue-400 bg-[var(--surface-2)]/60 shadow-md'
            : 'hover:ring-1 hover:ring-[var(--border)] hover:bg-[var(--surface-2)]/30'
        }`}
      >
        {/* Click area to select or toggle marker */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (isSelected) {
              setSelectedTarget(null);
            } else {
              setSelectedTarget({ blockId, itemId, title: itemTitle, tag: itemTag });
              if (hasComment) {
                setActiveExposedMarker({ blockId, itemId });
              }
            }
          }}
          className="cursor-pointer relative"
        >
          {/* Item Content */}
          <div className="transition-opacity">{children}</div>

          {/* SINALIZAÇÃO / PIN BADGE DO ITEM COMENTADO */}
          {hasComment && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (isMarkerActive) {
                  setActiveExposedMarker(null);
                } else {
                  setActiveExposedMarker({ blockId, itemId });
                }
              }}
              title={
                isEnglish
                  ? `Commented item: "${itemComment?.comment.slice(0, 40)}..." · Click to expose`
                  : `Item comentado: "${itemComment?.comment.slice(0, 40)}..." · Clique para expor`
              }
              className={`absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-0.8 rounded-full text-[10px] font-mono font-bold shadow-md cursor-pointer transition-all ${
                isMarkerActive
                  ? 'bg-[#001f3f] text-white ring-2 ring-emerald-400 scale-105'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <MessageSquare size={11} />
              <span>{itemTag || (isEnglish ? 'NOTE' : 'NOTA')}</span>
            </div>
          )}

          {/* Helper hover badge when not commented and not selected */}
          {!hasComment && !isSelected && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <span className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[9px] font-mono text-[var(--text-secondary)] shadow-xs">
                {isEnglish ? 'Click to select' : 'Clique para selecionar'}
              </span>
            </div>
          )}
        </div>

        {/* POPUP DE AÇÃO AO SELECIONAR O ITEM (REMOVER OU COMENTAR) */}
        {isSelected && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2 p-2 rounded-xl bg-[var(--surface)] border border-[#001f3f] dark:border-blue-400 shadow-xl flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1 z-30"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[var(--text-secondary)] font-bold">
                {itemTag}
              </span>
              <span className="text-xs font-bold text-[var(--foreground)] truncate">
                {itemTitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Botão Comentar */}
              <button
                type="button"
                onClick={() =>
                  handleOpenCommentEditor({
                    blockId,
                    itemId,
                    title: itemTitle,
                    tag: itemTag,
                  })
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#001f3f] text-white hover:bg-[#0a192f] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <MessageSquare size={12} />
                <span>
                  {hasComment
                    ? isEnglish
                      ? 'Edit Note'
                      : 'Editar Nota'
                    : isEnglish
                    ? 'Comment'
                    : 'Comentar'}
                </span>
              </button>

              {/* Botão Remover */}
              <button
                type="button"
                onClick={() => excludeSubItem(blockId, itemId)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-mono transition-colors cursor-pointer"
                title={isEnglish ? 'Remove item' : 'Remover item'}
              >
                <Trash2 size={12} />
                <span>{isEnglish ? 'Remove' : 'Remover'}</span>
              </button>

              {/* Botão Fechar Seleção */}
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* COMENTÁRIO EXPOSTO INDIVIDUALMENTE (QUANDO CLICADO NO MARCADOR ESPECÍFICO) */}
        {isMarkerActive && itemComment && (
          <div className="mt-2 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 text-xs space-y-1.5 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                <MessageSquare size={12} />
                <span>{itemTitle}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenCommentEditor({
                      blockId,
                      itemId,
                      title: itemTitle,
                      tag: itemTag,
                    })
                  }
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                >
                  {isEnglish ? 'Edit' : 'Editar'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveExposedMarker(null)}
                  className="p-0.5 text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
            <p className="text-[var(--foreground)] leading-relaxed font-sans pt-0.5">
              {itemComment.comment}
            </p>
          </div>
        )}
      </div>
    );
  };

  const spheres = [
    {
      key: 'career',
      title: isEnglish ? 'Career & Focus' : 'Carreira & Foco',
      timeWindow: '08:00 — 10:00',
      tag: isEnglish ? 'CRITICAL WINDOW' : 'JANELA NOBRE',
      icon: Briefcase,
      summary: isEnglish
        ? 'High analytical power and strategic composure. Direct effort towards the single priority objective before incoming notifications.'
        : 'Alto poder de análise e compostura estratégica. Direcione esforço para o objetivo prioritário antes de checar notificações.',
      actionAdvice: isEnglish
        ? 'Protect the first 90 minutes from multi-tasking.'
        : 'Proteja os primeiros 90 minutos de distrações externas.',
    },
    {
      key: 'somatic',
      title: isEnglish ? 'Somatic & Energy' : 'Somática & Energia',
      timeWindow: '12:00 — 14:00',
      tag: isEnglish ? 'BODY & REST' : 'CORPO & DESCANSO',
      icon: Dumbbell,
      summary: isEnglish
        ? 'Optimal somatic alignment, gentle movement, hydration and intentional pause for neural reset.'
        : 'Alinhamento somático, hidratação estruturada e pausa intencional para regeneração neural pós-almoço.',
      actionAdvice: isEnglish
        ? 'Take a 15-minute walk outside or light stretches.'
        : 'Faça 15 minutos de caminhada ao ar livre ou alongamentos.',
    },
    {
      key: 'social',
      title: isEnglish ? 'Social Bonds' : 'Vínculos & Relações',
      timeWindow: '16:00 — 18:00',
      tag: isEnglish ? 'COMMUNICATION' : 'COMUNICAÇÃO',
      icon: User,
      summary: isEnglish
        ? 'High empathy and collaborative clarity. Ideal for strategic alignments, feedback, and key connections.'
        : 'Alta empatia e clareza colaborativa. Ideal para alinhamentos em equipe, feedbacks e conexões importantes.',
      actionAdvice: isEnglish
        ? 'Listen actively and lead conversations with acceptance.'
        : 'Pratique escuta ativa e conduza conversas com serenidade.',
    },
    {
      key: 'intellect',
      title: isEnglish ? 'Intellect & Night Reflection' : 'Intelecto & Síntese Noturna',
      timeWindow: '19:00 — 21:00',
      tag: isEnglish ? 'SYNTHESIS' : 'SÍNTESE & ESTUDO',
      icon: BookOpen,
      summary: isEnglish
        ? 'Quiet introspection, consolidation of daily learnings, and gradual neural de-escalation.'
        : 'Introspecção serena, consolidação dos aprendizados do dia e desaceleração progressiva.',
      actionAdvice: isEnglish
        ? 'Dim blue light and prepare for restorative sleep.'
        : 'Reduza a exposição a telas e prepare o descanso noturno.',
    },
  ];

  const featuredSphere = spheres.find((s) => s.key === featuredSphereKey) || spheres[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200 text-[var(--foreground)]"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTarget(null);
        }}
      >
        {/* ========================================================================= */}
        {/* TOP MODAL HEADER: Title, Total Comments, Trash with restore & Close       */}
        {/* ========================================================================= */}
        <div className="border-b border-[var(--border)] px-5 sm:px-6 py-4 bg-[var(--surface)] shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001f3f] text-white shadow-xs">
                <FileText size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight">
                    {isEnglish ? 'Daily Journal Report' : 'Relatório do Daily Journal'}
                  </h2>
                  <span className="rounded-full bg-[#001f3f]/10 dark:bg-blue-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#001f3f] dark:text-blue-300">
                    {isEnglish ? 'ANALYTICAL REVIEW' : 'CADERNO INTERATIVO'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
                  {isEnglish
                    ? 'Select sections or specific items to remove or comment. Click counter buttons to view lists.'
                    : 'Selecione seções ou itens para remover ou comentar. Clique nos numerais para expor a lista.'}
                </p>
              </div>
            </div>

            {/* Top Right Controls: Close only */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label={isEnglish ? 'Close' : 'Fechar'}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Header Info Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] pt-1 border-t border-[var(--border)]/60">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>
                  {activeBlocks.length} / {blocks.length} {isEnglish ? 'sections active' : 'sessões ativas'}
                </span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[#001f3f] dark:text-blue-400 font-bold">
                <MessageSquare size={12} />
                <span>
                  {totalAllCommentsCount} {isEnglish ? 'total notes' : 'comentários totais'}
                </span>
              </span>
              <span>·</span>
              {/* Lixeira ao lado dos comentários totais sem estar encapsulada */}
              <button
                type="button"
                onClick={() => setIsTrashOpen(!isTrashOpen)}
                title={
                  isEnglish
                    ? `Trash (${totalExcludedItemsCount} items) · Click to restore`
                    : `Lixeira (${totalExcludedItemsCount} itens) · Clique para restaurar`
                }
                className={`inline-flex items-center gap-1 font-mono text-xs transition-colors cursor-pointer ${
                  isTrashOpen
                    ? 'text-rose-600 dark:text-rose-400 font-bold underline'
                    : totalExcludedItemsCount > 0
                    ? 'text-rose-600 dark:text-rose-400 font-semibold hover:underline'
                    : 'text-[var(--text-secondary)] hover:text-rose-500'
                }`}
              >
                <Trash2 size={13} className={totalExcludedItemsCount > 0 ? 'text-rose-500' : ''} />
                <span>
                  {isEnglish ? 'Trash' : 'Lixeira'} ({totalExcludedItemsCount})
                </span>
              </button>
            </div>

            <span className="text-[11px] text-[var(--text-tertiary)]">
              {currentDateStr}
            </span>
          </div>

          {/* ======================================================================= */}
          {/* EXPANDABLE TRASH / RESTORATION DRAWER                                   */}
          {/* ======================================================================= */}
          {isTrashOpen && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 size={14} className="text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    {isEnglish
                      ? `Excluded Items (${totalExcludedItemsCount}) — Click to restore to original place`
                      : `Itens Excluídos (${totalExcludedItemsCount}) — Clique para restaurar ao seu lugar`}
                  </span>
                </div>
              </div>

              {totalExcludedItemsCount === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] italic py-1">
                  {isEnglish
                    ? 'No elements or sections excluded. Everything is included in the report.'
                    : 'Nenhum elemento ou sessão excluída. Todos estão presentes no relatório.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                  {/* Excluded Sections */}
                  {excludedBlocks.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 font-bold">
                          {isEnglish ? 'SECTION' : 'SESSÃO'} · {b.tag}
                        </span>
                        <h4 className="text-xs font-semibold text-[var(--foreground)] truncate mt-0.5">
                          {isEnglish ? b.titleEn : b.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => restoreSection(b.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#001f3f] text-white hover:bg-[#0a192f] text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
                      >
                        <RotateCcw size={12} />
                        <span>{isEnglish ? 'Restore' : 'Restaurar'}</span>
                      </button>
                    </div>
                  ))}

                  {/* Excluded Sub-items */}
                  {blocks
                    .filter((b) => !b.excluded && b.excludedItemIds && b.excludedItemIds.length > 0)
                    .flatMap((b) =>
                      (b.excludedItemIds || []).map((itemId) => ({
                        blockId: b.id,
                        itemId,
                        sectionTitle: isEnglish ? b.titleEn : b.title,
                      }))
                    )
                    .map((item) => (
                      <div
                        key={`${item.blockId}-${item.itemId}`}
                        className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[var(--text-secondary)] font-bold">
                            {isEnglish ? 'ITEM' : 'ITEM'} · {item.itemId}
                          </span>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            {item.sectionTitle}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => restoreSubItem(item.blockId, item.itemId)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#001f3f] text-white hover:bg-[#0a192f] text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
                        >
                          <RotateCcw size={12} />
                          <span>{isEnglish ? 'Restore' : 'Restaurar'}</span>
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* REPORT STREAM (SECTIONS & SUB-ITEMS)                                      */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6 bg-[var(--background)]">
          {activeBlocks.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <AlertCircle size={32} className="mx-auto text-amber-500" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                {isEnglish ? 'All report sections are excluded' : 'Todas as seções do relatório foram removidas'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                {isEnglish
                  ? 'Open the Trash drawer in the top bar to restore sections and items to your report.'
                  : 'Abra a Lixeira na barra superior para restaurar as seções e itens desejados.'}
              </p>
            </div>
          ) : (
            activeBlocks.map((block, index) => {
              const isSectionSelected =
                selectedTarget?.blockId === block.id && !selectedTarget?.itemId;
              const hasSectionComment = Boolean(block.comment && block.comment.trim().length > 0);

              // Section comment count: section note + sub-items notes
              const validItemComments = (block.itemComments || []).filter(
                (ic) =>
                  ic.comment.trim().length > 0 &&
                  !block.excludedItemIds?.includes(ic.itemId)
              );
              const sectionCommentCount =
                (hasSectionComment ? 1 : 0) + validItemComments.length;

              const isSectionCommentsExposed = Boolean(exposedSectionPanels[block.id]);

              return (
                <div
                  key={block.id}
                  id={`section-${block.id}`}
                  className={`rounded-2xl border bg-[var(--surface)] shadow-xs transition-all overflow-hidden ${
                    isSectionSelected
                      ? 'border-[#001f3f] dark:border-blue-400 ring-2 ring-[#001f3f]/20'
                      : 'border-[var(--border)] hover:border-[var(--border)]'
                  }`}
                >
                  {/* =============================================================== */}
                  {/* SECTION HEADER BAR WITH NUMERAL COUNTER & SELECTION CONTROLS   */}
                  {/* =============================================================== */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTarget(
                        isSectionSelected
                          ? null
                          : {
                              blockId: block.id,
                              title: isEnglish ? block.titleEn : block.title,
                              tag: block.tag,
                            }
                      );
                    }}
                    className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-[var(--surface-2)]/40 border-b border-[var(--border)] cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#001f3f] text-white font-mono text-[10px] font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-bold text-[#001f3f] dark:text-blue-300">
                        {block.tag}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                        {isEnglish ? block.titleEn : block.title}
                      </h3>
                    </div>

                    {/* Controls: Numeral de Comentários (Toggle da Sessão) + Ações */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* BOTÃO NUMERAL DE COMENTÁRIOS DA SESSÃO (TOGGLE EXPOSIÇÃO GERAL) */}
                      <button
                        type="button"
                        onClick={() => toggleSectionCommentsPanel(block.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                          isSectionCommentsExposed
                            ? 'bg-[#001f3f] text-white border-[#001f3f] ring-2 ring-emerald-400'
                            : sectionCommentCount > 0
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                        }`}
                        title={
                          isEnglish
                            ? `${sectionCommentCount} notes in section · Click to toggle full list`
                            : `${sectionCommentCount} anotações na sessão · Clique para abrir/fechar lista completa`
                        }
                      >
                        <MessageSquare size={13} />
                        <span>
                          {sectionCommentCount}{' '}
                          {sectionCommentCount === 1
                            ? isEnglish
                              ? 'Note'
                              : 'Comentário'
                            : isEnglish
                            ? 'Notes'
                            : 'Comentários'}
                        </span>
                        {isSectionCommentsExposed ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                      </button>

                      {/* Botão Comentar Sessão */}
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCommentEditor({
                            blockId: block.id,
                            title: isEnglish ? block.titleEn : block.title,
                            tag: block.tag,
                          })
                        }
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                          hasSectionComment
                            ? 'border-[#001f3f] text-[#001f3f] dark:text-blue-300 font-bold bg-[#001f3f]/10'
                            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                        }`}
                        title={isEnglish ? 'Comment whole section' : 'Comentar sessão inteira'}
                      >
                        <Edit3 size={12} />
                        <span className="hidden sm:inline">
                          {hasSectionComment
                            ? isEnglish
                              ? 'Edit'
                              : 'Editar'
                            : isEnglish
                            ? 'Comment'
                            : 'Comentar'}
                        </span>
                      </button>

                      {/* Botão Remover Sessão */}
                      <button
                        type="button"
                        onClick={() => toggleExcludeSection(block.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-mono transition-colors cursor-pointer"
                        title={isEnglish ? 'Remove entire section' : 'Remover sessão inteira'}
                      >
                        <Trash2 size={12} />
                        <span className="hidden sm:inline">{isEnglish ? 'Remove' : 'Remover'}</span>
                      </button>
                    </div>
                  </div>

                  {/* POPUP DE SELEÇÃO DA SESSÃO INTEIRA */}
                  {isSectionSelected && (
                    <div className="p-3 bg-[#001f3f]/5 border-b border-[#001f3f]/20 flex items-center justify-between gap-2 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <MousePointer size={14} className="text-[#001f3f] dark:text-blue-400" />
                        <span className="text-xs font-mono font-bold text-[#001f3f] dark:text-blue-300">
                          {isEnglish
                            ? 'Section Selected · Choose action:'
                            : 'Sessão Selecionada · Escolha a ação:'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenCommentEditor({
                              blockId: block.id,
                              title: isEnglish ? block.titleEn : block.title,
                              tag: block.tag,
                            })
                          }
                          className="px-3 py-1 rounded-lg bg-[#001f3f] text-white text-xs font-mono font-bold hover:bg-[#0a192f] transition-all cursor-pointer"
                        >
                          {isEnglish ? 'Comment Section' : 'Comentar Sessão'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExcludeSection(block.id)}
                          className="px-2.5 py-1 rounded-lg border border-rose-500 text-rose-600 text-xs font-mono hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          {isEnglish ? 'Remove Section' : 'Remover Sessão'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTarget(null)}
                          className="p-1 text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =============================================================== */}
                  {/* PAINEL DE SESSÃO CHEIA COM LISTA DE COMENTÁRIOS EXPOSTA         */}
                  {/* =============================================================== */}
                  {isSectionCommentsExposed && (
                    <div className="p-4 bg-emerald-500/5 border-b border-emerald-500/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={15} className="text-emerald-700 dark:text-emerald-400" />
                          <h4 className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                            {isEnglish
                              ? `All Notes in Section (${sectionCommentCount})`
                              : `Lista de Comentários Expostos na Sessão (${sectionCommentCount})`}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSectionCommentsPanel(block.id)}
                          className="text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--foreground)] underline"
                        >
                          {isEnglish ? 'Hide list' : 'Recolher lista'}
                        </button>
                      </div>

                      {sectionCommentCount === 0 ? (
                        <p className="text-xs text-[var(--text-secondary)] italic py-1">
                          {isEnglish
                            ? 'No comments recorded for this section or its items yet. Select any item below to add one.'
                            : 'Nenhum comentário registrado nesta sessão ainda. Clique em qualquer item abaixo para comentar.'}
                        </p>
                      ) : (
                        <div className="space-y-2 pt-1">
                          {/* Section-level comment */}
                          {block.comment && block.comment.trim().length > 0 && (
                            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs space-y-1.5 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#001f3f]/10 text-[#001f3f] dark:text-blue-300 uppercase">
                                  {isEnglish ? 'SECTION NOTE' : 'NOTA DA SESSÃO GERAL'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenCommentEditor({
                                        blockId: block.id,
                                        title: isEnglish ? block.titleEn : block.title,
                                        tag: block.tag,
                                      })
                                    }
                                    className="text-[10px] font-mono text-[var(--text-secondary)] hover:text-[var(--foreground)] underline"
                                  >
                                    {isEnglish ? 'Edit' : 'Editar'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(block.id)}
                                    className="text-[10px] font-mono text-rose-500 hover:text-rose-700"
                                  >
                                    {isEnglish ? 'Delete' : 'Excluir'}
                                  </button>
                                </div>
                              </div>
                              <p className="text-[var(--foreground)] leading-relaxed font-sans">
                                {block.comment}
                              </p>
                            </div>
                          )}

                          {/* Sub-item comments */}
                          {block.itemComments
                            ?.filter(
                              (ic) =>
                                ic.comment.trim().length > 0 &&
                                !block.excludedItemIds?.includes(ic.itemId)
                            )
                            .map((ic) => (
                              <div
                                key={ic.itemId}
                                className="p-3 rounded-xl border border-emerald-500/30 bg-[var(--surface)] text-xs space-y-1.5 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase">
                                    {ic.tag || (isEnglish ? 'ITEM' : 'ITEM')} · {ic.itemTitle}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenCommentEditor({
                                          blockId: block.id,
                                          itemId: ic.itemId,
                                          title: ic.itemTitle,
                                          tag: ic.tag,
                                        })
                                      }
                                      className="text-[10px] font-mono text-[var(--text-secondary)] hover:text-[var(--foreground)] underline"
                                    >
                                      {isEnglish ? 'Edit' : 'Editar'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(block.id, ic.itemId)}
                                      className="text-[10px] font-mono text-rose-500 hover:text-rose-700"
                                    >
                                      {isEnglish ? 'Delete' : 'Excluir'}
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[var(--foreground)] leading-relaxed font-sans">
                                  {ic.comment}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* =============================================================== */}
                  {/* RENDER INNER COMPONENTS WITH SUB-ITEM SELECTORS & MARKERS       */}
                  {/* =============================================================== */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {renderSectionContent(
                      block.key,
                      block.id,
                      isEnglish,
                      renderSelectableItem,
                      activeElementKey,
                      setActiveElementKey,
                      featuredSphere,
                      spheres,
                      featuredSphereKey,
                      setFeaturedSphereKey,
                      showWindowsGuide,
                      setShowWindowsGuide
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ========================================================================= */}
        {/* COMMENT WRITING MODAL / FLOATING BOX                                      */}
        {/* ========================================================================= */}
        {commentingTarget && (
          <div
            className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-3 animate-in fade-in duration-150"
            onClick={() => setCommentingTarget(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-[var(--foreground)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#001f3f] text-white">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Add Note / Comment' : 'Adicionar Anotação / Comentário'}
                    </h3>
                    <p className="text-[11px] font-mono text-[var(--text-secondary)] truncate max-w-xs">
                      {commentingTarget.title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCommentingTarget(null)}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <textarea
                  autoFocus
                  rows={4}
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder={
                    isEnglish
                      ? 'Type your observations, decisions or insights for this item...'
                      : 'Escreva suas percepções, decisões tomadas ou anotações para este item...'
                  }
                  className="w-full text-xs sm:text-sm font-sans leading-relaxed text-[var(--foreground)] bg-[var(--background)] p-3.5 rounded-xl border border-[var(--border)] placeholder:text-[var(--text-tertiary)] focus:outline-hidden focus:border-[#001f3f] dark:focus:border-blue-400 transition-colors"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)] px-1">
                  <span>{commentDraft.length} {isEnglish ? 'characters' : 'caracteres'}</span>
                  <span>{isEnglish ? 'Saved automatically to item marker' : 'Vinculado ao marcador do item'}</span>
                </div>
              </div>

              {/* Quick Tag Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'Quick Tags' : 'Tags Rápidas'}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    isEnglish ? 'Insight' : 'Insight',
                    isEnglish ? 'Decision' : 'Decisão',
                    isEnglish ? 'Attention' : 'Atenção',
                    isEnglish ? 'Milestone' : 'Conquista',
                    isEnglish ? 'Focus' : 'Foco',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const prefix = `[${tag.toUpperCase()}]: `;
                        if (!commentDraft.includes(prefix)) {
                          setCommentDraft((prev) => `${prefix}${prev}`);
                        }
                      }}
                      className="text-[10px] font-mono px-2 py-0.8 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:border-[#001f3f] transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setCommentingTarget(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                >
                  {isEnglish ? 'Cancel' : 'Cancelar'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveCommentDraft}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#001f3f] text-white hover:bg-[#0a192f] text-xs font-mono font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Check size={14} />
                  <span>{isEnglish ? 'Save Note' : 'Salvar Anotação'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM MODAL FOOTER ACTIONS                                               */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 sm:px-6 py-4 bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {isEnglish
                ? `${totalAllCommentsCount} notes written`
                : `${totalAllCommentsCount} anotações registradas`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveFinal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#001f3f] text-white hover:bg-[#0a192f] text-xs font-mono font-bold shadow-sm transition-all cursor-pointer active:scale-98"
            >
              {savedToast ? <Check size={16} /> : <CheckCircle2 size={16} />}
              <span>
                {savedToast
                  ? isEnglish
                    ? 'Report Saved!'
                    : 'Relatório Salvo!'
                  : isEnglish
                  ? 'Save Report to Checkpoint'
                  : 'Salvar Relatório no Checkpoint'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Render section content wrapping each individual index, window and card with renderSelectableItem
 */
function renderSectionContent(
  key: string,
  blockId: string,
  isEnglish: boolean,
  renderItem: (
    blockId: string,
    itemId: string,
    title: string,
    tag: string,
    node: React.ReactNode
  ) => React.ReactNode,
  activeElementKey: 'fire' | 'earth' | 'air' | 'water',
  setActiveElementKey: (k: 'fire' | 'earth' | 'air' | 'water') => void,
  featuredSphere: any,
  spheres: any[],
  featuredSphereKey: string,
  setFeaturedSphereKey: (k: string) => void,
  showWindowsGuide: boolean,
  setShowWindowsGuide: (b: boolean) => void
) {
  switch (key) {
    // =========================================================================
    // 1. ESCALA DE CONSCIÊNCIA
    // =========================================================================
    case 'consciousness_scale':
      return (
        <section className="space-y-4">
          {renderItem(
            blockId,
            'cs_anchor',
            isEnglish ? 'Consciousness Anchor 350' : 'Âncora 350 (Aceitação)',
            'ÂNCO 350',
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/20 space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-tertiary)]">
                {isEnglish ? 'CONSCIOUSNESS ANCHOR' : 'ÂNCORA DE CONSCIÊNCIA'}
              </span>
              <div className="flex items-baseline gap-2.5">
                <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                  {isEnglish ? 'Aceitação' : 'Aceitação'}
                </h3>
                <span className="font-mono text-sm font-semibold text-[#001f3f] dark:text-blue-400">
                  350
                </span>
                <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[9px] font-mono font-bold border border-emerald-500/20">
                  ● SEGUNDO DESPERTAR
                </span>
              </div>
            </div>
          )}

          {renderItem(
            blockId,
            'cs_scale_table',
            isEnglish ? 'Hawkins Levels Table (20 to 1000)' : 'Tabela de Níveis Hawkins (20 a 1000)',
            'ESCALA',
            <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] px-1">
                {isEnglish ? 'Logarithmic Hawkins Spectrum' : 'Espectro Logarítmico Hawkins'}
              </span>
              <div className="relative h-[130px] overflow-y-auto pr-1 space-y-1 py-1 no-scrollbar">
                {energyLevels.map((lvl) => {
                  const isCurrent = lvl.value === '350';
                  return (
                    <div
                      key={lvl.value}
                      className={`w-full h-6 flex items-center justify-between px-2 rounded text-left ${
                        isCurrent
                          ? 'bg-[var(--accent)] text-white font-semibold shadow-xs'
                          : 'text-[var(--text-secondary)] opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[10px] shrink-0 w-7">{lvl.value}</span>
                        <span className={`text-xs truncate ${isCurrent ? 'font-bold' : ''}`}>
                          {lvl.name}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="text-[8px] uppercase tracking-widest font-mono shrink-0 ml-1">
                          ● ATIVO
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {renderItem(
            blockId,
            'cs_synthesis',
            isEnglish ? 'Consciousness Level Synthesis' : 'Síntese do Nível de Consciência',
            'SÍNTESE',
            <p className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/20 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
              {isEnglish
                ? 'Absence of inner resistance, emotional sovereignty, and harmonious executive alignment throughout the day.'
                : 'Segundo limiar de despertar. Perdão, harmonia e ausência de resistência interna durante o dia.'}
            </p>
          )}

          {renderItem(
            blockId,
            'cs_directive',
            isEnglish ? 'Focus Directive (25 min)' : 'Diretriz de Foco (25 min)',
            'FOCO',
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/20 text-xs">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--text-tertiary)]">
                {isEnglish ? 'SUGGESTION' : 'SUGESTÃO'}
              </span>
              <span className="text-[var(--border)]">·</span>
              <span className="font-medium text-[var(--foreground)]">
                {isEnglish ? 'Deep focus block: 25 min' : 'Bloco de foco: 25 min'}
              </span>
            </div>
          )}
        </section>
      );

    // =========================================================================
    // 2. SINTONIA NEUROACÚSTICA
    // =========================================================================
    case 'daily_tune':
      return (
        <section className="space-y-4">
          {renderItem(
            blockId,
            'dt_freq_badge',
            isEnglish ? 'Alpha Wave Resonance Frequency (528 Hz)' : 'Frequência 528 Hz (Ondas Alfa & Transformação)',
            '528 Hz ALFA',
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">
                  {isEnglish ? 'TARGET BRAINWAVE' : 'ONDA CEREBRAL ALVO'}
                </span>
                <h4 className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                  528 Hz · {isEnglish ? 'Alpha Waves (Transform & Balance)' : 'Ondas Alfa (Reparo Biológico)'}
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                10-12 Hz EEG
              </span>
            </div>
          )}

          {renderItem(
            blockId,
            'dt_specs_card',
            isEnglish ? 'Neuroacoustic Wave Technical Specifications' : 'Especificação Técnica da Onda Neuroacústica',
            'ESPECIFICAÇÃO',
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 space-y-3.5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#001f3f] text-white">
                    <Radio size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Solfeggio Resonance & Wave Architecture' : 'Ressonância Solfeggio & Arquitetura de Onda'}
                    </h5>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {isEnglish ? 'Pure Sine Wave · Documented Calibration' : 'Onda Senoidal Pura · Calibração Técnica Documentada'}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  {isEnglish ? 'SYNCHRONIZED' : 'CALIBRADA'}
                </span>
              </div>

              {/* Grid of technical wave parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[var(--text-tertiary)] block">
                    {isEnglish ? 'CARRIER FREQUENCY' : 'FREQ. PORTADORA'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#001f3f] dark:text-blue-300">
                    528 Hz
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] block">
                    {isEnglish ? 'Transformation' : 'Reparação Biológica'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[var(--text-tertiary)] block">
                    {isEnglish ? 'BRAINWAVE BAND' : 'FAIXA CEREBRAL'}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Alfa (10.5 Hz)
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] block">
                    {isEnglish ? 'Calm Alertness' : 'Foco Sereno'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[var(--text-tertiary)] block">
                    {isEnglish ? 'HEMISPHERIC COHERENCE' : 'COERÊNCIA DE FASE'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#001f3f] dark:text-blue-300">
                    94.2%
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] block">
                    {isEnglish ? 'Inter-hemispheric' : 'Inter-hemisférica'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[var(--text-tertiary)] block">
                    {isEnglish ? 'WAVEFORM' : 'PADRÃO ACÚSTICO'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--foreground)]">
                    Senoidal Pura
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] block">
                    {isEnglish ? 'Isochronic Matrix' : 'Matriz Isocrônica'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {renderItem(
            blockId,
            'dt_directive',
            isEnglish ? 'Neuroacoustic Protocol Directive' : 'Diretriz de Protocolo Neuroacústico',
            'DIRETRIZ',
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/20 text-xs text-[var(--text-secondary)] leading-relaxed">
              {isEnglish
                ? 'Recommendation: Listen with binaural headphones for 15-20 minutes before deep cognitive windows.'
                : 'Recomendação: Uso com fones binaurais por 15 a 20 minutos imediatamente antes da Janela Nobre de Foco.'}
            </div>
          )}
        </section>
      );

    // =========================================================================
    // 3. MÉTRICAS DOS 4 ELEMENTOS & ALQUIMIA (INDIVIDUAL SUB-ITEMS)
    // =========================================================================
    case 'element_metrics': {
      const earthData = ELEMENTS_CALIBRATION_DATA.find((e) => e.key === 'earth')!;
      const waterData = ELEMENTS_CALIBRATION_DATA.find((e) => e.key === 'water')!;
      const fireData = ELEMENTS_CALIBRATION_DATA.find((e) => e.key === 'fire')!;
      const airData = ELEMENTS_CALIBRATION_DATA.find((e) => e.key === 'air')!;

      const earthSynth = computeElementSynthesis(earthData, true);
      const waterSynth = computeElementSynthesis(waterData, false);
      const fireSynth = computeElementSynthesis(fireData, false);
      const airSynth = computeElementSynthesis(airData, false);

      return (
        <section className="space-y-4">
          {/* Alchemy Overview Ratio */}
          {renderItem(
            blockId,
            'em_alchemy_summary',
            isEnglish ? 'Elemental Alchemy Ratio (64.8% Coherence)' : 'Taxa de Coerência Alquímica (64.8% Síntese)',
            'ALQUIMIA',
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] tracking-wider">
                  {isEnglish ? 'ELEMENTAL ALCHEMY COHERENCE' : 'COERÊNCIA ALQUÍMICA GLOBAL'}
                </span>
                <span className="text-xs font-mono font-bold text-[#001f3f] dark:text-blue-400">
                  64.8%
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isEnglish
                  ? 'Earth-Water dominant axis. Optimal ground for disciplined execution, clear somatic recovery, and minimal emotional friction.'
                  : 'Alquimia centrada no eixo Terra-Água. Terreno ideal para execução metódica, ancoragem física e serenidade emocional.'}
              </p>
            </div>
          )}

          {/* 4 Element Cards (Each selectable and commentable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Terra */}
            {renderItem(
              blockId,
              'em_elem_earth',
              isEnglish ? 'Earth Element (71% · Materialization)' : 'Elemento Terra (71% · Execução & Matéria)',
              'TERRA 71%',
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mountain size={16} className="text-amber-700 dark:text-amber-400" />
                    <h4 className="text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Earth (71%)' : 'Terra (71%)'}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold">
                    {isEnglish ? 'ASCENDING' : 'ASCENDENTE'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                  {earthSynth.actionDirective}
                </p>
              </div>
            )}

            {/* Água */}
            {renderItem(
              blockId,
              'em_elem_water',
              isEnglish ? 'Water Element (64% · Connection)' : 'Elemento Água (64% · Conexão & Fluidez)',
              'ÁGUA 64%',
              <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Water (64%)' : 'Água (64%)'}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold">
                    {isEnglish ? 'HIGH' : 'EM ALTA'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                  {waterSynth.actionDirective}
                </p>
              </div>
            )}

            {/* Fogo */}
            {renderItem(
              blockId,
              'em_elem_fire',
              isEnglish ? 'Fire Element (56% · Action)' : 'Elemento Fogo (56% · Ação & Vontade)',
              'FOGO 56%',
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-rose-600 dark:text-rose-400" />
                    <h4 className="text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Fire (56%)' : 'Fogo (56%)'}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold">
                    {isEnglish ? 'BALANCED' : 'EQUILIBRADO'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                  {fireSynth.actionDirective}
                </p>
              </div>
            )}

            {/* Ar */}
            {renderItem(
              blockId,
              'em_elem_air',
              isEnglish ? 'Air Element (48% · Intellect)' : 'Elemento Ar (48% · Mente & Estratégia)',
              'AR 48%',
              <div className="p-3 rounded-xl border border-teal-500/30 bg-teal-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind size={16} className="text-teal-600 dark:text-teal-400" />
                    <h4 className="text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Air (48%)' : 'Ar (48%)'}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold">
                    {isEnglish ? 'BALANCED' : 'EQUILIBRADO'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                  {airSynth.actionDirective}
                </p>
              </div>
            )}
          </div>
        </section>
      );
    }

    // =========================================================================
    // 4. CALIBRAÇÃO DOS ELEMENTOS & RECOMENDAÇÕES (GRANULAR SUB-INDICES)
    // =========================================================================
    case 'element_calibration': {
      const activeData = ELEMENTS_CALIBRATION_DATA.find((e) => e.key === activeElementKey) || ELEMENTS_CALIBRATION_DATA[1];
      const ActiveIcon = activeData.icon;

      return (
        <section className="space-y-4">
          {/* Element Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] overflow-x-auto">
            {ELEMENTS_CALIBRATION_DATA.map((elem) => {
              const isSelected = elem.key === activeElementKey;
              const Icon = elem.icon;
              return (
                <button
                  key={elem.key}
                  type="button"
                  onClick={() => setActiveElementKey(elem.key)}
                  className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Icon size={13} />
                  <span>{isEnglish ? elem.nameEn : elem.name}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-indices list: Each single metric is selectable, commentable and removable */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] px-1">
              <span className="uppercase font-bold">
                {isEnglish ? `Sub-indices for ${activeData.nameEn}` : `Sub-índices de ${activeData.name}`}
              </span>
              <span>{activeData.subIndices.length} {isEnglish ? 'metrics' : 'métricas'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeData.subIndices.map((sub) => {
                const itemId = `ec_${activeData.key}_${sub.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                return renderItem(
                  blockId,
                  itemId,
                  `${activeData.name}: ${sub.name} (${sub.value}%)`,
                  `${activeData.name.toUpperCase()} · ${sub.value}%`,
                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/20 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--foreground)] truncate">
                        {sub.name}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[var(--foreground)]">
                        {sub.value}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#001f3f] dark:bg-blue-400"
                        style={{ width: `${sub.value}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-[var(--text-secondary)] leading-snug line-clamp-1">
                      {isEnglish ? sub.descriptionEn : sub.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Directives & Recommendations for this Element */}
          <div className="space-y-2 pt-2 border-t border-[var(--border)]/60">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold px-1">
              {isEnglish ? 'Recommended Directives' : 'Diretrizes & Recomendações do Elemento'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeData.activeSuggestions.map((sugg, sIdx) => {
                const SuggIcon = sugg.icon;
                const itemId = `ec_sugg_${sugg.id}`;
                return renderItem(
                  blockId,
                  itemId,
                  isEnglish ? sugg.titleEn : sugg.title,
                  sugg.tag,
                  <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 shrink-0">
                      <SuggIcon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-mono uppercase px-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold">
                        {isEnglish ? sugg.tagEn : sugg.tag}
                      </span>
                      <h5 className="text-xs font-semibold text-[var(--foreground)] truncate mt-0.5">
                        {isEnglish ? sugg.titleEn : sugg.title}
                      </h5>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    // =========================================================================
    // 5. JANELAS DO RITMO SOLAR (EACH INDIVIDUAL TIME WINDOW IS SELECTABLE)
    // =========================================================================
    case 'day_windows': {
      const windowsList = [
        {
          id: 'dw_w_06_08',
          time: '06:00 — 08:00',
          title: isEnglish ? 'Circadian Activation' : 'Ativação Circadiana',
          tag: isEnglish ? 'PRODUCTIVE' : 'PRODUTIVO',
          tagColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          desc: isEnglish
            ? 'Somatic awakening, cortisol rise, hydration and natural light exposure.'
            : 'Despertar somático, pico de cortisol matinal, hidratação e exposição à luz solar.',
        },
        {
          id: 'dw_w_08_10',
          time: '08:00 — 10:00',
          title: isEnglish ? 'Productive Peak & Executive Clarity' : 'Pico Produtivo & Clareza Executiva',
          tag: isEnglish ? 'CRITICAL WINDOW' : 'JANELA NOBRE',
          tagColor: 'bg-[#001f3f] text-white border-[#001f3f]',
          desc: isEnglish
            ? 'Maximum analytical focus and executive stamina. Protect from multi-tasking.'
            : 'Foco executivo de alta densidade. Bloco inegociável para a entrega mais importante.',
        },
        {
          id: 'dw_w_10_12',
          time: '10:00 — 12:00',
          title: isEnglish ? 'Maintenance & Pragmatic Execution' : 'Manutenção & Execução Pragmática',
          tag: isEnglish ? 'NEUTRAL' : 'NEUTRO',
          tagColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          desc: isEnglish
            ? 'Execution of pending structured tasks, team syncs, and operational flow.'
            : 'Resolução de pendências concretas, reuniões estruturantes e fluxos operacionais.',
        },
        {
          id: 'dw_w_12_14',
          time: '12:00 — 14:00',
          title: isEnglish ? 'Somatic Pause & Digestion' : 'Pausa Somática & Digestão',
          tag: isEnglish ? 'LOW ENERGY' : 'BAIXA ENERGIA',
          tagColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
          desc: isEnglish
            ? 'Mindful lunch, neural reset, quiet breath and gentle movement.'
            : 'Almoço consciente, pausa neural, respiração relaxante e caminhada leve.',
        },
        {
          id: 'dw_w_14_16',
          time: '14:00 — 16:00',
          title: isEnglish ? 'Post-Prandial Transition' : 'Transição & Recuperação Pós-Prandial',
          tag: isEnglish ? 'LOW ENERGY' : 'BAIXA ENERGIA',
          tagColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
          desc: isEnglish
            ? 'Light routine activities, document reading, hydration and cognitive pacing.'
            : 'Atividades mecânicas leves, leituras de alinhamento e hidratação sem sobrecarga.',
        },
        {
          id: 'dw_w_16_18',
          time: '16:00 — 18:00',
          title: isEnglish ? 'Second Wave & Collaboration' : 'Segunda Onda & Colaboração',
          tag: isEnglish ? 'COLLABORATION' : 'SEGUNDA ONDA',
          tagColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
          desc: isEnglish
            ? 'High relational empathy, feedback sharing, and strategic team alignment.'
            : 'Alta empatia relacional, troca de feedbacks e alinhamento colaborativo.',
        },
        {
          id: 'dw_w_18_20',
          time: '18:00 — 20:00',
          title: isEnglish ? 'Executive Close & Synthesis' : 'Fechamento Executivo & Síntese',
          tag: isEnglish ? 'PRODUCTIVE' : 'PRODUTIVO',
          tagColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          desc: isEnglish
            ? 'Review of daily milestones, backlog reorganization and tomorrow prep.'
            : 'Consolidação das entregas do dia, organização do backlog e planejamento de amanhã.',
        },
        {
          id: 'dw_w_20_22',
          time: '20:00 — 22:00',
          title: isEnglish ? 'Night Deceleration & Sleep Prep' : 'Desaceleração Noturna & Higiene do Sono',
          tag: isEnglish ? 'DECELERATION' : 'DESACELERAÇÃO',
          tagColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
          desc: isEnglish
            ? 'Dim blue light exposure, quiet study, warm shower and restorative rest.'
            : 'Redução de luz azul, leitura introspectiva, banho morno e desaceleração do SNC.',
        },
      ];

      return (
        <section className="space-y-4">
          {/* Visual Timeline Bar Overview */}
          {renderItem(
            blockId,
            'dw_timeline_bar',
            isEnglish ? 'Circadian Rhythm Solar Bar (06h — 22h)' : 'Barra do Ritmo Solar Circadiano (06h — 22h)',
            'LINHA DO TEMPO',
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
                  {isEnglish ? 'DAY WINDOWS (06:00 — 22:00)' : 'JANELAS DO DIA (06:00 — 22:00)'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowWindowsGuide(!showWindowsGuide)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  <Info size={14} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full bg-[var(--surface-2)] p-0.5">
                  <div className="h-full flex-2 rounded-xs bg-[var(--success)]" title="06h-08h Ativação" />
                  <div className="h-full flex-2 rounded-xs bg-[var(--success)] ring-2 ring-[var(--foreground)]" title="08h-10h Pico Produtivo" />
                  <div className="h-full flex-2 rounded-xs bg-[var(--warning)]" title="10h-12h Neutro" />
                  <div className="h-full flex-2 rounded-xs bg-[var(--destructive)]/70" title="12h-14h Baixa Energia" />
                  <div className="h-full flex-2 rounded-xs bg-[var(--destructive)]/70" title="14h-16h Fadiga" />
                  <div className="h-full flex-2 rounded-xs bg-[var(--warning)]" title="16h-18h Neutro" />
                  <div className="h-full flex-2 rounded-xs bg-[var(--success)]" title="18h-20h Segunda Onda" />
                  <div className="h-full flex-2 rounded-xs bg-[var(--warning)]" title="20h-22h Desaceleração" />
                </div>

                <div className="flex justify-between text-[9px] font-mono text-[var(--text-tertiary)] px-0.5">
                  {['06h', '09h (Pico)', '12h', '15h', '18h (2ª Onda)', '21h'].map((h) => (
                    <span key={h}>{h}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Granular Individual Time Window Cards (Selectable, Commentable, Removable) */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold px-1">
              {isEnglish ? 'Select Specific Windows to Comment or Remove:' : 'Selecione Janelas Específicas para Comentar ou Remover:'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {windowsList.map((win) => {
                return renderItem(
                  blockId,
                  win.id,
                  `${win.time} · ${win.title}`,
                  win.tag,
                  <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/20 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock size={13} className="text-[var(--text-secondary)] shrink-0" />
                        <span className="font-mono text-xs font-bold text-[var(--foreground)] truncate">
                          {win.time}
                        </span>
                      </div>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-bold ${win.tagColor}`}>
                        {win.tag}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[var(--foreground)]">
                      {win.title}
                    </h4>

                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {win.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    // =========================================================================
    // 6. DAILY POST & 4 ESFERAS DO DIA (GRANULAR SPHERES CARDS)
    // =========================================================================
    case 'daily_post_spheres': {
      return (
        <section className="space-y-4">
          {/* Individual Sphere Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {spheres.map((sphere) => {
              const SphereIcon = sphere.icon;
              const itemId = `dp_sphere_${sphere.key}`;
              return renderItem(
                blockId,
                itemId,
                `${sphere.title} (${sphere.timeWindow})`,
                sphere.tag,
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#001f3f] text-white shrink-0">
                        <SphereIcon size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--foreground)]">
                          {sphere.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                          {sphere.timeWindow}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[var(--surface)] border border-[var(--border)] text-[#001f3f] dark:text-blue-300 font-bold">
                      {sphere.tag}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--foreground)] leading-relaxed font-normal">
                    {sphere.summary}
                  </p>

                  <div className="border-l-2 border-[var(--accent)] pl-2.5 py-0.5">
                    <span className="text-[9px] font-mono uppercase text-[var(--text-secondary)] block">
                      {isEnglish ? 'DIRECTED ACTION' : 'AÇÃO DIRECIONADA'}
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {sphere.actionAdvice}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
