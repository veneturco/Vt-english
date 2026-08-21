/**
 * Sintetizador de Audio Procedural 8-bit con Web Audio API Nativa
 * 100% Sin dependencias, cero latencia y compatible con políticas de autoplay modernas.
 */
class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;

  /**
   * Inicialización segura del AudioContext tras la primera interacción del usuario.
   */
  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    return this.ctx;
  }

  /**
   * Sonido de Moneda Retro (Tipo B5 -> E6 arpegio ascendente brillante)
   */
  playCoinSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Nota 1: B5 (987.77 Hz) - Onda Cuadrada / Senoidal mezclada
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(987.77, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.11);

    // Nota 2: E6 (1318.51 Hz) - Resonancia final alegre
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now + 0.08);
    gain2.gain.setValueAtTime(0.25, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.39);
  }

  /**
   * Sonido de Salto Elástico Retro (Rampa exponencial ascendente 150 Hz -> 650 Hz)
   */
  playJumpSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  /**
   * Sonido de Error Suave y Amable (Glissando triangular descendente no punitivo)
   */
  playErrorSoft(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.12);
    osc.frequency.linearRampToValueAtTime(200, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * Fanfarria de Victoria / Recompensa Épica (Triada mayor ascendente: C5 -> E5 -> G5 -> C6)
   */
  playSuccessFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.12 }, // C5
      { freq: 659.25, time: 0.12, duration: 0.12 }, // E5
      { freq: 783.99, time: 0.24, duration: 0.14 }, // G5
      { freq: 1046.5, time: 0.38, duration: 0.45 }, // C6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      gain.gain.setValueAtTime(0.22, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.duration + 0.01);
    });
  }
}

// Instancia singleton exportada
export const audioSynth = new ProceduralAudioEngine();
export const playCoinSound = () => audioSynth.playCoinSound();
export const playJumpSound = () => audioSynth.playJumpSound();
export const playErrorSoft = () => audioSynth.playErrorSoft();
export const playSuccessFanfare = () => audioSynth.playSuccessFanfare();
