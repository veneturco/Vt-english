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
      className={`inline-flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-1 bg-amber-950/40 backdrop-blur-md rounded-xl sm:rounded-2xl border border-amber-400/30 shadow-md select-none shrink-0 ${className}`}
    >
      {/* MONEDAS DE ORO */}
      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-amber-400/30">
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-xs">
          <Coins className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-950 stroke-[2.5]" />
        </div>
        <span className="text-[11px] sm:text-xs font-black text-amber-300 tracking-tight font-mono">
          {coins}
        </span>
      </div>

      {/* ESTRELLAS MÁGICAS */}
      <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-indigo-400/30">
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-indigo-300 to-purple-500 flex items-center justify-center shadow-xs">
          <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-indigo-950 fill-indigo-200 stroke-[2.5]" />
        </div>
        <span className="text-[11px] sm:text-xs font-black text-indigo-200 tracking-tight font-mono">
          {stars}
        </span>
      </div>

      {/* RACHA DE DÍAS (LLAMA ANIMADA) */}
      <div className="flex items-center gap-1 bg-gradient-to-r from-rose-500/20 to-orange-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-rose-400/30">
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-xs animate-pulse">
          <Flame className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white fill-orange-200 stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-0.5">
          <span className="text-[11px] sm:text-xs font-black text-rose-300 tracking-tight font-mono">
            {streakDays}
          </span>
          <span className="text-[9px] font-bold text-rose-300/80 hidden md:inline">d</span>
        </div>
      </div>

      {/* BOTÓN DISCRETO PANEL PARENTAL */}
      {onOpenParentGate && (
        <button
          type="button"
          onClick={onOpenParentGate}
          className="p-1 sm:p-1.5 rounded-full bg-amber-900/40 text-amber-400/70 hover:text-amber-300 hover:bg-amber-800/50 transition cursor-pointer"
          title="Panel de Control Parental"
        >
          <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      )}
    </div>
  );
};
export default KidsRewardsHeader;
