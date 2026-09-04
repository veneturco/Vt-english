import React from "react";
import { motion } from "motion/react";
import { GraduationCap, Sparkles } from "lucide-react";
import { AppExperienceMode } from "../types";
import { haptics } from "../utils/haptics";
import { soundFx } from "../utils/soundFx";

interface ModeSwitcherProps {
  currentMode: AppExperienceMode;
  onModeChange: (mode: AppExperienceMode) => void;
  className?: string;
  variant?: "navbar" | "compact" | "banner";
  showLabels?: boolean;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onModeChange,
  className = "",
  variant = "navbar",
  showLabels = true,
}) => {
  const isKids = currentMode === "kids";
  const isAdults = currentMode === "adults";

  const handleSelect = (mode: AppExperienceMode) => {
    if (mode === currentMode) return;
    try {
      haptics.medium();
      soundFx.playPop();
    } catch (e) {
      // Audio or haptic failure shouldn't prevent mode change
    }
    onModeChange(mode);
  };

  if (variant === "banner") {
    return (
      <div
        id="mode-switcher-banner"
        className={`w-full max-w-md mx-auto p-1.5 rounded-2xl bg-slate-950/90 border-2 border-slate-800 shadow-lg backdrop-blur-md flex items-center justify-between gap-1.5 select-none ${className}`}
      >
        {/* Adult Mode Tab */}
        <button
          type="button"
          id="mode-switch-adults-banner"
          onClick={() => handleSelect("adults")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 relative z-10 ${
            isAdults
              ? "text-emerald-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
          title="Modo Adultos: Conversación IA, Fonética y Camino B1/B2"
        >
          {isAdults && (
            <motion.div
              layoutId="active-mode-banner-pill"
              className="absolute inset-0 bg-slate-800 border-2 border-emerald-500/50 rounded-xl shadow-md -z-10"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
          <GraduationCap className={`w-4 h-4 ${isAdults ? "text-emerald-400" : "text-slate-400"}`} />
          <div className="flex flex-col text-left leading-tight">
            <span>Adultos</span>
            <span className="text-[9px] font-semibold text-slate-400">Conversación & CEFR</span>
          </div>
        </button>

        {/* Kids Mode Tab */}
        <button
          type="button"
          id="mode-switch-kids-banner"
          onClick={() => handleSelect("kids")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 relative z-10 ${
            isKids
              ? "text-amber-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
          title="Modo Niños: Aventuras, Minijuegos, Mario & Dinos"
        >
          {isKids && (
            <motion.div
              layoutId="active-mode-banner-pill"
              className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/60 rounded-xl shadow-md -z-10"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
          <span className="text-base leading-none">🍄</span>
          <div className="flex flex-col text-left leading-tight">
            <span className="flex items-center gap-1">
              <span>Niños</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            </span>
            <span className="text-[9px] font-semibold text-amber-400/80">Juegos & Mundos</span>
          </div>
        </button>
      </div>
    );
  }

  // Standard Header / Navbar Segmented Pill (High Visibility)
  return (
    <div
      id="mode-switcher-header"
      className={`inline-flex items-center p-0.5 sm:p-1 rounded-2xl bg-slate-950/95 border-2 border-slate-800 shadow-sm backdrop-blur-md select-none shrink-0 relative ${className}`}
      role="group"
      aria-label="Selector de Modo de Aprendizaje"
    >
      {/* Adult Mode Button */}
      <button
        type="button"
        id="mode-switch-btn-adults"
        onClick={() => handleSelect("adults")}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-150 relative z-20 cursor-pointer touch-manipulation select-none active:scale-95 ${
          isAdults
            ? "text-emerald-300 font-extrabold"
            : "text-slate-400 hover:text-slate-100"
        }`}
        title="Modo Adultos: Conversación IA, Lecciones CEFR y Fonética"
      >
        {isAdults && (
          <motion.div
            layoutId="active-mode-header-pill"
            className="absolute inset-0 bg-slate-800/90 border border-emerald-500/40 rounded-xl shadow-xs -z-10"
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
          />
        )}
        <GraduationCap className={`w-3.5 h-3.5 ${isAdults ? "text-emerald-400" : "text-slate-400"}`} />
        {showLabels && <span>Adultos</span>}
      </button>

      {/* Kids Mode Button */}
      <button
        type="button"
        id="mode-switch-btn-kids"
        onClick={() => handleSelect("kids")}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-150 relative z-10 cursor-pointer ${
          isKids
            ? "text-amber-300 font-extrabold"
            : "text-slate-400 hover:text-amber-300"
        }`}
        title="Modo Niños: Aventuras, Vocabulario y Minijuegos"
      >
        {isKids && (
          <motion.div
            layoutId="active-mode-header-pill"
            className="absolute inset-0 bg-gradient-to-r from-amber-500/25 to-orange-500/25 border border-amber-500/50 rounded-xl shadow-xs -z-10"
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
          />
        )}
        <span className="text-xs sm:text-sm leading-none">🍄</span>
        {showLabels && (
          <span className="flex items-center gap-0.5">
            <span>Niños</span>
            {isKids && <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />}
          </span>
        )}
      </button>
    </div>
  );
};
