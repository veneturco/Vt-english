import { useState, useEffect, useCallback } from "react";

export interface KidsProgressState {
  coins: number;
  stars: number;
  streakDays: number;
  lastPracticeDate: string | null; // ISO YYYY-MM-DD
  unlockedItems: string[];
  completedMissions: string[];
  currentEggSpeciesIndex: number;
  hatchedEggCount: number;
}

const STORAGE_KEY = "bti_kids_progress_v1";

const DEFAULT_KIDS_PROGRESS: KidsProgressState = {
  coins: 50,
  stars: 5,
  streakDays: 1,
  lastPracticeDate: null,
  unlockedItems: ["default_avatar_rex"],
  completedMissions: [],
  currentEggSpeciesIndex: 0,
  hatchedEggCount: 0,
};

// Formato de fecha YYYY-MM-DD
function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function useKidsProgress() {
  const [progress, setProgress] = useState<KidsProgressState>(() => {
    if (typeof window === "undefined") return DEFAULT_KIDS_PROGRESS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_KIDS_PROGRESS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn("Failed to load kids progress from localStorage:", e);
    }
    return DEFAULT_KIDS_PROGRESS;
  });

  // Guardar en localStorage cada vez que cambie
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn("Failed to save kids progress to localStorage:", e);
    }
  }, [progress]);

  // Sumar recompensas y calcular la racha
  const addRewards = useCallback(
    (coinsEarned: number, starsEarned: number, missionId: string) => {
      setProgress((prev) => {
        const today = getTodayDateString();
        const yesterday = getYesterdayDateString();

        let newStreak = prev.streakDays;

        if (prev.lastPracticeDate === yesterday) {
          // Practicó ayer -> sumamos +1 a la racha
          newStreak = prev.streakDays + 1;
        } else if (prev.lastPracticeDate !== today && prev.lastPracticeDate !== yesterday) {
          // Se rompió la racha o es su primer día
          newStreak = 1;
        }

        const newCompletedMissions = prev.completedMissions.includes(missionId)
          ? prev.completedMissions
          : [...prev.completedMissions, missionId];

        return {
          ...prev,
          coins: prev.coins + Math.max(0, coinsEarned),
          stars: prev.stars + Math.max(0, starsEarned),
          streakDays: newStreak,
          lastPracticeDate: today,
          completedMissions: newCompletedMissions,
        };
      });
    },
    []
  );

  // Desbloquear / comprar cosméticos con monedas
  const unlockItem = useCallback((itemId: string, cost: number): boolean => {
    let success = false;
    setProgress((prev) => {
      if (prev.unlockedItems.includes(itemId)) {
        success = true; // Ya lo tiene
        return prev;
      }
      if (prev.coins >= cost) {
        success = true;
        return {
          ...prev,
          coins: prev.coins - cost,
          unlockedItems: [...prev.unlockedItems, itemId],
        };
      }
      success = false;
      return prev;
    });
    return success;
  }, []);

  // Reclamar dinosaurio eclosionado y guardar la especie desbloqueada
  const claimEggReward = useCallback(
    (bonusCoins: number, bonusStars: number, speciesId: string) => {
      setProgress((prev) => {
        const updatedUnlocked = prev.unlockedItems.includes(speciesId)
          ? prev.unlockedItems
          : [...prev.unlockedItems, speciesId];

        return {
          ...prev,
          coins: prev.coins + Math.max(0, bonusCoins),
          stars: prev.stars + Math.max(0, bonusStars),
          unlockedItems: updatedUnlocked,
          currentEggSpeciesIndex: (prev.currentEggSpeciesIndex + 1) % 4,
          hatchedEggCount: (prev.hatchedEggCount || 0) + 1,
        };
      });
    },
    []
  );

  // Alias compatible para claimHatchedEgg
  const claimHatchedEgg = useCallback(
    (bonusCoins: number, bonusStars: number, speciesId?: string) => {
      claimEggReward(bonusCoins, bonusStars, speciesId || "baby_rexy");
    },
    [claimEggReward]
  );

  // Reiniciar progreso
  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_KIDS_PROGRESS);
  }, []);

  return {
    progress,
    coins: progress.coins,
    stars: progress.stars,
    streakDays: progress.streakDays,
    lastPracticeDate: progress.lastPracticeDate,
    unlockedItems: progress.unlockedItems,
    completedMissions: progress.completedMissions,
    currentEggSpeciesIndex: progress.currentEggSpeciesIndex ?? 0,
    hatchedEggCount: progress.hatchedEggCount ?? 0,
    addRewards,
    unlockItem,
    claimEggReward,
    claimHatchedEgg,
    resetProgress,
  };
}
