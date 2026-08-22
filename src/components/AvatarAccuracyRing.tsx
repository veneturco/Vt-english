import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, Flame } from "lucide-react";

interface AvatarAccuracyRingProps {
  score: number | null; // 0 to 100 or null if not yet evaluated
  isEvaluating?: boolean;
}

export const AvatarAccuracyRing: React.FC<AvatarAccuracyRingProps> = ({
  score,
  isEvaluating = false,
}) => {
  if (score === null && !isEvaluating) return null;

  const currentScore = score !== null ? Math.max(0, Math.min(100, score)) : 0;

  // Color selection based on gamified tiers
  const getRingColor = (val: number) => {
    if (val >= 90) return { stroke: "#10b981", bg: "rgba(16, 185, 129, 0.15)", text: "text-emerald-400", border: "border-emerald-500", label: "¡Excelente!", icon: Trophy };
    if (val >= 75) return { stroke: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", text: "text-green-400", border: "border-green-500", label: "¡Muy bien!", icon: Sparkles };
    if (val >= 60) return { stroke: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", text: "text-amber-400", border: "border-amber-500", label: "¡Buen intento!", icon: Flame };
    return { stroke: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", text: "text-rose-400", border: "border-rose-500", label: "Sigue practicando", icon: Sparkles };
  };

  const tier = getRingColor(currentScore);
  const Icon = tier.icon;

  // SVG Circle calculations
  const size = 260; // diameter to wrap the avatar stage nicely
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      {/* SVG Animated Circular Progress Bar */}
      <svg
        width={size}
        height={size}
        className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] -rotate-90 transform drop-shadow-md"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          className="opacity-40"
        />

        {/* Animated Progress Stroke */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={tier.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: isEvaluating ? circumference * 0.5 : strokeDashoffset,
            stroke: tier.stroke,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>

      {/* Gamified Accuracy Pill Badge */}
      <AnimatePresence>
        {score !== null && !isEvaluating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`absolute bottom-3 right-4 sm:right-6 px-3 py-1.5 rounded-2xl bg-slate-950 border-2 border-b-4 ${tier.border} shadow-lg flex items-center gap-1.5 pointer-events-auto`}
          >
            <Icon className={`w-4 h-4 ${tier.text}`} />
            <div className="flex flex-col text-left">
              <span className={`text-xs font-black ${tier.text} leading-tight`}>
                {currentScore}% Precisión
              </span>
              <span className="text-[9px] font-bold text-slate-400 leading-none">
                {tier.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
