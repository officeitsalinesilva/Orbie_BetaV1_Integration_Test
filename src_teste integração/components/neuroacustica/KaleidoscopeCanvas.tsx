import React, { useEffect, useRef } from 'react';

type Props = {
  symmetry: number; // 4 - 12 segments
  speed: number;    // 1 - 10
  density: number;  // 1 - 10
  primaryColor: string;
  isPlaying: boolean;
};

export function KaleidoscopeCanvas({
  symmetry = 8,
  speed = 4,
  density = 6,
  primaryColor = '#6366F1',
  isPlaying = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const angleRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localAngle = angleRef.current;

    const render = () => {
      frameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 8;

      ctx.clearRect(0, 0, width, height);

      // Dark background circular container
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 14, 26, 0.95)';
      ctx.fill();
      ctx.clip();

      if (isPlaying) {
        localAngle += 0.003 * speed;
        angleRef.current = localAngle;
      }

      const slices = Math.max(4, Math.min(16, symmetry));
      const sliceAngle = (Math.PI * 2) / slices;

      for (let i = 0; i < slices; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(i * sliceAngle);

        if (i % 2 === 1) {
          ctx.scale(1, -1);
        }

        // Draw internal generative geometric mandalas
        for (let d = 1; d <= density; d++) {
          const r = (radius / (density + 1)) * d;
          const wobble = Math.sin(localAngle * 2 + d) * 12;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, r + wobble, 0, sliceAngle / 2);
          ctx.closePath();

          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.4 + (d / density) * 0.5;
          ctx.stroke();

          // Accent internal floating orbs
          const orbX = Math.cos(localAngle + d) * (r * 0.8);
          const orbY = Math.sin(localAngle + d) * (r * 0.8);
          ctx.beginPath();
          ctx.arc(orbX, orbY, 3 + (d % 3), 0, Math.PI * 2);
          ctx.fillStyle = primaryColor;
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();

      // Outer delicate neon border
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.restore();
    };

    render();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [symmetry, speed, density, primaryColor, isPlaying]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-full shadow-2xl transition-all"
      />
    </div>
  );
}
