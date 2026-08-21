import React, { useState, useEffect } from "react";
import { Flame, Award, Zap, CheckCircle, Trophy, Calendar, Sparkles, X, ChevronRight } from "lucide-react";
import { fireParticles } from "../../utils/particleHelper";
import { playSuccessFanfare, playCoinSound } from "../../utils/audioSynth";

export interface StreakMilestone {
  days: number;
  title: string;
  rewardCoins: number;
  badgeIcon: string;
}

interface DailyStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTodayCount?: number;
  dailyLessonGoal?: number;
  initialStreak?: number;
  onClaimReward?: (coins: number) => void;
}

const STORAGE_KEY_STREAK = "vt_daily_streak_record_v1";

const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, title: "Racha Principiante", rewardCoins: 30, badgeIcon: "🥉" },
  { days: 7, title: "Semana Imparable", rewardCoins: 100, badgeIcon: "🥈" },
  { days: 14, title: "Doble Semana Legendaria", rewardCoins: 250, badgeIcon: "🥇" },
  { days: 30, title: "Maestro del Mes", rewardCoins: 600, badgeIcon: "👑" },
];

export const DailyStreakModal: React.FC<DailyStreakModalProps> = ({
  isOpen,
  onClose,
  completedTodayCount = 3,
  dailyLessonGoal = 5,
  initialStreak = 4,
  onClaimReward,
}) => {
  const [streakData, setStreakData] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY_STREAK);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.warn("Failed to load streak from localStorage:", e);
    }
    return {
      currentStreak: initialStreak,
      highestStreak: initialStreak,
      lastActiveDate: new Date().toISOString().split("T")[0],
      claimedMilestones: [] as number[],
    };
  });

  // Guardar en localStorage ante cambios
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(streakData));
      }
    } catch (e) {
      console.warn("Failed to save streak to localStorage:", e);
    }
  }, [streakData]);

  if (!isOpen) return null;

  const currentStreak = streakData.currentStreak;

  // Próximo hito por alcanzar
  const nextMilestone =
    STREAK_MILESTONES.find((m) => m.days > currentStreak) ||
    STREAK_MILESTONES[STREAK_MILESTONES.length - 1];

  const previousMilestoneDays =
    STREAK_MILESTONES.filter((m) => m.days <= currentStreak).pop()?.days || 0;

  const daysRemaining = Math.max(0, nextMilestone.days - currentStreak);
  const lessonsRemainingToday = Math.max(0, dailyLessonGoal - completedTodayCount);
  const isDailyGoalMet = completedTodayCount >= dailyLessonGoal;

  // Progreso hacia el siguiente hito (0% - 100%)
  const milestoneRange = nextMilestone.days - previousMilestoneDays;
  const milestoneProgress =
    milestoneRange > 0
      ? Math.min(
          100,
          Math.round(((currentStreak - previousMilestoneDays) / milestoneRange) * 100)
        )
      : 100;

  // Reclamar premio de hito alcanzado
  const handleClaimMilestone = (milestone: StreakMilestone, e: React.MouseEvent) => {
    if (streakData.claimedMilestones.includes(milestone.days)) return;

    playSuccessFanfare();
    const rect = e.currentTarget.getBoundingClientRect();
    fireParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, "stars", 40);
    fireParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, "confetti", 50);

    setStreakData((prev: typeof streakData) => ({
      ...prev,
      claimedMilestones: [...prev.claimedMilestones, milestone.days],
    }));

    if (onClaimReward) {
      onClaimReward(milestone.rewardCoins);
    }
  };

  // Días de la semana para el visualizador
  const daysOfWeek = ["L", "M", "X", "J", "V", "S", "D"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Lunes = 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-2xl border-2 border-orange-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.7)] flex flex-col items-center select-none overflow-hidden text-center">
        {/* Resplandores de fondo */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-orange-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs transition cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ICONO CENTRAL DE FUEGO & RACHA */}
        <div className="relative my-2 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-orange-500/30 via-amber-500/20 to-rose-500/30 border-2 border-orange-400/50 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] animate-pulse">
            <Flame className="w-14 h-14 sm:w-16 sm:h-16 text-orange-400 fill-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]" />
          </div>
          <div className="absolute -bottom-2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg border border-white">
            ¡En Llamas!
          </div>
        </div>

        {/* CONTADOR DE RACHA */}
        <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-yellow-400 mt-3 tracking-tight">
          {currentStreak} {currentStreak === 1 ? "Día" : "Días"}
        </h2>
        <p className="text-xs sm:text-sm font-bold text-slate-300 mt-0.5">
          {isDailyGoalMet
            ? "¡Racha de hoy asegurada! Sigue así mañana 🚀"
            : `Completa ${lessonsRemainingToday} lecciones más para mantener tu racha viva.`}
        </p>

        {/* VISUALIZADOR DE LA SEMANA */}
        <div className="flex items-center justify-between w-full max-w-xs my-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          {daysOfWeek.map((day, idx) => {
            const isCompleted = idx < currentDayIndex || (idx === currentDayIndex && isDailyGoalMet);
            const isToday = idx === currentDayIndex;

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-black text-slate-400">{day}</span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-gradient-to-tr from-orange-500 to-amber-400 text-slate-950 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                      : isToday
                      ? "bg-slate-800 border-2 border-orange-400 text-orange-300 animate-pulse"
                      : "bg-slate-800/60 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Flame className="w-3.5 h-3.5 fill-slate-950" /> : idx + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* BARRA DE PROGRESO HACIA EL SIGUIENTE HITO */}
        <div className="w-full max-w-xs my-2">
          <div className="flex items-center justify-between text-xs font-black mb-1.5 px-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Siguiente Meta: {nextMilestone.title}
            </span>
            <span className="text-amber-400 font-bold">
              {currentStreak} / {nextMilestone.days} Días
            </span>
          </div>

          <div className="w-full h-3.5 rounded-full bg-slate-800/80 border border-slate-700/80 overflow-hidden p-0.5 shadow-inner">
            <div
              style={{ width: `${milestoneProgress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 shadow-[0_0_12px_rgba(251,146,60,0.6)] transition-all duration-500"
            />
          </div>

          <p className="text-[11px] font-semibold text-slate-400 text-right mt-1">
            {daysRemaining > 0
              ? `Faltan ${daysRemaining} días para ganar +${nextMilestone.rewardCoins} 🪙`
              : "¡Meta completada!"}
          </p>
        </div>

        {/* LISTA DE HITOS & RECOMPENSAS RECLAMABLES */}
        <div className="w-full mt-3 space-y-2 max-h-36 overflow-y-auto pr-1">
          {STREAK_MILESTONES.map((milestone) => {
            const isReached = currentStreak >= milestone.days;
            const isClaimed = streakData.claimedMilestones.includes(milestone.days);

            return (
              <div
                key={milestone.days}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  isReached
                    ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/40"
                    : "bg-slate-900/40 border-slate-800/60 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <span className="text-xl">{milestone.badgeIcon}</span>
                  <div>
                    <h4 className="text-xs font-black text-white">{milestone.title}</h4>
                    <span className="text-[10px] font-bold text-amber-300">
                      +{milestone.rewardCoins} Monedas ({milestone.days} Días)
                    </span>
                  </div>
                </div>

                {isReached ? (
                  isClaimed ? (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-emerald-400 text-[10px] font-black flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Reclamado
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleClaimMilestone(milestone, e)}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black hover:brightness-110 active:scale-95 transition shadow cursor-pointer animate-bounce"
                    >
                      Reclamar
                    </button>
                  )
                ) : (
                  <span className="text-[10px] font-bold text-slate-500">
                    Bloqueado
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="w-full mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between z-10">
          <span className="text-xs font-bold text-slate-400">
            Récord: <span className="text-amber-400 font-black">{streakData.highestStreak} días</span>
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs shadow-[0_4px_0_#9a3412] hover:brightness-110 active:translate-y-0.5 transition cursor-pointer"
          >
            ¡Continuar!
          </button>
        </div>
      </div>
    </div>
  );
};
