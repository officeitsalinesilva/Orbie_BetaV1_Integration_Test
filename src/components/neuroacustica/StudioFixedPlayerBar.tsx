import React, { useState, useRef, useEffect } from 'react';
import {
  useNeuroAudio,
  WaveShape,
  NoiseType,
  BinauralTargetState,
} from '../../context/NeuroAudioContext';
import { WaveIcon } from './WaveIcon';
import {
  Play,
  Pause,
  Sliders,
  Volume2,
  VolumeX,
  Radio,
  Waves,
  Activity,
  Headphones,
  Plus,
  Minus,
  ListPlus,
  Layers,
  Check,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Props = {
  isEnglish?: boolean;
};

const NOISE_LIST: Array<{ id: NoiseType; namePt: string; nameEn: string; desc: string }> = [
  { id: 'white', namePt: 'Ruído Branco', nameEn: 'White Noise', desc: 'Isolamento acústico completo' },
  { id: 'pink', namePt: 'Ruído Rosa', nameEn: 'Pink Noise', desc: 'Foco contínuo e concentração' },
  { id: 'brown', namePt: 'Ruído Marrom', nameEn: 'Ruído Marrom', desc: 'Graves densos, sono e relaxamento' },
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

export function StudioFixedPlayerBar({ isEnglish }: Props) {
  const {
    isPlaying,
    toggleMasterPlay,
    pausePlayback,
    masterVolume,
    setMasterVolume,
    timerMinutes,
    setTimerMinutes,
    elapsedSeconds,
    pureToneActive,
    setPureToneActive,
    setPureToneMuted,
    pureToneFreq,
    setPureToneFreq,
    pureToneWave,
    setPureToneWave,
    binauralActive,
    setBinauralActive,
    setBinauralMuted,
    binauralLeft,
    setBinauralLeft,
    binauralRight,
    setBinauralRight,
    binauralTarget,
    setBinauralTarget,
    noiseActive,
    setNoiseActive,
    setNoiseMuted,
    noiseType,
    setNoiseType,
    toggleConfigDrawer,
    isConfigDrawerOpen,
    queuedTracks,
  } = useNeuroAudio();

  // Popover state
  const [isToneBoxOpen, setIsToneBoxOpen] = useState<boolean>(false);
  const [isVolumeEditing, setIsVolumeEditing] = useState<boolean>(false);
  const [isTimerEditing, setIsTimerEditing] = useState<boolean>(false);

  // Tone Box Configuration Type (null when unselected/zerado)
  const [selectedToneType, setSelectedToneType] = useState<'pureTone' | 'binaural' | 'noise' | null>(null);

  // Sync selectedToneType when active layers change during playback
  useEffect(() => {
    if (isPlaying) {
      if (pureToneActive && !binauralActive && !noiseActive) {
        setSelectedToneType('pureTone');
      } else if (binauralActive && !pureToneActive && !noiseActive) {
        setSelectedToneType('binaural');
      } else if (noiseActive && !pureToneActive && !binauralActive) {
        setSelectedToneType('noise');
      }
    }
  }, [isPlaying, pureToneActive, binauralActive, noiseActive]);

  const toneBoxRef = useRef<HTMLDivElement | null>(null);
  const volumeTimerRef = useRef<number | null>(null);
  const timerInactivityRef = useRef<number | null>(null);

  // Volume inactivity timer (4 seconds)
  const resetVolumeTimer = () => {
    if (volumeTimerRef.current) {
      window.clearTimeout(volumeTimerRef.current);
    }
    volumeTimerRef.current = window.setTimeout(() => {
      setIsVolumeEditing(false);
    }, 4000);
  };

  const handleStartVolumeEdit = () => {
    setIsVolumeEditing(true);
    resetVolumeTimer();
  };

  // Timer inactivity timer (3.5 seconds)
  const resetTimerInactivity = () => {
    if (timerInactivityRef.current) {
      window.clearTimeout(timerInactivityRef.current);
    }
    timerInactivityRef.current = window.setTimeout(() => {
      setIsTimerEditing(false);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (volumeTimerRef.current) window.clearTimeout(volumeTimerRef.current);
      if (timerInactivityRef.current) window.clearTimeout(timerInactivityRef.current);
    };
  }, []);

  // Close tone box when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toneBoxRef.current && !toneBoxRef.current.contains(e.target as Node)) {
        setIsToneBoxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format live timer counter (hh:mm:ss or mm:ss)
  const formatCounterTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timer Summation Click (Adds +10m up to 60m, then ∞)
  const handleIncrementTimer = () => {
    setIsTimerEditing(true);
    resetTimerInactivity();

    if (timerMinutes === 'infinite') {
      setTimerMinutes(10);
    } else if (typeof timerMinutes === 'number') {
      if (timerMinutes >= 60) {
        setTimerMinutes('infinite');
      } else {
        setTimerMinutes(timerMinutes + 10);
      }
    } else {
      setTimerMinutes(10);
    }
  };

  // Switch category panel inside tone box without auto-starting playback
  const selectPureTone = () => {
    if (selectedToneType === 'pureTone') {
      setSelectedToneType(null);
    } else {
      setSelectedToneType('pureTone');
    }
  };

  const selectBinaural = () => {
    if (selectedToneType === 'binaural') {
      setSelectedToneType(null);
    } else {
      setSelectedToneType('binaural');
    }
  };

  const selectNoise = () => {
    if (selectedToneType === 'noise') {
      setSelectedToneType(null);
    } else {
      setSelectedToneType('noise');
    }
  };

  const handleOpenToneBox = () => {
    setIsToneBoxOpen((prev) => {
      const willOpen = !prev;
      if (willOpen) {
        if (isPlaying) {
          if (pureToneActive && !binauralActive && !noiseActive) setSelectedToneType('pureTone');
          else if (binauralActive && !pureToneActive && !noiseActive) setSelectedToneType('binaural');
          else if (noiseActive && !pureToneActive && !binauralActive) setSelectedToneType('noise');
          else setSelectedToneType(null);
        } else {
          setSelectedToneType(null);
        }
      }
      return willOpen;
    });
  };

  // Audio track presence & status
  const hasActiveAudio = pureToneActive || binauralActive || noiseActive;
  const layerCount = (pureToneActive ? 1 : 0) + (binauralActive ? 1 : 0) + (noiseActive ? 1 : 0);
  const queueCount = queuedTracks.length;

  return (
    <footer
      id="studio-fixed-bottom-navbar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--background)]/90 backdrop-blur-xl border-t border-[var(--border)] px-4 py-2.5 sm:px-6 transition-all"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* ========================================================= */}
        {/* LEFT: PLAY/PAUSE (BARE ICON) + WAVEFORM ICON (TONE BOX)   */}
        {/* ========================================================= */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Master Play / Pause Button - Pure icon without heavy background/border */}
          <button
            type="button"
            id="btn-master-play-pause-fixed"
            onClick={toggleMasterPlay}
            title={isPlaying ? (isEnglish ? 'Pause' : 'Pausar') : (isEnglish ? 'Play' : 'Tocar')}
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
            className="text-[var(--foreground)] hover:text-blue-500 transition-colors p-1 cursor-pointer active:scale-95 shrink-0"
          >
            {isPlaying ? (
              <Pause size={22} className="fill-current text-blue-500" />
            ) : (
              <Play size={22} className="fill-current text-[var(--foreground)]" />
            )}
          </button>

          {/* Waveform Icon (Opens Tone Configuration Box centered above lower player axis) */}
          <div className="relative" ref={toneBoxRef}>
            <button
              type="button"
              id="btn-fixed-waveform-tones"
              onClick={handleOpenToneBox}
              title={isEnglish ? 'Configure Tone' : 'Configurar Tom'}
              aria-label="Configurar Tom"
              className={`p-1 transition-colors cursor-pointer active:scale-95 ${
                isToneBoxOpen || isPlaying
                  ? 'text-blue-500'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              <Waves size={22} />
            </button>

            {/* ===================================================== */}
            {/* TONE CONFIGURATION BOX (CENTERED RELATIVE TO PLAYER)  */}
            {/* ===================================================== */}
            <AnimatePresence>
              {isToneBoxOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                  exit={{ opacity: 0, y: 12, scale: 0.96, x: '-50%' }}
                  style={{ left: '50%' }}
                  className="fixed bottom-14 w-[calc(100vw-32px)] max-w-sm sm:max-w-md p-4 rounded-2xl bg-[var(--surface)]/95 border border-[var(--border)] shadow-2xl backdrop-blur-2xl z-50 flex flex-col gap-3.5"
                >
                  {/* TOP ROW: Tone Type Icons (Selected has title, unselected is ONLY icon) */}
                  <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--border)]">
                    {/* 1. Pure Tone Option */}
                    <button
                      type="button"
                      onClick={selectPureTone}
                      title={isEnglish ? 'Pure Tone' : 'Tom Puro'}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                        selectedToneType === 'pureTone'
                          ? 'text-blue-500 font-semibold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <Radio size={18} />
                      {selectedToneType === 'pureTone' && (
                        <span>{isEnglish ? 'Pure Tone' : 'Tom Puro'}</span>
                      )}
                    </button>

                    {/* 2. Binaural Option */}
                    <button
                      type="button"
                      onClick={selectBinaural}
                      title={isEnglish ? 'Binaural' : 'Binaural'}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                        selectedToneType === 'binaural'
                          ? 'text-blue-500 font-semibold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <Headphones size={18} />
                      {selectedToneType === 'binaural' && (
                        <span>{isEnglish ? 'Binaural' : 'Binaural'}</span>
                      )}
                    </button>

                    {/* 3. Noise Option */}
                    <button
                      type="button"
                      onClick={selectNoise}
                      title={isEnglish ? 'Noise' : 'Ruído'}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                        selectedToneType === 'noise'
                          ? 'text-blue-500 font-semibold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <Activity size={18} />
                      {selectedToneType === 'noise' && (
                        <span>{isEnglish ? 'Noise' : 'Ruído'}</span>
                      )}
                    </button>
                  </div>

                  {/* Empty state when no tone is selected / zerado */}
                  {selectedToneType === null && (
                    <div className="py-5 text-center text-xs font-mono text-[var(--text-secondary)]">
                      <p className="opacity-75">
                        {isEnglish
                          ? 'Select a track'
                          : 'Selecione uma faixa'}
                      </p>
                    </div>
                  )}

                  {/* 1. PURE TONE CONFIGURATION: Live Slider in front of configured Hz index up to 20kHz */}
                  {selectedToneType === 'pureTone' && (
                    <div className="space-y-3">
                      {/* Inline Slider in front of Hz index */}
                      <div className="flex items-center gap-3 pt-1">
                        <span className="font-bold text-blue-500 text-sm font-mono shrink-0 min-w-[70px]">
                          {pureToneFreq} Hz
                        </span>
                        <input
                          type="range"
                          min="20"
                          max="20000"
                          step="1"
                          value={pureToneFreq}
                          onChange={(e) => {
                            const hz = parseInt(e.target.value, 10);
                            setPureToneFreq(hz);
                            setPureToneActive(true);
                            setPureToneMuted(false);
                            setBinauralActive(false);
                            setNoiseActive(false);
                            if (!isPlaying) toggleMasterPlay();
                          }}
                          className="w-full h-1.5 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Waveform Icons below the slider */}
                      <div className="flex items-center justify-between pt-1">
                        {WAVE_SHAPES.map((shape) => {
                          const isSelected = pureToneWave === shape && pureToneActive;
                          const waveTitle = isEnglish ? WAVE_NAMES[shape].en : WAVE_NAMES[shape].pt;
                          return (
                            <button
                              key={shape}
                              type="button"
                              onClick={() => {
                                setPureToneWave(shape);
                                setPureToneActive(true);
                                setPureToneMuted(false);
                                setBinauralActive(false);
                                setNoiseActive(false);
                                if (!isPlaying) toggleMasterPlay();
                              }}
                              title={waveTitle}
                              className={`flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors cursor-pointer text-xs font-mono ${
                                isSelected
                                  ? 'text-blue-500 font-semibold'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                              }`}
                            >
                              <WaveIcon shape={shape} size={20} className={isSelected ? 'text-blue-500' : 'text-current'} />
                              {isSelected && <span>{waveTitle}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. BINAURAL CONFIGURATION: Catalogued presets + Custom L/R sliders up to 20kHz */}
                  {selectedToneType === 'binaural' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono px-1">
                        <span className="flex items-center gap-1">
                          <Headphones size={13} />
                          {isEnglish ? 'Ear Targets' : 'Distribuição Fone'}
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">L (Esq) / R (Dir)</span>
                      </div>

                      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {BINAURAL_TARGETS.map((t) => {
                          const isSelected = binauralTarget === t.id && binauralActive;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setBinauralTarget(t.id);
                                setBinauralLeft(t.leftHz);
                                setBinauralRight(t.rightHz);
                                setBinauralActive(true);
                                setBinauralMuted(false);
                                setPureToneActive(false);
                                setNoiseActive(false);
                                if (!isPlaying) toggleMasterPlay();
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
                            Δ {Math.abs(binauralRight - binauralLeft).toFixed(1)} Hz
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
                            value={binauralLeft}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setBinauralLeft(val);
                              setBinauralTarget('custom');
                              setBinauralActive(true);
                              setBinauralMuted(false);
                              setPureToneActive(false);
                              setNoiseActive(false);
                              if (!isPlaying) toggleMasterPlay();
                            }}
                            className="w-full h-1.5 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                          />
                          <span className="font-bold text-blue-500 text-xs font-mono shrink-0 min-w-[65px] text-right">
                            {binauralLeft} Hz
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
                            value={binauralRight}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setBinauralRight(val);
                              setBinauralTarget('custom');
                              setBinauralActive(true);
                              setBinauralMuted(false);
                              setPureToneActive(false);
                              setNoiseActive(false);
                              if (!isPlaying) toggleMasterPlay();
                            }}
                            className="w-full h-1.5 bg-[var(--surface-2)] accent-blue-500 rounded-lg cursor-pointer"
                          />
                          <span className="font-bold text-blue-500 text-xs font-mono shrink-0 min-w-[65px] text-right">
                            {binauralRight} Hz
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. NOISE CONFIGURATION: Live Noise selection */}
                  {selectedToneType === 'noise' && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-[var(--text-secondary)] font-mono">
                        {isEnglish ? 'Noise Spectrum' : 'Espectro de Ruído'}
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
                        {NOISE_LIST.map((n) => {
                          const isSelected = noiseType === n.id && noiseActive;
                          return (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => {
                                setNoiseType(n.id);
                                setNoiseActive(true);
                                setNoiseMuted(false);
                                setPureToneActive(false);
                                setBinauralActive(false);
                                if (!isPlaying) toggleMasterPlay();
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                                isSelected
                                  ? 'text-blue-500 font-bold bg-blue-500/10'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                              }`}
                            >
                              <div>
                                <div>{n.namePt}</div>
                                <div className="text-[10px] text-[var(--text-tertiary)] font-mono font-normal">
                                  {n.desc}
                                </div>
                              </div>
                              {isSelected && <Check size={14} className="shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* =================================================== */}
                  {/* BOTTOM MENU: CENTERED TIMER (+10m / ∞)             */}
                  {/* =================================================== */}
                  <div className="border-t border-[var(--border)] pt-2.5 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleIncrementTimer}
                      title={isEnglish ? 'Timer duration (+10m / ∞)' : 'Duração do temporizador (+10m / ∞)'}
                      className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)] hover:text-blue-500 py-1 px-3 rounded-full hover:bg-[var(--surface-2)] transition-colors cursor-pointer active:scale-95"
                    >
                      <Clock size={14} className="text-blue-500" />
                      <span className="font-semibold text-blue-500">
                        {timerMinutes === 'infinite' ? '∞' : `${timerMinutes}m`}
                      </span>
                      <Plus size={12} className="text-[var(--text-tertiary)] hover:text-blue-500" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT: TIMER (SUMMATION & LIVE) + VOLUME + SLIDERS        */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Timer: Live counter when inactive, transforms into [+10m / ∞] config on click and auto-reverts after 3.5s */}
          <div className="relative flex items-center">
            <AnimatePresence mode="wait">
              {!isTimerEditing ? (
                <motion.button
                  key="live-timer-counter"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  id="btn-fixed-timer-selector"
                  onClick={handleIncrementTimer}
                  title={isEnglish ? 'Add Time (+10m / ∞)' : 'Configurar / Somar Tempo (+10m / ∞)'}
                  aria-label="Temporizador"
                  className={`flex items-center gap-1 text-xs font-mono p-1 transition-colors cursor-pointer active:scale-95 ${
                    !hasActiveAudio
                      ? 'text-[var(--text-tertiary)] opacity-60'
                      : isPlaying
                      ? 'text-blue-500 font-bold'
                      : 'text-[var(--text-secondary)] opacity-70'
                  }`}
                >
                  <Clock size={13} className="shrink-0" />
                  <span>
                    {!hasActiveAudio
                      ? '00:00'
                      : formatCounterTime(elapsedSeconds)}
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  key="timer-sum-editor"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={handleIncrementTimer}
                  title={isEnglish ? 'Click to add +10m' : 'Clique para somar +10m'}
                  className="flex items-center gap-1 font-mono text-xs text-blue-500 font-bold p-1 transition-colors cursor-pointer active:scale-95"
                >
                  <Clock size={13} />
                  <span>{timerMinutes === 'infinite' ? '∞' : `${timerMinutes}m`}</span>
                  <Plus size={12} className="text-[var(--text-secondary)]" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Volume Control: Standard icon transforms to [-] XX% [+] and auto-reverts after 4s */}
          <div className="relative flex items-center">
            <AnimatePresence mode="wait">
              {!isVolumeEditing ? (
                <motion.button
                  key="volume-icon"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={handleStartVolumeEdit}
                  title={isEnglish ? 'Adjust Volume' : 'Ajustar Volume'}
                  aria-label="Volume"
                  className="text-[var(--text-secondary)] hover:text-[var(--foreground)] p-1 transition-colors cursor-pointer active:scale-95"
                >
                  {masterVolume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </motion.button>
              ) : (
                <motion.div
                  key="volume-editor"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-0.5 font-mono text-xs text-[var(--foreground)]"
                >
                  {/* Minus button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMasterVolume(Math.max(0, Math.round((masterVolume - 0.1) * 10) / 10));
                      resetVolumeTimer();
                    }}
                    title={isEnglish ? 'Decrease Volume' : 'Diminuir Volume'}
                    aria-label="Diminuir Volume"
                    className="p-1 text-[var(--text-secondary)] hover:text-blue-500 transition-colors cursor-pointer active:scale-90"
                  >
                    <Minus size={13} />
                  </button>

                  {/* Percentage index readout */}
                  <span className="font-bold min-w-[32px] text-center select-none text-blue-500 text-xs">
                    {Math.round(masterVolume * 100)}%
                  </span>

                  {/* Plus button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMasterVolume(Math.min(1, Math.round((masterVolume + 0.1) * 10) / 10));
                      resetVolumeTimer();
                    }}
                    title={isEnglish ? 'Increase Volume' : 'Aumentar Volume'}
                    aria-label="Aumentar Volume"
                    className="p-1 text-[var(--text-secondary)] hover:text-blue-500 transition-colors cursor-pointer active:scale-90"
                  >
                    <Plus size={13} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Drawer Button (Track Preview, Queue & Mixer) */}
          <button
            type="button"
            id="btn-fixed-open-studio-specifications"
            onClick={toggleConfigDrawer}
            title={isEnglish ? 'Specifications' : 'Especificações'}
            aria-label="Especificações"
            className={`p-1 transition-colors cursor-pointer active:scale-95 ${
              isConfigDrawerOpen
                ? 'text-blue-500'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            <Sliders size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
