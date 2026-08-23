import { useState, useEffect, useCallback } from "react";
import { AppExperienceMode } from "../types";
import { haptics } from "../utils/haptics";
import { soundFx } from "../utils/soundFx";

export const APP_MODE_STORAGE_KEY = "app_exp_mode";
const APP_MODE_CHANGED_EVENT = "vt_app_mode_changed";

/**
 * Helper to retrieve stored last mode safely
 */
export function getStoredAppMode(): AppExperienceMode {
  if (typeof window === "undefined") return "adults";
  try {
    const saved = localStorage.getItem(APP_MODE_STORAGE_KEY);
    if (saved === "kids" || saved === "adults") {
      return saved as AppExperienceMode;
    }
  } catch {}
  return "adults";
}

/**
 * Helper to persist app mode
 */
export function setStoredAppMode(mode: AppExperienceMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(APP_MODE_STORAGE_KEY, mode);
    // Dispatch custom event for cross-component and window sync
    window.dispatchEvent(
      new CustomEvent(APP_MODE_CHANGED_EVENT, { detail: { mode } })
    );
  } catch {}
}

/**
 * Smart 'Last Mode' Memory Hook
 * Persists the user's active mode ('adults' | 'kids') and rehydrates it automatically.
 */
export function useAppMode(initialMode?: AppExperienceMode) {
  const [mode, setModeState] = useState<AppExperienceMode>(() => {
    return initialMode || getStoredAppMode();
  });

  const setMode = useCallback((newMode: AppExperienceMode, playFeedback = true) => {
    setModeState((prev) => {
      if (prev !== newMode) {
        setStoredAppMode(newMode);
        if (playFeedback) {
          haptics.medium();
          soundFx.playPop();
        }
      }
      return newMode;
    });
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "adults" ? "kids" : "adults");
  }, [mode, setMode]);

  // Listen for storage / custom event sync across tabs or components
  useEffect(() => {
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode: AppExperienceMode }>;
      if (customEvent.detail && customEvent.detail.mode) {
        setModeState(customEvent.detail.mode);
      } else {
        setModeState(getStoredAppMode());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === APP_MODE_STORAGE_KEY && (e.newValue === "adults" || e.newValue === "kids")) {
        setModeState(e.newValue as AppExperienceMode);
      }
    };

    window.addEventListener(APP_MODE_CHANGED_EVENT, handleModeChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(APP_MODE_CHANGED_EVENT, handleModeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return {
    mode,
    setMode,
    toggleMode,
    isAdults: mode === "adults",
    isKids: mode === "kids",
  };
}
