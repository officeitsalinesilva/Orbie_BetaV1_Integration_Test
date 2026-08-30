import React from 'react';

type Props = {
  compact?: boolean;
  className?: string;
  size?: number;
  showText?: boolean;
};

/**
 * Official Orbie Brandmark
 * Gyroscopic / Armillary orbital sphere enclosing the central Orbie character
 * Transparent background, fully vector & theme-adaptive (currentColor)
 */
export function OrbBrand({ compact = false, className = '', size: customSize, showText = true }: Props) {
  const pixelSize = customSize ?? (compact ? 28 : 72);

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Orbie"
        className="text-[var(--foreground)] transition-transform duration-300 hover:rotate-3 shrink-0"
      >
        {/* ========================================================================= */}
        {/* GYROSCOPIC / ORBITAL SPHERE RINGS (Armillary Matrix)                      */}
        {/* ========================================================================= */}
        <g stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Main Equatorial Ring - 3D Perspective with Double Rim */}
          <ellipse cx="100" cy="100" rx="90" ry="24" transform="rotate(-5 100 100)" strokeWidth="6" />
          <ellipse cx="100" cy="100" rx="82" ry="18" transform="rotate(-5 100 100)" strokeWidth="3.5" opacity="0.9" />

          {/* Vertical Meridian Orbit */}
          <ellipse cx="100" cy="100" rx="36" ry="88" transform="rotate(8 100 100)" strokeWidth="5.5" />

          {/* Inclined Diagonal Ring 1 (Top-Left to Bottom-Right) */}
          <ellipse cx="100" cy="100" rx="55" ry="86" transform="rotate(-38 100 100)" strokeWidth="5.5" />

          {/* Inclined Diagonal Ring 2 (Top-Right to Bottom-Left) */}
          <ellipse cx="100" cy="100" rx="55" ry="86" transform="rotate(42 100 100)" strokeWidth="5.5" />

          {/* Outer Bounding Silhouette Arc */}
          <circle cx="100" cy="100" r="88" strokeWidth="2.5" opacity="0.3" strokeDasharray="6 6" />
        </g>

        {/* ========================================================================= */}
        {/* CENTRAL ORBIE CHARACTER (Droplet with Two Circular Eyes)                  */}
        {/* ========================================================================= */}
        <g transform="translate(100 100)">
          {/* Solid Droplet Head */}
          <path
            d="M 0 -22 C -11 -8, -18 4, -18 13 C -18 24, -10 32, 0 32 C 10 32, 18 24, 18 13 C 18 4, 11 -8, 0 -22 Z"
            fill="currentColor"
          />

          {/* Two Cutout Eyes (Contrasting) */}
          <circle cx="-6.5" cy="14" r="4" fill="var(--background, #ffffff)" />
          <circle cx="6.5" cy="14" r="4" fill="var(--background, #ffffff)" />
        </g>
      </svg>

      {!compact && showText && (
        <span className="font-display text-2xl sm:text-3xl font-bold tracking-tighter text-[var(--foreground)] lowercase">
          orbie
        </span>
      )}
    </div>
  );
}
