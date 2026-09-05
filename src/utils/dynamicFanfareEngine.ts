// Web Audio API Native Dynamic Fanfare Synthesizer with Progressive Multi-Tap Echo & Spatial Harmonics
import { haptics } from "./haptics";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export interface DynamicFanfareOptions {
  isSessionVictory?: boolean;
  volumeMultiplier?: number;
  pitchShiftFactor?: number;
  echoDelayTime?: number;
  echoFeedback?: number;
}

/**
 * Plays a rich, progressive fanfare with dynamic echo trails.
 * As the level/streak increases:
 * - The harmonic layers (sub-octave, brass lead, high shimmer chimes) multiply.
 * - The melodic sequence extends from 4 notes to 6, 8, or 12 notes.
 * - The echo delay trails become richer with resonant spatial feedback.
 */
export function playDynamicEchoFanfare(
  progressionLevel: number = 1,
  options: DynamicFanfareOptions = {}
): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const {
      isSessionVictory = false,
      volumeMultiplier = 1.0,
      pitchShiftFactor = 1.0,
      echoDelayTime,
      echoFeedback,
    } = options;

    const now = ctx.currentTime;
    const level = Math.max(1, progressionLevel);

    // Dynamic Haptic Feedback
    if (isSessionVictory || level >= 8) {
      haptics.lessonComplete();
    } else if (level >= 4) {
      haptics.celebrate();
    } else {
      haptics.success();
    }

    // 1. MASTER OUTPUT & COMPRESSOR FOR CRISP DYNAMICS
    const masterCompressor = ctx.createDynamicsCompressor();
    masterCompressor.threshold.setValueAtTime(-12, now);
    masterCompressor.knee.setValueAtTime(8, now);
    masterCompressor.ratio.setValueAtTime(4, now);
    masterCompressor.attack.setValueAtTime(0.003, now);
    masterCompressor.release.setValueAtTime(0.15, now);
    masterCompressor.connect(ctx.destination);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.24 * volumeMultiplier, now);
    masterGain.connect(masterCompressor);

    // 2. ECHO / REVERB DELAY UNIT WITH FILTERED FEEDBACK
    // Delay time scales slightly based on level progression (140ms - 210ms)
    const computedDelayTime =
      echoDelayTime ?? (isSessionVictory ? 0.22 : Math.min(0.21, 0.14 + level * 0.008));
    // Echo feedback scales with level (0.28 for Level 1 up to 0.58 for Grand Victory)
    const computedFeedback =
      echoFeedback ?? (isSessionVictory ? 0.58 : Math.min(0.55, 0.28 + level * 0.035));

    const delayNode = ctx.createDelay(1.0);
    delayNode.delayTime.setValueAtTime(computedDelayTime, now);

    const feedbackGain = ctx.createGain();
    feedbackGain.gain.setValueAtTime(computedFeedback, now);
    feedbackGain.gain.exponentialRampToValueAtTime(0.001, now + (isSessionVictory ? 3.5 : 2.2));

    // Warm dampening lowpass filter on echo repeats for organic acoustic space
    const echoFilter = ctx.createBiquadFilter();
    echoFilter.type = "lowpass";
    echoFilter.frequency.setValueAtTime(Math.min(4200, 2400 + level * 200), now);

    // Route: Dry Signal -> DelayNode -> EchoFilter -> FeedbackGain -> DelayNode
    delayNode.connect(echoFilter);
    echoFilter.connect(feedbackGain);
    feedbackGain.connect(delayNode);

    // Delay Output Gain
    const echoOutputGain = ctx.createGain();
    const echoMix = Math.min(0.48, 0.22 + level * 0.03);
    echoOutputGain.gain.setValueAtTime(echoMix, now);
    delayNode.connect(echoOutputGain);
    echoOutputGain.connect(masterCompressor);

    // 3. SELECT MELODIC PROGRESSION SUITE ACCORDING TO LEVEL
    // Base Frequencies in C Major / G Mixolydian triumph
    const C4 = 261.63 * pitchShiftFactor;
    const D4 = 293.66 * pitchShiftFactor;
    const E4 = 329.63 * pitchShiftFactor;
    const F4 = 349.23 * pitchShiftFactor;
    const G4 = 392.00 * pitchShiftFactor;
    const A4 = 440.00 * pitchShiftFactor;
    const B4 = 493.88 * pitchShiftFactor;
    const C5 = 523.25 * pitchShiftFactor;
    const D5 = 587.33 * pitchShiftFactor;
    const E5 = 659.25 * pitchShiftFactor;
    const F5 = 698.46 * pitchShiftFactor;
    const G5 = 783.99 * pitchShiftFactor;
    const A5 = 880.00 * pitchShiftFactor;
    const B5 = 987.77 * pitchShiftFactor;
    const C6 = 1046.50 * pitchShiftFactor;
    const D6 = 1174.66 * pitchShiftFactor;
    const E6 = 1318.51 * pitchShiftFactor;
    const G6 = 1567.98 * pitchShiftFactor;

    interface FanfareNote {
      freq: number;
      delay: number;
      dur: number;
      gain: number;
      hasSub?: boolean;
      hasSparkle?: boolean;
      type?: OscillatorType;
    }

    let notes: FanfareNote[] = [];

    if (isSessionVictory || level >= 10) {
      // 🌟 STAGE 4: GRAND ORCHESTRAL SYNTH ANTHEM (11 Notes + Chords + Shimmer Cascade)
      notes = [
        { freq: C4, delay: 0.00, dur: 0.12, gain: 0.22, hasSub: true },
        { freq: G4, delay: 0.09, dur: 0.12, gain: 0.24, hasSub: true },
        { freq: C5, delay: 0.18, dur: 0.12, gain: 0.26, hasSub: true },
        { freq: E5, delay: 0.27, dur: 0.12, gain: 0.28, hasSparkle: true },
        { freq: G5, delay: 0.36, dur: 0.14, gain: 0.30, hasSparkle: true },
        { freq: A5, delay: 0.49, dur: 0.12, gain: 0.30, hasSparkle: true },
        { freq: B5, delay: 0.59, dur: 0.12, gain: 0.32, hasSparkle: true },
        { freq: C6, delay: 0.70, dur: 0.25, gain: 0.35, hasSub: true, hasSparkle: true },
        { freq: D6, delay: 0.92, dur: 0.18, gain: 0.33, hasSparkle: true },
        { freq: E6, delay: 1.08, dur: 0.55, gain: 0.40, hasSub: true, hasSparkle: true },
        // Final Majestic Harmony Chord Overtones
        { freq: G6, delay: 1.10, dur: 0.55, gain: 0.25, hasSparkle: true, type: "sine" },
        { freq: C5, delay: 1.08, dur: 0.55, gain: 0.28, hasSub: true, type: "triangle" },
      ];
    } else if (level >= 6) {
      // 🏆 STAGE 3: HEROIC BRASS FANFARE (8 Notes with High Climaxes & Shimmer)
      notes = [
        { freq: G4, delay: 0.00, dur: 0.10, gain: 0.22, hasSub: true },
        { freq: C5, delay: 0.09, dur: 0.10, gain: 0.24, hasSub: true },
        { freq: E5, delay: 0.18, dur: 0.10, gain: 0.26, hasSparkle: true },
        { freq: G5, delay: 0.27, dur: 0.12, gain: 0.28, hasSparkle: true },
        { freq: A5, delay: 0.38, dur: 0.10, gain: 0.28, hasSparkle: true },
        { freq: B5, delay: 0.47, dur: 0.10, gain: 0.30, hasSparkle: true },
        { freq: C6, delay: 0.56, dur: 0.45, gain: 0.36, hasSub: true, hasSparkle: true },
        { freq: G5, delay: 0.58, dur: 0.45, gain: 0.20, type: "sine" }, // Sustained harmony fifth
      ];
    } else if (level >= 3) {
      // 🚀 STAGE 2: DYNAMIC ASCENDING FANFARE (6 Notes with Dual Reflections)
      notes = [
        { freq: C5, delay: 0.00, dur: 0.09, gain: 0.22, hasSub: true },
        { freq: E5, delay: 0.08, dur: 0.09, gain: 0.24 },
        { freq: G5, delay: 0.16, dur: 0.10, gain: 0.26, hasSparkle: true },
        { freq: A5, delay: 0.25, dur: 0.09, gain: 0.28 },
        { freq: B5, delay: 0.33, dur: 0.10, gain: 0.30, hasSparkle: true },
        { freq: C6, delay: 0.42, dur: 0.38, gain: 0.34, hasSub: true, hasSparkle: true },
      ];
    } else {
      // ⚡ STAGE 1: CRISP 4-NOTE TRIUMPH (Warm introduction with sparkling echo)
      notes = [
        { freq: C5, delay: 0.00, dur: 0.08, gain: 0.22 },
        { freq: E5, delay: 0.07, dur: 0.08, gain: 0.24 },
        { freq: G5, delay: 0.14, dur: 0.10, gain: 0.26 },
        { freq: C6, delay: 0.22, dur: 0.32, gain: 0.32, hasSub: true, hasSparkle: true },
      ];
    }

    // 4. SYNTHESIZE VOICES & CHANNELS
    notes.forEach((note) => {
      const noteStart = now + note.delay;
      const noteEnd = noteStart + note.dur;

      // VOICE A: Main Warm Brass/Lead (Rich Triangle + Slight Warmth)
      const oscLead = ctx.createOscillator();
      const gainLead = ctx.createGain();
      oscLead.type = note.type || (level >= 5 ? "triangle" : "sine");
      oscLead.frequency.setValueAtTime(note.freq, noteStart);

      gainLead.gain.setValueAtTime(0.0001, noteStart);
      gainLead.gain.linearRampToValueAtTime(note.gain, noteStart + 0.015);
      gainLead.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      // Connect Lead to Master and Echo Delay
      oscLead.connect(gainLead);
      gainLead.connect(masterGain);
      gainLead.connect(delayNode);

      oscLead.start(noteStart);
      oscLead.stop(noteEnd + 0.05);

      // VOICE B: Sub-Octave Foundation (for punchy fullness)
      if (note.hasSub) {
        const oscSub = ctx.createOscillator();
        const gainSub = ctx.createGain();
        oscSub.type = "sine";
        oscSub.frequency.setValueAtTime(note.freq / 2, noteStart);

        gainSub.gain.setValueAtTime(0.0001, noteStart);
        gainSub.gain.linearRampToValueAtTime(note.gain * 0.45, noteStart + 0.02);
        gainSub.gain.exponentialRampToValueAtTime(0.001, noteEnd + 0.05);

        oscSub.connect(gainSub);
        gainSub.connect(masterGain);
        gainSub.connect(delayNode);

        oscSub.start(noteStart);
        oscSub.stop(noteEnd + 0.08);
      }

      // VOICE C: High Crystal Sparkle Shimmer (Bell harmonics)
      if (note.hasSparkle && level >= 2) {
        const oscSparkle = ctx.createOscillator();
        const gainSparkle = ctx.createGain();
        oscSparkle.type = "sine";
        // 2x or 3x harmonic overtone
        oscSparkle.frequency.setValueAtTime(note.freq * 2, noteStart + 0.01);
        oscSparkle.frequency.exponentialRampToValueAtTime(note.freq * 2.02, noteEnd);

        gainSparkle.gain.setValueAtTime(0.0001, noteStart + 0.01);
        gainSparkle.gain.linearRampToValueAtTime(note.gain * 0.28, noteStart + 0.02);
        gainSparkle.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.22);

        oscSparkle.connect(gainSparkle);
        gainSparkle.connect(masterGain);
        gainSparkle.connect(delayNode);

        oscSparkle.start(noteStart + 0.01);
        oscSparkle.stop(noteStart + 0.25);
      }
    });
  } catch (err) {
    console.warn("Dynamic fanfare synthesizer error:", err);
  }
}
