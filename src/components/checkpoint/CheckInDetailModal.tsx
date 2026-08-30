import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Edit3,
  Paperclip,
  CheckCircle2,
  Share2,
  Layers,
  HeartPulse,
  FileText,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Sliders,
  Check,
} from 'lucide-react';
import { DailyCheckPoint, JournalReportBlock } from '../../types';
import {
  CHECKPOINT_COLORS,
  CHECKPOINT_ICONS,
} from './checkpointConstants';
import { DailyJournalReportModal } from './DailyJournalReportModal';
import { DailyJournalAttachmentModal } from './DailyJournalAttachmentModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  checkPoint: DailyCheckPoint | null;
  onEdit?: (checkPoint: DailyCheckPoint) => void;
  onUpdateCheckPoint?: (checkPoint: DailyCheckPoint) => void;
  isToday?: boolean;
  isEnglish?: boolean;
}

export const CheckInDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  checkPoint,
  onEdit,
  onUpdateCheckPoint,
  isToday = false,
  isEnglish = false,
}) => {
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (!isOpen || !checkPoint) return null;

  const colorConfig =
    CHECKPOINT_COLORS.find((c) => c.id === checkPoint.color) || CHECKPOINT_COLORS[0];
  const IconComp =
    CHECKPOINT_ICONS.find((i) => i.id === checkPoint.icon)?.icon || Sparkles;

  const formattedDate = () => {
    try {
      const [year, month, day] = checkPoint.date.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString(isEnglish ? 'en-US' : 'pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return checkPoint.date;
    }
  };

  const formattedTime = () => {
    try {
      const d = new Date(checkPoint.updatedAt || checkPoint.createdAt);
      return d.toLocaleTimeString(isEnglish ? 'en-US' : 'pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const handleSaveReportBlocks = (blocks: JournalReportBlock[]) => {
    if (onUpdateCheckPoint) {
      onUpdateCheckPoint({
        ...checkPoint,
        journalReportBlocks: blocks,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const activeReportBlocks = checkPoint.journalReportBlocks?.filter((b) => !b.excluded) || [];
  const reportComments = checkPoint.journalReportBlocks?.filter((b) => !b.excluded && b.comment?.trim()) || [];

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 text-[var(--foreground)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)] shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorConfig.borderClass} ${colorConfig.bgClass} ${colorConfig.textClass}`}
              >
                <IconComp size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#001f3f] dark:text-blue-400">
                    DAILY CHECKPOINT
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-[#001f3f] text-white px-2 py-0.5 text-[9px] font-mono font-bold">
                      {isEnglish ? 'TODAY' : 'HOJE'}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                  {checkPoint.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(checkPoint);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-xs font-mono text-[var(--foreground)] hover:border-[#001f3f] transition-colors cursor-pointer mr-1"
                >
                  <Edit3 size={13} />
                  <span>{isEnglish ? 'Edit' : 'Editar'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label={isEnglish ? 'Close' : 'Fechar'}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer active:scale-95"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Metadata bar */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 text-xs font-mono text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5 capitalize">
                <Calendar size={14} className="text-[#001f3f] dark:text-blue-400" />
                <span>{formattedDate()}</span>
              </div>

              {formattedTime() && (
                <div className="flex items-center gap-1">
                  <Clock size={13} className="text-[var(--text-tertiary)]" />
                  <span>{formattedTime()}</span>
                </div>
              )}
            </div>

            {/* Description / Author Commentary Block */}
            {checkPoint.authorComment ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-1.5">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--text-tertiary)] block">
                  {isEnglish ? 'AUTHORIAL DESCRIPTION' : 'DESCRIÇÃO / RELATÓRIO AUTORAL'}
                </span>
                <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap font-sans">
                  {checkPoint.authorComment}
                </p>
              </div>
            ) : null}

            {/* Attachment Card: Daily Journal Snapshot */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#001f3f]/10 dark:bg-blue-400/15 text-[#001f3f] dark:text-blue-400 shrink-0">
                  <Paperclip size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[var(--foreground)]">
                    {isEnglish ? 'Daily Journal Attachment' : 'Anexo do Daily Journal'}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">
                    {isEnglish ? 'Snapshot metrics, consciousness 350 & alchemy' : 'Snapshot de métricas, consciência 350 e alquimia'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAttachmentModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-mono font-semibold text-[var(--foreground)] hover:border-[#001f3f] transition-all cursor-pointer shadow-2xs shrink-0"
              >
                {isEnglish ? 'Open Attachment' : 'Abrir Anexo'}
              </button>
            </div>

            {/* Report Card: Digital Notebook Report */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#001f3f] text-white shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[var(--foreground)]">
                        {isEnglish ? 'Daily Journal Report' : 'Relatório do Daily Journal'}
                      </h4>
                      {activeReportBlocks.length > 0 && (
                        <span className="rounded bg-[#001f3f]/10 dark:bg-blue-400/20 text-[#001f3f] dark:text-blue-300 px-1.5 py-0.2 text-[9px] font-mono font-bold">
                          {activeReportBlocks.length} {isEnglish ? 'blocks' : 'blocos'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {activeReportBlocks.length > 0
                        ? isEnglish
                          ? `Custom digital notebook with ${reportComments.length} notes`
                          : `Caderno digital customizado com ${reportComments.length} comentários`
                        : isEnglish
                        ? 'Generate customizable blocks & comments'
                        : 'Caderno digital com comentários por bloco'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#001f3f] text-white hover:bg-[#0a192f] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs shrink-0"
                >
                  {activeReportBlocks.length > 0
                    ? isEnglish
                      ? 'Edit Report'
                      : 'Editar Relatório'
                    : isEnglish
                    ? 'Generate Report'
                    : 'Gerar Relatório'}
                </button>
              </div>

              {/* Preview comments if any */}
              {reportComments.length > 0 && (
                <div className="pt-2 border-t border-[var(--border)]/60 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] font-bold">
                    {isEnglish ? 'Recent Notes Preview' : 'Prévia de Comentários do Caderno'}:
                  </span>
                  <div className="space-y-1">
                    {reportComments.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className="text-[11px] text-[var(--foreground)] bg-[var(--background)] p-2 rounded-md border border-[var(--border)]/50 flex items-start gap-1.5"
                      >
                        <MessageSquare size={11} className="text-[#001f3f] dark:text-blue-400 shrink-0 mt-0.5" />
                        <span className="truncate">
                          <strong>{isEnglish ? b.titleEn : b.title}:</strong> {b.comment}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer info */}
          <div className="border-t border-[var(--border)] px-6 py-3.5 bg-[var(--surface)] flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)] shrink-0">
            <span>
              {isEnglish ? 'Sovereign daily record' : 'Registro soberano do dia'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-bold hover:opacity-90 transition-opacity cursor-pointer text-xs"
            >
              {isEnglish ? 'Close' : 'Fechar'}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Journal Attachment Modal */}
      <DailyJournalAttachmentModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        currentDateStr={checkPoint.date}
        isEnglish={isEnglish}
      />

      {/* Daily Journal Report Modal (Caderno Digital) */}
      <DailyJournalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentDateStr={checkPoint.date}
        initialBlocks={checkPoint.journalReportBlocks}
        onSaveReport={handleSaveReportBlocks}
        isEnglish={isEnglish}
      />
    </>
  );
};
