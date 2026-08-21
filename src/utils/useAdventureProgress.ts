import { useState, useEffect, useCallback } from "react";

export type LevelStatus = "locked" | "unlocked" | "completed";

export interface AdventureLevel {
  id: string;
  worldId: string;
  title: string;
  spanishTitle: string;
  emoji: string;
  stars: number; // 0 to 3
  status: LevelStatus;
  isBoss?: boolean;
}

export interface WorldProgressData {
  completedLevelIds: string[];
  levelStars: Record<string, number>; // levelId -> 1..3
  currentLevelId: string;
  totalStars: number;
}

const ADVENTURE_STORAGE_KEY = "vt_adventure_progress_v1";

export function useAdventureProgress(initialLevelIds: string[]) {
  const [progress, setProgress] = useState<WorldProgressData>(() => {
    try {
      const saved = localStorage.getItem(ADVENTURE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    const firstId = initialLevelIds[0] || "lvl_1";
    return {
      completedLevelIds: [],
      levelStars: {},
      currentLevelId: firstId,
      totalStars: 0,
    };
  });

  // Guardar en LocalStorage cada vez que cambie
  useEffect(() => {
    try {
      localStorage.setItem(ADVENTURE_STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  /**
   * Guarda las estrellas de un nivel y desbloquea el siguiente en el sendero
   */
  const completeLevel = useCallback(
    (levelId: string, stars: number) => {
      const clampedStars = Math.max(1, Math.min(3, stars));

      setProgress((prev) => {
        const prevStars = prev.levelStars[levelId] || 0;
        const newStars = Math.max(prevStars, clampedStars);
        const addedStars = newStars - prevStars;

        const isNewlyCompleted = !prev.completedLevelIds.includes(levelId);
        const updatedCompleted = isNewlyCompleted
          ? [...prev.completedLevelIds, levelId]
          : prev.completedLevelIds;

        // Encontrar siguiente nivel en la secuencia
        const currentIndex = initialLevelIds.indexOf(levelId);
        const nextLevelId =
          currentIndex >= 0 && currentIndex < initialLevelIds.length - 1
            ? initialLevelIds[currentIndex + 1]
            : levelId;

        return {
          ...prev,
          completedLevelIds: updatedCompleted,
          levelStars: {
            ...prev.levelStars,
            [levelId]: newStars,
          },
          currentLevelId: nextLevelId,
          totalStars: prev.totalStars + addedStars,
        };
      });
    },
    [initialLevelIds]
  );

  /**
   * Obtiene el estado dinámico (locked, unlocked, completed) para un nivel
   */
  const getLevelStatus = useCallback(
    (levelId: string, index: number): LevelStatus => {
      if (progress.completedLevelIds.includes(levelId)) {
        return "completed";
      }
      // El primer nivel siempre está desbloqueado, o si el anterior ya fue completado
      if (index === 0) {
        return "unlocked";
      }
      const prevLevelId = initialLevelIds[index - 1];
      if (prevLevelId && progress.completedLevelIds.includes(prevLevelId)) {
        return "unlocked";
      }
      return "locked";
    },
    [progress.completedLevelIds, initialLevelIds]
  );

  return {
    progress,
    completeLevel,
    getLevelStatus,
  };
}
