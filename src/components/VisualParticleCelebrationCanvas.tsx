import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export interface ParticleBurstOptions {
  x: number;
  y: number;
  combo?: number;
  textBadge?: string;
  theme?: "gold" | "emerald" | "rainbow" | "fire";
}

export interface VisualParticleCelebrationRef {
  spawnBurst: (options: ParticleBurstOptions) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  type: "star" | "sparkle" | "circle" | "diamond" | "ring";
  scale: number;
}

interface FloatingBadge {
  x: number;
  y: number;
  text: string;
  alpha: number;
  vy: number;
  scale: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

export const VisualParticleCelebrationCanvas = forwardRef<VisualParticleCelebrationRef, { className?: string }>(
  ({ className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const badgesRef = useRef<FloatingBadge[]>([]);
    const shockwavesRef = useRef<Shockwave[]>([]);
    const animFrameRef = useRef<number | null>(null);

    const THEME_PALETTES = {
      gold: ["#fbbf24", "#f59e0b", "#fef08a", "#ffffff", "#fde047"],
      emerald: ["#34d399", "#10b981", "#6ee7b7", "#a7f3d0", "#ffffff"],
      rainbow: ["#38bdf8", "#4ade80", "#fbbf24", "#f43f5e", "#c084fc", "#fb923c"],
      fire: ["#f97316", "#ef4444", "#fbbf24", "#ea580c", "#fde047"],
    };

    // Draw 5-pointed star on canvas
    const drawStar = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      color: string,
      alpha: number,
      rotation: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = color;
      ctx.beginPath();
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      ctx.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        let x = Math.cos(rot) * outerRadius;
        let y = Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw sparkle / 4-point star
    const drawSparkle = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      radius: number,
      color: string,
      alpha: number,
      rotation: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.quadraticCurveTo(0, 0, 0, radius);
      ctx.quadraticCurveTo(0, 0, -radius, 0);
      ctx.quadraticCurveTo(0, 0, 0, -radius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Spawn Burst
    const spawnBurst = ({
      x,
      y,
      combo = 1,
      textBadge,
      theme = "rainbow",
    }: ParticleBurstOptions) => {
      const palette = THEME_PALETTES[theme] || THEME_PALETTES.rainbow;
      const count = Math.min(65, 30 + combo * 5);

      // 1. Shockwave Ripple from Origin
      shockwavesRef.current.push({
        x,
        y,
        radius: 8,
        maxRadius: 85 + Math.min(50, combo * 10),
        alpha: 0.9,
        color: palette[0],
        lineWidth: 3.5,
      });

      // 2. Spawn particles
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * (6.5 + Math.min(4, combo * 0.8));
        const typeRoll = Math.random();
        const type: Particle["type"] =
          typeRoll > 0.65 ? "star" : typeRoll > 0.35 ? "sparkle" : typeRoll > 0.15 ? "circle" : "diamond";

        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (1.5 + Math.random() * 2), // upward bias
          size: 4 + Math.random() * 9,
          color: palette[Math.floor(Math.random() * palette.length)],
          alpha: 1,
          decay: 0.014 + Math.random() * 0.02,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.15,
          type,
          scale: 1,
        });
      }

      // 3. Floating Text Badge (e.g. "+25 XP 🔥 x3")
      if (textBadge) {
        badgesRef.current.push({
          x,
          y: y - 20,
          text: textBadge,
          alpha: 1,
          vy: -2.2,
          scale: 1,
          color: palette[0] || "#fbbf24",
        });
      }
    };

    useImperativeHandle(ref, () => ({
      spawnBurst,
    }));

    // Animation Loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Handle Resize with Device Pixel Ratio for crisp rendering
      const handleResize = () => {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      const render = () => {
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);

        // --- 1. RENDER SHOCKWAVES ---
        for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
          const sw = shockwavesRef.current[i];
          sw.radius += (sw.maxRadius - sw.radius) * 0.14 + 1.2;
          sw.alpha *= 0.91;

          if (sw.alpha <= 0.02 || sw.radius >= sw.maxRadius) {
            shockwavesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = sw.color;
          ctx.globalAlpha = Math.max(0, sw.alpha);
          ctx.lineWidth = sw.lineWidth * (sw.radius / sw.maxRadius + 0.3);
          ctx.stroke();
          ctx.restore();
        }

        // --- 2. RENDER PARTICLES ---
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.14; // gentle gravity
          p.vx *= 0.97; // air drag
          p.rotation += p.vRot;
          p.alpha -= p.decay;

          if (p.alpha <= 0 || p.y > rect.height + 40) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          if (p.type === "star") {
            drawStar(ctx, p.x, p.y, 5, p.size, p.size * 0.48, p.color, p.alpha, p.rotation);
          } else if (p.type === "sparkle") {
            drawSparkle(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
          } else if (p.type === "diamond") {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
          } else {
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
          }
        }

        // --- 3. RENDER FLOATING TEXT BADGES ---
        for (let i = badgesRef.current.length - 1; i >= 0; i--) {
          const b = badgesRef.current[i];
          b.y += b.vy;
          b.vy *= 0.96;
          b.alpha -= 0.016;
          b.scale = Math.min(1.2, b.scale + 0.02);

          if (b.alpha <= 0) {
            badgesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.scale(b.scale, b.scale);
          ctx.globalAlpha = Math.max(0, b.alpha);

          // Background pill
          ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
          const textMetrics = ctx.measureText(b.text);
          const pillWidth = textMetrics.width + 18;
          const pillHeight = 24;

          ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, 12);
          ctx.fill();
          ctx.stroke();

          // Text content
          ctx.fillStyle = b.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(b.text, 0, 1);
          ctx.restore();
        }

        animFrameRef.current = requestAnimationFrame(render);
      };

      animFrameRef.current = requestAnimationFrame(render);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none z-40 w-full h-full ${className}`}
      />
    );
  }
);
VisualParticleCelebrationCanvas.displayName = "VisualParticleCelebrationCanvas";
