import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Flame,
  Zap,
  Shield,
  ArrowUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Crown,
  Medal,
  Users,
  Timer,
  Award,
  Heart,
  TrendingUp,
  Radio,
} from "lucide-react";
import { soundFx } from "../utils/soundFx";
import { haptics } from "../utils/haptics";
import { SeasonalThemeConfig } from "../types";

export interface ActiveLearner {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  isUser?: boolean;
  accuracyRate?: number;
  dailyXpGain?: number;
  isOnlineNow?: boolean;
  statusBadge?: string;
  rankDelta?: number; // e.g. +2 places today
  kudosReceived?: number;
}

export interface LeagueTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  promotionRewardGems: number;
}

export const LEAGUE_TIERS: LeagueTier[] = [
  {
    id: "bronze",
    name: "Liga Bronce",
    icon: "🥉",
    color: "text-amber-700",
    bgColor: "bg-amber-950/40",
    borderColor: "border-amber-700/50",
    promotionRewardGems: 20,
  },
  {
    id: "silver",
    name: "Liga Plata",
    icon: "🥈",
    color: "text-slate-300",
    bgColor: "bg-slate-800/40",
    borderColor: "border-slate-400/50",
    promotionRewardGems: 35,
  },
  {
    id: "gold",
    name: "Liga Oro",
    icon: "🥇",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-400/50",
    promotionRewardGems: 50,
  },
  {
    id: "ruby",
    name: "Liga Rubí",
    icon: "💎",
    color: "text-rose-400",
    bgColor: "bg-rose-950/40",
    borderColor: "border-rose-500/50",
    promotionRewardGems: 75,
  },
  {
    id: "diamond",
    name: "Liga Diamante",
    icon: "👑",
    color: "text-cyan-300",
    bgColor: "bg-cyan-950/40",
    borderColor: "border-cyan-400/50",
    promotionRewardGems: 100,
  },
];

export interface WeeklyLeagueWidgetProps {
  userXP: number;
  userName?: string;
  userStreak: number;
  onOpenFullLeaderboard?: () => void;
  seasonalThemeConfig?: SeasonalThemeConfig;
  className?: string;
}

export const WeeklyLeagueWidget: React.FC<WeeklyLeagueWidgetProps> = ({
  userXP,
  userName = "Tú",
  userStreak,
  onOpenFullLeaderboard,
  seasonalThemeConfig,
  className = "",
}) => {
  const [selectedLeagueIndex, setSelectedLeagueIndex] = useState(2); // Gold by default
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterView, setFilterView] = useState<"all" | "my_zone" | "rewards">("all");
  const [sentKudos, setSentKudos] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 28 });

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59 };
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const currentLeague = LEAGUE_TIERS[selectedLeagueIndex];
  const baseXP = Math.max(userXP, 480);

  // Active learners with dynamic badges and stats
  const learners: ActiveLearner[] = [
    {
      id: "learner_1",
      name: "Elena Rostova",
      avatar: "👩‍💼",
      xp: baseXP + 160,
      streak: 15,
      accuracyRate: 98,
      dailyXpGain: 85,
      isOnlineNow: true,
      statusBadge: "MVP Semanal",
      rankDelta: 1,
      kudosReceived: 24,
    },
    {
      id: "learner_2",
      name: "Lucas Silva",
      avatar: "🧑‍💻",
      xp: baseXP + 95,
      streak: 9,
      accuracyRate: 95,
      dailyXpGain: 60,
      isOnlineNow: true,
      statusBadge: "Racha Imparable",
      rankDelta: 2,
      kudosReceived: 18,
    },
    {
      id: "learner_3",
      name: "Maya Patel",
      avatar: "👩‍🔬",
      xp: baseXP + 40,
      streak: 12,
      accuracyRate: 92,
      dailyXpGain: 45,
      isOnlineNow: false,
      statusBadge: "Ascenso Inminente",
      rankDelta: 0,
      kudosReceived: 15,
    },
    {
      id: "user",
      name: `${userName} (Tú)`,
      avatar: "⭐",
      xp: userXP,
      streak: userStreak,
      accuracyRate: 94,
      dailyXpGain: 35,
      isUser: true,
      isOnlineNow: true,
      statusBadge: "Tu Posición",
      rankDelta: 2,
      kudosReceived: 12,
    },
    {
      id: "learner_4",
      name: "Carlos Mendoza",
      avatar: "👨‍🍳",
      xp: Math.max(20, baseXP - 45),
      streak: 7,
      accuracyRate: 89,
      dailyXpGain: 30,
      isOnlineNow: false,
      statusBadge: "Zona Segura",
      rankDelta: -1,
      kudosReceived: 8,
    },
    {
      id: "learner_5",
      name: "Sophie Dupont",
      avatar: "👩‍🎨",
      xp: Math.max(15, baseXP - 95),
      streak: 5,
      accuracyRate: 91,
      dailyXpGain: 25,
      isOnlineNow: true,
      statusBadge: "Zona Segura",
      rankDelta: 0,
      kudosReceived: 11,
    },
    {
      id: "learner_6",
      name: "Kenji Sato",
      avatar: "👨‍🚀",
      xp: Math.max(10, baseXP - 150),
      streak: 4,
      accuracyRate: 86,
      dailyXpGain: 15,
      isOnlineNow: false,
      statusBadge: "Riesgo de Descenso",
      rankDelta: -2,
      kudosReceived: 5,
    },
    {
      id: "learner_7",
      name: "David Miller",
      avatar: "🧑‍🎓",
      xp: Math.max(5, baseXP - 210),
      streak: 2,
      accuracyRate: 82,
      dailyXpGain: 10,
      isOnlineNow: false,
      statusBadge: "Zona de Descenso",
      rankDelta: -1,
      kudosReceived: 3,
    },
  ].sort((a, b) => b.xp - a.xp);

  const userRank = learners.findIndex((l) => l.isUser) + 1;
  const isUserPromoted = userRank <= 3;
  const isUserDemoted = userRank >= 7;
  const nextTargetLearner = userRank > 1 ? learners[userRank - 2] : null;
  const xpNeededForNextRank = nextTargetLearner ? nextTargetLearner.xp - userXP + 5 : 0;

  const handleSendKudo = (learnerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sentKudos[learnerId]) return;

    soundFx.playPop();
    haptics.light();
    setSentKudos((prev) => ({ ...prev, [learnerId]: true }));
  };

  const displayedLearners = filterView === "my_zone"
    ? learners.filter((_, idx) => Math.abs(idx + 1 - userRank) <= 2)
    : isExpanded
    ? learners
    : learners.slice(0, 4);

  return (
    <div
      id="seasonal-weekly-league-widget"
      className={`w-full max-w-xl mx-auto rounded-3xl bg-slate-900/95 border-2 border-slate-800 shadow-xl overflow-hidden backdrop-blur-md select-none text-slate-100 ${className}`}
    >
      {/* 1. Header: Seasonal Tag & League Information */}
      <div className="p-4 sm:p-5 border-b-2 border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Seasonal League Title Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border-2 border-amber-400/40 flex items-center justify-center text-xl shrink-0 shadow-sm">
              {currentLeague.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1">
                  <span>{currentLeague.name}</span>
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                  Temporada Activa
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 truncate">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Radio className="w-3 h-3 animate-pulse" />
                  1,420 aprendiendo hoy
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Timer className="w-3 h-3" />
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                </span>
              </p>
            </div>
          </div>

          {/* Full leaderboard modal button */}
          {onOpenFullLeaderboard && (
            <button
              onClick={() => {
                soundFx.playPop();
                haptics.medium();
                onOpenFullLeaderboard();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white text-xs font-black border border-slate-700 shadow-sm transition flex items-center gap-1 shrink-0"
              title="Abrir tabla de posiciones completa"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Todo</span>
            </button>
          )}
        </div>

        {/* League Selector Mini-Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-x-auto no-scrollbar">
          {LEAGUE_TIERS.map((tier, idx) => (
            <button
              key={tier.id}
              onClick={() => {
                soundFx.playPop();
                haptics.light();
                setSelectedLeagueIndex(idx);
              }}
              className={`flex items-center gap-1 py-1 px-2.5 rounded-xl text-xs font-black transition shrink-0 ${
                selectedLeagueIndex === idx
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700 scale-100"
                  : "text-slate-500 hover:text-slate-300 scale-95"
              }`}
            >
              <span>{tier.icon}</span>
              <span className="text-[11px]">{tier.name.replace("Liga ", "")}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. User Promotion/Safety Status Dynamic Banner */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
              isUserPromoted
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : isUserDemoted
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
            }`}
          >
            {isUserPromoted ? "🚀" : isUserDemoted ? "⚠️" : "🛡️"}
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className={`font-black text-xs truncate ${
                isUserPromoted
                  ? "text-emerald-300"
                  : isUserDemoted
                  ? "text-rose-300"
                  : "text-blue-300"
              }`}
            >
              {isUserPromoted
                ? "¡En Zona de Ascenso al Top 3!"
                : isUserDemoted
                ? "¡Alerta de Descenso! Practica para subir"
                : "Estás en Zona Segura"}
            </span>
            <span className="text-[11px] text-slate-400 truncate">
              {nextTargetLearner && userRank > 1
                ? `A ${xpNeededForNextRank} XP de superar a ${nextTargetLearner.name.split(" ")[0]} (#${userRank - 1})`
                : "¡Lideras la división con puntuación máxima!"}
            </span>
          </div>
        </div>

        {/* User live position pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 font-black text-xs text-amber-300 shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Puesto #{userRank}</span>
        </div>
      </div>

      {/* 3. Filter Navigation Tabs */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => {
              soundFx.playPop();
              haptics.light();
              setFilterView("all");
            }}
            className={`px-2.5 py-1 rounded-lg font-extrabold transition ${
              filterView === "all"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Top Activos
          </button>
          <button
            onClick={() => {
              soundFx.playPop();
              haptics.light();
              setFilterView("my_zone");
            }}
            className={`px-2.5 py-1 rounded-lg font-extrabold transition ${
              filterView === "my_zone"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Mi Zona
          </button>
          <button
            onClick={() => {
              soundFx.playPop();
              haptics.light();
              setFilterView("rewards");
            }}
            className={`px-2.5 py-1 rounded-lg font-extrabold transition ${
              filterView === "rewards"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Premios (+{currentLeague.promotionRewardGems}💎)
          </button>
        </div>

        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline-block">
          Puntos Semanales
        </span>
      </div>

      {/* 4. Active Learners Rank List */}
      <div className="p-3 sm:p-4 space-y-2">
        {filterView === "rewards" ? (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                Recompensas de Fin de Temporada
              </span>
              <span className="text-emerald-400 font-black">+{currentLeague.promotionRewardGems} Gemas</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="text-base font-black text-amber-400">1° Lugar</div>
                <div className="text-[11px] text-amber-200 font-bold mt-1">+100 💎 + Insignia Oro</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-400/10 border border-slate-400/30">
                <div className="text-base font-black text-slate-300">2° Lugar</div>
                <div className="text-[11px] text-slate-300 font-bold mt-1">+75 💎 + Ascenso</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-700/10 border border-amber-700/30">
                <div className="text-base font-black text-amber-600">3° Lugar</div>
                <div className="text-[11px] text-amber-300 font-bold mt-1">+50 💎 + Ascenso</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center font-semibold">
              Los 3 mejores estudiantes de cada semana ascienden a la división superior.
            </p>
          </div>
        ) : (
          displayedLearners.map((learner) => {
            const actualRank = learners.findIndex((l) => l.id === learner.id) + 1;
            const isTop3 = actualRank <= 3;
            const isUser = learner.isUser;
            const hasKudos = sentKudos[learner.id];

            return (
              <motion.div
                key={learner.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border-2 transition-all ${
                  isUser
                    ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-600/20 border-amber-400/60 shadow-md ring-1 ring-amber-400/30"
                    : isTop3
                    ? "bg-slate-950/90 border-slate-800 hover:border-slate-700"
                    : "bg-slate-950/60 border-slate-800/70 hover:border-slate-700"
                }`}
              >
                {/* Left: Rank, Avatar, Name & Live Dynamic Badges */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {/* Rank Badge with Crown / Medal Icons */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      actualRank === 1
                        ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30 font-black"
                        : actualRank === 2
                        ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 shadow-sm"
                        : actualRank === 3
                        ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-sm"
                        : "bg-slate-800/90 text-slate-400"
                    }`}
                  >
                    {actualRank === 1 ? <Crown className="w-4 h-4 fill-slate-950" /> : actualRank}
                  </div>

                  {/* Avatar with Online Activity Indicator */}
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-lg sm:text-xl shadow-xs">
                      {learner.avatar}
                    </div>
                    {learner.isOnlineNow && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"
                        title="En línea practicando"
                      />
                    )}
                  </div>

                  {/* Learner Name & Dynamic Badge Cluster */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs sm:text-sm font-black truncate ${
                          isUser ? "text-amber-300" : "text-white"
                        }`}
                      >
                        {learner.name}
                      </span>
                      {isUser && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black text-[9px]">
                          TÚ
                        </span>
                      )}
                      {learner.statusBadge && (
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[9px] font-black border truncate hidden sm:inline-block ${
                            actualRank === 1
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : isTop3
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {learner.statusBadge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5 flex-wrap">
                      <span className="flex items-center gap-0.5 text-orange-400 font-bold">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        {learner.streak}d
                      </span>
                      {learner.accuracyRate && (
                        <span className="text-slate-400 hidden xs:inline-block">
                          {learner.accuracyRate}% precisión
                        </span>
                      )}
                      {learner.dailyXpGain && (
                        <span className="text-emerald-400 font-bold">
                          +{learner.dailyXpGain} XP hoy
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: XP Counter & Interactive Kudos Button */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {!isUser && (
                    <button
                      type="button"
                      onClick={(e) => handleSendKudo(learner.id, e)}
                      className={`p-1.5 rounded-xl border transition active:scale-90 ${
                        hasKudos
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30"
                      }`}
                      title={hasKudos ? "¡Ánimo enviado!" : "Enviar aplauso / ánimo"}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          hasKudos ? "fill-rose-400 text-rose-400 animate-bounce" : ""
                        }`}
                      />
                    </button>
                  )}

                  <div className="flex flex-col items-end">
                    <span className="text-xs sm:text-sm font-mono font-black text-white">
                      {learner.xp} <span className="text-[10px] text-amber-400 font-sans">XP</span>
                    </span>
                    {isTop3 && (
                      <span className="text-[9px] font-black text-emerald-400 flex items-center gap-0.5">
                        <ArrowUp className="w-2.5 h-2.5" /> Ascenso
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 5. Bottom Toggle: Expand/Collapse or Action Trigger */}
      {filterView !== "rewards" && learners.length > 4 && (
        <div className="px-4 py-3 border-t-2 border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              haptics.light();
              setIsExpanded(!isExpanded);
            }}
            className="text-xs font-black text-slate-300 hover:text-white flex items-center gap-1.5 transition"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 text-amber-400" />
                <span>Mostrar menos</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-amber-400" />
                <span>Ver los 8 estudiantes activos</span>
              </>
            )}
          </button>

          {onOpenFullLeaderboard && (
            <button
              type="button"
              onClick={() => {
                soundFx.playSuccess();
                haptics.medium();
                onOpenFullLeaderboard();
              }}
              className="text-xs font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>Ver Liga Completa</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
