import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { audioEngine } from '../lib/audioEngine';

export type WaveShape = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type NoiseType = 'white' | 'pink' | 'brown' | 'blue' | 'violet' | 'grey' | 'rain' | 'ocean';
export type BinauralTargetState = 'focus' | 'relaxation' | 'meditation' | 'sleep' | 'creation' | 'custom';

export type CromotherapyColor = {
  id: string;
  namePt: string;
  nameEn: string;
  hex: string;
  wavelength: string;
  benefitPt: string;
  benefitEn: string;
};

export const CROMOTHERAPY_COLORS: CromotherapyColor[] = [
  { id: 'red', namePt: 'Vermelho', nameEn: 'Red', hex: '#EF4444', wavelength: '700 nm', benefitPt: 'Vitalidade & Circulação', benefitEn: 'Vitality & Circulation' },
  { id: 'orange', namePt: 'Laranja', nameEn: 'Orange', hex: '#F97316', wavelength: '620 nm', benefitPt: 'Criatividade & Entusiasmo', benefitEn: 'Creativity & Enthusiasm' },
  { id: 'yellow', namePt: 'Amarelo', nameEn: 'Yellow', hex: '#EAB308', wavelength: '580 nm', benefitPt: 'Clareza Mental & Foco', benefitEn: 'Mental Clarity & Focus' },
  { id: 'green', namePt: 'Verde', nameEn: 'Green', hex: '#22C55E', wavelength: '530 nm', benefitPt: 'Equilíbrio & Cura Celular', benefitEn: 'Balance & Healing' },
  { id: 'blue', namePt: 'Azul', nameEn: 'Blue', hex: '#3B82F6', wavelength: '470 nm', benefitPt: 'Calma & Redução de Estresse', benefitEn: 'Calm & Stress Relief' },
  { id: 'indigo', namePt: 'Índigo', nameEn: 'Indigo', hex: '#6366F1', wavelength: '430 nm', benefitPt: 'Intuição & Percepção Profunda', benefitEn: 'Intuition & Deep Vision' },
  { id: 'violet', namePt: 'Violeta', nameEn: 'Violet', hex: '#A855F7', wavelength: '400 nm', benefitPt: 'Transcendência & Meditação', benefitEn: 'Transcendence & Peace' },
  { id: 'white', namePt: 'Branco', nameEn: 'White', hex: '#F8FAFC', wavelength: 'Pleno Espectro', benefitPt: 'Harmonização Global', benefitEn: 'Global Harmonization' },
  { id: 'black', namePt: 'Preto', nameEn: 'Dark Void', hex: '#090D16', wavelength: 'Absorção', benefitPt: 'Descompressão Sensorial & Sono', benefitEn: 'Sensory Rest & Sleep' },
  { id: 'pink', namePt: 'Rosa', nameEn: 'Pink', hex: '#EC4899', wavelength: 'Afeto', benefitPt: 'Acolhimento & Serenidade', benefitEn: 'Affection & Serenity' },
  { id: 'amber', namePt: 'Âmbar', nameEn: 'Amber', hex: '#F59E0B', wavelength: '595 nm', benefitPt: 'Aterramento & Vigor Físico', benefitEn: 'Grounding & Physical Energy' },
  { id: 'turquoise', namePt: 'Turquesa', nameEn: 'Turquoise', hex: '#06B6D4', wavelength: '500 nm', benefitPt: 'Imunidade & Expressão Verbal', benefitEn: 'Immunity & Expression' },
];

export interface QueuedTrack {
  id: string;
  name: string;
  type: 'pureTone' | 'binaural' | 'noise';
  details: string;
  durationMinutes: number | 'infinite';
  config: {
    pureToneFreq?: number;
    pureToneWave?: WaveShape;
    pureToneVol?: number;
    binauralLeft?: number;
    binauralRight?: number;
    binauralWave?: WaveShape;
    binauralVol?: number;
    binauralTarget?: BinauralTargetState;
    noiseType?: NoiseType;
    noiseVol?: number;
  };
}

export interface SavedNeuroSession {
  id: string;
  name: string;
  date: string;
  visualMode?: 'standard' | 'cromotherapy' | 'kaleidoscope';
  layers: {
    pureToneActive: boolean;
    pureToneFreq: number;
    pureToneWave: WaveShape;
    pureToneVol: number;
    binauralActive: boolean;
    binauralLeft: number;
    binauralRight: number;
    binauralWave: WaveShape;
    binauralVol: number;
    binauralTarget?: BinauralTargetState;
    noiseActive: boolean;
    noiseType: NoiseType;
    noiseVol: number;
  };
  cromoColorHex: string;
  timerMinutes: number | 'infinite';
}

interface NeuroAudioContextValue {
  // Master state
  isPlaying: boolean;
  masterVolume: number;
  setMasterVolume: (v: number) => void;
  toggleMasterPlay: () => void;
  pausePlayback: () => void;
  stopAll: () => void;

  // Active layers toggles & Mute states
  pureToneActive: boolean;
  setPureToneActive: (active: boolean) => void;
  pureToneMuted: boolean;
  setPureToneMuted: (m: boolean) => void;

  binauralActive: boolean;
  setBinauralActive: (active: boolean) => void;
  binauralMuted: boolean;
  setBinauralMuted: (m: boolean) => void;

  noiseActive: boolean;
  setNoiseActive: (active: boolean) => void;
  noiseMuted: boolean;
  setNoiseMuted: (m: boolean) => void;

  // Pure Tone config
  pureToneFreq: number;
  setPureToneFreq: (hz: number) => void;
  pureToneWave: WaveShape;
  setPureToneWave: (w: WaveShape) => void;
  pureToneVol: number;
  setPureToneVol: (v: number) => void;
  pureToneFade: boolean;
  setPureToneFade: (f: boolean) => void;

  // Binaural config
  binauralLeft: number;
  setBinauralLeft: (hz: number) => void;
  binauralRight: number;
  setBinauralRight: (hz: number) => void;
  binauralTarget: BinauralTargetState;
  setBinauralTarget: (target: BinauralTargetState) => void;
  binauralWave: WaveShape;
  setBinauralWave: (w: WaveShape) => void;
  binauralVol: number;
  setBinauralVol: (v: number) => void;
  binauralFade: boolean;
  setBinauralFade: (f: boolean) => void;

  // Noise config
  noiseType: NoiseType;
  setNoiseType: (t: NoiseType) => void;
  noiseVol: number;
  setNoiseVol: (v: number) => void;
  noiseFade: boolean;
  setNoiseFade: (f: boolean) => void;

  // Timer & Duration
  timerMinutes: number | 'infinite';
  setTimerMinutes: (m: number | 'infinite') => void;
  secondsRemaining: number | null;
  elapsedSeconds: number;
  resetElapsedSeconds: () => void;

  // Visual Output & Preview Display Mode
  visualMode: 'standard' | 'cromotherapy' | 'kaleidoscope';
  setVisualMode: (mode: 'standard' | 'cromotherapy' | 'kaleidoscope') => void;
  previewHeight: 'compact' | 'medium' | 'expanded' | 'fullscreen';
  setPreviewHeight: (h: 'compact' | 'medium' | 'expanded' | 'fullscreen') => void;

  // Cromotherapy config
  cromoSelectedColor: CromotherapyColor;
  setCromoSelectedColor: (c: CromotherapyColor) => void;
  cromoIntensity: number; // 1 (minimum/default) to 4 (intense/predominant)
  setCromoIntensity: (i: number) => void;
  cromoMode: 'solid' | 'gradient';
  setCromoMode: (m: 'solid' | 'gradient') => void;
  cromoFullscreen: boolean;
  setCromoFullscreen: (f: boolean) => void;
  cromoSyncFrequency: boolean;
  setCromoSyncFrequency: (s: boolean) => void;

  // Kaleidoscope config
  kaleidoSymmetry: number;
  setKaleidoSymmetry: (s: number) => void;
  kaleidoSpeed: number;
  setKaleidoSpeed: (s: number) => void;
  kaleidoDensity: number;
  setKaleidoDensity: (d: number) => void;

  // Studio Drawer / Specifications Inspector
  isConfigDrawerOpen: boolean;
  setIsConfigDrawerOpen: (open: boolean) => void;
  toggleConfigDrawer: () => void;
  activeConfigTab: 'track' | 'player' | 'mixer' | 'library';
  setActiveConfigTab: (tab: 'track' | 'player' | 'mixer' | 'library') => void;

  // Track Queue & Routing Actions
  queuedTracks: QueuedTrack[];
  addToQueue: (track: QueuedTrack) => void;
  updateQueuedTrack: (id: string, updates: Partial<QueuedTrack>) => void;
  removeFromQueue: (id: string) => void;
  reorderQueue: (newQueue: QueuedTrack[]) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  playNextInQueue: () => void;

  // Routing track helper (replace immediately, layer simultaneous, or queue)
  routeTrackAction: (
    sourceType: 'pureTone' | 'binaural' | 'noise',
    mode: 'replace' | 'layer' | 'queue',
    customSettings?: {
      freq?: number;
      wave?: WaveShape;
      vol?: number;
      binauralTarget?: BinauralTargetState;
      binauralLeft?: number;
      binauralRight?: number;
      noiseType?: NoiseType;
      timerMinutes?: number | 'infinite';
      name?: string;
    }
  ) => void;

  // Sessions & Presets
  savedSessions: SavedNeuroSession[];
  saveCurrentSession: (name: string) => void;
  deleteSavedSession: (id: string) => void;
  loadSession: (session: SavedNeuroSession) => void;

  // Export
  exportAudio: (format: 'wav' | 'mp3') => void;
}

const DEFAULT_SESSIONS: SavedNeuroSession[] = [
  {
    id: 'preset-focus-528',
    name: 'Foco Profundo Solfeggio 528Hz + Ruído Rosa',
    date: 'Preset Studio',
    layers: {
      pureToneActive: true,
      pureToneFreq: 528,
      pureToneWave: 'sine',
      pureToneVol: 0.65,
      binauralActive: false,
      binauralLeft: 200,
      binauralRight: 215,
      binauralWave: 'sine',
      binauralVol: 0.5,
      noiseActive: true,
      noiseType: 'pink',
      noiseVol: 0.35,
    },
    cromoColorHex: '#EAB308',
    timerMinutes: 25,
  },
  {
    id: 'preset-alpha-decompression',
    name: 'Descompressão Alfa 432Hz + Oceano',
    date: 'Preset Studio',
    layers: {
      pureToneActive: true,
      pureToneFreq: 432,
      pureToneWave: 'sine',
      pureToneVol: 0.5,
      binauralActive: true,
      binauralLeft: 200,
      binauralRight: 210,
      binauralWave: 'sine',
      binauralVol: 0.45,
      binauralTarget: 'relaxation',
      noiseActive: true,
      noiseType: 'ocean',
      noiseVol: 0.4,
    },
    cromoColorHex: '#3B82F6',
    timerMinutes: 15,
  },
  {
    id: 'preset-delta-sleep',
    name: 'Regeneração Noturna Delta + Ruído Marrom',
    date: 'Preset Studio',
    layers: {
      pureToneActive: false,
      pureToneFreq: 174,
      pureToneWave: 'sine',
      pureToneVol: 0.4,
      binauralActive: true,
      binauralLeft: 100,
      binauralRight: 102,
      binauralWave: 'sine',
      binauralVol: 0.5,
      binauralTarget: 'sleep',
      noiseActive: true,
      noiseType: 'brown',
      noiseVol: 0.55,
    },
    cromoColorHex: '#090D16',
    timerMinutes: 45,
  },
];

const STORAGE_SAVED_SESSIONS = '@orb/neuroacoustics_sessions';

const NeuroAudioContext = createContext<NeuroAudioContextValue | null>(null);

export const NeuroAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [masterVolume, setMasterVolumeState] = useState<number>(0.8);

  // Layer switches (starts zerado/unselected until user chooses a track)
  const [pureToneActive, setPureToneActive] = useState<boolean>(false);
  const [pureToneMuted, setPureToneMuted] = useState<boolean>(false);
  const [binauralActive, setBinauralActive] = useState<boolean>(false);
  const [binauralMuted, setBinauralMuted] = useState<boolean>(false);
  const [noiseActive, setNoiseActive] = useState<boolean>(false);
  const [noiseMuted, setNoiseMuted] = useState<boolean>(false);

  // Pure tone config
  const [pureToneFreq, setPureToneFreq] = useState<number>(528);
  const [pureToneWave, setPureToneWave] = useState<WaveShape>('sine');
  const [pureToneVol, setPureToneVol] = useState<number>(0.6);
  const [pureToneFade, setPureToneFade] = useState<boolean>(true);

  // Binaural config
  const [binauralLeft, setBinauralLeft] = useState<number>(200);
  const [binauralRight, setBinauralRight] = useState<number>(210); // 10Hz Alpha diff
  const [binauralTarget, setBinauralTargetState] = useState<BinauralTargetState>('relaxation');
  const [binauralWave, setBinauralWave] = useState<WaveShape>('sine');
  const [binauralVol, setBinauralVol] = useState<number>(0.5);
  const [binauralFade, setBinauralFade] = useState<boolean>(true);

  // Noise config
  const [noiseType, setNoiseType] = useState<NoiseType>('pink');
  const [noiseVol, setNoiseVol] = useState<number>(0.4);
  const [noiseFade, setNoiseFade] = useState<boolean>(true);

  // Timer config
  const [timerMinutes, setTimerMinutes] = useState<number | 'infinite'>('infinite');
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  const resetElapsedSeconds = () => setElapsedSeconds(0);

  // Visual Output & Preview Display Mode
  const [visualMode, setVisualMode] = useState<'standard' | 'cromotherapy' | 'kaleidoscope'>('standard');
  const [previewHeight, setPreviewHeight] = useState<'compact' | 'medium' | 'expanded' | 'fullscreen'>('expanded');

  // Cromotherapy config
  const [cromoSelectedColor, setCromoSelectedColor] = useState<CromotherapyColor>(CROMOTHERAPY_COLORS[4]); // Blue default
  const [cromoIntensity, setCromoIntensity] = useState<number>(1); // 1 (minimum/default) to 4 (intense/predominant)
  const [cromoMode, setCromoMode] = useState<'solid' | 'gradient'>('solid');
  const [cromoFullscreen, setCromoFullscreen] = useState<boolean>(false);
  const [cromoSyncFrequency, setCromoSyncFrequency] = useState<boolean>(true);

  // Kaleidoscope config
  const [kaleidoSymmetry, setKaleidoSymmetry] = useState<number>(8);
  const [kaleidoSpeed, setKaleidoSpeed] = useState<number>(4);
  const [kaleidoDensity, setKaleidoDensity] = useState<number>(6);

  // Drawer / Specifications All-in-One Slide Menu
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState<boolean>(false);
  const [activeConfigTab, setActiveConfigTab] = useState<'track' | 'player' | 'mixer' | 'library'>('track');

  // Queue of tracks
  const [queuedTracks, setQueuedTracks] = useState<QueuedTrack[]>([]);

  // Saved sessions
  const [savedSessions, setSavedSessions] = useState<SavedNeuroSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_SESSIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_SESSIONS;
  });

  const toggleConfigDrawer = () => {
    setIsConfigDrawerOpen((prev) => !prev);
  };

  const addToQueue = (track: QueuedTrack) => {
    setQueuedTracks((prev) => [...prev, track]);
  };

  const updateQueuedTrack = (id: string, updates: Partial<QueuedTrack>) => {
    setQueuedTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, config: { ...t.config, ...updates.config } } : t))
    );
  };

  const removeFromQueue = (id: string) => {
    setQueuedTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const reorderQueue = (newQueue: QueuedTrack[]) => {
    setQueuedTracks(newQueue);
  };

  const moveQueueItem = (fromIndex: number, toIndex: number) => {
    setQueuedTracks((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const clearQueue = () => {
    setQueuedTracks([]);
  };

  const playNextInQueue = () => {
    if (queuedTracks.length === 0) return;
    const [next, ...rest] = queuedTracks;
    setQueuedTracks(rest);

    if (next.type === 'pureTone' && next.config.pureToneFreq) {
      setPureToneActive(true);
      setPureToneFreq(next.config.pureToneFreq);
      if (next.config.pureToneWave) setPureToneWave(next.config.pureToneWave);
      if (typeof next.config.pureToneVol === 'number') setPureToneVol(next.config.pureToneVol);
      setBinauralActive(false);
      setNoiseActive(false);
    } else if (next.type === 'binaural' && next.config.binauralLeft && next.config.binauralRight) {
      setBinauralActive(true);
      setBinauralLeft(next.config.binauralLeft);
      setBinauralRight(next.config.binauralRight);
      if (next.config.binauralWave) setBinauralWave(next.config.binauralWave);
      if (typeof next.config.binauralVol === 'number') setBinauralVol(next.config.binauralVol);
      if (next.config.binauralTarget) setBinauralTargetState(next.config.binauralTarget);
      setPureToneActive(false);
      setNoiseActive(false);
    } else if (next.type === 'noise' && next.config.noiseType) {
      setNoiseActive(true);
      setNoiseType(next.config.noiseType);
      if (typeof next.config.noiseVol === 'number') setNoiseVol(next.config.noiseVol);
      setPureToneActive(false);
      setBinauralActive(false);
    }

    if (next.durationMinutes) {
      setTimerMinutes(next.durationMinutes);
    }
    setIsPlaying(true);
  };

  const routeTrackAction = (
    sourceType: 'pureTone' | 'binaural' | 'noise',
    mode: 'replace' | 'layer' | 'queue',
    customSettings?: {
      freq?: number;
      wave?: WaveShape;
      vol?: number;
      binauralTarget?: BinauralTargetState;
      binauralLeft?: number;
      binauralRight?: number;
      noiseType?: NoiseType;
      timerMinutes?: number | 'infinite';
      name?: string;
    }
  ) => {
    if (mode === 'queue') {
      const newTrack: QueuedTrack = {
        id: `q-${Date.now()}`,
        name: customSettings?.name || (sourceType === 'pureTone' ? `Tom Puro ${customSettings?.freq || pureToneFreq}Hz` : sourceType === 'binaural' ? 'Batimento Binaural' : `Ruído ${customSettings?.noiseType || noiseType}`),
        type: sourceType,
        details: sourceType === 'pureTone' ? `${customSettings?.freq || pureToneFreq}Hz • ${customSettings?.wave || pureToneWave}` : sourceType === 'binaural' ? `${customSettings?.binauralTarget || binauralTarget}` : `${customSettings?.noiseType || noiseType}`,
        durationMinutes: customSettings?.timerMinutes || timerMinutes,
        config: {
          pureToneFreq: customSettings?.freq || pureToneFreq,
          pureToneWave: customSettings?.wave || pureToneWave,
          pureToneVol: typeof customSettings?.vol === 'number' ? customSettings.vol : pureToneVol,
          binauralLeft: customSettings?.binauralLeft || binauralLeft,
          binauralRight: customSettings?.binauralRight || binauralRight,
          binauralWave: customSettings?.wave || binauralWave,
          binauralVol: typeof customSettings?.vol === 'number' ? customSettings.vol : binauralVol,
          binauralTarget: customSettings?.binauralTarget || binauralTarget,
          noiseType: customSettings?.noiseType || noiseType,
          noiseVol: typeof customSettings?.vol === 'number' ? customSettings.vol : noiseVol,
        },
      };
      addToQueue(newTrack);
      return;
    }

    if (mode === 'replace') {
      setElapsedSeconds(0);
      // Deactivate other layers and activate this one
      if (sourceType === 'pureTone') {
        if (customSettings?.freq) setPureToneFreq(customSettings.freq);
        if (customSettings?.wave) setPureToneWave(customSettings.wave);
        if (typeof customSettings?.vol === 'number') setPureToneVol(customSettings.vol);
        setPureToneActive(true);
        setPureToneMuted(false);
        setBinauralActive(false);
        setNoiseActive(false);
      } else if (sourceType === 'binaural') {
        if (customSettings?.binauralTarget) setBinauralTarget(customSettings.binauralTarget);
        if (customSettings?.binauralLeft) setBinauralLeft(customSettings.binauralLeft);
        if (customSettings?.binauralRight) setBinauralRight(customSettings.binauralRight);
        if (customSettings?.wave) setBinauralWave(customSettings.wave);
        if (typeof customSettings?.vol === 'number') setBinauralVol(customSettings.vol);
        setBinauralActive(true);
        setBinauralMuted(false);
        setPureToneActive(false);
        setNoiseActive(false);
      } else if (sourceType === 'noise') {
        if (customSettings?.noiseType) setNoiseType(customSettings.noiseType);
        if (typeof customSettings?.vol === 'number') setNoiseVol(customSettings.vol);
        setNoiseActive(true);
        setNoiseMuted(false);
        setPureToneActive(false);
        setBinauralActive(false);
      }
    } else if (mode === 'layer') {
      // Add as simultaneous multi-track layer without disabling others
      if (sourceType === 'pureTone') {
        if (customSettings?.freq) setPureToneFreq(customSettings.freq);
        if (customSettings?.wave) setPureToneWave(customSettings.wave);
        if (typeof customSettings?.vol === 'number') setPureToneVol(customSettings.vol);
        setPureToneActive(true);
        setPureToneMuted(false);
      } else if (sourceType === 'binaural') {
        if (customSettings?.binauralTarget) setBinauralTarget(customSettings.binauralTarget);
        if (customSettings?.binauralLeft) setBinauralLeft(customSettings.binauralLeft);
        if (customSettings?.binauralRight) setBinauralRight(customSettings.binauralRight);
        if (customSettings?.wave) setBinauralWave(customSettings.wave);
        if (typeof customSettings?.vol === 'number') setBinauralVol(customSettings.vol);
        setBinauralActive(true);
        setBinauralMuted(false);
      } else if (sourceType === 'noise') {
        if (customSettings?.noiseType) setNoiseType(customSettings.noiseType);
        if (typeof customSettings?.vol === 'number') setNoiseVol(customSettings.vol);
        setNoiseActive(true);
        setNoiseMuted(false);
      }
    }

    if (customSettings?.timerMinutes) {
      setTimerMinutes(customSettings.timerMinutes);
    }
    setIsPlaying(true);
  };

  const setBinauralTarget = (target: BinauralTargetState) => {
    setBinauralTargetState(target);
    const base = 200;
    if (target === 'focus') {
      setBinauralLeft(base);
      setBinauralRight(base + 15); // 15Hz Beta
    } else if (target === 'relaxation') {
      setBinauralLeft(base);
      setBinauralRight(base + 10); // 10Hz Alpha
    } else if (target === 'meditation') {
      setBinauralLeft(base);
      setBinauralRight(base + 6); // 6Hz Theta
    } else if (target === 'sleep') {
      setBinauralLeft(100);
      setBinauralRight(102); // 2Hz Delta
    } else if (target === 'creation') {
      setBinauralLeft(base);
      setBinauralRight(base + 40); // 40Hz Gamma
    }
  };

  const setMasterVolume = (v: number) => {
    setMasterVolumeState(v);
    audioEngine.setMasterVolume(v);
  };

  // Sync state to Web Audio Engine when playing
  useEffect(() => {
    if (!isPlaying) {
      audioEngine.stopAll(true);
      return;
    }

    // Pure tone layer
    if (pureToneActive && !pureToneMuted) {
      audioEngine.startPureTone(pureToneFreq, pureToneWave, pureToneVol, pureToneFade);
    } else {
      audioEngine.stopPureTone(true);
    }

    // Binaural layer
    if (binauralActive && !binauralMuted) {
      audioEngine.startBinaural(binauralLeft, binauralRight, binauralWave, binauralVol, binauralFade);
    } else {
      audioEngine.stopBinaural(true);
    }

    // Noise layer
    if (noiseActive && !noiseMuted) {
      audioEngine.startNoise(noiseType, noiseVol, noiseFade);
    } else {
      audioEngine.stopNoise(true);
    }
  }, [
    isPlaying,
    pureToneActive,
    pureToneMuted,
    pureToneFreq,
    pureToneWave,
    pureToneVol,
    binauralActive,
    binauralMuted,
    binauralLeft,
    binauralRight,
    binauralWave,
    binauralVol,
    noiseActive,
    noiseMuted,
    noiseType,
    noiseVol,
  ]);

  // Master Volume update
  useEffect(() => {
    audioEngine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Timer countdown handling & elapsed playback tracking & auto queue transition
  useEffect(() => {
    const hasActiveAudio =
      (pureToneActive && !pureToneMuted) ||
      (binauralActive && !binauralMuted) ||
      (noiseActive && !noiseMuted);

    if (!isPlaying || !hasActiveAudio) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerMinutes === 'infinite') {
        setSecondsRemaining(null);
      }
      return;
    }

    if (timerMinutes !== 'infinite') {
      const totalSeconds = timerMinutes * 60;
      setSecondsRemaining((prev) => (prev !== null && prev > 0 ? prev : totalSeconds));
    } else {
      setSecondsRemaining(null);
    }

    timerIntervalRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (timerMinutes !== 'infinite') {
        setSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (queuedTracks.length > 0) {
              setElapsedSeconds(0);
              playNextInQueue();
            } else {
              setIsPlaying(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [
    isPlaying,
    timerMinutes,
    queuedTracks,
    pureToneActive,
    pureToneMuted,
    binauralActive,
    binauralMuted,
    noiseActive,
    noiseMuted,
  ]);

  const toggleMasterPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioEngine.stopAll(true);
    } else {
      // Ensure at least one layer is active if none is selected
      if (!pureToneActive && !binauralActive && !noiseActive) {
        setPureToneActive(true);
      }
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    audioEngine.stopAll(true);
  };

  const stopAll = () => {
    setIsPlaying(false);
    setElapsedSeconds(0);
    setSecondsRemaining(null);
    setPureToneActive(false);
    setBinauralActive(false);
    setNoiseActive(false);
    audioEngine.stopAll(true);
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch {}
    }
  };

  // Sync to Mobile / OS Media Session Notification Card
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      if (isPlaying) {
        const activeLabels: string[] = [];
        if (pureToneActive && !pureToneMuted) activeLabels.push(`${pureToneFreq}Hz (${pureToneWave})`);
        if (binauralActive && !binauralMuted) activeLabels.push(`Binaural ${Math.abs(binauralRight - binauralLeft)}Hz`);
        if (noiseActive && !noiseMuted) activeLabels.push(`Ruído ${noiseType}`);
        const titleText = activeLabels.join(' + ') || 'Estúdio Neuroacústica';

        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: titleText,
            artist: 'ORB Neuroacústica',
            album: 'Sessão Sonora Ativa',
            artwork: [
              { src: '/icon.png', sizes: '192x192', type: 'image/png' },
              { src: '/icon.png', sizes: '512x512', type: 'image/png' },
            ],
          });
          navigator.mediaSession.playbackState = 'playing';

          navigator.mediaSession.setActionHandler('play', () => {
            setIsPlaying(true);
          });
          navigator.mediaSession.setActionHandler('pause', () => {
            setIsPlaying(false);
          });
          navigator.mediaSession.setActionHandler('stop', () => {
            stopAll();
          });
        } catch (e) {
          console.warn('MediaSession sync error:', e);
        }
      } else if (pureToneActive || binauralActive || noiseActive) {
        try {
          navigator.mediaSession.playbackState = 'paused';
        } catch {}
      } else {
        try {
          navigator.mediaSession.playbackState = 'none';
        } catch {}
      }
    }
  }, [
    isPlaying,
    pureToneActive,
    pureToneMuted,
    pureToneFreq,
    pureToneWave,
    binauralActive,
    binauralMuted,
    binauralLeft,
    binauralRight,
    noiseActive,
    noiseMuted,
    noiseType,
  ]);

  const saveCurrentSession = (name: string) => {
    const newSession: SavedNeuroSession = {
      id: `custom-${Date.now()}`,
      name: name || `Sessão Personalizada ${new Date().toLocaleDateString()}`,
      date: new Date().toLocaleDateString(),
      visualMode,
      layers: {
        pureToneActive,
        pureToneFreq,
        pureToneWave,
        pureToneVol,
        binauralActive,
        binauralLeft,
        binauralRight,
        binauralWave,
        binauralVol,
        binauralTarget,
        noiseActive,
        noiseType,
        noiseVol,
      },
      cromoColorHex: cromoSelectedColor.hex,
      timerMinutes,
    };

    const updated = [newSession, ...savedSessions];
    setSavedSessions(updated);
    localStorage.setItem(STORAGE_SAVED_SESSIONS, JSON.stringify(updated));
  };

  const deleteSavedSession = (id: string) => {
    const updated = savedSessions.filter((s) => s.id !== id);
    setSavedSessions(updated);
    localStorage.setItem(STORAGE_SAVED_SESSIONS, JSON.stringify(updated));
  };

  const loadSession = (session: SavedNeuroSession) => {
    setPureToneActive(session.layers.pureToneActive);
    setPureToneMuted(false);
    setPureToneFreq(session.layers.pureToneFreq);
    setPureToneWave(session.layers.pureToneWave);
    setPureToneVol(session.layers.pureToneVol);

    setBinauralActive(session.layers.binauralActive);
    setBinauralMuted(false);
    setBinauralLeft(session.layers.binauralLeft);
    setBinauralRight(session.layers.binauralRight);
    setBinauralWave(session.layers.binauralWave);
    setBinauralVol(session.layers.binauralVol);
    if (session.layers.binauralTarget) {
      setBinauralTargetState(session.layers.binauralTarget);
    }

    setNoiseActive(session.layers.noiseActive);
    setNoiseMuted(false);
    setNoiseType(session.layers.noiseType);
    setNoiseVol(session.layers.noiseVol);

    setTimerMinutes(session.timerMinutes);

    if (session.visualMode) {
      setVisualMode(session.visualMode);
    }

    const matchColor = CROMOTHERAPY_COLORS.find((c) => c.hex.toLowerCase() === session.cromoColorHex.toLowerCase());
    if (matchColor) setCromoSelectedColor(matchColor);

    setIsPlaying(true);
  };

  const exportAudio = (format: 'wav' | 'mp3') => {
    const blob = audioEngine.exportWav({
      type: 'mix',
      toneFreq: pureToneActive && !pureToneMuted ? pureToneFreq : undefined,
      toneWave: pureToneActive && !pureToneMuted ? pureToneWave : undefined,
      leftFreq: binauralActive && !binauralMuted ? binauralLeft : undefined,
      rightFreq: binauralActive && !binauralMuted ? binauralRight : undefined,
      noiseType: noiseActive && !noiseMuted ? noiseType : undefined,
      durationSeconds: 15,
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orb-neuroacoustics-session.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <NeuroAudioContext.Provider
      value={{
        isPlaying,
        masterVolume,
        setMasterVolume,
        toggleMasterPlay,
        pausePlayback,
        stopAll,

        pureToneActive,
        setPureToneActive,
        pureToneMuted,
        setPureToneMuted,

        binauralActive,
        setBinauralActive,
        binauralMuted,
        setBinauralMuted,

        noiseActive,
        setNoiseActive,
        noiseMuted,
        setNoiseMuted,

        pureToneFreq,
        setPureToneFreq,
        pureToneWave,
        setPureToneWave,
        pureToneVol,
        setPureToneVol,
        pureToneFade,
        setPureToneFade,

        binauralLeft,
        setBinauralLeft,
        binauralRight,
        setBinauralRight,
        binauralTarget,
        setBinauralTarget,
        binauralWave,
        setBinauralWave,
        binauralVol,
        setBinauralVol,
        binauralFade,
        setBinauralFade,

        noiseType,
        setNoiseType,
        noiseVol,
        setNoiseVol,
        noiseFade,
        setNoiseFade,

        timerMinutes,
        setTimerMinutes,
        secondsRemaining,
        elapsedSeconds,
        resetElapsedSeconds,

        visualMode,
        setVisualMode,
        previewHeight,
        setPreviewHeight,

        cromoSelectedColor,
        setCromoSelectedColor,
        cromoIntensity,
        setCromoIntensity,
        cromoMode,
        setCromoMode,
        cromoFullscreen,
        setCromoFullscreen,
        cromoSyncFrequency,
        setCromoSyncFrequency,

        kaleidoSymmetry,
        setKaleidoSymmetry,
        kaleidoSpeed,
        setKaleidoSpeed,
        kaleidoDensity,
        setKaleidoDensity,

        isConfigDrawerOpen,
        setIsConfigDrawerOpen,
        toggleConfigDrawer,
        activeConfigTab,
        setActiveConfigTab,

        queuedTracks,
        addToQueue,
        updateQueuedTrack,
        removeFromQueue,
        reorderQueue,
        moveQueueItem,
        clearQueue,
        playNextInQueue,
        routeTrackAction,

        savedSessions,
        saveCurrentSession,
        deleteSavedSession,
        loadSession,

        exportAudio,
      }}
    >
      {children}
    </NeuroAudioContext.Provider>
  );
};

export const useNeuroAudio = () => {
  const context = useContext(NeuroAudioContext);
  if (!context) {
    throw new Error('useNeuroAudio must be used within a NeuroAudioProvider');
  }
  return context;
};
