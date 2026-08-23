import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Sparkles, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "../utils/soundFx";

interface StreakCounterBadgeProps {
  streakDays: number;
  gemsCount: number;
  onClick: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  emoji?: string;
  rotate: number;
  duration: number;
}

export const StreakCounterBadge: React.FC<StreakCounterBadgeProps> = ({
  streakDays,
  gemsCount,
  onClick,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isPopping, setIsPopping] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const prevStreakRef = useRef(streakDays);
  const badgeRef = useRef<HTMLButtonElement>(null);

  // Trigger celebration explosion with particles & confetti
  const triggerStreakCelebration = (isNewRecord: boolean = false) => {
    setIsPopping(true);
    soundFx.playSuccess();

    // Create 16 floating custom ember & spark particles
    const newParticles: Particle[] = Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const distance = 35 + Math.random() * 45;
      const colors = ["#f97316", "#fbbf24", "#ef4444", "#f59e0b", "#fde047", "#ffffff"];
      const emojis = ["🔥", "✨", "⭐", "⚡"];

      return {
        id: Date.now() + i + Math.random(),
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 20, // Drift upwards
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: Math.random() > 0.6 ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
        rotate: (Math.random() - 0.5) * 180,
        duration: 0.7 + Math.random() * 0.5,
      };
    });

    setParticles(newParticles);

    // Canvas confetti focused on streak origin
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: isNewRecord ? 45 : 25,
        spread: 60,
        origin: { x: originX, y: originY },
        colors: ["#f97316", "#fbbf24", "#ef4444", "#f59e0b"],
        ticks: 200,
        gravity: 1.2,
        scalar: 0.8,
      });
    }

    // Set banner message
    setBannerMessage(isNewRecord ? "¡Nuevo Récord! 🏆🔥" : "¡Racha al rojo vivo! 🔥");

    // Clean up particles and banner
    setTimeout(() => setParticles([]), 1300);
    setTimeout(() => setIsPopping(false), 800);
    setTimeout(() => setBannerMessage(null), 3000);
  };

  // Detect when streak increases or hits a new record
  useEffect(() => {
    try {
      const storedRecord = parseInt(localStorage.getItem("vt_max_streak_record") || "0", 10);
      const isNewRecord = streakDays > storedRecord && streakDays > 1;

      if (streakDays > storedRecord) {
        localStorage.setItem("vt_max_streak_record", String(streakDays));
      }

      if (prevStreakRef.current !== streakDays) {
        // Streak updated
        prevStreakRef.current = streakDays;
        triggerStreakCelebration(isNewRecord);
      }
    } catch {
      // Fallback
    }
  }, [streakDays]);

  const handleClick = () => {
    soundFx.playPop();
    triggerStreakCelebration(false);
    onClick();
  };

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      {/* Flying Particle Effects */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, scale: 0.2, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0.2, 1.2, 0.4],
              x: p.x,
              y: p.y,
              rotate: p.rotate,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, ease: "easeOut" }}
            className="absolute pointer-events-none z-50 select-none text-xs font-bold"
            style={{
              color: p.color,
            }}
          >
            {p.emoji ? (
              p.emoji
            ) : (
              <span
                className="block rounded-full shadow-[0_0_8px_currentColor]"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                }}
              />
            )}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Floating Milestone Celebration Toast Tooltip */}
      <AnimatePresence>
        {bannerMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -36, scale: 0.8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute z-50 pointer-events-none whitespace-nowrap px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-red-600 text-slate-950 font-black text-[10px] sm:text-xs shadow-lg border border-amber-300 flex items-center gap-1 -top-1"
          >
            <Sparkles className="w-3 h-3 text-white animate-spin" />
            <span className="text-white drop-shadow-sm">{bannerMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Streak Pill with Pop Spring Animation */}
      <motion.button
        ref={badgeRef}
        type="button"
        onClick={handleClick}
        animate={
          isPopping
            ? {
                scale: [1, 1.28, 0.92, 1.12, 1],
                rotate: [0, -6, 6, -3, 0],
                boxShadow: [
                  "0 0 0px rgba(249,115,22,0)",
                  "0 0 20px rgba(249,115,22,0.8)",
                  "0 0 30px rgba(234,179,8,0.9)",
                  "0 0 10px rgba(249,115,22,0.4)",
                  "0 0 0px rgba(249,115,22,0)",
                ],
              }
            : {
                scale: 1,
                rotate: 0,
              }
        }
        transition={{
          duration: 0.65,
          ease: [0.34, 1.56, 0.64, 1], // Playful elastic spring pop
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, y: 1 }}
        className="group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-slate-950 hover:bg-slate-900 border-2 border-b-4 border-amber-500/50 active:border-b-2 text-[11px] sm:text-xs font-black shadow-sm transition-colors shrink-0 select-none overflow-hidden"
        title={`Racha diaria: ${streakDays} días consecutivos | Gemas: ${gemsCount}`}
      >
        {/* Subtle Ember Glow Background on Pop */}
        {isPopping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{ duration: 0.65 }}
            className="absolute inset-0 bg-gradient-to-r from-orange-500/40 via-amber-400/40 to-red-500/40 pointer-events-none rounded-2xl"
          />
        )}

        {/* Animated Fire Icon */}
        <div className="flex items-center gap-1 text-orange-400 relative">
          <motion.div
            animate={
              isPopping
                ? {
                    scale: [1, 1.5, 0.9, 1.25, 1],
                    rotate: [0, -15, 15, -8, 0],
                  }
                : {
                    scale: [1, 1.1, 1],
                  }
            }
            transition={
              isPopping
                ? { duration: 0.6, ease: "easeOut" }
                : { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
            }
            className="flex items-center justify-center"
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-amber-300 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
          </motion.div>

          <motion.span
            key={streakDays}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-black tracking-tight"
          >
            {streakDays}
          </motion.span>
        </div>

        <span className="w-px h-3.5 bg-slate-800" />

        {/* Gems count */}
        <div className="flex items-center gap-1 text-amber-300">
          <span className="text-xs group-hover:scale-110 transition-transform">💎</span>
          <span>{gemsCount}</span>
        </div>
      </motion.button>
    </div>
  );
};
