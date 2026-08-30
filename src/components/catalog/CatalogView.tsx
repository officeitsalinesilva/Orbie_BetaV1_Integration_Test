import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowUpDown,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Compass,
  Bookmark,
  Calendar,
  Layers,
  Flame,
  AudioLines,
  AlertTriangle,
  Zap,
  Plus,
  Moon,
  Sun,
  Hash,
  Crown,
  BookOpen,
  Infinity as InfinityIcon,
  CheckSquare,
  Square,
} from 'lucide-react';
import { OrbBrand } from '../OrbBrand';
import { GoogleProfileAvatar } from '../common/GoogleProfileAvatar';
import { SystemSlideDrawer } from '../common/SystemSlideDrawer';
import { AppFooter } from '../common/AppFooter';
import { TermsSupportModal } from '../TermsSupportModal';
import { useOrb } from '../../context/OrbContext';
import {
  PLATFORM_TOOLS,
  ARTIFACT_ITEMS,
  ORB_PLANS,
  CatalogItem,
  CatalogItemSection,
  CatalogItemStatus,
  OrbPlanItem,
} from '../../data/catalogData';

type SortOption = 'code-asc' | 'price-asc' | 'price-desc' | 'name-asc';

type TopicFilter = 'all' | 'astrologia' | 'cabala' | 'numerologia' | 'chave-mestra' | 'mensais-anuais';

type Props = {
  onBack?: () => void;
  onOpenProfile: () => void;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenDailyJournal: () => void;
  onOpenNeuroacustica: () => void;
  onOpenChat?: () => void;
  onSignOut: () => void;
  isEnglish?: boolean;
};

const CAROUSEL_VISIBLE_COUNT = 4;

export function CatalogView({
  onBack,
  onOpenProfile,
  onOpenWallet,
  onOpenNotifications,
  onOpenDailyJournal,
  onOpenNeuroacustica,
  onOpenChat,
  onSignOut,
  isEnglish = false,
}: Props) {
  const { profile, credits, isItemUnlocked, unlockItem, spendCredits } = useOrb();

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('code-asc');
  const [selectedStatus, setSelectedStatus] = useState<CatalogItemStatus | 'todos'>('todos');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Tools expanded state (for dropdown / express click)
  const [expandedToolCode, setExpandedToolCode] = useState<string | null>(null);

  // Modals for confirmation
  const [confirmItem, setConfirmItem] = useState<CatalogItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<OrbPlanItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy' | 'support' | null>(null);

  const name = profile?.preferredName || profile?.fullName?.split(' ')[0] || 'Aline';

  // Topic filter configurations with icons
  const TOPICS: { id: TopicFilter; label: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: 'all',
      label: 'Todos os Serviços',
      labelEn: 'All Services',
      icon: <InfinityIcon size={16} />,
    },
    {
      id: 'astrologia',
      label: 'Astrologia',
      labelEn: 'Astrology',
      icon: <Compass size={16} />,
    },
    {
      id: 'cabala',
      label: 'Cabala & Tarot',
      labelEn: 'Kabbalah & Tarot',
      icon: <BookOpen size={16} />,
    },
    {
      id: 'numerologia',
      label: 'Numerologia',
      labelEn: 'Numerology',
      icon: <Hash size={16} />,
    },
    {
      id: 'chave-mestra',
      label: 'Chave Mestra',
      labelEn: 'Master Key',
      icon: <Crown size={16} />,
    },
    {
      id: 'mensais-anuais',
      label: 'Ciclos & Apoio',
      labelEn: 'Cycles & Support',
      icon: <Calendar size={16} />,
    },
  ];

  // Filtered & sorted artifact catalog items by topic, status and sorting
  const filteredArtifacts = useMemo(() => {
    return ARTIFACT_ITEMS.filter((item) => {
      // Topic filter
      if (selectedTopic === 'astrologia' && item.section !== 'perfil-astrologia') return false;
      if (selectedTopic === 'cabala' && item.section !== 'perfil-cabala') return false;
      if (selectedTopic === 'numerologia' && item.section !== 'perfil-numerologia') return false;
      if (selectedTopic === 'chave-mestra' && item.section !== 'perfil-chave-mestra') return false;
      if (selectedTopic === 'mensais-anuais' && item.section !== 'mensais-anuais') return false;

      // Status filter
      if (selectedStatus !== 'todos' && item.status !== selectedStatus) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-asc') return a.credits - b.credits;
      if (sortOption === 'price-desc') return b.credits - a.credits;
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      return a.code.localeCompare(b.code);
    });
  }, [selectedTopic, selectedStatus, sortOption]);

  const totalArtifactsCount = filteredArtifacts.length;
  const maxStartIndex = Math.max(0, totalArtifactsCount - CAROUSEL_VISIBLE_COUNT);
  const totalPages = Math.ceil(totalArtifactsCount / CAROUSEL_VISIBLE_COUNT);
  const currentPage = Math.floor(carouselIndex / CAROUSEL_VISIBLE_COUNT) + 1;

  // Carousel navigation
  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => Math.max(0, prev - CAROUSEL_VISIBLE_COUNT));
  };

  const handleNextCarousel = () => {
    setCarouselIndex((prev) =>
      Math.min(maxStartIndex, prev + CAROUSEL_VISIBLE_COUNT)
    );
  };

  const handleSelectPage = (pageIdx: number) => {
    setCarouselIndex(Math.min(maxStartIndex, pageIdx * CAROUSEL_VISIBLE_COUNT));
  };

  // Change topic resets carousel index
  const handleSelectTopic = (topic: TopicFilter) => {
    setSelectedTopic(topic);
    setCarouselIndex(0);
  };

  // Visible items in the 4-item carousel slice (strictly 4 horizontally)
  const visibleArtifacts = useMemo(() => {
    return filteredArtifacts.slice(
      carouselIndex,
      carouselIndex + CAROUSEL_VISIBLE_COUNT
    );
  }, [filteredArtifacts, carouselIndex]);

  // Quick debit / action click
  const handlePriceButtonClick = (item: CatalogItem) => {
    if (isItemUnlocked(item.code)) {
      if (item.code === 'FER-003') {
        onOpenNeuroacustica();
      } else if (item.section === 'mensais-anuais') {
        onOpenDailyJournal();
      } else {
        setToastMessage(
          isEnglish
            ? `Item ${item.code} is already unlocked in your library!`
            : `Item ${item.code} já está disponível na sua biblioteca!`
        );
        setTimeout(() => setToastMessage(null), 3500);
      }
      return;
    }

    // Check balance
    if (credits < item.credits) {
      setToastMessage(
        isEnglish
          ? `Insufficient balance (◎ ${credits}). Tap Recharge to add credits.`
          : `Saldo insuficiente (◎ ${credits}). Clique em Recarregar para adicionar créditos.`
      );
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    // Open direct debit confirmation modal
    setConfirmItem(item);
  };

  // Confirm instant debit and immediate unlock
  const handleConfirmDebit = () => {
    if (!confirmItem) return;
    const success = spendCredits(confirmItem.credits);
    if (success) {
      unlockItem(confirmItem.code);
      setToastMessage(
        isEnglish
          ? `Instant acquisition successful! ◎ ${confirmItem.credits} deducted.`
          : `Aquisição instantânea realizada! ◎ ${confirmItem.credits} debitados da sua conta.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    }
    setConfirmItem(null);
  };

  const getToolIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass size={16} className="text-[var(--accent)]" />;
      case 'AlertTriangle':
        return <AlertTriangle size={16} className="text-amber-500" />;
      case 'AudioLines':
        return <AudioLines size={16} className="text-[var(--foreground)]" />;
      case 'Sparkles':
      default:
        return <Sparkles size={16} className="text-[var(--accent)]" />;
    }
  };

  const activeTopicObj = TOPICS.find((t) => t.id === selectedTopic);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24 selection:bg-[var(--accent)]/20">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR FIXA PADRÃO                                                 */}
      {/* - Esquerda: OrbBrand compact                                              */}
      {/* - Centro: Ícone da tela limpo (sem background)                            */}
      {/* - Direita: Foto de perfil (abre o menu slide diretamente)                 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-lg px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between relative">
          {/* Esquerda: Brand */}
          <div className="flex items-center">
            <OrbBrand compact />
          </div>

          {/* Centro da Navbar: Ícone da Tela Limpo (Sem Background/Bordas Mockadas) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none text-[var(--foreground)]">
            <ShoppingBag size={20} strokeWidth={1.75} />
          </div>

          {/* Direita: Foto de Perfil (Abre o Menu Slide da Tela) */}
          <div className="flex items-center">
            <GoogleProfileAvatar
              profile={profile}
              name={name}
              onClick={() => setMenuOpen(true)}
              title={isEnglish ? 'Open menu' : 'Abrir menu'}
            />
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SUB-HEADER: SETA DE RETORNO (Abaixo da logo) + SALDO NA EXTREMA DIREITA  */}
      {/* ========================================================================= */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 flex items-center justify-between">
        {/* Seta de retorno padrão abaixo da logo do Orbie */}
        <button
          type="button"
          onClick={onBack || onOpenDailyJournal}
          aria-label={isEnglish ? 'Back' : 'Voltar'}
          title={isEnglish ? 'Back' : 'Voltar'}
          className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors p-1 -ml-1 cursor-pointer active:scale-95 flex items-center shrink-0"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Tag de Saldo Limpa na Extrema Direita (Sem termos Saldo/Recarregar, apenas ◎ [valor] e +) */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            type="button"
            onClick={onOpenWallet}
            title={isEnglish ? 'Credits balance' : 'Saldo de créditos'}
            className="flex items-center gap-1 font-bold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors cursor-pointer py-1 px-1.5"
          >
            <span>◎ {credits}</span>
          </button>
          <button
            type="button"
            onClick={onOpenWallet}
            title={isEnglish ? 'Add credits' : 'Adicionar créditos'}
            aria-label="+"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTEÚDO PRINCIPAL DO CATÁLOGO                                         */}
      {/* ========================================================================= */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 space-y-8">
        {/* ========================================================================= */}
        {/* SESSÃO 1: PLANOS E ASSINATURAS                                            */}
        {/* ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[var(--accent)]" />
              <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--foreground)]">
                {isEnglish ? 'PLANS & SUBSCRIPTIONS' : 'PLANOS E ASSINATURAS'}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {isEnglish ? 'Day Use Free (10 credits) vs. Pro Plan (20 credits/day)' : 'Day Use Free (10 créditos) vs. Assinatura Pro (20 créditos/dia)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {ORB_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-xl border p-4 sm:p-5 transition-all ${
                  plan.id === 'plan-pro'
                    ? 'border-[var(--accent)]/50 bg-[var(--surface-2)]/30 shadow-xs'
                    : 'border-[var(--border)] bg-[var(--surface)] shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                        plan.id === 'plan-pro'
                          ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)]'
                      }`}
                    >
                      {plan.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--accent)]">
                      {plan.dailyCredits} {isEnglish ? 'daily credits' : 'créditos renováveis/dia'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold text-[var(--foreground)]">{plan.name}</h3>
                    <span className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">
                      {plan.price}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                    {isEnglish ? plan.priceDetailsEn : plan.priceDetails}
                  </p>

                  <ul className="mt-3 space-y-1.5 border-t border-[var(--border)]/60 pt-3">
                    {(isEnglish ? plan.featuresEn : plan.features).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
                        <Check size={13} className="text-[var(--accent)] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-2">
                  {plan.isCurrent ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 text-xs font-mono font-semibold text-[var(--text-secondary)] select-none">
                      <CheckCircle2 size={13} className="text-[var(--success)]" />
                      <span>{isEnglish ? plan.actionLabelEn : plan.actionLabel}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-2xs"
                    >
                      <Sparkles size={13} />
                      <span>{isEnglish ? plan.actionLabelEn : plan.actionLabel}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SESSÃO 2: FERRAMENTAS E SOLUÇÕES (LIVRES, SEM CONTAINERIZAÇÃO / BORDAS MOCK) */}
        {/* ========================================================================= */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[var(--accent)]" />
              <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--foreground)]">
                {isEnglish ? 'PLATFORM TOOLS & SOLUTIONS' : 'FERRAMENTAS & SOLUÇÕES NA PLATAFORMA'}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {isEnglish ? 'Click to execute or check status' : 'Clique para executar ou verificar status'}
            </span>
          </div>

          {/* Lista fluida de ferramentas livres de containers pesados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PLATFORM_TOOLS.map((tool) => {
              const isUnlocked = isItemUnlocked(tool.code);
              const isExpanded = expandedToolCode === tool.code;

              return (
                <div
                  key={tool.code}
                  className="group relative transition-all overflow-hidden py-1.5 px-2 rounded-lg hover:bg-[var(--surface-2)]/40"
                >
                  {/* Botão Principal Compacto / Livre */}
                  <div className="flex items-center justify-between gap-2 select-none">
                    {/* Botão de Ação / Check */}
                    <button
                      type="button"
                      onClick={() => handlePriceButtonClick(tool)}
                      title={
                        isUnlocked
                          ? isEnglish ? 'Completed / Click to access' : 'Concluído / Clique para acessar'
                          : isEnglish ? `Debit ◎ ${tool.credits} & execute` : `Debitar ◎ ${tool.credits} e executar`
                      }
                      className="flex-1 flex items-center gap-2 text-left cursor-pointer hover:opacity-85 transition-opacity min-w-0"
                    >
                      {/* Indicador de Ícone */}
                      <div className="shrink-0 flex items-center justify-center text-[var(--accent)]">
                        {isUnlocked ? (
                          <Check size={14} className="text-[var(--success)]" strokeWidth={2.5} />
                        ) : (
                          getToolIcon(tool.iconName)
                        )}
                      </div>

                      {/* Nome e Código */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold text-[var(--text-tertiary)]">
                            {tool.code}
                          </span>
                          {isUnlocked && (
                            <span className="text-[8.5px] font-mono font-bold text-[var(--success)] uppercase">
                              {isEnglish ? 'Active' : 'Concluído'}
                            </span>
                          )}
                        </div>
                        <h3 className={`text-xs font-semibold truncate leading-tight ${
                          isUnlocked ? 'text-[var(--foreground)] line-through opacity-75' : 'text-[var(--foreground)]'
                        }`}>
                          {tool.name}
                        </h3>
                      </div>
                    </button>

                    {/* Preço / Ação Rápida + Toggle Dropdown */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handlePriceButtonClick(tool)}
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-[var(--accent)] hover:underline transition-all cursor-pointer"
                        >
                          ◎ {tool.credits}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePriceButtonClick(tool)}
                          className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-all cursor-pointer"
                        >
                          {isEnglish ? 'Open' : 'Abrir'}
                        </button>
                      )}

                      {/* Dropdown Chevron */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedToolCode(isExpanded ? null : tool.code);
                        }}
                        aria-label={isEnglish ? 'Details dropdown' : 'Detalhes'}
                        className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[var(--accent)]' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Expandido com Detalhes Expressos */}
                  {isExpanded && (
                    <div className="pt-2 pb-1 text-xs space-y-1 pl-6">
                      <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        {isEnglish && tool.descriptionEn ? tool.descriptionEn : tool.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                        <span>{tool.status}</span>
                        <span>{isEnglish ? 'Day-use debit' : 'Débito diário'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SESSÃO 3: CATÁLOGO GERAL DE ARTEFATOS & SERVIÇOS                          */}
        {/* - Ícones livres de bordas/containers; apenas o selecionado exibe título    */}
        {/* - Filtros Minimalistas (apenas ícones + chevrons)                         */}
        {/* - Cards de serviço com tom suave e sem borda contornando                   */}
        {/* - Numerais ACIMA dos dots em tom prata claro com chevrons aproximados     */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-4 border-t border-[var(--border)]">
          {/* 3.1 ÍCONES LIVRES DE CONTAINER / APENAS ÍCONES (TÍTULO SÓ NO SELECIONADO) */}
          <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none">
            {TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic.id;

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  title={isEnglish ? topic.labelEn : topic.label}
                  className={`flex items-center gap-1.5 py-1 text-xs transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'text-[var(--foreground)] font-bold'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <span className="shrink-0">{topic.icon}</span>
                  {/* Mostra título APENAS quando estiver selecionado */}
                  {isSelected && (
                    <span className="font-semibold tracking-tight text-xs">
                      {isEnglish ? topic.labelEn : topic.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 3.2 LINHA DE FILTROS MINIMALISTAS */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4">
              {/* Filtro de Ordenação: Apenas Ícone + Chevron */}
              <div
                className="relative inline-flex items-center text-[var(--foreground)] hover:text-[var(--accent)] transition-colors cursor-pointer group"
                title={isEnglish ? 'Sort items' : 'Ordenar itens'}
              >
                <ArrowUpDown size={15} className="group-hover:scale-110 transition-transform" />
                <ChevronDown size={12} className="ml-0.5 opacity-70" />
                <select
                  aria-label={isEnglish ? 'Sort' : 'Ordenar'}
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value as SortOption);
                    setCarouselIndex(0);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                >
                  <option value="code-asc">{isEnglish ? 'Code (AST-001)' : 'Código (AST-001)'}</option>
                  <option value="price-asc">{isEnglish ? 'Price: Low to High' : 'Preço: Menor ao Maior'}</option>
                  <option value="price-desc">{isEnglish ? 'Price: High to Low' : 'Preço: Maior ao Menor'}</option>
                  <option value="name-asc">{isEnglish ? 'Alphabetical' : 'Alfabético'}</option>
                </select>
              </div>

              {/* Filtro de Status: Apenas Ícone + Chevron */}
              <div
                className="relative inline-flex items-center text-[var(--foreground)] hover:text-[var(--accent)] transition-colors cursor-pointer group"
                title={isEnglish ? 'Filter status' : 'Filtrar status'}
              >
                <Filter size={15} className="group-hover:scale-110 transition-transform" />
                <ChevronDown size={12} className="ml-0.5 opacity-70" />
                <select
                  aria-label={isEnglish ? 'Filter Status' : 'Filtrar Status'}
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as CatalogItemStatus | 'todos');
                    setCarouselIndex(0);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                >
                  <option value="todos">{isEnglish ? 'All Status' : 'Todos os Status'}</option>
                  <option value="ATIVO">{isEnglish ? 'Active' : 'Ativo'}</option>
                  <option value="BETA">Beta</option>
                  <option value="PLANNED">{isEnglish ? 'Planned' : 'Planejado'}</option>
                </select>
              </div>
            </div>

            <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
              {totalArtifactsCount} {isEnglish ? 'available' : 'disponíveis'}
            </span>
          </div>

          {/* 3.3 GRADE DO CARROSSEL: 4 CARDS NA HORIZONTAL COM BACKGROUND SUAVE E SEM BORDA CONTORNANDO */}
          {visibleArtifacts.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-[var(--surface-2)]/30">
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                {isEnglish ? 'No artifacts found for selected section and filters.' : 'Nenhum artefato encontrado para a sessão e filtros selecionados.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {visibleArtifacts.map((item) => {
                const unlocked = isItemUnlocked(item.code);

                return (
                  <div
                    key={item.code}
                    className="group relative flex flex-col justify-between rounded-xl bg-[var(--surface-2)]/25 hover:bg-[var(--surface-2)]/40 p-3.5 transition-all"
                  >
                    {/* Linha de Sublinhado Sutil no Hover */}
                    <div className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-transparent group-hover:bg-[var(--foreground)] transition-colors rounded-full" />

                    <div>
                      {/* Top: Código + Sessão / Status */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[var(--accent)] tracking-wider">
                          {item.code}
                        </span>

                        <div className="flex items-center gap-1">
                          <span className="text-[8.5px] font-mono font-bold px-1 py-0.5 rounded-sm uppercase tracking-wider text-[var(--text-secondary)]">
                            {item.status}
                          </span>

                          {unlocked && (
                            <span className="flex items-center text-[9px] font-mono font-bold text-[var(--success)]">
                              <CheckCircle2 size={11} />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Título com hover sublinhado suave */}
                      <h3 className="mt-2 text-xs font-bold text-[var(--foreground)] group-hover:underline underline-offset-2 transition-all leading-snug">
                        {item.name}
                      </h3>

                      {/* Descrição */}
                      <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)] line-clamp-2">
                        {isEnglish && item.descriptionEn ? item.descriptionEn : item.description}
                      </p>

                      {/* Sessão de Origem + Páginas */}
                      <div className="mt-2 flex items-center justify-between text-[9.5px] font-mono text-[var(--text-tertiary)] pt-1 border-t border-[var(--border)]/30">
                        <span className="truncate max-w-[110px]">
                          {item.subCategory || (isEnglish ? item.sectionTitleEn : item.sectionTitle)}
                        </span>
                        {item.pages && <span className="truncate max-w-[80px]">{item.pages}</span>}
                      </div>
                    </div>

                    {/* Preço convertido em Ação Direta */}
                    <div className="mt-3 pt-1.5 border-t border-[var(--border)]/30 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-[var(--text-tertiary)]">
                        {unlocked ? (isEnglish ? 'Owned' : 'Adquirido') : (isEnglish ? 'Debit:' : 'Débito:')}
                      </span>

                      <button
                        type="button"
                        onClick={() => handlePriceButtonClick(item)}
                        title={
                          unlocked
                            ? isEnglish ? 'Access item' : 'Acessar item'
                            : isEnglish ? `Click to debit ◎ ${item.credits}` : `Clique para descontar ◎ ${item.credits}`
                        }
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1 ${
                          unlocked
                            ? 'text-[var(--foreground)] hover:underline'
                            : 'text-[var(--accent)] hover:underline'
                        }`}
                      >
                        {unlocked ? (
                          <>
                            <Check size={11} className="text-[var(--success)]" />
                            <span className="text-[11px]">{isEnglish ? 'Open' : 'Abrir'}</span>
                          </>
                        ) : (
                          <span>◎ {item.credits}</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3.4 PAGINAÇÃO DO CARROSSEL: NUMERAIS ACIMA DOS DOTS EM TOM PRATA CLARO COM CHEVRONS APROXIMADOS E SEM TÍTULOS */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-1 pt-4">
              {/* Numerais ACIMA dos dots em tom prata claro */}
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-400">
                <button
                  type="button"
                  onClick={handlePrevCarousel}
                  disabled={carouselIndex === 0}
                  aria-label="Previous"
                  className="text-zinc-400 hover:text-[var(--foreground)] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors p-0.5"
                >
                  <ChevronLeft size={15} />
                </button>

                <span className="tracking-widest">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={handleNextCarousel}
                  disabled={carouselIndex >= maxStartIndex}
                  aria-label="Next"
                  className="text-zinc-400 hover:text-[var(--foreground)] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors p-0.5"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Dots abaixo dos numerais */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const isActive = idx === currentPage - 1;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPage(idx)}
                      aria-label={`Page ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        isActive
                          ? 'w-4 bg-zinc-400'
                          : 'w-1.5 bg-zinc-600/40 hover:bg-zinc-400'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Global App Footer */}
        <AppFooter
          isEnglish={isEnglish}
          onOpenTerms={() => setTermsModalType('terms')}
          onOpenPrivacy={() => setTermsModalType('privacy')}
          onOpenSupport={() => setTermsModalType('support')}
          className="pt-10"
        />
      </main>

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE DÉBITO INSTANTÂNEO                                */}
      {/* ========================================================================= */}
      {confirmItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setConfirmItem(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <Zap size={20} />
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                {isEnglish ? 'Confirm Instant Acquisition' : 'Confirmar Aquisição Instantânea'}
              </h3>
            </div>

            <div className="mt-3.5 space-y-2 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] p-3 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[var(--text-secondary)]">{confirmItem.code}</span>
                <span className="font-bold text-[var(--accent)]">◎ {confirmItem.credits} créditos</span>
              </div>
              <p className="font-semibold text-[var(--foreground)] leading-snug">{confirmItem.name}</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {confirmItem.storageTarget === 'painel-apoio'
                  ? (isEnglish ? 'Will be added as Daily Journal support panel.' : 'Será integrado ao painel de apoio do Daily Journal e arquivado na biblioteca ao final do ciclo.')
                  : confirmItem.storageTarget === 'biblioteca'
                  ? (isEnglish ? 'Will be permanently stored in your library.' : 'Será armazenado de forma permanente na sua biblioteca pessoal.')
                  : (isEnglish ? 'Will be active on the platform.' : 'Ficará ativo na plataforma para uso diário.')}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] px-1">
              <span>{isEnglish ? 'Current balance:' : 'Saldo atual:'} ◎ {credits}</span>
              <span>{isEnglish ? 'Remaining balance:' : 'Saldo restante:'} ◎ {credits - confirmItem.credits}</span>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmItem(null)}
                className="flex-1 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
              >
                {isEnglish ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDebit}
                className="flex-1 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                <span>{isEnglish ? 'Debit Now' : 'Debitar Agora'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DO PLANO PRO                                                        */}
      {/* ========================================================================= */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[var(--accent)] text-[var(--accent-foreground)] uppercase">
                {selectedPlan.badge}
              </span>
              <span className="text-lg font-extrabold text-[var(--foreground)]">{selectedPlan.price}</span>
            </div>

            <h3 className="mt-2 text-base font-bold text-[var(--foreground)]">{selectedPlan.name}</h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {isEnglish ? selectedPlan.priceDetailsEn : selectedPlan.priceDetails}
            </p>

            <ul className="mt-4 space-y-2 border-t border-[var(--border)] pt-3">
              {(isEnglish ? selectedPlan.featuresEn : selectedPlan.features).map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                  <Check size={13} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                {isEnglish ? 'Close' : 'Fechar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(null);
                  onOpenWallet();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold hover:opacity-90 cursor-pointer shadow-2xs"
              >
                {isEnglish ? 'Proceed with Plan' : 'Prosseguir com Assinatura'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-medium text-[var(--foreground)] shadow-lg backdrop-blur-md">
          <CheckCircle2 size={15} className="text-[var(--success)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* System Slide Drawer */}
      <SystemSlideDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProfile={onOpenProfile}
        onOpenWallet={onOpenWallet}
        onOpenNotifications={onOpenNotifications}
        onOpenDailyJournal={onOpenDailyJournal}
        onOpenNeuroacustica={onOpenNeuroacustica}
        onOpenCatalog={() => setMenuOpen(false)}
        onOpenChat={onOpenChat}
        onSignOut={onSignOut}
        activeScreen="catalog"
        isEnglish={isEnglish}
      />

      {/* Terms & Support Modal */}
      {termsModalType && (
        <TermsSupportModal
          type={termsModalType}
          onClose={() => setTermsModalType(null)}
          isEnglish={isEnglish}
        />
      )}
    </div>
  );
}
