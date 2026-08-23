import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { soundFx } from "../utils/soundFx";
import { haptics } from "../utils/haptics";

export type TurpialEmotion =
  | "idle"
  | "talking"
  | "listening"
  | "thinking"
  | "celebrating"
  | "encouraging"
  | "winking";

export type TurpialHat = "none" | "grad_cap" | "headphones" | "detective" | "sunglasses" | "crown";

export interface TurpialVectorAvatarProps {
  emotion?: TurpialEmotion;
  isSpeaking?: boolean;
  isListening?: boolean;
  hat?: TurpialHat;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  showSpeechBubble?: boolean;
  interactivePoke?: boolean;
}

const MOTIVATIONAL_PHRASES = [
  "You've got this! Let's practice!",
  "Great rhythm! Keep going!",
  "Listening carefully...",
  "Awesome English pronunciation!",
  "Every mistake is a step forward!",
  "¡Vamos con todo!",
];

export const TurpialVectorAvatar: React.FC<TurpialVectorAvatarProps> = ({
  emotion = "idle",
  isSpeaking = false,
  isListening = false,
  hat = "none",
  size = "lg",
  className = "",
  onClick,
  showSpeechBubble = false,
  interactivePoke = true,
}) => {
  const [currentHat, setCurrentHat] = useState<TurpialHat>(hat);
  const [isBlinking, setIsBlinking] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(null);
  const [isWinkingInternal, setIsWinkingInternal] = useState(false);
  const [gazeOffset, setGazeOffset] = useState({ x: 0, y: 0 });

  // Sync external hat prop
  useEffect(() => {
    setCurrentHat(hat);
  }, [hat]);

  // Subtle organic eye tracking drift
  useEffect(() => {
    const driftInterval = setInterval(() => {
      if (isSpeaking) {
        setGazeOffset({ x: 0, y: 0 });
      } else {
        setGazeOffset({
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
        });
      }
    }, 2800);
    return () => clearInterval(driftInterval);
  }, [isSpeaking]);

  // Organic blinking loop (every 3.5 to 6 seconds)
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 170);
      const nextDelay = 3400 + Math.random() * 3200;
      blinkTimeout = setTimeout(triggerBlink, nextDelay);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Determine active dynamic emotion
  const activeEmotion: TurpialEmotion = useMemo(() => {
    if (isWinkingInternal) return "winking";
    if (isSpeaking) return "talking";
    if (isListening) return "listening";
    return emotion;
  }, [isSpeaking, isListening, emotion, isWinkingInternal]);

  // Size mapping
  const sizeClasses = {
    sm: "w-24 h-28",
    md: "w-36 h-40",
    lg: "w-48 h-56 sm:w-56 sm:h-64",
    xl: "w-64 h-72 sm:w-76 sm:h-84",
  }[size];

  // Interactive tap / poke handler
  const handlePoke = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactivePoke) return;

    soundFx.playPop();
    haptics.medium();

    setIsWinkingInternal(true);
    setTimeout(() => setIsWinkingInternal(false), 950);

    const randomPhrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
    setSpeechBubbleText(randomPhrase);
    setTimeout(() => setSpeechBubbleText(null), 3200);

    if (onClick) onClick();
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* 1. Interactive Speech Bubble */}
      <AnimatePresence>
        {(showSpeechBubble || speechBubbleText) && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.85 }}
            className="absolute -top-12 sm:-top-14 z-30 px-3.5 py-1.5 rounded-2xl bg-slate-900/95 border-2 border-amber-400/90 text-amber-300 shadow-[0_10px_25px_rgba(245,158,11,0.3)] text-xs font-black tracking-tight whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>{speechBubbleText || "¡Listo para practicar!"}</span>
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r-2 border-b-2 border-amber-400 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Audio Wave Resonance Rings (When Speaking or Listening) */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.28, 1], opacity: [0.35, 0.75, 0.35] }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-4 border-amber-400/50 pointer-events-none"
          />
        )}
        {isSpeaking && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.85, 0.4] }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.15, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-4 border-emerald-400/60 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 3. Main Turpial SVG Illustration (Pixar 3D Volumetric Layered) */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePoke}
        className={`${sizeClasses} relative cursor-pointer flex items-center justify-center filter drop-shadow-2xl`}
      >
        <svg
          viewBox="0 0 300 340"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 1. Pixar 3D Volumetric Amber Belly with Multi-stop Subsurface Scattering */}
            <radialGradient id="pixarBellyMaster3D" cx="40%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="14%" stopColor="#fef08a" />
              <stop offset="32%" stopColor="#fbbf24" />
              <stop offset="58%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#ea580c" />
              <stop offset="94%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </radialGradient>

            {/* 2. Pixar Velvet Obsidian Black Hood & Plumage */}
            <radialGradient id="pixarObsidianFeather3D" cx="36%" cy="26%" r="72%">
              <stop offset="0%" stopColor="#52525b" />
              <stop offset="22%" stopColor="#3f3f46" />
              <stop offset="52%" stopColor="#27272a" />
              <stop offset="78%" stopColor="#18181b" />
              <stop offset="92%" stopColor="#09090b" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* 3. Rim Light Cyan / Electric Edge Highlight for 3D Volume separation */}
            <linearGradient id="pixarRimGlowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#0ea5e9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </linearGradient>

            {/* 4. Wing Feather Gradient with Deep Specular Creases */}
            <linearGradient id="pixarWingGradient3D" x1="25%" y1="0%" x2="75%" y2="100%">
              <stop offset="0%" stopColor="#52525b" />
              <stop offset="25%" stopColor="#27272a" />
              <stop offset="65%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>

            {/* 5. Beak Keratin Satin Horn Material */}
            <linearGradient id="pixarBeakSatin3D" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="25%" stopColor="#64748b" />
              <stop offset="55%" stopColor="#334155" />
              <stop offset="85%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>

            {/* 6. Orbital Blue Skin Mask Gradient */}
            <radialGradient id="pixarEyeMask3D" cx="44%" cy="36%" r="64%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="28%" stopColor="#7dd3fc" />
              <stop offset="65%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>

            {/* 7. Deep Glass Pixar Amber Iris */}
            <radialGradient id="pixarGlassIris3D" cx="36%" cy="32%" r="64%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="20%" stopColor="#f59e0b" />
              <stop offset="48%" stopColor="#b45309" />
              <stop offset="78%" stopColor="#451a03" />
              <stop offset="96%" stopColor="#1c0a01" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            {/* 8. 3D Polished Gold Medal */}
            <linearGradient id="pixarGoldMedal3D" x1="12%" y1="12%" x2="88%" y2="88%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="18%" stopColor="#fef08a" />
              <stop offset="46%" stopColor="#eab308" />
              <stop offset="76%" stopColor="#ca8a04" />
              <stop offset="92%" stopColor="#a16207" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>

            {/* 9. Blue Silk Medal Ribbon */}
            <linearGradient id="pixarMedalRibbon3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="25%" stopColor="#2563eb" />
              <stop offset="70%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>

            {/* Perch Natural Wood Gradient */}
            <linearGradient id="pixarWoodPerch3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a16207" />
              <stop offset="35%" stopColor="#78350f" />
              <stop offset="85%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#290f02" />
            </linearGradient>
          </defs>

          {/* LAYER 0: Volumetric Stage Perch & Shadow */}
          <ellipse cx="150" cy="305" rx="76" ry="14" fill="#000000" opacity="0.65" />
          <path
            d="M 60 295 Q 150 288 240 295 Q 235 312 150 308 Q 65 312 60 295 Z"
            fill="url(#pixarWoodPerch3D)"
            stroke="#451a03"
            strokeWidth="1.5"
          />
          {/* Wood Branch Highlight Specular */}
          <path
            d="M 75 294 Q 150 289 225 294"
            stroke="#d97706"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* LAYER 1: Tail Feathers (Obsidian Velvet + White Highlights) */}
          <motion.g
            animate={{
              rotate: activeEmotion === "celebrating" ? [-5, 7, -5] : [-1.5, 2, -1.5],
            }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            style={{ originX: "150px", originY: "230px" }}
          >
            {/* Long black tail feathers */}
            <path
              d="M 130 220 Q 112 285 124 322 Q 150 314 154 225 Z"
              fill="url(#pixarObsidianFeather3D)"
              stroke="#09090b"
              strokeWidth="1.5"
            />
            <path
              d="M 146 225 Q 152 298 168 326 Q 182 308 168 225 Z"
              fill="url(#pixarObsidianFeather3D)"
              stroke="#09090b"
              strokeWidth="1.5"
            />
            {/* Crisp white tail flash */}
            <path
              d="M 142 230 Q 150 275 155 298 Q 158 275 150 230 Z"
              fill="#FFFFFF"
              opacity="0.95"
            />
          </motion.g>

          {/* LAYER 2: Main Body & Chest (Pixar 3D Volumetric Amber) */}
          <motion.g
            animate={{
              y: activeEmotion === "talking" ? [0, -3.5, 0] : [0, -2, 0],
              scaleY: activeEmotion === "listening" ? [1, 1.025, 1] : [1, 1.015, 1],
            }}
            transition={{ repeat: Infinity, duration: 2.1, ease: "easeInOut" }}
          >
            {/* Volumetric Body Base */}
            <path
              d="M 100 135 C 85 205, 105 268, 150 274 C 195 268, 215 205, 200 135 C 192 102, 108 102, 100 135 Z"
              fill="url(#pixarBellyMaster3D)"
              stroke="#9a3412"
              strokeWidth="2.5"
            />

            {/* Feather Layer Shading Curves (Ambient Occlusion) */}
            <path
              d="M 118 165 Q 150 185 182 165"
              stroke="#c2410c"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M 124 195 Q 150 215 176 195"
              stroke="#c2410c"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.45"
            />

            {/* Specular Light Reflection on Top Chest */}
            <ellipse cx="140" cy="148" rx="28" ry="14" fill="#ffffff" opacity="0.3" filter="blur(3px)" />
          </motion.g>

          {/* LAYER 3: Wings (Obsidian Velvet + White Wingbar + Rim Light) */}
          {/* Left Wing */}
          <motion.g
            animate={{
              rotate: activeEmotion === "celebrating" ? [-22, 0, -22] : activeEmotion === "listening" ? [-5, 5, -5] : [0, 2, 0],
            }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
            style={{ originX: "98px", originY: "140px" }}
          >
            <path
              d="M 102 130 C 62 155, 54 235, 96 265 C 108 245, 118 190, 116 142 Z"
              fill="url(#pixarWingGradient3D)"
              stroke="#09090b"
              strokeWidth="2"
            />
            {/* White Wingbar Stripe with sharp Pixar bevel */}
            <path
              d="M 72 172 C 80 192, 94 212, 108 218 C 104 198, 90 178, 72 172 Z"
              fill="#FFFFFF"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            {/* Left Rim Light Cyan */}
            <path
              d="M 64 165 C 58 200, 75 240, 94 262"
              stroke="url(#pixarRimGlowCyan)"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Right Wing */}
          <motion.g
            animate={{
              rotate: activeEmotion === "celebrating" ? [22, 0, 22] : activeEmotion === "listening" ? [5, -5, 5] : [0, -2, 0],
            }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
            style={{ originX: "202px", originY: "140px" }}
          >
            <path
              d="M 198 130 C 238 155, 246 235, 204 265 C 192 245, 182 190, 184 142 Z"
              fill="url(#pixarWingGradient3D)"
              stroke="#09090b"
              strokeWidth="2"
            />
            {/* White Wingbar Stripe */}
            <path
              d="M 228 172 C 220 192, 206 212, 192 218 C 196 198, 210 178, 228 172 Z"
              fill="#FFFFFF"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            {/* Right Rim Light Cyan */}
            <path
              d="M 236 165 C 242 200, 225 240, 206 262"
              stroke="url(#pixarRimGlowCyan)"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          </motion.g>

          {/* LAYER 4: Head & Obsidian Black Hood */}
          <motion.g
            animate={{
              rotate: activeEmotion === "listening" ? [-7, 7, -7] : activeEmotion === "thinking" ? [5, -3, 5] : [0, 0, 0],
              y: activeEmotion === "talking" ? [0, -2.5, 0] : [0, 0, 0],
            }}
            transition={{ repeat: Infinity, duration: activeEmotion === "listening" ? 1.5 : 3, ease: "easeInOut" }}
            style={{ originX: "150px", originY: "100px" }}
          >
            {/* Jet black head & throat bib */}
            <path
              d="M 108 92 C 108 42, 192 42, 192 92 C 192 128, 170 152, 150 160 C 130 152, 108 128, 108 92 Z"
              fill="url(#pixarObsidianFeather3D)"
              stroke="#020617"
              strokeWidth="2.5"
            />

            {/* Rim light glow on head edge */}
            <path
              d="M 112 80 C 112 48, 188 48, 188 80"
              stroke="url(#pixarRimGlowCyan)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Crest tuft feathers with micro-bounce */}
            <path d="M 144 48 C 148 32, 156 35, 153 48 Z" fill="url(#pixarObsidianFeather3D)" stroke="#09090b" strokeWidth="1" />
            <path d="M 136 52 C 139 37, 147 40, 144 52 Z" fill="url(#pixarObsidianFeather3D)" stroke="#09090b" strokeWidth="1" />
            <path d="M 152 50 C 157 34, 164 38, 160 50 Z" fill="url(#pixarObsidianFeather3D)" stroke="#09090b" strokeWidth="1" />

            {/* Characteristic Turquoise / Blue Eye Patches */}
            <ellipse cx="128" cy="85" rx="15" ry="13" fill="url(#pixarEyeMask3D)" stroke="#0284c7" strokeWidth="1.5" />
            <ellipse cx="172" cy="85" rx="15" ry="13" fill="url(#pixarEyeMask3D)" stroke="#0284c7" strokeWidth="1.5" />

            {/* EYES (Pixar Glass Irises with Specular Sparkle & Gaze Drift) */}
            {!isBlinking && activeEmotion !== "winking" ? (
              <>
                {/* Left Eye */}
                <ellipse cx="128" cy="85" rx="8" ry="8" fill="url(#pixarGlassIris3D)" stroke="#09090b" strokeWidth="1" />
                <ellipse cx={128 + gazeOffset.x} cy={85 + gazeOffset.y} rx="4.5" ry="4.5" fill="#000000" />
                {/* Primary Specular Glint (Studio Window Catchlight) */}
                <circle cx={126 + gazeOffset.x * 0.4} cy={82 + gazeOffset.y * 0.4} r="2.8" fill="#FFFFFF" />
                {/* Secondary Bottom Reflection */}
                <circle cx={130 + gazeOffset.x * 0.4} cy={87 + gazeOffset.y * 0.4} r="1.2" fill="#FFFFFF" opacity="0.8" />

                {/* Right Eye */}
                <ellipse cx="172" cy="85" rx="8" ry="8" fill="url(#pixarGlassIris3D)" stroke="#09090b" strokeWidth="1" />
                <ellipse cx={172 + gazeOffset.x} cy={85 + gazeOffset.y} rx="4.5" ry="4.5" fill="#000000" />
                {/* Primary Specular Glint */}
                <circle cx={170 + gazeOffset.x * 0.4} cy={82 + gazeOffset.y * 0.4} r="2.8" fill="#FFFFFF" />
                {/* Secondary Bottom Reflection */}
                <circle cx={174 + gazeOffset.x * 0.4} cy={87 + gazeOffset.y * 0.4} r="1.2" fill="#FFFFFF" opacity="0.8" />
              </>
            ) : activeEmotion === "winking" ? (
              <>
                {/* Left Eye Open */}
                <ellipse cx="128" cy="85" rx="8" ry="8" fill="url(#pixarGlassIris3D)" stroke="#09090b" strokeWidth="1" />
                <ellipse cx="128" cy="85" rx="4.5" ry="4.5" fill="#000000" />
                <circle cx="126" cy="82" r="2.8" fill="#FFFFFF" />
                <circle cx="130" cy="87" r="1.2" fill="#FFFFFF" opacity="0.8" />
                {/* Right Eye Playful Wink */}
                <path d="M 163 86 Q 172 93 181 86" stroke="#09090b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Closed Eyes (Blink) */}
                <path d="M 119 85 Q 128 92 137 85" stroke="#09090b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M 163 85 Q 172 92 181 85" stroke="#09090b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </>
            )}

            {/* BEAK (Articulated Keratin Horn Material with Specular Sheen) */}
            <motion.g
              animate={{
                scaleY: activeEmotion === "talking" ? [1, 1.45, 1, 1.35, 1] : [1, 1, 1],
                y: activeEmotion === "talking" ? [0, 1.5, 0] : [0, 0, 0],
              }}
              transition={{ repeat: Infinity, duration: 0.32, ease: "easeInOut" }}
              style={{ originX: "150px", originY: "92px" }}
            >
              {/* Upper Beak */}
              <path
                d="M 138 92 Q 150 81 162 92 Q 150 114 138 92 Z"
                fill="url(#pixarBeakSatin3D)"
                stroke="#09090b"
                strokeWidth="1.8"
              />
              {/* Beak Top Highlight Specular */}
              <path
                d="M 142 90 Q 150 83 158 90"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Lower Beak Silver Base */}
              <path
                d="M 141 94 Q 150 102 159 94 Q 150 110 141 94 Z"
                fill="#cbd5e1"
                stroke="#94a3b8"
                strokeWidth="1"
              />
            </motion.g>

            {/* ACCESSORIES (Hats / Gear) */}
            {currentHat === "grad_cap" && (
              <g transform="translate(108, 16)">
                <polygon points="42,5 84,24 42,42 0,24" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />
                <rect x="26" y="32" width="32" height="14" rx="4" fill="#020617" stroke="#1e293b" strokeWidth="1.5" />
                {/* Golden Tassel */}
                <line x1="42" y1="24" x2="72" y2="40" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="72" cy="40" r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              </g>
            )}

            {currentHat === "headphones" && (
              <g transform="translate(98, 44)">
                <path d="M 18 38 A 44 44 0 0 1 92 38" fill="none" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
                <rect x="10" y="26" width="16" height="28" rx="8" fill="#0f172a" stroke="#f43f5e" strokeWidth="2.5" />
                <rect x="84" y="26" width="16" height="28" rx="8" fill="#0f172a" stroke="#f43f5e" strokeWidth="2.5" />
                {/* DJ metallic ear cup accent */}
                <circle cx="18" cy="40" r="4" fill="#f43f5e" />
                <circle cx="92" cy="40" r="4" fill="#f43f5e" />
              </g>
            )}

            {currentHat === "sunglasses" && (
              <g transform="translate(114, 76)">
                <rect x="0" y="0" width="32" height="18" rx="5" fill="#09090b" stroke="#f59e0b" strokeWidth="2.5" />
                <rect x="40" y="0" width="32" height="18" rx="5" fill="#09090b" stroke="#f59e0b" strokeWidth="2.5" />
                <line x1="32" y1="8" x2="40" y2="8" stroke="#f59e0b" strokeWidth="3.5" />
                {/* Mirror Glare Highlights */}
                <line x1="5" y1="4" x2="19" y2="14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
                <line x1="45" y1="4" x2="59" y2="14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
              </g>
            )}

            {currentHat === "crown" && (
              <g transform="translate(122, 20)">
                <polygon points="0,24 12,6 28,20 44,6 56,24" fill="#fbbf24" stroke="#d97706" strokeWidth="2.5" />
                <circle cx="12" cy="6" r="3.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                <circle cx="28" cy="20" r="3.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
                <circle cx="44" cy="6" r="3.5" fill="#10b981" stroke="#047857" strokeWidth="1" />
              </g>
            )}
          </motion.g>

          {/* LAYER 5: Feet on Perch Branch */}
          <g>
            {/* Left Foot */}
            <path d="M 120 268 Q 115 284 112 292" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 124 268 Q 124 286 122 295" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 129 268 Q 134 284 135 292" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />

            {/* Right Foot */}
            <path d="M 171 268 Q 166 284 165 292" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 176 268 Q 176 286 178 295" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 180 268 Q 186 284 189 292" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
          </g>

          {/* LAYER 6: BET 3D Polished Gold Medallion */}
          <g transform="translate(150, 188)">
            {/* Ribbon */}
            <path d="M -18 0 L -7 26 L 0 12 L 7 26 L 18 0 Z" fill="url(#pixarMedalRibbon3D)" />
            {/* Golden Medallion */}
            <circle cx="0" cy="30" r="18" fill="url(#pixarGoldMedal3D)" stroke="#a16207" strokeWidth="2.5" />
            <circle cx="0" cy="30" r="14" fill="#fbbf24" opacity="0.75" />
            <text
              x="0"
              y="35"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="900"
              fill="#78350f"
              fontFamily="system-ui, sans-serif"
            >
              BET
            </text>
          </g>
        </svg>
      </motion.div>

      {/* 4. Quick Wardrobe Mini Selector */}
      <div className="flex items-center gap-1.5 mt-2 bg-slate-950/85 px-3 py-1.5 rounded-2xl border-2 border-slate-800 backdrop-blur-md shadow-lg">
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playPop();
            setCurrentHat("none");
          }}
          className={`px-2 py-0.5 rounded-xl text-xs font-black transition ${
            currentHat === "none" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
          title="Sin accesorio"
        >
          ✨
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playPop();
            setCurrentHat("grad_cap");
          }}
          className={`px-2 py-0.5 rounded-xl text-xs font-black transition ${
            currentHat === "grad_cap" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
          title="Birrete de Graduación"
        >
          🎓
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playPop();
            setCurrentHat("sunglasses");
          }}
          className={`px-2 py-0.5 rounded-xl text-xs font-black transition ${
            currentHat === "sunglasses" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
          title="Gafas Cool de Racha"
        >
          🕶️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playPop();
            setCurrentHat("headphones");
          }}
          className={`px-2 py-0.5 rounded-xl text-xs font-black transition ${
            currentHat === "headphones" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
          title="Auriculares de Audio"
        >
          🎧
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playPop();
            setCurrentHat("crown");
          }}
          className={`px-2 py-0.5 rounded-xl text-xs font-black transition ${
            currentHat === "crown" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
          title="Corona de Liga"
        >
          👑
        </button>
      </div>
    </div>
  );
};
