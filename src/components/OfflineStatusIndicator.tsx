import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { WifiOff, CheckCircle, Database, RefreshCw } from "lucide-react";
import { ActiveLearningSessionSnapshot } from "../utils/offlineSessionManager";

interface OfflineStatusIndicatorProps {
  isOnline: boolean;
  lastSession: ActiveLearningSessionSnapshot | null;
  onDismiss?: () => void;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  isOnline,
  lastSession,
}) => {
  if (isOnline) return null;

  const sessionTimeFormatted = lastSession?.timestamp
    ? new Date(lastSession.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -15, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.96 }}
        className="w-full max-w-xl mx-auto px-3 py-1.5 z-40 relative"
      >
        <div
          id="offline-session-banner"
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-amber-950/90 border border-amber-500/40 text-amber-200 shadow-lg shadow-amber-950/40 backdrop-blur-md text-xs font-semibold"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <WifiOff className="w-4 h-4" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-amber-300 flex items-center gap-1.5 truncate">
                <span>Modo Sin Conexión</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Database className="w-2.5 h-2.5 mr-1" />
                  Sesión Guardada
                </span>
              </span>
              <span className="text-[11px] text-amber-200/80 truncate">
                {lastSession?.activeLessonTitle
                  ? `Lección activa: "${lastSession.activeLessonTitle}"`
                  : lastSession?.topicTitle
                  ? `Tema: ${lastSession.topicTitle}`
                  : "Lecciones y laboratorio fonético disponibles"}
                {sessionTimeFormatted && ` • ${sessionTimeFormatted}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-amber-400/90 hidden sm:inline-block bg-slate-900/60 px-2 py-1 rounded-xl border border-amber-500/20">
              Voz Local WebSpeech Activa
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
