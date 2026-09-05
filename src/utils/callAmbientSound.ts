// Ambient sound synthesizer using Web Audio API for immersive call scenarios
class CallAmbientSoundManager {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private currentMode: "off" | "cafe" | "airport" | "rain" | "office" = "off";

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMode(mode: "off" | "cafe" | "airport" | "rain" | "office", volume: number = 0.12) {
    this.currentMode = mode;
    this.stop();

    if (mode === "off") return;

    this.init();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink / Brown noise generation for realistic ambient background
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.filterNode = this.ctx.createBiquadFilter();
    this.gainNode = this.ctx.createGain();

    if (mode === "cafe") {
      // Café warm bandpass murmur
      this.filterNode.type = "bandpass";
      this.filterNode.frequency.value = 650;
      this.filterNode.Q.value = 0.8;
      this.gainNode.gain.value = volume * 0.8;
    } else if (mode === "airport") {
      // Airport low rumble + air circulation
      this.filterNode.type = "lowpass";
      this.filterNode.frequency.value = 400;
      this.gainNode.gain.value = volume * 0.7;
    } else if (mode === "rain") {
      // Soothing rain
      this.filterNode.type = "lowpass";
      this.filterNode.frequency.value = 1200;
      this.gainNode.gain.value = volume * 0.6;
    } else if (mode === "office") {
      // Focused office hum
      this.filterNode.type = "bandpass";
      this.filterNode.frequency.value = 320;
      this.filterNode.Q.value = 1.2;
      this.gainNode.gain.value = volume * 0.5;
    }

    whiteNoise.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {}
      this.noiseNode = null;
    }
  }
}

export const callAmbientSound = new CallAmbientSoundManager();
