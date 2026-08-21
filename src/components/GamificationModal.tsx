import React from "react";
import { X, Flame, Trophy, Award, Zap, CheckCircle2, Lock } from "lucide-react";
import { UserGamificationState } from "../types";

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamification: UserGamificationState;
}

const ACHIEVEMENTS = [
  {
    id: "first_word",
    title: "Primer Paso",
    desc: "Practica tu primera frase en inglés",
    icon: "🌱",
  },
  {
    id: "streak_3",
    title: "En Fuego",
    desc: "Mantén una racha de 3 días consecutivos",
    icon: "🔥",
  },
  {
    id: "perfect_score",
    title: "Oído Nativo",
    desc: "Obtén más de 90% en el medidor fonético",
    icon: "🎯",
  },
  {
    id: "speed_demon",
    title: "Reflejo Relámpago",
    desc: "Completa un Speed Challenge de 60s",
    icon: "⚡",
  },
  {
    id: "vocab_master",
    title: "Coleccionista",
    desc: "Guarda 10 términos en tu libreta",
    icon: "📚",
  },
];

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  gamification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#0d1117] border border-slate-700 shadow-2xl p-6 relative overflow-hidden flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Logros y Racha Diaria</h2>
              <p className="text-xs text-slate-400">Progreso y constancia de aprendizaje</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-500/15 to-transparent border border-amber-500/30 text-center">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto mb-1 animate-pulse" />
            <span className="text-[10px] text-slate-400 uppercase font-bold">Racha</span>
            <p className="text-xl font-black text-amber-300">{gamification.streakDays} Días</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-blue-500/15 to-transparent border border-blue-500/30 text-center">
            <Trophy className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-bold">Nivel</span>
            <p className="text-xl font-black text-blue-300">Nivel {gamification.level}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-emerald-500/15 to-transparent border border-emerald-500/30 text-center">
            <span className="text-xl block mb-1">💎</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Gemas</span>
            <p className="text-xl font-black text-emerald-300">{gamification.gems}</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="p-4 rounded-2xl bg-[#161b22] border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Experiencia hacia Nivel {gamification.level + 1}</span>
            <span className="text-slate-400 font-mono">{gamification.xpPoints % 100} / 100 XP</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 transition-all duration-500"
              style={{ width: `${(gamification.xpPoints % 100)}%` }}
            />
          </div>
        </div>

        {/* Achievements List */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Trofeos y Medallas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = gamification.unlockedAchievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    isUnlocked
                      ? "bg-slate-800/80 border-amber-500/40 shadow-sm"
                      : "bg-slate-900/40 border-slate-800/80 opacity-60"
                  }`}
                >
                  <div className="text-2xl p-2 rounded-xl bg-slate-800/90 border border-slate-700">
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate">{ach.title}</h4>
                      {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{ach.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
