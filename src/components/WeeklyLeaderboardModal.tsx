import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Flame, Zap, Shield, ArrowUp, ArrowDown, Sparkles, X, Crown, Medal } from "lucide-react";
import { soundFx } from "../utils/soundFx";

interface WeeklyLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userXP: number;
  userName?: string;
  userStreak: number;
}

interface Competitor {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  isUser?: boolean;
  accuracyRate?: number;
  isOnline?: boolean;
  statusBadge?: string;
}

const LEAGUES = [
  { id: "bronze", name: "Liga Bronce", icon: "🥉", color: "from-amber-700 to-amber-900", border: "border-amber-700" },
  { id: "silver", name: "Liga Plata", icon: "🥈", color: "from-slate-400 to-slate-600", border: "border-slate-400" },
  { id: "gold", name: "Liga Oro", icon: "🥇", color: "from-amber-400 to-yellow-600", border: "border-amber-400" },
  { id: "ruby", name: "Liga Rubí", icon: "💎", color: "from-rose-500 to-pink-700", border: "border-rose-500" },
  { id: "diamond", name: "Liga Diamante", icon: "👑", color: "from-cyan-400 to-blue-600", border: "border-cyan-400" },
];

export const WeeklyLeaderboardModal: React.FC<WeeklyLeaderboardModalProps> = ({
  isOpen,
  onClose,
  userXP,
  userName = "Tú",
  userStreak,
}) => {
  const [selectedLeagueIndex, setSelectedLeagueIndex] = useState(2); // Gold league by default

  if (!isOpen) return null;

  const currentLeague = LEAGUES[selectedLeagueIndex];

  // Generate realistic leaderboard centered around the user's XP
  const baseXP = Math.max(userXP, 450);
  const competitors: Competitor[] = [
    { id: "comp_1", name: "Elena Rostova", avatar: "👩‍💼", xp: baseXP + 160, streak: 15, accuracyRate: 98, isOnline: true, statusBadge: "MVP Semanal" },
    { id: "comp_2", name: "Lucas Silva", avatar: "🧑‍💻", xp: baseXP + 95, streak: 9, accuracyRate: 95, isOnline: true, statusBadge: "Racha Imparable" },
    { id: "comp_3", name: "Maya Patel", avatar: "👩‍🔬", xp: baseXP + 40, streak: 12, accuracyRate: 92, isOnline: false, statusBadge: "Ascenso Inminente" },
    { id: "user", name: `${userName} (Tú)`, avatar: "⭐", xp: userXP, streak: userStreak, isUser: true, accuracyRate: 94, isOnline: true, statusBadge: "Tu Posición" },
    { id: "comp_4", name: "Carlos Mendoza", avatar: "👨‍🍳", xp: Math.max(20, baseXP - 45), streak: 7, accuracyRate: 89, isOnline: false, statusBadge: "Zona Segura" },
    { id: "comp_5", name: "Sophie Dupont", avatar: "👩‍🎨", xp: Math.max(15, baseXP - 95), streak: 5, accuracyRate: 91, isOnline: true, statusBadge: "Zona Segura" },
    { id: "comp_6", name: "Kenji Sato", avatar: "👨‍🚀", xp: Math.max(10, baseXP - 150), streak: 4, accuracyRate: 86, isOnline: false, statusBadge: "Riesgo de Descenso" },
    { id: "comp_7", name: "David Miller", avatar: "🧑‍🎓", xp: Math.max(5, baseXP - 210), streak: 2, accuracyRate: 82, isOnline: false, statusBadge: "Zona de Descenso" },
  ].sort((a, b) => b.xp - a.xp);

  const userRank = competitors.findIndex((c) => c.isUser) + 1;
  const isPromoted = userRank <= 3;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border-2 border-b-8 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-300">
                <Trophy className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                  <span>{currentLeague.icon}</span>
                  <span>{currentLeague.name}</span>
                </h3>
                <p className="text-[11px] font-bold text-slate-400">Termina en 2 días • Top 3 ascienden</p>
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

          {/* League Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border-2 border-slate-800 mb-3 overflow-x-auto no-scrollbar shrink-0">
            {LEAGUES.map((league, idx) => (
              <button
                key={league.id}
                onClick={() => {
                  soundFx.playPop();
                  setSelectedLeagueIndex(idx);
                }}
                className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition shrink-0 ${
                  selectedLeagueIndex === idx
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span>{league.icon}</span>
                <span>{league.name.replace("Liga ", "")}</span>
              </button>
            ))}
          </div>

          {/* User Promotion Status Card */}
          <div
            className={`p-3 rounded-2xl border-2 flex items-center justify-between mb-3 shrink-0 ${
              isPromoted
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-slate-950 border-slate-800 text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{isPromoted ? "🚀" : "⚡"}</span>
              <div className="flex flex-col">
                <span className="text-xs font-black">
                  {isPromoted ? "¡Estás en Zona de Ascenso!" : "Asciende al Top 3 para subir de Liga"}
                </span>
                <span className="text-[10px] text-slate-400">
                  Tu puesto actual: <strong className="text-white">#{userRank}</strong> con{" "}
                  <strong className="text-amber-400">{userXP} XP</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-black bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span>{userStreak}d</span>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1">
            {competitors.map((comp, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const isUserItem = comp.isUser;

              return (
                <div
                  key={comp.id}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border-2 transition ${
                    isUserItem
                      ? "bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-400/40"
                      : "bg-slate-950 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        rank === 1
                          ? "bg-amber-400 text-slate-950 shadow-sm"
                          : rank === 2
                          ? "bg-slate-300 text-slate-950"
                          : rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {rank}
                    </div>

                    {/* Avatar Emoji with online pulse */}
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-base">
                        {comp.avatar}
                      </div>
                      {comp.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900 animate-pulse" />
                      )}
                    </div>

                    {/* Name & Dynamic Badges */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-black truncate ${isUserItem ? "text-amber-300" : "text-white"}`}>
                          {comp.name}
                        </span>
                        {comp.statusBadge && (
                          <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black border truncate hidden sm:inline-block ${
                            rank === 1
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : isTop3
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {comp.statusBadge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span className="flex items-center gap-0.5 text-orange-400 font-bold">
                          <Flame className="w-3 h-3 fill-orange-400" /> {comp.streak}d
                        </span>
                        {comp.accuracyRate && (
                          <span>• {comp.accuracyRate}% precisión</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isTop3 && (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                        +50 💎
                      </span>
                    )}
                    <span className="text-xs font-mono font-black text-white">{comp.xp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Note */}
          <div className="pt-3 border-t-2 border-slate-800 mt-2 text-center shrink-0">
            <button
              onClick={() => {
                soundFx.playSuccess();
                onClose();
              }}
              className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-b-4 border-amber-600 active:border-b-2 active:translate-y-0.5 transition shadow-sm"
            >
              ¡Seguir Practicando para Ascender!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
