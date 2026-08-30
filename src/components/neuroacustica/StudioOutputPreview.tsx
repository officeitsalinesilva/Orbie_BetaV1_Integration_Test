import React, { useRef, useEffect, useState } from 'react';
import {
  useNeuroAudio,
  CROMOTHERAPY_COLORS,
  WaveShape,
} from '../../context/NeuroAudioContext';
import { KaleidoscopeCanvas } from './KaleidoscopeCanvas';
import {
  Maximize2,
  Minimize2,
  Radio,
  Sparkles,
  Waves,
  Sun,
  Activity,
  Sliders,
  AudioLines,
  Edit3,
  Palette,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Props = {
  isEnglish?: boolean;
};

const WAVE_CYCLE: WaveShape[] = ['sine', 'triangle', 'sawtooth', 'square'];

export function StudioOutputPreview({ isEnglish }: Props) {
  const {
    isPlaying,
    visualMode,
    setVisualMode,
    previewHeight,
    setPreviewHeight,
    pureToneActive,
    pureToneMuted,
    pureToneFreq,
    pureToneWave,
    setPureToneWave,
    binauralActive,
    binauralMuted,
    binauralLeft,
    binauralRight,
    binauralTarget,
    noiseActive,
    noiseMuted,
    noiseType,
    cromoSelectedColor,
    setCromoSelectedColor,
    cromoMode,
    kaleidoSymmetry,
    kaleidoSpeed,
    kaleidoDensity,
    masterVolume,
  } = useNeuroAudio();

  const [isVisualEditOpen, setIsVisualEditOpen] = useState<boolean>(false);
  const editDropdownRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Close visual edit dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editDropdownRef.current && !editDropdownRef.current.contains(e.target as Node)) {
        setIsVisualEditOpen(false);
      }
    };
    if (isVisualEditOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisualEditOpen]);

  // Height mapping in pixels / Tailwind classes
  const heightClasses = {
    compact: 'h-48 sm:h-56',
    medium: 'h-64 sm:h-72',
    expanded: 'h-80 sm:h-96 md:h-[440px]',
    fullscreen: 'h-[calc(100vh-180px)]',
  };

  // Cycle Cromotherapy Colors sequentially
  const handleCycleColor = () => {
    const currentIndex = CROMOTHERAPY_COLORS.findIndex((c) => c.id === cromoSelectedColor.id);
    const nextIndex = (currentIndex + 1) % CROMOTHERAPY_COLORS.length;
    setCromoSelectedColor(CROMOTHERAPY_COLORS[nextIndex]);
    if (visualMode !== 'cromotherapy') {
      setVisualMode('cromotherapy');
    }
  };

  // Cycle Waveform Shape sequentially
  const handleCycleWaveShape = () => {
    const currentIndex = WAVE_CYCLE.indexOf(pureToneWave);
    const nextIndex = (currentIndex + 1) % WAVE_CYCLE.length;
    setPureToneWave(WAVE_CYCLE[nextIndex]);
    if (visualMode !== 'standard') {
      setVisualMode('standard');
    }
  };

  // Toggle Kaleidoscope
  const handleToggleKaleido = () => {
    if (visualMode === 'kaleidoscope') {
      setVisualMode('standard');
    } else {
      setVisualMode('kaleidoscope');
    }
  };

  // Mathematical Waveform calculation identical to the initial screen model
  const calculateWaveY = (
    type: WaveShape,
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

  // Waveform Visualizer Canvas in Brand Blues (Exact initial screen model)
  useEffect(() => {
    if (visualMode !== 'standard') return;

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
            ? Math.min(height * 0.35 * Math.max(masterVolume, 0.4), height * 0.44)
            : 6;

          // Normalized spatial wavelength
          const effectiveFreq = pureToneActive && !pureToneMuted
            ? pureToneFreq
            : binauralActive && !binauralMuted
            ? 300
            : 432;

          const visibleCycles = 3.4 + Math.log10(Math.max(effectiveFreq, 100) / 100) * 1.6;
          const spatialFrequency = (visibleCycles * Math.PI * 2) / width;

          // 1. Ambient Radial Glow Stage in Brand Blues
          if (isPlaying) {
            const glowGrad = ctx.createRadialGradient(
              width / 2,
              centerY,
              10,
              width / 2,
              centerY,
              width * 0.45
            );
            glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.16)');
            glowGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.06)');
            glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glowGrad;
            ctx.fillRect(0, 0, width, height);

            // Ambient Echo Wave 1 (Translucent Blue)
            ctx.beginPath();
            ctx.lineWidth = 1.3;
            ctx.strokeStyle = 'rgba(96, 165, 250, 0.24)';
            for (let x = 0; x <= width; x += 3) {
              const normAngle = x * spatialFrequency * 0.75 + phase * 0.6;
              const y = calculateWaveY('sine', normAngle, centerY, amplitude * 0.45);
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Ambient Echo Wave 2 (Deep Cyan-Blue)
            ctx.beginPath();
            ctx.lineWidth = 1.1;
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.18)';
            for (let x = 0; x <= width; x += 3) {
              const normAngle = x * spatialFrequency * 1.2 - phase * 0.45;
              const y = calculateWaveY('sine', normAngle, centerY, amplitude * 0.32);
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Noise layer ripple if active
            if (noiseActive && !noiseMuted) {
              ctx.beginPath();
              ctx.lineWidth = 1.0;
              ctx.strokeStyle = 'rgba(147, 197, 253, 0.2)';
              for (let x = 0; x <= width; x += 4) {
                const noiseOffset = (Math.random() - 0.5) * 16;
                const normAngle = x * spatialFrequency + phase;
                const y = calculateWaveY(pureToneWave, normAngle, centerY, amplitude * 0.7) + noiseOffset;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }

          // 2. Primary Luminous Master Waveform in Pure Brand Blue Tones
          ctx.save();
          ctx.beginPath();
          ctx.lineWidth = isPlaying ? 2.4 : 1.4;

          const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
          if (isPlaying) {
            waveGrad.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
            waveGrad.addColorStop(0.3, 'rgba(96, 165, 250, 0.95)');
            waveGrad.addColorStop(0.5, 'rgba(147, 197, 253, 1.0)');
            waveGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.95)');
            waveGrad.addColorStop(1, 'rgba(37, 99, 235, 0.3)');
            ctx.shadowBlur = 14;
            ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
          } else {
            waveGrad.addColorStop(0, 'rgba(148, 163, 184, 0.2)');
            waveGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.45)');
            waveGrad.addColorStop(1, 'rgba(148, 163, 184, 0.2)');
          }

          ctx.strokeStyle = waveGrad;

          const step = 2;
          for (let x = 0; x <= width; x += step) {
            const normAngle = x * spatialFrequency + phase;
            let y = calculateWaveY(pureToneWave, normAngle, centerY, amplitude);

            // If binaural is active, add subtle interference beat
            if (binauralActive && !binauralMuted) {
              const beatDiff = Math.abs(binauralRight - binauralLeft);
              y += Math.sin(normAngle * 0.5 + phase * (beatDiff / 3)) * (amplitude * 0.2);
            }

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
  }, [
    isPlaying,
    visualMode,
    pureToneWave,
    pureToneFreq,
    pureToneActive,
    pureToneMuted,
    binauralActive,
    binauralMuted,
    binauralLeft,
    binauralRight,
    noiseActive,
    noiseMuted,
    masterVolume,
  ]);

  // Handle Dynamic Resize for Canvas
  useEffect(() => {
    const updateCanvasWidth = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const displayWidth = canvasRef.current.parentElement.clientWidth || 800;
        const displayHeight = canvasRef.current.parentElement.clientHeight || 300;
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
  }, [previewHeight, visualMode]);

  return (
    <div
      id="studio-output-preview-stage"
      className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 my-2"
    >
      {/* Visual Canvas Container (Full-bleed aesthetic within the card) */}
      <div
        className={`relative w-full ${heightClasses[previewHeight]} rounded-3xl overflow-hidden bg-gradient-to-b from-[var(--background)] via-[var(--surface-2)]/30 to-[var(--background)] border border-[var(--border)] shadow-md flex items-center justify-center transition-all duration-300`}
      >
        {/* ========================================================= */}
        {/* 1. TOP EDIT CONTROLS: PURE ICON BUTTON (NO CONTAINER/MOCK) */}
        {/* ========================================================= */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2" ref={editDropdownRef}>
          {/* Bare Edit Icon Button (No background or container border!) */}
          <button
            type="button"
            id="btn-output-preview-edit"
            onClick={() => setIsVisualEditOpen((prev) => !prev)}
            title={isEnglish ? 'Edit visual output' : 'Editar visual do preview'}
            aria-label="Editar"
            className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors p-1.5 cursor-pointer active:scale-95"
          >
            <Edit3 size={18} />
          </button>

          {/* Floating Dropdown Box above/near Edit Button */}
          <AnimatePresence>
            {isVisualEditOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="absolute top-8 right-0 w-60 p-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl backdrop-blur-2xl z-50 flex flex-col gap-2"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] px-1">
                  {isEnglish ? 'Visual Customization' : 'Customização Visual'}
                </div>

                {/* Grid of Icon Controls for Instant Visual Cycling */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {/* 1. Cromoterapia Color Cycle Button */}
                  <button
                    type="button"
                    onClick={handleCycleColor}
                    title={isEnglish ? `Color: ${cromoSelectedColor.nameEn} (Click to cycle)` : `Cor: ${cromoSelectedColor.namePt} (Clique para alternar)`}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      visualMode === 'cromotherapy'
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-[var(--border)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-white/30 shadow-xs flex items-center justify-center"
                      style={{ backgroundColor: cromoSelectedColor.hex }}
                    >
                      <RefreshCw size={9} className="text-white drop-shadow-sm opacity-80" />
                    </div>
                    <span className="text-[9px] font-mono mt-1 text-[var(--text-secondary)] truncate w-full text-center">
                      {cromoSelectedColor.namePt}
                    </span>
                  </button>

                  {/* 2. Wave Shape Cycle Button */}
                  <button
                    type="button"
                    onClick={handleCycleWaveShape}
                    title={isEnglish ? `Wave: ${pureToneWave} (Click to cycle)` : `Onda: ${pureToneWave} (Clique para alternar)`}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      visualMode === 'standard'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[var(--border)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Waves size={16} className="text-blue-500" />
                    <span className="text-[9px] font-mono mt-1 text-[var(--text-secondary)] capitalize truncate w-full text-center">
                      {pureToneWave}
                    </span>
                  </button>

                  {/* 3. Kaleidoscope Mode Button */}
                  <button
                    type="button"
                    onClick={handleToggleKaleido}
                    title={isEnglish ? 'Kaleidoscope' : 'Caleidoscópio'}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      visualMode === 'kaleidoscope'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-[var(--border)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Sparkles size={16} className="text-purple-500" />
                    <span className="text-[9px] font-mono mt-1 text-[var(--text-secondary)] truncate w-full text-center">
                      Kaleido
                    </span>
                  </button>

                  {/* 4. Height Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (previewHeight === 'compact') setPreviewHeight('medium');
                      else if (previewHeight === 'medium') setPreviewHeight('expanded');
                      else if (previewHeight === 'expanded') setPreviewHeight('compact');
                      else setPreviewHeight('medium');
                    }}
                    title={isEnglish ? 'Toggle Height' : 'Alterar Altura'}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
                  >
                    {previewHeight === 'expanded' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    <span className="text-[9px] font-mono mt-1 text-[var(--text-secondary)] truncate w-full text-center capitalize">
                      {previewHeight}
                    </span>
                  </button>
                </div>

                {/* Visual Mode Quick Switch Tab */}
                <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 text-[10px] font-mono text-[var(--text-secondary)]">
                  <span>Modo:</span>
                  <span className="font-bold text-[var(--foreground)] uppercase">{visualMode}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================= */}
        {/* 2. VISUAL CANVAS STAGES                                   */}
        {/* ========================================================= */}

        {/* 1. STANDARD OSCILLOSCOPE WAVEFORM (INITIAL SCREEN MODEL) */}
        {visualMode === 'standard' && (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover pointer-events-none"
          />
        )}

        {/* 2. CROMOTHERAPY AURA MODE */}
        {visualMode === 'cromotherapy' && (
          <div
            className="w-full h-full relative flex items-center justify-center transition-all duration-700 overflow-hidden"
            style={{
              background:
                cromoMode === 'gradient'
                  ? `radial-gradient(circle at center, ${cromoSelectedColor.hex}33 0%, var(--background) 80%)`
                  : cromoSelectedColor.hex,
            }}
          >
            {/* Animated breathing aura */}
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.18, 1] : 1,
                opacity: isPlaying ? [0.65, 0.95, 0.65] : 0.4,
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full blur-3xl"
              style={{
                backgroundColor: cromoSelectedColor.hex,
                mixBlendMode: 'screen',
              }}
            />

            {/* Center Info Tag */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
              <span className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white drop-shadow-md">
                {isEnglish ? cromoSelectedColor.nameEn : cromoSelectedColor.namePt}
              </span>
              <span className="mt-2 text-xs sm:text-sm font-mono text-white/90 bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                {cromoSelectedColor.wavelength} • {isEnglish ? cromoSelectedColor.benefitEn : cromoSelectedColor.benefitPt}
              </span>
            </div>
          </div>
        )}

        {/* 3. KALEIDOSCOPE VISUAL MODE */}
        {visualMode === 'kaleidoscope' && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <KaleidoscopeCanvas
              symmetry={kaleidoSymmetry}
              speed={kaleidoSpeed}
              density={kaleidoDensity}
              primaryColor={cromoSelectedColor.hex}
              isPlaying={isPlaying}
            />
          </div>
        )}
      </div>
    </div>
  );
}
