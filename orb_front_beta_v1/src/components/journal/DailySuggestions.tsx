import React, { useState } from 'react';
import { Headphones, Dumbbell, BookOpen, Check, Play, Info, X } from 'lucide-react';
import { DailySuggestionItem } from '../../types';

type Props = {
  isEnglish: boolean;
  onOpenAudio: (title: string) => void;
  onOpenActivity: (title: string) => void;
};

export const SUGGESTIONS_DATA: DailySuggestionItem[] = [
  {
    id: 'sug-1',
    type: 'audio',
    title: 'Frequência 528Hz · Foco e Clareza',
    action: 'Preset Áudio Central',
    tag: 'ÁUDIO',
    detail: 'Ondas binaurais calibradas para ancorar estado de fluxo antes de blocos cognitivos intensos.',
  },
  {
    id: 'sug-2',
    type: 'exercise',
    title: 'Caminhada acelerada ou treino leve (+30min)',
    action: 'Atividade Física',
    tag: 'CORPO',
    detail: 'Elevação controlada da frequência cardíaca recomendada para estabilizar o Índice Físico (78%).',
  },
  {
    id: 'sug-3',
    type: 'reading',
    title: 'Leitura estratégica (+30min)',
    action: 'Foco Dirigido',
    tag: 'LEITURA',
    detail: 'Sessão contínua de assimilação conceitual vinculada ao seu pico do Índice Foco (84%).',
  },
];

export function DailySuggestions({ isEnglish, onOpenAudio, onOpenActivity }: Props) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [selectedInfo, setSelectedInfo] = useState<DailySuggestionItem | null>(null);

  const items: DailySuggestionItem[] = SUGGESTIONS_DATA.map((item) => {
    if (!isEnglish) return item;
    const enMap: Record<string, { title: string; action: string; tag: string; detail: string }> = {
      'sug-1': {
        title: '528Hz Frequency · Focus & Clarity',
        action: 'Audio Preset',
        tag: 'AUDIO',
        detail: 'Calibrated binaural frequency to anchor flow state before deep cognitive work.',
      },
      'sug-2': {
        title: 'Brisk Walk or Moderate Workout (+30min)',
        action: 'Physical Activity',
        tag: 'BODY',
        detail: 'Controlled cardiovascular stimulus to sustain somatic vigor (Physical Index 78%).',
      },
      'sug-3': {
        title: 'Strategic Focus Reading (+30min)',
        action: 'Directed Focus',
        tag: 'READING',
        detail: 'Continuous conceptual absorption aligned with your peak Focus Index (84%).',
      },
    };
    return {
      ...item,
      title: enMap[item.id].title,
      action: enMap[item.id].action,
      tag: enMap[item.id].tag,
      detail: enMap[item.id].detail,
    };
  });

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Headphones size={15} className="text-[var(--accent)]" />;
      case 'exercise':
        return <Dumbbell size={15} className="text-[var(--accent)]" />;
      case 'reading':
      default:
        return <BookOpen size={15} className="text-[var(--accent)]" />;
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
              {isEnglish ? 'RECOMMENDED ACTIONS' : 'SUGESTÕES DO DIA'}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">IA DRIVEN</span>
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-[var(--foreground)]">
            {isEnglish ? 'Targeted Interventions' : 'Intervenções Direcionadas'}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setSelectedInfo(selectedInfo ? null : items[0])}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          title={isEnglish ? 'Details' : 'Ver detalhes'}
        >
          <Info size={15} />
        </button>
      </div>

      {/* 3 Pills / Cards */}
      <div className="mt-5 space-y-2.5">
        {items.map((item) => {
          const isDone = !!completed[item.id];
          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.type === 'audio') {
                  onOpenAudio(item.title);
                } else {
                  onOpenActivity(item.title);
                }
              }}
              className={`group flex items-center justify-between rounded-xl border p-3.5 transition-all cursor-pointer ${
                isDone
                  ? 'border-[var(--border)] bg-[var(--background)] opacity-60'
                  : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)]">
                  {getIcon(item.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-[var(--text-secondary)]">
                      {item.tag}
                    </span>
                    <span className="text-[11px] text-[var(--text-tertiary)]">· {item.action}</span>
                  </div>
                  <p
                    className={`mt-0.5 text-xs font-semibold text-[var(--foreground)] truncate ${
                      isDone ? 'line-through' : ''
                    }`}
                  >
                    {item.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => toggleComplete(item.id, e)}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                    isDone
                      ? 'border-[var(--success)] bg-[var(--success)] text-white'
                      : 'border-[var(--border)] hover:border-[var(--accent)] text-transparent hover:text-[var(--text-tertiary)]'
                  }`}
                  title={isDone ? 'Concluído' : 'Marcar como concluído'}
                >
                  <Check size={12} strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail info balloon */}
      {selectedInfo && (
        <div className="mt-4 flex items-start justify-between rounded-lg border border-[var(--accent)]/30 bg-[var(--surface-2)] p-3.5 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--foreground)]">
                {selectedInfo.title}
              </span>
              <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[var(--accent-foreground)]">
                {selectedInfo.tag}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              {selectedInfo.detail}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedInfo(null)}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
