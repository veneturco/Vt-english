import { useState, useEffect, useCallback } from "react";
import {
  getLastActiveLearningSessionSnapshot,
  saveActiveLearningSessionSnapshot,
  ActiveLearningSessionSnapshot,
} from "../utils/offlineSessionManager";
import { haptics } from "../utils/haptics";

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });

  const [lastSession, setLastSession] = useState<ActiveLearningSessionSnapshot | null>(() => {
    return getLastActiveLearningSessionSnapshot();
  });

  const [hasShownOfflineToast, setHasShownOfflineToast] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      haptics.light();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasShownOfflineToast(true);
      haptics.warning();
      // Reload last saved snapshot when going offline
      setLastSession(getLastActiveLearningSessionSnapshot());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const saveSession = useCallback((snapshot: Partial<ActiveLearningSessionSnapshot>) => {
    saveActiveLearningSessionSnapshot(snapshot);
  }, []);

  return {
    isOnline,
    lastSession,
    hasShownOfflineToast,
    dismissOfflineToast: () => setHasShownOfflineToast(false),
    saveSession,
  };
}
