import React, { useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import {
  ELEMENTS_CALIBRATION_DATA,
  type ElementCalibrationData,
  type SubIndex,
} from './ElementCalibrationSection';

export interface ElementSynthesisInfo {
  fieldTitle: string;
  fieldTitleEn: string;
  synthesis: string;
  synthesisEn: string;
  actionDirective: string;
  actionDirectiveEn: string;
  statusLabel: string;
  statusLabelEn: string;
  isAscending: boolean;
  highestSubIndex: SubIndex;
  lowestSubIndex: SubIndex;
  average: number;
}

export function computeElementSynthesis(
  elem: ElementCalibrationData,
  isHighestOverall: boolean
): ElementSynthesisInfo {
  const avg = Math.round(
    elem.subIndices.reduce((acc, curr) => acc + curr.value, 0) / elem.subIndices.length
  );

  // Highest and lowest subindices
  const sorted = [...elem.subIndices].sort((a, b) => b.value - a.value);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  let fieldTitle = '';
  let fieldTitleEn = '';
  let synthesis = '';
  let synthesisEn = '';
  let actionDirective = '';
  let actionDirectiveEn = '';

  const isAscending = isHighestOverall || avg >= 60;
  const statusLabel = isHighestOverall
    ? 'Ascendente'
    : avg >= 60
    ? 'Em Alta'
    : avg >= 40
    ? 'Equilibrado'
    : 'Em Baixa';
  const statusLabelEn = isHighestOverall
    ? 'Ascending'
    : avg >= 60
    ? 'High'
    : avg >= 40
    ? 'Balanced'
    : 'Low';

  switch (elem.key) {
    case 'fire':
      fieldTitle = 'Campo da Ação';
      fieldTitleEn = 'Field of Action';
      if (avg >= 80) {
        synthesis = `Seu campo de ação está em alta hoje. A energia está intensa e produtiva, com ${highest.name} em ${highest.value}% em destaque. O momento pede ação estruturada e concentrada, mas atenção a ${lowest.name} em ${lowest.value}% — não se cobre para enfrentar tudo de uma vez.`;
        synthesisEn = `Your field of action is soaring today. Energy is intense and productive, with ${highest.name} at ${highest.value}% highlighted. The moment calls for structured, concentrated action, but heed ${lowest.name} at ${lowest.value}% — avoid trying to tackle everything at once.`;
        actionDirective = 'Ação concentrada e execução de metas prioritárias';
        actionDirectiveEn = 'Concentrated action and priority goal execution';
      } else if (avg >= 60) {
        synthesis = `Seu campo de ação está ativo e equilibrado hoje. ${highest.name} em ${highest.value}% indica um bom momento para expressão e avanço, enquanto ${lowest.name} em ${lowest.value}% sugere cautela em decisões arriscadas. O dia pede ação criativa, mas com foco claro.`;
        synthesisEn = `Your field of action is active and balanced today. ${highest.name} at ${highest.value}% signals a prime moment for expression, while ${lowest.name} at ${lowest.value}% advises prudence on risky decisions. The day calls for creative execution with clear focus.`;
        actionDirective = 'Ação criativa e sustentação de ritmo';
        actionDirectiveEn = 'Creative execution and rhythm maintenance';
      } else if (avg >= 40) {
        synthesis = `Seu campo de ação está em um nível moderado hoje. O ${highest.name} em ${highest.value}% sugere bom direcionamento executivo, enquanto ${lowest.name} em ${lowest.value}% pede atenção e recuperação de fôlego. O foco deve ser manter o ritmo sem se cobrar excessivamente.`;
        synthesisEn = `Your field of action is at a moderate level today. ${highest.name} at ${highest.value}% indicates solid executive direction, while ${lowest.name} at ${lowest.value}% calls for pacing and energy renewal. Focus on steady rhythm without self-strain.`;
        actionDirective = 'Ritmo constante e preservação de energia';
        actionDirectiveEn = 'Steady pace and energy conservation';
      } else if (avg >= 20) {
        synthesis = `Seu campo de ação está em baixa hoje. A energia e a motivação estão reduzidas, com ${lowest.name} em ${lowest.value}% em evidência. O momento pede tarefas leves e organização, em vez de grandes decisões ou confrontos.`;
        synthesisEn = `Your field of action is low today. Energy and drive are muted, with ${lowest.name} at ${lowest.value}% in evidence. The moment favors light tasks and quiet organization over confrontations.`;
        actionDirective = 'Tarefas leves e organização sem atrito';
        actionDirectiveEn = 'Light tasks and friction-free organization';
      } else {
        synthesis = `Seu campo de ação está em repouso hoje. A energia está muito baixa e o momento pede descanso e recuperação. Respeite seu ritmo e evite se cobrar por produtividade.`;
        synthesisEn = `Your field of action is in repose today. Energy is deeply depleted; honor your pace, rest, and release productivity pressure.`;
        actionDirective = 'Descanso consciente e recuperação';
        actionDirectiveEn = 'Mindful rest and recuperation';
      }
      break;

    case 'earth':
      fieldTitle = 'Campo da Estrutura';
      fieldTitleEn = 'Field of Structure';
      if (avg >= 80) {
        synthesis = `Seu campo de estrutura está sólido hoje. Organização e disciplina estão em alta, com a ${highest.name} em ${highest.value}% em destaque. Aproveite para organizar sua semana e planejar projetos, mas atenção a ${lowest.name} em ${lowest.value}% — não foque apenas em resultados materiais.`;
        synthesisEn = `Your field of structure is solid today. Organization and discipline are high, led by ${highest.name} at ${highest.value}%. Take advantage to organize the week and plan projects, mindful of ${lowest.name} at ${lowest.value}%.`;
        actionDirective = 'Planejamento semanal e alinhamento de processos';
        actionDirectiveEn = 'Weekly planning and process alignment';
      } else if (avg >= 60) {
        synthesis = `Seu campo de estrutura está ativo e produtivo hoje. A ${highest.name} em ${highest.value}% sugere um bom momento para rotinas e consolidação de compromissos, enquanto a ${lowest.name} em ${lowest.value}% pede atenção ao equilíbrio entre trabalho e flexibilidade. O dia pede organização sólida com ritmo constante.`;
        synthesisEn = `Your field of structure is active and productive today. ${highest.name} at ${highest.value}% points to an optimal time for routines and commitments, while ${lowest.name} at ${lowest.value}% advises balance between work and flexibility. The day calls for solid organization with adaptive ease.`;
        actionDirective = 'Organização de rotinas e execução prática com flexibilidade';
        actionDirectiveEn = 'Routine organization and practical execution with flexibility';
      } else if (avg >= 40) {
        synthesis = `Seu campo de estrutura está equilibrado hoje. A ${highest.name} em ${highest.value}% indica um bom momento para resolver questões concretas, enquanto a ${lowest.name} em ${lowest.value}% pede cautela com sobrecargas. O foco deve ser manter a rotina sem rigidez excessiva.`;
        synthesisEn = `Your field of structure is balanced today. ${highest.name} at ${highest.value}% marks a good time to resolve tangible matters, while ${lowest.name} at ${lowest.value}% cautions against overload. Keep routines without undue rigidity.`;
        actionDirective = 'Resolução de pendências concretas';
        actionDirectiveEn = 'Resolving tangible pending tasks';
      } else if (avg >= 20) {
        synthesis = `Seu campo de estrutura está em baixa hoje. A organização e a disciplina estão reduzidas, com a ${lowest.name} em ${lowest.value}% em evidência. O momento pede simplificação de tarefas e pausas para reorganizar.`;
        synthesisEn = `Your field of structure is low today. Organization and discipline are reduced, with ${lowest.name} at ${lowest.value}% evident. Simplify workflows and pause to reorganize.`;
        actionDirective = 'Simplificação de checklists operacionais';
        actionDirectiveEn = 'Simplifying operational checklists';
      } else {
        synthesis = `Seu campo de estrutura está em repouso hoje. A disciplina e a organização estão muito baixas. Momento de descansar e não se cobrar por produtividade.`;
        synthesisEn = `Your field of structure is at rest today. Discipline and structure are minimal; allow yourself to rest without guilt.`;
        actionDirective = 'Pausa operacional completa';
        actionDirectiveEn = 'Complete operational break';
      }
      break;

    case 'air':
      fieldTitle = 'Campo da Mente';
      fieldTitleEn = 'Field of Mind';
      if (avg >= 80) {
        synthesis = `Seu campo da mente está afiado hoje. Raciocínio e comunicação estão em alta, com o ${highest.name} em ${highest.value}% em destaque. Aproveite para estudos e debates aprofundados, mas atenção a ${lowest.name} em ${lowest.value}% — não se isole socialmente.`;
        synthesisEn = `Your field of mind is razor sharp today. Reasoning and communication are high, with ${highest.name} at ${highest.value}% highlighted. Seize the opportunity for deep study and debates, mindful of ${lowest.name} at ${lowest.value}%.`;
        actionDirective = 'Estudo aprofundado e produção intelectual';
        actionDirectiveEn = 'Deep study and intellectual output';
      } else if (avg >= 60) {
        synthesis = `Seu campo da mente está ativo e produtivo hoje. O ${highest.name} em ${highest.value}% sugere um bom momento para expressar ideias e absorver novos conceitos, enquanto ${lowest.name} em ${lowest.value}% pede pausas para assimilação. O dia pede estudo e diálogo estruturado.`;
        synthesisEn = `Your field of mind is active and productive today. ${highest.name} at ${highest.value}% suggests a strong window for articulating ideas, while ${lowest.name} at ${lowest.value}% advises digestion breaks. The day favors study and structured dialogue.`;
        actionDirective = 'Diálogo construtivo e síntese de ideias';
        actionDirectiveEn = 'Constructive dialogue and idea synthesis';
      } else if (avg >= 40) {
        synthesis = `Seu campo da mente está equilibrado hoje. O ${highest.name} em ${highest.value}% indica um bom potencial para clareza lógica e raciocínio analítico, enquanto ${lowest.name} em ${lowest.value}% pede pausas para evitar dispersão mental. O foco deve ser equilibrar estudo e momentos de silêncio.`;
        synthesisEn = `Your field of mind is balanced today. ${highest.name} at ${highest.value}% indicates good logical clarity, while ${lowest.name} at ${lowest.value}% calls for rest to prevent dispersion. Focus on balancing study with quiet moments.`;
        actionDirective = 'Leitura analítica e pausas de oxigenação';
        actionDirectiveEn = 'Analytical reading and oxygenation breaks';
      } else if (avg >= 20) {
        synthesis = `Seu campo da mente está em baixa hoje. A clareza mental e a comunicação estão reduzidas, com o ${lowest.name} em ${lowest.value}% em evidência. O momento pede tarefas leves e evitar decisões complexas que exijam esforço analítico extremo.`;
        synthesisEn = `Your field of mind is low today. Mental clarity and communication are dimmed, with ${lowest.name} at ${lowest.value}% in evidence. Prefer light tasks and postpone heavy analytical decisions.`;
        actionDirective = 'Atividades mentais leves e desconexão';
        actionDirectiveEn = 'Light mental activities and digital rest';
      } else {
        synthesis = `Seu campo da mente está em repouso hoje. A clareza mental está muito baixa. Momento de atividades que não exijam raciocínio intenso.`;
        synthesisEn = `Your field of mind is resting today. Clarity is reduced; engage in gentle, non-demanding activities.`;
        actionDirective = 'Repouso cognitivo e silêncio';
        actionDirectiveEn = 'Cognitive rest and quietude';
      }
      break;

    case 'water':
      fieldTitle = 'Campo da Emoção';
      fieldTitleEn = 'Field of Emotion';
      if (avg >= 80) {
        synthesis = `Seu campo da emoção está profundo hoje. Intuição e sensibilidade estão em alta, com a ${highest.name} em ${highest.value}% em destaque. Aproveite para confiar no seu instinto e criar, mas atenção a ${lowest.name} em ${lowest.value}% — não se deixe levar por preocupações.`;
        synthesisEn = `Your field of emotion is deep today. Intuition and sensitivity are peak, led by ${highest.name} at ${highest.value}%. Trust your instincts to create, but keep balance regarding ${lowest.name} at ${lowest.value}%.`;
        actionDirective = 'Criação intuitiva e conexão interpessoal autêntica';
        actionDirectiveEn = 'Intuitive creation and authentic connection';
      } else if (avg >= 60) {
        synthesis = `Seu campo da emoção está ativo e sensível hoje. A ${highest.name} em ${highest.value}% sugere um bom momento para se conectar com pessoas e aprofundar vínculos, enquanto a ${lowest.name} em ${lowest.value}% pede mais autocuidado. O dia pede conexão, mas com equilíbrio emocional.`;
        synthesisEn = `Your field of emotion is active and sensitive today. ${highest.name} at ${highest.value}% indicates a fertile moment for meaningful connection, while ${lowest.name} at ${lowest.value}% calls for self-care. The day honors bonding with emotional balance.`;
        actionDirective = 'Escuta empática e autocuidado';
        actionDirectiveEn = 'Empathetic listening and gentle self-care';
      } else if (avg >= 40) {
        synthesis = `Seu campo da emoção está equilibrado hoje. A ${highest.name} em ${highest.value}% indica um bom potencial para relacionamentos e introspecção lúcida, enquanto a ${lowest.name} em ${lowest.value}% pede momentos de relaxamento e descompressão. O foco deve ser equilibrar vida social e recolhimento.`;
        synthesisEn = `Your field of emotion is balanced today. ${highest.name} at ${highest.value}% points to relational harmony and lucid introspection, while ${lowest.name} at ${lowest.value}% advises relaxation. Balance social life and contemplative calm.`;
        actionDirective = 'Introspecção serena e harmonia relacional';
        actionDirectiveEn = 'Serene introspection and relational harmony';
      } else if (avg >= 20) {
        synthesis = `Seu campo da emoção está em baixa hoje. A sensibilidade e a intuição estão reduzidas, com a ${lowest.name} em ${lowest.value}% em evidência. O momento pede práticas de relaxamento, hidratação e evitar decisões baseadas em impulsos ou sentimentos passageiros.`;
        synthesisEn = `Your field of emotion is low today. Sensitivity and affective energy are subdued, with ${lowest.name} at ${lowest.value}% prominent. Favor relaxation and defer decisions made on transient feelings.`;
        actionDirective = 'Relaxamento somático e neutralidade emocional';
        actionDirectiveEn = 'Somatic relaxation and emotional neutrality';
      } else {
        synthesis = `Seu campo da emoção está em repouso hoje. A sensibilidade está muito baixa. Momento de atividades práticas e evitar decisões baseadas em sentimentos.`;
        synthesisEn = `Your field of emotion is in repose today. Sensitivity is quiet; focus on simple grounded routines.`;
        actionDirective = 'Cuidado pessoal e repouso restaurador';
        actionDirectiveEn = 'Personal care and restorative rest';
      }
      break;
  }

  return {
    fieldTitle,
    fieldTitleEn,
    synthesis,
    synthesisEn,
    actionDirective,
    actionDirectiveEn,
    statusLabel,
    statusLabelEn,
    isAscending,
    highestSubIndex: highest,
    lowestSubIndex: lowest,
    average: avg,
  };
}

type Props = {
  isEnglish: boolean;
  activeElementKey: 'fire' | 'earth' | 'air' | 'water';
  onSelectElement: (key: 'fire' | 'earth' | 'air' | 'water') => void;
};

export function ElementMetricsSection({ isEnglish, activeElementKey, onSelectElement }: Props) {
  // Sort elements in order of ascendancy (highest average score first)
  const sortedElements = useMemo(() => {
    return [...ELEMENTS_CALIBRATION_DATA].sort((a, b) => {
      const avgA = a.subIndices.reduce((acc, curr) => acc + curr.value, 0) / a.subIndices.length;
      const avgB = b.subIndices.reduce((acc, curr) => acc + curr.value, 0) / b.subIndices.length;
      return avgB - avgA;
    });
  }, []);

  const highestElementKey = sortedElements[0]?.key;

  const currentElement =
    ELEMENTS_CALIBRATION_DATA.find((e) => e.key === activeElementKey) || sortedElements[0];

  const synthesisInfo = useMemo(() => {
    return computeElementSynthesis(currentElement, currentElement.key === highestElementKey);
  }, [currentElement, highestElementKey]);

  const CurrentIcon = currentElement.icon;

  return (
    <section className="border-t border-[var(--border)] pt-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
          {isEnglish ? 'METRICS' : 'MÉTRICAS'}
        </span>
        <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
          {isEnglish ? 'ELEMENT ASCENDANCY' : 'ASCENDÊNCIA DE ELEMENTO'}
        </span>
      </div>

      {/* Element Selector Strip (Zero background, zero capsule/border, only selected shows name, sorted by ascendancy) */}
      <div className="flex items-center justify-between gap-1 sm:gap-4 px-0.5 py-1">
        {sortedElements.map((elem, idx) => {
          const Icon = elem.icon;
          const isSelected = elem.key === activeElementKey;
          const isFirstAscendant = idx === 0;
          const avg = Math.round(
            elem.subIndices.reduce((acc, curr) => acc + curr.value, 0) / elem.subIndices.length
          );

          return (
            <button
              key={elem.key}
              type="button"
              onClick={() => onSelectElement(elem.key)}
              className="flex items-center gap-1.5 sm:gap-2 bg-transparent border-0 p-1 transition-colors cursor-pointer group focus:outline-none shrink-0"
            >
              <Icon
                size={17}
                className={
                  isSelected
                    ? 'text-[var(--accent)] transition-colors'
                    : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors'
                }
              />

              {/* Show title ONLY when selected */}
              {isSelected && (
                <span className="text-xs font-bold font-mono tracking-tight text-[var(--accent)] whitespace-nowrap">
                  {isEnglish ? elem.nameEn : elem.name}
                </span>
              )}

              {/* Index number & indicator */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <span
                  className={`text-xs font-mono font-semibold transition-colors ${
                    isSelected
                      ? 'text-[var(--accent)] font-bold'
                      : 'text-[var(--text-secondary)] group-hover:text-[var(--foreground)]'
                  }`}
                >
                  {avg}%
                </span>

                {isFirstAscendant ? (
                  <ArrowUpRight
                    size={12}
                    className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}
                  />
                ) : avg >= 60 ? (
                  <ArrowUpRight
                    size={11}
                    className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}
                  />
                ) : avg >= 40 ? (
                  <Activity
                    size={10}
                    className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}
                  />
                ) : (
                  <ArrowDownRight
                    size={11}
                    className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Element Identity & Synthesis Box */}
      <div className="space-y-3 pt-1">
        {/* Element Title, Field Name, Score & Ascendancy Tag */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <CurrentIcon size={22} className="text-[var(--accent)] shrink-0" />
            <div className="flex items-baseline gap-2.5">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                {isEnglish ? currentElement.nameEn : currentElement.name}
              </h3>
              <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[var(--accent)]">
                {isEnglish ? synthesisInfo.fieldTitleEn : synthesisInfo.fieldTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[var(--foreground)]">
              {synthesisInfo.average}%
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[10px] font-mono font-semibold text-[var(--accent)]">
              {synthesisInfo.isAscending ? (
                <ArrowUpRight size={13} className="text-[var(--accent)]" />
              ) : (
                <ArrowDownRight size={13} className="text-[var(--text-secondary)]" />
              )}
              <span>{isEnglish ? synthesisInfo.statusLabelEn.toUpperCase() : synthesisInfo.statusLabel.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Synthesis Paragraph */}
        <p className="text-sm leading-relaxed text-[var(--text-secondary)] font-normal max-w-3xl pt-1">
          {isEnglish ? synthesisInfo.synthesisEn : synthesisInfo.synthesis}
        </p>

        {/* Field Directive Line (Refined editorial aesthetic, non-clickable) */}
        <div
          id="field-directive-block"
          className="flex items-center gap-2 pt-1 text-xs"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--text-tertiary)]">
            {isEnglish ? 'FIELD DIRECTIVE' : 'DIRETRIZ DO CAMPO'}
          </span>
          <span className="text-[var(--border)]">·</span>
          <span className="font-medium text-[var(--foreground)] text-xs">
            {isEnglish ? synthesisInfo.actionDirectiveEn : synthesisInfo.actionDirective}
          </span>
        </div>
      </div>
    </section>
  );
}
