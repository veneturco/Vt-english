export interface TurpialRigOffsets {
  // Cabeza
  headTop: number;
  headLeft: number;
  headWidth: number;
  headHeight: number;
  headRotationBase: number;

  // Cuerpo
  bodyBottom: number;
  bodyLeft: number;
  bodyWidth: number;

  // Ala Izquierda
  wingLeftTop: number;
  wingLeftLeft: number;
  wingLeftWidth: number;
  wingLeftRotateBase: number;

  // Ala Derecha
  wingRightTop: number;
  wingRightRight: number;
  wingRightWidth: number;
  wingRightRotateBase: number;

  // Pico Lip-Sync (Mandíbula inferior y superior)
  beakMode: 'anatomical' | 'sprite_swap' | 'lower_only' | 'hidden';
  beakTop: number; // Altura inferior Y
  beakLeft: number; // Posición inferior X
  beakWidth: number; // Ancho inferior
  beakSupTop: number; // Altura superior Y
  beakSupLeft: number; // Posición superior X
  beakSupWidth: number; // Ancho superior

  // Medallas
  medalsCount: 0 | 1 | 3; // 0 = sin medallas, 1 = medalla única central, 3 = trío
  medalTop: number;
  medalLeft: number;
  medalWidth: number;
}

export const DEFAULT_TURPIAL_RIG_OFFSETS: TurpialRigOffsets = {
  // Cabeza bajada a 30px (antes 10px) para sellar el cuello con el cuerpo
  headTop: 28,
  headLeft: 67,
  headWidth: 156,
  headHeight: 156,
  headRotationBase: 0,

  bodyBottom: 0,
  bodyLeft: 45,
  bodyWidth: 200,

  // Alas ajustadas hacia afuera para dar apertura natural
  wingLeftTop: 112,
  wingLeftLeft: 0,
  wingLeftWidth: 110,
  wingLeftRotateBase: -5,

  wingRightTop: 112,
  wingRightRight: 0,
  wingRightWidth: 110,
  wingRightRotateBase: 5,

  beakMode: 'anatomical',
  beakTop: 92,
  beakLeft: 58,
  beakWidth: 40,
  beakSupTop: 82,
  beakSupLeft: 58,
  beakSupWidth: 42,

  // 1 sola medalla por defecto para evitar contar 5 medallas
  medalsCount: 1,
  medalTop: 136,
  medalLeft: 96,
  medalWidth: 78,
};

const STORAGE_KEY = "bet_turpial_rig_offsets_v1";

export function loadTurpialRigOffsets(): TurpialRigOffsets {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TURPIAL_RIG_OFFSETS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_TURPIAL_RIG_OFFSETS, ...parsed };
  } catch (err) {
    console.warn("Error cargando calibración de Turpial:", err);
    return DEFAULT_TURPIAL_RIG_OFFSETS;
  }
}

export function saveTurpialRigOffsets(offsets: TurpialRigOffsets): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offsets));
    if (typeof window !== "undefined") {
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent("turpial-rig-updated", { detail: offsets }));
      });
    }
  } catch (err) {
    console.warn("Error guardando calibración de Turpial:", err);
  }
}

export function resetTurpialRigOffsets(): TurpialRigOffsets {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== "undefined") {
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent("turpial-rig-updated", { detail: DEFAULT_TURPIAL_RIG_OFFSETS }));
      });
    }
  } catch (err) {
    console.warn("Error restableciendo calibración de Turpial:", err);
  }
  return DEFAULT_TURPIAL_RIG_OFFSETS;
}
