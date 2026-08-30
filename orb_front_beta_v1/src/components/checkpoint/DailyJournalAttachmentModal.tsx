import React, { useState } from 'react';
import {
  X,
  Paperclip,
  CheckCircle2,
  Calendar,
  Layers,
  Volume2,
  Share2,
  Check,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Activity,
  Bot,
  User,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  Briefcase,
  Dumbbell,
  BookOpen,
  Radio,
  Zap,
} from 'lucide-react';
import { ElementMetricsSection } from '../journal/ElementMetricsSection';
import { ElementCalibrationSection } from '../journal/ElementCalibrationSection';
import { energyLevels } from '../../constants/energyLevels';
import { useOrb } from '../../context/OrbContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentDateStr: string;
  onSaveAttachment?: () => void;
  isEnglish?: boolean;
}

export const DailyJournalAttachmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentDateStr,
  onSaveAttachment,
  isEnglish = false,
}) => {
  const { profile, credits } = useOrb();
  const [copied, setCopied] = useState(false);
  const [activeElementKey, setActiveElementKey] = useState<'fire' | 'earth' | 'air' | 'water'>('earth');
  const [featuredSphereKey, setFeaturedSphereKey] = useState<string>('career');
  const [selectedWindowInfo, setSelectedWindowInfo] = useState<any>(null);
  const [showWindowsGuide, setShowWindowsGuide] = useState(false);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const text = isEnglish
      ? `Daily Journal Snapshot (${currentDateStr}): Consciousness Level 350 (Acceptance), Earth 71%, Water 64%, Fire 56%, Air 48%, Frequency 528Hz Alpha Waves.`
      : `Anexo do Daily Journal (${currentDateStr}): Nível de Consciência 350 (Aceitação), Terra 71%, Água 64%, Fogo 56%, Ar 48%, Frequência 528Hz Ondas Alfa.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const spheres = [
    {
      key: 'career',
      title: isEnglish ? 'Career & Focus' : 'Carreira & Foco',
      timeWindow: '08:00 — 10:00',
      tag: isEnglish ? 'CRITICAL WINDOW' : 'JANELA NOBRE',
      icon: Briefcase,
      summary: isEnglish
        ? 'High analytical power and strategic composure. Direct effort towards the single priority objective before incoming notifications.'
        : 'Alto poder de análise e compostura estratégica. Direcione esforço para o objetivo prioritário antes de checar notificações.',
      actionAdvice: isEnglish
        ? 'Protect the first 90 minutes from multi-tasking.'
        : 'Proteja os primeiros 90 minutos de distrações externas.',
    },
    {
      key: 'somatic',
      title: isEnglish ? 'Somatic & Energy' : 'Somática & Energia',
      timeWindow: '12:00 — 14:00',
      tag: isEnglish ? 'BODY & REST' : 'CORPO & DESCANSO',
      icon: Dumbbell,
      summary: isEnglish
        ? 'Optimal somatic alignment, gentle movement, hydration and intentional pause for neural reset.'
        : 'Alinhamento somático, hidratação estruturada e pausa intencional para regeneração neural pós-almoço.',
      actionAdvice: isEnglish
        ? 'Take a 15-minute walk outside or light stretches.'
        : 'Faça 15 minutos de caminhada ao ar livre ou alongamentos.',
    },
    {
      key: 'social',
      title: isEnglish ? 'Social Bonds' : 'Vínculos & Relações',
      timeWindow: '16:00 — 18:00',
      tag: isEnglish ? 'COMMUNICATION' : 'COMUNICAÇÃO',
      icon: User,
      summary: isEnglish
        ? 'High empathy and collaborative clarity. Ideal for strategic alignments, feedback, and key connections.'
        : 'Alta empatia e clareza colaborativa. Ideal para alinhamentos em equipe, feedbacks e conexões importantes.',
      actionAdvice: isEnglish
        ? 'Listen actively and lead conversations with acceptance.'
        : 'Pratique escuta ativa e conduza conversas com serenidade.',
    },
    {
      key: 'intellect',
      title: isEnglish ? 'Intellect & Night Reflection' : 'Intelecto & Síntese Noturna',
      timeWindow: '19:00 — 21:00',
      tag: isEnglish ? 'SYNTHESIS' : 'SÍNTESE & ESTUDO',
      icon: BookOpen,
      summary: isEnglish
        ? 'Quiet introspection, consolidation of daily learnings, and gradual neural de-escalation.'
        : 'Introspecção serena, consolidação dos aprendizados do dia e desaceleração progressiva.',
      actionAdvice: isEnglish
        ? 'Dim blue light and prepare for restorative sleep.'
        : 'Reduza a exposição a telas e prepare o descanso noturno.',
    },
  ];

  const featuredSphere = spheres.find((s) => s.key === featuredSphereKey) || spheres[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200 text-[var(--foreground)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* TOP MODAL HEADER: Title, Date, Snapshot Status & Close                   */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001f3f] text-white shadow-xs">
              <Paperclip size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight">
                  {isEnglish ? 'Daily Journal Snapshot Attachment' : 'Anexo do Daily Journal — Snapshot Completo'}
                </h2>
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-mono font-bold border border-emerald-500/20">
                  {isEnglish ? 'SNAPSHOT SYNCED' : 'SNAPSHOT SINCRONIZADO'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
                {currentDateStr} · {isEnglish ? 'Complete identical view of the Daily Journal' : 'Visualização completa e idêntica do Daily Journal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
              <span className="hidden sm:inline">
                {copied ? (isEnglish ? 'Copied' : 'Copiado!') : (isEnglish ? 'Copy' : 'Copiar')}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label={isEnglish ? 'Close' : 'Fechar'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY: FULL COMPLETE DAILY JOURNAL STREAM (EXACT DESIGN)            */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-[var(--background)]">
          {/* 1. Header Agenda Style Date Presentation */}
          <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
            <div>
              <span className="text-3xl font-bold tracking-tight text-[var(--foreground)] leading-none">
                {currentDateStr.split('-')[2] || '25'}
              </span>
              <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                {isEnglish ? 'Consolidated Daily Journal' : 'Daily Journal Consolidado do Dia'}
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase pt-1">
              {currentDateStr}
            </span>
          </div>

          {/* 2. Interactive Logarithmic Consciousness Scale (Hawkins Scale 350) */}
          <section className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-tertiary)]">
                {isEnglish ? 'CONSCIOUSNESS ANCHOR' : 'ÂNCORA DE CONSCIÊNCIA'}
              </span>
              <div className="flex items-baseline gap-2.5">
                <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                  {isEnglish ? 'Aceitação' : 'Aceitação'}
                </h3>
                <span className="font-mono text-sm font-semibold text-[#001f3f] dark:text-blue-400">
                  350
                </span>
                <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[9px] font-mono font-bold border border-emerald-500/20">
                  ● SEGUNDO DESPERTAR
                </span>
              </div>
            </div>

            {/* Consciousness Levels List */}
            <div className="relative h-[150px] overflow-y-auto pr-1 space-y-1 border-y border-[var(--border)] py-1.5 no-scrollbar">
              {energyLevels.map((lvl) => {
                const isCurrent = lvl.value === '350';
                return (
                  <div
                    key={lvl.value}
                    className={`w-full h-7 flex items-center justify-between px-2.5 rounded text-left ${
                      isCurrent
                        ? 'bg-[var(--accent)] text-white font-semibold shadow-xs'
                        : 'text-[var(--text-secondary)] opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[11px] shrink-0 w-8">{lvl.value}</span>
                      <span className={`text-xs truncate ${isCurrent ? 'font-bold' : ''}`}>
                        {lvl.name}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="text-[8px] uppercase tracking-widest font-mono shrink-0 ml-1">
                        ● ATIVO
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Synthesis paragraph */}
            <p className="text-sm leading-relaxed text-[var(--text-secondary)] font-normal max-w-2xl">
              {isEnglish
                ? 'Absence of inner resistance, emotional sovereignty, and harmonious executive alignment throughout the day.'
                : 'Segundo limiar de despertar. Perdão, harmonia e ausência de resistência interna durante o dia.'}
            </p>

            {/* Directive line */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--text-tertiary)]">
                {isEnglish ? 'SUGGESTION' : 'SUGESTÃO'}
              </span>
              <span className="text-[var(--border)]">·</span>
              <span className="font-medium text-[var(--foreground)] text-xs">
                {isEnglish ? 'Deep focus block: 25 min' : 'Bloco de foco: 25 min'}
              </span>
            </div>
          </section>

          {/* 3. Sintonia do Momento & Frequência Neuroacústica (Especificação Técnica Documentada) */}
          <section className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-tertiary)]">
                {isEnglish ? 'NEUROACOUSTIC FREQUENCY' : 'FREQUÊNCIA NEUROACÚSTICA DO DIA'}
              </span>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold tracking-tight text-[var(--foreground)]">
                  {isEnglish ? '528 Hz · Alpha Wave Resonance' : '528 Hz · Ressonância de Ondas Alfa'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                  10-12 Hz EEG
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 space-y-3.5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#001f3f] text-white">
                    <Radio size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Solfeggio Resonance Calibration' : 'Calibração da Matriz Neuroacústica'}
                    </h4>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {isEnglish ? 'Pure Sine Wave · Documented Calibration' : 'Onda Senoidal Pura · Calibração Técnica Documentada'}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  {isEnglish ? 'SYNCHRONIZED' : 'CALIBRADA'}
                </span>
              </div>

              {/* Grid of technical wave parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[var(--text-tertiary)] block">
                    {isEnglish ? 'CARRIER FREQUENCY' : 'FREQ. PORTADORA'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#001f3f] dark:text-blue-300">
                    528 Hz
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] block">
                    {isEnglish ? 'Transformation' : 'Reparação Biológica'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[var(--text-tertiary)] block">
                    {isEnglish ? 'BRAINWAVE BAND' : 'FAIXA CEREBRAL'}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Alfa (10.5 Hz)
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] block">
                    {isEnglish ? 'Calm Alertness' : 'Foco Sereno'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[var(--text-tertiary)] block">
                    {isEnglish ? 'HEMISPHERIC COHERENCE' : 'COERÊNCIA DE FASE'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#001f3f] dark:text-blue-300">
                    94.2%
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] block">
                    {isEnglish ? 'Inter-hemispheric' : 'Inter-hemisférica'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[var(--text-tertiary)] block">
                    {isEnglish ? 'WAVEFORM' : 'PADRÃO ACÚSTICO'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--foreground)]">
                    Senoidal Pura
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] block">
                    {isEnglish ? 'Isochronic Matrix' : 'Matriz Isocrônica'}
                  </span>
                </div>
              </div>

              <div className="border-l-2 border-[#001f3f] dark:border-blue-400 pl-3 py-0.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                {isEnglish
                  ? 'Directive: 15-20 min binaural listening window recommended prior to deep cognitive focus window.'
                  : 'Diretriz Técnica: Sessão de 15 a 20 minutos com fones binaurais recomendada imediatamente antes da Janela Nobre de Foco.'}
              </div>
            </div>
          </section>

          {/* 4. Element Metrics Section */}
          <ElementMetricsSection
            isEnglish={isEnglish}
            activeElementKey={activeElementKey}
            onSelectElement={setActiveElementKey}
          />

          {/* 5. Element Calibration Section */}
          <ElementCalibrationSection
            isEnglish={isEnglish}
            activeElementKey={activeElementKey}
            onSelectElement={setActiveElementKey}
          />

          {/* 6. Janelas do Dia (06:00 — 22:00) */}
          <section className="border-t border-[var(--border)] pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
                {isEnglish ? 'DAY WINDOWS (06:00 — 22:00)' : 'JANELAS DO DIA (06:00 — 22:00)'}
              </span>
              <button
                type="button"
                onClick={() => setShowWindowsGuide(!showWindowsGuide)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <Info size={14} />
              </button>
            </div>

            {/* Multi-segment Timeline Strip */}
            <div className="space-y-2">
              <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full bg-[var(--surface-2)] p-0.5">
                <div className="h-full flex-2 rounded-xs bg-[var(--success)]" title="06h-08h Ativação" />
                <div className="h-full flex-2 rounded-xs bg-[var(--success)] ring-2 ring-[var(--foreground)]" title="08h-10h Pico Produtivo" />
                <div className="h-full flex-2 rounded-xs bg-[var(--warning)]" title="10h-12h Neutro" />
                <div className="h-full flex-2 rounded-xs bg-[var(--destructive)]/70" title="12h-14h Baixa Energia" />
                <div className="h-full flex-2 rounded-xs bg-[var(--destructive)]/70" title="14h-16h Fadiga" />
                <div className="h-full flex-2 rounded-xs bg-[var(--warning)]" title="16h-18h Neutro" />
                <div className="h-full flex-2 rounded-xs bg-[var(--success)]" title="18h-20h Segunda Onda" />
                <div className="h-full flex-2 rounded-xs bg-[var(--warning)]" title="20h-22h Desaceleração" />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-[var(--text-tertiary)] px-0.5">
                {['06h', '09h (Pico)', '12h', '15h', '18h (2ª Onda)', '21h'].map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>
            </div>

            {showWindowsGuide && (
              <div className="border-t border-[var(--border)] pt-3 text-xs text-[var(--text-secondary)] space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-4 text-[10px] font-mono">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--success)]" /> Produtivo</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--warning)]" /> Neutro</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--destructive)]" /> Baixa Energia</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  As janelas cronobiológicas mapeiam as oscilações naturais de neurotransmissores e cortisol ao longo do dia.
                </p>
              </div>
            )}
          </section>

          {/* 7. Daily Post / 4 Spheres Stage */}
          <section className="border-t border-[var(--border)] pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
                {isEnglish ? 'DAILY POST / 4 SPHERES' : 'DAILY POST / 4 ESFERAS'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-8 space-y-3">
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

              {/* Sphere Switcher */}
              <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6 space-y-1.5">
                {spheres.map((sphere) => {
                  const isCurrent = sphere.key === featuredSphereKey;
                  const Icon = sphere.icon;

                  return (
                    <button
                      key={sphere.key}
                      type="button"
                      onClick={() => setFeaturedSphereKey(sphere.key)}
                      className={`w-full flex items-start gap-2.5 py-1.5 px-2 text-left transition-all cursor-pointer group rounded-lg ${
                        isCurrent
                          ? 'bg-[var(--surface-2)] text-[var(--foreground)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <Icon
                        size={15}
                        className={`mt-0.5 shrink-0 ${
                          isCurrent ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className={`text-xs truncate ${isCurrent ? 'font-bold' : 'font-medium'}`}>
                          {sphere.title}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
                          {sphere.timeWindow}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 8. Orb Companion Chat Console Preview */}
          <section className="border-t border-[var(--border)] pt-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold tracking-tight text-[var(--foreground)]">
                {isEnglish ? 'Orb Cognitive Dialogue' : 'Alinhamento com Orb IA'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isEnglish
                  ? 'Consolidated strategic insights and priority alignment recorded for this date.'
                  : 'Síntese estratégica e alinhamento de prioridades gravados para esta data.'}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                  <Bot size={15} />
                </div>
                <span className="text-xs font-bold text-[var(--foreground)]">Orbie</span>
                <span className="ml-auto text-[9px] font-mono text-[var(--text-tertiary)]">
                  {isEnglish ? 'Captured Session' : 'Sessão Capturada'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="rounded-xl bg-[var(--surface)] p-3 border border-[var(--border)] leading-relaxed">
                  <span className="text-[10px] font-mono font-bold text-[var(--accent)] uppercase block mb-1">
                    {isEnglish ? 'STRATEGIC SYNTHESIS' : 'SÍNTESE ESTRATÉGICA'}
                  </span>
                  "{isEnglish
                    ? 'Protected focus block between 08:00 and 10:00 produced optimal execution flow. Preserved cognitive energy for afternoon strategic transitions.'
                    : 'Bloco de foco protegido das 08h às 10h gerou fluxo de execução máximo. Energia cognitiva preservada para as decisões estruturantes da tarde.'}"
                </div>
              </div>
            </div>
          </section>

          {/* 9. User Profile & Status Section */}
          <section className="border-t border-[var(--border)] pt-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                {isEnglish ? 'USER PROFILE & STATUS' : 'PERFIL & STATUS DO USUÁRIO'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName || 'User'}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User size={24} className="text-[var(--foreground)]" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left">
                <h4 className="text-base font-bold text-[var(--foreground)]">
                  {profile?.fullName || 'Usuário'}
                </h4>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono text-[var(--text-secondary)]">
                  <span>{isEnglish ? 'Member since Aug/2026' : 'Membro desde ago/2026'}</span>
                  <span>·</span>
                  <span>{isEnglish ? 'Consecutive days: 6' : 'Dias consecutivos: 6'}</span>
                  <span>·</span>
                  <span className="font-bold text-[var(--foreground)]">◎ {credits || 100}</span>
                </div>

                {/* Completeness Bar */}
                <div className="pt-2 space-y-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div className="h-full bg-[#0A1628] dark:bg-blue-400" style={{ width: '30%' }} />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                    30% {isEnglish ? 'profile completeness' : 'completude de perfil'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER ACTIONS                                                      */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4 bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={15} />
            <span>{isEnglish ? 'Full Snapshot Linked to Checkpoint' : 'Snapshot Completo Vinculado'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#001f3f] text-white hover:bg-[#0a192f] text-xs font-mono font-bold shadow-sm transition-all cursor-pointer active:scale-98"
          >
            {isEnglish ? 'Done' : 'Concluir'}
          </button>
        </div>
      </div>
    </div>
  );
};
