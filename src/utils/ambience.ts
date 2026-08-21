// Web Audio API procedural sound engine for ambient background environments
class AmbienceEngine {
  private ctx: AudioContext | null = null;
  private currentMode: string = "off";
  private gainNode: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private volume: number = 0.25;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentMode(): string {
    return this.currentMode;
  }

  public playAmbience(type: "cafe" | "airport" | "rain" | "office" | "off") {
    this.initContext();
    this.stopAmbience();

    if (type === "off" || !this.ctx) {
      this.currentMode = "off";
      return;
    }

    this.currentMode = type;

    try {
      // Create master gain
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      // Create pink noise buffer (2 seconds loop)
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = buffer;
      this.noiseSource.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();

      if (type === "cafe") {
        // Cafe warmth: Bandpass with gentle frequency modulation for muffled chatter & warmth
        this.filterNode.type = "bandpass";
        this.filterNode.frequency.setValueAtTime(650, this.ctx.currentTime);
        this.filterNode.Q.setValueAtTime(1.2, this.ctx.currentTime);
      } else if (type === "rain") {
        // Gentle Rain: Lowpass with higher frequency
        this.filterNode.type = "lowpass";
        this.filterNode.frequency.setValueAtTime(1200, this.ctx.currentTime);
      } else if (type === "airport") {
        // Airport terminal murmur: Wide bandpass & lower resonance
        this.filterNode.type = "bandpass";
        this.filterNode.frequency.setValueAtTime(450, this.ctx.currentTime);
        this.filterNode.Q.setValueAtTime(0.8, this.ctx.currentTime);
      } else if (type === "office") {
        // Quiet office: subtle hum and lowpass
        this.filterNode.type = "lowpass";
        this.filterNode.frequency.setValueAtTime(500, this.ctx.currentTime);
      }

      this.noiseSource.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.noiseSource.start(0);
    } catch (err) {
      console.warn("Ambience engine audio start error:", err);
    }
  }

  public stopAmbience() {
    try {
      if (this.noiseSource) {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
        this.noiseSource = null;
      }
      if (this.filterNode) {
        this.filterNode.disconnect();
        this.filterNode = null;
      }
      if (this.lfoNode) {
        this.lfoNode.stop();
        this.lfoNode.disconnect();
        this.lfoNode = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch (e) {
      // ignore cleanup errors
    }
    this.currentMode = "off";
  }
}

export const ambienceEngine = new AmbienceEngine();
