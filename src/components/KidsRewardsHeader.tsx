import React from "react";
import { Coins, Star, Flame, Sparkles, Lock } from "lucide-react";
import { useKidsProgress } from "../hooks/useKidsProgress";

export interface KidsRewardsHeaderProps {
  className?: string;
  onOpenParentGate?: () => void;
}

export const KidsRewardsHeader: React.FC<KidsRewardsHeaderProps> = ({
  className = "",
  onOpenParentGate,
}) => {
  const { coins, stars, streakDays } = useKidsProgress();

  return (
    <div
      className={`inline-flex items-center gap-2 sm:gap-3 px-3 py-1.5 bg-amber-950/40 backdrop-blur-md rounded-2xl border border-amber-400/30 shadow-lg select-none ${className}`}
    >
      {/* MONEDAS DE ORO */}
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 px-2.5 py-1 rounded-xl border border-amber-400/40">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-md animate-bounce">
          <Coins className="w-3.5 h-3.5 text-amber-950 stroke-[2.5]" />
        </div>
        <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wide font-mono">
          {coins}
        </span>
      </div>

      {/* ESTRELLAS MÁGICAS */}
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 px-2.5 py-1 rounded-xl border border-indigo-400/40">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-300 to-purple-500 flex items-center justify-center shadow-md">
          <Star className="w-3.5 h-3.5 text-indigo-950 fill-indigo-200 stroke-[2.5]" />
        </div>
        <span className="text-xs sm:text-sm font-black text-indigo-200 tracking-wide font-mono">
          {stars}
        </span>
      </div>

      {/* RACHA DE DÍAS (LLAMA ANIMADA) */}
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500/20 to-orange-500/10 px-2.5 py-1 rounded-xl border border-rose-400/40">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md animate-pulse">
          <Flame className="w-3.5 h-3.5 text-white fill-orange-200 stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-0.5">
          <span className="text-xs sm:text-sm font-black text-rose-300 tracking-wide font-mono">
            {streakDays}
          </span>
          <span className="text-[10px] font-bold text-rose-300/80 hidden sm:inline">días</span>
        </div>
      </div>

      {/* BOTÓN DISCRETO PANEL PARENTAL */}
      {onOpenParentGate && (
        <button
          type="button"
          onClick={onOpenParentGate}
          className="ml-1 p-1.5 rounded-full bg-amber-900/30 text-amber-400/60 hover:text-amber-300 hover:bg-amber-800/40 transition cursor-pointer"
          title="Panel de Control Parental"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
export default KidsRewardsHeader;
