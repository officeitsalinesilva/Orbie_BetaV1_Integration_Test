import React, { useState } from 'react';
import { Users, Briefcase, HeartPulse, AlertTriangle, ChevronRight, Info, X } from 'lucide-react';
import { DailyPostItem } from '../../types';

type Props = {
  isEnglish: boolean;
};

export const DAILY_POST_DATA: DailyPostItem[] = [
  {
    id: 'social',
    area: 'social',
    title: 'Relacionamentos & Vínculos',
    subtitle: 'Interações e Acordos',
    content:
      'Comunicação aberta e receptiva favorece alinhamentos estratégicos. Evite reações precipitadas e priorize escuta ativa em conversas bilaterais.',
  },
  {
    id: 'career',
    area: 'career',
    title: 'Estudos & Carreira',
    subtitle: 'Foco e Decisão',
    content:
      'Janela de clareza máxima até as 12h. Momento favorável para desbloquear decisões estruturantes, consolidar planejamentos e fechar pendências críticas.',
  },
  {
    id: 'health',
    area: 'health',
    title: 'Saúde & Rendimento',
    subtitle: 'Energia e Restauração',
    content:
      'Vigor físico equilibrado após restauração noturna. Mantenha hidratação constante e intercale blocos de foco com pausas ativas de descompressão.',
  },
  {
    id: 'alerts',
    area: 'alerts',
    title: 'Alertas & Cautelas',
    subtitle: 'Atenção e Blindagem',
    content:
      'Curva de energia tende a oscilar entre 12h e 16h. Evite agendar negociações tensas ou tarefas de alta demanda cognitiva nesse intervalo.',
  },
];

export function DailyPostGrid({ isEnglish }: Props) {
  const [selectedArea, setSelectedArea] = useState<DailyPostItem | null>(null);

  const items: DailyPostItem[] = DAILY_POST_DATA.map((item) => {
    if (!isEnglish) return item;
    const enMap: Record<string, { title: string; subtitle: string; content: string }> = {
      social: {
        title: 'Relationships & Social',
        subtitle: 'Connections & Agreements',
        content:
          'Open and receptive communication favors strategic alignment. Avoid reactive judgments and prioritize active listening in one-on-one dialogues.',
      },
      career: {
        title: 'Studies & Career',
        subtitle: 'Focus & Execution',
        content:
          'Peak analytical clarity before noon. Ideal window to resolve structural decisions, advance core projects, and eliminate critical backlog.',
      },
      health: {
        title: 'Health & Vitality',
        subtitle: 'Energy & Somatics',
        content:
          'Balanced somatic vitality post-restoration. Sustain hydration and insert deliberate micro-breaks between demanding cognitive blocks.',
      },
      alerts: {
        title: 'Alerts & Cautions',
        subtitle: 'Vulnerability Window',
        content:
          'Dip in physiological energy between 12:00 and 16:00. Postpone tense negotiations or high-stress demands outside this bracket.',
      },
    };
    return {
      ...item,
      title: enMap[item.area].title,
      subtitle: enMap[item.area].subtitle,
      content: enMap[item.area].content,
    };
  });

  const getIcon = (area: string) => {
    switch (area) {
      case 'social':
        return <Users size={16} className="text-[var(--accent)]" />;
      case 'career':
        return <Briefcase size={16} className="text-[var(--accent)]" />;
      case 'health':
        return <HeartPulse size={16} className="text-[var(--accent)]" />;
      case 'alerts':
      default:
        return <AlertTriangle size={16} className="text-[var(--warning)]" />;
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
              {isEnglish ? 'DAILY POST / 4 SPHERES' : 'DAILY POST / 4 ESFERAS'}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">SYNTHESIS</span>
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-[var(--foreground)]">
            {isEnglish ? 'Domain Guidance' : 'Diretrizes por Esfera'}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setSelectedArea(selectedArea ? null : items[0])}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          title={isEnglish ? 'Legend' : 'Ver legenda'}
        >
          <Info size={15} />
        </button>
      </div>

      {/* 2x2 Bento Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {items.map((item) => {
          const isSelected = selectedArea?.id === item.id;
          const isAlert = item.area === 'alerts';

          return (
            <div
              key={item.id}
              onClick={() => setSelectedArea(isSelected ? null : item)}
              className={`group flex flex-col justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'border-[var(--accent)] bg-[var(--surface-2)] shadow-xs'
                  : isAlert
                  ? 'border-[var(--warning)]/30 bg-[var(--background)] hover:border-[var(--warning)]'
                  : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--surface-2)]">
                      {getIcon(item.area)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--foreground)] leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-[var(--text-tertiary)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--foreground)]"
                  />
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {item.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail modal/drawer for deep reflection */}
      {selectedArea && (
        <div className="mt-4 flex items-start justify-between rounded-lg border border-[var(--accent)]/30 bg-[var(--surface-2)] p-4 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--foreground)]">
                {selectedArea.title}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                · {selectedArea.subtitle}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--foreground)] font-medium">
              {selectedArea.content}
            </p>
            <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
              {isEnglish
                ? 'Source: Neural synthesis combining personal natal profile and real-time planetary transits.'
                : 'Fonte: Síntese neural integrando perfil natal individual e trânsitos astrométricos do dia.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedArea(null)}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)] shrink-0 ml-2"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
