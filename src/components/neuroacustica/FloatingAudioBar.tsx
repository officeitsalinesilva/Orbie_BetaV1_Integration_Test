import React from 'react';
import { useNeuroAudio } from '../../context/NeuroAudioContext';
import { WaveIcon } from './WaveIcon';
import { Play, Pause, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Props = {
  onOpenStudio: () => void;
  isEnglish?: boolean;
};

export function FloatingAudioBar({ onOpenStudio, isEnglish }: Props) {
  const {
    isPlaying,
    toggleMasterPlay,
    stopAll,
    pureToneActive,
    pureToneFreq,
    pureToneWave,
    binauralActive,
    binauralLeft,
    binauralRight,
    noiseActive,
    noiseType,
  } = useNeuroAudio();

  // The floating player must NOT appear unless audio is actively playing
  if (!isPlaying || (!pureToneActive && !binauralActive && !noiseActive)) {
    return null;
  }

  // Construct pure track name with no extra status text
  const activeLabels: string[] = [];
  if (pureToneActive) activeLabels.push(`${pureToneFreq}Hz (${pureToneWave})`);
  if (binauralActive) activeLabels.push(`Binaural ${Math.abs(binauralRight - binauralLeft)}Hz`);
  if (noiseActive) activeLabels.push(`Ruído ${noiseType}`);

  const trackName = activeLabels.join(' + ') || (isEnglish ? 'Neuroacoustic Studio' : 'Estúdio Neuroacústica');

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMasterPlay();
  };

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed bottom-6 right-6 z-40 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 select-none px-3 py-1.5 rounded-full backdrop-blur-xl bg-[var(--background)]/90 border border-[var(--border)] shadow-xl transition-all">
          {/* Left: Wave Icon */}
          <button
            type="button"
            onClick={onOpenStudio}
            title={isEnglish ? 'Open Studio' : 'Abrir Estúdio'}
            className="flex items-center gap-1.5 cursor-pointer text-blue-500 hover:text-blue-400 transition-colors shrink-0"
          >
            {pureToneActive ? (
              <WaveIcon shape={pureToneWave} size={15} className="text-blue-500" />
            ) : (
              <div className="flex items-end gap-0.5 h-3.5 w-3.5 pb-0.5">
                <span className="w-0.5 rounded-full bg-blue-500 h-3 animate-pulse" />
                <span className="w-0.5 rounded-full bg-blue-500 h-2 animate-pulse delay-75" />
                <span className="w-0.5 rounded-full bg-blue-500 h-3.5 animate-pulse delay-150" />
              </div>
            )}
          </button>

          {/* Center: Track Name only with clean ellipsis when overflow */}
          <button
            type="button"
            onClick={onOpenStudio}
            title={trackName}
            className="max-w-[130px] sm:max-w-[160px] overflow-hidden text-left cursor-pointer"
          >
            <span className="block text-[11px] font-mono font-medium text-[var(--foreground)] truncate">
              {trackName}
            </span>
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={handlePlayToggle}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pausar' : 'Tocar'}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
          >
            {isPlaying ? <Pause size={11} className="fill-current" /> : <Play size={11} className="ml-0.5 fill-current" />}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stopAll();
            }}
            aria-label="Fechar"
            title={isEnglish ? 'Close and stop player' : 'Fechar e parar player'}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
