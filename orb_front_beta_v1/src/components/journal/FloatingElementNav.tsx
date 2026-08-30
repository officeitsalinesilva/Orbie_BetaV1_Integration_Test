import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GripVertical } from 'lucide-react';
import {
  ELEMENTS_CALIBRATION_DATA,
  type ElementCalibrationData,
} from './ElementCalibrationSection';

type Props = {
  isEnglish: boolean;
  activeElementKey: 'fire' | 'earth' | 'air' | 'water';
  onSelectElement: (key: 'fire' | 'earth' | 'air' | 'water') => void;
};

export function FloatingElementNav({ isEnglish, activeElementKey, onSelectElement }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);

  // Sorted elements by ascendancy (highest average score first)
  const sortedElements = useMemo(() => {
    return [...ELEMENTS_CALIBRATION_DATA].sort((a, b) => {
      const avgA = a.subIndices.reduce((acc, curr) => acc + curr.value, 0) / a.subIndices.length;
      const avgB = b.subIndices.reduce((acc, curr) => acc + curr.value, 0) / b.subIndices.length;
      return avgB - avgA;
    });
  }, []);

  const resetHideTimer = (delay = 4000) => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      if (!isHovered && !isDragging) {
        setIsVisible(false);
      }
    }, delay);
  };

  // Scroll listener: strictly constrained to the metrics & calibration section
  useEffect(() => {
    const handleScroll = () => {
      const fieldDirectiveEl = document.getElementById('field-directive-block');
      const dayWindowsEl = document.getElementById('day-windows-section');
      const calibrationEl = document.getElementById('element-calibration-section');

      if (!fieldDirectiveEl) {
        setIsVisible(false);
        return;
      }

      const directiveRect = fieldDirectiveEl.getBoundingClientRect();
      // Must be at or below the "Diretriz do Campo" block (reached top of screen)
      const hasEnteredSection = directiveRect.top <= 140;

      // Check if we reached "Janelas do Dia" or if Calibration is almost done (80% scrolled)
      let hasExitedSection = false;
      if (dayWindowsEl) {
        const dayWindowsRect = dayWindowsEl.getBoundingClientRect();
        // If Janelas do dia is approaching the top (closer than 45% of viewport height)
        if (dayWindowsRect.top <= window.innerHeight * 0.45) {
          hasExitedSection = true;
        }
      } else if (calibrationEl) {
        const calibRect = calibrationEl.getBoundingClientRect();
        // If calibration section has passed off top by 80%
        if (calibRect.bottom <= window.innerHeight * 0.25) {
          hasExitedSection = true;
        }
      }

      const isInActiveZone = hasEnteredSection && !hasExitedSection;

      if (isInActiveZone) {
        setIsVisible(true);
        resetHideTimer(4000);
      } else {
        setIsVisible(false);
        if (hideTimeoutRef.current) {
          window.clearTimeout(hideTimeoutRef.current);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isHovered, isDragging]);

  const handleSelect = (key: 'fire' | 'earth' | 'air' | 'water') => {
    onSelectElement(key);
    resetHideTimer(4000);
  };

  return (
    <AnimatePresence>
      {(isVisible || isHovered || isDragging) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, x: 18 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.92, x: 18 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          drag
          dragMomentum={false}
          dragElastic={0.08}
          onDragStart={() => {
            setIsDragging(true);
            if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
          }}
          onDragEnd={() => {
            setIsDragging(false);
            resetHideTimer(4000);
          }}
          onMouseEnter={() => {
            setIsHovered(true);
            if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            resetHideTimer(4000);
          }}
          className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl bg-[var(--background)]/95 backdrop-blur-md border border-[var(--border)] shadow-lg shadow-black/10 select-none cursor-grab active:cursor-grabbing w-[34px]"
          style={{ touchAction: 'none' }}
        >
          {/* Subtle Drag Handle */}
          <div className="flex items-center justify-center text-[var(--text-tertiary)] py-0.5 opacity-50 hover:opacity-100 transition-opacity">
            <GripVertical size={11} />
          </div>

          {/* Vertical Stack of 4 Elements (Ascendancy Order, Index below selected) */}
          <div className="flex flex-col items-center gap-1 py-0.5 w-full">
            {sortedElements.map((elem, idx) => {
              const Icon = elem.icon;
              const isSelected = elem.key === activeElementKey;
              const isFirst = idx === 0;
              const avg = Math.round(
                elem.subIndices.reduce((acc, curr) => acc + curr.value, 0) / elem.subIndices.length
              );

              return (
                <button
                  key={elem.key}
                  type="button"
                  onClick={() => handleSelect(elem.key)}
                  title={`${isEnglish ? elem.nameEn : elem.name} (${avg}%)`}
                  className={`relative flex flex-col items-center justify-center w-7 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--surface-2)] text-[var(--accent)] py-1 shadow-xs border border-[var(--accent)]/30'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]/40 h-7'
                  }`}
                >
                  <Icon size={14} />
                  {isSelected && (
                    <span className="text-[8px] font-mono font-bold text-[var(--accent)] leading-none mt-0.5">
                      {avg}%
                    </span>
                  )}
                  {isFirst && !isSelected && (
                    <span className="absolute top-0.5 right-0.5 flex h-1 w-1 rounded-full bg-[var(--accent)]" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
