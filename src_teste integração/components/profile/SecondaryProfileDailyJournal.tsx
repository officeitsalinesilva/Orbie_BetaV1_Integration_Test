import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Info,
  X,
  Briefcase,
  Users,
  HeartPulse,
  AlertTriangle,
  Flame,
  Mountain,
  Wind,
  Droplets,
  type LucideIcon,
} from 'lucide-react';
import { energyLevels } from '../../constants/energyLevels';
import { EnergyLevel } from '../../types';
import { DailyTuneSection } from '../journal/DailyTuneSection';
import { ElementMetricsSection } from '../journal/ElementMetricsSection';
import { ElementCalibrationSection } from '../journal/ElementCalibrationSection';

export interface DayWindow {
  id: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  type: 'productive' | 'neutral' | 'low';
  title: string;
  description: string;
}

const DAY_WINDOWS_LIST: DayWindow[] = [
  { id: 'w1', timeRange: '06h-08h', startHour: 6, endHour: 8, type: 'productive', title: 'Início do Dia', description: 'Ativação metabólica, rotina matinal e planejamento claro.' },
  { id: 'w2', timeRange: '08h-10h', startHour: 8, endHour: 10, type: 'productive', title: 'Pico Produtivo', description: 'Capacidade analítica máxima. Janela nobre para trabalho profundo.' },
  { id: 'w3', timeRange: '10h-12h', startHour: 10, endHour: 12, type: 'neutral', title: 'Transição Neutra', description: 'Comunicação, reuniões e alinhamentos de menor esforço solitário.' },
  { id: 'w4', timeRange: '12h-14h', startHour: 12, endHour: 14, type: 'low', title: 'Baixa Energia', description: 'Digestão, desaceleração e descompressão física. Evite decisões críticas.' },
  { id: 'w5', timeRange: '14h-16h', startHour: 14, endHour: 16, type: 'low', title: 'Fadiga Pós-Prandial', description: 'Tarefas operacionais leves, leituras secundárias e organização.' },
  { id: 'w6', timeRange: '16h-18h', startHour: 16, endHour: 18, type: 'neutral', title: 'Reativação Neutra', description: 'Retomada de ritmo e fechamento de pendências operacionais.' },
  { id: 'w7', timeRange: '18h-20h', startHour: 18, endHour: 20, type: 'productive', title: 'Segunda Onda', description: 'Clareza criativa restaurada para projetos autorais e síntese.' },
  { id: 'w8', timeRange: '20h-22h', startHour: 20, endHour: 22, type: 'neutral', title: 'Desaceleração Noturna', description: 'Higiene do sono, desconexão de telas e descanso gradual.' },
];

interface SpherePost {
  key: string;
  title: string;
  tag: string;
  timeWindow: string;
  icon: LucideIcon;
  summary: string;
  actionAdvice: string;
}

interface Props {
  entity: {
    id: string;
    type: 'profile' | 'event';
    name: string;
    subLabel?: string;
    cityOrLocation?: string;
    birthOrEventDate?: string;
    icon?: string;
    notifyEnabled?: boolean;
    description?: string;
  };
  isEnglish?: boolean;
}

export function SecondaryProfileDailyJournal({ entity, isEnglish = false }: Props) {
  const [activeElementKey, setActiveElementKey] = useState<'fire' | 'earth' | 'air' | 'water'>('earth');
  const [selectedLevelInfo, setSelectedLevelInfo] = useState<EnergyLevel | null>(null);
  const [selectedWindowInfo, setSelectedWindowInfo] = useState<DayWindow | null>(null);
  const [showWindowsGuide, setShowWindowsGuide] = useState(false);
  const [featuredSphereKey, setFeaturedSphereKey] = useState<string>('career');

  const scaleContainerRef = useRef<HTMLDivElement>(null);
  const activeLevelRef = useRef<HTMLButtonElement>(null);

  const nowHour = new Date().getHours();
  const day = new Date().getDate();

  // Scroll active level into center view
  useEffect(() => {
    if (activeLevelRef.current && scaleContainerRef.current) {
      const container = scaleContainerRef.current;
      const element = activeLevelRef.current;
      const elementOffsetTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.offsetHeight;
      container.scrollTop = elementOffsetTop - containerHeight / 2 + elementHeight / 2;
    }
  }, []);

  const currentActiveWindow =
    DAY_WINDOWS_LIST.find((w) => nowHour >= w.startHour && nowHour < w.endHour) || DAY_WINDOWS_LIST[1];
  const activeOrSelectedWindow = selectedWindowInfo || currentActiveWindow;

  const getSpheresForWindow = (windowItem: DayWindow): SpherePost[] => {
    const isPerson = entity.type === 'profile';
    const entityName = entity.name;

    switch (windowItem.id) {
      case 'w1': // 06h-08h
        return [
          {
            key: 'career',
            title: isEnglish ? `Morning Alignment for ${entityName}` : `Planejamento & Alinhamento de ${entityName}`,
            tag: isEnglish ? 'ALIGNMENT' : 'ALINHAMENTO',
            timeWindow: windowItem.timeRange,
            icon: Briefcase,
            summary: isEnglish
              ? `Early activation window. Review deliverables and core strategic milestones mapped for ${entityName}.`
              : `Janela de ativação matinal. Defina as entregas centrais e prioridades estratégicas mapeadas para ${entityName}.`,
            actionAdvice: isEnglish
              ? `Establish top 3 focal points before checking incoming alerts.`
              : `Estruture os 3 objetivos prioritários antes de abrir demandas externas.`,
          },
          {
            key: 'social',
            title: isEnglish ? 'Synastry & Clear Sync' : 'Sinastria & Comunicação Serena',
            tag: isEnglish ? 'ROUTINE' : 'ROTINA',
            timeWindow: windowItem.timeRange,
            icon: Users,
            summary: isEnglish
              ? `Harmonious communication bracket. Sync agenda and coordinate upcoming collaborative touchpoints.`
              : `Comunicação pontual e serena. Ajuste a sintonia relacional e alinhe expectativas sem ruídos.`,
            actionAdvice: isEnglish
              ? `Confirm essential presence and check-ins clearly.`
              : `Envie confirmações essenciais com clareza para manter o fluxo desimpedido.`,
          },
          {
            key: 'health',
            title: isEnglish ? 'Hydration & Energetic Charge' : 'Hidratação & Ativação de Vigor',
            tag: isEnglish ? 'SOMATIC' : 'SOMÁTICO',
            timeWindow: windowItem.timeRange,
            icon: HeartPulse,
            summary: isEnglish
              ? `Metabolic grounding. Water intake, natural light, and intentional breathing for sustained daytime vigor.`
              : `Despertar metabólico. Hidratação, contato com luz natural e respiração consciente para ancorar a energia do dia.`,
            actionAdvice: isEnglish
              ? `5-10 minutes of direct sunlight exposure and posture reset.`
              : `5 a 10 minutos de luz natural e respiração diafragmática para ativar o tônus.`,
          },
          {
            key: 'alerts',
            title: isEnglish ? 'Shield from Morning Noise' : 'Blindagem contra Ruído Precoce',
            tag: isEnglish ? 'PREVENTION' : 'PREVENÇÃO',
            timeWindow: windowItem.timeRange,
            icon: AlertTriangle,
            summary: isEnglish
              ? `Avoid reactive multitasking or early tension before consolidating core mental clarity.`
              : `Evite dispersão ou discussões desnecessárias antes de consolidar o foco matinal.`,
            actionAdvice: isEnglish
              ? `Protect the first 30 minutes with focused intention.`
              : `Preserve os primeiros 30 minutos focado na intenção consciente.`,
          },
        ];
      case 'w2': // 08h-10h
        return [
          {
            key: 'career',
            title: isEnglish ? 'High Throughput & Strategic Focus' : 'Trabalho Profundo & Foco Máximo',
            tag: isEnglish ? 'PEAK FOCUS' : 'FOCO MÁXIMO',
            timeWindow: windowItem.timeRange,
            icon: Briefcase,
            summary: isEnglish
              ? `Prime intellectual window. Dedicate this slot to the most demanding tasks, architectural decisions, and major output for ${entityName}.`
              : `Janela nobre de rendimento máximo. Enfrente o desafio mais exigente, elabore soluções estruturantes e execute sem interrupções.`,
            actionAdvice: isEnglish
              ? `Lock single-task immersion without context-switching.`
              : `Trave bloco de imersão monotarefa sem alternar abas ou aplicativos.`,
          },
          {
            key: 'social',
            title: isEnglish ? 'Protected Focus Shield' : 'Blindagem de Foco',
            tag: isEnglish ? 'PROTECTION' : 'PROTEÇÃO',
            timeWindow: windowItem.timeRange,
            icon: Users,
            summary: isEnglish
              ? `Shield the schedule from unscheduled interruptions during peak cognitive hours.`
              : `Proteja o horário contra reuniões imprevistas; reserve este período para entregas de alto valor.`,
            actionAdvice: isEnglish
              ? `Postpone casual messaging until late morning.`
              : `Mantenha modo não perturbe; agende contatos para depois das 10h.`,
          },
          {
            key: 'health',
            title: isEnglish ? 'Posture & Sustained Vitality' : 'Postura & Sustentação Biológica',
            tag: isEnglish ? 'VITALITY' : 'VITALIDADE',
            timeWindow: windowItem.timeRange,
            icon: HeartPulse,
            summary: isEnglish
              ? `Maintain ergonomic support, steady breathing, and steady hydration.`
              : `Sustente a energia com postura ereta, ambiente bem iluminado e hidratação contínua.`,
            actionAdvice: isEnglish
              ? `2-minute shoulder and neck stretch between focus blocks.`
              : `Pausa de 2 minutos para soltar ombros e respirar a cada meia hora.`,
          },
          {
            key: 'alerts',
            title: isEnglish ? 'Prevent Cognitive Fragmentation' : 'Prevenção de Fragmentação',
            tag: isEnglish ? 'PREVENTION' : 'PREVENÇÃO',
            timeWindow: windowItem.timeRange,
            icon: AlertTriangle,
            summary: isEnglish
              ? `Context switching drains mental stamina. Refuse unplanned peripheral diversions.`
              : `Alternância rápida de contexto consome energia valiosa. Não interrompa o fluxo com tarefas secundárias.`,
            actionAdvice: isEnglish
              ? `Write stray thoughts on a scratchpad and stay on course.`
              : `Anote pensamentos periféricos em um rascunho e continue na tarefa principal.`,
          },
        ];
      case 'w3': // 10h-12h
        return [
          {
            key: 'career',
            title: isEnglish ? 'Collaborative Traction & Deliveries' : 'Alinhamento & Tração de Entregas',
            tag: isEnglish ? 'EXECUTION' : 'EXECUÇÃO',
            timeWindow: windowItem.timeRange,
            icon: Briefcase,
            summary: isEnglish
              ? `Strong momentum for joint reviews, agreements, and closing morning milestones.`
              : `Momento propício para reuniões bilaterais, alinhamento de entregas e consolidação de acordos.`,
            actionAdvice: isEnglish
              ? `Close alignments with defined owners and milestones.`
              : `Feche alinhamentos definindo responsáveis e prazos claros.`,
          },
          {
            key: 'social',
            title: isEnglish ? 'Empathetic Dialogue & Synergy' : 'Diálogos Bilaterais & Sinergia',
            tag: isEnglish ? 'ALIGNMENT' : 'ALINHAMENTO',
            timeWindow: windowItem.timeRange,
            icon: Users,
            summary: isEnglish
              ? `Lucid, empathetic connection. Great window for feedback, constructive negotiations, and mutual support.`
              : `Presença empática e escuta lúcida. Momento ideal para negociar, oferecer feedbacks construtivos e nutrir confiança.`,
            actionAdvice: isEnglish
              ? `Listen attentively before structuring proposals.`
              : `Pratique escuta ativa antes de apresentar contrapropostas.`,
          },
          {
            key: 'health',
            title: isEnglish ? 'Ocular Relief & Hydration Break' : 'Alívio Ocular & Pausa de Hidratação',
            tag: isEnglish ? 'BALANCE' : 'EQUILÍBRIO',
            timeWindow: windowItem.timeRange,
            icon: HeartPulse,
            summary: isEnglish
              ? `Rest the eyes by looking at distance and rehydrate before lunchtime.`
              : `Olhe para pontos distantes para relaxar a musculatura ocular após o foco matinal.`,
            actionAdvice: isEnglish
              ? `Drink fresh water and stand up for a few minutes.`
              : `Beba água e levante da cadeira alguns minutos antes do almoço.`,
          },
          {
            key: 'alerts',
            title: isEnglish ? 'Avoid Meeting Overruns' : 'Evite Reuniões Excessivamente Longas',
            tag: isEnglish ? 'PREVENTION' : 'PREVENÇÃO',
            timeWindow: windowItem.timeRange,
            icon: AlertTriangle,
            summary: isEnglish
              ? `Wrap discussions on time to protect energy for the afternoon.`
              : `Encerre chamadas com antecedência para evitar cansaço antes do almoço.`,
            actionAdvice: isEnglish
              ? `Summarize decisions promptly before concluding calls.`
              : `Sintetize os próximos passos antes de encerrar as interações.`,
          },
        ];
      default:
        return [
          {
            key: 'career',
            title: isEnglish ? `Synthesis & Review for ${entityName}` : `Síntese & Revisão de ${entityName}`,
            tag: isEnglish ? 'SYNTHESIS' : 'SÍNTESE',
            timeWindow: windowItem.timeRange,
            icon: Briefcase,
            summary: isEnglish
              ? `Consolidation phase. Review achievements, archive checkpoint snapshots, and prepare harmonious continuity for ${entityName}.`
              : `Fase de consolidação. Revise as realizações, registre o checkpoint e organize a continuidade estratégica para ${entityName}.`,
            actionAdvice: isEnglish
              ? `Record authorial notes and save checkpoint metrics.`
              : `Gere o relatório do checkpoint e salve reflexões autorais.`,
          },
          {
            key: 'social',
            title: isEnglish ? 'Harmony & Presence' : 'Harmonia & Presença',
            tag: isEnglish ? 'BONDS' : 'VÍNCULOS',
            timeWindow: windowItem.timeRange,
            icon: Users,
            summary: isEnglish
              ? `Quiet presence and genuine interpersonal warmth.`
              : `Cultive momentos de tranquilidade, presença acolhedora e harmonia relacional.`,
            actionAdvice: isEnglish
              ? `Disconnect from professional alerts to nurture relationships.`
              : `Desligue alertas profissionais e valorize conexões genuínas.`,
          },
          {
            key: 'health',
            title: isEnglish ? 'Somatic Restoration & Calm' : 'Restauração Somática & Relaxamento',
            tag: isEnglish ? 'REPAIR' : 'RESTAURAÇÃO',
            timeWindow: windowItem.timeRange,
            icon: HeartPulse,
            summary: isEnglish
              ? `Dim lights, reduce artificial screen exposure, and listen to relaxing frequencies for deep restoration.`
              : `Diminua luzes artificiais, faça uma refeição leve e use frequências regenerativas para preparar um sono reparador.`,
            actionAdvice: isEnglish
              ? `Filter blue light 1 hour before sleep; listen to calming audio.`
              : `Filtre telas 1 hora antes de dormir e ouça frequências regenerativas.`,
          },
          {
            key: 'alerts',
            title: isEnglish ? 'Prevent Night Overstimulation' : 'Cuidado com Estímulos Noturnos',
            tag: isEnglish ? 'PREVENTION' : 'PREVENÇÃO',
            timeWindow: windowItem.timeRange,
            icon: AlertTriangle,
            summary: isEnglish
              ? `Excessive blue light and cognitive stimulation delay melatonin synthesis and restorative rest.`
              : `Luz intensa e excesso de estímulos à noite inibem a melatonina e prejudicam a restauração.`,
            actionAdvice: isEnglish
              ? `Switch devices to warm night mode or enjoy peaceful reading.`
              : `Ative o modo noturno e prefira leitura tranquila ou relaxamento.`,
          },
        ];
    }
  };

  const dailySpheres = getSpheresForWindow(activeOrSelectedWindow);
  const featuredSphere = dailySpheres.find((s) => s.key === featuredSphereKey) || dailySpheres[0];

  const synthesisText = isEnglish
    ? `The cosmic and operational cycle for ${entity.name} presents optimal conditions for grounded progress and clear agreements. Prioritize focused execution in the morning windows and consolidate strategic milestones by late afternoon.`
    : `O ciclo energético e operacional de ${entity.name} apresenta condições propícias para avanços estruturados e acordos claros. Priorize trabalho profundo nas janelas nobres matinais e consolide as realizações ao entardecer.`;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Interactive Logarithmic Consciousness Scale (Framed to show 5 indicators: 2 above, active center, 2 below) */}
      <div className="space-y-1.5">
        <div
          ref={scaleContainerRef}
          className="relative h-[160px] overflow-y-auto pr-1 space-y-1 no-scrollbar border-y border-[var(--border)] py-1 scroll-smooth"
        >
          {energyLevels.map((lvl) => {
            const isCurrent = lvl.value === '350';
            return (
              <button
                key={lvl.value}
                ref={isCurrent ? activeLevelRef : null}
                type="button"
                onClick={() => setSelectedLevelInfo(lvl)}
                className={`w-full h-7 flex items-center justify-between px-2.5 rounded transition-all text-left group cursor-pointer ${
                  isCurrent
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-[11px] shrink-0 w-8">{lvl.value}</span>
                  <span
                    className={`text-xs truncate ${
                      isCurrent
                        ? 'font-bold'
                        : 'text-[var(--text-tertiary)] group-hover:text-[var(--foreground)]'
                    }`}
                  >
                    {lvl.name}
                  </span>
                </div>

                {isCurrent && (
                  <span className="text-[8px] uppercase tracking-widest font-mono shrink-0 ml-1 font-bold">
                    ● ATIVO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[9px] font-mono text-[var(--text-tertiary)] text-center">
          {isEnglish ? 'Tap values to inspect calibration' : 'Toque nos valores para ver a calibração'}
        </p>
      </div>

      {/* Popover / Modal com Informações do Nível Selecionado */}
      {selectedLevelInfo && (
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-md space-y-2 font-mono animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold">
                {selectedLevelInfo.value}
              </span>
              <h4 className="font-bold text-sm text-[var(--foreground)]">{selectedLevelInfo.name}</h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLevelInfo(null)}
              className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {selectedLevelInfo.description}
          </p>
        </div>
      )}

      {/* 2. Descriptive Synthesis Block with cohesive Quiet Luxury typography */}
      <section className="space-y-3 pt-1">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-tertiary)]">
            {isEnglish ? 'CONSCIOUSNESS ANCHOR' : 'ÂNCORA DE CONSCIÊNCIA'}
          </span>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
              {isEnglish ? 'Acceptance' : 'Aceitação'}
            </h3>
            <span className="font-mono text-xs font-medium text-[var(--text-secondary)]">350</span>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[var(--text-secondary)] font-normal max-w-2xl">
          {synthesisText}
        </p>

        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--text-tertiary)]">
            {isEnglish ? 'SUGGESTION' : 'SUGESTÃO'}
          </span>
          <span className="text-[var(--border)]">·</span>
          <span className="font-medium text-[var(--foreground)] text-xs">
            {isEnglish
              ? `Strategic alignment session: 25 min`
              : `Sessão de alinhamento estratégico: 25 min`}
          </span>
        </div>
      </section>

      {/* 3. Sintonia do Momento (Player neuroacústico com ondas e timer) */}
      <DailyTuneSection isEnglish={isEnglish} />

      {/* 4. MÉTRICAS — Element Ascendancy, Scores & Síntese por Elemento */}
      <ElementMetricsSection
        isEnglish={isEnglish}
        activeElementKey={activeElementKey}
        onSelectElement={setActiveElementKey}
      />

      {/* 5. Calibração de Métricas — 4 Elementos, Rankings, Sub-índices & Sugestões */}
      <ElementCalibrationSection
        isEnglish={isEnglish}
        activeElementKey={activeElementKey}
        onSelectElement={setActiveElementKey}
      />

      {/* 6. Janelas do Dia (06:00 — 22:00) */}
      <section id="day-windows-section" className="border-t border-[var(--border)] pt-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
            {isEnglish ? 'DAY WINDOWS (06:00 — 22:00)' : 'JANELAS DO DIA (06:00 — 22:00)'}
          </span>
          <button
            type="button"
            onClick={() => setShowWindowsGuide(!showWindowsGuide)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            title={isEnglish ? 'Timeline Guide' : 'Guia da Linha do Tempo'}
          >
            <Info size={14} />
          </button>
        </div>

        {/* Minimalist Multi-segment Timeline Strip */}
        <div className="space-y-2">
          <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full bg-[var(--surface-2)] p-0.5">
            {DAY_WINDOWS_LIST.map((w) => {
              const isNow = nowHour >= w.startHour && nowHour < w.endHour;
              const isSelected = selectedWindowInfo?.id === w.id;
              const bgClass =
                w.type === 'productive'
                  ? 'bg-[var(--success)]'
                  : w.type === 'neutral'
                  ? 'bg-[var(--warning)]'
                  : 'bg-[var(--destructive)]/70';

              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWindowInfo(isSelected ? null : w)}
                  className={`h-full flex-1 rounded-xs transition-all cursor-pointer ${bgClass} ${
                    isNow
                      ? 'ring-2 ring-[var(--foreground)] ring-offset-1'
                      : isSelected
                      ? 'opacity-100 scale-y-110'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                  title={`${w.timeRange} · ${w.title}`}
                />
              );
            })}
          </div>

          {/* 3h Clickable Markers */}
          <div className="flex justify-between text-[9px] font-mono text-[var(--text-tertiary)] px-0.5">
            {['06h', '09h', '12h', '15h', '18h', '21h'].map((hour) => (
              <button
                key={hour}
                type="button"
                onClick={() => {
                  const match = DAY_WINDOWS_LIST.find((w) => w.timeRange.includes(hour.slice(0, 2)));
                  if (match) setSelectedWindowInfo(match);
                }}
                className="hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                {hour}
              </button>
            ))}
          </div>
        </div>

        {/* Inline Window Detail if clicked */}
        {selectedWindowInfo && (
          <div className="flex items-start justify-between border-t border-[var(--border)] pt-3 text-xs animate-in fade-in">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[var(--foreground)]">
                  {selectedWindowInfo.timeRange}
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  · {selectedWindowInfo.title}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    selectedWindowInfo.type === 'productive'
                      ? 'bg-[var(--success)]/10 text-[var(--success)]'
                      : selectedWindowInfo.type === 'neutral'
                      ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                      : 'bg-[var(--destructive)]/10 text-[var(--destructive)]'
                  }`}
                >
                  {selectedWindowInfo.type.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {selectedWindowInfo.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedWindowInfo(null)}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)] shrink-0 ml-2 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Guide drawer */}
        {showWindowsGuide && (
          <div className="border-t border-[var(--border)] pt-3 text-xs text-[var(--text-secondary)] space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--success)]" /> Produtivo
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--warning)]" /> Neutro
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--destructive)]" /> Baixa Energia
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              As janelas cronobiológicas mapeiam as oscilações naturais de neurotransmissores e cortisol ao longo do dia, indicando o melhor momento para tarefas analíticas, sociais ou de repouso.
            </p>
          </div>
        )}
      </section>

      {/* 7. Daily Post (4 Esferas contextualizadas para a pessoa ou evento selecionado) */}
      <section className="border-t border-[var(--border)] pt-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
            {isEnglish ? 'DAILY POST / 4 SPHERES' : 'DAILY POST / 4 ESFERAS'}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
            {isEnglish ? 'Select to feature' : 'Selecione para destacar'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Main Featured Post */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <featuredSphere.icon size={18} className="text-[var(--accent)] shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] leading-tight">
                    {featuredSphere.title}
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                    {featuredSphere.tag} · {featuredSphere.timeWindow}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-[var(--foreground)] font-normal">
              {featuredSphere.summary}
            </p>

            <div className="border-l-2 border-[var(--accent)] pl-3 py-1">
              <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
                {isEnglish ? 'DIRECTED ACTION' : 'AÇÃO DIRECIONADA'}
              </span>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {featuredSphere.actionAdvice}
              </p>
            </div>
          </div>

          {/* Right Side Switcher List */}
          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6 space-y-1.5">
            {dailySpheres.map((sphere) => {
              const isCurrent = sphere.key === featuredSphereKey;
              const Icon = sphere.icon;

              return (
                <button
                  key={sphere.key}
                  type="button"
                  onClick={() => setFeaturedSphereKey(sphere.key)}
                  className={`w-full flex items-start gap-2.5 py-1.5 px-2 text-left transition-all cursor-pointer group bg-transparent border-0 ${
                    isCurrent
                      ? 'text-[var(--foreground)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Icon
                    size={15}
                    className={`mt-0.5 shrink-0 transition-colors ${
                      isCurrent
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--text-tertiary)] group-hover:text-[var(--foreground)]'
                    }`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-xs leading-tight truncate ${
                        isCurrent
                          ? 'font-bold text-[var(--foreground)]'
                          : 'font-medium group-hover:text-[var(--foreground)]'
                      }`}
                    >
                      {sphere.title}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)] truncate mt-0.5 font-mono">
                      {sphere.timeWindow}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      {/* FINAL DO DAILY JOURNAL: Conforme solicitado pelo usuário, o Daily Journal encerra na seção de Janelas do Dia e Daily Post, sem a tela de chatbot */}
    </div>
  );
}
