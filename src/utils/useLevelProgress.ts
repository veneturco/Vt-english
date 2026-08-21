import { useState, useEffect, useCallback, useMemo } from "react";

export type LevelState = "locked" | "unlocked" | "completed";

export interface LevelProgressRecord {
  completedLevelIds: string[];
  levelStars: Record<string, number>; // levelId -> 1..3
  currentLevelId: string;
  totalStars: number;
}

const DEFAULT_STORAGE_KEY = "vt_use_level_progress_v1";

export interface UseLevelProgressOptions {
  storageKey?: string;
  defaultUnlockedFirst?: boolean;
}

export function useLevelProgress(
  levelSequence: string[],
  options: UseLevelProgressOptions = {}
) {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    defaultUnlockedFirst = true,
  } = options;

  const [data, setData] = useState<LevelProgressRecord>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.warn("Failed to load level progress from localStorage:", e);
    }

    const firstId = levelSequence[0] || "level_1";
    return {
      completedLevelIds: [],
      levelStars: {},
      currentLevelId: firstId,
      totalStars: 0,
    };
  });

  // Sync to localStorage on state changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    } catch (e) {
      console.warn("Failed to save level progress to localStorage:", e);
    }
  }, [data, storageKey]);

  /**
   * Retrieves the dynamic state ("locked", "unlocked", "completed") for a specific level ID.
   */
  const getLevelStatus = useCallback(
    (levelId: string): LevelState => {
      if (data.completedLevelIds.includes(levelId)) {
        return "completed";
      }

      const index = levelSequence.indexOf(levelId);
      if (index === 0 && defaultUnlockedFirst) {
        return "unlocked";
      }

      if (index > 0) {
        const prevId = levelSequence[index - 1];
        if (prevId && data.completedLevelIds.includes(prevId)) {
          return "unlocked";
        }
      }

      return "locked";
    },
    [data.completedLevelIds, levelSequence, defaultUnlockedFirst]
  );

  /**
   * Completes a level with awarded stars (1-3) and unlocks the next level in sequence.
   */
  const completeLevel = useCallback(
    (levelId: string, stars: number = 3) => {
      const clampedStars = Math.max(1, Math.min(3, Math.round(stars)));

      setData((prev) => {
        const prevStars = prev.levelStars[levelId] || 0;
        const newStars = Math.max(prevStars, clampedStars);
        const addedStars = newStars - prevStars;

        const isNewlyCompleted = !prev.completedLevelIds.includes(levelId);
        const updatedCompleted = isNewlyCompleted
          ? [...prev.completedLevelIds, levelId]
          : prev.completedLevelIds;

        const currentIndex = levelSequence.indexOf(levelId);
        const nextLevelId =
          currentIndex >= 0 && currentIndex < levelSequence.length - 1
            ? levelSequence[currentIndex + 1]
            : prev.currentLevelId;

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
    [levelSequence]
  );

  /**
   * Resets all progress back to initial state.
   */
  const resetProgress = useCallback(() => {
    const firstId = levelSequence[0] || "level_1";
    setData({
      completedLevelIds: [],
      levelStars: {},
      currentLevelId: firstId,
      totalStars: 0,
    });
  }, [levelSequence]);

  /**
   * Calculates overall progress percentage (0 - 100%).
   */
  const progressPercentage = useMemo(() => {
    if (!levelSequence || levelSequence.length === 0) return 0;
    const completedCount = levelSequence.filter((id) =>
      data.completedLevelIds.includes(id)
    ).length;
    return Math.round((completedCount / levelSequence.length) * 100);
  }, [levelSequence, data.completedLevelIds]);

  /**
   * Calculates total stars earned out of total possible stars (3 per level).
   */
  const starsStats = useMemo(() => {
    const maxPossibleStars = levelSequence.length * 3;
    const earnedStars = data.totalStars;
    const starsPercentage =
      maxPossibleStars > 0
        ? Math.round((earnedStars / maxPossibleStars) * 100)
        : 0;

    return {
      earnedStars,
      maxPossibleStars,
      starsPercentage,
    };
  }, [levelSequence.length, data.totalStars]);

  return {
    completedLevelIds: data.completedLevelIds,
    levelStars: data.levelStars,
    currentLevelId: data.currentLevelId,
    totalStars: data.totalStars,
    progressPercentage,
    starsStats,
    getLevelStatus,
    completeLevel,
    resetProgress,
  };
}
