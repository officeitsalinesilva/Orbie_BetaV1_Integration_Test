import React, { useState } from 'react';
import { Flame, Mountain, Wind, Droplets, Info, X } from 'lucide-react';
import { AlchemyElement } from '../../types';

type Props = {
  isEnglish: boolean;
};

export const ALCHEMY_DATA: AlchemyElement[] = [
  {
    key: 'fire',
    name: 'Fogo',
    value: 56,
    archetype: 'Vontade & Impulso',
    description: 'Capacidade de iniciativa, dinamismo e transformação ativa. Estimula ação direta e coragem.',
  },
  {
    key: 'earth',
    name: 'Terra',
    value: 71,
    archetype: 'Estrutura & Execução',
    description: 'Estabilidade prática, disciplina material e consistência. Favorece conclusão de tarefas.',
  },
  {
    key: 'air',
    name: 'Ar',
    value: 48,
    archetype: 'Clareza & Síntese',
    description: 'Agilidade mental, articulação de ideias e perspectiva analítica.',
  },
  {
    key: 'water',
    name: 'Água',
    value: 64,
    archetype: 'Fluidez & Receptividade',
    description: 'Sensibilidade interpessoal, empatia, escuta e adaptação a imprevistos.',
  },
];

export function AlchemyGraph({ isEnglish }: Props) {
  const [selected, setSelected] = useState<AlchemyElement | null>(null);

  const elements: AlchemyElement[] = ALCHEMY_DATA.map((item) => {
    if (!isEnglish) return item;
    const enNames: Record<string, { name: string; archetype: string; desc: string }> = {
      fire: {
        name: 'Fire',
        archetype: 'Drive & Will',
        desc: 'Initiative capacity, dynamism, and active transformation.',
      },
      earth: {
        name: 'Earth',
        archetype: 'Structure & Execution',
        desc: 'Practical stability, material discipline, and consistency.',
      },
      air: {
        name: 'Air',
        archetype: 'Clarity & Synthesis',
        desc: 'Mental agility, articulation of concepts, and perspective.',
      },
      water: {
        name: 'Water',
        archetype: 'Flow & Receptivity',
        desc: 'Interpersonal sensitivity, empathy, and intuitive adaptation.',
      },
    };
    return {
      ...item,
      name: enNames[item.key].name,
      archetype: enNames[item.key].archetype,
      description: enNames[item.key].desc,
    };
  });

  const getIcon = (key: string) => {
    switch (key) {
      case 'fire':
        return <Flame size={14} className="text-[var(--accent)]" />;
      case 'earth':
        return <Mountain size={14} className="text-[var(--accent)]" />;
      case 'air':
        return <Wind size={14} className="text-[var(--accent)]" />;
      case 'water':
      default:
        return <Droplets size={14} className="text-[var(--accent)]" />;
    }
  };

  // Math for 4-axis diamond radar chart
  // Top: Fire (56%), Right: Earth (71%), Bottom: Water (64%), Left: Air (48%)
  const cx = 80;
  const cy = 80;
  const maxR = 60;

  const pFire = { x: cx, y: cy - (elements[0].value / 100) * maxR };
  const pEarth = { x: cx + (elements[1].value / 100) * maxR, y: cy };
  const pWater = { x: cx, y: cy + (elements[3].value / 100) * maxR };
  const pAir = { x: cx - (elements[2].value / 100) * maxR, y: cy };

  const polygonPath = `${pFire.x},${pFire.y} ${pEarth.x},${pEarth.y} ${pWater.x},${pWater.y} ${pAir.x},${pAir.y}`;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
              {isEnglish ? 'ELEMENTAL ALCHEMY' : 'ALQUIMIA ELEMENTAL'}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">4 AXIS</span>
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-[var(--foreground)]">
            {isEnglish ? 'Elemental Distribution' : 'Distribuição dos 4 Elementos'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setSelected(selected ? null : elements[0])}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          title={isEnglish ? 'Legend' : 'Ver legenda'}
        >
          <Info size={15} />
        </button>
      </div>

      {/* Grid: 4-axis SVG Radar + Element Metrics */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 items-center gap-6">
        {/* Radar Lineart */}
        <div className="sm:col-span-5 flex justify-center">
          <div className="relative h-44 w-44">
            <svg viewBox="0 0 160 160" className="h-full w-full">
              {/* Background Concentric Diamond Guides */}
              {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                <polygon
                  key={i}
                  points={`${cx},${cy - maxR * scale} ${cx + maxR * scale},${cy} ${cx},${
                    cy + maxR * scale
                  } ${cx - maxR * scale},${cy}`}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="0.8"
                  strokeDasharray={scale === 1 ? 'none' : '2 2'}
                />
              ))}

              {/* Axes lines */}
              <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="var(--border)" strokeWidth="1" />
              <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="var(--border)" strokeWidth="1" />

              {/* Data Area */}
              <polygon
                points={polygonPath}
                className="fill-[var(--accent)]/15 stroke-[var(--accent)]"
                strokeWidth="1.6"
              />

              {/* Data Points */}
              <circle cx={pFire.x} cy={pFire.y} r="3.5" className="fill-[var(--accent)]" />
              <circle cx={pEarth.x} cy={pEarth.y} r="3.5" className="fill-[var(--accent)]" />
              <circle cx={pWater.x} cy={pWater.y} r="3.5" className="fill-[var(--accent)]" />
              <circle cx={pAir.x} cy={pAir.y} r="3.5" className="fill-[var(--accent)]" />

              {/* Axis Micro Labels */}
              <text x={cx} y={cy - maxR - 6} textAnchor="middle" className="fill-[var(--text-secondary)] text-[8px] font-mono">
                {elements[0].name.slice(0, 3).toUpperCase()} {elements[0].value}%
              </text>
              <text x={cx + maxR + 8} y={cy + 3} textAnchor="start" className="fill-[var(--text-secondary)] text-[8px] font-mono">
                {elements[1].name.slice(0, 3).toUpperCase()} {elements[1].value}%
              </text>
              <text x={cx} y={cy + maxR + 12} textAnchor="middle" className="fill-[var(--text-secondary)] text-[8px] font-mono">
                {elements[3].name.slice(0, 3).toUpperCase()} {elements[3].value}%
              </text>
              <text x={cx - maxR - 8} y={cy + 3} textAnchor="end" className="fill-[var(--text-secondary)] text-[8px] font-mono">
                {elements[2].name.slice(0, 3).toUpperCase()} {elements[2].value}%
              </text>
            </svg>
          </div>
        </div>

        {/* 4 Interactive Element Bars */}
        <div className="sm:col-span-7 space-y-2.5">
          {elements.map((el) => {
            const isHovered = selected?.key === el.key;
            return (
              <button
                key={el.key}
                type="button"
                onClick={() => setSelected(isHovered ? null : el)}
                className={`w-full rounded-lg border p-2.5 text-left transition-all ${
                  isHovered
                    ? 'border-[var(--accent)] bg-[var(--surface-2)] shadow-xs'
                    : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--text-tertiary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(el.key)}
                    <span className="text-xs font-semibold text-[var(--foreground)]">{el.name}</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">· {el.archetype}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--accent)]">{el.value}%</span>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${el.value}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline detail drawer / balloon for clicked element */}
      {selected && (
        <div className="mt-4 flex items-start justify-between rounded-lg border border-[var(--accent)]/30 bg-[var(--surface-2)] p-3.5 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[var(--accent)]">{selected.value}%</span>
              <span className="text-xs font-semibold text-[var(--foreground)]">{selected.name}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">({selected.archetype})</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{selected.description}</p>
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
