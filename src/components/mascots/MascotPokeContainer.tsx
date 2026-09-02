import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { soundFx } from "../../utils/soundFx";
import { haptics } from "../../utils/haptics";

interface PokeParticle {
  id: number;
  x: number;
  y: number;
  text: string;
  emoji: string;
}

interface MascotPokeContainerProps {
  children: React.ReactNode;
  preset?: string;
  onPoke?: () => void;
  className?: string;
}

const POKE_MESSAGES = [
  { text: "¡Boing!", emoji: "🎵" },
  { text: "¡Poke!", emoji: "✨" },
  { text: "¡Squish!", emoji: "💫" },
  { text: "¡Hehe!", emoji: "💖" },
  { text: "¡Yay!", emoji: "⭐" },
  { text: "¡Hola!", emoji: "👋" },
  { text: "¡Tickle!", emoji: "😄" },
];

export const MascotPokeContainer: React.FC<MascotPokeContainerProps> = ({
  children,
  preset = "bet_turpial",
  onPoke,
  className = "",
}) => {
  const [pokeKey, setPokeKey] = useState(0);
  const [particles, setParticles] = useState<PokeParticle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePoke = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      // Prevent double triggers if bubbling
      e.stopPropagation();

      // Trigger audio & tactile haptic squish response
      soundFx.playCharacterStageSound(preset);
      haptics.light();

      // Trigger squash & stretch Framer Motion keyframe cycle
      setPokeKey((prev) => prev + 1);

      // Determine click / tap coordinate relative to container for floating particle
      let clientX = 0;
      let clientY = 0;

      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relX = clientX ? clientX - rect.left : rect.width / 2;
        const relY = clientY ? clientY - rect.top : rect.height / 2;

        const randomMsg =
          POKE_MESSAGES[Math.floor(Math.random() * POKE_MESSAGES.length)];
        const newParticle: PokeParticle = {
          id: Date.now() + Math.random(),
          x: relX,
          y: relY,
          text: randomMsg.text,
          emoji: randomMsg.emoji,
        };

        setParticles((prev) => [...prev.slice(-4), newParticle]);

        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
        }, 900);
      }

      // Propagate poke callback to parent (to trigger expressive reaction states)
      onPoke?.();
    },
    [preset, onPoke]
  );

  return (
    <div
      ref={containerRef}
      onClick={handlePoke}
      onTouchStart={handlePoke}
      className={`relative w-full h-full flex items-center justify-center cursor-pointer select-none overflow-visible group ${className}`}
      role="button"
      tabIndex={0}
      aria-label="Toca el avatar para interactuar"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlePoke(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
    >
      {/* Elastic Squish Shadow Ground Contact */}
      <motion.div
        key={`shadow-${pokeKey}`}
        className="absolute bottom-2 sm:bottom-4 w-40 sm:w-48 h-6 bg-slate-950/80 blur-md rounded-full pointer-events-none z-0"
        initial={{ scaleX: 1, scaleY: 1, opacity: 0.6 }}
        animate={
          pokeKey > 0
            ? {
                scaleX: [1, 1.45, 0.7, 1.2, 0.9, 1.05, 1],
                scaleY: [1, 1.3, 0.6, 1.15, 0.85, 1],
                opacity: [0.6, 0.9, 0.35, 0.75, 0.5, 0.6],
              }
            : { scaleX: 1, scaleY: 1, opacity: 0.6 }
        }
        transition={{
          duration: 0.65,
          ease: "easeOut",
          times: [0, 0.16, 0.36, 0.56, 0.75, 0.9, 1],
        }}
      />

      {/* Main Mascot Squish & Stretch Physics Wrapper */}
      <motion.div
        key={`mascot-squish-${pokeKey}`}
        className="w-full h-full flex items-center justify-center relative z-10 origin-bottom"
        whileTap={{
          scaleX: 1.25,
          scaleY: 0.72,
          y: 8,
          transition: { duration: 0.08 },
        }}
        initial={{ scaleX: 1, scaleY: 1, y: 0, rotate: 0 }}
        animate={
          pokeKey > 0
            ? {
                scaleX: [1, 1.32, 0.76, 1.18, 0.9, 1.06, 0.98, 1],
                scaleY: [1, 0.68, 1.28, 0.86, 1.12, 0.95, 1.02, 1],
                y: [0, 10, -18, 8, -4, 2, 0],
                rotate: [0, -5, 5, -3, 2, -1, 0],
              }
            : { scaleX: 1, scaleY: 1, y: 0, rotate: 0 }
        }
        transition={{
          duration: 0.7,
          ease: "easeOut",
          times: [0, 0.14, 0.32, 0.5, 0.68, 0.82, 0.92, 1],
        }}
      >
        {children}
      </motion.div>

      {/* Floating Poke Particle Reactions */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.5, y: 0, x: "-50%" }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1, 0.85],
              y: -50,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y - 20,
              zIndex: 50,
              pointerEvents: "none",
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-lg border border-amber-200 backdrop-blur-sm whitespace-nowrap"
          >
            <span>{p.emoji}</span>
            <span>{p.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
