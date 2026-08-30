import React, { useState, useEffect, useRef } from 'react';
import {
  useNeuroAudio,
  QueuedTrack,
  WaveShape,
  NoiseType,
  BinauralTargetState,
} from '../../context/NeuroAudioContext';
import { audioEngine } from '../../lib/audioEngine';
import { WaveIcon } from './WaveIcon';
import {
  X,
  Radio,
  Activity,
  Volume2,
  VolumeX,
  Layers,
  Clock,
  Trash2,
  Play,
  Check,
  Headphones,
  ListPlus,
  ChevronUp,
  ChevronDown,
  Edit3,
  Bookmark,
  Plus,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Props = {
  isEnglish?: boolean;
};

const NOISE_LIST: Array<{ id: NoiseType; namePt: string; nameEn: string; desc: string }> = [
  { id: 'white', namePt: 'Ruído Branco', nameEn: 'White Noise', desc: 'Isolamento acústico completo' },
  { id: 'pink', namePt: 'Ruído Rosa', nameEn: 'Pink Noise', desc: 'Foco contínuo e concentração' },
  { id: 'brown', namePt: 'Ruído Marrom', nameEn: 'Ruído Marrom', desc: 'Graves densos e relaxamento' },
  { id: 'blue', namePt: 'Ruído Azul', nameEn: 'Blue Noise', desc: 'Alta energia e alerta' },
  { id: 'violet', namePt: 'Ruído Violeta', nameEn: 'Violet Noise', desc: 'Estimulação fina' },
  { id: 'grey', namePt: 'Ruído Cinza', nameEn: 'Grey Noise', desc: 'Curva psicoacústica' },
  { id: 'rain', namePt: 'Chuva Suave', nameEn: 'Gentle Rain', desc: 'Sons de água e calmaria' },
  { id: 'ocean', namePt: 'Ondas do Oceano', nameEn: 'Ocean Waves', desc: 'Modulação de maré' },
];

const BINAURAL_TARGETS: Array<{
  id: BinauralTargetState;
  namePt: string;
  nameEn: string;
  diffHz: number;
  leftHz: number;
  rightHz: number;
}> = [
  { id: 'relaxation', namePt: 'Alpha (10Hz)', nameEn: 'Alpha (10Hz)', diffHz: 10, leftHz: 200, rightHz: 210 },
  { id: 'focus', namePt: 'Beta (15Hz)', nameEn: 'Beta (15Hz)', diffHz: 15, leftHz: 200, rightHz: 215 },
  { id: 'meditation', namePt: 'Theta (6Hz)', nameEn: 'Theta (6Hz)', diffHz: 6, leftHz: 200, rightHz: 206 },
  { id: 'sleep', namePt: 'Delta (2Hz)', nameEn: 'Delta (2Hz)', diffHz: 2, leftHz: 100, rightHz: 102 },
  { id: 'creation', namePt: 'Gamma (40Hz)', nameEn: 'Gamma (40Hz)', diffHz: 40, leftHz: 200, rightHz: 240 },
];

const WAVE_SHAPES: WaveShape[] = ['sine', 'triangle', 'sawtooth', 'square'];

const WAVE_NAMES: Record<WaveShape, { pt: string; en: string }> = {
  sine: { pt: 'Senoidal', en: 'Sine' },
  triangle: { pt: 'Triangular', en: 'Triangle' },
  sawtooth: { pt: 'Dente de Serra', en: 'Sawtooth' },
  square: { pt: 'Quadrada', en: 'Square' },
};

export function StudioConfigDrawer({ isEnglish }: Props) {
  const {
    isConfigDrawerOpen,
    setIsConfigDrawerOpen,

    // Active Layers
    pureToneActive,
    setPureToneActive,
    pureToneMuted,
    setPureToneMuted,
    pureToneFreq,
    pureToneWave,
    pureToneVol,
    setPureToneVol,

    binauralActive,
    setBinauralActive,
    binauralMuted,
    setBinauralMuted,
    binauralLeft,
    setBinauralLeft,
    binauralRight,
    setBinauralRight,
    binauralTarget,
    setBinauralTarget,
    binauralVol,
    setBinauralVol,

    noiseActive,
    setNoiseActive,
    noiseMuted,
    setNoiseMuted,
    noiseType,
    noiseVol,
    setNoiseVol,

    // Queue & Track Routing
    queuedTracks,
    removeFromQueue,
    clearQueue,
    moveQueueItem,
    routeTrackAction,
    updateQueuedTrack,

    // Saved Sessions & Presets
    savedSessions,
    saveCurrentSession,
    deleteSavedSession,
    loadSession,
  } = useNeuroAudio();

  const [activeTab, setActiveTab] = useState<'tracks' | 'presets'>('tracks');
  const [sessionSaveName, setSessionSaveName] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  // Top Generator Staging State (starts null / zerado until selected)
  const [selectedToneType, setSelectedToneType] = useState<'pureTone' | 'binaural' | 'noise' | null>(null);
  const [stagedHz, setStagedHz] = useState<number>(432);
  const [stagedWave, setStagedWave] = useState<WaveShape>('sine');
  const [stagedBinauralTarget, setStagedBinauralTarget] = useState<BinauralTargetState>('relaxation');
  const [stagedBinauralLeft, setStagedBinauralLeft] = useState<number>(200);
  const [stagedBinauralRight, setStagedBinauralRight] = useState<number>(210);
  const [stagedNoiseType, setStagedNoiseType] = useState<NoiseType>('brown');
  const [stagedTimer, setStagedTimer] = useState<number | 'infinite'>(10);

  // 5-second preview state
  const [previewCountdown, setPreviewCountdown] = useState<number>(0);
  const previewIntervalRef = useRef<number | null>(null);

  const stopPreviewAndClear = () => {
    if (previewIntervalRef.current) {
      window.clearInterval(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
    audioEngine.stopPreview();
    setPreviewCountdown(0);
  };

  const triggerPreview = (
    type: 'pureTone' | 'binaural' | 'noise',
    customHz?: number,
    customWave?: WaveShape,
    customBLeft?: number,
    customBRight?: number,
    customBWave?: WaveShape,
    customNoise?: NoiseType
  ) => {
    if (previewIntervalRef.current) {
      window.clearInterval(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
    setPreviewCountdown(5);
    audioEngine.playPreview(
      {
        type,
        freq: customHz ?? stagedHz,
        wave: customWave ?? stagedWave,
        binauralLeft: customBLeft ?? stagedBinauralLeft,
        binauralRight: customBRight ?? stagedBinauralRight,
        binauralWave: customBWave ?? stagedWave,
        noiseType: customNoise ?? stagedNoiseType,
        durationSeconds: 5,
      },
      () => {
        setPreviewCountdown(0);
        if (previewIntervalRef.current) {
          window.clearInterval(previewIntervalRef.current);
          previewIntervalRef.current = null;
        }
      }
    );

    previewIntervalRef.current = window.setInterval(() => {
      setPreviewCountdown((prev) => {
        if (prev <= 1) {
          if (previewIntervalRef.current) {
            window.clearInterval(previewIntervalRef.current);
            previewIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Reset staging session and clear preview when drawer opens or closes
  useEffect(() => {
    if (!isConfigDrawerOpen) {
      setSelectedToneType(null);
      stopPreviewAndClear();
      setStagedHz(432);
      setStagedWave('sine');
      setStagedBinauralTarget('relaxation');
      setStagedBinauralLeft(200);
      setStagedBinauralRight(210);
      setStagedNoiseType('brown');
      setStagedTimer(10);
    }
  }, [isConfigDrawerOpen]);

  useEffect(() => {
    return () => {
      stopPreviewAndClear();
    };
  }, []);

  // Editing state for active layers & queue items (item ID or layer type)
  const [editingLayer, setEditingLayer] = useState<'pureTone' | 'binaural' | 'noise' | null>(null);
  const [editingQueueId, setEditingQueueId] = useState<string | null>(null);
  const [queueEditMode, setQueueEditMode] = useState<'none' | 'volume' | 'timer'>('none');

  const handleIncrementStagedTimer = () => {
    if (selectedToneType === null) return;
    if (stagedTimer === 'infinite') {
      setStagedTimer(10);
    } else if (typeof stagedTimer === 'number') {
      if (stagedTimer >= 60) {
        setStagedTimer('infinite');
      } else {
        setStagedTimer(stagedTimer + 10);
      }
    } else {
      setStagedTimer(10);
    }
  };

  const handleToneAction = (action: 'replace' | 'layer' | 'queue') => {
    if (!selectedToneType) return;
    stopPreviewAndClear();
    routeTrackAction(selectedToneType, action, {
      freq: stagedHz,
      wave: stagedWave,
      binauralTarget: stagedBinauralTarget,
      binauralLeft: stagedBinauralLeft,
      binauralRight: stagedBinauralRight,
      noiseType: stagedNoiseType,
      timerMinutes: stagedTimer,
    });
  };

  const handlePlayNowFromQueue = (track: QueuedTrack) => {
    routeTrackAction(track.type, 'replace', {
      freq: track.config.pureToneFreq,
      wave: track.config.pureToneWave,
      vol: track.config.pureToneVol,
      binauralTarget: track.config.binauralTarget,
      binauralLeft: track.config.binauralLeft,
      binauralRight: track.config.binauralRight,
      noiseType: track.config.noiseType,
      timerMinutes: track.durationMinutes,
      name: track.name,
    });
    removeFromQueue(track.id);
  };

  const handlePlaySimultaneousFromQueue = (track: QueuedTrack) => {
    routeTrackAction(track.type, 'layer', {
      freq: track.config.pureToneFreq,
      wave: track.config.pureToneWave,
      vol: track.config.pureToneVol,
      binauralTarget: track.config.binauralTarget,
      binauralLeft: track.config.binauralLeft,
      binauralRight: track.config.binauralRight,
      noiseType: track.config.noiseType,
      timerMinutes: track.durationMinutes,
      name: track.name,
    });
    removeFromQueue(track.id);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionSaveName.trim()) return;
    saveCurrentSession(sessionSaveName.trim());
    setSessionSaveName('');
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  if (!isConfigDrawerOpen) return null;

  return (
    <div
      id="studio-config-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition-opacity duration-300"
      onClick={() => setIsConfigDrawerOpen(false)}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-md bg-[var(--surface)] border-l border-[var(--border)] h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* DRAWER HEADER: TITLE & TAB SWITCHER                       */}
        {/* ========================================================= */}
        <div className="p-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
              {isEnglish ? 'Tracks & Queue' : 'Faixas & Fila'}
            </h2>

            <button
              type="button"
              id="btn-close-studio-drawer"
              onClick={() => setIsConfigDrawerOpen(false)}
              aria-label="Fechar"
              className="text-[var(--text-secondary)] hover:text-[var(--foreground)] p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Minimal Tab Switcher without heavy containers */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('tracks')}
              className={`pb-1 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'tracks'
                  ? 'border-blue-500 font-bold text-[var(--foreground)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              {isEnglish ? 'Tracks & Generator' : 'Gerador & Faixas'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`pb-1 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'presets'
                  ? 'border-blue-500 font-bold text-[var(--foreground)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              {isEnglish ? 'Presets' : 'Presets'}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DRAWER BODY CONTENT                                       */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'tracks' && (
            <>
              {/* =================================================== */}
              {/* 1. TOP GENERATOR BOX (PREVIEW MODE & STAGING)       */}
              {/* =================================================== */}
              <section className="space-y-3 pb-4 border-b border-[var(--border)]">
                {/* Tone Type Selector (Pure Tone, Binaural, Noise) + 5s Preview Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* 1. Pure Tone */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedToneType === 'pureTone') {
                          setSelectedToneType(null);
                          stopPreviewAndClear();
                        } else {
                          setSelectedToneType('pureTone');
                          stopPreviewAndClear();
                        }
                      }}
                      title={isEnglish ? 'Pure Tone' : 'Tom Puro'}
                      className={`flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        selectedToneType === 'pureTone'
                          ? 'text-blue-500 font-semibold bg-blue-500/10'
                          : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <Radio size={16} />
                      {selectedToneType === 'pureTone' && <span>{isEnglish ? 'Pure Tone' : 'Tom Puro'}</span>}
                    </button>

                    {/* 2. Binaural */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedToneType === 'binaural') {
                          setSelectedToneType(null);
                          stopPreviewAndClear();
                        } else {
                          setSelectedToneType('binaural');
                          stopPreviewAndClear();
                        }
                      }}
                      title={isEnglish ? 'Binaural' : 'Binaural'}
                      className={`flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        selectedToneType === 'binaural'
                          ? 'text-blue-500 font-semibold bg-blue-500/10'
                          : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <Headphones size={16} />
                      {selectedToneType === 'binaural' && <span>{isEnglish ? 'Binaural' : 'Binaural'}</span>}
                    </button>

                    {/* 3. Noise */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedToneType === 'noise') {
                          setSelectedToneType(null);
                          stopPreviewAndClear();
                        } else {
                          setSelectedToneType('noise');
                          stopPreviewAndClear();
                        }
                      }}
                      title={isEnglish ? 'Noise' : 'Ruído'}
                      className={`flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        selectedToneType === 'noise'
                          ? 'text-blue-500 font-semibold bg-blue-500/10'
                          : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <Activity size={16} />
                      {selectedToneType === 'noise' && <span>{isEnglish ? 'Noise' : 'Ruído'}</span>}
                    </button>
                  </div>

                  {/* 5-second Circular Countdown Icon without encapsulation/background */}
                  <div className="flex items-center">
                    {selectedToneType === null ? (
                      /* Disabled appearance when no track is selected */
                      <div
                        title={isEnglish ? 'No track selected' : 'Nenhuma faixa selecionada'}
                        className="relative w-7 h-7 flex items-center justify-center opacity-25 cursor-not-allowed select-none text-[var(--text-tertiary)]"
                      >
                        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeDasharray="94.25"
                            strokeDashoffset="0"
                          />
                        </svg>
                        <span className="absolute text-[10px] font-bold font-mono">5s</span>
                      </div>
                    ) : previewCountdown > 0 ? (
                      /* Active countdown with play/pause capability: Clicking pauses the preview */
                      <button
                        type="button"
                        onClick={stopPreviewAndClear}
                        title={isEnglish ? 'Pause preview' : 'Pausar preview'}
                        aria-label="Pausar preview"
                        className="relative w-7 h-7 flex items-center justify-center text-blue-500 cursor-pointer active:scale-95 transition-transform"
                      >
                        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                          {/* Background track circle (subtle blue) */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="opacity-20"
                          />
                          {/* Animated countdown circle from 94.25 to 0 */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeDasharray="94.25"
                            strokeDashoffset={94.25 * (1 - previewCountdown / 5)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                          />
                        </svg>
                        <span className="absolute text-[10px] font-bold font-mono text-blue-500">
                          {previewCountdown}s
                        </span>
                      </button>
                    ) : (
                      /* Paused / Enabled state: Click to play 5s preview */
                      <button
                        type="button"
                        onClick={() => triggerPreview(selectedToneType)}
                        title={isEnglish ? 'Play 5s preview' : 'Tocar preview de 5s'}
                        aria-label="Tocar preview de 5s"
                        className="relative w-7 h-7 flex items-center justify-center text-blue-500 hover:text-blue-400 cursor-pointer active:scale-95 transition-transform"
                      >
                        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeDasharray="94.25"
                            strokeDashoffset="0"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-[10px] font-bold font-mono">
                          5s
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Empty State when no configuration is selected */}
                {selectedToneType === null && (
                  <div className="py-4 text-center text-xs font-mono text-[var(--text-secondary)]">
                    <p className="opacity-75">
                      {isEnglish
                        ? 'Select a track for session'
                        : 'Selecione uma faixa para sessão'}
                    </p>
                  </div>
                )}

                {/* Pure Tone Controls */}
                {selectedToneType === 'pureTone' && (
                  <div className="space-y-3 pt-1">
                    {/* Inline Slider in front of Hz index (No 'Frequência' title) */}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="font-bold text-blue-500 text-sm font-mono shrink-0 min-w-[62px]">
                        {stagedHz} Hz
                      </span>
                      <input
                        type="range"
                        min="20"
                        max="20000"
                        step="1"
                        value={stagedHz}
                        onChange={(e) => {
                          const hz = parseInt(e.target.value, 10);
                          setStagedHz(hz);
                          triggerPreview('pureTone', hz, stagedWave);
                        }}
                        className="w-full h-1 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Waveform shapes */}
                    <div className="flex items-center justify-between pt-1">
                      {WAVE_SHAPES.map((shape) => {
                        const isSelected = stagedWave === shape;
                        const waveTitle = isEnglish ? WAVE_NAMES[shape].en : WAVE_NAMES[shape].pt;
                        return (
                          <button
                            key={shape}
                            type="button"
                            onClick={() => {
                              setStagedWave(shape);
                              triggerPreview('pureTone', stagedHz, shape);
                            }}
                            title={waveTitle}
                            className={`flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors cursor-pointer text-xs font-mono ${
                              isSelected
                                ? 'text-blue-500 font-semibold'
                                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                            }`}
                          >
                            <WaveIcon shape={shape} size={18} className={isSelected ? 'text-blue-500' : 'text-current'} />
                            {isSelected && <span>{waveTitle}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Binaural Controls: Catalogued by R and L headphone channels */}
                {selectedToneType === 'binaural' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono px-1">
                      <span className="flex items-center gap-1">
                        <Headphones size={13} />
                        {isEnglish ? 'Ear Targets' : 'Distribuição Fone'}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">L (Esq) / R (Dir)</span>
                    </div>

                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {BINAURAL_TARGETS.map((t) => {
                        const isSelected = stagedBinauralTarget === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              if (stagedBinauralTarget === t.id) {
                                setStagedBinauralTarget('custom');
                              } else {
                                setStagedBinauralTarget(t.id);
                                setStagedBinauralLeft(t.leftHz);
                                setStagedBinauralRight(t.rightHz);
                                triggerPreview('binaural', undefined, undefined, t.leftHz, t.rightHz);
                              }
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                              isSelected
                                ? 'text-blue-500 font-bold bg-blue-500/10'
                                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                            }`}
                          >
                            <span>{t.namePt}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[10px] font-bold">
                                  L {t.leftHz}Hz
                                </span>
                                <span className="text-[var(--text-tertiary)]">•</span>
                                <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[10px] font-bold">
                                  R {t.rightHz}Hz
                                </span>
                              </div>
                              {isSelected && <Check size={13} className="text-blue-500 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom L & R sliders with Headphone icon + Letter + Slider + Index up to 20kHz */}
                    <div className="pt-2 border-t border-[var(--border)]/60 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                          <Sliders size={12} className="text-blue-500" />
                          {isEnglish ? 'Custom' : 'Personalizado'}
                        </span>
                        <span className="text-[10px] text-blue-500 font-bold px-1.5 py-0.5 rounded bg-blue-500/10">
                          Δ {Math.abs(stagedBinauralRight - stagedBinauralLeft).toFixed(1)} Hz
                        </span>
                      </div>

                      {/* Left Channel (L) Row: Headphone + L + Slider + Index */}
                      <div className="flex items-center gap-2">
                        <Headphones size={14} className="text-blue-500 shrink-0" />
                        <span className="font-bold text-xs font-mono shrink-0 w-3 text-center">L</span>
                        <input
                          type="range"
                          min="20"
                          max="20000"
                          step="1"
                          value={stagedBinauralLeft}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setStagedBinauralLeft(val);
                            setStagedBinauralTarget('custom');
                            triggerPreview('binaural', undefined, undefined, val, stagedBinauralRight);
                          }}
                          className="w-full h-1.5 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                        />
                        <span className="font-bold text-blue-500 text-xs font-mono shrink-0 min-w-[65px] text-right">
                          {stagedBinauralLeft} Hz
                        </span>
                      </div>

                      {/* Right Channel (R) Row: Headphone + R + Slider + Index */}
                      <div className="flex items-center gap-2">
                        <Headphones size={14} className="text-blue-500 shrink-0" />
                        <span className="font-bold text-xs font-mono shrink-0 w-3 text-center">R</span>
                        <input
                          type="range"
                          min="20"
                          max="20000"
                          step="1"
                          value={stagedBinauralRight}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setStagedBinauralRight(val);
                            setStagedBinauralTarget('custom');
                            triggerPreview('binaural', undefined, undefined, stagedBinauralLeft, val);
                          }}
                          className="w-full h-1.5 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                        />
                        <span className="font-bold text-blue-500 text-xs font-mono shrink-0 min-w-[65px] text-right">
                          {stagedBinauralRight} Hz
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Noise Controls */}
                {selectedToneType === 'noise' && (
                  <div className="space-y-1 pt-1">
                    <div className="max-h-32 overflow-y-auto space-y-0.5 pr-1">
                      {NOISE_LIST.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            setStagedNoiseType(n.id);
                            triggerPreview('noise', undefined, undefined, undefined, undefined, undefined, n.id);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                            stagedNoiseType === n.id
                              ? 'text-blue-500 font-bold bg-blue-500/10'
                              : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          <div>
                            <div>{n.namePt}</div>
                            <div className="text-[10px] text-[var(--text-tertiary)] font-mono">{n.desc}</div>
                          </div>
                          {stagedNoiseType === n.id && <Check size={14} className="shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generator Bottom Menu: Timer (+10m / ∞) + Action Icons */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/50">
                  <button
                    type="button"
                    onClick={handleIncrementStagedTimer}
                    disabled={selectedToneType === null}
                    title={isEnglish ? 'Timer duration (+10m / ∞)' : 'Duração do temporizador (+10m / ∞)'}
                    className={`flex items-center gap-1 text-xs font-mono transition-colors active:scale-95 p-1 ${
                      selectedToneType === null
                        ? 'opacity-30 cursor-not-allowed text-[var(--text-tertiary)]'
                        : 'text-[var(--text-secondary)] hover:text-blue-500 cursor-pointer'
                    }`}
                  >
                    <Clock size={14} className={selectedToneType === null ? 'text-[var(--text-tertiary)]' : 'text-blue-500'} />
                    <span className={`font-semibold ${selectedToneType === null ? 'text-[var(--text-tertiary)]' : 'text-blue-500'}`}>
                      {stagedTimer === 'infinite' ? '∞' : `${stagedTimer}m`}
                    </span>
                    <Plus size={12} className="text-[var(--text-tertiary)] hover:text-blue-500" />
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={selectedToneType === null}
                      onClick={() => handleToneAction('replace')}
                      title={isEnglish ? 'Play Now' : 'Tocar Agora'}
                      aria-label="Tocar Agora"
                      className={`p-1 transition-colors ${
                        selectedToneType === null
                          ? 'opacity-25 cursor-not-allowed pointer-events-none text-[var(--text-tertiary)]'
                          : 'text-[var(--foreground)] hover:text-blue-500 cursor-pointer active:scale-95'
                      }`}
                    >
                      <Play size={18} className="fill-current" />
                    </button>

                    <button
                      type="button"
                      disabled={selectedToneType === null}
                      onClick={() => handleToneAction('layer')}
                      title={isEnglish ? 'Play Simultaneously (Layer)' : 'Tocar Simultâneo (Camada)'}
                      aria-label="Tocar Simultâneo"
                      className={`p-1 transition-colors ${
                        selectedToneType === null
                          ? 'opacity-25 cursor-not-allowed pointer-events-none text-[var(--text-tertiary)]'
                          : 'text-[var(--foreground)] hover:text-blue-500 cursor-pointer active:scale-95'
                      }`}
                    >
                      <Layers size={18} />
                    </button>

                    <button
                      type="button"
                      disabled={selectedToneType === null}
                      onClick={() => handleToneAction('queue')}
                      title={isEnglish ? 'Add to Queue' : 'Adicionar à Fila'}
                      aria-label="Adicionar à Fila"
                      className={`p-1 transition-colors ${
                        selectedToneType === null
                          ? 'opacity-25 cursor-not-allowed pointer-events-none text-[var(--text-tertiary)]'
                          : 'text-[var(--foreground)] hover:text-blue-500 cursor-pointer active:scale-95'
                      }`}
                    >
                      <ListPlus size={18} />
                    </button>
                  </div>
                </div>
              </section>

              {/* =================================================== */}
              {/* 2. ACTIVE PLAYING LAYERS (EDIT ICON -> DROPDOWN)   */}
              {/* =================================================== */}
              <section className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span className="uppercase font-semibold tracking-wider">
                    {isEnglish ? 'Active Layers' : 'Faixas em Execução'}
                  </span>
                  <span className="text-[10px] text-blue-500 font-bold">
                    {(pureToneActive && !pureToneMuted ? 1 : 0) +
                      (binauralActive && !binauralMuted ? 1 : 0) +
                      (noiseActive && !noiseMuted ? 1 : 0)}{' '}
                    Ativas
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Layer 1: Pure Tone */}
                  {pureToneActive && (
                    <div className="py-2 border-b border-[var(--border)]/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radio size={16} className="text-blue-500" />
                          <span className="text-xs font-mono text-[var(--foreground)]">
                            {pureToneFreq} Hz • Tom Puro ({pureToneWave})
                          </span>
                        </div>

                        {/* Edit Icon for this track */}
                        <button
                          type="button"
                          onClick={() => setEditingLayer(editingLayer === 'pureTone' ? null : 'pureTone')}
                          title={isEnglish ? 'Configure Track' : 'Configurar Faixa'}
                          className={`p-1 transition-colors cursor-pointer ${
                            editingLayer === 'pureTone' ? 'text-blue-500' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>

                      {/* Dropdown for Pure Tone configs: Volume with Mute, Delete */}
                      <AnimatePresence>
                        {editingLayer === 'pureTone' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-1 pl-6 space-y-2"
                          >
                            {/* Volume with inline Mute toggle */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPureToneMuted(!pureToneMuted)}
                                title={pureToneMuted ? 'Desmutar' : 'Mutar'}
                                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] p-0.5 transition-colors cursor-pointer"
                              >
                                {pureToneMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-blue-500" />}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={pureToneVol}
                                onChange={(e) => setPureToneVol(parseFloat(e.target.value))}
                                className="flex-1 h-1 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                              />
                              <span className="text-[10px] font-mono w-8 text-right text-[var(--text-secondary)]">
                                {Math.round(pureToneVol * 100)}%
                              </span>
                            </div>

                            {/* Actions (Delete only as icon) */}
                            <div className="flex items-center justify-end gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setPureToneActive(false);
                                  setEditingLayer(null);
                                }}
                                title={isEnglish ? 'Delete' : 'Excluir'}
                                aria-label="Excluir"
                                className="text-[var(--text-secondary)] hover:text-red-400 p-1 transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Layer 2: Binaural (Blue Accent) */}
                  {binauralActive && (
                    <div className="py-2 border-b border-[var(--border)]/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Headphones size={16} className="text-blue-500" />
                          <span className="text-xs font-mono text-[var(--foreground)]">
                            Binaural {Math.abs(binauralRight - binauralLeft).toFixed(1)} Hz ({binauralTarget})
                          </span>
                        </div>

                        {/* Edit Icon */}
                        <button
                          type="button"
                          onClick={() => setEditingLayer(editingLayer === 'binaural' ? null : 'binaural')}
                          title={isEnglish ? 'Configure Track' : 'Configurar Faixa'}
                          className={`p-1 transition-colors cursor-pointer ${
                            editingLayer === 'binaural' ? 'text-blue-500' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>

                      {/* Dropdown for Binaural configs */}
                      <AnimatePresence>
                        {editingLayer === 'binaural' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-1 pl-6 space-y-2.5"
                          >
                            {/* Volume with inline Mute toggle */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setBinauralMuted(!binauralMuted)}
                                title={binauralMuted ? 'Desmutar' : 'Mutar'}
                                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] p-0.5 transition-colors cursor-pointer"
                              >
                                {binauralMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-blue-500" />}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={binauralVol}
                                onChange={(e) => setBinauralVol(parseFloat(e.target.value))}
                                className="flex-1 h-1 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                              />
                              <span className="text-[10px] font-mono w-8 text-right text-[var(--text-secondary)]">
                                {Math.round(binauralVol * 100)}%
                              </span>
                            </div>

                            {/* Live L / R sliders up to 20kHz */}
                            <div className="space-y-2 pt-1 border-t border-[var(--border)]/40">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1">
                                  <Sliders size={11} className="text-blue-500" />
                                  {isEnglish ? 'Custom' : 'Personalizado'}
                                </span>
                                <span className="text-blue-500 font-bold px-1 py-0.5 rounded bg-blue-500/10">
                                  Δ {Math.abs(binauralRight - binauralLeft).toFixed(1)} Hz
                                </span>
                              </div>

                              {/* L Channel */}
                              <div className="flex items-center gap-2">
                                <Headphones size={13} className="text-blue-500 shrink-0" />
                                <span className="font-bold text-[11px] font-mono shrink-0 w-3 text-center">L</span>
                                <input
                                  type="range"
                                  min="20"
                                  max="20000"
                                  step="1"
                                  value={binauralLeft}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setBinauralLeft(val);
                                    setBinauralTarget('custom');
                                  }}
                                  className="w-full h-1 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                                />
                                <span className="font-bold text-blue-500 text-[10px] font-mono shrink-0 min-w-[55px] text-right">
                                  {binauralLeft} Hz
                                </span>
                              </div>

                              {/* R Channel */}
                              <div className="flex items-center gap-2">
                                <Headphones size={13} className="text-blue-500 shrink-0" />
                                <span className="font-bold text-[11px] font-mono shrink-0 w-3 text-center">R</span>
                                <input
                                  type="range"
                                  min="20"
                                  max="20000"
                                  step="1"
                                  value={binauralRight}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setBinauralRight(val);
                                    setBinauralTarget('custom');
                                  }}
                                  className="w-full h-1 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                                />
                                <span className="font-bold text-blue-500 text-[10px] font-mono shrink-0 min-w-[55px] text-right">
                                  {binauralRight} Hz
                                </span>
                              </div>
                            </div>

                            {/* Actions (Delete only icon) */}
                            <div className="flex items-center justify-end gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setBinauralActive(false);
                                  setEditingLayer(null);
                                }}
                                title={isEnglish ? 'Delete' : 'Excluir'}
                                aria-label="Excluir"
                                className="text-[var(--text-secondary)] hover:text-red-400 p-1 transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Layer 3: Noise */}
                  {noiseActive && (
                    <div className="py-2 border-b border-[var(--border)]/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity size={16} className="text-teal-500" />
                          <span className="text-xs font-mono text-[var(--foreground)]">
                            Ruído {noiseType}
                          </span>
                        </div>

                        {/* Edit Icon */}
                        <button
                          type="button"
                          onClick={() => setEditingLayer(editingLayer === 'noise' ? null : 'noise')}
                          title={isEnglish ? 'Configure Track' : 'Configurar Faixa'}
                          className={`p-1 transition-colors cursor-pointer ${
                            editingLayer === 'noise' ? 'text-blue-500' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>

                      {/* Dropdown for Noise configs */}
                      <AnimatePresence>
                        {editingLayer === 'noise' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-1 pl-6 space-y-2"
                          >
                            {/* Volume with inline Mute toggle */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setNoiseMuted(!noiseMuted)}
                                title={noiseMuted ? 'Desmutar' : 'Mutar'}
                                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] p-0.5 transition-colors cursor-pointer"
                              >
                                {noiseMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-teal-500" />}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={noiseVol}
                                onChange={(e) => setNoiseVol(parseFloat(e.target.value))}
                                className="flex-1 h-1 bg-[var(--surface-2)] accent-teal-500 rounded-lg cursor-pointer"
                              />
                              <span className="text-[10px] font-mono w-8 text-right text-[var(--text-secondary)]">
                                {Math.round(noiseVol * 100)}%
                              </span>
                            </div>

                            {/* Actions (Delete only icon) */}
                            <div className="flex items-center justify-end gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setNoiseActive(false);
                                  setEditingLayer(null);
                                }}
                                title={isEnglish ? 'Delete' : 'Excluir'}
                                aria-label="Excluir"
                                className="text-[var(--text-secondary)] hover:text-red-400 p-1 transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {!pureToneActive && !binauralActive && !noiseActive && (
                    <div className="py-4 text-center text-xs text-[var(--text-secondary)] font-mono">
                      {isEnglish ? 'No active audio layers.' : 'Nenhuma faixa ativa.'}
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================== */}
              {/* 3. QUEUED TRACKS (EDIT ICON -> DROPDOWN OF ICONS)  */}
              {/* =================================================== */}
              <section className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span className="uppercase font-semibold tracking-wider">
                    {isEnglish ? 'Queue' : 'Fila de Espera'}
                  </span>
                  {queuedTracks.length > 0 && (
                    <button
                      type="button"
                      onClick={clearQueue}
                      className="text-[11px] text-[var(--text-tertiary)] hover:text-red-400 transition-colors cursor-pointer"
                    >
                      {isEnglish ? 'Clear' : 'Limpar'}
                    </button>
                  )}
                </div>

                {queuedTracks.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[var(--text-secondary)] font-mono">
                    {isEnglish ? 'Queue is empty' : 'Fila vazia.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {queuedTracks.map((track, idx) => {
                      const isEditing = editingQueueId === track.id;
                      return (
                        <div key={track.id} className="py-2 border-b border-[var(--border)]/50 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            {/* Reorder Up/Down */}
                            <div className="flex flex-col gap-0.5 text-[var(--text-tertiary)]">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveQueueItem(idx, idx - 1)}
                                className="hover:text-[var(--foreground)] disabled:opacity-20 transition-colors cursor-pointer"
                                title="Mover para Cima"
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === queuedTracks.length - 1}
                                onClick={() => moveQueueItem(idx, idx + 1)}
                                className="hover:text-[var(--foreground)] disabled:opacity-20 transition-colors cursor-pointer"
                                title="Mover para Baixo"
                              >
                                <ChevronDown size={13} />
                              </button>
                            </div>

                            {/* Track Info */}
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-[var(--foreground)] truncate">
                                {track.name}
                              </div>
                              <div className="text-[10px] font-mono text-[var(--text-secondary)] truncate">
                                {track.details} • {track.durationMinutes === 'infinite' ? '∞' : `${track.durationMinutes}m`}
                              </div>
                            </div>

                            {/* Edit Icon to open dropdown of actions (ICONS ONLY, NO TITLES) */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQueueId(isEditing ? null : track.id);
                                setQueueEditMode('none');
                              }}
                              title="Configurar Faixa"
                              className={`p-1 transition-colors cursor-pointer ${
                                isEditing ? 'text-blue-500' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                              }`}
                            >
                              <Edit3 size={15} />
                            </button>
                          </div>

                          {/* Dropdown of available configs: Tocar Simultâneo, Tocar Agora, Volume, Cronômetro, Excluir (ALL AS ICONS, NO TITLES) */}
                          <AnimatePresence>
                            {isEditing && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-2 pl-4 space-y-2"
                              >
                                {/* Icons row without titles */}
                                <div className="flex items-center justify-end gap-3.5">
                                  {/* 1. Tocar Simultâneo */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handlePlaySimultaneousFromQueue(track);
                                      setEditingQueueId(null);
                                    }}
                                    title={isEnglish ? 'Play Simultaneously' : 'Tocar Simultâneo'}
                                    aria-label="Tocar Simultâneo"
                                    className="text-[var(--text-secondary)] hover:text-blue-500 p-1 transition-colors cursor-pointer"
                                  >
                                    <Layers size={16} />
                                  </button>

                                  {/* 2. Tocar Agora */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handlePlayNowFromQueue(track);
                                      setEditingQueueId(null);
                                    }}
                                    title={isEnglish ? 'Play Now' : 'Tocar Agora'}
                                    aria-label="Tocar Agora"
                                    className="text-[var(--text-secondary)] hover:text-blue-500 p-1 transition-colors cursor-pointer"
                                  >
                                    <Play size={16} className="fill-current" />
                                  </button>

                                  {/* 3. Volume Toggle Slider */}
                                  <button
                                    type="button"
                                    onClick={() => setQueueEditMode(queueEditMode === 'volume' ? 'none' : 'volume')}
                                    title={isEnglish ? 'Volume' : 'Volume'}
                                    aria-label="Volume"
                                    className={`p-1 transition-colors cursor-pointer ${
                                      queueEditMode === 'volume' ? 'text-blue-500' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                                    }`}
                                  >
                                    <Volume2 size={16} />
                                  </button>

                                  {/* 4. Cronômetro / Timer Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => setQueueEditMode(queueEditMode === 'timer' ? 'none' : 'timer')}
                                    title={isEnglish ? 'Timer' : 'Cronômetro'}
                                    aria-label="Cronômetro"
                                    className={`p-1 transition-colors cursor-pointer ${
                                      queueEditMode === 'timer' ? 'text-blue-500' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                                    }`}
                                  >
                                    <Clock size={16} />
                                  </button>

                                  {/* 5. Excluir */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      removeFromQueue(track.id);
                                      setEditingQueueId(null);
                                    }}
                                    title={isEnglish ? 'Delete' : 'Excluir'}
                                    aria-label="Excluir"
                                    className="text-[var(--text-secondary)] hover:text-red-400 p-1 transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>

                                {/* Volume slider if volume icon clicked */}
                                {queueEditMode === 'volume' && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <Volume2 size={13} className="text-[var(--text-secondary)]" />
                                    <input
                                      type="range"
                                      min="0"
                                      max="1"
                                      step="0.05"
                                      value={track.config.pureToneVol ?? 0.8}
                                      onChange={(e) => {
                                        const newVol = parseFloat(e.target.value);
                                        updateQueuedTrack(track.id, {
                                          config: {
                                            ...track.config,
                                            pureToneVol: newVol,
                                            binauralVol: newVol,
                                            noiseVol: newVol,
                                          },
                                        });
                                      }}
                                      className="flex-1 h-1 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                                    />
                                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                                      {Math.round((track.config.pureToneVol ?? 0.8) * 100)}%
                                    </span>
                                  </div>
                                )}

                                {/* Timer adjust if clock icon clicked */}
                                {queueEditMode === 'timer' && (
                                  <div className="flex items-center justify-end gap-2 pt-1 text-xs font-mono">
                                    {[5, 15, 30, 60, 'infinite'].map((m) => (
                                      <button
                                        key={String(m)}
                                        type="button"
                                        onClick={() =>
                                          updateQueuedTrack(track.id, {
                                            durationMinutes: m as any,
                                          })
                                        }
                                        className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                                          track.durationMinutes === m
                                            ? 'text-blue-500 font-bold bg-blue-500/10'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                                        }`}
                                      >
                                        {m === 'infinite' ? '∞' : `${m}m`}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SAVED PRESETS & LIBRARY                            */}
          {/* ========================================================= */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              {/* Save Session Form */}
              <form onSubmit={handleSaveSession} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sessionSaveName}
                    onChange={(e) => setSessionSaveName(e.target.value)}
                    placeholder={isEnglish ? 'Preset name...' : 'Nome do preset...'}
                    className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    title={isEnglish ? 'Save Preset' : 'Salvar Preset'}
                    aria-label="Salvar Preset"
                    className="p-1.5 text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {saveSuccessNotice && (
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {isEnglish ? 'Saved successfully!' : 'Salvo com sucesso!'}
                  </p>
                )}
              </form>

              {/* Presets List */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-[var(--text-secondary)] uppercase font-semibold tracking-wider">
                  {isEnglish ? 'Saved Presets' : 'Presets Salvos'}
                </div>

                {savedSessions.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[var(--text-secondary)] font-mono">
                    {isEnglish ? 'No saved presets' : 'Nenhum preset salvo.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedSessions.map((session) => (
                      <div
                        key={session.id}
                        className="py-2 border-b border-[var(--border)]/50 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-[var(--foreground)] truncate">
                            {session.name}
                          </div>
                          <div className="text-[10px] font-mono text-[var(--text-secondary)] truncate">
                            {session.date}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => loadSession(session)}
                            title={isEnglish ? 'Load' : 'Carregar'}
                            aria-label="Carregar"
                            className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors cursor-pointer"
                          >
                            <Play size={15} className="fill-current" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSavedSession(session.id)}
                            title={isEnglish ? 'Delete' : 'Excluir'}
                            aria-label="Excluir"
                            className="text-[var(--text-secondary)] hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
