// Web Audio API Synthesis Engine for Neuroacoustics
// Supports Pure Tones, Binaural Beats, Noise Generators (White, Pink, Brown, Blue, Violet, Rain, Ocean),
// Layered simultaneous playback, Fade in/out, and WAV export.

class NeuroAudioEngine {
  private ctx: AudioContext | null = null;

  // Pure Tone nodes (supports multiple simultaneous pure tone layers)
  private toneOsc: OscillatorNode | null = null;
  private toneGain: GainNode | null = null;
  private extraTones: Map<string, { osc: OscillatorNode; gain: GainNode }> = new Map();

  // Binaural nodes
  private binauralLeftOsc: OscillatorNode | null = null;
  private binauralRightOsc: OscillatorNode | null = null;
  private binauralLeftGain: GainNode | null = null;
  private binauralRightGain: GainNode | null = null;
  private binauralMerger: ChannelMergerNode | null = null;

  // Noise nodes
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private oceanModTimer: number | null = null;

  // Master Gain
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyserNode;
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  // ==========================================
  // 1. PURE TONE SYNTHESIS
  // ==========================================
  public startPureTone(
    freq: number,
    type: OscillatorType = 'sine',
    volume = 0.5,
    fadeIn = true
  ) {
    const ctx = this.initContext();
    this.stopPureTone(false);

    this.toneOsc = ctx.createOscillator();
    this.toneGain = ctx.createGain();

    this.toneOsc.type = type;
    this.toneOsc.frequency.setValueAtTime(freq, ctx.currentTime);

    if (fadeIn) {
      this.toneGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.toneGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 2.5);
    } else {
      this.toneGain.gain.setValueAtTime(volume, ctx.currentTime);
    }

    this.toneOsc.connect(this.toneGain);
    if (this.masterGain) {
      this.toneGain.connect(this.masterGain);
    }

    this.toneOsc.start();
  }

  public updatePureTone(freq: number, type?: OscillatorType, volume?: number) {
    if (!this.ctx || !this.toneOsc || !this.toneGain) return;
    this.toneOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    if (type) this.toneOsc.type = type;
    if (typeof volume === 'number') {
      this.toneGain.gain.setTargetAtTime(Math.max(0.0001, volume), this.ctx.currentTime, 0.05);
    }
  }

  public stopPureTone(fadeOut = true) {
    if (!this.toneOsc || !this.ctx || !this.toneGain) return;
    try {
      if (fadeOut) {
        this.toneGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.5);
        setTimeout(() => {
          this.toneOsc?.stop();
          this.toneOsc?.disconnect();
          this.toneOsc = null;
          this.toneGain = null;
        }, 600);
      } else {
        this.toneOsc.stop();
        this.toneOsc.disconnect();
        this.toneOsc = null;
        this.toneGain = null;
      }
    } catch {
      this.toneOsc = null;
      this.toneGain = null;
    }
  }

  // Multi-PureTone Synthesis (Allows layering multiple pure tone frequencies simultaneously)
  public startExtraPureTone(
    id: string,
    freq: number,
    type: OscillatorType = 'sine',
    volume = 0.5,
    fadeIn = true
  ) {
    const ctx = this.initContext();
    this.stopExtraPureTone(id, false);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    if (fadeIn) {
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 2.5);
    } else {
      gain.gain.setValueAtTime(volume, ctx.currentTime);
    }

    osc.connect(gain);
    if (this.masterGain) {
      gain.connect(this.masterGain);
    }

    osc.start();
    this.extraTones.set(id, { osc, gain });
  }

  public updateExtraPureTone(id: string, freq: number, type?: OscillatorType, volume?: number) {
    const node = this.extraTones.get(id);
    if (!node || !this.ctx) return;
    node.osc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    if (type) node.osc.type = type;
    if (typeof volume === 'number') {
      node.gain.gain.setTargetAtTime(Math.max(0.0001, volume), this.ctx.currentTime, 0.05);
    }
  }

  public stopExtraPureTone(id: string, fadeOut = true) {
    const node = this.extraTones.get(id);
    if (!node || !this.ctx) return;
    this.extraTones.delete(id);
    try {
      if (fadeOut) {
        node.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.5);
        setTimeout(() => {
          node.osc.stop();
          node.osc.disconnect();
        }, 600);
      } else {
        node.osc.stop();
        node.osc.disconnect();
      }
    } catch {
      // Ignored
    }
  }

  public stopAllExtraPureTones(fadeOut = true) {
    const ids = Array.from(this.extraTones.keys());
    ids.forEach((id) => this.stopExtraPureTone(id, fadeOut));
  }

  // ==========================================
  // 2. BINAURAL BEATS SYNTHESIS
  // ==========================================
  public startBinaural(
    leftFreq: number,
    rightFreq: number,
    type: OscillatorType = 'sine',
    volume = 0.5,
    fadeIn = true
  ) {
    const ctx = this.initContext();
    this.stopBinaural(false);

    this.binauralLeftOsc = ctx.createOscillator();
    this.binauralRightOsc = ctx.createOscillator();
    this.binauralLeftGain = ctx.createGain();
    this.binauralRightGain = ctx.createGain();
    this.binauralMerger = ctx.createChannelMerger(2);

    this.binauralLeftOsc.type = type;
    this.binauralRightOsc.type = type;
    this.binauralLeftOsc.frequency.setValueAtTime(leftFreq, ctx.currentTime);
    this.binauralRightOsc.frequency.setValueAtTime(rightFreq, ctx.currentTime);

    const initialGain = fadeIn ? 0.0001 : volume;
    this.binauralLeftGain.gain.setValueAtTime(initialGain, ctx.currentTime);
    this.binauralRightGain.gain.setValueAtTime(initialGain, ctx.currentTime);

    if (fadeIn) {
      this.binauralLeftGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 2.5);
      this.binauralRightGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 2.5);
    }

    this.binauralLeftOsc.connect(this.binauralLeftGain);
    this.binauralRightOsc.connect(this.binauralRightGain);

    // Left channel to channel 0, Right channel to channel 1
    this.binauralLeftGain.connect(this.binauralMerger, 0, 0);
    this.binauralRightGain.connect(this.binauralMerger, 0, 1);

    if (this.masterGain) {
      this.binauralMerger.connect(this.masterGain);
    }

    this.binauralLeftOsc.start();
    this.binauralRightOsc.start();
  }

  public updateBinaural(leftFreq: number, rightFreq: number, type?: OscillatorType, volume?: number) {
    if (!this.ctx || !this.binauralLeftOsc || !this.binauralRightOsc) return;
    this.binauralLeftOsc.frequency.setTargetAtTime(leftFreq, this.ctx.currentTime, 0.05);
    this.binauralRightOsc.frequency.setTargetAtTime(rightFreq, this.ctx.currentTime, 0.05);
    if (type) {
      this.binauralLeftOsc.type = type;
      this.binauralRightOsc.type = type;
    }
    if (typeof volume === 'number' && this.binauralLeftGain && this.binauralRightGain) {
      const v = Math.max(0.0001, volume);
      this.binauralLeftGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
      this.binauralRightGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
  }

  public stopBinaural(fadeOut = true) {
    if (!this.ctx || !this.binauralLeftOsc || !this.binauralRightOsc) return;
    try {
      if (fadeOut && this.binauralLeftGain && this.binauralRightGain) {
        this.binauralLeftGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.5);
        this.binauralRightGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.5);
        setTimeout(() => {
          this.binauralLeftOsc?.stop();
          this.binauralRightOsc?.stop();
          this.binauralLeftOsc?.disconnect();
          this.binauralRightOsc?.disconnect();
          this.binauralMerger?.disconnect();
          this.binauralLeftOsc = null;
          this.binauralRightOsc = null;
          this.binauralLeftGain = null;
          this.binauralRightGain = null;
          this.binauralMerger = null;
        }, 600);
      } else {
        this.binauralLeftOsc.stop();
        this.binauralRightOsc.stop();
        this.binauralLeftOsc.disconnect();
        this.binauralRightOsc.disconnect();
        this.binauralMerger?.disconnect();
        this.binauralLeftOsc = null;
        this.binauralRightOsc = null;
        this.binauralLeftGain = null;
        this.binauralRightGain = null;
        this.binauralMerger = null;
      }
    } catch {
      this.binauralLeftOsc = null;
      this.binauralRightOsc = null;
    }
  }

  // ==========================================
  // 3. NOISE GENERATOR (White, Pink, Brown, Blue, Violet, Grey, Rain, Ocean)
  // ==========================================
  public startNoise(
    type: 'white' | 'pink' | 'brown' | 'blue' | 'violet' | 'grey' | 'rain' | 'ocean',
    volume = 0.5,
    fadeIn = true
  ) {
    const ctx = this.initContext();
    this.stopNoise(false);

    const bufferSize = 5 * ctx.sampleRate; // 5 seconds looped buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Synthesis algorithm based on color
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'white') {
        data[i] = white * 0.35;
      } else if (type === 'pink') {
        // Paul Kellet's filtered pink noise generator
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
        b6 = white * 0.115926;
      } else if (type === 'brown' || type === 'ocean') {
        // Brown noise (integrated white noise)
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.2;
      } else if (type === 'blue') {
        // Blue noise (differentiated white noise)
        data[i] = (white - lastOut) * 0.45;
        lastOut = white;
      } else if (type === 'violet') {
        data[i] = (white - 2 * lastOut + b0) * 0.3;
        b0 = lastOut;
        lastOut = white;
      } else if (type === 'grey') {
        // Equal loudness weighting approximation
        b0 = 0.95 * b0 + white * 0.12;
        data[i] = (white * 0.5 - b0 * 0.3) * 0.3;
      } else if (type === 'rain') {
        // Soft pink + random micro crackles
        b0 = 0.99 * b0 + white * 0.06;
        const crackle = Math.random() > 0.994 ? (Math.random() * 2 - 1) * 0.4 : 0;
        data[i] = (b0 + crackle) * 0.3;
      }
    }

    this.noiseNode = ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.noiseGain = ctx.createGain();
    this.noiseFilter = ctx.createBiquadFilter();

    if (type === 'ocean') {
      this.noiseFilter.type = 'lowpass';
      this.noiseFilter.frequency.setValueAtTime(450, ctx.currentTime);
      // Ocean tidal modulation
      let phase = 0;
      this.oceanModTimer = window.setInterval(() => {
        if (!this.noiseFilter || !this.ctx) return;
        phase += 0.06;
        const modFreq = 380 + Math.sin(phase) * 320;
        this.noiseFilter.frequency.setTargetAtTime(modFreq, this.ctx.currentTime, 0.2);
      }, 100);
    } else if (type === 'rain') {
      this.noiseFilter.type = 'lowpass';
      this.noiseFilter.frequency.setValueAtTime(2200, ctx.currentTime);
    } else {
      this.noiseFilter.type = 'allpass';
    }

    const initialGain = fadeIn ? 0.0001 : volume;
    this.noiseGain.gain.setValueAtTime(initialGain, ctx.currentTime);

    if (fadeIn) {
      this.noiseGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 2.5);
    }

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);

    if (this.masterGain) {
      this.noiseGain.connect(this.masterGain);
    }

    this.noiseNode.start();
  }

  public updateNoise(volume: number) {
    if (!this.ctx || !this.noiseGain) return;
    this.noiseGain.gain.setTargetAtTime(Math.max(0.0001, volume), this.ctx.currentTime, 0.05);
  }

  public stopNoise(fadeOut = true) {
    if (this.oceanModTimer) {
      clearInterval(this.oceanModTimer);
      this.oceanModTimer = null;
    }
    if (!this.ctx || !this.noiseNode || !this.noiseGain) return;
    try {
      if (fadeOut) {
        this.noiseGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.5);
        setTimeout(() => {
          this.noiseNode?.stop();
          this.noiseNode?.disconnect();
          this.noiseFilter?.disconnect();
          this.noiseNode = null;
          this.noiseGain = null;
          this.noiseFilter = null;
        }, 600);
      } else {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
        this.noiseFilter?.disconnect();
        this.noiseNode = null;
        this.noiseGain = null;
        this.noiseFilter = null;
      }
    } catch {
      this.noiseNode = null;
      this.noiseGain = null;
    }
  }

  // ==========================================
  // 4. STOP ALL LAYERS
  // ==========================================
  public stopAll(fadeOut = true) {
    this.stopPureTone(fadeOut);
    this.stopAllExtraPureTones(fadeOut);
    this.stopBinaural(fadeOut);
    this.stopNoise(fadeOut);
  }

  // ==========================================
  // 5. EXPORT WAV AUDIO FILE
  // ==========================================
  public exportWav(
    options: {
      type: 'tone' | 'binaural' | 'noise' | 'mix';
      toneFreq?: number;
      toneWave?: OscillatorType;
      leftFreq?: number;
      rightFreq?: number;
      noiseType?: 'white' | 'pink' | 'brown' | 'blue' | 'violet' | 'grey' | 'rain' | 'ocean';
      durationSeconds?: number;
    }
  ): Blob {
    const duration = options.durationSeconds || 10;
    const sampleRate = 44100;
    const numChannels = 2;
    const numSamples = duration * sampleRate;
    const buffer = new Float32Array(numSamples * numChannels);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let left = 0;
      let right = 0;

      // Pure Tone layer
      if ((options.type === 'tone' || options.type === 'mix') && options.toneFreq) {
        const val = Math.sin(2 * Math.PI * options.toneFreq * t);
        left += val * 0.4;
        right += val * 0.4;
      }

      // Binaural layer
      if ((options.type === 'binaural' || options.type === 'mix') && options.leftFreq && options.rightFreq) {
        left += Math.sin(2 * Math.PI * options.leftFreq * t) * 0.4;
        right += Math.sin(2 * Math.PI * options.rightFreq * t) * 0.4;
      }

      // Noise layer
      if ((options.type === 'noise' || options.type === 'mix') && options.noiseType) {
        const n = (Math.random() * 2 - 1) * 0.15;
        left += n;
        right += n;
      }

      // Apply subtle fade in/out
      let env = 1.0;
      if (t < 1.0) env = t;
      if (t > duration - 1.0) env = duration - t;

      buffer[i * 2] = Math.max(-1, Math.min(1, left * env));
      buffer[i * 2 + 1] = Math.max(-1, Math.min(1, right * env));
    }

    return this.encodeWAV(buffer, numChannels, sampleRate);
  }

  // ==========================================
  // PREVIEW SYNTHESIS (5s isolated preview)
  // ==========================================
  private previewNodes: {
    oscillators: OscillatorNode[];
    gains: GainNode[];
    sources: AudioBufferSourceNode[];
    merger: ChannelMergerNode | null;
    timer: number | null;
  } | null = null;

  public playPreview(
    options: {
      type: 'pureTone' | 'binaural' | 'noise';
      freq?: number;
      wave?: OscillatorType;
      binauralLeft?: number;
      binauralRight?: number;
      binauralWave?: OscillatorType;
      noiseType?: 'white' | 'pink' | 'brown' | 'blue' | 'violet' | 'grey' | 'rain' | 'ocean';
      durationSeconds?: number;
    },
    onEnd?: () => void
  ) {
    this.stopPreview();
    const ctx = this.initContext();
    const duration = options.durationSeconds || 5;
    const now = ctx.currentTime;

    const previewGain = ctx.createGain();
    // Smooth 0.2s fade-in, sustain, 0.3s fade-out at 5s
    previewGain.gain.setValueAtTime(0.0001, now);
    previewGain.gain.exponentialRampToValueAtTime(0.5, now + 0.2);
    previewGain.gain.setValueAtTime(0.5, Math.max(now + 0.21, now + duration - 0.3));
    previewGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    if (this.masterGain) {
      previewGain.connect(this.masterGain);
    } else {
      previewGain.connect(ctx.destination);
    }

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [previewGain];
    const sources: AudioBufferSourceNode[] = [];
    let merger: ChannelMergerNode | null = null;

    if (options.type === 'pureTone') {
      const osc = ctx.createOscillator();
      osc.type = options.wave || 'sine';
      osc.frequency.setValueAtTime(options.freq || 432, now);
      osc.connect(previewGain);
      osc.start(now);
      osc.stop(now + duration);
      oscillators.push(osc);
    } else if (options.type === 'binaural') {
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();
      merger = ctx.createChannelMerger(2);

      leftOsc.type = options.binauralWave || 'sine';
      rightOsc.type = options.binauralWave || 'sine';
      leftOsc.frequency.setValueAtTime(options.binauralLeft || 200, now);
      rightOsc.frequency.setValueAtTime(options.binauralRight || 210, now);

      leftGain.gain.setValueAtTime(1, now);
      rightGain.gain.setValueAtTime(1, now);

      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);
      merger.connect(previewGain);

      leftOsc.start(now);
      rightOsc.start(now);
      leftOsc.stop(now + duration);
      rightOsc.stop(now + duration);

      oscillators.push(leftOsc, rightOsc);
      gains.push(leftGain, rightGain);
    } else if (options.type === 'noise') {
      const bufferSize = Math.floor(duration * ctx.sampleRate);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const nType = options.noiseType || 'brown';

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (nType === 'white') {
          data[i] = white * 0.35;
        } else if (nType === 'pink') {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
          b6 = white * 0.115926;
        } else if (nType === 'brown') {
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 1.5;
        } else {
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 1.2;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.connect(previewGain);
      noiseSource.start(now);
      noiseSource.stop(now + duration);
      sources.push(noiseSource);
    }

    const timer = window.setTimeout(() => {
      this.stopPreview();
      if (onEnd) onEnd();
    }, duration * 1000);

    this.previewNodes = {
      oscillators,
      gains,
      sources,
      merger,
      timer,
    };
  }

  public stopPreview() {
    if (this.previewNodes) {
      if (this.previewNodes.timer) {
        window.clearTimeout(this.previewNodes.timer);
      }
      this.previewNodes.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.previewNodes.sources.forEach((src) => {
        try {
          src.stop();
          src.disconnect();
        } catch {}
      });
      this.previewNodes.gains.forEach((g) => {
        try {
          g.disconnect();
        } catch {}
      });
      if (this.previewNodes.merger) {
        try {
          this.previewNodes.merger.disconnect();
        } catch {}
      }
      this.previewNodes = null;
    }
  }

  private encodeWAV(samples: Float32Array, numChannels: number, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true); // 16-bit

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write PCM audio data
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export const audioEngine = new NeuroAudioEngine();
