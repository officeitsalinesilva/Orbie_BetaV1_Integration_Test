import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Sparkles,
  BookOpen,
  Layers,
  FileText,
  Compass,
  Filter,
  X,
} from 'lucide-react';
import {
  PROFILE_LIBRARY_SECTIONS,
  ProfileLibraryItem,
  ProfileLibrarySectionData,
} from './profileCatalogData';
import { ProfileItemModal } from './ProfileItemModal';

export type LibraryFilter =
  | 'todos'
  | 'disponiveis'
  | 'indisponiveis'
  | 'artefatos'
  | 'livros'
  | 'dossies'
  | 'analises';

type Props = {
  unlockedItems: string[];
  isItemUnlocked: (code: string) => boolean;
  userCredits: number;
  onPurchaseItem: (item: ProfileLibraryItem) => void;
  onOpenItem?: (item: ProfileLibraryItem) => void;
  onOpenWallet?: () => void;
  isEnglish?: boolean;
};

export function ProfileLibrarySection({
  unlockedItems,
  isItemUnlocked,
  userCredits,
  onPurchaseItem,
  onOpenItem,
  onOpenWallet,
  isEnglish = false,
}: Props) {
  // Filtro ativo da biblioteca
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('todos');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown de filtro ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    }
    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  // Dropdown aberto/fechado para cada sessão (todas abertas por padrão)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'perfil-astrologia': true,
    'artefatos-pesquisas': true,
    'perfil-cabala-tarot': true,
    'perfil-numerologia': true,
    'biblioteca-livros': true,
  });

  // Índice do carrossel para cada sessão
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({
    'perfil-astrologia': 0,
    'artefatos-pesquisas': 0,
    'perfil-cabala-tarot': 0,
    'perfil-numerologia': 0,
    'biblioteca-livros': 0,
  });

  // Modal do item selecionado
  const [selectedModalItem, setSelectedModalItem] = useState<ProfileLibraryItem | null>(null);

  const filterOptions = [
    { id: 'todos', label: isEnglish ? 'All Items' : 'Todos os Itens' },
    { id: 'disponiveis', label: isEnglish ? 'Available (Unlocked)' : 'Disponíveis (Desbloqueados)' },
    { id: 'indisponiveis', label: isEnglish ? 'Unavailable (Locked)' : 'Indisponíveis (Bloqueados)' },
    { id: 'artefatos', label: isEnglish ? 'Artifacts & Blueprints' : 'Artefatos & Blueprints' },
    { id: 'livros', label: isEnglish ? 'Books & Grimoires' : 'Livros & Grimórios' },
    { id: 'dossies', label: isEnglish ? 'Dossiers & Deep Reports' : 'Dossiês & Relatórios' },
    { id: 'analises', label: isEnglish ? 'Analyses & Ephemeris' : 'Análises & Efemérides' },
  ] as const;

  const matchesFilter = (item: ProfileLibraryItem, targetFilter: LibraryFilter = activeFilter): boolean => {
    const isUnlocked = isItemUnlocked(item.code);
    const lowerName = item.name.toLowerCase();
    const lowerType = item.type.toLowerCase();
    const lowerCat = item.category.toLowerCase();

    switch (targetFilter) {
      case 'disponiveis':
        return isUnlocked;
      case 'indisponiveis':
        return !isUnlocked;
      case 'artefatos':
        return lowerType.includes('artefato') || lowerName.includes('artefato') || lowerName.includes('mapa');
      case 'livros':
        return lowerType.includes('livro') || lowerName.includes('livro') || item.category === 'Biblioteca de Livros';
      case 'dossies':
        return (
          lowerType.includes('dossiê') ||
          lowerType.includes('dossie') ||
          lowerName.includes('dossiê') ||
          lowerName.includes('dossie')
        );
      case 'analises':
        return (
          lowerName.includes('análise') ||
          lowerName.includes('analise') ||
          lowerName.includes('anuário') ||
          lowerName.includes('trânsito') ||
          lowerName.includes('transito') ||
          lowerName.includes('letras') ||
          lowerName.includes('alinhamento')
        );
      case 'todos':
      default:
        return true;
    }
  };

  // Contagem de itens para um dado filtro
  const countItemsForFilter = (filterId: LibraryFilter) => {
    let count = 0;
    PROFILE_LIBRARY_SECTIONS.forEach((sec) => {
      sec.items.forEach((item) => {
        if (matchesFilter(item, filterId)) count++;
      });
    });
    return count;
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNextSlide = (sectionId: string, totalItems: number) => {
    if (totalItems <= 1) return;
    setCarouselIndices((prev) => {
      const current = prev[sectionId] || 0;
      const next = current + 1 >= totalItems ? 0 : current + 1;
      return { ...prev, [sectionId]: next };
    });
  };

  const handlePrevSlide = (sectionId: string, totalItems: number) => {
    if (totalItems <= 1) return;
    setCarouselIndices((prev) => {
      const current = prev[sectionId] || 0;
      const prevIdx = current - 1 < 0 ? totalItems - 1 : current - 1;
      return { ...prev, [sectionId]: prevIdx };
    });
  };

  const setSlideIndex = (sectionId: string, idx: number) => {
    setCarouselIndices((prev) => ({ ...prev, [sectionId]: idx }));
  };

  const activeFilterObj = filterOptions.find((f) => f.id === activeFilter);

  return (
    <div className="space-y-6 pt-2">
      {/* Título Geral da Biblioteca com Botão de Filtro Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border)] gap-2">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[var(--accent)]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
            {isEnglish ? 'LIBRARY & SERVICES CATALOG' : 'BIBLIOTECA & CATÁLOGO DE SERVIÇOS'}
          </h3>
        </div>

        {/* Dropdown de Filtro com Ícone */}
        <div className="relative flex items-center gap-2" ref={filterDropdownRef}>
          <button
            type="button"
            id="btn-library-filter-dropdown"
            onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer border shadow-2xs ${
              activeFilter !== 'todos'
                ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent font-bold'
                : 'bg-[var(--surface-2)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-2)]/80'
            }`}
          >
            <Filter size={13} className={activeFilter !== 'todos' ? 'text-[var(--background)]' : 'text-[var(--accent)]'} />
            <span>{activeFilterObj?.label || (isEnglish ? 'Filter' : 'Filtro')}</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Botão de Limpar Filtro se não for 'todos' */}
          {activeFilter !== 'todos' && (
            <button
              type="button"
              onClick={() => setActiveFilter('todos')}
              title={isEnglish ? 'Clear filter' : 'Limpar filtro'}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}

          {/* Menu Dropdown de Filtro */}
          {isFilterDropdownOpen && (
            <div
              id="library-filter-dropdown-menu"
              className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-2 font-mono text-xs space-y-1"
            >
              <div className="px-2.5 py-1.5 border-b border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-tertiary)] uppercase font-bold">
                <span>{isEnglish ? 'Filter Categories' : 'Categorias de Filtro'}</span>
                <span>{countItemsForFilter('todos')} {isEnglish ? 'total' : 'total'}</span>
              </div>

              {filterOptions.map((opt) => {
                const isSelected = activeFilter === opt.id;
                const count = countItemsForFilter(opt.id as LibraryFilter);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setActiveFilter(opt.id as LibraryFilter);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[var(--foreground)] text-[var(--background)] font-bold shadow-2xs'
                        : 'text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isSelected
                            ? 'bg-[var(--background)] border-transparent text-[var(--foreground)]'
                            : 'border-[var(--border)] bg-[var(--surface-2)]'
                        }`}
                      >
                        {isSelected && <Check size={11} className="stroke-[3]" />}
                      </div>
                      <span>{opt.label}</span>
                    </div>

                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-[var(--background)]/20 text-[var(--background)]' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lista das 5 Sessões com Dropdown */}
      <div className="space-y-4">
        {PROFILE_LIBRARY_SECTIONS.map((section) => {
          const filteredItems = section.items.filter((item) => matchesFilter(item));
          const isOpen = openSections[section.id] ?? true;
          const totalItems = filteredItems.length;

          // If no items match filter in this section, still display or compact
          if (totalItems === 0) {
            return (
              <div
                key={section.id}
                className="rounded-2xl border border-[var(--border)]/60 bg-[var(--surface)] p-3 flex items-center justify-between opacity-60 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-secondary)]">
                    {isEnglish ? section.titleEn : section.title}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {isEnglish ? '0 matching items' : '0 itens no filtro'}
                </span>
              </div>
            );
          }

          const rawIndex = carouselIndices[section.id] || 0;
          const currentIndex = rawIndex >= totalItems ? 0 : rawIndex;
          const currentItem = filteredItems[currentIndex] || filteredItems[0];
          const isUnlocked = isItemUnlocked(currentItem.code);

          return (
            <div
              key={section.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-all shadow-2xs"
            >
              {/* Cabeçalho Dropdown da Sessão */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)]/80 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-[var(--accent)] shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                      {isEnglish ? section.titleEn : section.title}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-mono line-clamp-1">
                      {isEnglish ? section.descriptionEn : section.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--surface)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                    {totalItems} {isEnglish ? 'items' : 'itens'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--text-secondary)] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--accent)]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Corpo do Dropdown com Carrossel de Cards */}
              {isOpen && (
                <div className="p-4 space-y-3 animate-in fade-in duration-200">
                  {/* Container do Carrossel */}
                  <div className="relative">
                    {/* Card Ativo em Foco */}
                    <div
                      onClick={() => setSelectedModalItem(currentItem)}
                      className={`relative flex flex-col justify-between rounded-xl p-4 sm:p-5 transition-all cursor-pointer border ${
                        isUnlocked
                          ? 'border-[var(--border)] bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]/60 shadow-xs'
                          : 'border-[var(--border)]/70 bg-[var(--surface-2)]/15 hover:bg-[var(--surface-2)]/30 opacity-90'
                      }`}
                    >
                      {/* Topo do Card: Código, Categoria e Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[var(--accent)]">
                            {currentItem.code}
                          </span>
                          <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                            {currentItem.type}
                          </span>
                          {currentItem.pages && (
                            <span className="text-[9px] font-mono text-[var(--text-secondary)] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                              {currentItem.pages}
                            </span>
                          )}
                        </div>

                        {/* Selo Liberado / Preço */}
                        <div>
                          {isUnlocked ? (
                            <span className="text-[9px] font-mono font-bold uppercase text-[var(--success)] bg-[var(--success)]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={10} strokeWidth={3} />
                              {isEnglish ? 'Unlocked' : 'Liberado'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">
                              ◎ {currentItem.credits}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Conteúdo Central: Título e Descrição */}
                      <div className="my-3 space-y-1.5">
                        <h5 className="text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                          {isEnglish && currentItem.nameEn ? currentItem.nameEn : currentItem.name}
                        </h5>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                          {isEnglish && currentItem.descriptionEn
                            ? currentItem.descriptionEn
                            : currentItem.description}
                        </p>
                      </div>

                      {/* Rodapé do Card: Ações (Botão de Compra Habilitado mesmo se bloqueado) */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border)]/60">
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                          {isEnglish ? 'Click card for details & steps' : 'Clique no card para detalhes & passos'}
                        </span>

                        <div className="flex items-center gap-2">
                          {!isUnlocked ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPurchaseItem(currentItem);
                              }}
                              title={isEnglish ? `Purchase for ◎ ${currentItem.credits}` : `Adquirir por ◎ ${currentItem.credits}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-mono text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-2xs"
                            >
                              <span>{isEnglish ? 'Buy' : 'Comprar'}</span>
                              <span>◎ {currentItem.credits}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenItem?.(currentItem);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-mono text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-2xs"
                            >
                              <Sparkles size={12} />
                              <span>{isEnglish ? 'Open' : 'Abrir'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Controles de Navegação do Carrossel (Chevrons + Indicador Numérico / Bullets) */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Indicador Numérico sem texto (ex: 1/5) */}
                    <div className="text-[11px] font-mono font-semibold text-[var(--text-tertiary)]">
                      {currentIndex + 1} / {totalItems}
                    </div>

                    {/* Bullets clicáveis */}
                    <div className="flex items-center gap-1.5">
                      {filteredItems.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => setSlideIndex(section.id, dotIdx)}
                          aria-label={`Slide ${dotIdx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            dotIdx === currentIndex
                              ? 'w-5 bg-[var(--foreground)]'
                              : 'w-1.5 bg-[var(--border)] hover:bg-[var(--text-tertiary)]'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Chevrons Anterior / Próximo */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePrevSlide(section.id, totalItems)}
                        title={isEnglish ? 'Previous artifact' : 'Artefato anterior'}
                        aria-label={isEnglish ? 'Previous' : 'Anterior'}
                        className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNextSlide(section.id, totalItems)}
                        title={isEnglish ? 'Next artifact' : 'Próximo artefato'}
                        aria-label={isEnglish ? 'Next' : 'Próximo'}
                        className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Rico de Detalhes do Produto */}
      <ProfileItemModal
        item={selectedModalItem}
        isOpen={!!selectedModalItem}
        onClose={() => setSelectedModalItem(null)}
        isUnlocked={selectedModalItem ? isItemUnlocked(selectedModalItem.code) : false}
        userCredits={userCredits}
        onPurchase={(item) => {
          onPurchaseItem(item);
          setSelectedModalItem(null);
        }}
        onOpenItem={(item) => {
          onOpenItem?.(item);
          setSelectedModalItem(null);
        }}
        isEnglish={isEnglish}
      />
    </div>
  );
}
