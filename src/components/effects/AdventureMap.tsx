import React from "react";
import { AdventureLevel, LevelStatus } from "../../utils/useAdventureProgress";
import { playCoinSound, playJumpSound, playErrorSoft } from "../../utils/audioSynth";
import { fireParticles } from "../../utils/particleHelper";
import { Lock, Star, Sparkles, Crown, Trophy } from "lucide-react";

interface AdventureMapProps {
  levels: AdventureLevel[];
  currentLevelId: string;
  onSelectLevel: (level: AdventureLevel) => void;
  selectedMascotName?: string;
  selectedMascotEmoji?: string;
  totalStars?: number;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  levels,
  currentLevelId,
  onSelectLevel,
  selectedMascotEmoji = "🦖",
  totalStars = 0,
}) => {
  // Patrón en Zig-Zag serpenteante (Izquierda -> Centro -> Derecha -> Centro -> Izquierda)
  const getAlignmentClass = (index: number) => {
    const cycle = index % 4;
    switch (cycle) {
      case 0:
        return "self-center sm:self-start sm:ml-12";
      case 1:
        return "self-center sm:self-center";
      case 2:
        return "self-center sm:self-end sm:mr-12";
      case 3:
      default:
        return "self-center sm:self-center";
    }
  };

  const handleNodeClick = (level: AdventureLevel, status: LevelStatus, e: React.MouseEvent) => {
    if (status === "locked") {
      playErrorSoft();
      return;
    }

    if (status === "unlocked") {
      playJumpSound();
      fireParticles(e.clientX, e.clientY, "stars", 30);
    } else {
      playCoinSound();
      fireParticles(e.clientX, e.clientY, "confetti", 25);
    }

    onSelectLevel(level);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto py-8 px-4 flex flex-col items-center">
      {/* Marcador Superior de Estrellas Totales (Estilo Nintendo Glass) */}
      <div className="w-full flex items-center justify-between mb-8 px-5 py-3 rounded-2xl bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/90 text-amber-950 flex items-center justify-center font-black shadow-md">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Adventure Path</p>
            <p className="text-sm font-black text-white">Island Levels</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
          <span className="font-black text-base">{totalStars}</span>
          <span className="text-xs font-bold opacity-75">/ {levels.length * 3}</span>
        </div>
      </div>

      {/* Contenedor del Sendero Serpenteante */}
      <div className="relative w-full flex flex-col items-center gap-14 sm:gap-16">
        {/* Línea Conectora de Fondo (Camino punteado) */}
        <div className="absolute top-10 bottom-10 left-1/2 w-1 -translate-x-1/2 border-l-4 border-dashed border-amber-400/30 dark:border-white/20 pointer-events-none z-0" />

        {levels.map((lvl, index) => {
          const isCurrent = lvl.id === currentLevelId || (lvl.status === "unlocked" && index === 0);
          const isCompleted = lvl.status === "completed";
          const isLocked = lvl.status === "locked";
          const alignment = getAlignmentClass(index);

          return (
            <div
              key={lvl.id}
              className={`relative z-10 flex flex-col items-center group transition-all duration-300 ${alignment}`}
            >
              {/* Mascota Acompañante sobre el Nivel Actual */}
              {isCurrent && (
                <div className="absolute -top-12 z-20 flex flex-col items-center animate-bounce">
                  <div className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black tracking-wider shadow-lg flex items-center gap-1 border border-amber-200">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>HERE!</span>
                  </div>
                  <span className="text-2xl filter drop-shadow-md">{selectedMascotEmoji}</span>
                </div>
              )}

              {/* Botón Circular del Nodo (Level Node) */}
              <button
                onClick={(e) => handleNodeClick(lvl, lvl.status, e)}
                disabled={isLocked}
                className={`
                  relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center
                  transform transition-all duration-200 ease-out select-none
                  focus:outline-none focus:ring-4
                  ${
                    isLocked
                      ? "bg-slate-800/80 text-slate-500 border-4 border-slate-700 shadow-inner cursor-not-allowed opacity-60"
                      : isCompleted
                      ? "bg-gradient-to-b from-emerald-400 to-teal-600 text-white border-4 border-emerald-300 shadow-[0_8px_0_#065f46] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_#065f46] cursor-pointer"
                      : "bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 text-amber-950 border-4 border-amber-200 shadow-[0_8px_0_#c2410c] hover:brightness-110 hover:scale-105 active:translate-y-1 active:shadow-[0_2px_0_#c2410c] ring-4 ring-amber-400/40 cursor-pointer animate-pulse"
                  }
                `}
              >
                {/* Corona de Jefe Final */}
                {lvl.isBoss && (
                  <div className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg border-2 border-amber-200">
                    <Crown className="w-4 h-4" />
                  </div>
                )}

                {/* Ícono de Estado o Emoji del Nivel */}
                {isLocked ? (
                  <Lock className="w-8 h-8 opacity-70" />
                ) : (
                  <>
                    <span className="text-2xl sm:text-3xl filter drop-shadow">{lvl.emoji}</span>
                    <span className="text-[10px] sm:text-xs font-black tracking-tighter uppercase mt-0.5">
                      Lvl {index + 1}
                    </span>
                  </>
                )}

                {/* Estrellas Flotantes para Niveles Completados */}
                {isCompleted && (
                  <div className="absolute -bottom-3 flex items-center gap-0.5 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-400/40 shadow-lg">
                    {[1, 2, 3].map((starNum) => (
                      <Star
                        key={starNum}
                        className={`w-3.5 h-3.5 ${
                          starNum <= lvl.stars
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-700 text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>

              {/* Título y Descripción del Nivel */}
              <div className="mt-3 text-center max-w-[140px]">
                <p
                  className={`text-xs sm:text-sm font-black tracking-tight leading-tight ${
                    isLocked ? "text-slate-500" : isCompleted ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {lvl.title}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  {lvl.spanishTitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
