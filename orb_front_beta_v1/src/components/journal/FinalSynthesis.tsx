import React, { useState } from 'react';
import { Sparkles, Info, X } from 'lucide-react';

type Props = {
  isEnglish: boolean;
};

export function FinalSynthesis({ isEnglish }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  const textPt =
    'O dia apresenta condições propícias para avanços substanciais em projetos estruturantes de carreira e consolidação de acordos sociais até as 12h. Reserve as primeiras horas para trabalho profundo e proteja seu foco de distrações externas. À tarde, desacelere conscientemente para preservar seu vigor e recupere o ritmo no início da noite com atividades de baixa fricção.';

  const textEn =
    'Today offers prime conditions for substantial momentum on core career initiatives and social agreements prior to 12:00. Safeguard morning hours for deep focus and insulate against non-critical interruptions. In the afternoon, proactively downshift to preserve vitality, resuming steady rhythm in the early evening with low-friction creative tasks.';

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)]">
            <Sparkles size={13} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
              {isEnglish ? 'GENERAL PANORAMA' : 'PANORAMA GERAL'}
            </span>
            <h3 className="text-xs font-bold text-[var(--foreground)]">
              {isEnglish ? 'Unified Neural Synthesis' : 'Síntese Neural Integrada'}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          title={isEnglish ? 'Details' : 'Ver detalhes'}
        >
          <Info size={15} />
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 sm:p-5">
        <p className="font-editorial text-base sm:text-lg leading-relaxed text-[var(--foreground)]">
          "{isEnglish ? textEn : textPt}"
        </p>
      </div>

      {showInfo && (
        <div className="mt-3 flex items-start justify-between rounded-lg border border-[var(--accent)]/30 bg-[var(--surface-2)] p-3.5 animate-in fade-in">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {isEnglish
              ? 'Computed via cross-modal integration of your natal blueprint, real-time biometrics, and active chronobiological windows.'
              : 'Computado por integração multimodal entre matriz natal individual, índices de produtividade e janelas cronobiológicas do dia.'}
          </p>
          <button
            type="button"
            onClick={() => setShowInfo(false)}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)] shrink-0 ml-2"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
