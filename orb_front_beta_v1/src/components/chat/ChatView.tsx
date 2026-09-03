import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Mic,
  Bot,
  Sparkles,
  Layers,
  CheckCircle2,
  BookOpen,
  X,
  Plus,
  ArrowLeft,
  MoreVertical,
  Sliders,
  Paperclip,
  PanelLeft,
  PanelLeftClose,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { OrbBrand } from '../OrbBrand';
import { GoogleProfileAvatar } from '../common/GoogleProfileAvatar';
import { SystemSlideDrawer } from '../common/SystemSlideDrawer';
import { SpeechToSpeechModal } from '../journal/SpeechToSpeechModal';
import { ChatLibraryDrawer, ChatSessionHistory } from './ChatLibraryDrawer';
import { useOrb } from '../../context/OrbContext';
import { ALL_CATALOG_ITEMS, CatalogItem } from '../../data/catalogData';

type Props = {
  onBack?: () => void;
  onOpenProfile: () => void;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenDailyJournal: () => void;
  onOpenNeuroacustica: () => void;
  onOpenCatalog: () => void;
  onSignOut: () => void;
  isEnglish?: boolean;
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'orb';
  text: string;
  time: string;
  contextCodes?: string[];
}

export function ChatView({
  onBack,
  onOpenProfile,
  onOpenWallet,
  onOpenNotifications,
  onOpenDailyJournal,
  onOpenNeuroacustica,
  onOpenCatalog,
  onSignOut,
  isEnglish = false,
}: Props) {
  const { profile, userIdentity, credits, spendCredits, unlockedItems, isItemUnlocked } = useOrb();

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [libraryDrawerOpen, setLibraryDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active contexts - starts clean with NOTHING pre-selected
  const [activeContextCodes, setActiveContextCodes] = useState<string[]>([]);

  // Initial chat messages - starts clean with NO fake messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const userName = profile?.preferredName || profile?.fullName?.split(' ')[0] || userIdentity?.name?.split(' ')[0] || (isEnglish ? 'User' : 'Usuário');

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Toggle a context code on/off
  const toggleContextCode = (code: string) => {
    setActiveContextCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  // Select a session from history
  const handleSelectSession = (session: ChatSessionHistory) => {
    if (session.messages && session.messages.length > 0) {
      setMessages(
        session.messages.map((m, idx) => ({
          id: `${session.id}-${idx}`,
          sender: m.sender,
          text: m.text,
          time: m.time,
          contextCodes: m.sender === 'orb' ? session.contextCodes : undefined,
        }))
      );
    } else {
      setMessages([
        {
          id: `${session.id}-1`,
          sender: 'user',
          text: session.title,
          time: session.date,
        },
        {
          id: `${session.id}-2`,
          sender: 'orb',
          text: session.preview,
          time: session.date,
          contextCodes: session.contextCodes,
        },
      ]);
    }

    if (session.contextCodes) {
      setActiveContextCodes(session.contextCodes);
    }
  };

  // Clear conversation history
  const handleClearHistory = () => {
    setMessages([]);
    setActiveContextCodes([]);
  };

  // Send message
  const handleSendMessage = (customText?: string, customContexts?: string[]) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isTyping) return;

    // Check credit balance (1 credit per interaction)
    const cost = 1;
    if (credits < cost) {
      setToastMessage(
        isEnglish
          ? 'Insufficient credits. Please recharge your wallet.'
          : 'Saldo insuficiente. Recarregue seus créditos para continuar.'
      );
      setTimeout(() => setToastMessage(null), 3000);
      onOpenWallet();
      return;
    }

    // Deduct 1 credit
    spendCredits(cost);

    const contextsForMessage = customContexts || activeContextCodes;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate Orbie consciousness response
    setTimeout(() => {
      let reply = '';

      if (contextsForMessage.length > 0) {
        const itemNames = contextsForMessage
          .map((c) => {
            const item = ALL_CATALOG_ITEMS.find((it) => it.code === c);
            return item ? `${item.name} (${c})` : c;
          })
          .join(', ');

        reply = isEnglish
          ? `Integrating your matrix references: [${itemNames}]. Your energetic resonance indicates a clear alignment pathway for this inquiry. Focus on centering your attention on deliberate action.`
          : `Integrando as referências da sua matriz: [${itemNames}]. Os parâmetros apontam um momento favorável de convergência. Mantenha o foco alinhado à sua intenção central.`;
      } else {
        reply = isEnglish
          ? `Harmonizing with your personal profile. Based on your current cycle, clarity emerges when you prioritize essential actions without external dispersion.`
          : `Sintonizando com seu perfil de alinhamento. Considerando o seu momento, a clareza se estabelece ao priorizar ações essenciais sem dispersão.`;
      }

      const orbMsg: ChatMessage = {
        id: `orb-${Date.now()}`,
        sender: 'orb',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contextCodes: contextsForMessage.length > 0 ? contextsForMessage : undefined,
      };

      setMessages((prev) => [...prev, orbMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)]/20">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR PADRÃO (Sem título na navbar)                                */}
      {/* - Extrema esquerda: Orb Brand                                             */}
      {/* - Centro: Ícone Bot limpo sem background                                  */}
      {/* - Extrema direita: Foto do Usuário (Abre Menu Slide)                      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-lg px-6 py-3 shrink-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between relative">
          {/* Extrema Esquerda: Orb Brand Compacto */}
          <div className="flex items-center">
            <OrbBrand compact />
          </div>

          {/* Eixo Central da Navbar: Ícone da Tela de Chat (sem background) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none text-[var(--foreground)]">
            <Bot size={20} strokeWidth={1.75} />
          </div>

          {/* Extrema Direita: Foto do Usuário (Abre Menu Slide) */}
          <div className="flex items-center gap-2">
            <GoogleProfileAvatar
              profile={profile}
              name={userName}
              onClick={() => setMenuOpen(true)}
              title={isEnglish ? 'Open system menu' : 'Abrir menu lateral'}
            />
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SUB-HEADER: Seta de retorno e Saldo (SEM BACKGROUND / SEM CONTORNO)     */}
      {/* ========================================================================= */}
      <div className="w-full px-6 py-2 shrink-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          {/* Seta de retorno limpa (sem background nem contorno) */}
          <div>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label={isEnglish ? 'Go back' : 'Voltar'}
                title={isEnglish ? 'Go back' : 'Voltar'}
                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors p-1 -ml-1 cursor-pointer active:scale-95 flex items-center shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
            )}
          </div>

          {/* Saldo de créditos limpo na extrema direita (sem background nem contorno) */}
          <button
            type="button"
            onClick={onOpenWallet}
            title={isEnglish ? 'Your credits · Click to add' : 'Seus créditos · Clique para recarregar'}
            className="flex items-center gap-1 text-xs font-mono font-bold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors cursor-pointer select-none"
          >
            <span>◎ {credits}</span>
            <span className="text-[var(--accent)] font-extrabold text-sm leading-none ml-0.5">+</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ÁREA PRINCIPAL DO CHAT COM ÍCONE DO PAINEL LATERAL NA EXTREMA ESQUERDA  */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col mx-auto w-full max-w-4xl px-3 sm:px-6 pb-4 overflow-hidden relative">
        {/* Ícone de Abrir / Fechar Painel Lateral e Ações do Topo da Conversa */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLibraryDrawerOpen(!libraryDrawerOpen)}
              title={
                libraryDrawerOpen
                  ? isEnglish ? 'Close history and library panel' : 'Fechar painel de histórico e biblioteca'
                  : isEnglish ? 'Open history and library panel' : 'Abrir painel de histórico e biblioteca'
              }
              aria-label={isEnglish ? 'Toggle side panel' : 'Alternar painel lateral'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono ${
                libraryDrawerOpen
                  ? 'text-[var(--accent)] bg-[var(--surface-2)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]/60'
              }`}
            >
              {libraryDrawerOpen ? (
                <PanelLeftClose size={19} />
              ) : (
                <PanelLeft size={19} />
              )}
            </button>

            {/* Se houver conversa ativa, ícone de lixeira no topo com confirmação */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                title={isEnglish ? 'Delete active conversation' : 'Excluir conversa ativa'}
                aria-label={isEnglish ? 'Delete active conversation' : 'Excluir conversa ativa'}
                className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>

          {/* Se houver artefatos selecionados via biblioteca, mostra indicador sutil */}
          {activeContextCodes.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-secondary)]">
              <span className="text-[var(--accent)] font-bold">{activeContextCodes.length}</span>
              <span>{isEnglish ? 'matrix item(s) attached' : 'item(ns) anexado(s)'}</span>
              <button
                type="button"
                onClick={() => setActiveContextCodes([])}
                className="ml-1 text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                title={isEnglish ? 'Detach all' : 'Desanexar todos'}
              >
                <X size={11} />
              </button>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* CORPO DO CHAT: MODO INICIAL (VAZIO) OU HISTÓRICO DE MENSAGENS           */}
        {/* ======================================================================= */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6 shadow-inner flex flex-col"
        >
          {messages.length === 0 ? (
            /* Tela Inicial Pura: Ícone do Orbie e Frase de Boas-vindas */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto animate-in fade-in duration-300">
              <div className="relative flex items-center justify-center">
                <OrbBrand />
              </div>

              <div className="max-w-md space-y-1.5">
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                  {isEnglish
                    ? 'Start a new conversation below or access your history and library in the side panel.'
                    : 'Inicie abaixo uma nova conversa ou acesse no painel lateral o seu histórico e biblioteca.'}
                </p>
              </div>
            </div>
          ) : (
            /* Lista de Mensagens Ativas */
            <div className="space-y-4">
              {messages.map((m) => {
                const isUser = m.sender === 'user';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    {/* Cabeçalho do emissor */}
                    <div className="flex items-center gap-1.5 px-1">
                      {!isUser ? (
                        <>
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-white text-[9px] font-bold">
                            <Bot size={10} />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[var(--foreground)]">Orbie</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-[var(--text-secondary)]">{userName}</span>
                      )}
                      <span className="text-[9px] font-mono text-[var(--text-tertiary)]">· {m.time}</span>
                    </div>

                    {/* Balão de Mensagem */}
                    <div
                      className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-[var(--accent)] text-[var(--accent-foreground)] rounded-tr-xs font-medium'
                          : 'border border-[var(--border)] bg-[var(--surface-2)]/60 text-[var(--foreground)] rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>

                      {/* Contextos aplicados na resposta do Orbie */}
                      {!isUser && m.contextCodes && m.contextCodes.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[var(--border)]/60 flex flex-wrap items-center gap-1 text-[9.5px] font-mono text-[var(--text-secondary)]">
                          <span className="text-[var(--text-tertiary)]">
                            {isEnglish ? 'Referenced:' : 'Baseado em:'}
                          </span>
                          {m.contextCodes.map((code) => (
                            <span
                              key={code}
                              className="px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] font-bold text-[9px]"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Indicador de Digitação do Orbie */}
              {isTyping && (
                <div className="flex flex-col items-start space-y-1 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 px-1">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-white text-[9px]">
                      <Bot size={10} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[var(--foreground)]">Orbie</span>
                  </div>

                  <div className="rounded-2xl rounded-tl-xs border border-[var(--border)] bg-[var(--surface-2)]/60 p-3.5 shadow-2xs flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce" />
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'Synthesizing...' : 'Sintetizando...'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* 4. DOCK DE ENTRADA DE TEXTO (Badge de Crédito no Envio)                  */}
        {/* ======================================================================= */}
        <div className="mt-3 relative">
          {/* Menu Dropdown de Opções (Acionado pelos 3 pontos) */}
          {isOptionsOpen && (
            <div className="absolute bottom-14 left-2 z-40 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-[var(--text-tertiary)] border-b border-[var(--border)] mb-1">
                {isEnglish ? 'Options' : 'Opções'}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOptionsOpen(false);
                  setIsVoiceOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--surface-2)] rounded-xl transition-colors text-left cursor-pointer"
              >
                <Mic size={15} className="text-[var(--accent)]" />
                <div className="flex-1">
                  <span className="font-semibold block">{isEnglish ? 'Voice (Speech to Speech)' : 'Conversa por Voz'}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] block">{isEnglish ? 'Real-time speech' : 'Áudio em tempo real'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOptionsOpen(false);
                  setLibraryDrawerOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--surface-2)] rounded-xl transition-colors text-left cursor-pointer"
              >
                <Layers size={15} className="text-[var(--accent)]" />
                <div className="flex-1">
                  <span className="font-semibold block">{isEnglish ? 'Attach Matrix' : 'Anexar Matriz'}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] block">{isEnglish ? 'Open library list' : 'Abrir lista da biblioteca'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOptionsOpen(false);
                  setToastMessage(isEnglish ? 'Clipping attached' : 'Anexo pronto');
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--surface-2)] rounded-xl transition-colors text-left cursor-pointer"
              >
                <Paperclip size={15} className="text-[var(--text-secondary)]" />
                <div className="flex-1">
                  <span className="font-semibold block">{isEnglish ? 'Attach Note/Clip' : 'Anexar Nota/Clipping'}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] block">{isEnglish ? 'Upload file' : 'Importar clipping'}</span>
                </div>
              </button>
            </div>
          )}

          {/* Barra de Entrada (Input, Botão Três Pontos e Botão Enviar com Custo ◎ 1) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 sm:p-2 shadow-sm focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all"
          >
            {/* Botão de Três Pontos */}
            <button
              type="button"
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              title={isEnglish ? 'Options (Voice, Clips, Matrix)' : 'Opções (Voz, Clipes, Matriz)'}
              aria-label={isEnglish ? 'Options' : 'Opções'}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 ${
                isOptionsOpen
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                  : 'bg-[var(--surface-2)] text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--surface)] border border-[var(--border)]'
              }`}
            >
              <MoreVertical size={18} />
            </button>

            {/* Campo de Texto */}
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isEnglish
                  ? `Message Orbie...`
                  : `Digite sua mensagem para o Orbie...`
              }
              className="flex-1 bg-transparent px-2.5 py-2 text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--text-tertiary)] outline-none"
            />

            {/* Botão de Envio com Badge de Crédito Embutido (Simbolizando envio e custo) */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              title={isEnglish ? 'Send message (Cost: ◎ 1)' : 'Enviar mensagem (Custo: ◎ 1)'}
              aria-label={isEnglish ? 'Send message' : 'Enviar mensagem'}
              className="flex items-center gap-1.5 px-3.5 h-10 shrink-0 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-mono text-xs font-bold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            >
              <span>◎ 1</span>
              <Send size={13} strokeWidth={2.5} className="shrink-0" />
            </button>
          </form>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. GAVETA LATERAL ESQUERDA (HISTÓRICO, BIBLIOTECA & AJUSTES)               */}
      {/* ========================================================================= */}
      <ChatLibraryDrawer
        isOpen={libraryDrawerOpen}
        onClose={() => setLibraryDrawerOpen(false)}
        activeContextCodes={activeContextCodes}
        onToggleContextCode={toggleContextCode}
        unlockedItems={unlockedItems}
        isItemUnlocked={isItemUnlocked}
        onOpenCatalog={onOpenCatalog}
        onSelectSession={handleSelectSession}
        onClearHistory={handleClearHistory}
        isEnglish={isEnglish}
      />

      {/* ========================================================================= */}
      {/* 6. MODAL DE SPEECH-TO-SPEECH (Voz em tempo real)                          */}
      {/* ========================================================================= */}
      <SpeechToSpeechModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSendMessage={(voiceText) => {
          handleSendMessage(voiceText);
        }}
        isEnglish={isEnglish}
      />

      {/* ========================================================================= */}
      {/* 7. MODAL DE CONFIRMAÇÃO PARA EXCLUSÃO DE CONVERSA                         */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-500">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  {isEnglish ? 'Delete Conversation?' : 'Excluir esta conversa?'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                  {isEnglish
                    ? 'All messages in this active session will be cleared.'
                    : 'Todas as mensagens desta sessão ativa serão removidas.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                {isEnglish ? 'Cancel' : 'Cancelar'}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleClearHistory();
                  setIsDeleteModalOpen(false);
                  setToastMessage(isEnglish ? 'Conversation cleared' : 'Conversa excluída com sucesso');
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                {isEnglish ? 'Delete' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TOAST FEEDBACK                                                         */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-medium text-[var(--foreground)] shadow-lg backdrop-blur-md">
          <CheckCircle2 size={15} className="text-[var(--success)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. SYSTEM SLIDE DRAWER                                                    */}
      {/* ========================================================================= */}
      <SystemSlideDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProfile={onOpenProfile}
        onOpenWallet={onOpenWallet}
        onOpenNotifications={onOpenNotifications}
        onOpenDailyJournal={onOpenDailyJournal}
        onOpenNeuroacustica={onOpenNeuroacustica}
        onOpenCatalog={onOpenCatalog}
        onOpenChat={() => setMenuOpen(false)}
        activeScreen="chat"
        onSignOut={onSignOut}
        isEnglish={isEnglish}
      />
    </div>
  );
}
