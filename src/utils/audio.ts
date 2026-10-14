// Web Audio API ambient sound generator and timer completion chime
class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private activeSound: string | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playChime() {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, now); // Solfeggio frequency
      osc1.frequency.exponentialRampToValueAtTime(792, now + 0.3);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1056, now);
      osc2.frequency.exponentialRampToValueAtTime(1056, now + 1.2);

      chimeGain.gain.setValueAtTime(0.01, now);
      chimeGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc1.connect(chimeGain);
      osc2.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.9);
      osc2.stop(now + 1.9);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  public startAmbient(type: 'rain' | 'focus-drone' | 'coffee-shop' | 'campfire', volume: number = 0.4) {
    try {
      this.initContext();
      if (!this.ctx) return;
      this.stopAmbient();

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;
      this.activeSound = type;

      if (type === 'focus-drone') {
        // Binaural 432Hz + 434Hz gentle drone with warm sub harmonic
        const now = this.ctx.currentTime;
        const oscLeft = this.ctx.createOscillator();
        const oscRight = this.ctx.createOscillator();
        const oscSub = this.ctx.createOscillator();

        oscLeft.type = 'sine';
        oscLeft.frequency.setValueAtTime(216, now); // A3

        oscRight.type = 'sine';
        oscRight.frequency.setValueAtTime(218, now); // 2Hz beat frequency for calm focus

        oscSub.type = 'triangle';
        oscSub.frequency.setValueAtTime(108, now); // warm sub-base

        const droneFilter = this.ctx.createBiquadFilter();
        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(320, now);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.15, now);

        oscSub.connect(subGain);
        subGain.connect(droneFilter);
        oscLeft.connect(droneFilter);
        oscRight.connect(droneFilter);
        droneFilter.connect(masterGain);

        oscLeft.start(now);
        oscRight.start(now);
        oscSub.start(now);

        this.currentSource = droneFilter;
      } else {
        // Noise-based generators (rain, coffee shop, campfire)
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'rain') {
            // Brown-pink weighted noise for rain
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * 3.5;
          } else if (type === 'campfire') {
            // Random crackle impulses
            const crackle = Math.random() > 0.997 ? (Math.random() * 2 - 1) * 0.9 : 0;
            data[i] = white * 0.15 + crackle;
          } else {
            // Coffee shop pink noise
            lastOut = (lastOut + 0.05 * white) / 1.05;
            data[i] = lastOut * 2.5;
          }
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;

        const filter = this.ctx.createBiquadFilter();
        if (type === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(750, this.ctx.currentTime);
        } else if (type === 'campfire') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
          filter.Q.setValueAtTime(0.8, this.ctx.currentTime);
        } else {
          // coffee shop murmur
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, this.ctx.currentTime);
        }

        noiseNode.connect(filter);
        filter.connect(masterGain);
        noiseNode.start(0);

        this.currentSource = noiseNode;
      }
    } catch (e) {
      console.warn('Ambient sound playback error:', e);
    }
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public stopAmbient() {
    if (this.currentSource) {
      try {
        if ('stop' in this.currentSource && typeof (this.currentSource as any).stop === 'function') {
          (this.currentSource as any).stop();
        }
        this.currentSource.disconnect();
      } catch (e) {
        // ignore disconnect error
      }
      this.currentSource = null;
    }
    this.activeSound = null;
  }

  public getActiveSound(): string | null {
    return this.activeSound;
  }
}

export const soundEngine = new SoundEngine();
