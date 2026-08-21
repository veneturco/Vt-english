export type ParticleType = "confetti" | "stars" | "sparks";

export interface SpawnParticlesDetail {
  x: number;
  y: number;
  type: ParticleType;
  count?: number;
}

/**
 * Dispara una ráfaga de partículas físicas en las coordenadas de pantalla (X, Y).
 * Utiliza CustomEvent global sin generar re-renders de React.
 * 
 * @param x Coordenada horizontal en píxeles (clientX o centro del elemento)
 * @param y Coordenada vertical en píxeles (clientY o centro del elemento)
 * @param type Tipo de partícula: 'confetti', 'stars' o 'sparks'
 * @param count Cantidad opcional de partículas a spawnear (por defecto 40-50)
 */
export function fireParticles(
  x: number,
  y: number,
  type: ParticleType = "confetti",
  count?: number
): void {
  if (typeof window === "undefined") return;

  const event = new CustomEvent<SpawnParticlesDetail>("spawn-particles", {
    detail: { x, y, type, count },
  });

  window.dispatchEvent(event);
}
