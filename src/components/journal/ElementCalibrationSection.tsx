import React, { useState, useMemo } from 'react';
import {
  Flame,
  Mountain,
  Wind,
  Droplets,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Activity,
  Dumbbell,
  BookOpen,
  Apple,
  Sun,
  Moon,
  Feather,
  Compass,
  HeartPulse,
  Brain,
  Coffee,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  type LucideIcon,
} from 'lucide-react';

export interface SubIndex {
  name: string;
  value: number;
  description: string;
  descriptionEn: string;
}

export interface SuggestionItem {
  id: string;
  title: string;
  titleEn: string;
  tag: string;
  tagEn: string;
  icon: LucideIcon;
}

export interface ElementCalibrationData {
  key: 'fire' | 'earth' | 'air' | 'water';
  name: string;
  nameEn: string;
  icon: LucideIcon;
  subIndices: SubIndex[];
  activeSuggestions: SuggestionItem[];
  lowSuggestions: SuggestionItem[];
}

export const ELEMENTS_CALIBRATION_DATA: ElementCalibrationData[] = [
  {
    key: 'fire',
    name: 'Fogo',
    nameEn: 'Fire',
    icon: Flame,
    subIndices: [
      { name: 'Foco', value: 84, description: 'Capacidade de sustentação e concentração profunda', descriptionEn: 'Deep concentration and focus capacity' },
      { name: 'Vontade', value: 78, description: 'Força de vontade e determinação executiva', descriptionEn: 'Executive willpower and determination' },
      { name: 'Criatividade', value: 65, description: 'Expressão e geração de novas abordagens', descriptionEn: 'Expression and creative ideation' },
      { name: 'Coragem', value: 55, description: 'Disposição ativa para assumir desafios', descriptionEn: 'Willingness to take on bold challenges' },
      { name: 'Iniciativa', value: 72, description: 'Capacidade de começar sem procrastinar', descriptionEn: 'Ability to start without delay' },
      { name: 'Entusiasmo', value: 60, description: 'Energia positiva e propulsão de projetos', descriptionEn: 'Positive energy and project drive' },
      { name: 'Liderança', value: 52, description: 'Habilidade de guiar e mobilizar equipes', descriptionEn: 'Ability to guide and mobilize teams' },
      { name: 'Paixão', value: 46, description: 'Intensidade e dedicação ao propósito', descriptionEn: 'Intensity and dedication to purpose' },
      { name: 'Autoconfiança', value: 58, description: 'Crença segura nas próprias capacidades', descriptionEn: 'Firm belief in one’s capabilities' },
      { name: 'Espontaneidade', value: 35, description: 'Ação ágil sem bloqueios ou inibições', descriptionEn: 'Nimble action without inhibitions' },
      { name: 'Determinação', value: 76, description: 'Persistência firme diante de obstáculos', descriptionEn: 'Firm persistence in the face of obstacles' },
      { name: 'Ousadia', value: 38, description: 'Disposição para correr riscos calculados', descriptionEn: 'Willingness to take calculated risks' },
      { name: 'Energia Vital', value: 68, description: 'Disposição e prontidão fisiológica', descriptionEn: 'Physiological vitality and readiness' },
      { name: 'Inspiração', value: 28, description: 'Capacidade de captar e germinar insights', descriptionEn: 'Ability to capture and germinate insights' },
    ],
    activeSuggestions: [
      { id: 'f-a1', title: 'Treino intenso +30m', titleEn: 'High-intensity workout +30m', tag: 'VITALIDADE', tagEn: 'VITALITY', icon: Dumbbell },
      { id: 'f-a2', title: 'Bloco de liderança & execução', titleEn: 'Leadership & execution sprint', tag: 'AÇÃO', tagEn: 'ACTION', icon: Sparkles },
      { id: 'f-a3', title: 'Sprint de criação autoral', titleEn: 'Authorial creation sprint', tag: 'FOCO', tagEn: 'FOCUS', icon: Brain },
      { id: 'f-a4', title: 'Decisão estratégica de alto impacto', titleEn: 'High-impact strategic decision', tag: 'CORAGEM', tagEn: 'COURAGE', icon: Compass },
    ],
    lowSuggestions: [
      { id: 'f-l1', title: 'Pausa ao ar livre para renovar espontaneidade', titleEn: 'Outdoor break to renew spontaneity', tag: 'AR LIVRE', tagEn: 'OUTDOOR', icon: Sun },
      { id: 'f-l2', title: 'Respiração diafragmática para foco calmo', titleEn: 'Diaphragmatic breathing for calm focus', tag: 'CALMA', tagEn: 'CALM', icon: Feather },
      { id: 'f-l3', title: 'Desconexão digital curta de 15m', titleEn: 'Short 15m digital detox', tag: 'DESCANSO', tagEn: 'REST', icon: Moon },
      { id: 'f-l4', title: 'Caminhada leve para desbloquear inspiração', titleEn: 'Light walk to unblock inspiration', tag: 'RESTAURAÇÃO', tagEn: 'REPAIR', icon: Activity },
    ],
  },
  {
    key: 'earth',
    name: 'Terra',
    nameEn: 'Earth',
    icon: Mountain,
    subIndices: [
      { name: 'Estrutura', value: 85, description: 'Organização, processos e planejamento', descriptionEn: 'Organization, processes and planning' },
      { name: 'Praticidade', value: 74, description: 'Habilidade concreta e resolução pragmática', descriptionEn: 'Pragmatic problem solving' },
      { name: 'Estabilidade', value: 80, description: 'Segurança, ritmo e consistência', descriptionEn: 'Security, rhythm and consistency' },
      { name: 'Persistência', value: 76, description: 'Foco contínuo a longo prazo', descriptionEn: 'Continuous long-term focus' },
      { name: 'Materialidade', value: 68, description: 'Relação equilibrada com recursos materiais', descriptionEn: 'Balanced relationship with material resources' },
      { name: 'Disciplina', value: 82, description: 'Autocontrole e adesão a hábitos', descriptionEn: 'Self-control and habit adherence' },
      { name: 'Responsabilidade', value: 88, description: 'Cumprimento rigoroso de compromissos', descriptionEn: 'Strict fulfillment of commitments' },
      { name: 'Concretização', value: 70, description: 'Materialização e entrega de projetos', descriptionEn: 'Project realization and delivery' },
      { name: 'Segurança', value: 65, description: 'Base estável e redução de imprevistos', descriptionEn: 'Stable foundation and risk reduction' },
      { name: 'Resiliência', value: 72, description: 'Superação consistente de desafios', descriptionEn: 'Consistent overcoming of friction' },
      { name: 'Administração', value: 62, description: 'Gestão eficiente de tempo e recursos', descriptionEn: 'Efficient management of time and resources' },
      { name: 'Qualidade', value: 78, description: 'Atenção ao acabamento e detalhes', descriptionEn: 'Attention to craftsmanship and detail' },
      { name: 'Solidez', value: 29, description: 'Firmeza estrutural sob pressão', descriptionEn: 'Structural firmness under pressure' },
      { name: 'Previsão', value: 26, description: 'Antecipação de cenários operacionais', descriptionEn: 'Anticipation of operational scenarios' },
    ],
    activeSuggestions: [
      { id: 't-a1', title: 'Planejamento tático de metas', titleEn: 'Tactical goal planning', tag: 'ESTRUTURA', tagEn: 'STRUCTURE', icon: Compass },
      { id: 't-a2', title: 'Organização de arquivos e fluxos', titleEn: 'Workflow and file organization', tag: 'MÉTODO', tagEn: 'METHOD', icon: ShieldCheck },
      { id: 't-a3', title: 'Execução metódica de entregas', titleEn: 'Methodical deliverable execution', tag: 'PRÁTICA', tagEn: 'PRACTICE', icon: CheckCircle2 },
      { id: 't-a4', title: 'Auditoria de qualidade e prazos', titleEn: 'Quality and deadline audit', tag: 'QUALIDADE', tagEn: 'QUALITY', icon: Activity },
    ],
    lowSuggestions: [
      { id: 't-l1', title: 'Alimentação à base de folhas e raízes', titleEn: 'Plant & root-based nutrition', tag: 'NUTRIÇÃO', tagEn: 'NUTRITION', icon: Apple },
      { id: 't-l2', title: 'Alongamento e contato com a terra', titleEn: 'Grounding stretch and posture work', tag: 'POSTURA', tagEn: 'POSTURE', icon: HeartPulse },
      { id: 't-l3', title: 'Ancoragem somática e hidratação', titleEn: 'Somatic grounding & hydration', tag: 'EQUILÍBRIO', tagEn: 'BALANCE', icon: Feather },
      { id: 't-l4', title: 'Mapeamento sem sobrecarga operacional', titleEn: 'Mapping without operational strain', tag: 'PREVENÇÃO', tagEn: 'PREVENTION', icon: Coffee },
    ],
  },
  {
    key: 'air',
    name: 'Ar',
    nameEn: 'Air',
    icon: Wind,
    subIndices: [
      { name: 'Raciocínio', value: 86, description: 'Capacidade analítica e lógica dedutiva', descriptionEn: 'Analytical deduction and logic' },
      { name: 'Comunicação', value: 75, description: 'Expressão clara e transmissão de ideias', descriptionEn: 'Clear expression and idea transfer' },
      { name: 'Socialização', value: 42, description: 'Facilidade de interação interpessoal', descriptionEn: 'Interpersonal interaction agility' },
      { name: 'Criatividade Mental', value: 70, description: 'Originalidade e síntese de ideias', descriptionEn: 'Originality and idea synthesis' },
      { name: 'Networking', value: 28, description: 'Construção e nutrição de contatos', descriptionEn: 'Contact networking and alliance building' },
      { name: 'Flexibilidade', value: 48, description: 'Adaptabilidade a novos contextos', descriptionEn: 'Adaptability to changing context' },
      { name: 'Oratória', value: 54, description: 'Eloquência e fala estruturada', descriptionEn: 'Structured discourse and eloquence' },
      { name: 'Debates', value: 62, description: 'Argumentação lúcida e fundamentada', descriptionEn: 'Lucid, grounded argumentation' },
      { name: 'Estudos', value: 80, description: 'Absorção e assimilação de conhecimento', descriptionEn: 'Knowledge absorption and assimilation' },
      { name: 'Projetos', value: 66, description: 'Desenvolvimento e design conceitual', descriptionEn: 'Conceptual design and development' },
      { name: 'Rendimento Acadêmico', value: 38, description: 'Desempenho em avaliações cognitivas', descriptionEn: 'Cognitive learning performance' },
      { name: 'Habilidade de Debate', value: 58, description: 'Diálogo dialético construtivo', descriptionEn: 'Constructive dialectical dialogue' },
      { name: 'Possibilidades Sociais', value: 25, description: 'Abertura para novos círculos', descriptionEn: 'Receptivity to new social circles' },
      { name: 'Carreira Intelectual', value: 72, description: 'Potencial de autoridade e produção teórica', descriptionEn: 'Theoretical output and intellect authority' },
    ],
    activeSuggestions: [
      { id: 'a-a1', title: 'Leitura analítica profunda +30m', titleEn: 'Deep analytical reading +30m', tag: 'LEITURA', tagEn: 'READING', icon: BookOpen },
      { id: 'a-a2', title: 'Redação de sínteses e memorandos', titleEn: 'Synthesis & briefing drafting', tag: 'SÍNTESE', tagEn: 'SYNTHESIS', icon: Feather },
      { id: 'a-a3', title: 'Estruturação de novos conceitos', titleEn: 'Concept & idea structuring', tag: 'CONCEITO', tagEn: 'CONCEPT', icon: Brain },
      { id: 'a-a4', title: 'Estudo aprofundado de novas referências', titleEn: 'In-depth reference study', tag: 'ESTUDO', tagEn: 'STUDY', icon: Sparkles },
    ],
    lowSuggestions: [
      { id: 'a-l1', title: 'Caminhada em ambiente arejado e aberto', titleEn: 'Walk in fresh ventilated space', tag: 'AR LIVRE', tagEn: 'OUTDOOR', icon: Sun },
      { id: 'a-l2', title: 'Pausa sem estímulo visual ou cognitivo', titleEn: 'Rest from visual/cognitive stimuli', tag: 'DESCANSO', tagEn: 'REST', icon: Moon },
      { id: 'a-l3', title: 'Hidratação e oxigenação consciente', titleEn: 'Conscious hydration & oxygenation', tag: 'VITALIDADE', tagEn: 'VITALITY', icon: HeartPulse },
      { id: 'a-l4', title: 'Troca informal com colega próximo', titleEn: 'Informal check-in with a peer', tag: 'VÍNCULO', tagEn: 'BOND', icon: Coffee },
    ],
  },
  {
    key: 'water',
    name: 'Água',
    nameEn: 'Water',
    icon: Droplets,
    subIndices: [
      { name: 'Neutralidade', value: 65, description: 'Equilíbrio emocional e serenidade interior', descriptionEn: 'Emotional balance and inner serenity' },
      { name: 'Ansiedade', value: 28, description: 'Tensão reativa e ruminação mental', descriptionEn: 'Reactive tension and rumination' },
      { name: 'Solidão', value: 22, description: 'Sensação de isolamento emocional', descriptionEn: 'Sense of emotional isolation' },
      { name: 'Estresse', value: 32, description: 'Sobrecarga e fadiga do sistema nervoso', descriptionEn: 'Nervous system load and fatigue' },
      { name: 'Burnout', value: 15, description: 'Esgotamento crônico de energia', descriptionEn: 'Chronic energy depletion' },
      { name: 'Intuição', value: 74, description: 'Percepção sutil e sensibilidade direta', descriptionEn: 'Subtle perception and direct insight' },
      { name: 'Empatia', value: 80, description: 'Conexão e acolhimento do sentimento alheio', descriptionEn: 'Connection and resonance with others' },
      { name: 'Criatividade Emocional', value: 68, description: 'Expressão e sublimação de afetos em arte', descriptionEn: 'Affective sublimation and artistic flow' },
      { name: 'Conexão', value: 72, description: 'Capacidade de criar vínculos profundos', descriptionEn: 'Ability to forge profound bonds' },
      { name: 'Resiliência Emocional', value: 64, description: 'Recuperação rápida de oscilações afetivas', descriptionEn: 'Quick rebound from affective shifts' },
      { name: 'Rendimento Social', value: 58, description: 'Harmonia e presença em dinâmicas relacionais', descriptionEn: 'Relational presence and harmony' },
      { name: 'Introspecção', value: 78, description: 'Auto-observação lúcida e autoconhecimento', descriptionEn: 'Lucid self-observation and introspection' },
      { name: 'Sensibilidade', value: 70, description: 'Percepção refinada de nuances e ambientes', descriptionEn: 'Nuance perception and ambient sensitivity' },
      { name: 'Profundidade', value: 76, description: 'Busca por sentido além da camada superficial', descriptionEn: 'Search for meaning beyond the surface' },
    ],
    activeSuggestions: [
      { id: 'w-a1', title: 'Escuta ativa em conversa de confiança', titleEn: 'Active listening in trusted dialogue', tag: 'EMPATIA', tagEn: 'EMPATHY', icon: HeartPulse },
      { id: 'w-a2', title: 'Escrita reflexiva de auto-observação +20m', titleEn: 'Self-observation journaling +20m', tag: 'JOURNAL', tagEn: 'JOURNAL', icon: Feather },
      { id: 'w-a3', title: 'Prática contemplativa de presença', titleEn: 'Contemplative presence practice', tag: 'PRESENÇA', tagEn: 'PRESENCE', icon: Moon },
      { id: 'w-a4', title: 'Imersão em arte ou música suave', titleEn: 'Immersion in art or soundscape', tag: 'HARMONIA', tagEn: 'HARMONY', icon: Sparkles },
    ],
    lowSuggestions: [
      { id: 'w-l1', title: 'Banho relaxante e descompressão muscular', titleEn: 'Relaxing shower & muscle ease', tag: 'CUIDADO', tagEn: 'CARE', icon: Droplets },
      { id: 'w-l2', title: 'Hidratação com chás calmantes', titleEn: 'Hydration with calming herbal tea', tag: 'NUTRIÇÃO', tagEn: 'NUTRITION', icon: Coffee },
      { id: 'w-l3', title: 'Descompressão emocional sem autocrítica', titleEn: 'Emotional release without judgment', tag: 'EQUILÍBRIO', tagEn: 'BALANCE', icon: ShieldCheck },
      { id: 'w-l4', title: 'Silêncio restaurador de 15 minutos', titleEn: 'Restorative silence of 15 minutes', tag: 'SILÊNCIO', tagEn: 'SILENCE', icon: Feather },
    ],
  },
];

type Props = {
  isEnglish: boolean;
  activeElementKey?: 'fire' | 'earth' | 'air' | 'water';
  onSelectElement?: (key: 'fire' | 'earth' | 'air' | 'water') => void;
  onSelectSuggestion?: (title: string) => void;
};

export function ElementCalibrationSection({
  isEnglish,
  activeElementKey: controlledKey,
  onSelectElement,
}: Props) {
  const [internalKey, setInternalKey] = useState<'fire' | 'earth' | 'air' | 'water'>('earth');
  const activeElementKey = controlledKey ?? internalKey;

  const handleSelectElement = (key: 'fire' | 'earth' | 'air' | 'water') => {
    if (onSelectElement) {
      onSelectElement(key);
    } else {
      setInternalKey(key);
    }
    setSelectedSubIndexName(null);
  };

  const [selectedSubIndexName, setSelectedSubIndexName] = useState<string | null>(null);

  // Accordion drop states: closed by default
  const [isActivesOpen, setIsActivesOpen] = useState<boolean>(false);
  const [isLowsOpen, setIsLowsOpen] = useState<boolean>(false);
  const [isActiveSuggestionsOpen, setIsActiveSuggestionsOpen] = useState<boolean>(true);
  const [isLowSuggestionsOpen, setIsLowSuggestionsOpen] = useState<boolean>(true);

  // Sort elements in order of ascendancy (highest score first)
  const sortedElements = useMemo(() => {
    return [...ELEMENTS_CALIBRATION_DATA].sort((a, b) => {
      const avgA = a.subIndices.reduce((acc, curr) => acc + curr.value, 0) / a.subIndices.length;
      const avgB = b.subIndices.reduce((acc, curr) => acc + curr.value, 0) / b.subIndices.length;
      return avgB - avgA;
    });
  }, []);

  const activeElement =
    ELEMENTS_CALIBRATION_DATA.find((e) => e.key === activeElementKey) || sortedElements[0];

  // Calculate Element's overall average index (0 - 100%)
  const totalAverage = Math.round(
    activeElement.subIndices.reduce((acc, curr) => acc + curr.value, 0) / activeElement.subIndices.length
  );

  // Split into Ativos (>= 40%) sorted in descending order of value
  const activeSubIndices = useMemo(() => {
    return activeElement.subIndices
      .filter((item) => item.value >= 40)
      .sort((a, b) => b.value - a.value);
  }, [activeElement]);

  // Split into Baixas (< 40%) sorted in ascending order (lowest first)
  const lowSubIndices = useMemo(() => {
    return activeElement.subIndices
      .filter((item) => item.value < 40)
      .sort((a, b) => a.value - b.value);
  }, [activeElement]);

  // Strategic Top-tier Ranked (100% to 70%)
  const topTierRanked = useMemo(() => {
    return activeElement.subIndices
      .filter((item) => item.value >= 70)
      .sort((a, b) => b.value - a.value);
  }, [activeElement]);

  // Strategic Bottom-tier Ranked (0% to 30%)
  const bottomTierRanked = useMemo(() => {
    return activeElement.subIndices
      .filter((item) => item.value <= 35)
      .sort((a, b) => a.value - b.value);
  }, [activeElement]);

  return (
    <section id="element-calibration-section" className="border-t border-[var(--border)] pt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
          {isEnglish ? 'METRIC CALIBRATION' : 'CALIBRAÇÃO DE MÉTRICAS'}
        </span>
      </div>

      {/* Main Element Calibration Canvas */}
      <div className="space-y-8 pt-1">
        {/* Top: Element Score & Identity (Clean, without redundant subtitles or parentheses) */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[var(--border)] pb-5">
          <div className="flex items-center gap-3">
            <activeElement.icon size={20} className="text-[var(--accent)]" />
            <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
              {isEnglish ? `Element ${activeElement.nameEn}` : `Elemento ${activeElement.name}`}
            </h3>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[var(--foreground)] ml-1">
              {totalAverage}%
            </span>
          </div>

          {/* Clean Counters without parentheses */}
          <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={13} className="text-[var(--accent)]" />
              <span className="text-[var(--foreground)] font-semibold">{activeSubIndices.length}</span>
              <span>{isEnglish ? 'Active' : 'Ativos'}</span>
            </span>
            <span className="text-[var(--border)]">·</span>
            <span className="flex items-center gap-1.5">
              <TrendingDown size={13} className="text-[var(--text-tertiary)]" />
              <span className="text-[var(--foreground)] font-semibold">{lowSubIndices.length}</span>
              <span>{isEnglish ? 'Low' : 'Baixas'}</span>
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BLUSH SECTION 1: ATIVOS (Ranking Ativos -> Drop Lista Ativos -> Sugestões) */}
        {/* ========================================================================= */}
        <div className="space-y-5">
          {/* 1. Ranking Ativos (Highlights 100-70%) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]/60">
              <div className="flex items-center gap-2">
                <ArrowUpRight size={14} className="text-[var(--accent)]" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {isEnglish ? 'Ranking Actives' : 'Ranking Ativos'}
                </h4>
              </div>
              <span className="text-[10px] font-mono font-semibold text-[var(--accent)]">
                {topTierRanked.length} {isEnglish ? 'top indices' : 'índices de ponta'}
              </span>
            </div>

            {/* Ranking Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topTierRanked.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]/60 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[var(--accent)] w-4 shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-[var(--foreground)] truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="w-14 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)]"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--foreground)] w-8 text-right">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Drop / Lista Completa dos Sub-índices Ativos */}
          <div className="space-y-3 pt-1">
            {/* Prominent & Appealing CTA for Full List */}
            <button
              type="button"
              onClick={() => setIsActivesOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/60 bg-[var(--surface-2)]/20 hover:bg-[var(--surface-2)]/40 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {isEnglish ? `Active Sub-indices : ${activeSubIndices.length}` : `Sub-índices Ativos : ${activeSubIndices.length}`}
                </span>
              </div>

              <div className="text-[var(--accent)]">
                {isActivesOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
            </button>

            {/* Opened Clean List without container borders or button boxes */}
            {isActivesOpen && (
              <div className="space-y-1 pt-1 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="divide-y divide-[var(--border)]/50">
                  {activeSubIndices.map((item) => {
                    const isSelected = selectedSubIndexName === item.name;
                    const isTopRanked = item.value >= 70;

                    return (
                      <div key={item.name} className="py-2 px-1 hover:bg-[var(--surface-2)]/20 transition-colors rounded-sm">
                        <div className="flex items-center justify-between gap-3">
                          {/* Left: Name & Rank pointer */}
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {isTopRanked ? (
                              <span
                                title={isEnglish ? 'Top tier (>= 70%)' : 'Destaque de ponta (>= 70%)'}
                                className="text-[var(--accent)] font-bold text-xs shrink-0"
                              >
                                ↑
                              </span>
                            ) : (
                              <span className="w-2.5 shrink-0" />
                            )}
                            <span className="text-xs font-medium text-[var(--foreground)] truncate">
                              {item.name}
                            </span>
                          </div>

                          {/* Center / Right: Progress Bar & Value */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="w-24 sm:w-36 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                              <div
                                className="h-full bg-[var(--accent)]"
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-[var(--foreground)] w-8 text-right">
                              {item.value}%
                            </span>

                            {/* 'i' Info icon to toggle explanation */}
                            <button
                              type="button"
                              onClick={() => setSelectedSubIndexName(isSelected ? null : item.name)}
                              aria-label={`Info ${item.name}`}
                              title={isEnglish ? 'Toggle metric info' : 'Ver informação da métrica'}
                              className={`p-1 rounded-full transition-colors cursor-pointer ${
                                isSelected
                                  ? 'text-[var(--accent)] bg-[var(--accent)]/15'
                                  : 'text-[var(--text-tertiary)] hover:text-[var(--foreground)]'
                              }`}
                            >
                              <Info size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Explanation inline */}
                        {isSelected && (
                          <div className="mt-2 ml-5 pr-2 py-1.5 text-[11px] font-normal leading-relaxed text-[var(--text-secondary)] border-l-2 border-[var(--accent)]/50 pl-2.5 animate-in fade-in">
                            {isEnglish ? item.descriptionEn : item.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Sugestões de Ativos (Clean, Dropdown com ícone discreto) */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setIsActiveSuggestionsOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-left group cursor-pointer"
            >
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">
                {isEnglish ? 'Active Suggestions (Exploration & Leverage)' : 'Sugestões de Exploração (Ativos)'}
              </span>
              <span className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors p-1">
                {isActiveSuggestionsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </span>
            </button>

            {isActiveSuggestionsOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 animate-in fade-in duration-200">
                {activeElement.activeSuggestions.map((sug) => {
                  const SIcon = sug.icon;
                  return (
                    <div
                      key={sug.id}
                      className="flex items-start gap-3 py-1"
                    >
                      <SIcon
                        size={17}
                        className="text-[var(--accent)] mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="text-[9px] font-mono font-bold text-[var(--accent)] uppercase tracking-wider block">
                          {isEnglish ? sug.tagEn : sug.tag}
                        </span>
                        <p className="text-xs font-medium text-[var(--foreground)] leading-snug">
                          {isEnglish ? sug.titleEn : sug.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BLUSH SECTION 2: BAIXAS (Ranking Baixas -> Drop Lista Baixas -> Sugestões) */}
        {/* ========================================================================= */}
        {lowSubIndices.length > 0 && (
          <div className="space-y-5 pt-6 border-t border-[var(--border)]">
            {/* 1. Ranking Baixas (Highlights 0-30%) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]/60">
                <div className="flex items-center gap-2">
                  <ArrowDownRight size={14} className="text-[var(--text-tertiary)]" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
                    {isEnglish ? 'Ranking Lows' : 'Ranking Baixas'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)]">
                  {bottomTierRanked.length} {isEnglish ? 'attention indices' : 'índices de atenção'}
                </span>
              </div>

              {/* Ranking Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bottomTierRanked.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] w-4 shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="w-14 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--text-tertiary)]"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-[var(--text-secondary)] w-8 text-right">
                        {item.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Drop / Lista Completa dos Sub-índices de Baixa */}
            <div className="space-y-3 pt-1">
              {/* Prominent & Appealing CTA for Full Low List */}
              <button
                type="button"
                onClick={() => setIsLowsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/60 bg-[var(--surface-2)]/20 hover:bg-[var(--surface-2)]/40 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2 w-2 rounded-full bg-[var(--text-tertiary)]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
                    {isEnglish ? `Low Sub-indices : ${lowSubIndices.length}` : `Sub-índices de Baixa : ${lowSubIndices.length}`}
                  </span>
                </div>

                <div className="text-[var(--text-secondary)]">
                  {isLowsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </button>

              {/* Opened Clean List without container borders or button boxes */}
              {isLowsOpen && (
                <div className="space-y-1 pt-1 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="divide-y divide-[var(--border)]/50">
                    {lowSubIndices.map((item) => {
                      const isSelected = selectedSubIndexName === item.name;
                      const isBottomRanked = item.value <= 30;

                      return (
                        <div key={item.name} className="py-2 px-1 hover:bg-[var(--surface-2)]/20 transition-colors rounded-sm">
                          <div className="flex items-center justify-between gap-3">
                            {/* Left: Name & Rank pointer */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {isBottomRanked ? (
                                <span
                                  title={isEnglish ? 'Attention tier (<= 30%)' : 'Atenção especial (<= 30%)'}
                                  className="text-[var(--text-tertiary)] font-bold text-xs shrink-0"
                                >
                                  ↓
                                </span>
                              ) : (
                                <span className="w-2.5 shrink-0" />
                              )}
                              <span className="text-xs font-medium text-[var(--text-secondary)] truncate">
                                {item.name}
                              </span>
                            </div>

                            {/* Center / Right: Progress Bar & Value */}
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="w-24 sm:w-36 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                                <div
                                  className="h-full bg-[var(--text-tertiary)]"
                                  style={{ width: `${item.value}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono font-semibold text-[var(--text-secondary)] w-8 text-right">
                                {item.value}%
                              </span>

                              {/* 'i' Info icon to toggle explanation */}
                              <button
                                type="button"
                                onClick={() => setSelectedSubIndexName(isSelected ? null : item.name)}
                                aria-label={`Info ${item.name}`}
                                title={isEnglish ? 'Toggle metric info' : 'Ver informação da métrica'}
                                className={`p-1 rounded-full transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'text-[var(--accent)] bg-[var(--accent)]/15'
                                    : 'text-[var(--text-tertiary)] hover:text-[var(--foreground)]'
                                }`}
                              >
                                <Info size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Expandable Explanation inline */}
                          {isSelected && (
                            <div className="mt-2 ml-5 pr-2 py-1.5 text-[11px] font-normal leading-relaxed text-[var(--text-secondary)] border-l-2 border-[var(--text-tertiary)]/50 pl-2.5 animate-in fade-in">
                              {isEnglish ? item.descriptionEn : item.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Sugestões de Baixas (Clean, Dropdown com ícone discreto) */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLowSuggestionsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-left group cursor-pointer"
              >
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">
                  {isEnglish ? 'Balance & Restoration Suggestions (Low)' : 'Sugestões de Equilíbrio (Baixas)'}
                </span>
                <span className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors p-1">
                  {isLowSuggestionsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
              </button>

              {isLowSuggestionsOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 animate-in fade-in duration-200">
                  {activeElement.lowSuggestions.map((sug) => {
                    const SIcon = sug.icon;
                    return (
                      <div
                        key={sug.id}
                        className="flex items-start gap-3 py-1"
                      >
                        <SIcon
                          size={17}
                          className="text-[var(--text-tertiary)] mt-0.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                            {isEnglish ? sug.tagEn : sug.tag}
                          </span>
                          <p className="text-xs font-medium text-[var(--foreground)] leading-snug">
                            {isEnglish ? sug.titleEn : sug.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
