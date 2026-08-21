import React from "react";
import { playCoinSound, playJumpSound } from "../../utils/audioSynth";
import { fireParticles } from "../../utils/particleHelper";

interface BouncyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "amber";
  soundEffect?: "coin" | "jump" | "none";
  spawnParticlesOnClick?: boolean;
  children: React.ReactNode;
}

export const BouncyButton: React.FC<BouncyButtonProps> = ({
  variant = "primary",
  soundEffect = "coin",
  spawnParticlesOnClick = false,
  className = "",
  onClick,
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "amber":
        return "bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 shadow-[0_6px_0_#b45309] active:shadow-[0_2px_0_#b45309] border-2 border-amber-300";
      case "success":
        return "bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-[0_6px_0_#047857] active:shadow-[0_2px_0_#047857] border-2 border-emerald-300";
      case "danger":
        return "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_6px_0_#be123c] active:shadow-[0_2px_0_#be123c] border-2 border-rose-400";
      case "secondary":
        return "bg-gradient-to-b from-slate-700 to-slate-800 text-slate-100 shadow-[0_6px_0_#1e293b] active:shadow-[0_2px_0_#1e293b] border-2 border-slate-600";
      case "primary":
      default:
        return "bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-[0_6px_0_#1d4ed8] active:shadow-[0_2px_0_#1d4ed8] border-2 border-sky-300";
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Audio procedual instantáneo
    if (soundEffect === "coin") playCoinSound();
    else if (soundEffect === "jump") playJumpSound();

    // 2. Ráfaga opcional de partículas
    if (spawnParticlesOnClick) {
      fireParticles(e.clientX, e.clientY, "confetti", 25);
    }

    if (onClick) onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative px-6 py-3.5 rounded-2xl font-black tracking-wide
        transform transition-all duration-150 ease-out select-none
        hover:brightness-110 hover:-translate-y-0.5
        active:translate-y-1 active:scale-95 active:brightness-95
        focus:outline-none focus:ring-4 focus:ring-amber-400/40
        ${getVariantStyles()}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
