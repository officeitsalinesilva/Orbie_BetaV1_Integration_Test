import React, { useState } from 'react';
import {
  X,
  History,
  Archive,
  Trash2,
  Check,
  Plus,
  Sparkles,
  ChevronRight,
  PanelLeftClose,
  MessageSquare,
} from 'lucide-react';
import { ALL_CATALOG_ITEMS, CatalogItem } from '../../data/catalogData';

export interface ChatSessionHistory {
  id: string;
  title: string;
  date: string;
  messageCount: number;
  preview: string;
  contextCodes?: string[];
  messages?: { sender: 'user' | 'orb'; text: string; time: string }[];
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeContextCodes: string[];
  onToggleContextCode: (code: string) => void;
  unlockedItems: string[];
  isItemUnlocked: (code: string) => boolean;
  onOpenCatalog: () => void;
  onSelectSession: (session: ChatSessionHistory) => void;
  onClearHistory: () => void;
  isEnglish?: boolean;
};

export function ChatLibraryDrawer({
  isOpen,
  onClose,
  activeContextCodes,
  onToggleContextCode,
  unlockedItems,
  isItemUnlocked,
  onOpenCatalog,
  onSelectSession,
  onClearHistory,
  isEnglish = false,
}: Props) {
  // Aba padrão inicial é sempre o Histórico
  const [activeTab, setActiveTab] = useState<'history' | 'library'>('history');

  // Histórico de conversas salvas
  const [savedSessions, setSavedSessions] = useState<ChatSessionHistory[]>([
    {
      id: 'sess-1',
      title: isEnglish ? 'Astrological alignment & focus' : 'Alinhamento astrológico e foco do dia',
      date: isEnglish ? 'Today, 09:40' : 'Hoje, 09h40',
      messageCount: 4,
      preview: isEnglish
        ? 'Cross-referencing your Astrological Matrix with transit windows...'
        : 'Cruzando dados da sua Matriz Astrológica com as janelas de trânsito...',
      contextCodes: ['AST-001', 'TMP-001'],
      messages: [
        {
          sender: 'user',
          text: isEnglish
            ? 'How does my planetary transit influence my decisions today?'
            : 'Como meu trânsito planetário influencia minhas decisões hoje?',
          time: '09:40',
        },
        {
          sender: 'orb',
          text: isEnglish
            ? 'Your Ascendant and Moon transit indicate a strong window for strategic execution until 15:00.'
            : 'Seu Ascendente e o trânsito lunar indicam uma janela favorável para execuções estratégicas até às 15h.',
          time: '09:41',
        },
      ],
    },
    {
      id: 'sess-2',
      title: isEnglish ? 'Kabbalistic Tree reflection' : 'Reflexão sobre Árvore da Vida Cabalística',
      date: isEnglish ? 'Yesterday, 18:15' : 'Ontem, 18h15',
      messageCount: 3,
      preview: isEnglish
        ? 'In your Kabbalistic Tree analysis: Chesed balance and focus...'
        : 'Analisando sua Árvore da Vida Cabalística: equilíbrio em Chesed e foco...',
      contextCodes: ['CAB-001'],
      messages: [
        {
          sender: 'user',
          text: isEnglish
            ? 'How to harmonize expansion and discipline in my workflow?'
            : 'Como harmonizar expansão e disciplina no meu fluxo de trabalho?',
          time: '18:15',
        },
        {
          sender: 'orb',
          text: isEnglish
            ? 'The pillar of balance requires channeling Chesed expansion through disciplined Gevurah boundaries.'
            : 'O pilar do equilíbrio exige canalizar a expansão de Chesed através dos limites disciplinados de Gevurah.',
          time: '18:16',
        },
      ],
    },
  ]);

  // Agrupamento de itens do catálogo por categoria
  const categorizedCatalog = [
    {
      title: isEnglish ? 'Astrology & Charts' : 'Astrologia & Mapas',
      items: ALL_CATALOG_ITEMS.filter((item) => item.code.startsWith('AST')),
    },
    {
      title: isEnglish ? 'Kabbalah & Tree of Life' : 'Cabala & Árvore da Vida',
      items: ALL_CATALOG_ITEMS.filter((item) => item.code.startsWith('CAB')),
    },
    {
      title: isEnglish ? 'Numerology & Cycles' : 'Numerologia & Ciclos',
      items: ALL_CATALOG_ITEMS.filter((item) => item.code.startsWith('NUM')),
    },
    {
      title: isEnglish ? 'Master Key & Transits' : 'Chave Mestra & Trânsitos',
      items: ALL_CATALOG_ITEMS.filter(
        (item) => item.code.startsWith('CHV') || item.code.startsWith('TMP')
      ),
    },
    {
      title: isEnglish ? 'Tools & Solutions' : 'Ferramentas & Soluções',
      items: ALL_CATALOG_ITEMS.filter((item) => item.code.startsWith('FER')),
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md h-full bg-[var(--surface)] border-r border-[var(--border)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo do Painel Lateral: Apenas os ícones de navegação e botão de fechar (SEM TÍTULO) */}
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          {/* Navegação por Ícones: Histórico e Biblioteca (Caixa de Arquivos) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              title={isEnglish ? 'History' : 'Histórico de Conversas'}
              aria-label={isEnglish ? 'History' : 'Histórico'}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[var(--foreground)] text-[var(--background)] shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <History size={18} />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('library')}
              title={isEnglish ? 'Library & Artifacts' : 'Biblioteca de Arquivos & Catálogo'}
              aria-label={isEnglish ? 'Library' : 'Biblioteca'}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-[var(--foreground)] text-[var(--background)] shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <Archive size={18} />
            </button>
          </div>

          {/* Botão de Fechar Painel Lateral */}
          <button
            type="button"
            onClick={onClose}
            aria-label={isEnglish ? 'Close panel' : 'Fechar painel'}
            title={isEnglish ? 'Close panel' : 'Fechar painel'}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ========================================================================= */}
          {/* ABA 1: HISTÓRICO DE CONVERSAS (PADRÃO)                                    */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] font-semibold">
                  {isEnglish ? 'Saved sessions' : 'Conversas anteriores'}
                </span>
                {savedSessions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSavedSessions([]);
                      onClearHistory();
                    }}
                    className="text-[10px] font-mono text-[var(--text-tertiary)] hover:text-red-500 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>{isEnglish ? 'Clear all' : 'Limpar tudo'}</span>
                  </button>
                )}
              </div>

              {savedSessions.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-tertiary)] font-mono text-xs">
                  {isEnglish ? 'No saved conversations.' : 'Nenhuma conversa salva.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {savedSessions.map((sess) => (
                    <div
                      key={sess.id}
                      onClick={() => {
                        onSelectSession(sess);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                        <span>{sess.date}</span>
                        <span>{sess.messageCount} msgs</span>
                      </div>
                      <h4 className="text-xs font-semibold text-[var(--foreground)] mt-1 group-hover:text-[var(--accent)] transition-colors">
                        {sess.title}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5 font-sans">
                        {sess.preview}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: BIBLIOTECA (ORGANIZADA POR LISTAS DE ITENS DISPONÍVEIS)             */}
          {/* ========================================================================= */}
          {activeTab === 'library' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
                <span className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] font-semibold">
                  {isEnglish ? 'Catalog & Matrix Items' : 'Catálogo & Matrizes'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCatalog();
                  }}
                  className="text-[11px] font-mono text-[var(--accent)] hover:underline cursor-pointer"
                >
                  {isEnglish ? 'Store →' : 'Abrir Loja →'}
                </button>
              </div>

              {categorizedCatalog.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    {cat.title}
                  </span>

                  <div className="space-y-1.5">
                    {cat.items.map((item) => {
                      const isUnlocked = isItemUnlocked(item.code);
                      const isSelected = activeContextCodes.includes(item.code);

                      return (
                        <div
                          key={item.code}
                          onClick={() => onToggleContextCode(item.code)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                            isSelected
                              ? 'border-[var(--accent)] bg-[var(--surface-2)] shadow-2xs'
                              : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/50'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9.5px] font-mono font-bold text-[var(--accent)]">
                                {item.code}
                              </span>
                              {isUnlocked ? (
                                <span className="text-[8px] font-mono font-bold uppercase text-[var(--success)] bg-[var(--success)]/10 px-1 py-0.2 rounded">
                                  {isEnglish ? 'Unlocked' : 'Liberado'}
                                </span>
                              ) : (
                                <span className="text-[8px] font-mono text-[var(--text-tertiary)]">
                                  ◎ {item.credits}
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-semibold text-[var(--foreground)] truncate mt-0.5">
                              {item.name}
                            </h4>
                          </div>

                          <div className="shrink-0">
                            <div
                              className={`h-4 w-4 rounded border flex items-center justify-center text-[10px] ${
                                isSelected
                                  ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-foreground)]'
                                  : 'border-[var(--border)]'
                              }`}
                            >
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
