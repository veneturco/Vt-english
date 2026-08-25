import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { AvatarAccessory, AvatarAnimationState, AvatarConfig } from "../types";
import { soundFx } from "../utils/soundFx";
import { RigOverlay2D } from "./RigOverlay2D";
import {
  SuperMarioMascot,
  LuigiMascot,
  GoombaMascot,
  RexyMascot,
  PipRaptorMascot,
  TurpialSpriteRig,
  TurpialSpriteRig25D,
} from "./mascots/MascotRenderers";
import {
  Sparkles,
  Lightbulb,
  Heart,
  Smile,
  Zap,
  PartyPopper,
  HelpCircle,
  Flame,
  Clock,
  Award,
} from "lucide-react";

export type MascotGestureEmotion =
  | "idle"
  | "speaking"
  | "listening"
  | "alegre"
  | "pensativo"
  | "sorpresa"
  | "encouraging"
  | "celebrating"
  | "loving";

interface Avatar2DCanvasProps {
  config: AvatarConfig;
  animationState: AvatarAnimationState;
  mouthIntensity?: number; // 0 to 1
  isListening?: boolean;
  onMascotClick?: () => void;
  overrideEmotion?: MascotGestureEmotion | null;
  onCustomizerClick?: () => void;
  isDailyGoalCelebration?: boolean;
  dailyGoalAchievedTrigger?: number;
}

export const Avatar2DCanvas: React.FC<Avatar2DCanvasProps> = ({
  config,
  animationState,
  mouthIntensity = 0,
  isListening = false,
  onMascotClick,
  overrideEmotion = null,
  onCustomizerClick,
  isDailyGoalCelebration = false,
  dailyGoalAchievedTrigger = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [activeEmote, setActiveEmote] = useState<string | null>(null);
  const [currentGesture, setCurrentGesture] = useState<MascotGestureEmotion>("idle");
  const [visemeIndex, setVisemeIndex] = useState<number>(0);
  const [eyeSaccade, setEyeSaccade] = useState({ x: 0, y: 0 });
  const [idleNudge, setIdleNudge] = useState<string | null>(null);
  const [idleHeadAngle, setIdleHeadAngle] = useState<number>(0);
  const [isPoked, setIsPoked] = useState<boolean>(false);
  const [speechAperture, setSpeechAperture] = useState<number>(0);
  const [isMedalGoalCelebrating, setIsMedalGoalCelebrating] = useState<boolean>(false);
  const prevGoalTriggerRef = useRef<number>(dailyGoalAchievedTrigger);
  const lastInteractionTime = useRef<number>(Date.now());

  // Listen for Daily Goal Achievement to trigger Medal Entrance Scale-In celebration
  useEffect(() => {
    if (
      isDailyGoalCelebration ||
      (dailyGoalAchievedTrigger > 0 && dailyGoalAchievedTrigger !== prevGoalTriggerRef.current)
    ) {
      prevGoalTriggerRef.current = dailyGoalAchievedTrigger;
      setIsMedalGoalCelebrating(true);
      const timer = setTimeout(() => {
        setIsMedalGoalCelebrating(false);
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [isDailyGoalCelebration, dailyGoalAchievedTrigger]);

  // Map incoming AvatarAnimationState to effective gesture emotion
  const mappedAnimationEmotion: MascotGestureEmotion =
    animationState === "loving"
      ? "loving"
      : animationState === "celebrating"
      ? "celebrating"
      : animationState === "alegre"
      ? "alegre"
      : animationState === "pensativo"
      ? "pensativo"
      : animationState === "sorpresa"
      ? "sorpresa"
      : animationState === "encouraging"
      ? "alegre"
      : animationState === "speaking"
      ? "speaking"
      : animationState === "listening" || isListening
      ? "listening"
      : "idle";

  // Effective emotion state combining overrides, manual gesture clicks, and app state
  const effectiveEmotion: MascotGestureEmotion =
    overrideEmotion || (currentGesture !== "idle" ? currentGesture : mappedAnimationEmotion);

  // 1. Inactivity (Idle Behavior) Timer
  const recordUserActivity = () => {
    lastInteractionTime.current = Date.now();
    if (idleNudge) {
      setIdleNudge(null);
    }
  };

  useEffect(() => {
    const idleCheckInterval = setInterval(() => {
      const idleSeconds = (Date.now() - lastInteractionTime.current) / 1000;
      if (
        idleSeconds >= 13 &&
        effectiveEmotion === "idle" &&
        !isListening &&
        mouthIntensity < 0.05 &&
        !idleNudge
      ) {
        const nudges = [
          "💭 ¡Tómate tu tiempo, tú puedes!",
          "✨ I'm right here whenever you're ready!",
          "🎯 ¡Intenta responder con un chip abajo!",
          "💡 ¿Quieres que repitamos el audio lento?",
        ];
        const chosen = nudges[Math.floor(Math.random() * nudges.length)];
        setIdleNudge(chosen);
        setEyeSaccade({ x: 3, y: 3 });
      }
    }, 3000);

    return () => clearInterval(idleCheckInterval);
  }, [effectiveEmotion, isListening, mouthIntensity, idleNudge]);

  // 2. Natural Micro-Saccades (Subtle living eye glances & cognitive shifts)
  useEffect(() => {
    let saccadeInterval: NodeJS.Timeout;
    const triggerSaccade = () => {
      if (effectiveEmotion === "pensativo") {
        setEyeSaccade({ x: 5, y: -4.5 }); // Looking thoughtfully up and to the right
      } else if (effectiveEmotion === "sorpresa") {
        setEyeSaccade({ x: 0, y: -1 }); // Centered wide open gaze
      } else {
        const sx = (Math.random() - 0.5) * 2.8;
        const sy = (Math.random() - 0.5) * 2.2;
        setEyeSaccade({ x: sx, y: sy });
      }
      const nextTime = Math.random() * 2200 + 1200;
      saccadeInterval = setTimeout(triggerSaccade, nextTime);
    };
    saccadeInterval = setTimeout(triggerSaccade, 1500);
    return () => clearTimeout(saccadeInterval);
  }, [effectiveEmotion]);

  // 3. Realistic Natural Blinking with occasional Double-Blink
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const triggerBlink = () => {
      // Don't blink if in wide-eyed surprise
      if (effectiveEmotion !== "sorpresa") {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          // 25% chance of an adorable double blink
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setIsBlinking(true);
              setTimeout(() => setIsBlinking(false), 110);
            }, 140);
          }
        }, 120);
      }

      const nextBlinkDelay = Math.random() * 3200 + 2000;
      blinkTimer = setTimeout(triggerBlink, nextBlinkDelay);
    };
    blinkTimer = setTimeout(triggerBlink, 2800);
    return () => clearTimeout(blinkTimer);
  }, [effectiveEmotion]);

  // 3.5. Organic Curious Head-Tilt Oscillations during Idle
  useEffect(() => {
    let tiltTimer: NodeJS.Timeout;
    const triggerIdleTilt = () => {
      if (effectiveEmotion === "idle" && !isListening && mouthIntensity < 0.05) {
        const angles = [-4.2, 0, 4.2, 0, -3.5, 3.5];
        const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
        setIdleHeadAngle(chosenAngle);
      } else {
        setIdleHeadAngle(0);
      }
      const nextDelay = Math.random() * 3400 + 2600;
      tiltTimer = setTimeout(triggerIdleTilt, nextDelay);
    };
    tiltTimer = setTimeout(triggerIdleTilt, 2000);
    return () => clearTimeout(tiltTimer);
  }, [effectiveEmotion, isListening, mouthIntensity]);

  // 4. Phonetic Viseme Harmonic Oscillator during Speech (Lip / Beak Sync)
  useEffect(() => {
    let visemeInterval: NodeJS.Timeout;
    let animId: number;

    if (effectiveEmotion === "speaking" || mouthIntensity > 0.04) {
      visemeInterval = setInterval(() => {
        // Cycle through speech visemes: 0=open_aa, 1=smile_ee, 2=round_oo, 3=teeth_ch
        setVisemeIndex((prev) => (prev + 1) % 4);
      }, 100);

      const startTime = Date.now();
      const updateAperture = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        // Harmonic rhythm simulating natural syllable speech cadence
        const syllableWave = Math.sin(elapsed * 16) * 0.35 + Math.sin(elapsed * 8) * 0.2 + 0.45;
        setSpeechAperture(Math.max(0.2, Math.min(1.0, syllableWave + mouthIntensity * 0.5)));
        animId = requestAnimationFrame(updateAperture);
      };
      animId = requestAnimationFrame(updateAperture);
    } else {
      setVisemeIndex(0);
      setSpeechAperture(0);
    }

    return () => {
      clearInterval(visemeInterval);
      cancelAnimationFrame(animId);
    };
  }, [effectiveEmotion, mouthIntensity]);

  // 5. Parallax tracking with dampening
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    recordUserActivity();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // 6. Interactive Mascot Gesture & Emotion Trigger
  const triggerGestureAction = (gesture: MascotGestureEmotion, emoji: string) => {
    recordUserActivity();
    setCurrentGesture(gesture);
    setActiveEmote(emoji);

    if (
      gesture === "celebrating" ||
      gesture === "alegre" ||
      gesture === "encouraging" ||
      gesture === "loving"
    ) {
      try {
        confetti({
          particleCount: gesture === "loving" ? 50 : 40,
          spread: 75,
          origin: { y: 0.6 },
          colors:
            gesture === "loving"
              ? ["#f43f5e", "#ec4899", "#fda4af", "#fbbf24", "#ffffff"]
              : ["#fbbf24", "#3b82f6", "#10b981", "#ec4899", "#f59e0b"],
        });
      } catch {
        // Safe fallback
      }
    }

    if (onMascotClick) onMascotClick();

    setTimeout(() => {
      setCurrentGesture("idle");
      setActiveEmote(null);
    }, 2400);
  };

  const handleMascotTap = () => {
    recordUserActivity();
    setIsPoked(true);
    setTimeout(() => setIsPoked(false), 650);
    soundFx.playCharacterStageSound(config.preset);
    const emojis = ["🔥", "✨", "💡", "🌟", "🎉", "💖", "😲", "😍"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const randomGesture: MascotGestureEmotion =
      randomEmoji === "💖" || randomEmoji === "😍"
        ? "loving"
        : Math.random() > 0.6
        ? "alegre"
        : Math.random() > 0.3
        ? "sorpresa"
        : "pensativo";
    triggerGestureAction(randomGesture, randomEmoji);
  };

  // Dynamic 3D tilt calculations
  const tiltX =
    mousePos.y * -14 +
    (effectiveEmotion === "pensativo"
      ? 7
      : effectiveEmotion === "listening"
      ? 5
      : effectiveEmotion === "sorpresa"
      ? -5
      : 0);

  const tiltY =
    mousePos.x * 16 +
    (effectiveEmotion === "pensativo"
      ? -11
      : effectiveEmotion === "speaking"
      ? Math.sin(Date.now() / 150) * 2.5
      : effectiveEmotion === "sorpresa"
      ? 0
      : 0);

  // Pupil offsets (Mouse + Living Saccades + Emotion overrides)
  const isSurprised = effectiveEmotion === "sorpresa";
  const isPensive = effectiveEmotion === "pensativo";
  const isLoving = effectiveEmotion === "loving";
  const isHappy =
    effectiveEmotion === "alegre" ||
    effectiveEmotion === "celebrating" ||
    effectiveEmotion === "encouraging" ||
    isLoving;

  const pupilX = isSurprised
    ? 0
    : isPensive
    ? 4.5
    : Math.max(-7, Math.min(7, mousePos.x * 12 + eyeSaccade.x));

  const pupilY = isSurprised
    ? -0.5
    : isPensive
    ? -4.5
    : Math.max(-5, Math.min(5, mousePos.y * 9 + eyeSaccade.y));

  // Dynamic mouth aperture factoring speech intensity, visemes & surprised state
  const rawIntensity = Math.max(0, mouthIntensity);
  const isSpeaking = effectiveEmotion === "speaking" || rawIntensity > 0.04 || speechAperture > 0.05;
  const mouthOpenAmount = isSpeaking
    ? Math.max(0.25, Math.min(1.0, speechAperture || (rawIntensity * 1.6 + (visemeIndex % 2 === 0 ? 0.25 : 0.05))))
    : isSurprised
    ? 0.75
    : isHappy
    ? 0.35
    : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={recordUserActivity}
      className={`relative w-full h-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center select-none overflow-hidden ${
        !isSpeaking && !isListening && effectiveEmotion === "idle"
          ? "animate-bobbing"
          : ""
      }`}
      style={{ perspective: "1100px" }}
    >
      {/* 1. Modern Flat Geometric Mascot Stage */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Flat Geometric Circle Stage with Crisp Border */}
        <div
          className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-slate-800/80 border-4 transition-all duration-300 ${
            isLoving
              ? "border-rose-400 bg-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.4)]"
              : isSpeaking
              ? "border-emerald-500 bg-emerald-500/10"
              : isSurprised
              ? "border-purple-400 bg-purple-500/10"
              : isPensive
              ? "border-sky-400 bg-sky-500/10"
              : isHappy
              ? "border-amber-400 bg-amber-500/10"
              : effectiveEmotion === "listening"
              ? "border-sky-400 bg-sky-500/10"
              : "border-slate-700 bg-slate-800/60"
          }`}
        />

        {/* Flat Pedestal Base */}
        <div
          className="absolute bottom-6 w-60 h-4 rounded-full bg-slate-800 border-2 border-slate-700 transition-colors"
        />
      </div>

      {/* 1.5 Heart Particle Overlay for Loving / High Streak / Outstanding Performance */}
      <HeartParticleOverlay active={isLoving} />

      {/* 2. Inactivity (Idle Behavior) Encouraging Badge */}
      <AnimatePresence>
        {idleNudge && !isSpeaking && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: -90, scale: 1 }}
            exit={{ opacity: 0, y: -110, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 z-30 px-3.5 py-1.5 rounded-2xl bg-slate-900 border-2 border-b-4 border-amber-500 text-xs font-bold text-amber-300 flex items-center gap-1.5 pointer-events-none shadow-sm"
          >
            <span>{idleNudge}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Audio Wave Halo (When Speaking) */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.15, 1.25] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-emerald-400 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 4. Inquisitive Focus Rings (When Listening or Pensive) */}
      <AnimatePresence>
        {(effectiveEmotion === "listening" || isPensive) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.15, 1.25] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-sky-400 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 5. Floating Emote Bubble / Idea Particle */}
      <AnimatePresence>
        {activeEmote && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.4 }}
            animate={{ opacity: 1, y: -90, scale: 1.5 }}
            exit={{ opacity: 0, scale: 1.9, y: -135 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="absolute z-30 pointer-events-none text-4xl filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]"
          >
            {activeEmote}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Main 2.5D Animated Mascot Puppet */}
      <motion.div
        onClick={handleMascotTap}
        className={`relative z-10 flex flex-col items-center justify-center origin-bottom cursor-pointer group transform-gpu ${
          isPoked ? "animate-spring-poke" : ""
        } ${
          !isSpeaking && !isListening && effectiveEmotion === "idle"
            ? "animate-turpial-breathing"
            : ""
        }`}
        animate={{
          y: isSurprised
            ? [-16, -14]
            : isHappy
            ? [-22, 0, -18, 0]
            : isSpeaking
            ? [0, -6, 0]
            : isPensive
            ? [-5, -5]
            : effectiveEmotion === "listening"
            ? [0, -3, 0]
            : [0, -5, 0],
          scaleY: isSurprised
            ? [1.06, 1.04]
            : isHappy
            ? [1.12, 0.92, 1.06, 1]
            : isSpeaking
            ? [1, 1.025, 1]
            : [1, 1.018, 1],
          scaleX: isSurprised ? 0.96 : isHappy ? [0.92, 1.08, 0.94, 1] : 1,
          rotate: isPensive
            ? -5.5
            : isSurprised
            ? 0
            : effectiveEmotion === "listening"
            ? 3.8
            : isHappy
            ? [-3.5, 3.5, -2, 0]
            : 0,
        }}
        transition={{
          y: {
            duration: isSpeaking
              ? 0.42
              : isHappy
              ? 0.5
              : isPensive || isSurprised
              ? 0.3
              : 2.5,
            repeat: isPensive || isSurprised ? 0 : Infinity,
            ease: "easeInOut",
          },
          scaleY: {
            duration: isSpeaking ? 0.42 : isHappy ? 0.5 : 2.5,
            repeat: isPensive || isSurprised ? 0 : Infinity,
            ease: "easeInOut",
          },
          scaleX: {
            duration: isSpeaking ? 0.42 : isHappy ? 0.5 : 2.5,
            repeat: isPensive || isSurprised ? 0 : Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 0.5,
            repeat: isHappy ? Infinity : 0,
            ease: "easeInOut",
          },
        }}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        }}
      >
        {/* Render Vector Character based on preset and rich emotion states */}
        {renderCharacterSVG({
          preset: config.preset,
          config,
          emotion: effectiveEmotion,
          mouthOpenAmount,
          visemeIndex,
          isBlinking,
          pupilX,
          pupilY,
          isListening,
          isGoalAchievedCelebration: isMedalGoalCelebrating || Boolean(isDailyGoalCelebration),
          idleHeadAngle,
        })}
      </motion.div>

      {/* 7. Quick Interactive Mascot Gestures / Emotes Toolbar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl z-20">
        <button
          type="button"
          onClick={() => triggerGestureAction("alegre", "🎉")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 ${
            effectiveEmotion === "alegre" || effectiveEmotion === "celebrating"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
              : "text-amber-300 hover:bg-amber-500/20"
          }`}
          title="Estado Alegre / Felicitar con confeti"
        >
          <PartyPopper className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Alegre</span>
        </button>

        <button
          type="button"
          onClick={() => triggerGestureAction("pensativo", "💡")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 ${
            effectiveEmotion === "pensativo"
              ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30"
              : "text-sky-300 hover:bg-sky-500/20"
          }`}
          title="Estado Pensativo / Hacer preguntas y reflexionar"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pensativo</span>
        </button>

        <button
          type="button"
          onClick={() => triggerGestureAction("sorpresa", "😲")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 ${
            effectiveEmotion === "sorpresa"
              ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
              : "text-purple-300 hover:bg-purple-500/20"
          }`}
          title="Estado Sorpresa / ¡Eureka y descubrimientos!"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sorpresa</span>
        </button>

        <button
          type="button"
          onClick={() => triggerGestureAction("encouraging", "🔥")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 ${
            effectiveEmotion === "encouraging"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
              : "text-emerald-300 hover:bg-emerald-500/20"
          }`}
          title="Estado Animar / Motivación"
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">¡Vamos!</span>
        </button>

        <button
          type="button"
          onClick={() => triggerGestureAction("loving", "💖")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 ${
            effectiveEmotion === "loving"
              ? "bg-rose-500 text-white shadow-md shadow-rose-500/40"
              : "text-rose-300 hover:bg-rose-500/20"
          }`}
          title="Estado Loving / Heart-Eyes por excelente respuesta o racha"
        >
          <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
          <span className="hidden sm:inline">Loving</span>
        </button>

        {onCustomizerClick && (
          <button
            type="button"
            onClick={onCustomizerClick}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold text-purple-300 hover:bg-purple-500/20 transition flex items-center gap-1 border-l border-slate-700 ml-0.5"
            title="Cambiar de Avatar BET o Ropa"
          >
            <span>✨ Tutor</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// HEART PARTICLE & HEART-EYES EXPRESSION OVERLAY (Loving / Streak State)
// ==========================================

const HeartParticleOverlay: React.FC<{ active: boolean }> = ({ active }) => {
  const hearts = [
    { id: 1, x: 18, size: 24, delay: 0, dur: 2.2, rotate: 12, color: "#f43f5e" },
    { id: 2, x: 74, size: 20, delay: 0.3, dur: 2.0, rotate: -15, color: "#ec4899" },
    { id: 3, x: 32, size: 16, delay: 0.7, dur: 1.8, rotate: 8, color: "#fda4af" },
    { id: 4, x: 62, size: 26, delay: 0.4, dur: 2.4, rotate: -10, color: "#f43f5e" },
    { id: 5, x: 12, size: 18, delay: 1.1, dur: 2.1, rotate: 18, color: "#fbbf24" },
    { id: 6, x: 84, size: 22, delay: 0.9, dur: 2.3, rotate: -18, color: "#f43f5e" },
    { id: 7, x: 48, size: 28, delay: 0.2, dur: 2.5, rotate: 5, color: "#ec4899" },
  ];

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center"
        >
          {/* 1. Ambient Warm Rose Radial Glow Aura */}
          <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 via-pink-500/10 to-transparent filter blur-xl animate-heart-aura-float" />

          {/* 2. Soft Heart-Eyes Expression Overlay with Smooth Scaling and Fading Frames */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{
              opacity: [0.75, 1, 0.75],
              scale: [0.92, 1.16, 0.92],
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              duration: 2.0,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[32%] sm:top-[34%] flex items-center justify-center gap-10 sm:gap-12 pointer-events-none filter drop-shadow-[0_0_16px_rgba(244,63,94,0.95)]"
          >
            {/* Left Eye Soft Heart Glow */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 rounded-full bg-rose-500/30 filter blur-md animate-ping" />
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-rose-500 text-rose-300 filter drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-heart-eyes-scale-fade" />
            </div>

            {/* Right Eye Soft Heart Glow */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 rounded-full bg-rose-500/30 filter blur-md animate-ping" style={{ animationDelay: "0.2s" }} />
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-rose-500 text-rose-300 filter drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-heart-eyes-scale-fade" style={{ animationDelay: "0.15s" }} />
            </div>
          </motion.div>

          {/* 3. Soft Rosy Blushing Cheeks Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.65, 0.95, 0.65],
              scale: [0.95, 1.15, 0.95],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[42%] sm:top-[44%] flex items-center justify-between w-44 sm:w-52 pointer-events-none px-2"
          >
            <div className="w-9 h-5 rounded-full bg-rose-500/60 filter blur-[3px] shadow-[0_0_14px_rgba(244,63,94,0.7)]" />
            <div className="w-9 h-5 rounded-full bg-rose-500/60 filter blur-[3px] shadow-[0_0_14px_rgba(244,63,94,0.7)]" />
          </motion.div>

          {/* 4. Ascending Floating Hearts */}
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{
                opacity: 0,
                y: 110,
                x: `${h.x}%`,
                scale: 0.5,
                rotate: h.rotate - 20,
              }}
              animate={{
                opacity: [0, 0.95, 0.9, 0],
                y: [-20, -170],
                x: [`${h.x}%`, `${h.x + (h.id % 2 === 0 ? 8 : -8)}%`, `${h.x}%`],
                scale: [0.6, 1.25, 1, 0.8],
                rotate: [h.rotate - 15, h.rotate + 15, h.rotate],
              }}
              transition={{
                duration: h.dur,
                delay: h.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-20 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.85)]"
              style={{ left: 0 }}
            >
              <Heart
                className="fill-current"
                style={{ width: h.size, height: h.size, color: h.color }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// 2.5D VECTOR CHARACTER SVG ENGINE
// ==========================================

interface CharacterRenderProps {
  preset: string;
  config: AvatarConfig;
  emotion: MascotGestureEmotion;
  mouthOpenAmount: number;
  visemeIndex: number;
  isBlinking: boolean;
  pupilX: number;
  pupilY: number;
  isListening: boolean;
  isGoalAchievedCelebration?: boolean;
  idleHeadAngle?: number;
}

// Global SVG Unlockable Accessories Layer
function renderAccessoryOverlay(accessory: AvatarAccessory, isGoalAchievedCelebration = false) {
  switch (accessory) {
    case "bet_medal":
    case "vt_badge":
      return (
        <g
          className="filter drop-shadow-[0_8px_18px_rgba(245,158,11,0.65)] origin-[140px_230px]"
          style={{
            animation: isGoalAchievedCelebration
              ? "medalEntranceScaleIn 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              : undefined,
          }}
        >
          {/* Goal Achieved Radiant Aura Burst */}
          {isGoalAchievedCelebration && (
            <g className="origin-[140px_226px] pointer-events-none">
              <circle
                cx="140"
                cy="226"
                r="26"
                fill="none"
                stroke="#fde047"
                strokeWidth="3.5"
                opacity="0.85"
                style={{ animation: "medalAuraBurst 1.2s ease-out infinite" }}
              />
              <circle
                cx="140"
                cy="226"
                r="36"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.65"
                style={{ animation: "medalAuraBurst 1.5s ease-out 0.25s infinite" }}
              />
            </g>
          )}

          {/* Blue Neck Ribbon */}
          <path
            d="M 106 188 Q 140 218 174 188"
            stroke="#1d4ed8"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 106 188 Q 140 218 174 188"
            stroke="#fde047"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Golden Disc */}
          <circle cx="140" cy="226" r="21" fill="url(#goldMedalMaster3D)" stroke="#854d0e" strokeWidth="2.5" />
          <circle cx="140" cy="226" r="17" fill="none" stroke="#ca8a04" strokeWidth="1.8" strokeDasharray="3 2" />
          <circle cx="140" cy="226" r="15.5" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />

          {/* Engraved Bold VT Monogram */}
          <text
            x="140"
            y="233"
            textAnchor="middle"
            fill="#713f12"
            fontSize="14"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="1px"
            style={{ filter: "drop-shadow(0 1px 1px rgba(255,255,255,0.7))" }}
          >
            VT
          </text>

          {/* Glint */}
          <g
            className="origin-[153px_215px]"
            style={{ animation: "medalStarGlint 3.2s ease-in-out infinite" }}
          >
            <polygon
              points="153,209 155,213 159,215 155,217 153,221 151,217 147,215 151,213"
              fill="#ffffff"
              stroke="#fde047"
              strokeWidth="0.8"
            />
          </g>
        </g>
      );

    case "graduation_cap":
      return (
        <g className="filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
          {/* Mortarboard Diamond Cap */}
          <polygon
            points="140,20 210,45 140,70 70,45"
            fill="#0f172a"
            stroke="#eab308"
            strokeWidth="3"
          />
          {/* Skullcap Base */}
          <path
            d="M 105 52 C 105 74 175 74 175 52 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="2"
          />
          {/* Golden Tassel */}
          <circle cx="140" cy="45" r="4" fill="#fbbf24" />
          <path
            d="M 140 45 Q 185 60 180 85"
            stroke="#f59e0b"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <rect x="175" y="82" width="10" height="15" rx="3" fill="#f59e0b" />
        </g>
      );

    case "golden_crown":
      return (
        <g className="filter drop-shadow-[0_8px_20px_rgba(234,179,8,0.55)]">
          <polygon
            points="95,72 80,32 115,52 140,22 165,52 200,32 185,72"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="3"
          />
          {/* Jewels */}
          <circle cx="80" cy="32" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
          <circle cx="140" cy="22" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="200" cy="32" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
          <ellipse cx="140" cy="62" rx="38" ry="8" fill="#ca8a04" opacity="0.4" />
        </g>
      );

    case "sunglasses_vip":
      return (
        <g className="filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]">
          <path
            d="M 90 108 Q 110 105 130 108 L 132 128 Q 110 138 90 128 Z"
            fill="#09090b"
            stroke="#eab308"
            strokeWidth="3"
          />
          <path
            d="M 150 108 Q 170 105 190 108 L 190 128 Q 170 138 148 128 Z"
            fill="#09090b"
            stroke="#eab308"
            strokeWidth="3"
          />
          <path d="M 130 114 L 150 114" stroke="#eab308" strokeWidth="4" />
          <path d="M 96 114 L 112 126" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <path d="M 156 114 L 172 126" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        </g>
      );

    case "scarf_explorer":
      return (
        <g className="filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]">
          <path
            d="M 95 190 Q 140 215 185 190 Q 190 205 185 220 Q 140 238 95 220 Z"
            fill="#dc2626"
            stroke="#991b1b"
            strokeWidth="2.5"
          />
          <path d="M 115 196 L 115 228 M 140 202 L 140 234 M 165 196 L 165 228" stroke="#fbbf24" strokeWidth="4" />
          <path
            d="M 160 210 L 175 270 L 195 265 L 180 210 Z"
            fill="#dc2626"
            stroke="#991b1b"
            strokeWidth="2"
          />
          <line x1="172" y1="270" x2="198" y2="265" stroke="#fbbf24" strokeWidth="4" />
        </g>
      );

    case "headset":
      return (
        <g>
          <path d="M 70 120 C 70 50 210 50 210 120" stroke="#0284c7" strokeWidth="8" fill="none" strokeLinecap="round" />
          <rect x="58" y="105" width="18" height="35" rx="8" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
          <rect x="204" y="105" width="18" height="35" rx="8" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
          <path d="M 70 135 Q 90 160 120 155" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="122" cy="155" r="4.5" fill="#f59e0b" />
        </g>
      );

    default:
      return null;
  }
}

function renderCharacterSVG({
  preset,
  config,
  emotion,
  mouthOpenAmount,
  visemeIndex,
  isBlinking,
  pupilX,
  pupilY,
  isListening,
  isGoalAchievedCelebration = false,
  idleHeadAngle = 0,
}: CharacterRenderProps) {
  const isLoving = emotion === "loving";
  const isHappy = emotion === "alegre" || emotion === "celebrating" || emotion === "encouraging" || isLoving;
  const isThinking = emotion === "pensativo";
  const isPensive = isThinking;
  const isSurprised = emotion === "sorpresa";
  const isSpeaking = emotion === "speaking" || mouthOpenAmount > 0.05;

  // Phonetic mouth height & width modulation
  const mouthH = Math.max(3, mouthOpenAmount * 24);
  const beakH = Math.max(2, mouthOpenAmount * 18);
  const isVisemeRound = visemeIndex === 2 || isSurprised; // 'OO' shape
  const isVisemeSmile = visemeIndex === 1 || isHappy; // 'EE' shape

  // 0. OPTION 1: 100% HIGH-DEFINITION 3D ILLUSTRATION + 2.5D ANIMATED RIG
  if (config.customImageUrl) {
    const cropConfig =
      config.spriteCropIndex !== undefined
        ? {
            0: { bgPos: "1% 1%", bgSize: "330% 330%" }, // Colibrí
            1: { bgPos: "50% 1%", bgSize: "330% 330%" }, // Oso Frontino
            2: { bgPos: "99% 1%", bgSize: "330% 330%" }, // Monito Fresa
            3: { bgPos: "1% 50%", bgSize: "330% 330%" }, // Turpial
            4: { bgPos: "39% 50%", bgSize: "330% 330%" }, // Cunaguaro
            5: { bgPos: "68% 50%", bgSize: "330% 330%" }, // Oso Melero
            6: { bgPos: "99% 50%", bgSize: "330% 330%" }, // Morrocoy
            7: { bgPos: "1% 99%", bgSize: "330% 330%" }, // Guacharaca
            8: { bgPos: "50% 99%", bgSize: "330% 330%" }, // Mono con Audífonos
            9: { bgPos: "99% 99%", bgSize: "330% 330%" }, // Iguana
          }[config.spriteCropIndex] || { bgPos: "center", bgSize: "cover" }
        : null;

    return (
      <div className="relative w-64 h-72 sm:w-72 sm:h-80 flex items-center justify-center filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.45)] drop-shadow-[3px_3px_22px_rgba(56,189,248,0.45)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)] select-none">
        {/* Layer 1: High-Definition Pixar 3D CGI Illustration Container with Inset Rim-Light */}
        <div
          className="relative w-full h-full rounded-[32px] overflow-hidden border-2 border-amber-400/40 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-[#050810] shadow-[inset_0_0_30px_rgba(245,158,11,0.28),inset_0_0_15px_rgba(56,189,248,0.35),inset_0_2px_6px_rgba(255,255,255,0.45),0_20px_45px_rgba(0,0,0,0.9)] flex items-center justify-center"
        >
          {cropConfig ? (
            <div
              className="w-full h-full transform transition-transform duration-300 hover:scale-105"
              style={{
                backgroundImage: `url(${config.customImageUrl})`,
                backgroundPosition: cropConfig.bgPos,
                backgroundSize: cropConfig.bgSize,
                backgroundRepeat: "no-repeat",
              }}
            />
          ) : (
            <img
              src={config.customImageUrl}
              alt={config.name}
              className="w-full h-full object-contain pointer-events-none transform transition-transform duration-300 hover:scale-105"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Layer 1.5: Pixar Soft Depth-of-Field Edge Feathering Mask */}
          <div className="absolute inset-0 pointer-events-none rounded-[30px] shadow-[inset_0_0_18px_rgba(3,7,18,0.75)]" />

          {/* Layer 2: Emotional Lighting Glare & Pixar Color Volume */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
              isHappy
                ? "bg-gradient-to-t from-amber-500/25 via-transparent to-rose-500/15 opacity-80"
                : isSurprised
                ? "bg-gradient-to-t from-purple-500/35 via-transparent to-cyan-500/15 opacity-90"
                : isThinking
                ? "bg-gradient-to-t from-sky-500/25 via-transparent to-cyan-400/10 opacity-70"
                : isSpeaking
                ? "bg-gradient-to-t from-amber-500/20 via-transparent to-yellow-400/10 opacity-65"
                : "opacity-0"
            }`}
          />

          {/* Layer 3: Dynamic 3D Live Lighting Halo and Clean Display (No synthetic cartoon overlays) */}
          <div className="absolute -bottom-8 w-56 h-12 bg-black/95 blur-2xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-4 w-36 h-6 bg-amber-500/25 blur-lg rounded-full pointer-events-none" />

          {/* Layer 4: Official 3D HD Badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-400/50 text-[10px] font-black text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            3D HD
          </div>
        </div>

        {/* Layer 6: Dynamic Unlockable Accessory SVG Overlay */}
        <svg
          viewBox="0 0 280 340"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {renderAccessoryOverlay(config.accessory)}
        </svg>
      </div>
    );
  }

  switch (preset) {
    // ========================================================
    // 1. TURPIAL BET (Official Mascot - 2.5D Layered Sprite Rig)
    // ========================================================
    case "bet_turpial":
      return (
        <TurpialSpriteRig25D
          emotion={emotion}
          isSpeaking={isSpeaking}
          mouthIntensity={mouthOpenAmount}
          isListening={isListening}
          headTilt={idleHeadAngle}
        />
      );


    // ========================================================
    // 2. OSO FRONTINO BET (Spectacled Bear Safari Coach)
    // ========================================================
    case "bet_frontino":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.5)] drop-shadow-[3px_3px_20px_rgba(56,189,248,0.5)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)]"
        >
          <defs>
            {/* 3D Pixar Fur Volume Radial Gradient */}
            <radialGradient id="bearFur3D" cx="40%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="35%" stopColor="#451a03" />
              <stop offset="75%" stopColor="#290e02" />
              <stop offset="95%" stopColor="#1c0a01" />
              <stop offset="100%" stopColor="#0a0300" />
            </radialGradient>

            {/* Pixar Cream Muzzle Volume */}
            <radialGradient id="bearMuzzle3D" cx="45%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef3c7" />
              <stop offset="70%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>

            {/* Safari Explorer Vest 3D Fabric */}
            <linearGradient id="safariVest3D" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="30%" stopColor="#d97706" />
              <stop offset="75%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Pixar Honey Amber Iris */}
            <radialGradient id="pixarIrisBear" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="40%" stopColor="#d97706" />
              <stop offset="80%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>

          {/* Studio Floor Contact Shadow */}
          <ellipse cx="140" cy="305" rx="72" ry="14" fill="#030712" opacity="0.65" />

          {/* Bear Ears with Reactive Wiggle */}
          <g
            className="transition-transform duration-200"
            style={{
              transform: isThinking || isListening ? "rotate(-12deg)" : isSurprised ? "rotate(-18deg)" : "rotate(0deg)",
              transformOrigin: "85px 65px",
            }}
          >
            <circle cx="85" cy="65" r="28" fill="url(#bearFur3D)" stroke="#1c0a01" strokeWidth="2.5" />
            <circle cx="85" cy="65" r="15" fill="#fde68a" opacity="0.55" />
          </g>

          <g
            className="transition-transform duration-200"
            style={{
              transform: isThinking || isListening ? "rotate(12deg)" : isSurprised ? "rotate(18deg)" : "rotate(0deg)",
              transformOrigin: "195px 65px",
            }}
          >
            <circle cx="195" cy="65" r="28" fill="url(#bearFur3D)" stroke="#1c0a01" strokeWidth="2.5" />
            <circle cx="195" cy="65" r="15" fill="#fde68a" opacity="0.55" />
          </g>

          {/* Body & Safari Vest */}
          <ellipse cx="140" cy="220" rx="82" ry="78" fill="url(#bearFur3D)" stroke="#1c0a01" strokeWidth="2.5" />

          {/* Safari Explorer Vest */}
          <path
            d="M 68 185 C 68 250 85 285 140 285 C 195 285 212 250 212 185 C 190 195 160 200 140 200 C 120 200 90 195 68 185 Z"
            fill="url(#safariVest3D)"
            stroke="#78350f"
            strokeWidth="2.5"
          />
          <path d="M 100 195 L 125 285 M 180 195 L 155 285" stroke="#451a03" strokeWidth="2.5" />
          <rect x="85" y="230" width="24" height="20" rx="4" fill="#92400e" stroke="#78350f" strokeWidth="2" />
          <rect x="171" y="230" width="24" height="20" rx="4" fill="#92400e" stroke="#78350f" strokeWidth="2" />
          <circle cx="97" cy="240" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.2" />

          {/* Bear Head 3D Sphere */}
          <ellipse cx="140" cy="125" rx="72" ry="68" fill="url(#bearFur3D)" stroke="#1c0a01" strokeWidth="2.5" />
          <ellipse cx="130" cy="85" rx="34" ry="16" fill="#a16207" opacity="0.22" />

          {/* Spectacles Mask Face Markings */}
          <path
            d="M 92 88 C 76 100 76 138 98 145 C 114 150 128 135 125 110 C 122 88 106 80 92 88 Z"
            fill="url(#bearMuzzle3D)"
            stroke="#d97706"
            strokeWidth="2"
          />
          <path
            d="M 188 88 C 204 100 204 138 182 145 C 166 150 152 135 155 110 C 158 88 174 80 188 88 Z"
            fill="url(#bearMuzzle3D)"
            stroke="#d97706"
            strokeWidth="2"
          />
          <path d="M 118 105 Q 140 100 162 105" stroke="url(#bearMuzzle3D)" strokeWidth="10" fill="none" strokeLinecap="round" />

          {/* PIXAR EYES & EYEBROWS */}
          {isBlinking && !isSurprised ? (
            <g>
              <path d="M 92 115 Q 104 125 116 115" stroke="#451a03" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 164 115 Q 176 125 188 115" stroke="#451a03" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </g>
          ) : isHappy ? (
            <g>
              <path d="M 92 118 Q 104 104 116 118" stroke="#451a03" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <path d="M 164 118 Q 176 104 188 118" stroke="#451a03" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            </g>
          ) : isSurprised ? (
            <g>
              <ellipse cx="104" cy="115" rx="14" ry="16" fill="#f8fafc" />
              <circle cx="104" cy="115" r="10" fill="url(#pixarIrisBear)" />
              <circle cx="104" cy="115" r="5.5" fill="#020617" />
              <circle cx="101" cy="111" r="4.2" fill="#ffffff" />
              <circle cx="107" cy="119" r="1.8" fill="#fde68a" opacity="0.85" />

              <ellipse cx="176" cy="115" rx="14" ry="16" fill="#f8fafc" />
              <circle cx="176" cy="115" r="10" fill="url(#pixarIrisBear)" />
              <circle cx="176" cy="115" r="5.5" fill="#020617" />
              <circle cx="173" cy="111" r="4.2" fill="#ffffff" />
              <circle cx="179" cy="119" r="1.8" fill="#fde68a" opacity="0.85" />
            </g>
          ) : (
            <g>
              <ellipse cx="104" cy="115" rx="13" ry="15" fill="#f8fafc" />
              <circle cx={104 + (isThinking ? 3.5 : pupilX)} cy={115 + (isThinking ? -3.5 : pupilY)} r="9" fill="url(#pixarIrisBear)" />
              <circle cx={104 + (isThinking ? 3.5 : pupilX)} cy={115 + (isThinking ? -3.5 : pupilY)} r="5" fill="#020617" />
              <ellipse cx={101 + (isThinking ? 3.5 : pupilX * 0.5)} cy={112 + (isThinking ? -3.5 : pupilY * 0.5)} rx="3.5" ry="3" fill="#ffffff" />
              <circle cx={107 + (isThinking ? 3.5 : pupilX * 0.5)} cy={118 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.6" fill="#fde68a" opacity="0.8" />

              <ellipse cx="176" cy="115" rx="13" ry="15" fill="#f8fafc" />
              <circle cx={176 + (isThinking ? 3.5 : pupilX)} cy={115 + (isThinking ? -3.5 : pupilY)} r="9" fill="url(#pixarIrisBear)" />
              <circle cx={176 + (isThinking ? 3.5 : pupilX)} cy={115 + (isThinking ? -3.5 : pupilY)} r="5" fill="#020617" />
              <ellipse cx={173 + (isThinking ? 3.5 : pupilX * 0.5)} cy={112 + (isThinking ? -3.5 : pupilY * 0.5)} rx="3.5" ry="3" fill="#ffffff" />
              <circle cx={179 + (isThinking ? 3.5 : pupilX * 0.5)} cy={118 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.6" fill="#fde68a" opacity="0.8" />
            </g>
          )}

          {/* Muzzle & Nose */}
          <ellipse cx="140" cy="148" rx="34" ry="26" fill="url(#bearMuzzle3D)" stroke="#d97706" strokeWidth="2" />
          <path d="M 128 138 Q 140 134 152 138 Q 140 152 128 138 Z" fill="#1c0a01" />
          {/* Nose Specular */}
          <ellipse cx="138" cy="139" rx="4" ry="2" fill="#ffffff" opacity="0.4" />

          {/* Talking Mouth */}
          <g>
            <path
              d={
                isSurprised
                  ? "M 132 152 Q 140 166 148 152 Q 140 162 132 152 Z"
                  : `M 130 154 Q 140 ${156 + (isHappy ? 10 : mouthH * 0.45)} 150 154`
              }
              stroke="#1c0a01"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill={mouthOpenAmount > 0.15 || isSurprised || isHappy ? "#450a0a" : "none"}
            />
            {(mouthOpenAmount > 0.15 || isSurprised || isHappy) && (
              <ellipse cx="140" cy={156 + mouthH * 0.5} rx={isVisemeRound ? 6 : 9} ry={mouthH * 0.4} fill="#f43f5e" />
            )}
          </g>

          {renderAccessoryOverlay(config.accessory)}
        </svg>
      );

    // ========================================================
    // 3. CUNAGUARO BET (Ocelot / Cool Cap Coach)
    // ========================================================
    case "bet_cunaguaro":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.5)] drop-shadow-[3px_3px_20px_rgba(56,189,248,0.5)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <radialGradient id="ocelotFur3D" cx="38%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="90%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>

            <linearGradient id="betBlueCap3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="35%" stopColor="#3b82f6" />
              <stop offset="80%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>

            {/* Pixar Emerald Cat Eyes */}
            <radialGradient id="pixarIrisCat" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="40%" stopColor="#10b981" />
              <stop offset="75%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>
          </defs>

          {/* Ground Shadow */}
          <ellipse cx="140" cy="305" rx="68" ry="14" fill="#030712" opacity="0.65" />

          {/* Ears */}
          <path d="M 72 90 L 85 30 L 120 70 Z" fill="url(#ocelotFur3D)" stroke="#b45309" strokeWidth="2.5" />
          <path d="M 82 80 L 92 45 L 112 70 Z" fill="#f43f5e" opacity="0.75" />
          <path d="M 208 90 L 195 30 L 160 70 Z" fill="url(#ocelotFur3D)" stroke="#b45309" strokeWidth="2.5" />
          <path d="M 198 80 L 188 45 L 168 70 Z" fill="#f43f5e" opacity="0.75" />

          {/* Body */}
          <ellipse cx="140" cy="220" rx="76" ry="78" fill="url(#ocelotFur3D)" stroke="#b45309" strokeWidth="2.5" />
          <ellipse cx="105" cy="210" rx="8" ry="6" fill="#78350f" opacity="0.8" />
          <ellipse cx="175" cy="210" rx="8" ry="6" fill="#78350f" opacity="0.8" />
          <ellipse cx="140" cy="245" rx="7" ry="5" fill="#78350f" opacity="0.8" />

          {/* Blue BET Athletic Cap */}
          <g>
            <path d="M 85 85 C 85 45 195 45 195 85 Z" fill="url(#betBlueCap3D)" stroke="#1e40af" strokeWidth="2.5" />
            <path d="M 130 82 C 170 78 225 90 220 102 C 185 106 140 92 130 82 Z" fill="#1e3a8a" stroke="#172554" strokeWidth="2" />
            <text x="135" y="72" fill="#ffffff" fontWeight="900" fontSize="13" textAnchor="middle">
              BET
            </text>
          </g>

          {/* Head */}
          <ellipse cx="140" cy="130" rx="68" ry="62" fill="url(#ocelotFur3D)" stroke="#b45309" strokeWidth="2.5" />

          {/* Eyes with Feline Pupils & Pixar Glint */}
          {isBlinking && !isSurprised ? (
            <g>
              <path d="M 94 125 Q 106 135 118 125" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 162 125 Q 174 135 186 125" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </g>
          ) : isHappy ? (
            <g>
              <path d="M 94 128 Q 106 112 118 128" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <path d="M 162 128 Q 174 112 186 128" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            </g>
          ) : isSurprised ? (
            <g>
              <ellipse cx="106" cy="124" rx="16" ry="18" fill="#f8fafc" />
              <ellipse cx="106" cy="124" rx="11" ry="13" fill="url(#pixarIrisCat)" />
              <ellipse cx="106" cy="124" rx="4" ry="11" fill="#020617" />
              <circle cx="103" cy="120" r="4.2" fill="#ffffff" />
              <circle cx="109" cy="128" r="1.8" fill="#6ee7b7" opacity="0.8" />

              <ellipse cx="174" cy="124" rx="16" ry="18" fill="#f8fafc" />
              <ellipse cx="174" cy="124" rx="11" ry="13" fill="url(#pixarIrisCat)" />
              <ellipse cx="174" cy="124" rx="4" ry="11" fill="#020617" />
              <circle cx="171" cy="120" r="4.2" fill="#ffffff" />
              <circle cx="177" cy="128" r="1.8" fill="#6ee7b7" opacity="0.8" />
            </g>
          ) : (
            <g>
              <ellipse cx="106" cy="124" rx="14" ry="16" fill="#f8fafc" />
              <ellipse cx={106 + (isThinking ? 3.5 : pupilX)} cy={124 + (isThinking ? -3.5 : pupilY)} rx="9" ry="11" fill="url(#pixarIrisCat)" />
              <ellipse cx={106 + (isThinking ? 3.5 : pupilX)} cy={124 + (isThinking ? -3.5 : pupilY)} rx="3.5" ry="9" fill="#020617" />
              <ellipse cx={103 + (isThinking ? 3.5 : pupilX * 0.5)} cy={120 + (isThinking ? -3.5 : pupilY * 0.5)} rx="3.5" ry="3" fill="#ffffff" />
              <circle cx={109 + (isThinking ? 3.5 : pupilX * 0.5)} cy={127 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.6" fill="#6ee7b7" opacity="0.8" />

              <ellipse cx="174" cy="124" rx="14" ry="16" fill="#f8fafc" />
              <ellipse cx={174 + (isThinking ? 3.5 : pupilX)} cy={124 + (isThinking ? -3.5 : pupilY)} rx="9" ry="11" fill="url(#pixarIrisCat)" />
              <ellipse cx={174 + (isThinking ? 3.5 : pupilX)} cy={124 + (isThinking ? -3.5 : pupilY)} rx="3.5" ry="9" fill="#020617" />
              <ellipse cx={171 + (isThinking ? 3.5 : pupilX * 0.5)} cy={120 + (isThinking ? -3.5 : pupilY * 0.5)} rx="3.5" ry="3" fill="#ffffff" />
              <circle cx={177 + (isThinking ? 3.5 : pupilX * 0.5)} cy={127 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.6" fill="#6ee7b7" opacity="0.8" />
            </g>
          )}

          {/* Whiskers */}
          <path d="M 90 148 L 65 145 M 90 153 L 62 156 M 190 148 L 215 145 M 190 153 L 218 156" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />

          {/* Talking Mouth */}
          <path
            d={`M 130 152 Q 140 ${154 + (isHappy ? 10 : mouthH * 0.45)} 150 152`}
            stroke="#78350f"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill={mouthOpenAmount > 0.15 || isHappy || isSurprised ? "#450a0a" : "none"}
          />
          {(mouthOpenAmount > 0.15 || isHappy || isSurprised) && (
            <ellipse cx="140" cy={155 + mouthH * 0.4} rx={isVisemeRound ? 5 : 8} ry={mouthH * 0.35} fill="#f43f5e" />
          )}

          {renderAccessoryOverlay(config.accessory)}
        </svg>
      );

    // ========================================================
    // 4. TECH MONKEY BET (Audio & DJ Tech Coach)
    // ========================================================
    case "bet_tech_monkey":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.5)] drop-shadow-[3px_3px_20px_rgba(56,189,248,0.5)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <radialGradient id="monkeyFur3D" cx="40%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#c2410c" />
              <stop offset="35%" stopColor="#9a3412" />
              <stop offset="75%" stopColor="#7c2d12" />
              <stop offset="100%" stopColor="#431407" />
            </radialGradient>
            <radialGradient id="monkeyMuzzle3D" cx="42%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fed7aa" />
              <stop offset="70%" stopColor="#fdba74" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>
            <radialGradient id="pixarIrisMonkey" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#0284c7" />
              <stop offset="80%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#082f49" />
            </radialGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="140" cy="305" rx="70" ry="14" fill="#030712" opacity="0.65" />

          {/* Ears */}
          <circle cx="68" cy="130" r="26" fill="url(#monkeyFur3D)" stroke="#431407" strokeWidth="2.5" />
          <circle cx="68" cy="130" r="14" fill="#fed7aa" opacity="0.8" />
          <circle cx="212" cy="130" r="26" fill="url(#monkeyFur3D)" stroke="#431407" strokeWidth="2.5" />
          <circle cx="212" cy="130" r="14" fill="#fed7aa" opacity="0.8" />

          <ellipse cx="140" cy="225" rx="78" ry="74" fill="url(#monkeyFur3D)" stroke="#431407" strokeWidth="2.5" />
          <path d="M 85 195 C 85 260 195 260 195 195 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />

          <ellipse cx="140" cy="125" rx="70" ry="64" fill="url(#monkeyFur3D)" stroke="#431407" strokeWidth="2.5" />
          <ellipse cx="140" cy="142" rx="44" ry="34" fill="url(#monkeyMuzzle3D)" stroke="#ea580c" strokeWidth="2" />

          {/* DJ Headphones */}
          <g>
            <path d="M 68 120 C 68 45 212 45 212 120" stroke="#0f172a" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M 75 115 C 75 52 205 52 205 115" stroke="#38bdf8" strokeWidth="3" fill="none" />
            <rect x="46" y="105" width="22" height="48" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="57" cy="129" r="6" fill="#38bdf8" className={isSpeaking ? "animate-ping" : ""} />
            <rect x="212" y="105" width="22" height="48" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="223" cy="129" r="6" fill="#38bdf8" className={isSpeaking ? "animate-ping" : ""} />
          </g>

          {/* Eyes */}
          {isBlinking && !isSurprised ? (
            <g>
              <path d="M 98 110 Q 110 120 122 110" stroke="#431407" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 158 110 Q 170 120 182 110" stroke="#431407" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </g>
          ) : isHappy ? (
            <g>
              <path d="M 98 114 Q 110 100 122 114" stroke="#431407" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <path d="M 158 114 Q 170 100 182 114" stroke="#431407" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            </g>
          ) : isSurprised ? (
            <g>
              <ellipse cx="110" cy="110" rx="15" ry="17" fill="#f8fafc" />
              <circle cx="110" cy="110" r="10" fill="url(#pixarIrisMonkey)" />
              <circle cx="110" cy="110" r="5.5" fill="#020617" />
              <circle cx="107" cy="106" r="4.2" fill="#ffffff" />
              <circle cx="113" cy="114" r="1.8" fill="#7dd3fc" opacity="0.8" />

              <ellipse cx="170" cy="110" rx="15" ry="17" fill="#f8fafc" />
              <circle cx="170" cy="110" r="10" fill="url(#pixarIrisMonkey)" />
              <circle cx="170" cy="110" r="5.5" fill="#020617" />
              <circle cx="167" cy="106" r="4.2" fill="#ffffff" />
              <circle cx="173" cy="114" r="1.8" fill="#7dd3fc" opacity="0.8" />
            </g>
          ) : (
            <g>
              <ellipse cx="110" cy="110" rx="13" ry="15" fill="#f8fafc" />
              <circle cx={110 + (isThinking ? 3.5 : pupilX)} cy={110 + (isThinking ? -3.5 : pupilY)} r="9" fill="url(#pixarIrisMonkey)" />
              <circle cx={110 + (isThinking ? 3.5 : pupilX)} cy={110 + (isThinking ? -3.5 : pupilY)} r="5" fill="#020617" />
              <ellipse cx={107 + (isThinking ? 3.5 : pupilX * 0.5)} cy={107 + (isThinking ? -3.5 : pupilY * 0.5)} rx="3.5" ry="3" fill="#ffffff" />
              <circle cx={113 + (isThinking ? 3.5 : pupilX * 0.5)} cy={113 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.6" fill="#7dd3fc" opacity="0.8" />

              <ellipse cx="170" cy="110" rx="13" ry="15" fill="#f8fafc" />
              <circle cx={170 + (isThinking ? 3.5 : pupilX)} cy={110 + (isThinking ? -3.5 : pupilY)} r="9" fill="url(#pixarIrisMonkey)" />
              <circle cx={170 + (isThinking ? 3.5 : pupilX)} cy={110 + (isThinking ? -3.5 : pupilY)} r="5" fill="#020617" />
              <ellipse cx={167 + (isThinking ? 3.5 : pupilX * 0.5)} cy={107 + (isThinking ? -3.5 : pupilY * 0.5)} rx="3.5" ry="3" fill="#ffffff" />
              <circle cx={173 + (isThinking ? 3.5 : pupilX * 0.5)} cy={113 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.6" fill="#7dd3fc" opacity="0.8" />
            </g>
          )}

          {/* Talking Mouth */}
          <path
            d={`M 124 154 Q 140 ${156 + (isHappy ? 10 : mouthH * 0.5)} 156 154`}
            stroke="#431407"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill={mouthOpenAmount > 0.15 || isHappy || isSurprised ? "#450a0a" : "none"}
          />
          {(mouthOpenAmount > 0.15 || isHappy || isSurprised) && (
            <ellipse cx="140" cy={157 + mouthH * 0.4} rx={isVisemeRound ? 6 : 9} ry={mouthH * 0.35} fill="#f43f5e" />
          )}

          {renderAccessoryOverlay(config.accessory)}
        </svg>
      );

    // ========================================================
    // 5. COLIBRÍ TUCUSITO BET
    // ========================================================
    case "bet_tucusito":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.5)] drop-shadow-[3px_3px_20px_rgba(56,189,248,0.5)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <radialGradient id="hummingBody3D" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="30%" stopColor="#34d399" />
              <stop offset="65%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>
            <radialGradient id="rubyThroat3D" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fecdd3" />
              <stop offset="35%" stopColor="#f43f5e" />
              <stop offset="80%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#881337" />
            </radialGradient>
          </defs>

          {/* Floor Contact */}
          <ellipse cx="140" cy="305" rx="55" ry="12" fill="#030712" opacity="0.65" />

          {/* Rapid Flapping Flutter Wings */}
          <g
            className="transition-transform duration-75 origin-[60px_160px]"
            style={{
              transform: `rotate(${Math.sin(Date.now() / 50) * 25}deg)`,
            }}
          >
            <ellipse cx="40" cy="150" rx="35" ry="12" fill="#10b981" opacity="0.85" />
            <ellipse cx="30" cy="145" rx="30" ry="8" fill="#6ee7b7" opacity="0.6" />
          </g>
          <g
            className="transition-transform duration-75 origin-[220px_160px]"
            style={{
              transform: `rotate(${-Math.sin(Date.now() / 50) * 25}deg)`,
            }}
          >
            <ellipse cx="240" cy="150" rx="35" ry="12" fill="#10b981" opacity="0.85" />
            <ellipse cx="250" cy="145" rx="30" ry="8" fill="#6ee7b7" opacity="0.6" />
          </g>

          <ellipse cx="140" cy="200" rx="60" ry="75" fill="url(#hummingBody3D)" stroke="#064e3b" strokeWidth="2.5" />
          <ellipse cx="140" cy="175" rx="32" ry="24" fill="url(#rubyThroat3D)" stroke="#9f1239" strokeWidth="1.5" />
          <circle cx="140" cy="115" r="54" fill="url(#hummingBody3D)" stroke="#064e3b" strokeWidth="2.5" />

          {/* Slender Articulated Hummingbird Beak */}
          <g>
            <path
              d={`M 132 120 L 140 ${175 + (isSpeaking || isSurprised ? beakH * 0.4 : 0)} L 148 120 Z`}
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {(mouthOpenAmount > 0.15 || isHappy || isSurprised) && (
              <path d="M 138 122 L 140 165 L 142 122 Z" fill="#f43f5e" />
            )}
          </g>

          {/* Pixar Eyes */}
          {isBlinking && !isSurprised ? (
            <path d="M 105 108 Q 116 116 127 108 M 153 108 Q 164 116 175 108" stroke="#064e3b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          ) : isHappy ? (
            <path d="M 105 110 Q 116 96 127 110 M 153 110 Q 164 96 175 110" stroke="#064e3b" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          ) : isSurprised ? (
            <g>
              <ellipse cx="116" cy="108" rx="16" ry="18" fill="#f8fafc" />
              <circle cx="116" cy="108" r="9.5" fill="#0f172a" />
              <circle cx="113" cy="104" r="4.5" fill="#ffffff" />
              <circle cx="118" cy="112" r="1.8" fill="#6ee7b7" opacity="0.8" />

              <ellipse cx="164" cy="108" rx="16" ry="18" fill="#f8fafc" />
              <circle cx="164" cy="108" r="9.5" fill="#0f172a" />
              <circle cx="161" cy="104" r="4.5" fill="#ffffff" />
              <circle cx="166" cy="112" r="1.8" fill="#6ee7b7" opacity="0.8" />
            </g>
          ) : (
            <g>
              <ellipse cx="116" cy="108" rx="14" ry="16" fill="#f8fafc" />
              <circle cx={116 + (isThinking ? 3.5 : pupilX)} cy={108 + (isThinking ? -3.5 : pupilY)} r="8.5" fill="#0f172a" />
              <circle cx={113 + (isThinking ? 3.5 : pupilX * 0.5)} cy={104 + (isThinking ? -3.5 : pupilY * 0.5)} r="3.8" fill="#ffffff" />
              <circle cx={118 + (isThinking ? 3.5 : pupilX * 0.5)} cy={111 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.6" fill="#6ee7b7" opacity="0.8" />

              <ellipse cx="164" cy="108" rx="14" ry="16" fill="#f8fafc" />
              <circle cx={164 + (isThinking ? 3.5 : pupilX)} cy={108 + (isThinking ? -3.5 : pupilY)} r="8.5" fill="#0f172a" />
              <circle cx={161 + (isThinking ? 3.5 : pupilX * 0.5)} cy={104 + (isThinking ? -3.5 : pupilY * 0.5)} r="3.8" fill="#ffffff" />
              <circle cx={166 + (isThinking ? 3.5 : pupilX * 0.5)} cy={111 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.6" fill="#6ee7b7" opacity="0.8" />
            </g>
          )}

          <circle cx="140" cy="245" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <text x="140" y="250" textAnchor="middle" fill="#78350f" fontSize="10" fontWeight="900">BET</text>

          {renderAccessoryOverlay(config.accessory)}
        </svg>
      );

    // ========================================================
    // 6. MONITO CAPUCHINO BET
    // ========================================================
    case "bet_capuchino":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.5)] drop-shadow-[3px_3px_20px_rgba(56,189,248,0.5)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <radialGradient id="capuchinCoat3D" cx="40%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#9a3412" />
              <stop offset="35%" stopColor="#78350f" />
              <stop offset="75%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#1c0a01" />
            </radialGradient>
            <radialGradient id="capuchinFace3D" cx="45%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef3c7" />
              <stop offset="70%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <radialGradient id="pixarIrisCapuchin" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="40%" stopColor="#b45309" />
              <stop offset="80%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="140" cy="305" rx="68" ry="14" fill="#030712" opacity="0.65" />

          <circle cx="68" cy="120" r="22" fill="url(#capuchinCoat3D)" stroke="#451a03" strokeWidth="2.5" />
          <circle cx="68" cy="120" r="12" fill="#fde68a" opacity="0.8" />
          <circle cx="212" cy="120" r="22" fill="url(#capuchinCoat3D)" stroke="#451a03" strokeWidth="2.5" />
          <circle cx="212" cy="120" r="12" fill="#fde68a" opacity="0.8" />

          <ellipse cx="140" cy="225" rx="74" ry="74" fill="url(#capuchinCoat3D)" stroke="#451a03" strokeWidth="2.5" />

          <path
            d="M 80 130 C 80 75 140 70 140 95 C 140 70 200 75 200 130 C 200 170 140 185 140 185 C 140 185 80 170 80 130 Z"
            fill="url(#capuchinFace3D)"
            stroke="#d97706"
            strokeWidth="2.5"
          />

          {isBlinking && !isSurprised ? (
            <g>
              <path d="M 98 120 Q 108 130 118 120" stroke="#451a03" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 162 120 Q 172 130 182 120" stroke="#451a03" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </g>
          ) : isHappy ? (
            <g>
              <path d="M 98 122 Q 108 108 118 122" stroke="#451a03" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <path d="M 162 122 Q 172 108 182 122" stroke="#451a03" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            </g>
          ) : isSurprised ? (
            <g>
              <ellipse cx="108" cy="120" rx="16" ry="18" fill="#f8fafc" />
              <circle cx="108" cy="120" r="10" fill="url(#pixarIrisCapuchin)" />
              <circle cx="108" cy="120" r="5.5" fill="#020617" />
              <circle cx="105" cy="116" r="4.2" fill="#ffffff" />
              <circle cx="111" cy="124" r="1.8" fill="#fde68a" opacity="0.8" />

              <ellipse cx="172" cy="120" rx="16" ry="18" fill="#f8fafc" />
              <circle cx="172" cy="120" r="10" fill="url(#pixarIrisCapuchin)" />
              <circle cx="172" cy="120" r="5.5" fill="#020617" />
              <circle cx="169" cy="116" r="4.2" fill="#ffffff" />
              <circle cx="175" cy="124" r="1.8" fill="#fde68a" opacity="0.8" />
            </g>
          ) : (
            <g>
              <ellipse cx="108" cy="120" rx="14" ry="16" fill="#f8fafc" />
              <circle cx={108 + (isThinking ? 3.5 : pupilX)} cy={120 + (isThinking ? -3.5 : pupilY)} r="9" fill="url(#pixarIrisCapuchin)" />
              <circle cx={108 + (isThinking ? 3.5 : pupilX)} cy={120 + (isThinking ? -3.5 : pupilY)} r="5" fill="#020617" />
              <ellipse cx={105 + (isThinking ? 3.5 : pupilX * 0.5)} cy={116 + (isThinking ? -3.5 : pupilY * 0.5)} rx="3.5" ry="3" fill="#ffffff" />
              <circle cx={111 + (isThinking ? 3.5 : pupilX * 0.5)} cy={123 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.6" fill="#fde68a" opacity="0.8" />

              <ellipse cx="172" cy="120" rx="14" ry="16" fill="#f8fafc" />
              <circle cx={172 + (isThinking ? 3.5 : pupilX)} cy={120 + (isThinking ? -3.5 : pupilY)} r="9" fill="url(#pixarIrisCapuchin)" />
              <circle cx={172 + (isThinking ? 3.5 : pupilX)} cy={120 + (isThinking ? -3.5 : pupilY)} r="5" fill="#020617" />
              <ellipse cx={169 + (isThinking ? 3.5 : pupilX * 0.5)} cy={116 + (isThinking ? -3.5 : pupilY * 0.5)} rx="3.5" ry="3" fill="#ffffff" />
              <circle cx={175 + (isThinking ? 3.5 : pupilX * 0.5)} cy={123 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.6" fill="#fde68a" opacity="0.8" />
            </g>
          )}

          <path
            d={`M 128 156 Q 140 ${158 + (isHappy ? 10 : mouthH * 0.45)} 152 156`}
            stroke="#451a03"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill={mouthOpenAmount > 0.15 || isHappy || isSurprised ? "#450a0a" : "none"}
          />
          {(mouthOpenAmount > 0.15 || isHappy || isSurprised) && (
            <ellipse cx="140" cy={158 + mouthH * 0.4} rx={isVisemeRound ? 5 : 8} ry={mouthH * 0.35} fill="#f43f5e" />
          )}

          <g transform="translate(140, 240)">
            <path d="M -15 0 C -25 15 -15 35 0 45 C 15 35 25 15 15 0 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <path d="M -10 -2 L 0 -10 L 10 -2 L 0 2 Z" fill="#22c55e" />
            <text x="0" y="24" textAnchor="middle" fill="#fbbf24" fontWeight="900" fontSize="16">B</text>
          </g>

          {renderAccessoryOverlay(config.accessory)}
        </svg>
      );

    // ========================================================
    // 7. OSO MELERO / TAMANDÚA BET
    // ========================================================
    case "bet_hormiguero":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.5)] drop-shadow-[3px_3px_20px_rgba(56,189,248,0.5)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <radialGradient id="meleroCream3D" cx="42%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fef3c7" />
              <stop offset="75%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            <linearGradient id="meleroVest3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="140" cy="305" rx="68" ry="14" fill="#030712" opacity="0.65" />

          <circle cx="85" cy="80" r="20" fill="url(#meleroCream3D)" stroke="#d97706" strokeWidth="2.5" />
          <circle cx="195" cy="80" r="20" fill="url(#meleroCream3D)" stroke="#d97706" strokeWidth="2.5" />

          <ellipse cx="140" cy="225" rx="76" ry="76" fill="url(#meleroCream3D)" stroke="#d97706" strokeWidth="2.5" />
          <path d="M 80 190 C 80 270 200 270 200 190 C 170 205 110 205 80 190 Z" fill="url(#meleroVest3D)" />

          <ellipse cx="140" cy="120" rx="55" ry="50" fill="url(#meleroCream3D)" stroke="#d97706" strokeWidth="2.5" />
          <path
            d={`M 125 130 Q 140 135 155 130 L 148 ${170 + beakH * 0.4} Q 140 ${175 + beakH * 0.4} 132 ${170 + beakH * 0.4} Z`}
            fill="url(#meleroCream3D)"
            stroke="#d97706"
            strokeWidth="2"
          />
          <ellipse cx="140" cy={170 + beakH * 0.4} rx="8" ry="5" fill="#0f172a" />

          {isBlinking && !isSurprised ? (
            <path d="M 102 112 Q 112 120 122 112 M 158 112 Q 168 120 178 112" stroke="#451a03" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          ) : isHappy ? (
            <path d="M 102 114 Q 112 102 122 114 M 158 114 Q 168 102 178 114" stroke="#451a03" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          ) : isSurprised ? (
            <g>
              <circle cx="112" cy="112" r="11" fill="#0f172a" />
              <circle cx="110" cy="109" r="4.5" fill="#ffffff" />
              <circle cx="114" cy="115" r="1.8" fill="#fde68a" opacity="0.8" />
              <circle cx="168" cy="112" r="11" fill="#0f172a" />
              <circle cx="166" cy="109" r="4.5" fill="#ffffff" />
              <circle cx="170" cy="115" r="1.8" fill="#fde68a" opacity="0.8" />
            </g>
          ) : (
            <g>
              <circle cx="112" cy="112" r="9.5" fill="#0f172a" />
              <circle cx={110 + pupilX * 0.3} cy={110 + pupilY * 0.3} r="3.5" fill="#ffffff" />
              <circle cx={113 + pupilX * 0.3} cy={114 + pupilY * 0.3} r="1.6" fill="#fde68a" opacity="0.8" />
              <circle cx="168" cy="112" r="9.5" fill="#0f172a" />
              <circle cx={166 + pupilX * 0.3} cy={110 + pupilY * 0.3} r="3.5" fill="#ffffff" />
              <circle cx={169 + pupilX * 0.3} cy={114 + pupilY * 0.3} r="1.6" fill="#fde68a" opacity="0.8" />
            </g>
          )}

          <path d="M 95 190 L 185 260" stroke="#b45309" strokeWidth="7" strokeLinecap="round" />
          <rect x="165" y="240" width="30" height="25" rx="5" fill="#b45309" stroke="#78350f" strokeWidth="2" />

          {renderAccessoryOverlay(config.accessory)}
        </svg>
      );

    // ========================================================
    // 8. MORROCOY BET
    // ========================================================
    case "bet_morrocoy":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.5)] drop-shadow-[3px_3px_20px_rgba(56,189,248,0.5)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <radialGradient id="shellGrad3D" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="35%" stopColor="#16a34a" />
              <stop offset="75%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#14532d" />
            </radialGradient>
            <radialGradient id="tortoiseSkin3D" cx="42%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#bbf7d0" />
              <stop offset="45%" stopColor="#86efac" />
              <stop offset="85%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </radialGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="140" cy="305" rx="76" ry="14" fill="#030712" opacity="0.65" />

          <ellipse cx="140" cy="225" rx="85" ry="78" fill="url(#shellGrad3D)" stroke="#14532d" strokeWidth="3" />
          <polygon points="140,175 165,190 165,220 140,235 115,220 115,190" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />
          <polygon points="140,235 165,250 165,275 140,290 115,275 115,250" fill="#22c55e" stroke="#15803d" strokeWidth="2" />

          <ellipse cx="140" cy="125" rx="55" ry="50" fill="url(#tortoiseSkin3D)" stroke="#16a34a" strokeWidth="2.5" />

          {/* Safari Hat */}
          <g>
            <ellipse cx="140" cy="92" rx="65" ry="12" fill="#d97706" stroke="#92400e" strokeWidth="2.5" />
            <path d="M 100 90 C 100 50 180 50 180 90 Z" fill="#f59e0b" stroke="#92400e" strokeWidth="2.5" />
          </g>

          {isBlinking && !isSurprised ? (
            <path d="M 105 125 Q 116 132 127 125 M 153 125 Q 164 132 175 125" stroke="#14532d" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          ) : isHappy ? (
            <path d="M 105 128 Q 116 114 127 128 M 153 128 Q 164 114 175 128" stroke="#14532d" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          ) : isSurprised ? (
            <g>
              <circle cx="116" cy="125" r="11" fill="#14532d" />
              <circle cx="114" cy="122" r="4.5" fill="#ffffff" />
              <circle cx="118" cy="127" r="1.8" fill="#86efac" opacity="0.8" />
              <circle cx="164" cy="125" r="11" fill="#14532d" />
              <circle cx="162" cy="122" r="4.5" fill="#ffffff" />
              <circle cx="166" cy="127" r="1.8" fill="#86efac" opacity="0.8" />
            </g>
          ) : (
            <g>
              <circle cx="116" cy="125" r="9.5" fill="#14532d" />
              <circle cx={114 + pupilX * 0.3} cy={123 + pupilY * 0.3} r="3.5" fill="#ffffff" />
              <circle cx={117 + pupilX * 0.3} cy={126 + pupilY * 0.3} r="1.6" fill="#86efac" opacity="0.8" />
              <circle cx="164" cy="125" r="9.5" fill="#14532d" />
              <circle cx={162 + pupilX * 0.3} cy={123 + pupilY * 0.3} r="3.5" fill="#ffffff" />
              <circle cx={165 + pupilX * 0.3} cy={126 + pupilY * 0.3} r="1.6" fill="#86efac" opacity="0.8" />
            </g>
          )}

          <path
            d={`M 125 145 Q 140 ${148 + (isHappy ? 8 : mouthH * 0.45)} 155 145`}
            stroke="#14532d"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill={mouthOpenAmount > 0.15 || isHappy || isSurprised ? "#450a0a" : "none"}
          />
          {(mouthOpenAmount > 0.15 || isHappy || isSurprised) && (
            <ellipse cx="140" cy={147 + mouthH * 0.35} rx={5} ry={mouthH * 0.3} fill="#f43f5e" />
          )}

          {renderAccessoryOverlay(config.accessory)}
        </svg>
      );

    // ========================================================
    // 9. GUACHARACA / PAJARITO LECTOR BET
    // ========================================================
    case "bet_guacharaca":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.5)] drop-shadow-[3px_3px_20px_rgba(56,189,248,0.5)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <radialGradient id="birdBrown3D" cx="40%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="35%" stopColor="#a16207" />
              <stop offset="75%" stopColor="#713f12" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="140" cy="305" rx="68" ry="14" fill="#030712" opacity="0.65" />

          <ellipse cx="140" cy="205" rx="72" ry="80" fill="url(#birdBrown3D)" stroke="#451a03" strokeWidth="2.5" />
          <path d="M 125 50 C 135 25 155 25 155 50 Z" fill="#854d0e" />
          <circle cx="140" cy="115" r="58" fill="url(#birdBrown3D)" stroke="#451a03" strokeWidth="2.5" />

          {/* Professor Spectacles */}
          <g>
            <circle cx="112" cy="115" r="18" fill="#ffffff" opacity="0.95" stroke="#0f172a" strokeWidth="3.5" />
            <circle cx="168" cy="115" r="18" fill="#ffffff" opacity="0.95" stroke="#0f172a" strokeWidth="3.5" />
            <path d="M 130 115 L 150 115" stroke="#0f172a" strokeWidth="3.5" />
            <circle cx={112 + (isThinking ? 3.5 : pupilX)} cy={115 + (isThinking ? -3.5 : pupilY)} r={isSurprised ? 9.5 : 7.5} fill="#0f172a" />
            <circle cx={110 + (isThinking ? 3.5 : pupilX * 0.5)} cy={112 + (isThinking ? -3.5 : pupilY * 0.5)} r="3" fill="#ffffff" />
            <circle cx={168 + (isThinking ? 3.5 : pupilX)} cy={115 + (isThinking ? -3.5 : pupilY)} r={isSurprised ? 9.5 : 7.5} fill="#0f172a" />
            <circle cx={166 + (isThinking ? 3.5 : pupilX * 0.5)} cy={112 + (isThinking ? -3.5 : pupilY * 0.5)} r="3" fill="#ffffff" />
          </g>

          <path
            d={`M 125 130 Q 140 128 155 130 L 140 ${152 + (isSpeaking || isSurprised ? beakH * 0.5 : 0)} Z`}
            fill="#f59e0b"
            stroke="#b45309"
            strokeWidth="2.5"
          />

          <g transform="translate(90, 220)">
            <rect x="0" y="0" width="45" height="35" rx="3" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
            <rect x="50" y="0" width="45" height="35" rx="3" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
            <path d="M 8 10 L 37 10 M 8 18 L 37 18 M 58 10 L 87 10 M 58 18 L 87 18" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          </g>

          {renderAccessoryOverlay(config.accessory)}
        </svg>
      );

    // ========================================================
    // 10. TUQUEQUE CRIOLLO BET
    // ========================================================
    case "bet_tuqueque":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.5)] drop-shadow-[3px_3px_20px_rgba(56,189,248,0.5)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <radialGradient id="geckoCyan3D" cx="38%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="35%" stopColor="#22d3ee" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0e7490" />
            </radialGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="140" cy="305" rx="66" ry="14" fill="#030712" opacity="0.65" />

          <ellipse cx="140" cy="220" rx="68" ry="76" fill="url(#geckoCyan3D)" stroke="#0e7490" strokeWidth="2.5" />
          <circle cx="115" cy="210" r="7" fill="#fef08a" opacity="0.85" />
          <circle cx="165" cy="210" r="7" fill="#fef08a" opacity="0.85" />
          <circle cx="140" cy="250" r="8" fill="#fef08a" opacity="0.85" />

          <ellipse cx="140" cy="120" rx="64" ry="58" fill="url(#geckoCyan3D)" stroke="#0e7490" strokeWidth="2.5" />

          {/* Large Bulbous Pixar Gecko Eyes */}
          <g>
            <ellipse cx="98" cy="98" rx="22" ry="24" fill="#f8fafc" stroke="#0e7490" strokeWidth="2.5" />
            <ellipse cx={98 + (isThinking ? 3.5 : pupilX)} cy={98 + (isThinking ? -3.5 : pupilY)} rx={isSurprised ? 11 : 8} ry={isSurprised ? 17 : 15} fill="#0f172a" />
            <circle cx={95 + pupilX * 0.5} cy={92 + pupilY * 0.5} r="4.5" fill="#ffffff" />
            <circle cx={101 + pupilX * 0.5} cy={103 + pupilY * 0.5} r="2" fill="#67e8f9" opacity="0.8" />

            <ellipse cx="182" cy="98" rx="22" ry="24" fill="#f8fafc" stroke="#0e7490" strokeWidth="2.5" />
            <ellipse cx={182 + (isThinking ? 3.5 : pupilX)} cy={98 + (isThinking ? -3.5 : pupilY)} rx={isSurprised ? 11 : 8} ry={isSurprised ? 17 : 15} fill="#0f172a" />
            <circle cx={179 + pupilX * 0.5} cy={92 + pupilY * 0.5} r="4.5" fill="#ffffff" />
            <circle cx={185 + pupilX * 0.5} cy={103 + pupilY * 0.5} r="2" fill="#67e8f9" opacity="0.8" />
          </g>

          <path
            d={`M 105 142 Q 140 ${148 + (isHappy ? 12 : mouthH * 0.5)} 175 142`}
            stroke="#083344"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill={mouthOpenAmount > 0.15 || isHappy || isSurprised ? "#450a0a" : "none"}
          />
          {(mouthOpenAmount > 0.15 || isHappy || isSurprised) && (
            <ellipse cx="140" cy={147 + mouthH * 0.4} rx={10} ry={mouthH * 0.35} fill="#f43f5e" />
          )}

          {renderAccessoryOverlay(config.accessory)}
        </svg>
      );

    // ========================================================
    // HUMAN TEACHERS (Stylized 2.5D Coaches)
    // ========================================================
    case "teacher_female":
    case "professor_male":
    case "tutor_casual":
    case "mentor_cyber":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-3px_-3px_16px_rgba(245,158,11,0.4)] drop-shadow-[3px_3px_20px_rgba(56,189,248,0.4)] drop-shadow-[0_24px_38px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <radialGradient id="humanSkin3D" cx="42%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="35%" stopColor="#fed7aa" />
              <stop offset="75%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>

            <linearGradient id="humanSuit3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.outfitColor || "#2563eb"} />
              <stop offset="50%" stopColor={config.outfitColor ? `${config.outfitColor}cc` : "#1e3a8a"} />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <radialGradient id="hairGrad3D" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor={config.hairColor ? `${config.hairColor}ee` : "#78350f"} />
              <stop offset="60%" stopColor={config.hairColor || "#451a03"} />
              <stop offset="100%" stopColor="#1c0a01" />
            </radialGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="140" cy="305" rx="72" ry="14" fill="#030712" opacity="0.65" />

          <path
            d="M 60 210 C 60 270 220 270 220 210 L 190 190 L 90 190 Z"
            fill="url(#humanSuit3D)"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          <path d="M 120 185 L 140 220 L 160 185 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="140" cy="228" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />

          <rect x="126" y="165" width="28" height="25" rx="6" fill="url(#humanSkin3D)" stroke="#d97706" strokeWidth="2" />
          <path d="M 72 120 C 72 50 208 50 208 120 C 215 170 65 170 72 120 Z" fill="url(#hairGrad3D)" />
          <ellipse cx="140" cy="125" rx="55" ry="60" fill="url(#humanSkin3D)" stroke="#d97706" strokeWidth="2.5" />
          <path
            d="M 85 95 C 105 70 175 70 195 95 C 180 105 160 90 140 100 C 120 110 100 95 85 95 Z"
            fill="url(#hairGrad3D)"
          />

          {config.glasses !== "none" && (
            <g>
              <rect x="92" y="108" width="34" height="26" rx="8" fill="none" stroke="#0f172a" strokeWidth="3.5" />
              <rect x="154" y="108" width="34" height="26" rx="8" fill="none" stroke="#0f172a" strokeWidth="3.5" />
              <path d="M 126 120 L 154 120" stroke="#0f172a" strokeWidth="3" />
            </g>
          )}

          {isBlinking && !isSurprised ? (
            <g>
              <path d="M 98 120 Q 108 128 118 120" stroke="#451a03" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 162 120 Q 172 128 182 120" stroke="#451a03" strokeWidth="4" strokeLinecap="round" fill="none" />
            </g>
          ) : isHappy ? (
            <g>
              <path d="M 98 122 Q 108 110 118 122" stroke="#451a03" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M 162 122 Q 172 110 182 122" stroke="#451a03" strokeWidth="5" strokeLinecap="round" fill="none" />
            </g>
          ) : isSurprised ? (
            <g>
              <ellipse cx="108" cy="118" rx="14" ry="16" fill="#f8fafc" />
              <circle cx="108" cy="118" r="8.5" fill="#1e293b" />
              <circle cx="105" cy="114" r="3.8" fill="#ffffff" />

              <ellipse cx="172" cy="118" rx="14" ry="16" fill="#f8fafc" />
              <circle cx="172" cy="118" r="8.5" fill="#1e293b" />
              <circle cx="169" cy="114" r="3.8" fill="#ffffff" />
            </g>
          ) : (
            <g>
              <ellipse cx="108" cy="118" rx="11" ry="13" fill="#f8fafc" />
              <circle cx={108 + (isThinking ? 3.5 : pupilX)} cy={118 + (isThinking ? -3.5 : pupilY)} r="7" fill="#1e293b" />
              <circle cx={106 + (isThinking ? 3.5 : pupilX * 0.5)} cy={115 + (isThinking ? -3.5 : pupilY * 0.5)} r="2.8" fill="#ffffff" />
              <circle cx={110 + (isThinking ? 3.5 : pupilX * 0.5)} cy={119 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.4" fill="#60a5fa" opacity="0.8" />

              <ellipse cx="172" cy="118" rx="11" ry="13" fill="#f8fafc" />
              <circle cx={172 + (isThinking ? 3.5 : pupilX)} cy={118 + (isThinking ? -3.5 : pupilY)} r="7" fill="#1e293b" />
              <circle cx={170 + (isThinking ? 3.5 : pupilX * 0.5)} cy={115 + (isThinking ? -3.5 : pupilY * 0.5)} r="2.8" fill="#ffffff" />
              <circle cx={174 + (isThinking ? 3.5 : pupilX * 0.5)} cy={119 + (isThinking ? -3.5 : pupilY * 0.5)} r="1.4" fill="#60a5fa" opacity="0.8" />
            </g>
          )}

          {/* Blush Cheeks */}
          <circle cx="94" cy="136" r="8" fill="#fb7185" opacity={isHappy ? 0.8 : 0.35} />
          <circle cx="186" cy="136" r="8" fill="#fb7185" opacity={isHappy ? 0.8 : 0.35} />

          {/* Mouth */}
          <path
            d={`M 126 150 Q 140 ${152 + (isHappy ? 10 : mouthH * 0.5)} 154 150`}
            stroke="#991b1b"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill={mouthOpenAmount > 0.15 || isHappy || isSurprised ? "#450a0a" : "none"}
          />
          {(mouthOpenAmount > 0.15 || isHappy || isSurprised) && (
            <ellipse cx="140" cy={152 + mouthH * 0.4} rx={6} ry={mouthH * 0.35} fill="#f43f5e" />
          )}

          {renderAccessoryOverlay(config.accessory)}
        </svg>
      );

    // ========================================================
    // 11. SUPER MARIO (Authentic 2.5D Animated Mascot)
    // ========================================================
    case "mario_hero":
      return (
        <SuperMarioMascot
          isSpeaking={isSpeaking}
          isBlinking={isBlinking}
          isHappy={isHappy}
          isSurprised={isSurprised}
          isThinking={isThinking}
          pupilX={pupilX}
          pupilY={pupilY}
          mouthOpenAmount={mouthOpenAmount}
          mouthH={mouthH}
          isVisemeRound={isVisemeRound}
          accessory={config.accessory}
          renderAccessoryOverlay={renderAccessoryOverlay}
        />
      );

    // ========================================================
    // 12. LUIGI HERO (Authentic 2.5D Animated Mascot)
    // ========================================================
    case "luigi_hero":
      return (
        <LuigiMascot
          isSpeaking={isSpeaking}
          isBlinking={isBlinking}
          isHappy={isHappy}
          isSurprised={isSurprised}
          isThinking={isThinking}
          pupilX={pupilX}
          pupilY={pupilY}
          mouthOpenAmount={mouthOpenAmount}
          mouthH={mouthH}
          isVisemeRound={isVisemeRound}
          accessory={config.accessory}
          renderAccessoryOverlay={renderAccessoryOverlay}
        />
      );

    // ========================================================
    // 13. GOOMBA AMIGO (Authentic 2.5D Animated Mascot)
    // ========================================================
    case "goomba_shroom":
      return (
        <GoombaMascot
          isSpeaking={isSpeaking}
          isBlinking={isBlinking}
          isHappy={isHappy}
          isSurprised={isSurprised}
          isThinking={isThinking}
          pupilX={pupilX}
          pupilY={pupilY}
          mouthOpenAmount={mouthOpenAmount}
          mouthH={mouthH}
          isVisemeRound={isVisemeRound}
          accessory={config.accessory}
          renderAccessoryOverlay={renderAccessoryOverlay}
        />
      );

    // ========================================================
    // 14. REXY EL T-REX (Friendly Prehistoric Coach)
    // ========================================================
    case "trex_friendly":
      return (
        <RexyMascot
          isSpeaking={isSpeaking}
          isBlinking={isBlinking}
          isHappy={isHappy}
          isSurprised={isSurprised}
          isThinking={isThinking}
          pupilX={pupilX}
          pupilY={pupilY}
          mouthOpenAmount={mouthOpenAmount}
          mouthH={mouthH}
          isVisemeRound={isVisemeRound}
          accessory={config.accessory}
          renderAccessoryOverlay={renderAccessoryOverlay}
        />
      );

    // ========================================================
    // 15. PIP EL VELOCIRAPTOR (Fast Agility Dino Mascot)
    // ========================================================
    case "raptor_dino":
      return (
        <PipRaptorMascot
          isSpeaking={isSpeaking}
          isBlinking={isBlinking}
          isHappy={isHappy}
          isSurprised={isSurprised}
          isThinking={isThinking}
          pupilX={pupilX}
          pupilY={pupilY}
          mouthOpenAmount={mouthOpenAmount}
          mouthH={mouthH}
          isVisemeRound={isVisemeRound}
          accessory={config.accessory}
          renderAccessoryOverlay={renderAccessoryOverlay}
        />
      );
    default:
      return null;
  }
};
