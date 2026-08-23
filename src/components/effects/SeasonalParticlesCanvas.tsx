import React, { useEffect, useRef } from "react";
import { SeasonalParticleType, SeasonalThemeConfig } from "../../types";
import { ParticleDensity } from "../../utils/seasonalTheme";

interface SeasonalParticlesCanvasProps {
  themeConfig: SeasonalThemeConfig;
  enabled?: boolean;
  density?: ParticleDensity;
}

interface SeasonalParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  rotation: number;
  vRotation: number;
  seed: number;
  depth: number; // 0.3 (far) to 1.0 (near)
  isSpecial?: boolean; // e.g. crystal snowflake or holiday star
}

export const SeasonalParticlesCanvas: React.FC<SeasonalParticlesCanvasProps> = ({
  themeConfig,
  enabled = true,
  density = "normal",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafIdRef = useRef<number>(0);
  const particlesRef = useRef<SeasonalParticle[]>([]);

  useEffect(() => {
    if (!enabled) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Calculate count based on density
    const multiplier = density === "subtle" ? 0.5 : density === "festive" ? 1.6 : 1.0;
    const count = Math.round(themeConfig.particles.count * multiplier);
    const particleType = themeConfig.particles.type;
    const colors = themeConfig.particles.colors;

    // Initialize particles across full screen
    const particles: SeasonalParticle[] = [];
    for (let i = 0; i < count; i++) {
      const depth = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
      const isSpecial = Math.random() < 0.22; // 22% are crystalline flakes/sparkles

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4 + themeConfig.particles.wind * depth,
        vy: (Math.random() * 0.6 + 0.4) * themeConfig.particles.speed * depth,
        size: (Math.random() * 3 + 2) * depth * (isSpecial ? 1.5 : 1),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.3,
        baseAlpha: Math.random() * 0.4 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.03,
        seed: Math.random() * 1000,
        depth,
        isSpecial,
      });
    }
    particlesRef.current = particles;

    // Draw Helpers
    const drawSnowflake = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      // 6-armed crystal
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        c.moveTo(0, 0);
        c.lineTo(cos * size, sin * size);

        // Branchlets
        const bx = cos * size * 0.6;
        const by = sin * size * 0.6;
        const branchSize = size * 0.35;
        const bAngle1 = angle + Math.PI / 4;
        const bAngle2 = angle - Math.PI / 4;
        c.moveTo(bx, by);
        c.lineTo(bx + Math.cos(bAngle1) * branchSize, by + Math.sin(bAngle1) * branchSize);
        c.moveTo(bx, by);
        c.lineTo(bx + Math.cos(bAngle2) * branchSize, by + Math.sin(bAngle2) * branchSize);
      }
      c.lineWidth = 1.2;
      c.strokeStyle = "rgba(255, 255, 255, 0.85)";
      c.stroke();
    };

    const drawSakuraPetal = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size);
      c.bezierCurveTo(size * 0.8, -size * 0.5, size * 0.8, size * 0.6, 0, size);
      c.bezierCurveTo(-size * 0.8, size * 0.6, -size * 0.8, -size * 0.5, 0, -size);
      c.fill();
    };

    const drawLeaf = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size);
      c.quadraticCurveTo(size * 0.9, 0, 0, size);
      c.quadraticCurveTo(-size * 0.9, 0, 0, -size);
      c.fill();
    };

    const drawStar = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        c.moveTo(0, 0);
        c.lineTo(Math.cos(angle) * size * 1.3, Math.sin(angle) * size * 1.3);
      }
      c.lineWidth = 1.4;
      c.stroke();
      c.beginPath();
      c.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      c.fill();
    };

    let lastTime = performance.now();
    let timeAcc = 0;

    const render = (now: number) => {
      if (document.hidden) {
        rafIdRef.current = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      timeAcc += dt;

      ctx.clearRect(0, 0, width, height);

      const items = particlesRef.current;
      for (let i = 0; i < items.length; i++) {
        const p = items[i];

        // Motion physics with gentle breeze sine oscillation
        const drift = Math.sin(timeAcc * 1.2 + p.seed) * 0.6 * p.depth;
        p.x += (p.vx + drift) * (dt * 60);

        if (particleType === "fireflies") {
          // Fireflies hover and float gently upward
          p.y -= (p.vy * 0.4 + Math.cos(timeAcc + p.seed) * 0.3) * (dt * 60);
          p.alpha = Math.max(0.1, p.baseAlpha + Math.sin(timeAcc * 2.5 + p.seed) * 0.35);
        } else {
          // Normal downward drift
          p.y += p.vy * (dt * 60);
          p.rotation += p.vRotation * (dt * 60);
        }

        // Screen Wrap
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        } else if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        if (p.x > width + 30) {
          p.x = -20;
        } else if (p.x < -30) {
          p.x = width + 20;
        }

        // Render Particle
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (particleType === "snow") {
          if (p.isSpecial && p.depth > 0.65) {
            drawSnowflake(ctx, p.size * 1.4);
          } else {
            // Soft fluffy snowflake circle with gentle radial gradient glow
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (particleType === "sakura") {
          // 3D tumble via scale
          const tumble = Math.sin(timeAcc * 2 + p.seed);
          ctx.scale(1, tumble);
          drawSakuraPetal(ctx, p.size * 1.5);
        } else if (particleType === "leaves") {
          const sway = Math.cos(timeAcc * 1.8 + p.seed);
          ctx.scale(1, sway);
          drawLeaf(ctx, p.size * 1.4);
        } else if (particleType === "fireflies") {
          // Warm glowing firefly dot
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fill();
        } else {
          // Sparkles
          if (p.isSpecial) {
            drawStar(ctx, p.size * 1.3);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      rafIdRef.current = requestAnimationFrame(render);
    };

    rafIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [themeConfig, enabled, density]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 will-change-transform"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden="true"
    />
  );
};
