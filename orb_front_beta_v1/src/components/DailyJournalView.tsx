import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  PenLine,
  User,
  CreditCard,
  Bell,
  HardDrive,
  LogOut,
  X,
  ChevronRight,
  Headphones,
  Dumbbell,
  BookOpen,
  Info,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Moon,
  Activity,
  ShieldCheck,
  Users,
  Briefcase,
  HeartPulse,
  AlertTriangle,
  Play,
  Sun,
  AudioLines,
  Waves,
  Menu,
  TrendingUp,
  Calendar as CalendarIcon,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { OrbBrand } from './OrbBrand';
import { GoogleProfileAvatar } from './common/GoogleProfileAvatar';
import { SystemSlideDrawer } from './common/SystemSlideDrawer';
import { AppFooter } from './common/AppFooter';
import { useOrb } from '../context/OrbContext';
import { FocusTimerModal } from './journal/FocusTimerModal';
import { JournalEntryModal } from './journal/JournalEntryModal';
import { DailyTuneSection } from './journal/DailyTuneSection';
import { ElementMetricsSection } from './journal/ElementMetricsSection';
import { ElementCalibrationSection } from './journal/ElementCalibrationSection';
import { FloatingElementNav } from './journal/FloatingElementNav';
import { SpeechToSpeechModal } from './journal/SpeechToSpeechModal';
import { CheckPointCalendarView } from './checkpoint/CheckPointCalendarView';
import { ChatModal } from './ChatModal';
import { CatalogModal, CATALOG_ITEMS } from './CatalogModal';
import { TermsSupportModal } from './TermsSupportModal';
import { energyLevels } from '../constants/energyLevels';
import { EnergyLevel, DayWindow, OrbTheme } from '../types';
import { MessageSquare, Bot, Lock, CheckCircle2, ArrowRight, ChevronLeft, TrendingDown, Award, Calendar, Compass, Shield, Send, RefreshCw, Mic } from 'lucide-react';

const weekdayPt = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
][new Date().getDay()];

const weekdayEn = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
][new Date().getDay()];

const monthPt = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
][new Date().getMonth()];

const monthEn = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
][new Date().getMonth()];

interface MetricItem {
  key: string;
  name: string;
  value: number;
  label: string;
  description: string;
  icon: LucideIcon;
}

const PRODUCTIVITY_VECTORS: MetricItem[] = [
  {
    key: 'focus',
    name: 'Foco',
    value: 84,
    label: 'Rendimento',
    description: 'Capacidade de sustentação de atenção, concentração profunda e entrega de blocos de alto valor.',
    icon: Target,
  },
  {
    key: 'vigor',
    name: 'Vigor',
    value: 72,
    label: 'Descanso',
    description: 'Restauração fisiológica, qualidade do sono recente e resiliência à fadiga cognitiva.',
    icon: Moon,
  },
  {
    key: 'health',
    name: 'Saúde',
    value: 78,
    label: 'Disposição',
    description: 'Energia somática, circulação, tônus e capacidade de resposta biomecânica do corpo.',
    icon: Activity,
  },
  {
    key: 'neutrality',
    name: 'Neutralidade',
    value: 65,
    label: 'Equilíbrio',
    description: 'Estabilidade afetiva, redução de ansiedade e imunidade a oscilações externas.',
    icon: ShieldCheck,
  },
];

const ALCHEMY_VECTORS: MetricItem[] = [
  {
    key: 'fire',
    name: 'Fogo',
    value: 56,
    label: 'Vontade',
    description: 'Iniciativa ativa, dinamismo, coragem e transformação direta.',
    icon: Flame,
  },
  {
    key: 'earth',
    name: 'Terra',
    value: 71,
    label: 'Execução',
    description: 'Estabilidade prática, disciplina material e consistência na entrega.',
    icon: Mountain,
  },
  {
    key: 'air',
    name: 'Ar',
    value: 48,
    label: 'Clareza',
    description: 'Agilidade mental, articulação de ideias e perspectiva analítica.',
    icon: Wind,
  },
  {
    key: 'water',
    name: 'Água',
    value: 64,
    label: 'Fluidez',
    description: 'Sensibilidade interpessoal, empatia, escuta e adaptação flexível.',
    icon: Droplets,
  },
];

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

type Props = {
  onOpenProfile: () => void;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenNeuroacustica?: () => void;
  onOpenCatalog?: () => void;
  onOpenChat?: () => void;
  onSignOut: () => void;
};

export function DailyJournalView({
  onOpenProfile,
  onOpenWallet,
  onOpenNotifications,
  onOpenNeuroacustica,
  onOpenCatalog,
  onOpenChat,
  onSignOut,
}: Props) {
  const { profile, preferences, savePreferences, dailyCheckPoints, credits } = useOrb();
  const [centralTab, setCentralTab] = useState<'daily-journal' | 'check-point'>('daily-journal');
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [selectedAudioTitle, setSelectedAudioTitle] = useState('');

  // Chatbot & Companion states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);
  const [isInlineVoiceOpen, setIsInlineVoiceOpen] = useState(false);
  const [inlineInput, setInlineInput] = useState('');
  const [inlineMessages, setInlineMessages] = useState<Array<{ id: string; sender: 'user' | 'orb'; text: string; time: string }>>([
    {
      id: 'init-1',
      sender: 'orb',
      text: preferences.language === 'en'
        ? `Good morning${profile?.preferredName ? `, ${profile.preferredName}` : ''}. I am attuned to your day. How can I guide your focus or energy windows today?`
        : `Bom dia${profile?.preferredName ? `, ${profile.preferredName}` : ''}. Estou calibrado com seu dia. Como posso assessorar seu foco, decisões ou energia hoje?`,
      time: '08:30',
    },
  ]);
  const [isOrbTyping, setIsOrbTyping] = useState(false);

  const handleSendInlineChat = (customText?: string) => {
    const text = (customText || inlineInput).trim();
    if (!text) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInlineMessages((prev) => [...prev, userMsg]);
    setInlineInput('');
    setIsOrbTyping(true);

    setTimeout(() => {
      let reply = preferences.language === 'en'
        ? `Analyzing "${text}": Your energetic alignment indicates high focus and analytical clarity today. Keep your attention protected on high-priority goals.`
        : `Analisando seu mapa para "${text}": Seu vetor de foco (84%) e neutralidade (65%) favorecem clareza analítica. Priorize entregas essenciais sem reatividade.`;

      const low = text.toLowerCase();
      if (low.includes('trabalho') || low.includes('work') || low.includes('carreira') || low.includes('career')) {
        reply = preferences.language === 'en'
          ? 'For your career today: Protect the 09:30-12:30 window for high-value strategic execution. Postpone low-priority coordination to late afternoon.'
          : 'Para sua carreira hoje: Proteja a janela das 09:30 às 12:30 para entregas estratégicas de alto impacto. Delegue alinhamentos secundários para o final da tarde.';
      } else if (low.includes('vínculo') || low.includes('pessoas') || low.includes('people') || low.includes('bonds')) {
        reply = preferences.language === 'en'
          ? 'In social interactions: Your neutrality baseline supports empathetic active listening without getting entangled in peripheral tensions.'
          : 'Nas relações e vínculos hoje: Sua linha de neutralidade favorece escuta empática e ponderação. Mantenha presença sem absorver ruídos externos.';
      } else if (low.includes('sentindo') || low.includes('feeling') || low.includes('mentalidade') || low.includes('mindset')) {
        reply = preferences.language === 'en'
          ? 'Regarding your internal state: Acceptance (350) provides harmony and clarity. Observe mental shifts with calm neutrality.'
          : 'Sobre seu estado interno: Seu nível de Aceitação (350) sustenta harmonia e fluidez. Observe qualquer oscilação com tranquilidade e desapego.';
      } else if (low.includes('energia') || low.includes('energy') || low.includes('janela') || low.includes('window')) {
        reply = preferences.language === 'en'
          ? 'Regarding energy: Your peak biological vitality matches the morning cycle. Use late afternoon for restorative reflection.'
          : 'Sobre sua energia: Sua vitalidade biológica está concentrada no ciclo matinal. Use o fim da tarde para desacelerar e regenerar o vigor.';
      }

      setInlineMessages((prev) => [
        ...prev,
        {
          id: `o-${Date.now()}`,
          sender: 'orb' as const,
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsOrbTyping(false);
    }, 550);
  };

  // Catalog & Journey states
  const [catalogOpen, setCatalogOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Terms & Support modal state
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy' | 'support' | null>(null);

  // Interactive popovers & inspect states
  const [selectedLevelInfo, setSelectedLevelInfo] = useState<EnergyLevel | null>(null);
  const [selectedMetricInfo, setSelectedMetricInfo] = useState<MetricItem | null>(null);
  const [selectedWindowInfo, setSelectedWindowInfo] = useState<DayWindow | null>(null);
  const [showWindowsGuide, setShowWindowsGuide] = useState(false);
  const [featuredSphereKey, setFeaturedSphereKey] = useState<string>('career');

  // Active Element state shared across Métricas and Calibração de Métricas
  const [activeElementKey, setActiveElementKey] = useState<'fire' | 'earth' | 'air' | 'water'>('earth');

  // Sticky navbar date scroll tracking
  const dateHeaderRef = useRef<HTMLDivElement | null>(null);
  const [showNavbarDate, setShowNavbarDate] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!dateHeaderRef.current) return;
      const rect = dateHeaderRef.current.getBoundingClientRect();
      // When the top date header leaves the viewport area
      setShowNavbarDate(rect.bottom < 48);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ref to automatically center the active logarithmic level in scroll view
  const scaleContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLevelRef = useRef<HTMLButtonElement | null>(null);

  const isEnglish = preferences.language === 'en';
  const name = profile?.preferredName || profile?.fullName?.split(' ')[0] || (isEnglish ? 'User' : 'Usuária');
  const avatarLetter = (name || 'O').slice(0, 1).toUpperCase();

  const chooseTheme = (theme: OrbTheme) => {
    void savePreferences({ theme });
  };

  const nowHour = new Date().getHours();
  const day = new Date().getDate();
  const fullDateString = isEnglish
    ? `${weekdayEn}, ${monthEn} ${day}`
    : `${weekdayPt}, ${day} de ${monthPt}`;

  const nowYear = new Date().getFullYear();
  const nowMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const nowDay = String(day).padStart(2, '0');
  const todayDateStr = `${nowYear}-${nowMonth}-${nowDay}`;
  const todayCheckPoint = dailyCheckPoints?.find((cp) => cp.date === todayDateStr);

  const currentLevel = energyLevels.find((lvl) => lvl.value === '350') || {
    value: '350',
    name: isEnglish ? 'Acceptance' : 'Aceitação',
    description: isEnglish
      ? 'Forgiveness, transcendence, harmony. Second awakening threshold.'
      : 'Perdão, transcendência, harmonia. Segundo ponto de despertar.',
    trackPosition: 130,
  };

  // Center active level in logarithmic scale on mount
  useEffect(() => {
    if (activeLevelRef.current && scaleContainerRef.current) {
      const container = scaleContainerRef.current;
      const element = activeLevelRef.current;
      const elementOffsetTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.offsetHeight;
      
      container.scrollTop = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2);
    }
  }, []);

  const copy = isEnglish
    ? {
        brandTag: 'ORB / DAILY JOURNAL',
        primaryActionText: 'Start Focus Block (25 min)',
        secondaryActionText: 'Log Reflection',
        profile: 'Profile',
        wallet: 'Wallet (◎ 240)',
        notifications: 'Notifications',
        menu: 'Menu',
        logout: 'Sign Out',
        synthesis:
          'Today provides prime conditions for deep progress on core initiatives before 12:00. Safeguard morning hours for intense analytical focus. Proactively reduce cognitive friction during the afternoon dip, resuming steady flow by early evening.',
      }
    : {
        brandTag: 'ORB / DAILY JOURNAL',
        primaryActionText: 'Iniciar foco (25 min)',
        secondaryActionText: 'Registrar reflexão',
        profile: 'Perfil',
        wallet: 'Carteira (◎ 240)',
        notifications: 'Notificações',
        menu: 'Menu',
        logout: 'Sair',
        synthesis:
          'O dia apresenta condições propícias para avanços substanciais em projetos de carreira e acordos estratégicos até as 12h. Reserve as primeiras horas para trabalho profundo. À tarde, desacelere para preservar o vigor e recupere o ritmo no início da noite com tarefas de baixa fricção.',
      };

  const currentActiveWindow =
    DAY_WINDOWS_LIST.find((w) => nowHour >= w.startHour && nowHour < w.endHour) || DAY_WINDOWS_LIST[1];
  const activeOrSelectedWindow = selectedWindowInfo || currentActiveWindow;

  const getSpheresForWindow = (windowItem: DayWindow): SpherePost[] => {
    switch (windowItem.id) {
      case 'w1': // 06h-08h
        return [
          {
            key: 'career',
            title: isEnglish ? 'Morning Setup & Planning' : 'Planejamento Matinal',
            tag: isEnglish ? 'ALIGNMENT' : 'ALINHAMENTO',
            timeWindow: windowItem.timeRange,
            icon: Briefcase,
            summary: isEnglish
              ? 'Early activation window. Review your primary deliverables for the day, map essential milestones, and structure high-impact priorities without clutter.'
              : 'Janela de ativação matinal. Defina as entregas centrais do dia, mapeie marcos essenciais e organize suas prioridades com mente descansada.',
            actionAdvice: isEnglish
              ? 'Draft top 3 critical objectives before checking external inboxes.'
              : 'Escreva seus 3 objetivos críticos antes de abrir notificações ou caixas de entrada.',
          },
          {
            key: 'social',
            title: isEnglish ? 'Early Sync & Messages' : 'Sincronização & Mensagens',
            tag: isEnglish ? 'ROUTINE' : 'ROTINA',
            timeWindow: windowItem.timeRange,
            icon: Users,
            summary: isEnglish
              ? 'Calm, brief communication. Align household, team presence, and schedule key check-ins for the late morning bracket.'
              : 'Comunicação pontual e serena. Ajuste sua presença diária e reserve contatos estratégicos para o final da manhã.',
            actionAdvice: isEnglish
              ? 'Send essential check-ins early to unlock team workflows.'
              : 'Envie confirmações essenciais com clareza para destravar dependências.',
          },
          {
            key: 'health',
            title: isEnglish ? 'Hydration & Activation' : 'Hidratação & Ativação',
            tag: isEnglish ? 'SOMATIC' : 'SOMÁTICO',
            timeWindow: windowItem.timeRange,
            icon: HeartPulse,
            summary: isEnglish
              ? 'Metabolic wake-up. Drink 500ml of water, get natural sunlight exposure, and engage in light mobility movement to trigger cortisol rhythm naturally.'
              : 'Despertar metabólico. Beba água, busque contato com luz natural e realize movimentos leves de mobilidade para regular o ritmo circadiano.',
            actionAdvice: isEnglish
              ? '5-10 minutes of direct sunlight exposure and diaphragmatic breaths.'
              : '5 a 10 minutos de luz natural e respiração profunda para ativar o tônus.',
          },
          {
            key: 'alerts',
            title: isEnglish ? 'Avoid Premature Stress' : 'Cuidado com Sobrecarga Precoce',
            tag: isEnglish ? 'PREVENTION' : 'PREVENÇÃO',
            timeWindow: windowItem.timeRange,
            icon: AlertTriangle,
            summary: isEnglish
              ? 'Avoid jumping immediately into reactive triage or controversial threads during initial wake-up cycles.'
              : 'Evite pular direto para discussões complexas ou ruído digital antes de consolidar seu alinhamento interno.',
            actionAdvice: isEnglish
              ? 'Keep the first 30 minutes focused on intentional personal grounding.'
              : 'Preserve os primeiros 30 minutos focado no seu alinhamento consciente.',
          },
        ];
      case 'w2': // 08h-10h
        return [
          {
            key: 'career',
            title: isEnglish ? 'Deep Work & Peak Focus' : 'Trabalho Profundo & Pico',
            tag: isEnglish ? 'PEAK FOCUS' : 'FOCO MÁXIMO',
            timeWindow: windowItem.timeRange,
            icon: Briefcase,
            summary: isEnglish
              ? 'Gold bracket for maximum cognitive throughput. Tackle the most intellectually demanding problem, write architecture, or finalize core assets.'
              : 'Janela nobre de throughput cognitivo máximo. Enfrente a tarefa mais exigente, projete soluções estruturantes e entregue sem distrações.',
            actionAdvice: isEnglish
              ? 'Lock 90-minute single-task immersion without switching apps.'
              : 'Trave 90 minutos de imersão monotarefa sem alternar abas ou aplicativos.',
          },
          {
            key: 'social',
            title: isEnglish ? 'Focus Shielding' : 'Blindagem Social',
            tag: isEnglish ? 'PROTECTION' : 'PROTEÇÃO',
            timeWindow: windowItem.timeRange,
            icon: Users,
            summary: isEnglish
              ? 'Shield yourself from impromptu meetings. Inform peers that this window is protected for high-value strategic execution.'
              : 'Proteja-se de reuniões não agendadas. Comunique que este horário está reservado para entregas estratégicas de alto valor.',
            actionAdvice: isEnglish
              ? 'Keep asynchronous mode active; schedule syncs after 10:00.'
              : 'Mantenha modo não perturbe; agende reuniões para depois das 10h.',
          },
          {
            key: 'health',
            title: isEnglish ? 'Posture & Sustained Energy' : 'Postura & Sustentação',
            tag: isEnglish ? 'VITALITY' : 'VITALIDADE',
            timeWindow: windowItem.timeRange,
            icon: HeartPulse,
            summary: isEnglish
              ? 'Sustain neurological energy with steady posture, ergonomic alignment, and balanced blood glucose levels.'
              : 'Sustente a energia com postura ereta, ambiente arejado e hidratação contínua para evitar tensão cervical.',
            actionAdvice: isEnglish
              ? 'Micro-break of 2 minutes to stretch wrists and blink every 30m.'
              : 'Pausa de 2 minutos para soltar ombros e respirar a cada meia hora.',
          },
          {
            key: 'alerts',
            title: isEnglish ? 'Temptation to Multitask' : 'Atenção ao Multitasking',
            tag: isEnglish ? 'PREVENTION' : 'PREVENÇÃO',
            timeWindow: windowItem.timeRange,
            icon: AlertTriangle,
            summary: isEnglish
              ? 'Context-switching carries a 20-minute cognitive penalty. Refuse non-essential interruptions.'
              : 'Alternância de contexto custa até 20 minutos de foco. Não interrompa o fluxo com tarefas secundárias.',
            actionAdvice: isEnglish
              ? 'Write stray thoughts on a scratchpad and stay in your primary task.'
              : 'Anote pensamentos periféricos em um rascunho e continue na tarefa mestre.',
          },
        ];
      case 'w3': // 10h-12h
        return [
          {
            key: 'career',
            title: isEnglish ? 'Strategic Sync & Delivery' : 'Alinhamento & Entregas',
            tag: isEnglish ? 'EXECUTION' : 'EXECUÇÃO',
            timeWindow: windowItem.timeRange,
            icon: Briefcase,
            summary: isEnglish
              ? 'Excellent collaborative momentum. Conduct team syncs, consolidate agreements, and finalize morning deliverable milestones.'
              : 'Momento excelente de tração colaborativa. Realize reuniões bilaterais, alinhe entregas e consolide decisões conjuntas.',
            actionAdvice: isEnglish
              ? 'Close agreements with clear owners and tangible action steps.'
              : 'Feche alinhamentos definindo responsáveis e prazos imediatos.',
          },
          {
            key: 'social',
            title: isEnglish ? 'Bilateral Dialogues & Bonds' : 'Diálogos Bilaterais',
            tag: isEnglish ? 'ALIGNMENT' : 'ALINHAMENTO',
            timeWindow: windowItem.timeRange,
            icon: Users,
            summary: isEnglish
              ? 'Empathetic presence and clear discourse. Ideal time to negotiate, provide constructive feedback, and build trust.'
              : 'Presença empática e escuta lúcida. Momento ideal para negociar, oferecer feedbacks construtivos e nutrir confiança.',
            actionAdvice: isEnglish
              ? 'Listen with curiosity before presenting counter-proposals.'
              : 'Pratique escuta ativa antes de apresentar contrapropostas.',
          },
          {
            key: 'health',
            title: isEnglish ? 'Ocular Relief & Hydration' : 'Alívio Ocular & Pausa',
            tag: isEnglish ? 'BALANCE' : 'EQUILÍBRIO',
            timeWindow: windowItem.timeRange,
            icon: HeartPulse,
            summary: isEnglish
              ? 'Look at distant objects to relieve ciliary eye muscles after intense screen work.'
              : 'Olhe para o horizonte ou pontos distantes para relaxar a musculatura ocular após o foco matinal.',
            actionAdvice: isEnglish
              ? 'Drink fresh water and stand up for 3 minutes before lunch.'
              : 'Beba mais água e levante da cadeira 3 minutos antes do meio-dia.',
          },
          {
            key: 'alerts',
            title: isEnglish ? 'Meeting Overflow' : 'Evite Reuniões Longas',
            tag: isEnglish ? 'PREVENTION' : 'PREVENÇÃO',
            timeWindow: windowItem.timeRange,
            icon: AlertTriangle,
            summary: isEnglish
              ? 'Cap meeting durations at 25 or 45 minutes to prevent fatigue from bleeding into lunch.'
              : 'Encerre chamadas com 5 a 10 minutos de antecedência para evitar estresse pré-almoço.',
            actionAdvice: isEnglish
              ? 'Summarize decisions immediately before concluding calls.'
              : 'Sintetize os próximos passos antes de desligar chamadas.',
          },
        ];
      case 'w4': // 12h-14h
      case 'w5': // 14h-16h
        return [
          {
            key: 'career',
            title: isEnglish ? 'Low-Friction Operational Flow' : 'Operações de Baixa Fricção',
            tag: isEnglish ? 'LIGHT WORK' : 'TRABALHO LEVE',
            timeWindow: windowItem.timeRange,
            icon: Briefcase,
            summary: isEnglish
              ? 'Digestive metabolic dip. Dedicate this window to organizing files, sorting references, reading articles, and cleaning operational backlog.'
              : 'Declínio metabólico natural da digestão. Dedique este período a tarefas organizacionais, limpeza de pendências, catalogação e leituras.',
            actionAdvice: isEnglish
              ? 'Batch light administrative tasks instead of tackling heavy conceptual challenges.'
              : 'Agrupe tarefas operacionais em lote e evite dilemas arquiteturais pesados.',
          },
          {
            key: 'social',
            title: isEnglish ? 'Casual Receptivity' : 'Convivência Descontraída',
            tag: isEnglish ? 'INFORMAL' : 'INFORMAL',
            timeWindow: windowItem.timeRange,
            icon: Users,
            summary: isEnglish
              ? 'Casual exchanges, informal lunches, or relaxed networking without high-stakes tension.'
              : 'Interações informais, conversas leves ou almoço tranquilo sem pautas tensas de pressão.',
            actionAdvice: isEnglish
              ? 'Keep discussions relaxing and avoid debating complex controversies.'
              : 'Mantenha conversas descontraídas e evite discussões polarizadas.',
          },
          {
            key: 'health',
            title: isEnglish ? 'Digestion & Physical Rest' : 'Digestão & Descompressão',
            tag: isEnglish ? 'REPAIR' : 'RESTAURAÇÃO',
            timeWindow: windowItem.timeRange,
            icon: HeartPulse,
            summary: isEnglish
              ? 'Allow autonomic parasympathetic recovery. A 10-15 minute walk or non-sleep deep rest session restores afternoon clarity.'
              : 'Permita a recuperação parassimpática. Uma caminhada de 10 minutos ou repouso consciente restaura a clareza pós-almoço.',
            actionAdvice: isEnglish
              ? 'Avoid heavy sugar spikes; take a gentle post-meal walk.'
              : 'Prefira refeições equilibradas e faça uma breve caminhada ao ar livre.',
          },
          {
            key: 'alerts',
            title: isEnglish ? 'Post-Prandial Fog' : 'Alerta: Fadiga Cognitiva',
            tag: isEnglish ? 'PREVENTION' : 'PREVENÇÃO',
            timeWindow: windowItem.timeRange,
            icon: AlertTriangle,
            summary: isEnglish
              ? 'Cortisol dips naturally. Do not mistake biological down-regulation for lack of discipline.'
              : 'Queda biológica de cortisol. Não confunda cansaço digestivo natural com falta de vontade.',
            actionAdvice: isEnglish
              ? 'Use a timer for 20m restorative rest if needed.'
              : 'Use uma pausa consciente de 15 minutos em vez de forçar foco excessivo.',
          },
        ];
      case 'w6': // 16h-18h
        return [
          {
            key: 'career',
            title: isEnglish ? 'Cycle Wrapping & Momentum' : 'Fechamento do Ciclo',
            tag: isEnglish ? 'WRAPPING' : 'FECHAMENTO',
            timeWindow: windowItem.timeRange,
            icon: Briefcase,
            summary: isEnglish
              ? 'Reactivation momentum. Finalize open tickets, consolidate daily work logs, and prepare tomorrow’s runway with ease.'
              : 'Retomada de ritmo no final da tarde. Feche chamados, revise entregas do dia e deixe o terreno pronto para o dia seguinte.',
            actionAdvice: isEnglish
              ? 'Consolidate all open loops and draft tomorrow’s top priorities.'
              : 'Finalize pendências abertas e registre os avanços alcançados hoje.',
          },
          {
            key: 'social',
            title: isEnglish ? 'Daily Hand-offs & Check-outs' : 'Repasses & Alinhamentos',
            tag: isEnglish ? 'SYNC' : 'REPASSES',
            timeWindow: windowItem.timeRange,
            icon: Users,
            summary: isEnglish
              ? 'Wrap up conversations with teammates, confirm deliveries, and clear ambiguities.'
              : 'Faça repasses objetivos com a equipe, confirme recebimentos e encerre pendências de comunicação.',
            actionAdvice: isEnglish
              ? 'Send short bulleted summaries of accomplishments and next steps.'
              : 'Envie resumos pontuais para garantir que todos estejam alinhados.',
          },
          {
            key: 'health',
            title: isEnglish ? 'Somatic Workout & Movement' : 'Treino & Mobilidade',
            tag: isEnglish ? 'SOMATIC' : 'SOMÁTICO',
            timeWindow: windowItem.timeRange,
            icon: HeartPulse,
            summary: isEnglish
              ? 'Optimal physiological window for physical training, cardio, or strength exercise to elevate endorphins.'
              : 'Janela biológica ideal para atividade física, treino de força ou corrida para liberar endorfinas e descarregar tensão.',
            actionAdvice: isEnglish
              ? '30-45 minutes of aerobic or strength movement.'
              : '30 a 45 minutos de treino físico ou caminhada vigorosa.',
          },
          {
            key: 'alerts',
            title: isEnglish ? 'End of Day Drag' : 'Cuidado com Procrastinação Tardia',
            tag: isEnglish ? 'PREVENTION' : 'PREVENÇÃO',
            timeWindow: windowItem.timeRange,
            icon: AlertTriangle,
            summary: isEnglish
              ? 'Do not start brand new sprawling initiatives right at the end of the business day.'
              : 'Não inicie projetos complexos gigantescos no fim do expediente; priorize fechamentos.',
            actionAdvice: isEnglish
              ? 'Commit to clear wrap-up boundaries.'
              : 'Defina um horário claro para concluir o trabalho do dia.',
          },
        ];
      case 'w7': // 18h-20h
      case 'w8': // 20h-22h
      default:
        return [
          {
            key: 'career',
            title: isEnglish ? 'Authorial Reflection & Synthesis' : 'Síntese Autoral & Reflexão',
            tag: isEnglish ? 'SYNTHESIS' : 'SÍNTESE',
            timeWindow: windowItem.timeRange,
            icon: Briefcase,
            summary: isEnglish
              ? 'Creative second wave. Review your daily checkpoint, record authorial journal insights, and reflect on accomplishments.'
              : 'Segunda onda criativa. Revise seu checkpoint diário, registre notas autorais no diário e assimile os aprendizados.',
            actionAdvice: isEnglish
              ? 'Save your daily checkpoint with authorial comments and metrics.'
              : 'Gere o relatório do seu checkpoint e salve reflexões autorais.',
          },
          {
            key: 'social',
            title: isEnglish ? 'Quality Time & Presence' : 'Presença & Relações',
            tag: isEnglish ? 'BONDS' : 'VÍNCULOS',
            timeWindow: windowItem.timeRange,
            icon: Users,
            summary: isEnglish
              ? 'Unwind with family, loved ones, or peaceful personal space with gentle warmth and genuine presence.'
              : 'Desfrute de tempo de qualidade com quem você ama ou cultive momentos de tranquilidade pessoal com acolhimento.',
            actionAdvice: isEnglish
              ? 'Disconnect from work notifications to protect your relationships.'
              : 'Desligue alertas profissionais e valorize conversas genuínas.',
          },
          {
            key: 'health',
            title: isEnglish ? 'Sleep Hygiene & Restoration' : 'Higiene do Sono & Relaxamento',
            tag: isEnglish ? 'REPAIR' : 'RESTAURAÇÃO',
            timeWindow: windowItem.timeRange,
            icon: HeartPulse,
            summary: isEnglish
              ? 'Dim lights, avoid heavy meals, and listen to regenerative frequencies to prepare for deep restorative sleep.'
              : 'Diminua luzes artificiais, faça uma refeição leve e use neuroacústica relaxante para preparar um sono profundo.',
            actionAdvice: isEnglish
              ? 'Filter blue light 1 hour before sleeping; listen to delta/theta audio.'
              : 'Filtre telas 1 hora antes de dormir e ouça frequências regenerativas.',
          },
          {
            key: 'alerts',
            title: isEnglish ? 'Screen Stimulation' : 'Cuidado com Estímulos Noturnos',
            tag: isEnglish ? 'PREVENTION' : 'PREVENÇÃO',
            timeWindow: windowItem.timeRange,
            icon: AlertTriangle,
            summary: isEnglish
              ? 'Excessive blue light after 20h suppresses melatonin and compromises sleep architecture.'
              : 'Luz de telas após as 20h inibe a melatonina e prejudica a restauração cerebral.',
            actionAdvice: isEnglish
              ? 'Switch devices to night shift mode or read a physical book.'
              : 'Ative o modo noturno e prefira leitura tranquila ou banho morno.',
          },
        ];
    }
  };

  const dailySpheres = getSpheresForWindow(activeOrSelectedWindow);
  const featuredSphere = dailySpheres.find((s) => s.key === featuredSphereKey) || dailySpheres[0];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24">
      {/* Top Header - Apple / Linear Precision */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-lg px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between relative">
          <div className="flex items-center gap-3">
            <OrbBrand compact />
            {showNavbarDate && (
              <div className="flex items-center gap-1.5 border-l border-[var(--border)] pl-3 text-[11px] font-mono animate-in fade-in slide-in-from-left-2 duration-150">
                <span className="font-semibold text-[var(--foreground)] tracking-tight">
                  {day} {isEnglish ? monthEn.slice(0, 3) : monthPt.slice(0, 3)}
                </span>
                <span className="text-[var(--text-tertiary)]">·</span>
                <span className="text-[var(--text-secondary)] capitalize">
                  {isEnglish ? weekdayEn : weekdayPt}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <GoogleProfileAvatar
              profile={profile}
              name={name}
              onClick={() => setMenuOpen(true)}
              title={copy.profile}
            />
          </div>
        </div>
      </header>

      {/* Main Stream */}
      <main className="mx-auto max-w-3xl px-6 pt-8 space-y-8">
        {/* 1. Header Agenda Style: Day big + Month below, Weekday on top right, Segmented Sub-Navigation */}
        <div ref={dateHeaderRef} className="space-y-4">
          {/* Top Date & Weekday */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] leading-none">
                {day}
              </span>
              <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                {isEnglish ? `of ${monthEn}` : `de ${monthPt}`}
              </p>
            </div>

            <span className="text-xs font-mono text-[var(--text-secondary)] capitalize pt-1">
              {isEnglish ? weekdayEn : weekdayPt}
            </span>
          </div>

          {/* Central Panel Sub-Navigation Tabs: DAILY JOURNAL & CHECK POINT (Underline Only, Navy Blue Active) */}
          <div className="flex items-center gap-6 border-b border-[var(--border)] pt-2">
            <button
              type="button"
              onClick={() => setCentralTab('daily-journal')}
              className={`pb-2.5 text-xs font-mono tracking-wider uppercase font-bold transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                centralTab === 'daily-journal'
                  ? 'border-[#001f3f] text-[#001f3f] dark:border-sky-300 dark:text-sky-300'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              Daily Journal
            </button>

            <button
              type="button"
              onClick={() => setCentralTab('check-point')}
              className={`flex items-center gap-2 pb-2.5 text-xs font-mono tracking-wider uppercase font-bold transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                centralTab === 'check-point'
                  ? 'border-[#001f3f] text-[#001f3f] dark:border-sky-300 dark:text-sky-300'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              <span>Check Point</span>
              {todayCheckPoint ? (
                <span
                  className="flex h-2 w-2 rounded-full bg-emerald-500"
                  title={isEnglish ? 'Check-in saved for today' : 'Check-in de hoje salvo'}
                />
              ) : (
                <span
                  className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-xs"
                  title={isEnglish ? 'Pending checkpoint' : 'Checkpoint pendente'}
                />
              )}
            </button>
          </div>
        </div>

        {/* View Switcher: Check Point Secondary View VS Daily Journal Default Stream */}
        {centralTab === 'check-point' ? (
          <CheckPointCalendarView isEnglish={isEnglish} />
        ) : (
          <>
            {/* 2. Interactive Logarithmic Consciousness Scale (Framed to show 5 indicators: 2 above, active center, 2 below) */}
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
                  className={`w-full h-7 flex items-center justify-between px-2.5 rounded transition-all text-left group ${
                    isCurrent
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[11px] shrink-0 w-8">{lvl.value}</span>
                    <span className={`text-xs truncate ${isCurrent ? 'font-bold' : 'text-[var(--text-tertiary)] group-hover:text-[var(--foreground)]'}`}>
                      {lvl.name}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="text-[8px] uppercase tracking-widest font-mono shrink-0 ml-1">
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

        {/* 3. Descriptive Synthesis Block with cohesive Quiet Luxury typography */}
        <section className="space-y-3 pt-2">
          {/* Micro-label + Unified Title & Level indicator */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-tertiary)]">
              {isEnglish ? 'CONSCIOUSNESS ANCHOR' : 'ÂNCORA DE CONSCIÊNCIA'}
            </span>
            <div className="flex items-baseline gap-2.5">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                {isEnglish ? 'Aceitação' : 'Aceitação'}
              </h3>
              <span className="font-mono text-xs font-medium text-[var(--text-secondary)]">
                350
              </span>
            </div>
          </div>

          {/* Synthesis Paragraph */}
          <p className="text-sm leading-relaxed text-[var(--text-secondary)] font-normal max-w-2xl">
            {copy.synthesis}
          </p>

          {/* Suggestion / Directive Line (Refined editorial aesthetic, not a button) */}
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

        {/* 4. Sintonia do Momento (Full-bleed edge-to-edge player right here with floating wave widget) */}
        <DailyTuneSection isEnglish={isEnglish} />

        {/* 5. MÉTRICAS — Element Ascendancy, Scores & Síntese por Elemento */}
        <ElementMetricsSection
          isEnglish={isEnglish}
          activeElementKey={activeElementKey}
          onSelectElement={setActiveElementKey}
        />

        {/* 6. Calibração de Métricas — 4 Elementos, Rankings, Sub-índices & Sugestões */}
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
              className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors"
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
                    className={`h-full flex-1 rounded-xs transition-all ${bgClass} ${
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
                  className="hover:text-[var(--foreground)] transition-colors"
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
                  <span className="font-mono font-bold text-[var(--foreground)]">{selectedWindowInfo.timeRange}</span>
                  <span className="font-semibold text-[var(--foreground)]">· {selectedWindowInfo.title}</span>
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
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)] shrink-0 ml-2"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Guide drawer */}
          {showWindowsGuide && (
            <div className="border-t border-[var(--border)] pt-3 text-xs text-[var(--text-secondary)] space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--success)]" /> Produtivo</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--warning)]" /> Neutro</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--destructive)]" /> Baixa Energia</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                As janelas cronobiológicas mapeiam as oscilações naturais de neurotransmissores e cortisol ao longo do dia, indicando o melhor momento para tarefas analíticas, sociais ou de repouso.
              </p>
            </div>
          )}
        </section>

        {/* 4. Daily Post (YouTube-style Featured Main + Switcher Sidebar) */}
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
            {/* Main Featured Post (Larger Left Stage) */}
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

            {/* Right Side Switcher List (Open editorial style, no button box) */}
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
                        isCurrent ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--foreground)]'
                      }`}
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-xs leading-tight truncate ${
                          isCurrent ? 'font-bold text-[var(--foreground)]' : 'font-medium group-hover:text-[var(--foreground)]'
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

        {/* ========================================================================= */}
        {/* SEÇÃO 1: CHATBOT (ORB COMPANION) - ESPAÇOSA TELA DE CHAT EM DESTAQUE */}
        {/* ========================================================================= */}
        <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-10 my-4 bg-gradient-to-b from-[var(--background)] via-[var(--surface-2)]/35 to-[var(--background)] border-y border-[var(--border)]/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            {/* Header Estratégico e Limpo */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                {isEnglish ? 'Did you talk to Orb today?' : 'Conversou com o Orb hoje?'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                {isEnglish
                  ? 'Start your day in good company! Asking Orb about yourself, your energy windows, and your day.'
                  : 'Comece o seu dia bem acompanhado! Perguntando ao Orb sobre você, suas janelas de energia e suas decisões.'}
              </p>
            </div>

            {/* Banner Interativo: Retomar Última Conversa */}
            <button
              type="button"
              onClick={() => {
                handleSendInlineChat(
                  isEnglish
                    ? 'Continuing from our morning focus and alignment...'
                    : 'Continuando sobre nosso alinhamento de foco da manhã...'
                );
              }}
              className="w-full flex items-center justify-between gap-3 border-l-3 border-[var(--accent)] bg-[var(--surface)]/80 hover:bg-[var(--surface-2)] backdrop-blur-md py-3.5 px-4 rounded-r-xl text-left transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)] shrink-0">
                  <Bot size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">
                    {isEnglish ? 'Last conversation: Today at 08:30' : 'Última conversa: Hoje às 08:30'}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">
                    {isEnglish
                      ? '"Golden window alignment and career strategy"'
                      : '"Alinhamento da janela de ouro e decisões de carreira"'}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] group-hover:translate-x-1 transition-transform shrink-0">
                <span>{isEnglish ? 'Continue' : 'Continuar conversa'}</span>
                <ArrowRight size={14} />
              </span>
            </button>

            {/* Console de Chat em Destaque (Alta Visibilidade, Espaçosa & com Cores Vivas) */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl shadow-xl p-4 sm:p-6 space-y-4">
              {/* Barra Superior do Chat Console: Apenas Orbie */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]/70">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xs">
                    <Bot size={16} />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
                  </div>
                  <span className="text-sm font-bold text-[var(--foreground)] tracking-tight">Orbie</span>
                </div>
              </div>

              {/* Feed de Mensagens Espaçoso e com Respiro (min-h de tela de chat) */}
              <div className="min-h-[200px] max-h-[340px] overflow-y-auto pr-1 space-y-3.5 no-scrollbar">
                {/* Mensagem Inicial de Boas-Vindas se não houver conversa ativa */}
                {inlineMessages.length === 0 && (
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] shadow-inner">
                      <Sparkles size={22} className="animate-pulse" />
                    </div>
                    <div className="max-w-md space-y-1">
                      <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                        {isEnglish
                          ? 'Orbie is ready to guide your day'
                          : 'O Orbie está pronto para guiar seu dia'}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {isEnglish
                          ? 'Ask anything about your mood, work decisions, relationships, or tap a suggested topic below.'
                          : 'Pergunte qualquer coisa sobre seu humor, decisões de trabalho, relações ou selecione um tópico abaixo.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mensagens da Conversa */}
                {inlineMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        m.sender === 'user'
                          ? 'bg-[var(--accent)] text-white font-medium rounded-br-xs'
                          : 'border border-[var(--border)] bg-[var(--surface-2)]/80 text-[var(--foreground)] rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="mt-1 text-[9px] font-mono text-[var(--text-tertiary)] px-1">
                      {m.time}
                    </span>
                  </div>
                ))}

                {isOrbTyping && (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] py-2 px-3 rounded-2xl bg-[var(--surface-2)]/60 border border-[var(--border)] w-fit">
                    <span className="text-[10px] font-mono font-medium">Orbie digitando</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Tópicos Sugeridos em Scroll Horizontal logo acima do campo de entrada */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border)]/60">
                <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  {isEnglish ? 'Explore Prompts' : 'Tópicos Rápidos'}
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
                  {[
                    {
                      area: isEnglish ? 'Career' : 'Carreira',
                      prompt: isEnglish ? 'How will my workday look today?' : 'Como será no meu trabalho hoje?',
                    },
                    {
                      area: isEnglish ? 'Bonds' : 'Vínculos',
                      prompt: isEnglish ? 'How do people perceive me today?' : 'Como as pessoas me vêem hoje?',
                    },
                    {
                      area: isEnglish ? 'Mindset' : 'Mentalidade',
                      prompt: isEnglish ? 'How am I feeling today?' : 'Como estou me sentindo hoje?',
                    },
                    {
                      area: isEnglish ? 'Energy' : 'Energia',
                      prompt: isEnglish ? 'How to best seize my peak energy window?' : 'Como aproveitar melhor minha janela de energia?',
                    },
                    {
                      area: isEnglish ? 'Focus' : 'Foco & Decisões',
                      prompt: isEnglish ? 'What is the priority strategy for this afternoon?' : 'Qual a melhor estratégia para a tarde?',
                    },
                  ].map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendInlineChat(pill.prompt)}
                      className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] px-3 py-1.5 text-xs text-[var(--foreground)] transition-all flex items-center gap-1.5 group shadow-xs hover:shadow-sm"
                    >
                      <span className="font-bold text-[10px] uppercase font-mono text-[var(--accent)]">
                        {pill.area}:
                      </span>
                      <span className="text-[11px] font-medium text-[var(--foreground)]">
                        "{pill.prompt}"
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo de Entrada de Chat com Botão de Microfone Speech-to-Speech */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendInlineChat();
                }}
                className="flex items-center gap-2 rounded-xl bg-[var(--background)] border border-[var(--border)] px-3.5 py-2.5 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all shadow-inner"
              >
                <input
                  type="text"
                  value={inlineInput}
                  onChange={(e) => setInlineInput(e.target.value)}
                  placeholder={
                    isEnglish
                      ? 'Message Orbie about your day, decisions, intuition...'
                      : 'Envie uma mensagem para Orbie sobre seu dia, decisões, intuição...'
                  }
                  className="w-full bg-transparent text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--text-tertiary)] outline-none"
                />

                {/* Speech to Speech Microphone Button */}
                <button
                  type="button"
                  onClick={() => setIsInlineVoiceOpen(true)}
                  title={isEnglish ? 'Speech to speech (Voice mode)' : 'Conversar por voz (Speech to speech)'}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer shrink-0"
                >
                  <Mic size={16} />
                </button>

                <button
                  type="submit"
                  disabled={!inlineInput.trim()}
                  aria-label={isEnglish ? 'Send message' : 'Enviar mensagem'}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition-all hover:opacity-95 disabled:opacity-30 shrink-0 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO: PERFIL DO USUÁRIO (DESTAQUE HIERÁRQUICO SEM CAIXAS) */}
        {/* ========================================================================= */}
        <section className="space-y-6 pt-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
              {isEnglish ? 'USER PROFILE & STATUS' : 'PERFIL & STATUS DO USUÁRIO'}
            </span>
          </div>

          <div className="space-y-5 pt-1">
            {/* User Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Large 80px Avatar */}
              <button
                type="button"
                onClick={onOpenProfile}
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-2)] transition-transform hover:scale-105 active:scale-95"
              >
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-[var(--foreground)]">
                    {avatarLetter}
                  </span>
                )}
              </button>

              <div className="min-w-0 flex-1 space-y-1.5">
                <h3
                  style={{ fontFamily: 'var(--font-sans, inherit)' }}
                  className="text-[20px] font-bold text-[var(--foreground)] tracking-tight"
                >
                  {profile?.fullName || name}
                </h3>

                {/* Frase "Membro desde ago/2026" e "Dias consecutivos" logo abaixo do nome */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono text-[var(--text-secondary)]">
                  <span>{isEnglish ? 'Member since Aug/2026' : 'Membro desde ago/2026'}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} className="text-[var(--accent)]" />
                    <span>{isEnglish ? 'Consecutive days: 6' : 'Dias consecutivos: 6'}</span>
                  </span>
                </div>

                {/* Un-encapsulated credits with slightly overlapping usage trend badge, without labels 'créditos' or 'catálogo' */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1">
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={onOpenWallet}
                      title={isEnglish ? 'Credit balance · Click to recharge' : 'Saldo · Clique para recarregar'}
                      className="inline-flex items-baseline gap-1 text-sm font-mono font-bold text-[var(--foreground)] hover:text-[#001f3f] dark:hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      <span className="text-base font-bold">◎ {credits}</span>
                    </button>

                    {/* Overlapping usage index directly united with the numeral */}
                    <span
                      className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-1 py-0.5 rounded -translate-y-1"
                      title={isEnglish ? 'Burn rate efficiency: -12%' : 'Taxa de uso: -12% no ciclo'}
                    >
                      <TrendingUp size={11} className="stroke-[2.5]" />
                      <span>-12%</span>
                    </span>
                  </div>

                  <span className="text-[var(--text-tertiary)] text-xs">·</span>

                  {/* Discrete catalog shopping bag icon button without the label text */}
                  <button
                    type="button"
                    onClick={() => setCatalogOpen(true)}
                    aria-label={isEnglish ? 'Catalog' : 'Catálogo'}
                    title={isEnglish ? 'Services Catalog' : 'Catálogo de Serviços'}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  >
                    <ShoppingBag size={15} className="text-[#001f3f] dark:text-blue-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Barra de gráfico com ícone de perfil sem background à frente e completude de perfil */}
            <div className="border-t border-[var(--border)] pt-4 space-y-1.5">
              <div className="flex items-center gap-3">
                {/* Ícone de perfil sem background, ícone de usuário */}
                <div className="flex items-center justify-center shrink-0 text-[var(--foreground)]">
                  <User size={18} />
                </div>

                {/* Barra de gráfico */}
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full bg-[#0A1628] dark:bg-blue-400 transition-all duration-500"
                    style={{ width: '30%' }}
                  />
                </div>
              </div>

              {/* Número 30% acompanhado do subtítulo completude de perfil */}
              <div className="pl-7 flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[var(--foreground)]">
                  30%
                </span>
                <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                  {isEnglish ? 'profile completeness' : 'completude de perfil'}
                </span>
              </div>
            </div>

            {/* CTA para acessar Check Point - Apenas "check point ->" sublinhado sem encapsular */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setCentralTab('check-point')}
                className="text-xs font-mono font-bold text-[var(--foreground)] hover:text-[#0A1628] dark:hover:text-blue-300 transition-colors cursor-pointer inline-flex items-center gap-1.5 underline underline-offset-4 hover:opacity-80"
              >
                <span>check point</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </section>
        </>
        )}

        {/* ========================================================================= */}
        {/* FOOTER DO APP */}
        {/* ========================================================================= */}
        <AppFooter
          isEnglish={isEnglish}
          onOpenTerms={() => setTermsModalType('terms')}
          onOpenPrivacy={() => setTermsModalType('privacy')}
          onOpenSupport={() => setTermsModalType('support')}
        />
      </main>

      {/* Interactive Detail Popups / Modals */}

      {/* Consciousness level popup */}
      {selectedLevelInfo && (
        <DetailSheet
          title={selectedLevelInfo.name}
          subtitle={`CONSCIOUSNESS ${selectedLevelInfo.value}`}
          onClose={() => setSelectedLevelInfo(null)}
        >
          <div className="space-y-2 text-xs">
            <p className="leading-relaxed text-[var(--foreground)] font-medium">
              {selectedLevelInfo.description}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] border-t border-[var(--border)] pt-2">
              Posição na escala de David Hawkins. Medição de calibração vibracional e psicológica.
            </p>
          </div>
        </DetailSheet>
      )}

      {/* Metric vector popup */}
      {selectedMetricInfo && (
        <DetailSheet
          title={`${selectedMetricInfo.name} (${selectedMetricInfo.value}%)`}
          subtitle={selectedMetricInfo.label.toUpperCase()}
          onClose={() => setSelectedMetricInfo(null)}
        >
          <div className="space-y-2 text-xs">
            <p className="leading-relaxed text-[var(--foreground)]">
              {selectedMetricInfo.description}
            </p>
            <div className="border-t border-[var(--border)] pt-2 flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
              <span>Índice Atual</span>
              <span className="font-bold text-[var(--accent)]">{selectedMetricInfo.value}%</span>
            </div>
          </div>
        </DetailSheet>
      )}

      {/* Shared Standard System Slide Drawer */}
      <SystemSlideDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProfile={onOpenProfile}
        onOpenWallet={onOpenWallet}
        onOpenNotifications={onOpenNotifications}
        onOpenDailyJournal={() => setMenuOpen(false)}
        onOpenNeuroacustica={onOpenNeuroacustica}
        onOpenCatalog={onOpenCatalog}
        onOpenChat={onOpenChat}
        onSignOut={onSignOut}
        activeScreen="daily-journal"
        isEnglish={isEnglish}
      />

      {/* Focus Timer Modal */}
      {focusModalOpen && (
        <FocusTimerModal
          isEnglish={isEnglish}
          initialPreset={selectedAudioTitle}
          onClose={() => setFocusModalOpen(false)}
        />
      )}

      {/* Journal Entry Modal */}
      {journalModalOpen && (
        <JournalEntryModal
          isEnglish={isEnglish}
          onClose={() => setJournalModalOpen(false)}
        />
      )}

      {/* Chatbot Modal */}
      {chatOpen && (
        <ChatModal
          initialPrompt={chatPrompt}
          isEnglish={isEnglish}
          onClose={() => {
            setChatOpen(false);
            setChatPrompt(undefined);
          }}
        />
      )}

      {/* Catalog Modal */}
      {catalogOpen && (
        <CatalogModal
          isEnglish={isEnglish}
          onClose={() => setCatalogOpen(false)}
          onOpenProfile={onOpenProfile}
          onOpenWallet={onOpenWallet}
        />
      )}

      {/* Terms / Privacy / Support Modal */}
      {termsModalType && (
        <TermsSupportModal
          type={termsModalType}
          isEnglish={isEnglish}
          onClose={() => setTermsModalType(null)}
        />
      )}

      {/* Inline Speech-to-Speech Voice Modal */}
      <SpeechToSpeechModal
        isOpen={isInlineVoiceOpen}
        onClose={() => setIsInlineVoiceOpen(false)}
        onSendMessage={(voiceText) => {
          handleSendInlineChat(voiceText);
        }}
        isEnglish={isEnglish}
      />

      {/* Floating Draggable Element Map / Nav (Appears on scroll, disappears after 4s idle) */}
      <FloatingElementNav
        isEnglish={isEnglish}
        activeElementKey={activeElementKey}
        onSelectElement={setActiveElementKey}
      />
    </div>
  );
}

/**
 * Reusable Web (Radar) Chart Module paired with Vertical Bars
 */
function WebChartModule({
  title,
  subtitle,
  items,
  isEnglish,
  onInspectMetric,
}: {
  title: string;
  subtitle: string;
  items: MetricItem[];
  isEnglish: boolean;
  onInspectMetric: (item: MetricItem) => void;
}) {
  const cx = 60;
  const cy = 60;
  const maxR = 45;

  // 4 Axis Points (Top, Right, Bottom, Left)
  const pTop = { x: cx, y: cy - (items[0].value / 100) * maxR };
  const pRight = { x: cx + (items[1].value / 100) * maxR, y: cy };
  const pBottom = { x: cx, y: cy + (items[3].value / 100) * maxR };
  const pLeft = { x: cx - (items[2].value / 100) * maxR, y: cy };

  const polygonPath = `${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}`;

  return (
    <div className="space-y-3">
      <div>
        <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
          {subtitle}
        </span>
        <h3 className="text-xs font-bold text-[var(--foreground)]">{title}</h3>
      </div>

      <div className="grid grid-cols-12 gap-3 items-center">
        {/* 4-Axis Web Lineart */}
        <div className="col-span-5 flex justify-center">
          <div className="relative h-28 w-28">
            <svg viewBox="0 0 120 120" className="h-full w-full">
              {[0.33, 0.66, 1].map((scale, i) => (
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

              <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="var(--border)" strokeWidth="0.8" />
              <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="var(--border)" strokeWidth="0.8" />

              <polygon
                points={polygonPath}
                className="fill-[var(--accent)]/15 stroke-[var(--accent)]"
                strokeWidth="1.4"
              />

              <circle cx={pTop.x} cy={pTop.y} r="2.5" className="fill-[var(--accent)]" />
              <circle cx={pRight.x} cy={pRight.y} r="2.5" className="fill-[var(--accent)]" />
              <circle cx={pBottom.x} cy={pBottom.y} r="2.5" className="fill-[var(--accent)]" />
              <circle cx={pLeft.x} cy={pLeft.y} r="2.5" className="fill-[var(--accent)]" />
            </svg>
          </div>
        </div>

        {/* Vertical Metric Bars with Succinct Icons */}
        <div className="col-span-7 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onInspectMetric(item)}
                className="w-full text-left group transition-opacity hover:opacity-80"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon size={12} className="text-[var(--accent)] shrink-0" />
                    <span className="font-medium text-[var(--foreground)] truncate">{item.name}</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[var(--foreground)]">{item.value}%</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DetailSheet({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-xl">
        <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-secondary)]">
              {subtitle}
            </span>
            <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function MenuButton({
  label,
  icon: Icon,
  badge,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  badge?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
    >
      <div className="flex items-center gap-3">
        <Icon size={15} className="text-[var(--text-secondary)]" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && <span className="h-1.5 w-1.5 rounded-full bg-[var(--destructive)]" />}
        <ChevronRight size={13} className="text-[var(--text-tertiary)]" />
      </div>
    </button>
  );
}
