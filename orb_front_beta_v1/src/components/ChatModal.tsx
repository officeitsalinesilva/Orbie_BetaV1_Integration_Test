import React, { useState } from 'react';
import { X, Send, Bot, Mic } from 'lucide-react';
import { useOrb } from '../context/OrbContext';
import { SpeechToSpeechModal } from './journal/SpeechToSpeechModal';

type Props = {
  initialPrompt?: string;
  onClose: () => void;
  isEnglish: boolean;
};

type Message = {
  id: string;
  sender: 'user' | 'orb';
  text: string;
  time: string;
};

export function ChatModal({ initialPrompt, onClose, isEnglish }: Props) {
  const { profile, userIdentity } = useOrb();
  const userName = profile?.preferredName || profile?.fullName?.split(' ')[0] || userIdentity?.name?.split(' ')[0] || (isEnglish ? 'User' : 'Usuário');

  const [input, setInput] = useState('');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'orb',
      text: isEnglish
        ? `Hello ${userName}. I am here to guide your consciousness today. What would you like to explore regarding your day, energy windows, or personal focus?`
        : `Olá, ${userName}. Estou aqui para acompanhar sua consciência hoje. O que você gostaria de explorar sobre seu dia, janelas de energia ou alinhamento pessoal?`,
      time: '08:00',
    },
    ...(initialPrompt
      ? [
          {
            id: '2',
            sender: 'user' as const,
            text: initialPrompt,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: '3',
            sender: 'orb' as const,
            text: isEnglish
              ? `Reflecting on "${initialPrompt}": Your energy chart shows high mental clarity between 09:30 and 12:30. Take advantage of this window for strategic decisions while keeping emotional neutrality.`
              : `Refletindo sobre "${initialPrompt}": Sua matriz de energia indica alta clareza mental e vigor produtivo entre 09:30 e 12:30. Aproveite esta janela para decisões estratégicas, mantendo a neutralidade em momentos de fricção.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]
      : []),
  ]);

  const [typing, setTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      let reply = isEnglish
        ? `Regarding your reflection on "${text}", your elemental resonance (Air & Fire) supports concise articulation. Direct your attention toward prioritized outcomes.`
        : `Analisando seu padrão de hoje para "${text}": Seus elementos dominantes (Ar e Fogo) favorecem síntese e iniciativa. Foque nas ações de maior impacto nas próximas horas.`;

      if (text.toLowerCase().includes('trabalho') || text.toLowerCase().includes('career')) {
        reply = isEnglish
          ? `In your professional field today, maintain active focus during the 09:30-12:30 window. Delegate routine items and preserve analytical clarity.`
          : `No âmbito profissional hoje, mantenha foco ativo durante a janela de ouro das 09:30 às 12:30. Delegue rotinas e proteja sua clareza analítica.`;
      } else if (text.toLowerCase().includes('vínculo') || text.toLowerCase().includes('pessoas') || text.toLowerCase().includes('people')) {
        reply = isEnglish
          ? `Interpersonally, your neutral calibration helps you listen without reacting. Keep empathetic discernment.`
          : `Nas relações hoje, sua calibração de neutralidade permite escutar sem reagir por impulso. Mantenha discernimento e presença consciente.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `o-${Date.now()}`,
          sender: 'orb',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTyping(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in">
      <div className="flex h-full max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden">
        {/* Clean Header: Only Orbie */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5 bg-[var(--surface)]/50">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xs">
              <Bot size={16} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
            </div>
            <span className="text-sm font-bold text-[var(--foreground)] tracking-tight">Orbie</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[var(--accent)] text-white rounded-br-xs'
                    : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="mt-1 text-[9px] font-mono text-[var(--text-tertiary)] px-1">
                {m.time}
              </span>
            </div>
          ))}

          {typing && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] py-2">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.2s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Input Footer with Microphone Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t border-[var(--border)] p-3 bg-[var(--surface)]/30 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isEnglish ? 'Message Orbie...' : 'Envie uma mensagem para Orbie...'}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
          />

          {/* Speech to Speech Mic button */}
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            title={isEnglish ? 'Speech to speech (Voice mode)' : 'Conversar por voz (Speech to speech)'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer shrink-0"
          >
            <Mic size={16} />
          </button>

          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-white transition-opacity hover:opacity-90 disabled:opacity-40 shrink-0 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* Speech-to-Speech Conversational AI Modal */}
      <SpeechToSpeechModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSendMessage={(voiceText) => {
          handleSend(voiceText);
        }}
        isEnglish={isEnglish}
      />
    </div>
  );
}
