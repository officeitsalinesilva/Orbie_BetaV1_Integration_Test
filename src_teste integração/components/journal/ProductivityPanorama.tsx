import React, { useState } from 'react';
import { Target, Moon, Activity, ShieldCheck, Info, X } from 'lucide-react';
import { ProductivityIndex } from '../../types';

type Props = {
  isEnglish: boolean;
};

export const PRODUCTIVITY_DATA: ProductivityIndex[] = [
  {
    key: 'focus',
    name: 'Índice Foco',
    value: 84,
    metric: 'Produtividade & Rendimento',
    description: 'Capacidade de sustentação de atenção, concentração profunda e entrega de blocos de alto valor.',
  },
  {
    key: 'vigor',
    name: 'Índice Vigor',
    value: 72,
    metric: 'Sono & Descanso',
    description: 'Restauração fisiológica, qualidade do sono recente e resiliência à fadiga cognitiva.',
  },
  {
    key: 'physical',
    name: 'Índice Físico',
    value: 78,
    metric: 'Saúde & Disposição',
    description: 'Energia somática, circulação, tônus e capacidade de resposta biomecânica do corpo.',
  },
  {
    key: 'neutrality',
    name: 'Índice Neutralidade',
    value: 65,
    metric: 'Equilíbrio Emocional',
    description: 'Estabilidade afetiva, redução de ansiedade e imunidade a oscilações de humor externas.',
  },
];

export function ProductivityPanorama({ isEnglish }: Props) {
  const [selected, setSelected] = useState<ProductivityIndex | null>(null);

  const indices: ProductivityIndex[] = PRODUCTIVITY_DATA.map((item) => {
    if (!isEnglish) return item;
    const enMap: Record<string, { name: string; metric: string; desc: string }> = {
      focus: {
        name: 'Focus Index',
        metric: 'Productivity & Yield',
        desc: 'Deep work endurance, attention span, and high-value project completion.',
      },
      vigor: {
        name: 'Vigor Index',
        metric: 'Sleep & Recovery',
        desc: 'Physiological restoration, sleep quality, and cognitive fatigue resistance.',
      },
      physical: {
        name: 'Physical Index',
        metric: 'Health & Vitality',
        desc: 'Somatic vitality, systemic energy, and biomechanical readiness.',
      },
      neutrality: {
        name: 'Neutrality Index',
        metric: 'Emotional Balance',
        desc: 'Equanimity, stress mitigation, and resilience against external volatility.',
      },
    };
    return {
      ...item,
      name: enMap[item.key].name,
      metric: enMap[item.key].metric,
      description: enMap[item.key].desc,
    };
  });

  const getIcon = (key: string) => {
    switch (key) {
      case 'focus':
        return <Target size={16} className="text-[var(--accent)]" />;
      case 'vigor':
        return <Moon size={16} className="text-[var(--accent)]" />;
      case 'physical':
        return <Activity size={16} className="text-[var(--accent)]" />;
      case 'neutrality':
      default:
        return <ShieldCheck size={16} className="text-[var(--accent)]" />;
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
              {isEnglish ? 'PRODUCTIVITY PANORAMA' : 'PANORAMA DE PRODUTIVIDADE'}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">4 VECTORS</span>
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-[var(--foreground)]">
            {isEnglish ? 'Daily Capacity & Yield' : 'Capacidade e Rendimento Diário'}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setSelected(selected ? null : indices[0])}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          title={isEnglish ? 'Legend' : 'Ver legenda'}
        >
          <Info size={15} />
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {indices.map((idx) => {
          const isSelected = selected?.key === idx.key;
          return (
            <button
              key={idx.key}
              type="button"
              onClick={() => setSelected(isSelected ? null : idx)}
              className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                isSelected
                  ? 'border-[var(--accent)] bg-[var(--surface-2)] shadow-xs'
                  : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--text-tertiary)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--surface-2)]">
                  {getIcon(idx.key)}
                </div>
                <span className="font-mono text-sm font-bold text-[var(--accent)]">
                  {idx.value}%
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-[var(--foreground)] leading-tight">
                  {idx.name}
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--text-secondary)] line-clamp-1">
                  {idx.metric}
                </p>
              </div>

              {/* Mini progress bar */}
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                  style={{ width: `${idx.value}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Detail Drawer */}
      {selected && (
        <div className="mt-4 flex items-start justify-between rounded-lg border border-[var(--accent)]/30 bg-[var(--surface-2)] p-3.5 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[var(--accent)]">
                {selected.value}%
              </span>
              <span className="text-xs font-semibold text-[var(--foreground)]">
                {selected.name}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">
                ({selected.metric})
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              {selected.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
