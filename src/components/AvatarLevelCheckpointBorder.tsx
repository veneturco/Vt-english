import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CEFRLevel } from "../types";
import { Award, Zap, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "../utils/soundFx";

interface AvatarLevelCheckpointBorderProps {
  currentLevel: CEFRLevel;
  xpPoints: number;
  lastLevelUp?: boolean;
}

// CEFR Level thresholds & progression targets
const LEVEL_PROGRESSION: Record<
  CEFRLevel,
  { next: CEFRLevel | null; requiredXP: number; label: string; color: string }
> = {
  A1: { next: "A2", requiredXP: 100, label: "Principiante", color: "#10b981" },
  A2: { next: "B1", requiredXP: 250, label: "Elemental", color: "#3b82f6" },
  B1: { next: "B2", requiredXP: 500, label: "Intermedio", color: "#8b5cf6" },
  B2: { next: "C1", requiredXP: 1000, label: "Intermedio Alto", color: "#f59e0b" },
  C1: { next: "C1", requiredXP: 2000, label: "Avanzado / Nativo", color: "#ec4899" },
};

export const AvatarLevelCheckpointBorder: React.FC<AvatarLevelCheckpointBorderProps> = ({
  currentLevel,
  xpPoints,
}) => {
  const currentConfig = LEVEL_PROGRESSION[currentLevel] || LEVEL_PROGRESSION.A1;
  const prevLevelRef = React.useRef(currentLevel);
  const [showLevelUpSplash, setShowLevelUpSplash] = React.useState(false);

  // Calculate percentage to next checkpoint (0 to 100%)
  const progressRatio = Math.min(1, Math.max(0.12, (xpPoints % currentConfig.requiredXP) / currentConfig.requiredXP));
  const progressPercent = Math.round(progressRatio * 100);

  // Detect Level Up Event
  React.useEffect(() => {
    if (prevLevelRef.current !== currentLevel) {
      prevLevelRef.current = currentLevel;
      setShowLevelUpSplash(true);
      soundFx.playQuestComplete();
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"],
      });

      const timer = setTimeout(() => setShowLevelUpSplash(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [currentLevel]);

  return (
    <>
      {/* 1. Surrounding Checkpoint Progress Border Track */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none z-10 overflow-hidden">
        {/* Background Track Border */}
        <div className="absolute inset-0 rounded-3xl border-2 border-slate-800/80" />

        {/* Top Edge Progress Beam */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-sky-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Level Checkpoint Badge at Top-Right */}
        <div className="absolute bottom-2.5 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/95 border-2 border-b-4 border-slate-800 text-xs font-black shadow-sm pointer-events-auto">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-white">Nivel {currentLevel}</span>
          <span className="text-slate-500 font-bold">|</span>
          <span className="text-emerald-400 font-extrabold">{progressPercent}% Checkpoint</span>
        </div>
      </div>

      {/* 2. Level Up Splash Animation Overlay */}
      <AnimatePresence>
        {showLevelUpSplash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-4 text-center select-none"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center text-slate-950 mb-3 shadow-lg border-2 border-b-4 border-amber-600 animate-bounce">
              <Award className="w-9 h-9 stroke-[2.5]" />
            </div>

            <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> ¡Checkpoint Alcanzado!
            </span>

            <h3 className="text-2xl font-black text-white tracking-tight mb-1">
              ¡Ascenso a Nivel {currentLevel}!
            </h3>

            <p className="text-xs font-bold text-slate-300 max-w-xs">
              Has desbloqueado vocabulario y gramática del nivel{" "}
              <strong className="text-emerald-400">{currentConfig.label}</strong>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
