import React, { useState } from 'react';
import { Clock, Info, X, Zap } from 'lucide-react';
import { DayWindow } from '../../types';

type Props = {
  isEnglish: boolean;
};

export const DAY_WINDOWS: DayWindow[] = [
  {
    id: 'w-1',
    timeRange: '06:00 — 08:00',
    startHour: 6,
    endHour: 8,
    type: 'productive',
    title: 'Início do Dia',
    description: 'Ativação metabólica, rotina matinal e planejamento claro.',
  },
  {
    id: 'w-2',
    timeRange: '08:00 — 10:00',
    startHour: 8,
    endHour: 10,
    type: 'productive',
    title: 'Pico Produtivo',
    description: 'Capacidade analítica máxima. Janela nobre para foco profundo.',
  },
  {
    id: 'w-3',
    timeRange: '10:00 — 12:00',
    startHour: 10,
    endHour: 12,
    type: 'neutral',
    title: 'Transição Neutra',
    description: 'Comunicação, reuniões e alinhamentos de menor esforço solitário.',
  },
  {
    id: 'w-4',
    timeRange: '12:00 — 14:00',
    startHour: 12,
    endHour: 14,
    type: 'low',
    title: 'Baixa Energia',
    description: 'Digestão, desaceleração e descompressão física. Evite decisões críticas.',
  },
  {
    id: 'w-5',
    timeRange: '14:00 — 16:00',
    startHour: 14,
    endHour: 16,
    type: 'low',
    title: 'Fadiga Pós-Prandial',
    description: 'Tarefas operacionais leves e organização de arquivos.',
  },
  {
    id: 'w-6',
    timeRange: '16:00 — 18:00',
    startHour: 16,
    endHour: 18,
    type: 'neutral',
    title: 'Reativação Neutra',
    description: 'Retomada de ritmo, leituras secundárias e finalização de pendências.',
  },
  {
    id: 'w-7',
    timeRange: '18:00 — 20:00',
    startHour: 18,
    endHour: 20,
    type: 'productive',
    title: 'Segunda Onda',
    description: 'Clareza criativa restaurada para projetos autorais e síntese.',
  },
  {
    id: 'w-8',
    timeRange: '20:00 — 22:00',
    startHour: 20,
    endHour: 22,
    type: 'neutral',
    title: 'Desaceleração Noturna',
    description: 'Higiene do sono, desconexão de telas e descanso gradual.',
  },
];

export function DayTimeline({ isEnglish }: Props) {
  const [selectedWindow, setSelectedWindow] = useState<DayWindow | null>(null);

  const nowHour = new Date().getHours();

  const windows: DayWindow[] = DAY_WINDOWS.map((w) => {
    if (!isEnglish) return w;
    const enMap: Record<string, { title: string; desc: string }> = {
      'w-1': { title: 'Early Activation', desc: 'Metabolic activation, morning routine, clear planning.' },
      'w-2': { title: 'Peak Productivity', desc: 'Maximum analytical depth. Prime deep work slot.' },
      'w-3': { title: 'Neutral Transition', desc: 'Communication, syncs, and lower cognitive strain tasks.' },
      'w-4': { title: 'Low Energy Dip', desc: 'Digestion and decompression. Avoid major stress.' },
      'w-5': { title: 'Post-Lunch Slump', desc: 'Light operational tasks, filing, and reading.' },
      'w-6': { title: 'Neutral Reactivation', desc: 'Momentum recovery and wrapping daily loose ends.' },
      'w-7': { title: 'Second Wave Peak', desc: 'Creative synthesis and self-directed strategic projects.' },
      'w-8': { title: 'Evening Wind-down', desc: 'Screen disconnection and gradual sleep preparation.' },
    };
    return {
      ...w,
      title: enMap[w.id].title,
      description: enMap[w.id].desc,
    };
  });

  const getStatusColor = (type: 'productive' | 'neutral' | 'low') => {
    switch (type) {
      case 'productive':
        return {
          bg: 'bg-[var(--success)]',
          border: 'border-[var(--success)]',
          badge: 'bg-[var(--success)]/10 text-[var(--success)]',
          label: isEnglish ? 'Productive' : 'Produtivo',
        };
      case 'neutral':
        return {
          bg: 'bg-[var(--warning)]',
          border: 'border-[var(--warning)]',
          badge: 'bg-[var(--warning)]/10 text-[var(--warning)]',
          label: isEnglish ? 'Neutral' : 'Neutro',
        };
      case 'low':
      default:
        return {
          bg: 'bg-[var(--destructive)]',
          border: 'border-[var(--destructive)]',
          badge: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
          label: isEnglish ? 'Low Energy' : 'Baixa Energia',
        };
    }
  };

  const markers = ['06h', '09h', '12h', '15h', '18h', '21h'];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
              {isEnglish ? 'DAY WINDOWS / TIMELINE' : 'JANELAS DO DIA / LINHA DO TEMPO'}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">06:00 — 22:00</span>
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-[var(--foreground)]">
            {isEnglish ? 'Chronobiological Flow' : 'Fluxo Cronobiológico'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--success)]" /> {isEnglish ? 'High' : 'Alto'}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--warning)]" /> {isEnglish ? 'Neutral' : 'Neutro'}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--destructive)]" /> {isEnglish ? 'Low' : 'Baixo'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedWindow(selectedWindow ? null : windows[1])}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            title={isEnglish ? 'Legend' : 'Ver legenda'}
          >
            <Info size={15} />
          </button>
        </div>
      </div>

      {/* 3-Hour Marker Labels */}
      <div className="mt-6 flex justify-between text-[10px] font-mono text-[var(--text-secondary)] px-1">
        {markers.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>

      {/* Timeline Blocks Bar */}
      <div className="mt-2 flex h-6 w-full gap-1 overflow-hidden rounded-lg bg-[var(--surface-2)] p-1">
        {windows.map((w) => {
          const isSelected = selectedWindow?.id === w.id;
          const isNow = nowHour >= w.startHour && nowHour < w.endHour;
          const colors = getStatusColor(w.type);

          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedWindow(isSelected ? null : w)}
              className={`relative h-full flex-1 rounded-sm transition-all ${colors.bg} ${
                isSelected
                  ? 'ring-2 ring-[var(--foreground)] ring-offset-1 z-10'
                  : 'opacity-85 hover:opacity-100'
              }`}
              title={`${w.timeRange} (${w.title})`}
            >
              {isNow && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--background)] ring-1 ring-[var(--foreground)]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Horizontal Scroller of Window Cards */}
      <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {windows.map((w) => {
          const isSelected = selectedWindow?.id === w.id;
          const isNow = nowHour >= w.startHour && nowHour < w.endHour;
          const colors = getStatusColor(w.type);

          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedWindow(isSelected ? null : w)}
              className={`flex shrink-0 w-44 flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? 'border-[var(--accent)] bg-[var(--surface-2)] shadow-xs'
                  : isNow
                  ? 'border-[var(--accent)] bg-[var(--background)]'
                  : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--text-tertiary)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                    {w.timeRange.replace(' — ', '-')}
                  </span>
                  {isNow && (
                    <span className="flex items-center gap-0.5 rounded bg-[var(--accent)] px-1 py-0.5 font-mono text-[8px] font-bold text-[var(--accent-foreground)]">
                      <Zap size={8} /> {isEnglish ? 'NOW' : 'AGORA'}
                    </span>
                  )}
                </div>
                <h4 className="mt-1 text-xs font-bold text-[var(--foreground)] truncate">
                  {w.title}
                </h4>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-[var(--border)] pt-2">
                <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold ${colors.badge}`}>
                  {colors.label}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                  {w.endHour - w.startHour}h
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail balloon when clicked */}
      {selectedWindow && (
        <div className="mt-4 flex items-start justify-between rounded-lg border border-[var(--accent)]/30 bg-[var(--surface-2)] p-4 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[var(--foreground)]">
                {selectedWindow.timeRange}
              </span>
              <span className="text-xs font-bold text-[var(--foreground)]">
                · {selectedWindow.title}
              </span>
              <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold ${getStatusColor(selectedWindow.type).badge}`}>
                {getStatusColor(selectedWindow.type).label}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              {selectedWindow.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedWindow(null)}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)] shrink-0 ml-2"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
