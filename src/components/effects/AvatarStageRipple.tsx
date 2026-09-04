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

export interface StageGoldenHaloItem {
  id: number;
  x: number;
  y: number;
}

export interface AvatarStageRippleRef {
  triggerRipple: (x: number, y: number, color?: string, borderColor?: string) => void;
  triggerExplosion?: (x: number, y: number) => void;
  triggerGoldenHalo: (x: number, y: number) => void;
}

interface AvatarStageRippleProps {
  seasonalThemeConfig?: SeasonalThemeConfig;
}

export const AvatarStageRipple = forwardRef<AvatarStageRippleRef, AvatarStageRippleProps>(
  ({ seasonalThemeConfig }, ref) => {
    const [ripples, setRipples] = useState<StageRippleItem[]>([]);
    const [particles, setParticles] = useState<StageExplosionParticle[]>([]);
    const [goldenHalos, setGoldenHalos] = useState<StageGoldenHaloItem[]>([]);

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

    const triggerGoldenHalo = useCallback((x: number, y: number) => {
      const haloId = Date.now() + Math.random();
      setGoldenHalos((prev) => [...prev.slice(-4), { id: haloId, x, y }]);

      // Generate radiant golden star glints and starlight motes from the point of contact
      const goldenParticleCount = 14;
      const goldenPalette = [
        "#fef08a",
        "#fde047",
        "#fbbf24",
        "#f59e0b",
        "#d97706",
        "#ffffff",
      ];
      const goldenSymbols = ["✦", "✨", "★", "•", "◆"];
      const newGoldenParticles: StageExplosionParticle[] = [];

      for (let i = 0; i < goldenParticleCount; i++) {
        const pId = Date.now() + Math.random() + i;
        const angle = (Math.PI * 2 * i) / goldenParticleCount + (Math.random() - 0.5) * 0.45;
        const speed = Math.random() * 75 + 30; // 30px to 105px distance
        const targetX = x + Math.cos(angle) * speed;
        const targetY = y + Math.sin(angle) * speed - (Math.random() * 16 + 6); // gentle buoyant upward lift
        const color = goldenPalette[Math.floor(Math.random() * goldenPalette.length)];
        const symbol = Math.random() < 0.65 ? goldenSymbols[Math.floor(Math.random() * goldenSymbols.length)] : undefined;
        const size = symbol ? Math.random() * 6 + 10 : Math.random() * 4 + 4;
        const rotation = Math.random() * 360;
        const targetRotation = rotation + (Math.random() - 0.5) * 220;
        const duration = Math.random() * 0.25 + 0.55; // 0.55s to 0.8s

        newGoldenParticles.push({
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
          scale: Math.random() * 0.4 + 0.8,
          duration,
        });
      }

      setParticles((prev) => [...prev.slice(-36), ...newGoldenParticles]);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        triggerRipple,
        triggerExplosion: triggerRipple,
        triggerGoldenHalo,
      }),
      [triggerRipple, triggerGoldenHalo]
    );

    const handleRemoveRipple = useCallback((id: number) => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const handleRemoveHalo = useCallback((id: number) => {
      setGoldenHalos((prev) => prev.filter((h) => h.id !== id));
    }, []);

    const handleRemoveParticle = useCallback((id: number) => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, []);

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30" aria-hidden="true">
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

          {/* 3. Transient Golden Halo Glow Expanding and Fading from Point of Contact */}
          {goldenHalos.map((halo) => (
            <React.Fragment key={halo.id}>
              {/* Layer A: Wide Volumetric Golden Radiant Bloom */}
              <motion.div
                initial={{
                  opacity: 0.95,
                  scale: 0.1,
                  width: 340,
                  height: 340,
                  x: halo.x - 170,
                  y: halo.y - 170,
                }}
                animate={{
                  opacity: 0,
                  scale: 2.1,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1], // Smooth exponential expansion
                }}
                onAnimationComplete={() => handleRemoveHalo(halo.id)}
                className="absolute rounded-full pointer-events-none transform-gpu"
                style={{
                  background:
                    "radial-gradient(circle, rgba(254, 240, 138, 0.92) 0%, rgba(251, 191, 36, 0.7) 24%, rgba(245, 158, 11, 0.38) 50%, rgba(217, 119, 6, 0.1) 72%, transparent 100%)",
                  filter: "blur(10px)",
                  mixBlendMode: "screen",
                  willChange: "transform, opacity",
                }}
              />

              {/* Layer B: Primary Concentric Golden Halo Corona Ring */}
              <motion.div
                initial={{
                  opacity: 1,
                  scale: 0.12,
                  width: 260,
                  height: 260,
                  x: halo.x - 130,
                  y: halo.y - 130,
                  rotate: 0,
                }}
                animate={{
                  opacity: 0,
                  scale: 1.65,
                  rotate: 15,
                }}
                transition={{
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute rounded-full border-[2.5px] border-amber-300 pointer-events-none transform-gpu"
                style={{
                  boxShadow:
                    "0 0 28px rgba(251, 191, 36, 0.95), inset 0 0 16px rgba(254, 240, 138, 0.8), 0 0 8px rgba(255, 255, 255, 0.9)",
                  mixBlendMode: "screen",
                  willChange: "transform, opacity",
                }}
              />

              {/* Layer C: Harmonic Inner Halo Ring (Slightly delayed, delicate inner wave) */}
              <motion.div
                initial={{
                  opacity: 0.9,
                  scale: 0.08,
                  width: 190,
                  height: 190,
                  x: halo.x - 95,
                  y: halo.y - 95,
                  rotate: 0,
                }}
                animate={{
                  opacity: 0,
                  scale: 1.85,
                  rotate: -18,
                }}
                transition={{
                  duration: 0.68,
                  delay: 0.05,
                  ease: "easeOut",
                }}
                className="absolute rounded-full border-[1.5px] border-yellow-200/95 pointer-events-none transform-gpu"
                style={{
                  boxShadow:
                    "0 0 20px rgba(253, 224, 71, 0.85), inset 0 0 10px rgba(254, 240, 138, 0.6)",
                  mixBlendMode: "screen",
                  willChange: "transform, opacity",
                }}
              />

              {/* Layer D: Delicate Expansive Outer Glow Ring */}
              <motion.div
                initial={{
                  opacity: 0.65,
                  scale: 0.1,
                  width: 320,
                  height: 320,
                  x: halo.x - 160,
                  y: halo.y - 160,
                }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                }}
                transition={{
                  duration: 0.85,
                  delay: 0.08,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                className="absolute rounded-full border border-amber-400/40 pointer-events-none transform-gpu"
                style={{
                  boxShadow: "0 0 32px rgba(245, 158, 11, 0.45)",
                  mixBlendMode: "screen",
                  willChange: "transform, opacity",
                }}
              />

              {/* Layer E: Rotating Ethereal Golden Halo Starburst Rays */}
              <motion.div
                initial={{
                  opacity: 0.95,
                  scale: 0.2,
                  rotate: 0,
                  width: 140,
                  height: 140,
                  x: halo.x - 70,
                  y: halo.y - 70,
                }}
                animate={{
                  opacity: 0,
                  scale: 1.55,
                  rotate: 40,
                }}
                transition={{
                  duration: 0.65,
                  ease: "easeOut",
                }}
                className="absolute pointer-events-none transform-gpu"
                style={{
                  mixBlendMode: "screen",
                  willChange: "transform, opacity",
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                  <defs>
                    <radialGradient id={`haloGlow-${halo.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                      <stop offset="35%" stopColor="#fde047" stopOpacity="0.9" />
                      <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  {/* 8-point celestial corona rays */}
                  <g fill={`url(#haloGlow-${halo.id})`}>
                    <polygon points="50,4 53,44 96,50 53,56 50,96 47,56 4,50 47,44" />
                    <polygon
                      points="50,14 52,45 86,50 52,55 50,86 48,55 14,50 48,45"
                      transform="rotate(45 50 50)"
                      opacity="0.75"
                    />
                  </g>
                </svg>
              </motion.div>

              {/* Layer F: High-Intensity Golden-White Epicenter Touch Flare */}
              <motion.div
                initial={{
                  opacity: 1,
                  scale: 0.25,
                  width: 44,
                  height: 44,
                  x: halo.x - 22,
                  y: halo.y - 22,
                }}
                animate={{
                  opacity: 0,
                  scale: 2.5,
                }}
                transition={{
                  duration: 0.36,
                  ease: "easeOut",
                }}
                className="absolute rounded-full bg-gradient-to-r from-yellow-100 via-white to-amber-200 blur-[1px] pointer-events-none shadow-[0_0_24px_rgba(255,255,255,0.95),0_0_40px_rgba(251,191,36,0.9)]"
                style={{
                  mixBlendMode: "screen",
                }}
              />
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

AvatarStageRipple.displayName = "AvatarStageRipple";

