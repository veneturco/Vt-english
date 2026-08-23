import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart3, Clock, Brain, Flame, Sparkles, X, CheckCircle2, TrendingUp } from "lucide-react";
import { soundFx } from "../utils/soundFx";

interface WeeklyProgressDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  wordsLearnedCount: number;
  totalSpeakingMinutes: number;
  cefrLevel: string;
}

export const WeeklyProgressDashboardModal: React.FC<WeeklyProgressDashboardModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  wordsLearnedCount = 42,
  totalSpeakingMinutes = 18,
  cefrLevel = "B1",
}) => {
  if (!isOpen) return null;

  // Daily speaking activity (Monday to Sunday)
  const weeklyData = [
    { day: "Lun", minutes: 5, active: true },
    { day: "Mar", minutes: 8, active: true },
    { day: "Mié", minutes: 12, active: true },
    { day: "Jue", minutes: 6, active: true },
    { day: "Vie", minutes: 15, active: true },
    { day: "Sáb", minutes: 10, active: true },
    { day: "Dom", minutes: 4, active: true },
  ];

  const maxMinutes = 15;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border-2 border-b-8 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-sky-500/20 border-2 border-sky-500/40 text-sky-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Progreso & Minutos Semanales</h3>
                <p className="text-[11px] font-bold text-slate-400">Tu tiempo real de práctica oral en inglés</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border-2 border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="p-3 rounded-2xl bg-slate-950 border-2 border-slate-800 flex flex-col items-center text-center">
              <div className="flex items-center gap-1 text-sky-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Hablado</span>
              </div>
              <span className="text-xl font-black text-white">{totalSpeakingMinutes + 42} min</span>
              <span className="text-[9px] font-bold text-slate-500">Esta semana</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border-2 border-slate-800 flex flex-col items-center text-center">
              <div className="flex items-center gap-1 text-emerald-400 mb-1">
                <Brain className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Vocabulario</span>
              </div>
              <span className="text-xl font-black text-white">{wordsLearnedCount}</span>
              <span className="text-[9px] font-bold text-slate-500">Palabras fijadas</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border-2 border-slate-800 flex flex-col items-center text-center">
              <div className="flex items-center gap-1 text-orange-400 mb-1">
                <Flame className="w-4 h-4 fill-orange-400" />
                <span className="text-[10px] font-black uppercase">Racha</span>
              </div>
              <span className="text-xl font-black text-white">{streakDays} días</span>
              <span className="text-[9px] font-bold text-emerald-400">Al rojo vivo 🔥</span>
            </div>
          </div>

          {/* Weekly Minutes Bar Chart */}
          <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Tiempo de Práctica Oral por Día</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">Meta: 10 min/día</span>
            </div>

            {/* Bars */}
            <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-1">
              {weeklyData.map((item) => {
                const heightPercent = Math.min(100, Math.round((item.minutes / maxMinutes) * 100));
                const isTargetMet = item.minutes >= 10;

                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-black text-slate-400">{item.minutes}m</span>
                    <div className="w-full h-full max-h-[70px] bg-slate-900 rounded-t-lg flex items-end overflow-hidden">
                      <motion.div
                        className={`w-full rounded-t-lg ${
                          isTargetMet
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                            : "bg-gradient-to-t from-sky-600 to-sky-400"
                        }`}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CEFR Level Mastery Progress */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-xs flex items-center justify-center">
                {cefrLevel}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white">Dominio del Nivel {cefrLevel}</span>
                <span className="text-[10px] text-slate-400">76% completado para desbloquear B2</span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-xl border border-emerald-500/30">
              76%
            </span>
          </div>

          {/* Action */}
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs border-2 border-b-4 border-sky-700 active:border-b-2 active:translate-y-0.5 transition shadow-sm"
          >
            Continuar Mi Entrenamiento
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
