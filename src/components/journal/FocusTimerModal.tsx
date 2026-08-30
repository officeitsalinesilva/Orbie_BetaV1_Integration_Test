import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Check, Target } from 'lucide-react';
import { useOrb } from '../../context/OrbContext';

type Props = {
  isEnglish: boolean;
  initialPreset?: string;
  onClose: () => void;
};

export function FocusTimerModal({ isEnglish, initialPreset, onClose }: Props) {
  const { addJournalEntry } = useOrb();
  const [selectedDuration, setSelectedDuration] = useState<number>(25 * 60);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setSessionCompleted(true);
      stopAudio();
      void addJournalEntry(
        isEnglish
          ? `Completed ${Math.round(selectedDuration / 60)} min deep focus session.`
          : `Sessão de foco de ${Math.round(selectedDuration / 60)} min concluída.`,
        isEnglish ? 'Focus session' : 'Bloco de foco'
      );
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startAudio = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        void audioCtxRef.current.resume();
      }
      if (!oscRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.03, audioCtxRef.current.currentTime);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;
      }
      setSoundEnabled(true);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  const stopAudio = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setSoundEnabled(false);
    } catch (e) {
      console.warn('Stop audio error:', e);
    }
  };

  const toggleSound = () => {
    if (soundEnabled) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const setPresetDuration = (mins: number) => {
    setIsRunning(false);
    setSelectedDuration(mins * 60);
    setTimeLeft(mins * 60);
    setSessionCompleted(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration);
    setSessionCompleted(false);
    stopAudio();
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((selectedDuration - timeLeft) / selectedDuration) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-secondary)]">
              {isEnglish ? 'FOCUS SESSION' : 'SESSÃO DE FOCO'}
            </span>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              {initialPreset || (isEnglish ? 'Deep Focus' : 'Foco Profundo')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preset selections */}
        <div className="mt-5 flex justify-center gap-1.5">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setPresetDuration(mins)}
              className={`rounded-md px-3 py-1 font-mono text-xs transition-colors ${
                selectedDuration === mins * 60
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Minimal Time Display */}
        <div className="my-8 text-center">
          <span className="font-mono text-5xl font-light tracking-tight text-[var(--foreground)]">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <div className="mt-3 mx-auto h-1 w-36 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={resetTimer}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors"
            title={isEnglish ? 'Reset' : 'Reiniciar'}
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isRunning && soundEnabled) {
                startAudio();
              }
              setIsRunning(!isRunning);
            }}
            className="flex h-10 px-5 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] text-xs font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 active:scale-98"
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{isRunning ? (isEnglish ? 'Pause' : 'Pausar') : (isEnglish ? 'Start' : 'Iniciar')}</span>
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              soundEnabled
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'
            }`}
            title={soundEnabled ? 'Mute 528Hz' : '528Hz Tone'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>

        {soundEnabled && (
          <p className="mt-4 text-center text-[10px] font-mono text-[var(--text-secondary)]">
            528Hz active
          </p>
        )}

        {sessionCompleted && (
          <div className="mt-3 text-center text-xs font-medium text-[var(--success)]">
            {isEnglish ? 'Session logged to journal.' : 'Sessão registrada no journal.'}
          </div>
        )}
      </div>
    </div>
  );
}
