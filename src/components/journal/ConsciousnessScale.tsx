import React, { useState } from 'react';
import { Sparkles, Info, X } from 'lucide-react';
import { energyLevels } from '../../constants/energyLevels';
import { EnergyLevel } from '../../types';

type Props = {
  isEnglish: boolean;
};

export function ConsciousnessScale({ isEnglish }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<EnergyLevel | null>(null);

  const currentLevelValue = '350';
  const currentLevel = energyLevels.find((lvl) => lvl.value === currentLevelValue) || {
    value: '350',
    name: isEnglish ? 'Acceptance' : 'Aceitação',
    description: isEnglish
      ? 'Forgiveness, transcendence, harmony. Second major awakening threshold.'
      : 'Perdão, transcendência, harmonia. Segundo ponto de despertar.',
    trackPosition: 130,
  };

  const keyTicks = ['20', '50', '100', '150', '200', '250', '310', '350', '400', '500', '600', '700+'];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
              {isEnglish ? 'CONSCIOUSNESS SCALE' : 'ESCALA DE CONSCIÊNCIA'}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">20 — 1000</span>
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-[var(--foreground)]">
            {isEnglish ? 'Consciousness Frequency' : 'Frequência de Consciência'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--background)] px-2.5 py-1 text-xs">
            <Sparkles size={13} className="text-[var(--accent)]" />
            <span className="font-mono font-bold text-[var(--accent)]">{currentLevel.value}</span>
            <span className="font-semibold text-[var(--foreground)]">
              {isEnglish && currentLevel.value === '350' ? 'Acceptance' : currentLevel.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedLevel(selectedLevel ? null : currentLevel)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            title={isEnglish ? 'Legend' : 'Ver legenda'}
          >
            <Info size={15} />
          </button>
        </div>
      </div>

      {/* Featured Current Status */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-3.5">
        <div>
          <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
            {isEnglish ? 'CURRENT STATE CALIBRATION' : 'CALIBRAÇÃO DO ESTADO ATUAL'}
          </span>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-[var(--accent)]">
              {currentLevel.value}
            </span>
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {isEnglish && currentLevel.value === '350' ? 'Acceptance' : currentLevel.name}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
            {isEnglish && currentLevel.value === '350'
              ? 'Forgiveness, transcendence, and inner harmony. Second awakening threshold.'
              : currentLevel.description}
          </p>
        </div>
      </div>

      {/* Numerical Scrubber / Scale */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)] mb-1.5 px-1">
          <span>20 {isEnglish ? '(Base)' : '(Base)'}</span>
          <span className="text-[var(--text-secondary)]">{isEnglish ? 'Click any value to inspect' : 'Clique em qualquer valor para inspecionar'}</span>
          <span>700+ {isEnglish ? '(Awakened)' : '(Desperto)'}</span>
        </div>

        {/* Scrollable Scale Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar border-y border-[var(--border)] px-1">
          {keyTicks.map((val) => {
            const levelObj = energyLevels.find((l) => l.value === val);
            const isCurrent = val === currentLevelValue;
            const isSelected = selectedLevel?.value === val;

            return (
              <button
                key={val}
                type="button"
                onClick={() => setSelectedLevel(levelObj || null)}
                className={`group relative flex shrink-0 flex-col items-center justify-center rounded-lg px-3 py-2 transition-all ${
                  isCurrent
                    ? 'border border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)] shadow-xs'
                    : isSelected
                    ? 'border border-[var(--accent)] bg-[var(--surface-2)] text-[var(--foreground)]'
                    : 'border border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <span className="font-mono text-xs font-bold">{val}</span>
                {isCurrent && (
                  <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider">
                    {isEnglish ? 'Active' : 'Ativo'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pop-up / Balloon when clicked */}
      {selectedLevel && (
        <div className="mt-4 flex items-start justify-between rounded-lg border border-[var(--accent)]/30 bg-[var(--surface-2)] p-3.5 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[var(--accent)]">
                {selectedLevel.value}
              </span>
              <span className="text-xs font-semibold text-[var(--foreground)]">
                {selectedLevel.name}
              </span>
              {selectedLevel.value === currentLevelValue && (
                <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--accent-foreground)]">
                  {isEnglish ? 'Current state' : 'Estado atual'}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              {selectedLevel.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedLevel(null)}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
