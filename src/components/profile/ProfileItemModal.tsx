import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Layers,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ProfileLibraryItem } from './profileCatalogData';

type Props = {
  item: ProfileLibraryItem | null;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  userCredits: number;
  onPurchase: (item: ProfileLibraryItem) => void;
  onOpenItem?: (item: ProfileLibraryItem) => void;
  isEnglish?: boolean;
};

export function ProfileItemModal({
  item,
  isOpen,
  onClose,
  isUnlocked,
  userCredits,
  onPurchase,
  onOpenItem,
  isEnglish = false,
}: Props) {
  if (!isOpen || !item) return null;

  const hasEnoughCredits = userCredits >= item.credits;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold text-[var(--accent)] px-1.5 py-0.5 rounded bg-[var(--accent)]/10">
                {item.code}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                {item.category}
              </span>
              {isUnlocked && (
                <span className="text-[9px] font-mono font-bold uppercase text-[var(--success)] bg-[var(--success)]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Check size={10} strokeWidth={3} />
                  {isEnglish ? 'Unlocked' : 'Liberado'}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] leading-snug">
              {isEnglish && item.nameEn ? item.nameEn : item.name}
            </h3>
            {item.pages && (
              <span className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 block">
                {item.pages}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isEnglish ? 'Close modal' : 'Fechar modal'}
            className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Descrição Detalhada */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-secondary)] tracking-wider">
            {isEnglish ? 'Product Description' : 'Sobre o Produto'}
          </h4>
          <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed font-sans bg-[var(--surface-2)]/40 p-3.5 rounded-xl border border-[var(--border)]">
            {isEnglish && item.descriptionEn ? item.descriptionEn : item.description}
          </p>
        </div>

        {/* Passo a Passo para Geração / Uso */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-secondary)] tracking-wider flex items-center gap-1.5">
            <Layers size={13} className="text-[var(--accent)]" />
            <span>{isEnglish ? 'Generation & Synthesis Steps' : 'Passo a Passo de Geração'}</span>
          </h4>

          <div className="space-y-2">
            {(isEnglish && item.stepsEn ? item.stepsEn : item.steps).map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)]"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-mono text-[10px] font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 pt-0.5 font-sans leading-snug">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé do Modal / Ações de Compra ou Acesso */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[var(--text-secondary)]">
              {isEnglish ? 'Status:' : 'Status:'}
            </span>
            {isUnlocked ? (
              <span className="text-[var(--success)] font-bold">
                {isEnglish ? 'Available in Library' : 'Disponível na Biblioteca'}
              </span>
            ) : (
              <span className="text-[var(--foreground)] font-bold">
                ◎ {item.credits} {isEnglish ? 'credits' : 'créditos'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              {isEnglish ? 'Close' : 'Fechar'}
            </button>

            {isUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenItem?.(item);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-mono text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Sparkles size={14} />
                <span>{isEnglish ? 'Open & Generate' : 'Acessar & Gerar'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onPurchase(item);
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                  hasEnoughCredits
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90'
                    : 'bg-amber-500 text-black hover:bg-amber-400'
                }`}
              >
                <Lock size={13} />
                <span>
                  {hasEnoughCredits
                    ? isEnglish ? `Unlock for ◎ ${item.credits}` : `Liberar por ◎ ${item.credits}`
                    : isEnglish ? `Get credits (◎ ${item.credits})` : `Recarregar (◎ ${item.credits})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
