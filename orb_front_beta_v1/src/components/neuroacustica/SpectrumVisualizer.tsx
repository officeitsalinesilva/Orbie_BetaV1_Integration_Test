import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../lib/audioEngine';

type Props = {
  isPlaying: boolean;
  colorHex?: string;
};

export function SpectrumVisualizer({ isPlaying, colorHex = '#6366F1' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isPlaying && analyser) {
        analyser.getByteFrequencyData(dataArray);
      }

      const barCount = 28;
      const barWidth = Math.max(2, (width / barCount) - 3);
      let x = (width - (barCount * (barWidth + 3))) / 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;

        if (isPlaying) {
          const dataIdx = Math.floor((i / barCount) * (bufferLength / 2));
          const val = dataArray[dataIdx] || 0;
          barHeight = Math.max(4, (val / 255) * (height - 8));
        } else {
          barHeight = 3;
        }

        const y = (height - barHeight) / 2;

        ctx.fillStyle = isPlaying ? colorHex : 'rgba(150, 150, 150, 0.25)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();

        x += barWidth + 3;
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, colorHex]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={48}
      className="w-full max-w-[280px] h-12 rounded-lg pointer-events-none"
    />
  );
}
