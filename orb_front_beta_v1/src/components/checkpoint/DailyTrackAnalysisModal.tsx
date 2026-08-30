import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Flame,
  Activity,
  CheckCircle2,
  Layers,
  Save,
  Tag,
  MessageSquare,
  FileText,
  AlertCircle,
  TrendingUp,
  Clock,
  Plus,
} from 'lucide-react';
import { CheckPointAttachedItem, DailyCheckPoint } from '../../types';
import {
  CHECKPOINT_COLORS,
  DAILY_JOURNAL_AVAILABLE_COMPONENTS,
} from './checkpointConstants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  checkPoint: DailyCheckPoint;
  onSaveTrack: (updatedCheckPoint: DailyCheckPoint) => void;
  isEnglish?: boolean;
}

export const DailyTrackAnalysisModal: React.FC<Props> = ({
  isOpen,
  onClose,
  checkPoint,
  onSaveTrack,
  isEnglish = false,
}) => {
  const [items, setItems] = useState<CheckPointAttachedItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Initialize or hydrate items from checkPoint or from defaults
  useEffect(() => {
    if (!isOpen) return;

    if (checkPoint.attachedSnapshot && checkPoint.attachedSnapshot.length > 0) {
      // Use existing snapshot
      setItems(
        checkPoint.attachedSnapshot.map((snap) => ({
          key: snap.key,
          title: snap.title,
          summary: snap.summary,
          tag: snap.tag,
          category: snap.category || 'synthesis',
          excluded: snap.excluded || false,
          userComment: snap.userComment || '',
          userDescription: snap.userDescription || '',
          userAlert: snap.userAlert || 'none',
          alertNote: snap.alertNote || '',
        }))
      );
    } else {
      // Generate default items from Daily Journal components
      const initialItems: CheckPointAttachedItem[] = DAILY_JOURNAL_AVAILABLE_COMPONENTS.map((c) => ({
        key: c.key,
        title: isEnglish ? c.titleEn : c.title,
        summary: isEnglish ? c.summaryEn : c.summary,
        tag: c.tag,
        category: c.category,
        excluded: false,
        userComment: '',
        userDescription: isEnglish ? c.summaryEn : c.summary,
        userAlert: 'none',
        alertNote: '',
      }));
      setItems(initialItems);
    }
    setActiveItemIndex(0);
    setIsSavedSuccess(false);
  }, [isOpen, checkPoint, isEnglish]);

  if (!isOpen) return null;

  const colorConfig =
    CHECKPOINT_COLORS.find((c) => c.id === checkPoint.color) || CHECKPOINT_COLORS[0];

  const updateItem = (index: number, updates: Partial<CheckPointAttachedItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleSave = () => {
    const updatedCheckPoint: DailyCheckPoint = {
      ...checkPoint,
      attachedSnapshot: items,
      attachedComponentKeys: items.filter((i) => !i.excluded).map((i) => i.key),
      updatedAt: new Date().toISOString(),
    };

    onSaveTrack(updatedCheckPoint);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 900);
  };

  const alertLabels = {
    none: {
      labelPt: 'Normal / Equilibrado',
      labelEn: 'Normal / Balanced',
      colorClass: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
      badgeClass: 'bg-neutral-500 text-white',
    },
    attention: {
      labelPt: 'Atenção Necessária',
      labelEn: 'Attention Required',
      colorClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      badgeClass: 'bg-amber-500 text-white',
    },
    critical: {
      labelPt: 'Alerta Crítico / Desvio',
      labelEn: 'Critical Alert',
      colorClass: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
      badgeClass: 'bg-rose-500 text-white',
    },
    opportunity: {
      labelPt: 'Oportunidade de Salto',
      labelEn: 'Growth Opportunity',
      colorClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
      badgeClass: 'bg-emerald-500 text-white',
    },
  };

  const activeItem = items[activeItemIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-[var(--foreground)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400">
              <Layers size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 block">
                {isEnglish ? 'DAILY TRACK ANALYSIS & FORM' : 'FORMULÁRIO DE ANÁLISE • DAILY TRACK'}
              </span>
              <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                {checkPoint.title} • {checkPoint.date}
              </h2>
            </div>
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

        {/* Sub-header instruction */}
        <div className="bg-[var(--surface-2)]/60 px-6 py-2.5 border-b border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
          <span>
            {isEnglish
              ? 'Review, customize comments, exclude or trigger alerts per section'
              : 'Edite descrições, adicione comentários, defina alertas ou remova seções'}
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {items.filter((i) => !i.excluded).length} / {items.length} {isEnglish ? 'active' : 'ativas'}
          </span>
        </div>

        {/* Main 2-Column Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: Sections List */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-[var(--border)] overflow-y-auto p-4 space-y-2 bg-[var(--background)]/50">
            {items.map((item, idx) => {
              const isSelected = activeItemIndex === idx;
              const alertInfo = alertLabels[item.userAlert || 'none'];

              return (
                <div
                  key={item.key || idx}
                  onClick={() => setActiveItemIndex(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-400 bg-[var(--surface-2)] ring-1 ring-blue-500/30 shadow-2xs'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/60'
                  } ${item.excluded ? 'opacity-45' : ''}`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        item.excluded ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--foreground)]'
                      }`}
                    >
                      {item.title}
                    </span>

                    {item.tag && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)]">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">
                    {item.userDescription || item.summary}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                    <span
                      className={`px-1.5 py-0.2 rounded-md border text-[9px] font-bold ${alertInfo.colorClass}`}
                    >
                      {isEnglish ? alertInfo.labelEn : alertInfo.labelPt}
                    </span>

                    {item.userComment && (
                      <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400">
                        <MessageSquare size={10} />
                        <span>{isEnglish ? 'Note' : 'Nota'}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Section Editor */}
          {activeItem ? (
            <div className="md:col-span-7 overflow-y-auto p-6 space-y-6">
              {/* Item Header & Keep/Remove Toggle */}
              <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--text-tertiary)]">
                      {activeItem.tag || (isEnglish ? 'DAILY JOURNAL ELEMENT' : 'COMPONENTE JOURNAL')}
                    </span>
                    {activeItem.excluded && (
                      <span className="rounded-full bg-rose-500/15 text-rose-500 px-2 py-0.2 text-[9px] font-mono font-bold">
                        {isEnglish ? 'REMOVED' : 'REMOVIDO'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--foreground)] mt-0.5">
                    {activeItem.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => updateItem(activeItemIndex, { excluded: !activeItem.excluded })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeItem.excluded
                      ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                      : 'border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  {activeItem.excluded ? (
                    <>
                      <RotateCcw size={13} />
                      <span>{isEnglish ? 'Keep Section' : 'Manter Seção'}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>{isEnglish ? 'Remove Section' : 'Remover Seção'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>{isEnglish ? 'Section Description / Analysis' : 'Descrição / Análise da Seção'}</span>
                </label>
                <textarea
                  value={activeItem.userDescription || activeItem.summary}
                  onChange={(e) => updateItem(activeItemIndex, { userDescription: e.target.value })}
                  placeholder={isEnglish ? 'Enter section description...' : 'Insira a descrição analítica da seção...'}
                  rows={3}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--text-tertiary)] focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Author Comment Field */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>{isEnglish ? 'Author Comment / Personal Note' : 'Comentário Autoral / Reflexão'}</span>
                </label>
                <textarea
                  value={activeItem.userComment || ''}
                  onChange={(e) => updateItem(activeItemIndex, { userComment: e.target.value })}
                  placeholder={
                    isEnglish
                      ? 'Add your personal notes or insight for this section...'
                      : 'Adicione suas notas pessoais, reflexões ou direcionamentos para esta seção...'
                  }
                  rows={2}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--text-tertiary)] focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Alert Level Trigger */}
              <div className="space-y-2.5">
                <label className="text-xs font-mono font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>{isEnglish ? 'Section Alert / Priority' : 'Alerta / Prioridade da Seção'}</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['none', 'attention', 'critical', 'opportunity'] as const).map((lvl) => {
                    const info = alertLabels[lvl];
                    const isSelected = (activeItem.userAlert || 'none') === lvl;

                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => updateItem(activeItemIndex, { userAlert: lvl })}
                        className={`p-2.5 rounded-xl border text-xs font-mono text-center transition-all cursor-pointer ${
                          isSelected
                            ? `${info.colorClass} ring-2 ring-blue-500/50 font-bold`
                            : 'border-[var(--border)] bg-[var(--surface-2)]/50 text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                        }`}
                      >
                        {isEnglish ? info.labelEn : info.labelPt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="md:col-span-7 flex items-center justify-center p-8 text-xs font-mono text-[var(--text-tertiary)]">
              {isEnglish ? 'Select a section to edit' : 'Selecione uma seção para editar'}
            </div>
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className="border-t border-[var(--border)] px-6 py-4 bg-[var(--surface)] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            {isEnglish ? 'Cancel' : 'Cancelar'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-all shadow-md active:scale-98 cursor-pointer"
          >
            {isSavedSuccess ? (
              <>
                <Check size={15} />
                <span>{isEnglish ? 'Saved!' : 'Anexo Salvo!'}</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{isEnglish ? 'Save Daily Track Attachment' : 'Salvar Anexo do Daily Track'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
