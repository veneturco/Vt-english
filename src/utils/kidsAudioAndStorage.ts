import { KidsProgressState } from "../types";

const KIDS_STORAGE_KEY = "lingua_kids_progress_v3";

export function getStoredKidsProgress(): KidsProgressState {
  try {
    const saved = localStorage.getItem(KIDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        totalStars: parsed.totalStars ?? 6,
        fossilCoins: parsed.fossilCoins ?? 150,
        unlockedStickers: parsed.unlockedStickers ?? ["mario_star", "yoshi_dino", "baby_trex"],
        completedCards: parsed.completedCards ?? ["dino_dog", "dino_cat"],
        levelScores: parsed.levelScores ?? { dino_dog: 3, dino_cat: 3, dino_red: 2 },
        unlockedWorlds: parsed.unlockedWorlds ?? ["dino_valley", "adventure_kingdom"],
        currentWorldId: parsed.currentWorldId ?? "dino_valley",
        streakDays: parsed.streakDays ?? 3,
        dailyQuestsCompleted: parsed.dailyQuestsCompleted ?? 2,
        dinoEggStage: parsed.dinoEggStage ?? 1,
        equippedHat: parsed.equippedHat ?? "mario_cap",
        equippedBackpack: parsed.equippedBackpack ?? "explorer_canvas",
        equippedAura: parsed.equippedAura,
      };
    }
  } catch (e) {}

  return {
    totalStars: 6,
    fossilCoins: 150,
    unlockedStickers: ["mario_star", "yoshi_dino", "baby_trex"],
    completedCards: ["dino_dog", "dino_cat"],
    levelScores: { dino_dog: 3, dino_cat: 3, dino_red: 2 },
    unlockedWorlds: ["dino_valley", "adventure_kingdom"],
    currentWorldId: "dino_valley",
    streakDays: 3,
    dailyQuestsCompleted: 2,
    dinoEggStage: 1, // 0: rock, 1: cracked, 2: hatched baby, 3: golden raptor
    equippedHat: "mario_cap",
    equippedBackpack: "explorer_canvas",
  };
}

export function saveStoredKidsProgress(progress: KidsProgressState): void {
  try {
    localStorage.setItem(KIDS_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {}
}

/**
 * Procedural 8-bit & Web Audio API Sound Synthesizer
 * 100% Free, Zero MP3 Dependencies, Instant Zero-Latency Browser Playback
 */
class KidsAudioSFX {
  private ctx: AudioContext | null = null;

  private initCtx() {
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

  /**
   * 1. Retro 8-bit Coin Sound (Classic B5 -> E6 ping)
   */
  playCoinSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Note 1: B5 (987.77Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.22, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Note 2: E6 (1318.51Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      gain2.gain.setValueAtTime(0.28, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.43);
    } catch (e) {}
  }

  /**
   * 2. Short & Cheerful Success Fanfare (8-bit Victory Arpeggio)
   */
  playSuccessFanfare() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Arpeggio notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.5), E6 (1318.51)
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.09;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = idx === notes.length - 1 ? "triangle" : "square";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          startTime + (idx === notes.length - 1 ? 0.45 : 0.2)
        );

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + (idx === notes.length - 1 ? 0.46 : 0.21));
      });
    } catch (e) {}
  }

  /**
   * 3. Soft, Non-Punitive Encouragement Tone for Retries (Gentle Spring Wobble)
   */
  playErrorSoft() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.linearRampToValueAtTime(390, now + 0.07);
      osc.frequency.linearRampToValueAtTime(280, now + 0.16);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.27);
    } catch (e) {}
  }

  /**
   * 4. Retro 8-bit Jump Sound (Rising Pitch Whoosh)
   */
  playJumpSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.18);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {}
  }

  /**
   * 5. Pop Bubble (Instant Tactile Feedback)
   */
  playPopBubble() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.06);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  /**
   * 6. Dinosaur Munch & Crunch for Feeding Minigame
   */
  playDinoMunch() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.08, 0.16].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(240 + idx * 40 + Math.random() * 50, now + offset);
        osc.frequency.exponentialRampToValueAtTime(110, now + offset + 0.07);

        gain.gain.setValueAtTime(0.22, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });
    } catch (e) {}
  }

  /**
   * 7. Dino Egg Hatching & Shell Crack with Sparkles
   */
  playEggCrack() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Crack burst 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "square";
      osc1.frequency.setValueAtTime(120, now);
      osc1.frequency.exponentialRampToValueAtTime(40, now + 0.09);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.1);

      // Crack burst 2 (Higher fracture)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(800, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(220, now + 0.15);
      gain2.gain.setValueAtTime(0.25, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.19);

      // Triumphant birth sparkle
      const sparkleNotes = [659.25, 783.99, 1046.5, 1318.51, 1567.98];
      sparkleNotes.forEach((f, i) => {
        const time = now + 0.15 + i * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(time);
        osc.stop(time + 0.31);
      });
    } catch (e) {}
  }

  /**
   * Block Hit with Coin Ding
   */
  playBlockHitCoin() {
    this.playCoinSound();
  }

  /**
   * Pipe Slide
   */
  playPipeSlide() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.24);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  /**
   * Star Sparkle Chime
   */
  playStarSparkle() {
    this.playSuccessFanfare();
  }

  /**
   * Gentle Bounce alias
   */
  playGentleBounce() {
    this.playErrorSoft();
  }

  /**
   * Victory Fanfare alias
   */
  playVictoryFanfare() {
    this.playSuccessFanfare();
  }
}

export const kidsSFX = new KidsAudioSFX();
