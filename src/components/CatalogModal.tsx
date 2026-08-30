import React from 'react';
import { X, Lock, CheckCircle2, Sparkles, Compass, Moon, Sun, Heart, Flame, Shield, ArrowUpRight } from 'lucide-react';
import { useOrb } from '../context/OrbContext';

type Props = {
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenWallet: () => void;
  isEnglish: boolean;
};

export const CATALOG_ITEMS = [
  {
    id: 'deep-natal-map',
    name: 'Mapa Astral Profundo',
    nameEn: 'Deep Natal Blueprint',
    category: 'Astrologia & Consciência',
    categoryEn: 'Astrology & Consciousness',
    credits: 300,
    locked: true,
    lockReason: 'Complete 100% do seu perfil de nascimento',
    lockReasonEn: 'Complete 100% of birth profile',
    icon: Compass,
    description: 'Análise aprofundada de posições planetárias, casas angulares e regências para seu mapa de vida.',
    descriptionEn: 'Deep analysis of planetary positions, angular houses, and life chart rulers.',
  },
  {
    id: 'synastry-bonds',
    name: 'Análise de Sinastria & Vínculos',
    nameEn: 'Synastry & Interpersonal Bonds',
    category: 'Relações & Vínculos',
    categoryEn: 'Relationships & Bonds',
    credits: 450,
    locked: true,
    lockReason: 'Requer dados de relacionamento no perfil',
    lockReasonEn: 'Requires relationship data in profile',
    icon: Heart,
    description: 'Cruzamento de matrizes de consciência para avaliar harmonia e zonas de atrito relacional.',
    descriptionEn: 'Cross-matrix consciousness analysis to evaluate relational harmony and friction zones.',
  },
  {
    id: 'weekly-oracle-focus',
    name: 'Oráculo Semanal de Foco',
    nameEn: 'Weekly Focus Oracle',
    category: 'Produtividade & Alinhamento',
    categoryEn: 'Productivity & Alignment',
    credits: 120,
    locked: false,
    icon: Flame,
    description: 'Mapeamento das 7 janelas semanais de maior rendimento com diretrizes práticas diárias.',
    descriptionEn: 'Mapping of the 7 peak weekly windows with practical daily directives.',
  },
  {
    id: 'biorhythm-chronotype',
    name: 'Ciclo Biológico & Cronotipo',
    nameEn: 'Biological Cycle & Chronotype',
    category: 'Vitalidade & Ritmo',
    categoryEn: 'Vitality & Rhythm',
    credits: 200,
    locked: false,
    icon: Sun,
    description: 'Sincronização de curvas circadianas com os 4 elementos para maximizar regeneração e vigor.',
    descriptionEn: 'Circadian curve synchronization with the 4 elements to maximize regeneration.',
  },
  {
    id: 'karmic-matrix',
    name: 'Alinhamento & Matriz Kármica',
    nameEn: 'Alignment & Karmic Matrix',
    category: 'Autoconhecimento Profundo',
    categoryEn: 'Deep Self-Discovery',
    credits: 500,
    locked: true,
    lockReason: 'Requer 7 dias de diário preenchido',
    lockReasonEn: 'Requires 7 consecutive daily journals',
    icon: Shield,
    description: 'Identificação de padrões repetitivos e lições evolutivas na sua trajetória pessoal.',
    descriptionEn: 'Identification of repetitive patterns and evolutionary lessons in your path.',
  },
  {
    id: 'mental-polarities',
    name: 'Síntese de Polaridades Mentais',
    nameEn: 'Mental Polarities Synthesis',
    category: 'Psicologia & Foco',
    categoryEn: 'Psychology & Focus',
    credits: 180,
    locked: false,
    icon: Moon,
    description: 'Diagnóstico de sobrecarga analítica e estratégias de equilíbrio entre mente e intuição.',
    descriptionEn: 'Diagnostic of analytical overload and balance strategies between mind and intuition.',
  },
];

export function CatalogModal({ onClose, onOpenProfile, onOpenWallet, isEnglish }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in">
      <div className="flex h-full max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)]/50">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-secondary)]">
              {isEnglish ? 'ORB SERVICES & JOURNEYS' : 'CATÁLOGO DE SERVIÇOS ORB'}
            </span>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {isEnglish ? 'Self-Discovery Journey' : 'Sua Jornada de Autodescoberta'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
            <p className="text-xs leading-relaxed text-[var(--foreground)]">
              {isEnglish
                ? 'Complete your profile information to unlock advanced astrological blueprints and deep consciousness evaluations.'
                : 'Complete as informações do seu perfil para desbloquear análises astrológicas aprofundadas e relatórios avançados de consciência.'}
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfile();
              }}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              <span>{isEnglish ? 'Go to Profile Completion' : 'Ir para o Perfil'}</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {CATALOG_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    item.locked
                      ? 'border-[var(--border)] bg-[var(--surface)]/40 opacity-80'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]">
                        <Icon size={16} />
                      </div>
                      {item.locked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-secondary)]">
                          <Lock size={10} />
                          {isEnglish ? 'Locked' : 'Bloqueado'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 size={10} />
                          {isEnglish ? 'Available' : 'Disponível'}
                        </span>
                      )}
                    </div>

                    <h4 className="mt-3 text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? item.nameEn : item.name}
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                      {isEnglish ? item.descriptionEn : item.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                    <span className="text-xs font-mono font-semibold text-[var(--foreground)]">
                      ◎ {item.credits} {isEnglish ? 'credits' : 'créditos'}
                    </span>

                    {item.locked ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenProfile();
                        }}
                        className="text-[11px] font-medium text-[var(--accent)] hover:underline"
                      >
                        {isEnglish ? 'Unlock' : 'Desbloquear'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenWallet();
                        }}
                        className="rounded-lg bg-[var(--accent)] px-3 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        {isEnglish ? 'Acquire' : 'Adquirir'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
