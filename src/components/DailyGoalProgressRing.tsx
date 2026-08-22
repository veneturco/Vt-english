import React from "react";
import { Flame, Target, Sparkles, CheckCircle2 } from "lucide-react";

export interface DailyGoalProgressRingProps {
  currentXp: number;
  targetXp?: number;
  streakDays: number;
  completedLessonsToday?: number;
  targetLessonsToday?: number;
  onOpenGoalsModal?: () => void;
  className?: string;
}

export const DailyGoalProgressRing: React.FC<DailyGoalProgressRingProps> = ({
  currentXp = 35,
  targetXp = 50,
  streakDays = 3,
  completedLessonsToday = 2,
  targetLessonsToday = 3,
  onOpenGoalsModal,
  className = "",
}) => {
  const percentage = Math.min(100, Math.round((currentXp / targetXp) * 100));
  const isGoalReached = percentage >= 100;

  // SVG circular calculation (radius = 32, circumference = 2 * pi * 32 ~= 201.06)
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`w-full max-w-md mx-auto bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-xl select-none transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Interactive Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 80 80">
            {/* Background Track */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="text-slate-800"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Gradient Progress Indicator */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="url(#goalProgressGradient)"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="goalProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Metric Icon or Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isGoalReached ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce" />
            ) : (
              <>
                <span className="text-sm font-black text-white font-mono leading-none">
                  {percentage}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">META</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Informational Feedback & Streak Motivation */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
                Meta Diaria de Aprendizaje
              </h3>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold shrink-0">
              <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-500" />
              <span>{streakDays}d</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium line-clamp-1 mb-2">
            {isGoalReached ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> ¡Meta de hoy completada! (+50 XP)
              </span>
            ) : (
              <span>
                Has ganado <strong className="text-white">{currentXp}</strong> de{" "}
                <strong className="text-slate-200">{targetXp} XP</strong> hoy
              </span>
            )}
          </p>

          {/* Mini step indicator bar (Duolingo style) */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold shrink-0">
              {completedLessonsToday}/{targetLessonsToday} lecciones
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DailyGoalProgressRing;
