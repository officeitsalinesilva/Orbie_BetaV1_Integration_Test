import React, { useState } from 'react';
import { useNeuroAudio, CROMOTHERAPY_COLORS, WaveShape } from '../../context/NeuroAudioContext';
import { useOrb } from '../../context/OrbContext';
import { OrbTheme } from '../../types';
import { OrbBrand } from '../OrbBrand';
import { GoogleProfileAvatar } from '../common/GoogleProfileAvatar';
import { SystemSlideDrawer } from '../common/SystemSlideDrawer';
import { FullscreenBackgroundVisualizer } from './FullscreenBackgroundVisualizer';
import { StudioFixedPlayerBar } from './StudioFixedPlayerBar';
import { StudioConfigDrawer } from './StudioConfigDrawer';
import {
  ArrowLeft,
  AudioLines,
  Sparkles,
  Minus,
  Plus,
  Edit3,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Props = {
  onBack: () => void;
  onOpenProfile?: () => void;
  onOpenWallet?: () => void;
  onOpenNotifications?: () => void;
  onOpenDailyJournal?: () => void;
  onOpenCatalog?: () => void;
  onOpenChat?: () => void;
  onSignOut?: () => void;
  isEnglish?: boolean;
};

const WAVE_CYCLE: WaveShape[] = ['sine', 'triangle', 'sawtooth', 'square'];

const NOISE_LABELS: Record<string, { pt: string; en: string }> = {
  white: { pt: 'Ruído Branco', en: 'White Noise' },
  pink: { pt: 'Ruído Rosa', en: 'Pink Noise' },
  brown: { pt: 'Ruído Marrom', en: 'Ruído Marrom' },
  blue: { pt: 'Ruído Azul', en: 'Blue Noise' },
  violet: { pt: 'Ruído Violeta', en: 'Violet Noise' },
  grey: { pt: 'Ruído Cinza', en: 'Grey Noise' },
  rain: { pt: 'Chuva Suave', en: 'Gentle Rain' },
  ocean: { pt: 'Ondas do Oceano', en: 'Ocean Waves' },
};

export function NeuroacusticaView({
  onBack,
  onOpenProfile,
  onOpenWallet,
  onOpenNotifications,
  onOpenDailyJournal,
  onOpenCatalog,
  onOpenChat,
  onSignOut,
  isEnglish,
}: Props) {
  const { profile, userIdentity, preferences, savePreferences } = useOrb();
  const {
    pureToneActive,
    pureToneMuted,
    pureToneFreq,
    binauralActive,
    binauralMuted,
    binauralRight,
    binauralLeft,
    noiseActive,
    noiseMuted,
    noiseType,
    visualMode,
    setVisualMode,
    cromoSelectedColor,
    setCromoSelectedColor,
    cromoIntensity,
    setCromoIntensity,
  } = useNeuroAudio();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisualEditOpen, setIsVisualEditOpen] = useState(false);

  const name = profile?.preferredName || profile?.fullName?.split(' ')[0] || userIdentity?.name?.split(' ')[0] || (isEnglish ? 'User' : 'Usuário');
  const avatarLetter = (name || 'O').slice(0, 1).toUpperCase();

  const chooseTheme = (theme: OrbTheme) => {
    void savePreferences({ theme });
  };

  // Dynamic Screen Title formatted according to active audio track (e.g. "Ruído Marrom, 345hz, etc.")
  const getDynamicTitle = () => {
    const parts: string[] = [];

    if (noiseActive && !noiseMuted) {
      const nLabel = NOISE_LABELS[noiseType]
        ? isEnglish
          ? NOISE_LABELS[noiseType].en
          : NOISE_LABELS[noiseType].pt
        : `Ruído ${noiseType}`;
      parts.push(nLabel);
    }

    if (pureToneActive && !pureToneMuted) {
      parts.push(`${pureToneFreq}hz`);
    }

    if (binauralActive && !binauralMuted) {
      const diff = Math.abs(binauralRight - binauralLeft);
      parts.push(`Binaural ${diff}hz`);
    }

    if (parts.length > 0) {
      return parts.join(', ');
    }

    // Default fallback when quiet or starting
    return isEnglish ? '345hz' : '345hz';
  };

  // Visual Output Controls
  const handleCycleColor = () => {
    const currentIndex = CROMOTHERAPY_COLORS.findIndex((c) => c.id === cromoSelectedColor.id);
    const nextIndex = (currentIndex + 1) % CROMOTHERAPY_COLORS.length;
    setCromoSelectedColor(CROMOTHERAPY_COLORS[nextIndex]);
  };

  const handleDecreaseIntensity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCromoIntensity(Math.max(1, cromoIntensity - 1));
  };

  const handleIncreaseIntensity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCromoIntensity(Math.min(4, cromoIntensity + 1));
  };

  const handleToggleKaleido = () => {
    if (visualMode === 'kaleidoscope') setVisualMode('standard');
    else setVisualMode('kaleidoscope');
  };

  const INTENSITY_LABELS: Record<number, { pt: string; en: string }> = {
    1: { pt: 'Mínimo', en: 'Min' },
    2: { pt: 'Médio', en: 'Med' },
    3: { pt: 'Intenso', en: 'High' },
    4: { pt: 'Predominante', en: 'Max' },
  };

  return (
    <div
      id="neuroacoustics-studio-viewport"
      className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between overflow-hidden pb-24"
    >
      {/* ========================================================= */}
      {/* 1. FULL-SCREEN BACKGROUND OUTPUT PREVIEW (TOP TO BOTTOM)   */}
      {/* ========================================================= */}
      <FullscreenBackgroundVisualizer isEnglish={isEnglish} />

      {/* ========================================================= */}
      {/* 2. SYSTEM NAVBAR (PERSISTENT NAVBAR TO ALL SCREENS)       */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-lg px-4 sm:px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between relative">
          {/* Left: Original Fixed ORB Brand Logo */}
          <div className="flex items-center">
            <OrbBrand compact />
          </div>

          {/* Center: Current Screen Icon (Clean without mock container) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none text-[var(--accent)]">
            <AudioLines size={20} />
          </div>

          {/* Right: Profile Avatar Button (Opens System Drawer) */}
          <div className="flex items-center">
            <GoogleProfileAvatar
              profile={profile}
              name={name}
              onClick={() => setMenuOpen(true)}
              title={isEnglish ? 'Open menu' : 'Abrir menu'}
            />
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. SUB-NAVBAR HEADER AREA (BACK ARROW & DYNAMIC TITLE)    */}
      {/* ========================================================= */}
      <div className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-4 flex items-center justify-between">
        {/* Back Arrow positioned BELOW the navbar & BELOW the Orbie logo at extreme left */}
        <button
          type="button"
          id="btn-back-to-journal"
          onClick={onBack}
          aria-label={isEnglish ? 'Back' : 'Voltar'}
          title={isEnglish ? 'Back' : 'Voltar'}
          className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors p-1 -ml-1 cursor-pointer active:scale-95 flex items-center shrink-0"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Dynamic Track Format Title (e.g. "Ruído Marrom, 345hz, etc.") */}
        <div className="text-sm sm:text-base font-semibold font-mono tracking-tight text-[var(--foreground)] text-center truncate px-2">
          {getDynamicTitle()}
        </div>

        {/* Output Edit Button (Aligned to extreme right) */}
        <div className="relative shrink-0">
          <button
            type="button"
            id="btn-output-preview-edit"
            onClick={() => setIsVisualEditOpen((prev) => !prev)}
            title={isEnglish ? 'Edit visual output' : 'Editar visual do preview'}
            aria-label="Editar"
            className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors p-1 -mr-1 cursor-pointer active:scale-95"
          >
            <Edit3 size={19} />
          </button>

          {/* Floating Minimalist Box for Visual Customization (No mock container borders inside) */}
          <AnimatePresence>
            {isVisualEditOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                className="absolute top-8 right-0 p-2.5 rounded-2xl bg-[var(--surface)]/95 border border-[var(--border)] shadow-xl backdrop-blur-2xl z-50 flex items-center gap-3.5"
              >
                {/* 1. Color Intensity: Minus (-), Color Sphere, Plus (+) */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDecreaseIntensity}
                    disabled={cromoIntensity <= 1}
                    title={isEnglish ? 'Decrease Intensity' : 'Diminuir Intensidade'}
                    aria-label="-"
                    className="text-[var(--text-secondary)] hover:text-[var(--foreground)] disabled:opacity-20 disabled:cursor-not-allowed p-1 cursor-pointer transition-colors active:scale-90"
                  >
                    <Minus size={15} />
                  </button>

                  {/* Color Sphere (Illustrates color & cycles on click, no text title) */}
                  <button
                    type="button"
                    onClick={handleCycleColor}
                    title={isEnglish ? 'Cycle Color' : 'Alternar Cor'}
                    aria-label={cromoSelectedColor.namePt}
                    className="w-6 h-6 rounded-full border border-white/25 shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
                    style={{ backgroundColor: cromoSelectedColor.hex }}
                  />

                  <button
                    type="button"
                    onClick={handleIncreaseIntensity}
                    disabled={cromoIntensity >= 4}
                    title={isEnglish ? 'Increase Intensity' : 'Aumentar Intensidade'}
                    aria-label="+"
                    className="text-[var(--text-secondary)] hover:text-[var(--foreground)] disabled:opacity-20 disabled:cursor-not-allowed p-1 cursor-pointer transition-colors active:scale-90"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Subtle Divider */}
                <div className="h-4 w-px bg-[var(--border)] opacity-60" />

                {/* 2. Kaleidoscope Toggle Button (Inactive look without textual active/inactive title) */}
                <button
                  type="button"
                  onClick={handleToggleKaleido}
                  title={isEnglish ? 'Kaleidoscope' : 'Caleidoscópio'}
                  aria-label={isEnglish ? 'Kaleidoscope' : 'Caleidoscópio'}
                  className={`flex items-center gap-1.5 p-1 transition-colors cursor-pointer active:scale-95 ${
                    visualMode === 'kaleidoscope'
                      ? 'text-purple-400 font-medium'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--foreground)] opacity-70'
                  }`}
                >
                  <Sparkles size={16} />
                  <span className="text-xs">
                    {isEnglish ? 'Kaleidoscope' : 'Caleidoscópio'}
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Spacer */}
      <main className="flex-1" />

      {/* ========================================================= */}
      {/* 4. FIXED BOTTOM PLAYER NAVBAR (WITH WAVEFORM TONE BOX)    */}
      {/* ========================================================= */}
      <StudioFixedPlayerBar isEnglish={isEnglish} />

      {/* ========================================================= */}
      {/* 5. TRACKS & QUEUE SLIDE PANEL                             */}
      {/* ========================================================= */}
      <AnimatePresence>
        <StudioConfigDrawer isEnglish={isEnglish} />
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 6. PROFILE / SYSTEM SLIDE DRAWER                          */}
      {/* ========================================================= */}
      <SystemSlideDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProfile={() => onOpenProfile?.()}
        onOpenWallet={() => onOpenWallet?.()}
        onOpenNotifications={() => onOpenNotifications?.()}
        onOpenDailyJournal={() => onOpenDailyJournal?.()}
        onOpenNeuroacustica={() => setMenuOpen(false)}
        onOpenCatalog={() => onOpenCatalog?.()}
        onOpenChat={() => onOpenChat?.()}
        onSignOut={() => onSignOut?.()}
        activeScreen="neuroacustica"
        isEnglish={isEnglish}
      />
    </div>
  );
}
