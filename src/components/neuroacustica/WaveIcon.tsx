import React from 'react';
import { WaveShape } from '../../context/NeuroAudioContext';

type Props = {
  shape: WaveShape;
  className?: string;
  size?: number;
};

export function WaveIcon({ shape, className = 'text-current', size = 18 }: Props) {
  const s = size;
  const strokeWidth = 2;

  switch (shape) {
    case 'sine':
      // Smooth sinusoidal curve
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 12 C 5 4, 8 4, 12 12 C 16 20, 19 20, 22 12" />
        </svg>
      );

    case 'triangle':
      // Triangular wave (linear peaks and valleys)
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 12 L 7 5 L 17 19 L 22 12" />
        </svg>
      );

    case 'sawtooth':
      // Sawtooth wave (gradual ramp up, sharp drop down)
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 17 L 12 7 V 17 L 22 7" />
        </svg>
      );

    case 'square':
      // Square / pulse wave (perpendicular steps)
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 17 V 7 H 12 V 17 H 22" />
        </svg>
      );

    default:
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 12 C 5 4, 8 4, 12 12 C 16 20, 19 20, 22 12" />
        </svg>
      );
  }
}
