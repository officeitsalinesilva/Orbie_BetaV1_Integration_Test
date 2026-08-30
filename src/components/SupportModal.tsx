import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Mail,
  BookOpen,
  Play,
  Sparkles,
  Shield,
  CreditCard,
  Layers,
  Compass,
  Hash,
  Crown,
  Copy,
  Check,
  ChevronDown,
  Info,
  Building2,
  Tv,
  MessageSquare,
  Flame,
} from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isEnglish?: boolean;
  initialTab?: 'faq' | 'tutorials' | 'company' | 'contact';
};

export function SupportModal({
  isOpen,
  onClose,
  isEnglish = false,
  initialTab = 'faq',
}: Props) {
  const [activeTab, setActiveTab] = useState<'faq' | 'tutorials' | 'company' | 'contact'>(
    initialTab
  );
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeVideoTopic, setActiveVideoTopic] = useState<string>('tour');

  if (!isOpen) return null;

  const copySupportEmail = () => {
    navigator.clipboard.writeText('suporte@orbapp.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Categories for FAQs
  const faqCategories = [
    { id: 'all', label: isEnglish ? 'All FAQs' : 'Todas as Dúvidas' },
    { id: 'account', label: isEnglish ? 'Account' : 'Conta', icon: Shield },
    { id: 'credits', label: isEnglish ? 'Credits' : 'Créditos', icon: CreditCard },
    { id: 'products', label: isEnglish ? 'Products' : 'Produtos', icon: Layers },
    { id: 'astrology', label: isEnglish ? 'Astrology' : 'Astrologia', icon: Compass },
    { id: 'numerology', label: isEnglish ? 'Numerology' : 'Numerologia', icon: Hash },
    { id: 'kabbalah', label: isEnglish ? 'Kabbalah' : 'Cabala', icon: Crown },
    { id: 'cartomancy', label: isEnglish ? 'Cartomancy' : 'Cartomancia', icon: Sparkles },
  ];

  // Comprehensive FAQ list
  const faqItems = [
    // 1. Conta
    {
      id: 'faq-1',
      category: 'account',
      q: isEnglish
        ? 'How do I edit my birth details or account preferences?'
        : 'Como altero meus dados de nascimento ou preferências de conta?',
      a: isEnglish
        ? 'You can access your Account & Cloud Sync settings through the gear icon in the Profile screen or inside the lateral drawer. Your birth time and location are encrypted and immediately update all cosmic calculations in real-time.'
        : 'Você pode acessar os Ajustes de Conta & Sincronização clicando no ícone de engrenagem na tela de Perfil ou no menu lateral. O horário e local de nascimento são salvos de forma segura e recalibram instantaneamente todos os cálculos da plataforma em tempo real.',
    },
    {
      id: 'faq-2',
      category: 'account',
      q: isEnglish
        ? 'Is my daily journal and consciousness data private?'
        : 'Os registros do meu diário e dados de consciência são privados?',
      a: isEnglish
        ? 'Yes, absolutely. Orb applies strict end-to-end client storage and encrypted Google Cloud backup. Your personal check-ins, journal notes, and audio sessions are never sold or shared.'
        : 'Sim, com total soberania. O Orb utiliza criptografia local e sincronização segura com a Nuvem Google. Suas reflexões de check-in, anotações e sessões sonoras pertencem unicamente a você e nunca são compartilhadas com terceiros.',
    },
    // 2. Créditos
    {
      id: 'faq-3',
      category: 'credits',
      q: isEnglish
        ? 'How do credits (◎) work and what is their consumption rate?'
        : 'Como funcionam os créditos (◎) e qual é a taxa de consumo?',
      a: isEnglish
        ? 'Credits are the universal currency of the Orb ecosystem. 1 prompt with Orbie Chat consumes 1 credit. Generating harmonic soundscapes or unlocking premium archetypal dossiers requires credits indicated in the catalog. Subscribers receive daily recurring allowances.'
        : 'Os créditos são a unidade universal de processamento do Orb. Cada interação no Chat com o Orbie consome 1 crédito. Geração de frequências binaurais ou desbloqueio de dossiês do catálogo utilizam os créditos indicados. Assinantes recebem cotas diárias recorrentes de recarga.',
    },
    {
      id: 'faq-4',
      category: 'credits',
      q: isEnglish
        ? 'Do acquired credits ever expire?'
        : 'Os créditos adquiridos expiram?',
      a: isEnglish
        ? 'Purchased credit matrix packages do not expire. Daily subscription bonus credits renew every 24 hours at 00:00 local time.'
        : 'Pacotes de créditos adquiridos avulsos não expiram. Já os créditos bônus da assinatura diária renovam a cada 24 horas às 00:00 do seu fuso horário.',
    },
    // 3. Produtos
    {
      id: 'faq-5',
      category: 'products',
      q: isEnglish
        ? 'How does lifetime access to unlocked Dossier artifacts work?'
        : 'Como funciona o acesso aos artefatos e dossiês desbloqueados?',
      a: isEnglish
        ? 'Once you unlock an artifact (such as NAT-001 Natal Blueprint or NUM-001 Life Path), it becomes permanently bound to your personal Dossier tab and can be referenced at any time inside the Chat with Orbie.'
        : 'Ao desbloquear qualquer artefato do catálogo (como o NAT-001 Matriz Natal ou NUM-001 Caminho de Vida), ele fica permanentemente ativo na sua aba de Dossiê e pode ser consultado ou anexado a qualquer momento nas suas conversas com o Orbie.',
    },
    // 4. Astrologia
    {
      id: 'faq-6',
      category: 'astrology',
      q: isEnglish
        ? 'What calculation system does Orb use for astrological transits?'
        : 'Qual sistema de cálculo astronômico o Orb utiliza para trânsitos astrológicos?',
      a: isEnglish
        ? 'Orb uses high-precision astronomical ephemerides calibrated with Swiss Ephemeris data, calculating true planetary positions, retrograde stations, and precise orb aspect angles for your coordinates.'
        : 'O Orb utiliza efemérides astronômicas de alta precisão calibradas pela Swiss Ephemeris, calculando posições planetárias reais, graus de orbe, retrogradações e aspectos exatos com base nas suas coordenadas geográficas.',
    },
    // 5. Numerologia
    {
      id: 'faq-7',
      category: 'numerology',
      q: isEnglish
        ? 'How is my Personal Year and Daily Frequency computed?'
        : 'Como são calculados meu Ano Pessoal e a Frequência do Dia?',
      a: isEnglish
        ? 'Your personal year is calculated by combining your birth day and month with the universal vibration of the current calendar year. The daily rhythm synthesizes this baseline with today’s planetary hour.'
        : 'O Ano Pessoal é calculado a partir do seu dia e mês de nascimento combinados com a vibração universal do ano corrente. O ritmo diário sintetiza essa frequência base com as horas planetárias do dia.',
    },
    // 6. Cabala
    {
      id: 'faq-8',
      category: 'kabbalah',
      q: isEnglish
        ? 'How does the Tree of Life integrate into my Daily Journal?'
        : 'Como a Árvore da Vida se integra ao meu Daily Journal?',
      a: isEnglish
        ? 'The 10 Sephirot represent spheres of consciousness (from Kether to Malkuth). Daily check-in balances highlight which Sephirah is most stimulated by current cosmic alignments, guiding your focus.'
        : 'As 10 Sephirot representam esferas de manifestação da consciência (de Kether a Malkuth). As leituras diárias indicam qual Sephirah está sob maior influxo dos trânsitos, direcionando foco e ações práticas.',
    },
    // 7. Cartomancia
    {
      id: 'faq-9',
      category: 'cartomancy',
      q: isEnglish
        ? 'How does Orbie interpret archetypal synchronicity and card draws?'
        : 'Como o Orbie interpreta as sincronicidades e tiragens de arquétipos?',
      a: isEnglish
        ? 'Draws operate on quantum random matrix algorithms paired with your active astrological transits, providing Jungian psychological archetypes for deep conscious contemplation.'
        : 'As tiragens utilizam matrizes de aleatoriedade algorítmica sincronizadas aos seus trânsitos do dia, trazendo arquétipos da psicologia analítica junguiana para reflexão profunda e tomada de decisão.',
    },
  ];

  const filteredFaqs =
    selectedFaqCategory === 'all'
      ? faqItems
      : faqItems.filter((f) => f.category === selectedFaqCategory);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 shrink-0 bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <HelpCircle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">
                {isEnglish ? 'Support, FAQs & Knowledge Base' : 'Suporte, FAQs e Central de Ajuda'}
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                {isEnglish ? 'Guides, answers and direct contact' : 'Tutoriais, respostas e canal de atendimento'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isEnglish ? 'Close' : 'Fechar'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* NAVIGATION TABS                                                           */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1 border-b border-[var(--border)] px-6 py-2 bg-[var(--surface-2)]/40 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'faq'
                ? 'bg-[var(--foreground)] text-[var(--background)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <HelpCircle size={14} />
            <span>{isEnglish ? 'Frequently Asked Questions' : 'Perguntas Frequentes'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tutorials')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'tutorials'
                ? 'bg-[var(--foreground)] text-[var(--background)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <BookOpen size={14} />
            <span>{isEnglish ? 'Tutorials & Platform Tour' : 'Tutoriais & Tour'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'company'
                ? 'bg-[var(--foreground)] text-[var(--background)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <Building2 size={14} />
            <span>{isEnglish ? 'About Orb & Solutions' : 'Sobre a Empresa & Soluções'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'contact'
                ? 'bg-[var(--foreground)] text-[var(--background)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <Mail size={14} />
            <span>{isEnglish ? 'Contact & Direct Desk' : 'Contato Oficial'}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB BODY                                                                  */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: FAQ CATEGORIZADAS */}
          {activeTab === 'faq' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[var(--border)]">
                {faqCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedFaqCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      selectedFaqCategory === cat.id
                        ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-xs'
                        : 'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion List */}
              <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-2xl bg-[var(--surface)] overflow-hidden">
                {filteredFaqs.map((faq) => {
                  const isOpen = expandedFaqId === faq.id;
                  return (
                    <div key={faq.id} className="transition-colors">
                      <button
                        type="button"
                        onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left font-medium text-xs sm:text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)]/60 transition-colors cursor-pointer"
                      >
                        <span className="pr-4">{faq.q}</span>
                        <ChevronDown
                          size={16}
                          className={`text-[var(--text-secondary)] shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[var(--accent)]' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-2)]/30 border-t border-[var(--border)]/50 animate-in fade-in">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TUTORIAIS & TOUR */}
          {activeTab === 'tutorials' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Tour em Vídeo Representativo */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv size={16} className="text-[var(--accent)]" />
                    <h3 className="text-sm font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Video Tour & Walkthrough' : 'Vídeo Tour & Guia Rápido da Plataforma'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[var(--accent)]/10 text-[var(--accent)] font-bold px-2 py-0.5 rounded">
                    {isEnglish ? 'Guided Walkthrough' : 'Tour Guiado'}
                  </span>
                </div>

                {/* Video Player Visual Canvas */}
                <div className="relative aspect-video w-full rounded-xl border border-[var(--border)] bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/10 via-transparent to-[var(--background)] pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center max-w-md space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md group-hover:scale-105 transition-transform">
                      <Play size={20} className="ml-1" />
                    </div>
                    <h4 className="text-sm font-bold text-[var(--foreground)] pt-2">
                      {activeVideoTopic === 'tour'
                        ? isEnglish
                          ? 'Complete Platform Tour (Daily, Soundscapes & Orbie Chat)'
                          : 'Tour Completo: Daily Journal, Estúdio Neuroacústico e Chat'
                        : activeVideoTopic === 'chat'
                        ? isEnglish
                          ? 'Mastering Orbie Chat & Attaching Dossier Artifacts'
                          : 'Como usar o Orbie Chat e Integrar seus Dossiês'
                        : activeVideoTopic === 'wallet'
                        ? isEnglish
                          ? 'Recharging & Managing Credit Matrices'
                          : 'Como Adquirir Créditos e Desbloquear Mapas'
                        : isEnglish
                        ? 'Decoding the Consciousness Scale & 4 Elements'
                        : 'Como Interpretar a Escala de Consciência e os 4 Elementos'}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] font-mono">
                      {isEnglish
                        ? 'Interactive visual playback · Chapter selection below'
                        : 'Reprodução interativa · Selecione os capítulos abaixo'}
                    </p>
                  </div>
                </div>

                {/* Video Chapter Selectors */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveVideoTopic('tour')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                      activeVideoTopic === 'tour'
                        ? 'border-[var(--accent)] bg-[var(--surface)] text-[var(--foreground)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <span className="text-[10px] text-[var(--accent)] block">01.</span>
                    {isEnglish ? 'Platform Tour' : 'Tour Geral'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveVideoTopic('chat')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                      activeVideoTopic === 'chat'
                        ? 'border-[var(--accent)] bg-[var(--surface)] text-[var(--foreground)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <span className="text-[10px] text-[var(--accent)] block">02.</span>
                    {isEnglish ? 'Using Chat' : 'Como Usar o Chat'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveVideoTopic('wallet')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                      activeVideoTopic === 'wallet'
                        ? 'border-[var(--accent)] bg-[var(--surface)] text-[var(--foreground)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <span className="text-[10px] text-[var(--accent)] block">03.</span>
                    {isEnglish ? 'Buying Credits' : 'Comprar Créditos'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveVideoTopic('map')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                      activeVideoTopic === 'map'
                        ? 'border-[var(--accent)] bg-[var(--surface)] text-[var(--foreground)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <span className="text-[10px] text-[var(--accent)] block">04.</span>
                    {isEnglish ? 'Interpreting Map' : 'Interpretar Mapa'}
                  </button>
                </div>
              </div>

              {/* Guias Práticos Escritos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
                  <div className="flex items-center gap-2 text-[var(--accent)] font-semibold text-xs">
                    <MessageSquare size={15} />
                    <h4>{isEnglish ? 'Chat with Orbie' : '1. Chat com Orbie'}</h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {isEnglish
                      ? 'Ask questions about your day, explore deep archetypes, or consult transits. Use attached dossier context for tailored answers.'
                      : 'Faça perguntas sobre o seu dia, explore arquétipos e consulte seus trânsitos em tempo real com contextualização contínua.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
                  <div className="flex items-center gap-2 text-[var(--accent)] font-semibold text-xs">
                    <CreditCard size={15} />
                    <h4>{isEnglish ? 'Recharge Credits' : '2. Comprar Créditos'}</h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {isEnglish
                      ? 'Access the Wallet via the navbar or side menu. Choose package tiers (100, 300 or 1000 credits) with instant release.'
                      : 'Acesse a Carteira pela navbar ou menu lateral. Escolha pacotes avulsos de 100, 300 ou 1000 créditos com liberação instantânea.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
                  <div className="flex items-center gap-2 text-[var(--accent)] font-semibold text-xs">
                    <Flame size={15} />
                    <h4>{isEnglish ? 'Map & Elements' : '3. Interpretar o Mapa'}</h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {isEnglish
                      ? 'Track your 4 elements balance (Fire, Earth, Air, Water). Check the Daily Alchemy curve to time high-energy moments.'
                      : 'Acompanhe a calibração dos 4 elementos (Fogo, Terra, Ar, Água) e a curva de alquimia para planejar reuniões e pausas de foco.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOBRE A EMPRESA & SOLUÇÕES */}
          {activeTab === 'company' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/30 space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] font-bold">
                    ORB CONSCIOUSNESS SOLUTIONS
                  </span>
                  <h3 className="text-base font-bold text-[var(--foreground)] mt-1">
                    {isEnglish
                      ? 'Pioneering Personal Consciousness & Neural Synthesis'
                      : 'Pioneirismo em Consciência Pessoal, Neuroacústica e IA Arquetípica'}
                  </h3>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isEnglish
                    ? 'Orb is an ecosystem built at the intersection of precision neuroscience, sidereal astronomical calculations, and advanced generative AI. We develop quiet, deliberate tools that help individuals cultivate self-knowledge, optimal mental states, and daily sovereign alignment.'
                    : 'O Orb é uma plataforma desenvolvida na convergência entre neurociência acústica de precisão, efemérides astronômicas e inteligência artificial arquetípica. Criamos tecnologias silenciosas e deliberadas que auxiliam na auto-observação, estados mentais focados e alinhamento diário.'}
                </p>
              </div>

              {/* Nossas Soluções */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  {isEnglish ? 'OUR INTEGRATED SOLUTIONS' : 'NOSSAS SOLUÇÕES INTEGRADAS'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1.5">
                    <h5 className="text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Daily Journal & Alchemy' : 'Daily Journal & Alquimia Diária'}
                    </h5>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {isEnglish
                        ? 'Real-time temporal rhythms, planetary hours, element calibration, and consciousness scales.'
                        : 'Ritmos temporais em tempo real, horas planetárias, calibração dos 4 elementos e síntese do dia.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1.5">
                    <h5 className="text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Neuroacoustic Studio' : 'Estúdio de Neuroacústica'}
                    </h5>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {isEnglish
                        ? 'Binaural beats, isochronic tones, solfeggio frequencies, and procedural harmonic soundscapes.'
                        : 'Ondas binaurais, tons isocrônicos, frequências de solfeggio e paisagens sonoras harmônicas.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1.5">
                    <h5 className="text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Orbie Chat Companion' : 'Orbie Chatbot & IA'}
                    </h5>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {isEnglish
                        ? 'A focused philosophical companion trained in Jungian archetypes, astrology, and personal growth.'
                        : 'Assistente filosófico treinado em arquétipos junguianos, astrologia sideral e evolução consciente.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1.5">
                    <h5 className="text-xs font-bold text-[var(--foreground)]">
                      {isEnglish ? 'Dossier Artifacts Catalog' : 'Catálogo de Dossiês & Mapas'}
                    </h5>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {isEnglish
                        ? 'Specialized decodings: natal blueprints, karmic nodes, Kabbalah paths, and life cycles.'
                        : 'Decodificações aprofundadas: mapa natal, nós cármicos, caminhos da Cabala e ciclos de vida.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTATO OFICIAL */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                  <Mail size={22} />
                </div>

                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    {isEnglish ? 'Direct Support Help Desk' : 'Central de Atendimento Direto'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {isEnglish
                      ? 'Our dedicated support team is ready to help you with accounts, credit top-ups, and technical questions.'
                      : 'Nossa equipe de suporte está pronta para auxiliar você com sua conta, recargas de créditos e esclarecimento de dúvidas.'}
                  </p>
                </div>

                <div className="inline-flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] max-w-sm mx-auto">
                  <span className="font-mono text-sm font-bold text-[var(--foreground)]">
                    suporte@orbapp.com
                  </span>
                  <button
                    type="button"
                    onClick={copySupportEmail}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedEmail ? (isEnglish ? 'Copied!' : 'Copiado!') : (isEnglish ? 'Copy' : 'Copiar')}</span>
                  </button>
                </div>

                <div className="pt-2 text-[11px] font-mono text-[var(--text-tertiary)]">
                  {isEnglish
                    ? 'Average response time: less than 2 hours (Monday to Sunday)'
                    : 'Tempo médio de resposta: menos de 2 horas (Segunda a Domingo)'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
