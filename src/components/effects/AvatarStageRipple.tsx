import React, { useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SeasonalThemeConfig } from "../../types";

export interface StageRippleItem {
  id: number;
  x: number;
  y: number;
  color?: string;
  borderColor?: string;
}

export interface StageExplosionParticle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  symbol?: string;
  rotation: number;
  targetRotation: number;
  scale: number;
  duration: number;
}

export interface AvatarStageRippleRef {
  triggerRipple: (x: number, y: number, color?: string, borderColor?: string) => void;
  triggerExplosion?: (x: number, y: number) => void;
}

interface AvatarStageRippleProps {
  seasonalThemeConfig?: SeasonalThemeConfig;
}

export const AvatarStageRipple = forwardRef<AvatarStageRippleRef, AvatarStageRippleProps>(
  ({ seasonalThemeConfig }, ref) => {
    const [ripples, setRipples] = useState<StageRippleItem[]>([]);
    const [particles, setParticles] = useState<StageExplosionParticle[]>([]);

    // Theme-based accent color definitions
    const themeId = seasonalThemeConfig?.id;
    const defaultRingColor =
      themeId === "winter_holiday"
        ? "border-sky-400/80 bg-sky-400/15 shadow-[0_0_24px_rgba(56,189,248,0.4)]"
        : themeId === "spring_bloom"
        ? "border-emerald-400/80 bg-emerald-400/15 shadow-[0_0_24px_rgba(52,211,153,0.4)]"
        : themeId === "summer_glow"
        ? "border-amber-400/80 bg-amber-400/15 shadow-[0_0_24px_rgba(251,191,36,0.4)]"
        : themeId === "autumn_harvest"
        ? "border-orange-400/80 bg-orange-400/15 shadow-[0_0_24px_rgba(249,115,22,0.4)]"
        : "border-sky-400/80 bg-sky-400/15 shadow-[0_0_24px_rgba(56,189,248,0.35)]";

    const secondaryRingColor =
      themeId === "winter_holiday"
        ? "border-cyan-300/60"
        : themeId === "spring_bloom"
        ? "border-pink-300/60"
        : themeId === "summer_glow"
        ? "border-yellow-300/60"
        : themeId === "autumn_harvest"
        ? "border-amber-300/60"
        : "border-emerald-300/60";

    const explosionPalette =
      themeId === "winter_holiday"
        ? ["#38bdf8", "#7dd3fc", "#e0f2fe", "#ffffff", "#bae6fd", "#fde047", "#a5f3fc"]
        : themeId === "spring_bloom"
        ? ["#34d399", "#6ee7b7", "#f472b6", "#fbcfe8", "#ffffff", "#a7f3d0", "#fef08a"]
        : themeId === "summer_glow"
        ? ["#fbbf24", "#f59e0b", "#fde047", "#67e8f9", "#ffffff", "#fed7aa", "#f43f5e"]
        : themeId === "autumn_harvest"
        ? ["#f97316", "#ea580c", "#fbbf24", "#d97706", "#ffffff", "#fed7aa", "#ef4444"]
        : ["#38bdf8", "#34d399", "#818cf8", "#f472b6", "#ffffff", "#fef08a"];

    const symbols =
      themeId === "winter_holiday"
        ? ["❄", "✦", "★", "•", "✨", "◆"]
        : themeId === "spring_bloom"
        ? ["🌸", "✦", "★", "•", "✨", "🍃"]
        : themeId === "summer_glow"
        ? ["☀️", "✦", "★", "•", "✨", "⚡"]
        : themeId === "autumn_harvest"
        ? ["🍂", "✦", "★", "•", "✨", "🍁"]
        : ["✦", "★", "•", "✨", "◆", "▲"];

    const triggerRipple = useCallback(
      (x: number, y: number, customColor?: string, customBorderColor?: string) => {
        const rippleId = Date.now() + Math.random();
        setRipples((prev) => [...prev.slice(-4), { id: rippleId, x, y, color: customColor, borderColor: customBorderColor }]);

        // Generate dynamic radial particle explosion burst
        const particleCount = 18;
        const newParticles: StageExplosionParticle[] = [];

        for (let i = 0; i < particleCount; i++) {
          const pId = Date.now() + Math.random() + i;
          const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
          const speed = Math.random() * 95 + 45; // 45px to 140px distance
          const targetX = x + Math.cos(angle) * speed;
          // slight gravity fall down effect
          const targetY = y + Math.sin(angle) * speed + (Math.random() * 25 + 10);
          const color = explosionPalette[Math.floor(Math.random() * explosionPalette.length)];
          const symbol = Math.random() < 0.45 ? symbols[Math.floor(Math.random() * symbols.length)] : undefined;
          const size = symbol ? Math.random() * 6 + 10 : Math.random() * 5 + 4;
          const rotation = Math.random() * 360;
          const targetRotation = rotation + (Math.random() - 0.5) * 360;
          const duration = Math.random() * 0.25 + 0.45; // 0.45s to 0.7s

          newParticles.push({
            id: pId,
            x,
            y,
            targetX,
            targetY,
            size,
            color,
            symbol,
            rotation,
            targetRotation,
            scale: Math.random() * 0.5 + 0.8,
            duration,
          });
        }

        setParticles((prev) => [...prev.slice(-36), ...newParticles]);
      },
      [explosionPalette, symbols]
    );

    useImperativeHandle(
      ref,
      () => ({
        triggerRipple,
        triggerExplosion: triggerRipple,
      }),
      [triggerRipple]
    );

    const handleRemoveRipple = useCallback((id: number) => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const handleRemoveParticle = useCallback((id: number) => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, []);

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20" aria-hidden="true">
        <AnimatePresence>
          {/* 1. Ripples */}
          {ripples.map((ripple) => (
            <React.Fragment key={ripple.id}>
              {/* Primary Circular Wave Ripple */}
              <motion.div
                initial={{
                  opacity: 0.85,
                  scale: 0.05,
                  width: 320,
                  height: 320,
                  x: ripple.x - 160,
                  y: ripple.y - 160,
                }}
                animate={{
                  opacity: 0,
                  scale: 1.35,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1], // Smooth exponential ease-out
                }}
                onAnimationComplete={() => handleRemoveRipple(ripple.id)}
                className={`absolute rounded-full border-2 ${defaultRingColor} pointer-events-none transform-gpu`}
                style={{
                  willChange: "transform, opacity",
                }}
              />

              {/* Secondary Harmonic Ripple (Slightly delayed, crisper outer line) */}
              <motion.div
                initial={{
                  opacity: 0.7,
                  scale: 0.02,
                  width: 220,
                  height: 220,
                  x: ripple.x - 110,
                  y: ripple.y - 110,
                }}
                animate={{
                  opacity: 0,
                  scale: 1.6,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.08,
                  ease: "easeOut",
                }}
                className={`absolute rounded-full border ${secondaryRingColor} pointer-events-none transform-gpu`}
                style={{
                  willChange: "transform, opacity",
                }}
              />

              {/* Center Impact Flash / Star Dot */}
              <motion.div
                initial={{
                  opacity: 0.95,
                  scale: 0.2,
                  width: 32,
                  height: 32,
                  x: ripple.x - 16,
                  y: ripple.y - 16,
                }}
                animate={{
                  opacity: 0,
                  scale: 2.4,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="absolute rounded-full bg-white/70 blur-[1px] pointer-events-none"
              />
            </React.Fragment>
          ))}

          {/* 2. Particle Explosion Burst */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 1,
                scale: 0.2,
                x: p.x,
                y: p.y,
                rotate: p.rotation,
              }}
              animate={{
                opacity: [1, 0.9, 0],
                scale: [0.2, p.scale * 1.2, 0.3],
                x: p.targetX,
                y: p.targetY,
                rotate: p.targetRotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                ease: [0.2, 0.8, 0.2, 1], // snappy explosive ease
                times: [0, 0.4, 1],
              }}
              onAnimationComplete={() => handleRemoveParticle(p.id)}
              className="absolute pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none"
              style={{
                willChange: "transform, opacity",
              }}
            >
              {p.symbol ? (
                <span
                  style={{
                    fontSize: `${p.size}px`,
                    color: p.color,
                    textShadow: `0 0 8px ${p.color}`,
                  }}
                  className="font-bold leading-none"
                >
                  {p.symbol}
                </span>
              ) : (
                <span
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    boxShadow: `0 0 10px ${p.color}`,
                  }}
                  className="rounded-full inline-block"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

AvatarStageRipple.displayName = "AvatarStageRipple";

