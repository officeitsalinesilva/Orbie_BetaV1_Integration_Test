import React, { useRef, useEffect } from 'react';
import {
  useNeuroAudio,
  WaveShape,
} from '../../context/NeuroAudioContext';
import { KaleidoscopeCanvas } from './KaleidoscopeCanvas';

type Props = {
  isEnglish?: boolean;
};

export function FullscreenBackgroundVisualizer({ isEnglish }: Props) {
  const {
    isPlaying,
    visualMode,
    pureToneActive,
    pureToneMuted,
    pureToneFreq,
    pureToneWave,
    binauralActive,
    binauralMuted,
    noiseActive,
    noiseMuted,
    cromoSelectedColor,
    cromoIntensity,
    cromoMode,
    kaleidoSymmetry,
    kaleidoSpeed,
    kaleidoDensity,
    masterVolume,
  } = useNeuroAudio();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check if dark mode is active
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  // Compute effective opacity based on cromoIntensity (1: 0.15, 2: 0.30, 3: 0.45, 4: 0.60 - never 100% solid)
  // White has no intense background in light mode, and black has no intense background in dark mode
  let effectiveOpacity = 0.15 * Math.min(Math.max(cromoIntensity, 1), 4);
  if (!isDarkMode && (cromoSelectedColor.id === 'white' || cromoSelectedColor.hex.toLowerCase() === '#f8fafc')) {
    effectiveOpacity = 0.04;
  }
  if (isDarkMode && (cromoSelectedColor.id === 'black' || cromoSelectedColor.hex.toLowerCase() === '#090d16')) {
    effectiveOpacity = 0.04;
  }

  // Convert hex to rgba with alpha
  const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 59;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 130;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 246;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
            ? Math.min(height * 0.28 * Math.max(masterVolume, 0.4), height * 0.38)
            : 8;

          // Normalized spatial wavelength
          const effectiveFreq =
            pureToneActive && !pureToneMuted
              ? pureToneFreq
              : binauralActive && !binauralMuted
              ? 300
              : 432;

          const visibleCycles = 3.2 + Math.log10(Math.max(effectiveFreq, 100) / 100) * 1.5;
          const spatialFrequency = (visibleCycles * Math.PI * 2) / width;

          // 1. Clean Subtle Background Depth (No fake sine echoes)
          if (isPlaying) {
            const ambientGrad = ctx.createLinearGradient(0, 0, 0, height);
            ambientGrad.addColorStop(0, 'rgba(59, 130, 246, 0.02)');
            ambientGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
            ambientGrad.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
            ctx.fillStyle = ambientGrad;
            ctx.fillRect(0, 0, width, height);
          }

          const isNoiseOnly = noiseActive && !noiseMuted && (!pureToneActive || pureToneMuted) && (!binauralActive || binauralMuted);

          if (isNoiseOnly) {
            // Dedicated Noise Density / Spectrum Visualizer
            ctx.beginPath();
            ctx.lineWidth = isPlaying ? 1.8 : 1.0;
            ctx.strokeStyle = isPlaying ? 'rgba(45, 212, 191, 0.85)' : 'rgba(148, 163, 184, 0.4)';

            const noiseStep = 3;
            for (let x = 0; x <= width; x += noiseStep) {
              const seed = Math.sin(x * 0.05 + phase * 4) * Math.cos(x * 0.03 - phase * 3);
              const randomFactor = (Math.sin(x * 12.9898 + phase * 10) * 43758.5453) % 1;
              const yNoise = centerY + (seed * 0.6 + randomFactor * 0.4) * amplitude * 0.8;
              if (x === 0) ctx.moveTo(x, yNoise);
              else ctx.lineTo(x, yNoise);
            }
            ctx.stroke();
          } else {
            // Dedicated Faithful Waveform (Sine, Triangle, Sawtooth, Square)
            const currentWave = pureToneActive && !pureToneMuted ? pureToneWave : 'sine';

            ctx.beginPath();
            ctx.lineWidth = isPlaying ? 2.2 : 1.2;
            ctx.strokeStyle = isPlaying ? '#3B82F6' : 'rgba(148, 163, 184, 0.4)';

            for (let x = 0; x <= width; x += 2) {
              const normAngle = x * spatialFrequency + phase;
              const y = calculateWaveY(currentWave, normAngle, centerY, amplitude);
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }

          // Phase progression rate
          const speed = isPlaying ? 0.04 + (effectiveFreq / 1000) * 0.03 : 0.01;
          phase += speed;
        }
      }

      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    isPlaying,
    visualMode,
    pureToneActive,
    pureToneMuted,
    pureToneFreq,
    pureToneWave,
    binauralActive,
    binauralMuted,
    noiseActive,
    noiseMuted,
    masterVolume,
  ]);

  // Handle Dynamic Resize for Full-Screen Canvas
  useEffect(() => {
    const updateCanvasWidth = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const displayWidth = canvasRef.current.parentElement.clientWidth || window.innerWidth;
        const displayHeight = canvasRef.current.parentElement.clientHeight || window.innerHeight;
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
  }, [visualMode]);

  return (
    <div
      id="studio-fullscreen-background-visualizer"
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
    >
      {/* Simultaneous Atmospheric Color Diffusion (Active for Cromotherapy, Kaleidoscope and Ambient Intensity) */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${hexToRgba(cromoSelectedColor.hex, effectiveOpacity)} 0%, ${hexToRgba(cromoSelectedColor.hex, effectiveOpacity * 0.4)} 55%, transparent 85%)`,
        }}
      >
        {isPlaying && (
          <div
            className="absolute inset-0 animate-pulse duration-[4000ms]"
            style={{
              background: `radial-gradient(ellipse at center, ${hexToRgba(cromoSelectedColor.hex, effectiveOpacity * 0.6)} 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* 1. Standard Oscilloscope Wave Canvas (Brand Blues) */}
      {visualMode === 'standard' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />
      )}

      {/* 2. Kaleidoscope Mode (Full screen visual synthesis + Simultaneous Background Color) */}
      {visualMode === 'kaleidoscope' && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-85">
          <KaleidoscopeCanvas
            isPlaying={isPlaying}
            symmetry={kaleidoSymmetry}
            speed={kaleidoSpeed}
            density={kaleidoDensity}
            primaryColor={cromoSelectedColor.hex}
          />
        </div>
      )}
    </div>
  );
}
