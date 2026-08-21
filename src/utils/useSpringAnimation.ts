import { useRef, useEffect, useCallback } from "react";

export interface SpringConfig {
  tension?: number;   // Constante k de rigidez del resorte (Hooke's Law: F = -k * x)
  friction?: number;  // Coeficiente de amortiguamiento viscoso (Damping: F_d = -c * v)
  mass?: number;      // Masa del objeto animado (Inercia: F = m * a)
}

/**
 * Custom Hook de Físicas de Resorte (Squash & Stretch) 60 FPS
 * Simula la Ley de Hooke con amortiguamiento mediante requestAnimationFrame.
 * Manipula directamente el DOM (style.transform) forzando aceleración por hardware (GPU).
 */
export function useSpringAnimation<T extends HTMLElement | SVGSVGElement>(
  config: SpringConfig = {}
) {
  const {
    tension = 180,  // Rigidez del resorte
    friction = 12,  // Amortiguamiento que frena la oscilación
    mass = 1,       // Masa física
  } = config;

  const elementRef = useRef<T | null>(null);

  // Estados dinámicos de la simulación física (Posición y Velocidad de X e Y)
  const physicsRef = useRef({
    // Escala objetivo en reposo (1.0 = 100% tamaño natural)
    targetScaleX: 1.0,
    targetScaleY: 1.0,
    // Escala actual interpolada
    currentScaleX: 1.0,
    currentScaleY: 1.0,
    // Velocidades instantáneas (dx/dt, dy/dt)
    velocityX: 0,
    velocityY: 0,
    // Control del ciclo de renderizado continuo
    isAnimating: false,
    rafId: 0,
    lastTime: 0,
  });

  /**
   * Dispara una compresión/estiramiento instantáneo (Squash & Stretch).
   * @param scaleX Deformación horizontal inicial (ej. 1.25 para ensanchar)
   * @param scaleY Deformación vertical inicial (ej. 0.75 para aplastar al aterrizar, o 1.3 al saltar)
   * @param impulseVelocityX Impulso de velocidad inicial opcional en X
   * @param impulseVelocityY Impulso de velocidad inicial opcional en Y
   */
  const triggerBounce = useCallback(
    (
      scaleX: number | { scaleX?: number; scaleY?: number } = 1.2,
      scaleY = 0.8,
      impulseVelocityX = 0,
      impulseVelocityY = 0
    ) => {
      let finalX = 1.2;
      let finalY = 0.8;

      if (typeof scaleX === "number") {
        if (scaleX > 1 && scaleY === 0.8) {
          // If called with a single high scale factor like triggerBounce(1.4), stretch vertically
          finalX = 0.85;
          finalY = scaleX;
        } else {
          finalX = scaleX;
          finalY = scaleY;
        }
      } else if (typeof scaleX === "object" && scaleX !== null) {
        finalX = scaleX.scaleX ?? 0.85;
        finalY = scaleX.scaleY ?? 1.4;
      }

      const p = physicsRef.current;
      p.currentScaleX = finalX;
      p.currentScaleY = finalY;
      p.velocityX = impulseVelocityX;
      p.velocityY = impulseVelocityY;

      // Inicia el loop de física si aún no está corriendo
      if (!p.isAnimating) {
        p.isAnimating = true;
        p.lastTime = performance.now();

        const updatePhysics = (time: number) => {
          // Delta time en segundos (acotado a 0.033s para evitar saltos bruscos si hay drop de frames)
          const dt = Math.min(0.033, (time - p.lastTime) / 1000 || 0.016);
          p.lastTime = time;

          // =========================================================================
          // MATEMÁTICA DEL RESORTE (Hooke's Law + Viscous Damping):
          // Fuerza del Resorte: F_spring = -k * (x - target)
          // Fuerza de Fricción: F_damping = -c * velocity
          // Aceleración: a = (F_spring + F_damping) / mass
          // Integración Euler-Cromer (60 FPS estable):
          // v(t+dt) = v(t) + a * dt
          // x(t+dt) = x(t) + v(t+dt) * dt
          // =========================================================================

          // Eje X:
          const displacementX = p.currentScaleX - p.targetScaleX;
          const springForceX = -tension * displacementX;
          const dampingForceX = -friction * p.velocityX;
          const accelX = (springForceX + dampingForceX) / mass;

          p.velocityX += accelX * dt;
          p.currentScaleX += p.velocityX * dt;

          // Eje Y:
          const displacementY = p.currentScaleY - p.targetScaleY;
          const springForceY = -tension * displacementY;
          const dampingForceY = -friction * p.velocityY;
          const accelY = (springForceY + dampingForceY) / mass;

          p.velocityY += accelY * dt;
          p.currentScaleY += p.velocityY * dt;

          // Mutación directa al DOM con translateZ(0) para forzar composición en capa GPU con squash & stretch
          if (elementRef.current) {
            elementRef.current.style.transform = `scaleX(${p.currentScaleX.toFixed(4)}) scaleY(${p.currentScaleY.toFixed(4)}) translateZ(0)`;
          }

          // Criterio de parada: cuando la energía cinética y el desplazamiento son infinitesimales
          const isSettledX =
            Math.abs(p.currentScaleX - p.targetScaleX) < 0.001 &&
            Math.abs(p.velocityX) < 0.005;
          const isSettledY =
            Math.abs(p.currentScaleY - p.targetScaleY) < 0.001 &&
            Math.abs(p.velocityY) < 0.005;

          if (isSettledX && isSettledY) {
            p.currentScaleX = p.targetScaleX;
            p.currentScaleY = p.targetScaleY;
            p.velocityX = 0;
            p.velocityY = 0;
            p.isAnimating = false;

            if (elementRef.current) {
              elementRef.current.style.transform = `scale(1, 1) translateZ(0)`;
            }
          } else {
            p.rafId = requestAnimationFrame(updatePhysics);
          }
        };

        p.rafId = requestAnimationFrame(updatePhysics);
      }
    },
    [tension, friction, mass]
  );

  // Escuchar eventos globales para coordinar animaciones entre componentes desacoplados
  useEffect(() => {
    const handleMascotAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.action === "jump") {
        console.log("¡Evento recibido! Ejecutando salto...");
        triggerBounce(1.4);
      }
    };
    window.addEventListener("mascot-action", handleMascotAction);
    return () => window.removeEventListener("mascot-action", handleMascotAction);
  }, [triggerBounce]);

  // Limpieza al desmontar el componente para evitar memory leaks
  useEffect(() => {
    return () => {
      if (physicsRef.current.rafId) {
        cancelAnimationFrame(physicsRef.current.rafId);
      }
    };
  }, []);

  return { ref: elementRef, triggerBounce };
}
