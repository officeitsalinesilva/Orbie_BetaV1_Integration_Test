import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, MicOff, Bot } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (text: string) => void;
  isEnglish?: boolean;
};

type VoiceMode = 'idle' | 'user_recording' | 'orbie_speaking';

export function SpeechToSpeechModal({ isOpen, onClose, onSendMessage, isEnglish }: Props) {
  // Start in 'idle' state: microphone requires user activation to start recording
  const [mode, setMode] = useState<VoiceMode>('idle');
  const [topAudioBars, setTopAudioBars] = useState<number[]>(Array(17).fill(5));
  const [bottomAudioBars, setBottomAudioBars] = useState<number[]>(Array(8).fill(4));
  const orbieTimerRef = useRef<number | null>(null);

  // Initialize or reset when opened
  useEffect(() => {
    if (!isOpen) {
      setMode('idle');
      if (orbieTimerRef.current) window.clearTimeout(orbieTimerRef.current);
      return;
    }
    setMode('idle');
  }, [isOpen]);

  // Audio frequency simulation for top (Orbie response) and bottom (User mic recording)
  useEffect(() => {
    if (!isOpen) return;

    const interval = window.setInterval(() => {
      if (mode === 'idle') {
        // Both top and bottom soundbars are completely calm / idle
        setBottomAudioBars(Array(8).fill(4));
        setTopAudioBars(Array(17).fill(5));
      } else if (mode === 'user_recording') {
        // Bottom soundbars are active (user speaking into mic)
        setBottomAudioBars(
          Array.from({ length: 8 }, () => Math.floor(Math.random() * 22) + 6)
        );
        // Top central soundbars rest calmly
        setTopAudioBars(
          Array.from({ length: 17 }, () => Math.floor(Math.random() * 5) + 4)
        );
      } else if (mode === 'orbie_speaking') {
        // Orbie is speaking: Top central soundbars dance dynamically (no gold/amber)
        setTopAudioBars([
          Math.floor(Math.random() * 16) + 8,
          Math.floor(Math.random() * 26) + 12,
          Math.floor(Math.random() * 40) + 18,
          Math.floor(Math.random() * 54) + 22,
          Math.floor(Math.random() * 68) + 28,
          Math.floor(Math.random() * 82) + 32,
          Math.floor(Math.random() * 92) + 38,
          Math.floor(Math.random() * 98) + 42,
          Math.floor(Math.random() * 102) + 46,
          Math.floor(Math.random() * 98) + 42,
          Math.floor(Math.random() * 92) + 38,
          Math.floor(Math.random() * 82) + 32,
          Math.floor(Math.random() * 68) + 28,
          Math.floor(Math.random() * 54) + 22,
          Math.floor(Math.random() * 40) + 18,
          Math.floor(Math.random() * 26) + 12,
          Math.floor(Math.random() * 16) + 8,
        ]);
        // Bottom mic is muted
        setBottomAudioBars(Array(8).fill(3));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, mode]);

  // Handle click on bottom microphone control
  const handleMicClick = () => {
    if (mode === 'idle') {
      // 1. First click: ACTIVATE microphone recording mode
      setMode('user_recording');
    } else if (mode === 'user_recording') {
      // 2. Second click: Finish user speech, mute mic, and trigger Orbie response
      setMode('orbie_speaking');

      if (orbieTimerRef.current) window.clearTimeout(orbieTimerRef.current);
      orbieTimerRef.current = window.setTimeout(() => {
        // Return to active user recording mode ready for next exchange
        setMode('user_recording');
      }, 4800);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center justify-between w-full max-w-sm h-[480px] rounded-3xl border border-[var(--border)] bg-[var(--background)] shadow-2xl p-6 overflow-hidden">
        {/* Ambient glow in background (strictly monochromatic / accent theme glow) */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            mode === 'orbie_speaking'
              ? 'bg-[var(--accent)]/30 scale-125 opacity-100'
              : 'bg-[var(--accent)]/10 scale-90 opacity-30'
          }`}
        />

        {/* Top Header - Orbie Bot Badge & Close Button */}
        <div className="w-full flex items-center justify-between z-10 pb-2 border-b border-[var(--border)]/50">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xs">
              <Bot size={15} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[var(--background)]" />
            </div>
            <span className="text-sm font-bold text-[var(--foreground)] tracking-tight">Orbie</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Center: Radiant Orbital Wave Rings with Central Soundbars Visualizer */}
        <div className="relative flex flex-col items-center justify-center my-auto z-10 w-full">
          <div className="relative flex items-center justify-center w-64 h-64">
            {/* Concentric pulsating wave rings (Active during Orbie response) */}
            <motion.div
              animate={{
                scale: mode === 'orbie_speaking' ? [1, 1.28, 1] : [1, 1.04, 1],
                opacity: mode === 'orbie_speaking' ? [0.35, 0.75, 0.35] : [0.1, 0.18, 0.1],
              }}
              transition={{
                repeat: Infinity,
                duration: mode === 'orbie_speaking' ? 1.8 : 3.5,
                ease: 'easeInOut',
              }}
              className="absolute w-52 h-52 rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/5"
            />

            <motion.div
              animate={{
                scale: mode === 'orbie_speaking' ? [1, 1.48, 1] : [1, 1.08, 1],
                opacity: mode === 'orbie_speaking' ? [0.18, 0.45, 0.18] : [0.05, 0.1, 0.05],
              }}
              transition={{
                repeat: Infinity,
                duration: mode === 'orbie_speaking' ? 2.4 : 4.5,
                ease: 'easeInOut',
                delay: 0.2,
              }}
              className="absolute w-64 h-64 rounded-full border border-[var(--accent)]/30"
            />

            {/* Central Soundbars (Clean accent theme coloration, no gold) */}
            <div className="relative flex items-center justify-center gap-1.5 h-32 px-4 z-20">
              {topAudioBars.map((height, idx) => (
                <motion.span
                  key={idx}
                  animate={{
                    height: `${height}px`,
                    opacity: mode === 'orbie_speaking' ? 1 : 0.35,
                  }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                  className={`w-1.5 rounded-full transition-colors ${
                    mode === 'orbie_speaking'
                      ? 'bg-[var(--accent)] shadow-xs shadow-[var(--accent)]'
                      : 'bg-[var(--text-tertiary)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Control Area - Single Unified Interactive Voice Button */}
        <div className="w-full flex items-center justify-center z-10 pb-2">
          {mode === 'idle' ? (
            /* Mode 0: Inativo inicial ao abrir - Requer clique para ativar conversa */
            <button
              type="button"
              onClick={handleMicClick}
              title={isEnglish ? 'Click to activate microphone' : 'Clique para ativar microfone'}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)]">
                <Mic size={16} />
              </div>

              {/* Inactive Neutral Soundbars */}
              <div className="flex items-center gap-1 h-6 px-1 opacity-40">
                {bottomAudioBars.map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1 rounded-full bg-[var(--text-tertiary)]"
                  />
                ))}
              </div>
            </button>
          ) : mode === 'user_recording' ? (
            /* Mode 1: Liberado para falar - Microfone pulsante + Soundbars ao vivo + Clique para Enviar/Mutar */
            <button
              type="button"
              onClick={handleMicClick}
              title={isEnglish ? 'Click to finish speaking & get response' : 'Clique para concluir e receber resposta'}
              className="group relative flex items-center gap-3 px-5 py-3 rounded-full bg-[var(--surface-2)] hover:bg-[var(--accent)] hover:text-white border border-[var(--accent)]/50 shadow-lg shadow-[var(--accent)]/15 transition-all duration-200 cursor-pointer active:scale-95"
            >
              {/* Pulsing Recording Mic Icon */}
              <div className="relative flex items-center justify-center">
                <span className="absolute -inset-1 rounded-full bg-[var(--accent)]/30 animate-ping opacity-75" />
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xs">
                  <Mic size={16} />
                </div>
              </div>

              {/* Dynamic Live Soundbars during User Recording */}
              <div className="flex items-center gap-1 h-6 px-1">
                {bottomAudioBars.map((h, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: `${h}px` }}
                    transition={{ duration: 0.08, ease: 'easeOut' }}
                    className="w-1 rounded-full bg-[var(--accent)] group-hover:bg-white transition-colors"
                  />
                ))}
              </div>
            </button>
          ) : (
            /* Mode 2: Orbie Respondendo - Mutado / Desabilitado */
            <div
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--surface-2)]/60 border border-[var(--border)] text-[var(--text-tertiary)] opacity-60 cursor-not-allowed select-none"
            >
              <MicOff size={16} className="text-rose-400" />
              <div className="flex items-center gap-1 h-4">
                <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)] animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)] animate-pulse [animation-delay:0.2s]" />
                <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)] animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
