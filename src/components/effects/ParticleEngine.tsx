import React, { useEffect, useRef } from "react";
import { SpawnParticlesDetail, ParticleType } from "../../utils/particleHelper";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRotation: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  friction: number;
  type: ParticleType;
  points?: number; // Para estrellas
}

const BRIGHT_PALETTE = [
  "#f43f5e", // Rosa vibrante
  "#38bdf8", // Celeste cielo
  "#facc15", // Amarillo oro
  "#4ade80", // Verde raptor
  "#a855f7", // Púrpura mágico
  "#fb923c", // Naranja brillante
  "#ec4899", // Fucsia
  "#ffffff", // Blanco destello
];

/**
 * Motor de Partículas 2D Nativo en HTML5 Canvas (60 FPS sin re-renders).
 * Maneja físicas de proyectil, gravedad, resistencia al aire, rotación y limpieza en memoria.
 */
export const ParticleEngine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isRunningRef = useRef<boolean>(false);
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Sincronizar tamaño del canvas con el viewport y la densidad de píxeles (HiDPI / Retina)
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Dibujado optimizado de estrellas de N puntas
    const drawStar = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number
    ) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(cx, cy - outerRadius);
      context.closePath();
      context.fill();
    };

    // Bucle de renderizado físico (Animation Loop)
    const render = () => {
      const particles = particlesRef.current;

      if (particles.length === 0) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        isRunningRef.current = false;
        return;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Iteración inversa para eliminación en O(1) con splice seguro
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Físicas: Gravedad, Fricción y Velocidad
        p.vx *= p.friction;
        p.vy = p.vy * p.friction + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRotation;
        p.alpha -= p.decay;

        // Limpieza de partículas muertas (fuera de pantalla o transparentes)
        if (p.alpha <= 0 || p.y > window.innerHeight + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === "stars") {
          drawStar(ctx, 0, 0, p.points || 5, p.size, p.size * 0.48);
        } else if (p.type === "sparks") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "bubbles") {
          // Translucent water bubble with specular reflex highlight
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "rgba(224, 242, 254, 0.85)";
          ctx.stroke();

          // White specular reflection dot
          ctx.beginPath();
          ctx.arc(-p.size * 0.35, -p.size * 0.35, p.size * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fill();
        } else if (p.type === "coins") {
          // Golden Mario-style spinning coin
          const flipScale = Math.cos(p.rotation * 2);
          ctx.scale(flipScale, 1);
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = "#fbbf24";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#f59e0b";
          ctx.stroke();

          // Inner rim
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Confeti rectangular clásico con perspectiva de rotación
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.6);
        }

        ctx.restore();
      }

      rafIdRef.current = requestAnimationFrame(render);
    };

    // Escuchador de spawneo de partículas global
    const handleSpawnParticles = (e: Event) => {
      const customEvent = e as CustomEvent<SpawnParticlesDetail>;
      const { x, y, type = "confetti", count = 45 } = customEvent.detail || {};

      const spawnCount = Math.min(count, 120);

      for (let i = 0; i < spawnCount; i++) {
        // Ángulo de explosión radial en 360 grados
        const angle = Math.random() * Math.PI * 2;
        // Velocidad explosiva inicial con dispersión aleatoria
        const speed = Math.random() * 14 + 4;
        const color =
          type === "coins"
            ? "#fbbf24"
            : BRIGHT_PALETTE[Math.floor(Math.random() * BRIGHT_PALETTE.length)];

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * (type === "coins" ? speed * 0.7 : speed),
          vy:
            Math.sin(angle) * speed -
            (type === "confetti" ? 4 : type === "coins" ? 6 : type === "bubbles" ? 2 : 2), // Impulso ascendente
          rotation: Math.random() * Math.PI * 2,
          vRotation: type === "coins" ? 0.15 : (Math.random() - 0.5) * 0.25,
          size:
            type === "stars"
              ? Math.random() * 8 + 6
              : type === "coins"
              ? Math.random() * 6 + 9
              : type === "bubbles"
              ? Math.random() * 8 + 6
              : Math.random() * 9 + 5,
          color,
          alpha: 1.0,
          decay:
            type === "bubbles"
              ? Math.random() * 0.02 + 0.015
              : Math.random() * 0.018 + 0.012,
          gravity:
            type === "stars"
              ? 0.22
              : type === "bubbles"
              ? -0.06 // Las burbujas ascienden suavemente
              : type === "coins"
              ? 0.42
              : 0.38,
          friction: type === "bubbles" ? 0.94 : 0.965,
          type,
          points: 5,
        });
      }

      // Inicia el bucle si no está activo
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        rafIdRef.current = requestAnimationFrame(render);
      }
    };

    window.addEventListener("spawn-particles", handleSpawnParticles);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("spawn-particles", handleSpawnParticles);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 will-change-transform"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
};
