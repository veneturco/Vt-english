import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { AvatarAccessory, AvatarAnimationState, AvatarConfig } from "../types";
import { RigOverlay2D } from "./RigOverlay2D";
import {
  SuperMarioMascot,
  LuigiMascot,
  GoombaMascot,
  RexyMascot,
  PipRaptorMascot,
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
  | "celebrating";

interface Avatar2DCanvasProps {
  config: AvatarConfig;
  animationState: AvatarAnimationState;
  mouthIntensity?: number; // 0 to 1
  isListening?: boolean;
  onMascotClick?: () => void;
  overrideEmotion?: MascotGestureEmotion | null;
  onCustomizerClick?: () => void;
}

export const Avatar2DCanvas: React.FC<Avatar2DCanvasProps> = ({
  config,
  animationState,
  mouthIntensity = 0,
  isListening = false,
  onMascotClick,
  overrideEmotion = null,
  onCustomizerClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [activeEmote, setActiveEmote] = useState<string | null>(null);
  const [currentGesture, setCurrentGesture] = useState<MascotGestureEmotion>("idle");
  const [visemeIndex, setVisemeIndex] = useState<number>(0);
  const [eyeSaccade, setEyeSaccade] = useState({ x: 0, y: 0 });
  const [idleNudge, setIdleNudge] = useState<string | null>(null);
  const [speechAperture, setSpeechAperture] = useState<number>(0);
  const lastInteractionTime = useRef<number>(Date.now());

  // Map incoming AvatarAnimationState to effective gesture emotion
  const mappedAnimationEmotion: MascotGestureEmotion =
    animationState === "alegre"
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

    if (gesture === "celebrating" || gesture === "alegre" || gesture === "encouraging") {
      try {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#3b82f6", "#10b981", "#ec4899", "#f59e0b"],
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
    const emojis = ["🔥", "✨", "💡", "🌟", "🎉", "💖", "😲"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const randomGesture: MascotGestureEmotion =
      Math.random() > 0.6 ? "alegre" : Math.random() > 0.3 ? "sorpresa" : "pensativo";
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
  const isHappy =
    effectiveEmotion === "alegre" ||
    effectiveEmotion === "celebrating" ||
    effectiveEmotion === "encouraging";

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
      className="relative w-full h-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center select-none overflow-hidden"
      style={{ perspective: "1100px" }}
    >
      {/* 1. Pixar 3D Cinematic Studio Stage & Volumetric Lighting */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Pixar Top-Left Key Light (Warm Amber / Golden Sun) */}
        <div
          className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-gradient-to-br from-amber-400/25 via-orange-500/15 to-transparent blur-3xl transition-opacity duration-700"
          style={{ opacity: isSpeaking ? 0.9 : 0.65 }}
        />

        {/* Pixar Bottom-Right Fill & Rim Light (Cool Cyan / Azure Velvet) */}
        <div
          className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full bg-gradient-to-tl from-cyan-400/25 via-blue-600/15 to-transparent blur-3xl transition-opacity duration-700"
          style={{ opacity: isSpeaking ? 0.9 : 0.65 }}
        />

        {/* Dynamic Pixar Volumetric Mood Aura */}
        <div
          className={`w-80 h-80 rounded-full blur-3xl transition-all duration-700 ${
            isSpeaking
              ? "bg-gradient-to-tr from-amber-500/35 via-rose-500/25 to-yellow-300/30 scale-120"
              : isSurprised
              ? "bg-gradient-to-tr from-purple-500/40 via-fuchsia-500/30 to-pink-400/30 scale-135 animate-pulse"
              : isPensive
              ? "bg-gradient-to-tr from-sky-500/35 via-indigo-500/25 to-cyan-300/25 scale-115"
              : isHappy
              ? "bg-gradient-to-tr from-emerald-500/40 via-teal-400/30 to-amber-300/30 scale-130"
              : effectiveEmotion === "listening"
              ? "bg-gradient-to-tr from-cyan-500/35 via-blue-500/25 to-teal-300/25 scale-120"
              : "bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-amber-500/10 scale-105"
          }`}
        />

        {/* Pixar Studio Floating Cinema Dust Particles / Micro-Sparkles */}
        {[
          { x: "20%", y: "25%", size: 4, dur: 4.2, delay: 0 },
          { x: "75%", y: "30%", size: 3, dur: 3.6, delay: 1.2 },
          { x: "30%", y: "70%", size: 5, dur: 5.1, delay: 0.8 },
          { x: "82%", y: "65%", size: 3.5, dur: 4.8, delay: 2.1 },
          { x: "15%", y: "55%", size: 4.5, dur: 3.9, delay: 1.7 },
          { x: "65%", y: "20%", size: 3, dur: 4.5, delay: 0.4 },
        ].map((particle, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-amber-300/70 shadow-[0_0_8px_rgba(251,191,36,0.9)] pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [-12, 12, -12],
              x: [-8, 8, -8],
              opacity: [0.2, 0.85, 0.2],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: particle.dur,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Pixar Studio Reflective Stage Platform with Rim-Lit Edge */}
        <div
          className="absolute bottom-5 w-80 h-24 rounded-[100%] bg-gradient-to-t from-[#05080e] via-[#0f172a]/95 to-slate-900/60 border-2 border-amber-500/40 shadow-[0_0_45px_rgba(245,158,11,0.35),inset_0_2px_12px_rgba(255,255,255,0.25)] transition-transform duration-300"
          style={{ transform: "rotateX(72deg)" }}
        >
          {/* Specular Floor Gloss Glow */}
          <div className="w-full h-full rounded-[100%] bg-gradient-to-b from-amber-400/20 via-transparent to-cyan-500/15" />

          {/* Pulsating Stage Ring */}
          <div
            className={`w-full h-full rounded-[100%] border-2 border-amber-400/50 ${
              isSpeaking
                ? "animate-ping opacity-45 shadow-[0_0_20px_rgba(245,158,11,0.8)]"
                : isSurprised
                ? "border-purple-400/80 animate-ping opacity-55"
                : isPensive
                ? "border-sky-400/70 opacity-50"
                : isHappy
                ? "border-emerald-400/70 opacity-60"
                : effectiveEmotion === "listening"
                ? "border-cyan-400/70 opacity-50"
                : "opacity-25"
            }`}
          />
        </div>
      </div>

      {/* 2. Inactivity (Idle Behavior) Encouraging Badge */}
      <AnimatePresence>
        {idleNudge && !isSpeaking && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: -90, scale: 1 }}
            exit={{ opacity: 0, y: -110, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="absolute top-16 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-amber-500/50 shadow-[0_10px_25px_rgba(0,0,0,0.6)] text-xs font-bold text-amber-300 flex items-center gap-1.5 pointer-events-none"
          >
            <span>{idleNudge}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Audio Wave Halo (When Speaking) */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.15, 0.6, 0.15], scale: [0.95, 1.28, 1.45] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute w-64 h-64 rounded-full border-2 border-amber-400/40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 4. Inquisitive Focus Rings (When Listening or Pensive) */}
      <AnimatePresence>
        {(effectiveEmotion === "listening" || isPensive) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0.25, 0.75, 0.25], scale: [1, 1.22, 1.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-64 h-64 rounded-full border-2 border-cyan-400/50 pointer-events-none"
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
        className="relative z-10 flex flex-col items-center justify-center origin-bottom cursor-pointer group transform-gpu"
        animate={{
          y: isSurprised
            ? [-16, -14]
            : isHappy
            ? [-18, 0, -14, 0]
            : isSpeaking
            ? [0, -7, 0]
            : isPensive
            ? [-5, -5]
            : effectiveEmotion === "listening"
            ? [0, -3, 0]
            : [0, -5, 0],
          scaleY: isSurprised
            ? [1.06, 1.04]
            : isHappy
            ? [1.08, 0.94, 1.05, 1]
            : isSpeaking
            ? [1, 1.025, 1]
            : [1, 1.018, 1],
          scaleX: isSurprised ? 0.96 : isHappy ? [0.94, 1.06, 0.96, 1] : 1,
          rotate: isPensive
            ? -5.5
            : isSurprised
            ? 0
            : effectiveEmotion === "listening"
            ? 3.8
            : isHappy
            ? [-2.5, 2.5, -2, 0]
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
}

// Global SVG Unlockable Accessories Layer
function renderAccessoryOverlay(accessory: AvatarAccessory) {
  switch (accessory) {
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
}: CharacterRenderProps) {
  const isHappy = emotion === "alegre" || emotion === "celebrating" || emotion === "encouraging";
  const isThinking = emotion === "pensativo";
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
    // 1. TURPIAL BET (Official Mascot - Pixar 3D Masterpiece)
    // ========================================================
    case "bet_turpial":
      return (
        <svg
          viewBox="0 0 280 340"
          className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-4px_-4px_18px_rgba(245,158,11,0.55)] drop-shadow-[4px_4px_22px_rgba(56,189,248,0.55)] drop-shadow-[0_26px_40px_rgba(0,0,0,0.9)]"
        >
          <defs>
            {/* Pixar 3D Volumetric Orange Belly with Subsurface Scattering */}
            <radialGradient id="turpialBellyMaster3D" cx="42%" cy="36%" r="65%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="12%" stopColor="#fef08a" />
              <stop offset="28%" stopColor="#fbbf24" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="82%" stopColor="#ea580c" />
              <stop offset="96%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </radialGradient>

            {/* Pixar Velvet Obsidian Black Head Hood & Wing Plumage */}
            <radialGradient id="turpialObsidianFeather3D" cx="38%" cy="28%" r="68%">
              <stop offset="0%" stopColor="#52525b" />
              <stop offset="18%" stopColor="#3f3f46" />
              <stop offset="48%" stopColor="#27272a" />
              <stop offset="78%" stopColor="#18181b" />
              <stop offset="92%" stopColor="#09090b" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Wing Feather Texture Gradient */}
            <linearGradient id="turpialWingGradient3D" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="35%" stopColor="#18181b" />
              <stop offset="80%" stopColor="#09090b" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>

            {/* Beak Glossy Horn Material with Top-Down Specular */}
            <linearGradient id="turpialBeakMaster3D" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#71717a" />
              <stop offset="20%" stopColor="#52525b" />
              <stop offset="50%" stopColor="#27272a" />
              <stop offset="85%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>

            {/* Turpial Orbital Cyan/Blue Mask Gradient */}
            <radialGradient id="turpialEyeMaskMaster3D" cx="45%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="30%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>

            {/* Deep Glass Amber/Obsidian Pixar Iris */}
            <radialGradient id="turpialPixarIris3D" cx="38%" cy="34%" r="62%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="18%" stopColor="#f59e0b" />
              <stop offset="42%" stopColor="#b45309" />
              <stop offset="72%" stopColor="#451a03" />
              <stop offset="94%" stopColor="#1c0a01" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            {/* Golden Medal 3D Polished Brass Material */}
            <linearGradient id="goldMedalMaster3D" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="15%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#ca8a04" />
              <stop offset="92%" stopColor="#a16207" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>

            {/* Blue Medal Ribbon Material */}
            <linearGradient id="medalRibbonMaster3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="25%" stopColor="#2563eb" />
              <stop offset="70%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>

          {/* 1. Ambient Ground Contact Shadow */}
          <ellipse cx="140" cy="308" rx="72" ry="14" fill="#020617" opacity="0.7" />
          <ellipse cx="140" cy="308" rx="46" ry="8" fill="#000000" opacity="0.9" />

          {/* 2. Left Articulated Wing (Pixar Layered Feathers with Rim Light) */}
          <g
            className="transition-transform duration-200 origin-[65px_175px]"
            style={{
              transform: isHappy
                ? "rotate(-32deg) translateY(-10px)"
                : isSurprised
                ? "rotate(-42deg) translateY(-16px)"
                : isSpeaking
                ? `rotate(${Math.sin(Date.now() / 120) * 14}deg)`
                : "rotate(0deg)",
            }}
          >
            {/* Wing Base */}
            <path
              d="M 68 145 C 32 152 10 188 16 230 C 22 262 55 268 76 236 C 88 214 84 168 68 145 Z"
              fill="url(#turpialWingGradient3D)"
              stroke="#52525b"
              strokeWidth="2"
            />
            {/* White Wingbar Striping (Authentic Turpial marking) */}
            <path
              d="M 32 186 C 26 206 32 232 48 240 C 46 216 40 196 32 186 Z"
              fill="#f8fafc"
              opacity="0.95"
            />
            <path
              d="M 46 172 C 40 192 48 216 62 222 C 58 202 54 184 46 172 Z"
              fill="#e2e8f0"
              opacity="0.8"
            />
            {/* Wing Feather Crease Shadow */}
            <path
              d="M 62 168 C 50 192 56 220 70 230"
              stroke="#09090b"
              strokeWidth="3.5"
              fill="none"
              opacity="0.75"
            />
          </g>

          {/* 3. Right Articulated Wing */}
          <g
            className="transition-transform duration-200 origin-[215px_175px]"
            style={{
              transform: isHappy
                ? "rotate(32deg) translateY(-10px)"
                : isSurprised
                ? "rotate(42deg) translateY(-16px)"
                : isSpeaking
                ? `rotate(${-Math.sin(Date.now() / 120) * 14}deg)`
                : "rotate(0deg)",
            }}
          >
            <path
              d="M 212 145 C 248 152 270 188 264 230 C 258 262 225 268 204 236 C 192 214 196 168 212 145 Z"
              fill="url(#turpialWingGradient3D)"
              stroke="#52525b"
              strokeWidth="2"
            />
            {/* White Wingbar Striping */}
            <path
              d="M 248 186 C 254 206 248 232 232 240 C 234 216 240 196 248 186 Z"
              fill="#f8fafc"
              opacity="0.95"
            />
            <path
              d="M 234 172 C 240 192 232 216 218 222 C 222 202 226 184 234 172 Z"
              fill="#e2e8f0"
              opacity="0.8"
            />
            {/* Wing Feather Crease Shadow */}
            <path
              d="M 218 168 C 230 192 224 220 210 230"
              stroke="#09090b"
              strokeWidth="3.5"
              fill="none"
              opacity="0.75"
            />
          </g>

          {/* 4. Plump Chubby 3D Body (Volumetric Orange Plumage) */}
          <ellipse
            cx="140"
            cy="198"
            rx="76"
            ry="90"
            fill="url(#turpialBellyMaster3D)"
            stroke="#9a3412"
            strokeWidth="1.5"
          />

          {/* Subsurface Feather Highlights & Belly Depth */}
          <ellipse cx="130" cy="168" rx="38" ry="40" fill="#fffbeb" opacity="0.32" />
          <ellipse cx="140" cy="225" rx="52" ry="50" fill="#fbbf24" opacity="0.28" />

          {/* Subtle Individual Fluffy Feather Lines on Breast */}
          <path d="M 108 200 Q 120 210 132 202" stroke="#ea580c" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round" />
          <path d="M 148 202 Q 160 210 172 200" stroke="#ea580c" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round" />
          <path d="M 126 218 Q 140 228 154 218" stroke="#c2410c" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />

          {/* 5. Black Velvet Head Hood (Plush Contoured Mask) */}
          <path
            d="M 72 152 C 72 82 102 38 140 38 C 178 38 208 82 208 152 C 208 180 196 206 178 212 C 160 218 120 218 102 212 C 84 206 72 180 72 152 Z"
            fill="url(#turpialObsidianFeather3D)"
            stroke="#3f3f46"
            strokeWidth="2"
          />

          {/* Head Top Specular Glow (Cinematic Keylight) */}
          <ellipse cx="134" cy="65" rx="42" ry="20" fill="#71717a" opacity="0.22" />

          {/* Feather Crown Tuft */}
          <path d="M 132 40 C 136 16 144 8 149 12 C 151 20 147 32 145 40 Z" fill="#27272a" />
          <path d="M 144 40 C 150 18 160 14 163 18 C 163 28 155 36 151 42 Z" fill="#3f3f46" />

          {/* 6. Cyan/Azure Orbital Eye Patches (Vibrant Turpial Feature) */}
          <ellipse
            cx="105"
            cy="118"
            rx="23"
            ry="27"
            fill="url(#turpialEyeMaskMaster3D)"
            stroke="#0284c7"
            strokeWidth="2"
          />
          <ellipse
            cx="175"
            cy="118"
            rx="23"
            ry="27"
            fill="url(#turpialEyeMaskMaster3D)"
            stroke="#0284c7"
            strokeWidth="2"
          />

          {/* 7. Expressive Animated Eyebrow Arcs */}
          <g>
            <path
              d={
                isSurprised
                  ? "M 88 80 Q 105 68 122 80"
                  : isThinking
                  ? "M 90 94 Q 105 88 120 96"
                  : isHappy
                  ? "M 88 88 Q 105 76 122 88"
                  : isListening
                  ? "M 88 92 Q 105 84 122 92"
                  : "M 90 95 Q 105 89 120 95"
              }
              stroke="#fbbf24"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={
                isSurprised
                  ? "M 158 80 Q 175 68 192 80"
                  : isThinking
                  ? "M 160 90 Q 175 80 190 84"
                  : isHappy
                  ? "M 158 88 Q 175 76 192 88"
                  : isListening
                  ? "M 158 94 Q 175 86 192 92"
                  : "M 160 95 Q 175 89 190 95"
              }
              stroke="#fbbf24"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* 8. LEFT PIXAR EYE (Volumetric Sclera + Triple-Layer Catchlights) */}
          {isBlinking && !isSurprised ? (
            <path
              d="M 92 120 Q 105 130 118 120"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : isHappy ? (
            <path
              d="M 92 122 Q 105 106 118 122"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <g>
              {/* White Sclera with Ambient Occlusion */}
              <ellipse cx="105" cy="118" rx="18" ry="21" fill="#f8fafc" />
              <ellipse cx="105" cy="116" rx="17" ry="19" fill="#ffffff" />

              {/* Large Caramel/Obsidian Pixar Iris */}
              <circle
                cx={105 + (isThinking ? 3.5 : isSurprised ? 0 : pupilX)}
                cy={118 + (isThinking ? -4 : isSurprised ? -1 : pupilY)}
                r={isSurprised ? 13 : 12.5}
                fill="url(#turpialPixarIris3D)"
              />

              {/* Deep Obsidian Pupil Core */}
              <circle
                cx={105 + (isThinking ? 3.5 : isSurprised ? 0 : pupilX)}
                cy={118 + (isThinking ? -4 : isSurprised ? -1 : pupilY)}
                r={isSurprised ? 7.5 : 7}
                fill="#000000"
              />

              {/* Catchlight #1: Studio Softbox Primary Reflection (Top-Left Star Highlight) */}
              <ellipse
                cx={101 + (isThinking ? 3.5 : isSurprised ? 0 : pupilX * 0.4)}
                cy={112 + (isThinking ? -4 : isSurprised ? -1 : pupilY * 0.4)}
                rx="4.8"
                ry="4"
                fill="#ffffff"
              />

              {/* Catchlight #2: Subtle Secondary Ambient Bounce (Bottom-Right Amber Glow) */}
              <circle
                cx={109 + (isThinking ? 3.5 : isSurprised ? 0 : pupilX * 0.4)}
                cy={123 + (isThinking ? -4 : isSurprised ? -1 : pupilY * 0.4)}
                r="2.2"
                fill="#fde047"
                opacity="0.85"
              />

              {/* Catchlight #3: Micro Cyan Sky Reflection Ring */}
              <circle
                cx={98 + (isThinking ? 3.5 : isSurprised ? 0 : pupilX * 0.3)}
                cy={120 + (isThinking ? -4 : isSurprised ? -1 : pupilY * 0.3)}
                r="1.2"
                fill="#38bdf8"
                opacity="0.75"
              />
            </g>
          )}

          {/* 9. RIGHT PIXAR EYE */}
          {isBlinking && !isSurprised ? (
            <path
              d="M 162 120 Q 175 130 188 120"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : isHappy ? (
            <path
              d="M 162 122 Q 175 106 188 122"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <g>
              <ellipse cx="175" cy="118" rx="18" ry="21" fill="#f8fafc" />
              <ellipse cx="175" cy="116" rx="17" ry="19" fill="#ffffff" />

              <circle
                cx={175 + (isThinking ? 3.5 : isSurprised ? 0 : pupilX)}
                cy={118 + (isThinking ? -4 : isSurprised ? -1 : pupilY)}
                r={isSurprised ? 13 : 12.5}
                fill="url(#turpialPixarIris3D)"
              />

              <circle
                cx={175 + (isThinking ? 3.5 : isSurprised ? 0 : pupilX)}
                cy={118 + (isThinking ? -4 : isSurprised ? -1 : pupilY)}
                r={isSurprised ? 7.5 : 7}
                fill="#000000"
              />

              <ellipse
                cx={171 + (isThinking ? 3.5 : isSurprised ? 0 : pupilX * 0.4)}
                cy={112 + (isThinking ? -4 : isSurprised ? -1 : pupilY * 0.4)}
                rx="4.8"
                ry="4"
                fill="#ffffff"
              />

              <circle
                cx={179 + (isThinking ? 3.5 : isSurprised ? 0 : pupilX * 0.4)}
                cy={123 + (isThinking ? -4 : isSurprised ? -1 : pupilY * 0.4)}
                r="2.2"
                fill="#fde047"
                opacity="0.85"
              />

              <circle
                cx={168 + (isThinking ? 3.5 : isSurprised ? 0 : pupilX * 0.3)}
                cy={120 + (isThinking ? -4 : isSurprised ? -1 : pupilY * 0.3)}
                r="1.2"
                fill="#38bdf8"
                opacity="0.75"
              />
            </g>
          )}

          {/* 10. Cute Blush on Cheeks (Happy Emote) */}
          {isHappy && (
            <g>
              <ellipse cx="84" cy="142" rx="12" ry="7" fill="#f43f5e" opacity="0.7" />
              <ellipse cx="196" cy="142" rx="12" ry="7" fill="#f43f5e" opacity="0.7" />
            </g>
          )}

          {/* 11. ARTICULATED 3D GLOSSY BEAK (Synchronized Phonetic Mouth Engine) */}
          <g className="origin-[140px_138px]">
            {/* Top Beak Shaded Volume */}
            <path
              d={`M 116 136 Q 140 131 164 136 Q 152 150 140 ${
                158 + (isSpeaking || isSurprised ? beakH * 0.35 : 0)
              } Q 128 150 116 136 Z`}
              fill="url(#turpialBeakMaster3D)"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Top Beak Ridge Gloss Specular */}
            <path
              d="M 132 135 Q 140 133 148 135 Q 143 144 140 148 Z"
              fill="#cbd5e1"
              opacity="0.85"
            />

            {/* Mouth Cavity Interior with Tongue & Soft Shadows */}
            {(mouthOpenAmount > 0.12 || isSurprised || isHappy) && (
              <g>
                <ellipse
                  cx="140"
                  cy={154 + beakH * 0.45}
                  rx={isVisemeRound || isSurprised ? 14 : 18}
                  ry={Math.max(6, beakH * 0.65)}
                  fill="#450a0a"
                />
                <ellipse
                  cx="140"
                  cy={156 + beakH * 0.55}
                  rx={isVisemeSmile ? 15 : 11}
                  ry={Math.max(4, beakH * 0.38)}
                  fill="#f43f5e"
                />
              </g>
            )}

            {/* Lower Beak Jaw (Articulating dynamically) */}
            <path
              d={`M 122 ${146 + beakH * 0.68} Q 140 ${146 + beakH * 0.78} 158 ${
                146 + beakH * 0.68
              } Q 150 ${166 + beakH} 140 ${168 + beakH} Q 130 ${
                166 + beakH
              } 122 ${146 + beakH * 0.68} Z`}
              fill="url(#turpialBeakMaster3D)"
              stroke="#0f172a"
              strokeWidth="2"
            />
          </g>

          {/* 12. OFFICIAL BET GOLD MEDAL 3D NECKLACE (Exact Match from user reference) */}
          <g>
            {/* Royal Blue Neck Ribbon */}
            <path
              d="M 108 202 Q 140 228 172 202"
              stroke="url(#medalRibbonMaster3D)"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
            {/* Golden Ribbon Trim */}
            <path
              d="M 108 202 Q 140 228 172 202"
              stroke="#fef08a"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />

            {/* Medal Contact Drop Shadow */}
            <circle cx="140" cy="238" r="23" fill="#020617" opacity="0.45" />

            {/* Solid Golden Medal Disc */}
            <circle
              cx="140"
              cy="236"
              r="22"
              fill="url(#goldMedalMaster3D)"
              stroke="#854d0e"
              strokeWidth="2.5"
            />

            {/* Embossed Laurel Wreath Outer Ring */}
            <circle
              cx="140"
              cy="236"
              r="18"
              fill="none"
              stroke="#ca8a04"
              strokeWidth="2"
              strokeDasharray="3 2"
            />
            <circle
              cx="140"
              cy="236"
              r="16.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.6"
            />

            {/* Engraved Bold BET Monogram */}
            <text
              x="140"
              y="243"
              textAnchor="middle"
              fill="#713f12"
              fontSize="14"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.5px"
              style={{ filter: "drop-shadow(0 1px 1px rgba(255,255,255,0.7))" }}
            >
              BET
            </text>

            {/* Medal Specular Core Sheen */}
            <path
              d="M 125 220 Q 140 216 155 220 C 145 224 135 224 125 220 Z"
              fill="#ffffff"
              opacity="0.85"
            />
          </g>

          {/* 13. Adorable Bird Feet Resting on Ground */}
          <g>
            <path
              d="M 114 278 L 114 296 M 104 296 L 124 296 M 166 278 L 166 296 M 156 296 L 176 296"
              stroke="#475569"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 114 278 L 114 296 M 104 296 L 124 296 M 166 278 L 166 296 M 156 296 L 176 296"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>

          {/* 14. Dynamic Unlockable Accessories */}
          {renderAccessoryOverlay(config.accessory)}
        </svg>
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
