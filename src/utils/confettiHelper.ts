import confetti from "canvas-confetti";

/**
 * Dispara una ráfaga de confeti brillante desde ambos lados de la pantalla al aprobar una misión
 */
export function fireSuccessConfetti(): void {
  if (typeof window === "undefined") return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ["#fbbf24", "#f59e0b", "#10b981", "#6366f1"],
  });
  fire(0.2, {
    spread: 60,
    colors: ["#ec4899", "#8b5cf6", "#3b82f6", "#f43f5e"],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ["#ffd700", "#ff69b4", "#00ffff"],
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Lluvia continua y festiva de confeti para eventos especiales (ej. eclosión de huevo o subida de nivel)
 */
export function fireLevelUpConfetti(durationMs = 2500): void {
  if (typeof window === "undefined") return;

  const animationEnd = Date.now() + durationMs;
  const colors = ["#f59e0b", "#ec4899", "#10b981", "#6366f1", "#facc15"];

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / durationMs);

    // Disparo desde la izquierda
    confetti({
      particleCount,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
      zIndex: 9999,
    });

    // Disparo desde la derecha
    confetti({
      particleCount,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
      zIndex: 9999,
    });
  }, 200);
}
