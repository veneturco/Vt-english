/**
 * Sintetizador de Audio Procedural 8-bit con Web Audio API Nativa
 * 100% Sin dependencias, cero latencia, tonos chiptune retro y compatible con políticas de autoplay.
 */
class Audio8BitSynthEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  /**
   * Inicialización segura del AudioContext tras la interacción del usuario.
   */
  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Activar / Desactivar silencio
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 1. Sonido de Moneda 8-bit Retro (playCoinSound)
   * Clásico efecto arcade: Arpegio B5 (987.77 Hz) -> E6 (1318.51 Hz) con onda cuadrada / pulso retro
   */
  public playCoinSound(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Nota 1: B5 (987.77 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "square";
    osc1.frequency.setValueAtTime(987.77, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.095);

    // Nota 2: E6 (1318.51 Hz) con sostenido brillante
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(1318.51, now + 0.08);
    gain2.gain.setValueAtTime(0.22, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.36);
  }

  /**
   * 2. Sonido de Salto Elástico 8-bit (playJumpSound)
   * Rampa de frecuencia rápida ascendente estilo NES (140 Hz -> 680 Hz)
   */
  public playJumpSound(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.16);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  /**
   * 3. Sonido de Error Suave y Amable 8-bit (playErrorSoft)
   * Glissando descendente no punitivo con onda triangular suave (330 Hz -> 240 Hz -> 175 Hz)
   */
  public playErrorSoft(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.linearRampToValueAtTime(240, now + 0.1);
    osc.frequency.linearRampToValueAtTime(175, now + 0.22);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * 4. Fanfarria de Victoria 8-bit (playSuccessFanfare)
   * Triada mayor ascendente estilo Game Boy (C5 -> E5 -> G5 -> C6)
   */
  public playSuccessFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.1 }, // C5
      { freq: 659.25, time: 0.1, duration: 0.1 }, // E5
      { freq: 783.99, time: 0.2, duration: 0.12 }, // G5
      { freq: 1046.5, time: 0.32, duration: 0.4 }, // C6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      gain.gain.setValueAtTime(0.18, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.duration + 0.01);
    });
  }

  /**
   * 5. Sonido de Pop / Click 8-bit (playPopSound)
   */
  public playPopSound(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * 6. Power-up 8-bit (playPowerupSound)
   */
  public playPowerupSound(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [330, 392, 523, 659, 784, 1046];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.05;
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    });
  }

  /**
   * 7. Fanfarria de Victoria Infantil (playVictoryFanfare)
   * Arpegio rápido ascendente brillante (C5 -> E5 -> G5 -> C6 -> E6)
   */
  public playVictoryFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.08 }, // C5
      { freq: 659.25, time: 0.08, duration: 0.08 }, // E5
      { freq: 783.99, time: 0.16, duration: 0.08 }, // G5
      { freq: 1046.5, time: 0.24, duration: 0.14 }, // C6
      { freq: 1318.5, time: 0.38, duration: 0.45 }, // E6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      gain.gain.setValueAtTime(0.2, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.duration + 0.01);
    });
  }

  /**
   * 8. Sonido de Moneda / Bling (playCoinCollect)
   */
  public playCoinCollect(): void {
    this.playCoinSound();
  }

  /**
   * 9. Sonido Suave de Reintento (playTryAgainSoft)
   * Tono amable y curioso con onda sinusoidal suave (no punitivo)
   */
  public playTryAgainSoft(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(392, now); // G4
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12); // A4
    osc.frequency.exponentialRampToValueAtTime(349.23, now + 0.28); // F4

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.33);
  }
}

// Instancia singleton exportada
export const audioSynth = new Audio8BitSynthEngine();

// Funciones utilitarias directas
export const playCoinSound = () => audioSynth.playCoinSound();
export const playCoinCollect = () => audioSynth.playCoinCollect();
export const playJumpSound = () => audioSynth.playJumpSound();
export const playErrorSoft = () => audioSynth.playErrorSoft();
export const playTryAgainSoft = () => audioSynth.playTryAgainSoft();
export const playSuccessFanfare = () => audioSynth.playSuccessFanfare();
export const playVictoryFanfare = () => audioSynth.playVictoryFanfare();
export const playPopSound = () => audioSynth.playPopSound();
export const playPowerupSound = () => audioSynth.playPowerupSound();
