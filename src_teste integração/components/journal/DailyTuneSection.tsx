import React, { useState, useEffect, useRef } from 'react';
import { useNeuroAudio } from '../../context/NeuroAudioContext';
import { WaveIcon } from '../neuroacustica/WaveIcon';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Timer,
  Sliders,
  RefreshCw,
} from 'lucide-react';

type WaveType = 'sine' | 'triangle' | 'sawtooth' | 'square';

const WAVE_ORDER: WaveType[] = ['sine', 'triangle', 'sawtooth', 'square'];

const FREQUENCY_MEANINGS: Record<number, { title: string; titleEn: string }> = {
  174: { title: 'Alívio & Segurança Natural', titleEn: 'Natural Relief & Grounding' },
  285: { title: 'Regeneração & Vitalidade', titleEn: 'Renewal & Vitality' },
  396: { title: 'Liberação de Medos & Bloqueios', titleEn: 'Release of Fears & Obstacles' },
  432: { title: 'Harmonia & Clareza Mental', titleEn: 'Mental Harmony & Clarity' },
  528: { title: 'Foco, DNA & Transformação', titleEn: 'Focus & Transformation' },
  639: { title: 'Conexão Emocional & Vínculos', titleEn: 'Emotional Connection & Bonds' },
  741: { title: 'Intuição & Solução de Problemas', titleEn: 'Intuition & Problem Solving' },
  852: { title: 'Despertar Espiritual & Insight', titleEn: 'Spiritual Awakening & Insight' },
  963: { title: 'Consciência Pura & Presença', titleEn: 'Pure Consciousness & Presence' },
};

type Props = {
  isEnglish: boolean;
};

export function DailyTuneSection({ isEnglish }: Props) {
  const neuroAudio = useNeuroAudio();

  const [frequency, setFrequency] = useState<number>(432);
  const [waveType, setWaveType] = useState<WaveType>('sine');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [timerMinutes, setTimerMinutes] = useState<number>(20);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20 * 60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [backgroundPlay, setBackgroundPlay] = useState<boolean>(true);

  // Popovers for bottom inline controls
  const [activePopover, setActivePopover] = useState<'volume' | 'timer' | 'hertz' | null>(null);

  // Floating widget position and scroll tracking
  const [isScrolledPast, setIsScrolledPast] = useState<boolean>(false);
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number }>({ x: 24, y: 80 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 24,
    posY: 80,
  });

  const sectionRef = useRef<HTMLElement | null>(null);

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Pause DailyTune if Studio Audio begins playing
  useEffect(() => {
    const handlePauseDaily = () => {
      stopSynth();
    };
    window.addEventListener('orb-pause-daily-tune', handlePauseDaily);
    return () => window.removeEventListener('orb-pause-daily-tune', handlePauseDaily);
  }, []);

  // Track scroll to show floating mini-player when scrolled past
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      setIsScrolledPast(rect.bottom < 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dragging handlers for floating mini player
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: floatingPos.x,
      posY: floatingPos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    setFloatingPos({
      x: Math.max(10, Math.min(window.innerWidth - 130, dragStartRef.current.posX - deltaX)),
      y: Math.max(70, Math.min(window.innerHeight - 60, dragStartRef.current.posY + deltaY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Start audio synthesis
  const startSynth = () => {
    try {
      // Pause Studio background audio so it transitions to inactive appearance
      if (neuroAudio.isPlaying) {
        neuroAudio.pausePlayback();
      }

      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        void audioCtxRef.current.resume();
      }

      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);

      const targetGain = Math.min(Math.max(volume, 0), 1) * 0.08;
      gain.gain.setValueAtTime(targetGain, audioCtxRef.current.currentTime);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;

      setIsPlaying(true);
      setIsTimerActive(true);
    } catch (err) {
      console.warn('Daily Tune Web Audio start error:', err);
    }
  };

  const stopSynth = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlaying(false);
    } catch (err) {
      console.warn('Daily Tune Web Audio stop error:', err);
    }
  };

  // Sync with OS / Mobile MediaSession
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      if (isPlaying) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `${frequency}Hz (${waveType}) • Sintonia`,
            artist: 'ORB Sintonia do Momento',
            album: 'Painel Central',
            artwork: [
              { src: '/icon.png', sizes: '192x192', type: 'image/png' },
              { src: '/icon.png', sizes: '512x512', type: 'image/png' },
            ],
          });
          navigator.mediaSession.playbackState = 'playing';

          navigator.mediaSession.setActionHandler('play', () => startSynth());
          navigator.mediaSession.setActionHandler('pause', () => stopSynth());
          navigator.mediaSession.setActionHandler('stop', () => stopSynth());
        } catch (e) {
          console.warn('MediaSession DailyTune error:', e);
        }
      }
    }
  }, [isPlaying, frequency, waveType]);

  const togglePlayback = () => {
    if (isPlaying) {
      stopSynth();
    } else {
      startSynth();
    }
  };

  const cycleWaveType = () => {
    const nextIdx = (WAVE_ORDER.indexOf(waveType) + 1) % WAVE_ORDER.length;
    setWaveType(WAVE_ORDER[nextIdx]);
  };

  // React to wave type changes
  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.type = waveType;
    }
  }, [waveType]);

  // React to frequency changes
  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    }
  }, [frequency]);

  // React to volume changes
  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      const targetGain = Math.min(Math.max(volume, 0), 1) * 0.08;
      gainRef.current.gain.setValueAtTime(targetGain, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && isTimerActive && timerMinutes > 0 && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            stopSynth();
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isTimerActive, timerMinutes, secondsRemaining]);

  // Clean mathematical oscillator calculation in Brand Blue spectrum
  const calculateWaveY = (
    type: WaveType,
    normalizedAngle: number,
    centerY: number,
    amplitude: number
  ): number => {
    const angle = ((normalizedAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    switch (type) {
      case 'sine':
        return centerY + Math.sin(angle) * amplitude;
      case 'triangle': {
        const triVal = (2 / Math.PI) * Math.asin(Math.sin(angle));
        return centerY + triVal * amplitude;
      }
      case 'sawtooth': {
        const norm = angle / (Math.PI * 2);
        const sawVal = 2 * (norm - Math.floor(norm + 0.5));
        return centerY + sawVal * amplitude;
      }
      case 'square': {
        const s1 = Math.sin(angle);
        const s3 = (1 / 3) * Math.sin(3 * angle);
        const s5 = (1 / 5) * Math.sin(5 * angle);
        const s7 = (1 / 7) * Math.sin(7 * angle);
        const squareVal = (4 / Math.PI) * (s1 + s3 + s5 + s7) * 0.82;
        return centerY + squareVal * amplitude;
      }
      default:
        return centerY + Math.sin(angle) * amplitude;
    }
  };

  // Animated Waveform Visualizer strictly in Brand Blues & Transparencies
  useEffect(() => {
    let phase = 0;

    const renderWave = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          ctx.clearRect(0, 0, width, height);

          const centerY = height / 2;
          const amplitude = isPlaying
            ? Math.min(height * 0.32 * Math.max(volume, 0.4), height * 0.42)
            : 6;

          // Normalized spatial wavelength
          const visibleCycles = 3.4 + Math.log10(Math.max(frequency, 100) / 100) * 1.6;
          const spatialFrequency = (visibleCycles * Math.PI * 2) / width;

          // 1. Clean Subtle Background Depth
          if (isPlaying) {
            const ambientGrad = ctx.createLinearGradient(0, 0, 0, height);
            ambientGrad.addColorStop(0, 'rgba(59, 130, 246, 0.02)');
            ambientGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.06)');
            ambientGrad.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
            ctx.fillStyle = ambientGrad;
            ctx.fillRect(0, 0, width, height);
          }

          // 2. Primary Luminous Master Waveform - Faithful to current wave shape
          ctx.save();
          ctx.beginPath();
          ctx.lineWidth = isPlaying ? 2.2 : 1.4;

          const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
          if (isPlaying) {
            waveGrad.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
            waveGrad.addColorStop(0.2, 'rgba(59, 130, 246, 0.9)');
            waveGrad.addColorStop(0.5, 'rgba(96, 165, 250, 1.0)');
            waveGrad.addColorStop(0.8, 'rgba(59, 130, 246, 0.9)');
            waveGrad.addColorStop(1, 'rgba(59, 130, 246, 0.3)');
          } else {
            waveGrad.addColorStop(0, 'rgba(148, 163, 184, 0.2)');
            waveGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.45)');
            waveGrad.addColorStop(1, 'rgba(148, 163, 184, 0.2)');
          }

          ctx.strokeStyle = waveGrad;

          const step = 2;
          for (let x = 0; x <= width; x += step) {
            const normAngle = x * spatialFrequency + phase;
            const y = calculateWaveY(waveType, normAngle, centerY, amplitude);
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
          ctx.restore();
        }
      }

      // 3. Mini Floating Widget Canvas
      const miniCanvas = miniCanvasRef.current;
      if (miniCanvas) {
        const mctx = miniCanvas.getContext('2d');
        if (mctx) {
          const mw = miniCanvas.width;
          const mh = miniCanvas.height;
          mctx.clearRect(0, 0, mw, mh);
          mctx.lineWidth = 1.6;
          mctx.strokeStyle = isPlaying ? '#3b82f6' : 'rgba(148, 163, 184, 0.5)';
          mctx.beginPath();
          const mCenterY = mh / 2;
          const mAmplitude = isPlaying ? mh * 0.35 : 2;
          const mSpatialFreq = (3 * Math.PI * 2) / mw;

          for (let mx = 0; mx <= mw; mx += 1) {
            const mNormAngle = mx * mSpatialFreq + phase;
            const my = calculateWaveY(waveType, mNormAngle, mCenterY, mAmplitude);
            if (mx === 0) mctx.moveTo(mx, my);
            else mctx.lineTo(mx, my);
          }
          mctx.stroke();
        }
      }

      if (isPlaying) {
        phase += 0.05;
      } else {
        phase += 0.012;
      }

      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, waveType, frequency, volume]);

  // Handle Dynamic Resize for Full-Bleed Infinite Canvas with Device Pixel Ratio
  useEffect(() => {
    const updateCanvasWidth = () => {
      if (canvasRef.current) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const displayWidth = window.innerWidth || 1920;
        const displayHeight = 250;
        canvasRef.current.width = displayWidth * dpr;
        canvasRef.current.height = displayHeight * dpr;
        canvasRef.current.style.width = `${displayWidth}px`;
        canvasRef.current.style.height = `${displayHeight}px`;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
      }
    };
    updateCanvasWidth();
    window.addEventListener('resize', updateCanvasWidth);
    return () => window.removeEventListener('resize', updateCanvasWidth);
  }, []);

  // Clean up on unmount unless background play is active
  useEffect(() => {
    return () => {
      if (!backgroundPlay) {
        stopSynth();
      }
    };
  }, [backgroundPlay]);

  const timerDisplay =
    timerMinutes === 0
      ? '∞'
      : `${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(
          secondsRemaining % 60
        ).padStart(2, '0')}`;

  const setTimerPreset = (mins: number) => {
    setTimerMinutes(mins);
    setSecondsRemaining(mins * 60);
    setActivePopover(null);
  };

  const currentFrequencyInfo = FREQUENCY_MEANINGS[frequency] || {
    title: `${frequency} Hz Frequência`,
    titleEn: `${frequency} Hz Frequency`,
  };

  return (
    <>
      {/* Full-bleed Edge-to-Edge Web Sound Section */}
      <section
        ref={sectionRef}
        className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-7 my-4 bg-gradient-to-b from-[var(--background)] via-[var(--surface-2)]/30 to-[var(--background)] border-y border-[var(--border)]"
      >
        {/* Infinite Oscillation Canvas (vasando pelas laterais da tela) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none opacity-90"
        />

        {/* Content Container (Central Deck - strictly aligned to the content ruler) */}
        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-5">
          {/* Top Bar: Clean Title & Waveform Mode Selector */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                {isEnglish ? 'Tune of the Moment' : 'Sintonia do Momento'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                {isEnglish ? currentFrequencyInfo.titleEn : currentFrequencyInfo.title}
              </p>
            </div>

            {/* Waveform Selector - Dedicated icon matching current wave shape */}
            <button
              type="button"
              onClick={cycleWaveType}
              title={isEnglish ? 'Click to change waveform' : 'Clique para alternar forma de onda'}
              className="flex items-center gap-1.5 rounded-full bg-[var(--background)]/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-medium uppercase text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <WaveIcon shape={waveType} size={14} className="text-[var(--accent)]" />
              <span>{waveType}</span>
              <RefreshCw size={10} className="text-[var(--text-tertiary)] ml-0.5" />
            </button>
          </div>

          {/* Center Stage: Clean Sound Player */}
          <div className="flex flex-col items-center justify-center pt-3 pb-1 space-y-5">
            {/* Master Play / Pause Control */}
            <div className="relative group flex items-center justify-center">
              {/* Succinct Pulsating Sphere - Only active when idle to invite the user */}
              {!isPlaying && (
                <>
                  <div className="absolute h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-blue-500/10 animate-pulse pointer-events-none" />
                  <div className="absolute h-18 w-18 sm:h-22 sm:w-22 rounded-full border border-blue-500/25 opacity-70 animate-ping [animation-duration:3s] pointer-events-none" />
                </>
              )}

              <button
                type="button"
                onClick={togglePlayback}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className={`relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full transition-all duration-300 transform active:scale-95 cursor-pointer select-none ${
                  isPlaying
                    ? 'bg-transparent text-white border-0 shadow-none ring-0 hover:opacity-90'
                    : 'bg-transparent hover:bg-blue-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-400 hover:border-blue-400/60 shadow-xs'
                }`}
              >
                {/* When playing: Bare pause icon on preview background with an almost imperceptible subtle blue radial gradient axis for legibility */}
                {isPlaying ? (
                  <>
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none opacity-40"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(15, 23, 42, 0.25) 0%, rgba(30, 58, 138, 0.08) 50%, transparent 75%)',
                      }}
                    />
                    <Pause size={28} className="relative z-10 fill-white text-white drop-shadow-xs" />
                  </>
                ) : (
                  <Play size={28} className="relative z-10 ml-1 fill-current" />
                )}
              </button>
            </div>

            {/* Bottom Integrated HUD Console - Compact Original Size (Volume, Timer, Hertz) */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3">
              {/* 1. Volume Control */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActivePopover(activePopover === 'volume' ? null : 'volume')}
                  className={`flex items-center gap-1.5 rounded-full bg-[var(--background)]/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-medium border transition-all shadow-xs ${
                    activePopover === 'volume'
                      ? 'text-[var(--foreground)] border-[var(--accent)] ring-1 ring-[var(--accent)]/30'
                      : 'text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                  }`}
                  title={isEnglish ? 'Adjust volume' : 'Ajustar volume'}
                >
                  {volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} className="text-[var(--accent)]" />}
                  <span>{Math.round(volume * 100)}%</span>
                </button>

                {/* Volume Popover */}
                {activePopover === 'volume' && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-40 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 shadow-xl animate-in fade-in">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] mb-1.5">
                      <span>VOLUME</span>
                      <span className="font-bold text-[var(--foreground)]">{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-2)] accent-[var(--accent)]"
                    />
                  </div>
                )}
              </div>

              {/* 2. Timer Control */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActivePopover(activePopover === 'timer' ? null : 'timer')}
                  className={`flex items-center gap-1.5 rounded-full bg-[var(--background)]/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-medium border transition-all shadow-xs ${
                    activePopover === 'timer'
                      ? 'text-[var(--foreground)] border-[var(--accent)] ring-1 ring-[var(--accent)]/30'
                      : 'text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                  }`}
                  title={isEnglish ? 'Adjust timer' : 'Ajustar temporizador'}
                >
                  <Timer size={13} className="text-[var(--accent)]" />
                  <span>{timerDisplay}</span>
                </button>

                {/* Timer Popover */}
                {activePopover === 'timer' && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-xl animate-in fade-in whitespace-nowrap">
                    {[10, 20, 30, 45, 0].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setTimerPreset(mins)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          timerMinutes === mins
                            ? 'bg-[var(--accent)] text-white font-semibold'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                        }`}
                      >
                        {mins === 0 ? '∞' : `${mins}m`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Hertz (Frequency) Fine Tune */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActivePopover(activePopover === 'hertz' ? null : 'hertz')}
                  className={`flex items-center gap-1.5 rounded-full bg-[var(--background)]/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-bold border transition-all shadow-xs ${
                    activePopover === 'hertz'
                      ? 'text-[var(--foreground)] border-[var(--accent)] ring-1 ring-[var(--accent)]/30'
                      : 'text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                  }`}
                  title={isEnglish ? 'Fine tune frequency' : 'Ajuste fino de frequência'}
                >
                  <Sliders size={13} className="text-[var(--accent)]" />
                  <span>{frequency} Hz</span>
                </button>

                {/* Hertz & Background Play Popover */}
                {activePopover === 'hertz' && (
                  <div className="absolute bottom-10 right-0 sm:left-1/2 sm:-translate-x-1/2 z-30 w-60 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 shadow-xl space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[var(--text-secondary)] uppercase">
                        {isEnglish ? 'Frequency' : 'Frequência'}
                      </span>
                      <span className="font-bold text-[var(--foreground)]">{frequency} Hz</span>
                    </div>

                    {/* Slider */}
                    <input
                      type="range"
                      min="20"
                      max="20000"
                      step="1"
                      value={frequency}
                      onChange={(e) => setFrequency(parseInt(e.target.value, 10))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-2)] accent-[var(--accent)]"
                    />

                    {/* Background Play Toggle */}
                    <div className="border-t border-[var(--border)] pt-2">
                      <label className="flex items-center justify-between cursor-pointer select-none text-xs">
                        <span className="text-[var(--text-secondary)]">
                          {isEnglish ? 'Background Play' : 'Tocar em 2º plano'}
                        </span>
                        <input
                          type="checkbox"
                          checked={backgroundPlay}
                          onChange={(e) => setBackgroundPlay(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-[var(--border)] accent-[var(--accent)]"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Draggable Mini Player Widget when playing & scrolled past */}
      {isPlaying && isScrolledPast && (
        <div
          style={{
            position: 'fixed',
            right: `${floatingPos.x}px`,
            top: `${floatingPos.y}px`,
            zIndex: 40,
            touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex items-center gap-2 select-none cursor-grab active:cursor-grabbing px-2.5 py-1.5 rounded-full backdrop-blur-md bg-[var(--background)]/85 border border-blue-500/30 shadow-lg animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Animated Mini Wave Canvas */}
          <div className="w-10 h-5 flex items-center justify-center overflow-hidden pointer-events-none">
            <canvas ref={miniCanvasRef} width={40} height={20} className="w-full h-full" />
          </div>

          <span className="text-[10px] font-mono font-bold text-[var(--foreground)] pointer-events-none">
            {frequency}Hz
          </span>

          {/* Discreet Play / Pause Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayback();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-500 border border-blue-400/30 transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? <Pause size={10} /> : <Play size={10} className="ml-0.5" />}
          </button>
        </div>
      )}
    </>
  );
}
