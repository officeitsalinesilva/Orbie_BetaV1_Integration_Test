import React, { useState } from 'react';
import { PenLine, Check, X, Clock, Trash2 } from 'lucide-react';
import { useOrb } from '../../context/OrbContext';

type Props = {
  isEnglish: boolean;
  onClose: () => void;
};

export function JournalEntryModal({ isEnglish, onClose }: Props) {
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useOrb();
  const [content, setContent] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    await addJournalEntry(content.trim(), actionTaken.trim() || undefined);
    setSaving(false);
    setContent('');
    setActionTaken('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const actionSuggestions = isEnglish
    ? ['Deep Focus 45m', 'Strategic Planning', 'Evening Reflection', 'Physical Workout']
    : ['Foco 45m', 'Planejamento', 'Reflexão Noturna', 'Treino'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-secondary)]">
              {isEnglish ? 'DAILY REFLECTION' : 'REFLEXÃO DIÁRIA'}
            </span>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              {isEnglish ? 'Second Brain Log' : 'Registro no Segundo Cérebro'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* New Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isEnglish
                  ? 'Note your insights, state alignments, or decisions...'
                  : 'Registre seus insights, alinhamento ou decisões de hoje...'
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs leading-relaxed text-[var(--foreground)] placeholder-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--accent)]"
            />

            {/* Quick Action Tag Selector */}
            <div className="flex flex-wrap gap-1.5">
              {actionSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActionTaken(actionTaken === tag ? '' : tag)}
                  className={`rounded px-2 py-0.5 font-mono text-[10px] transition-colors ${
                    actionTaken === tag
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[var(--text-tertiary)]">
                {isEnglish ? 'Persisted locally' : 'Persistido localmente'}
              </span>

              <button
                type="submit"
                disabled={saving || !content.trim()}
                className="rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-xs font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 active:scale-98 disabled:opacity-40"
              >
                {saving ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--accent-foreground)] border-t-transparent" />
                ) : (
                  <span>{isEnglish ? 'Save' : 'Salvar'}</span>
                )}
              </button>
            </div>
          </form>

          {savedSuccess && (
            <div className="text-center text-xs font-medium text-[var(--success)]">
              {isEnglish ? 'Reflection saved.' : 'Reflexão salva.'}
            </div>
          )}

          {/* Past Entries List */}
          {journalEntries.length > 0 && (
            <div className="border-t border-[var(--border)] pt-4 space-y-2.5">
              <span className="block text-[10px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
                {isEnglish ? 'RECENT LOGS' : 'REGISTROS RECENTES'}
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="group border-b border-[var(--border)]/50 pb-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] font-mono">
                      <span>{entry.date}</span>
                      <button
                        type="button"
                        onClick={() => void deleteJournalEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)] hover:text-[var(--destructive)] transition-opacity"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--foreground)] leading-relaxed">
                      {entry.content}
                    </p>
                    {entry.actionTaken && (
                      <span className="inline-block mt-1 font-mono text-[10px] text-[var(--accent)] font-medium">
                        · {entry.actionTaken}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
