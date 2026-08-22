import React from "react";
import {
  Flame,
  Compass,
  SlidersHorizontal,
  Sparkles,
  Layers,
  GraduationCap,
} from "lucide-react";
import { CEFRLevel, TeachingMode, UserStats } from "../types";
import { LEVEL_DEFINITIONS, TEACHING_MODES } from "../data/presets";

interface NavbarProps {
  currentLevel: CEFRLevel;
  teachingMode: TeachingMode;
  stats: UserStats;
  currentTopicTitle: string;
  streakDays: number;
  gemsCount: number;
  level: number;
  ambienceMode: string;
  onOpenAvatarCustomizer: () => void;
  onOpenLevelModal: () => void;
  onOpenTopicModal: () => void;
  onOpenTeachingModeModal: () => void;
  onOpenGamificationModal: () => void;
  onOpenToolsDrawer?: () => void;
  onOpenResearchRoadmap?: () => void;
  onOpenRoleplay?: () => void;
  onSwitchToKidsMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLevel,
  teachingMode,
  stats,
  currentTopicTitle,
  streakDays,
  gemsCount,
  level,
  ambienceMode,
  onOpenAvatarCustomizer,
  onOpenLevelModal,
  onOpenTopicModal,
  onOpenTeachingModeModal,
  onOpenGamificationModal,
  onOpenToolsDrawer,
  onOpenResearchRoadmap,
  onOpenRoleplay,
  onSwitchToKidsMode,
}) => {
  const levelInfo = LEVEL_DEFINITIONS[currentLevel] || LEVEL_DEFINITIONS.B1;
  const currentModeInfo =
    TEACHING_MODES.find((m) => m.id === teachingMode) || TEACHING_MODES[0];

  return (
    <header className="w-full bg-slate-900 border-b-2 border-slate-800 sticky top-0 z-30 px-2 sm:px-6 py-2 transition-all select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {/* Left: Brand Pill Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 p-1 pl-1.5 pr-3 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-sm">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-amber-400 flex items-center justify-center border border-amber-500">
              <span className="font-black text-slate-950 text-[10px] sm:text-xs tracking-tighter">
                VT
              </span>
            </div>
            <span className="font-black text-white text-xs sm:text-sm tracking-tight whitespace-nowrap">
              VT English
            </span>
          </div>
        </div>


        {/* Center: Context & Gamification Island */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Unified Topic & Level Pill */}
          <div className="flex items-center bg-slate-950 rounded-2xl border-2 border-slate-800 p-0.5 shadow-sm">
            {/* Topic Trigger */}
            <button
              id="nav-topic-button"
              onClick={onOpenTopicModal}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-slate-200 hover:text-amber-300 hover:bg-slate-800 transition active:translate-y-0.5 whitespace-nowrap"
              title="Cambiar escenario de conversación"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate max-w-[70px] sm:max-w-[140px]">
                {currentTopicTitle}
              </span>
            </button>

            <span className="w-px h-3.5 bg-slate-800" />

            {/* Level Trigger */}
            <button
              id="nav-level-button"
              onClick={onOpenLevelModal}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black text-slate-300 hover:text-white hover:bg-slate-800 transition active:translate-y-0.5"
              title="Cambiar nivel CEFR"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{currentLevel}</span>
            </button>
          </div>

          {/* Gamification Streak & Gems Pill */}
          <button
            onClick={onOpenGamificationModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-slate-950 hover:bg-slate-900 border-2 border-b-4 border-amber-500/50 active:border-b-2 active:translate-y-0.5 text-[11px] sm:text-xs font-black shadow-sm transition shrink-0"
            title={`Racha diaria: ${streakDays} días | Gemas: ${gemsCount}`}
          >
            <div className="flex items-center gap-1 text-orange-400">
              <Flame className="w-3.5 h-3.5 fill-orange-500 animate-pulse" />
              <span>{streakDays}</span>
            </div>
            <span className="w-px h-3.5 bg-slate-800" />
            <div className="flex items-center gap-1 text-amber-300">
              <span>💎</span>
              <span>{gemsCount}</span>
            </div>
          </button>
        </div>

        {/* Right: Consolidated Tools & Tutor Pill */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Switch to Kids Mode Button */}
          <button
            onClick={onSwitchToKidsMode}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 border-2 border-b-4 border-amber-500/50 active:border-b-2 active:translate-y-0.5 text-[11px] sm:text-xs font-black shadow-sm transition"
            title="Ir a Modo Niños"
          >
            <span>🍄</span>
            <span className="font-extrabold">Niños</span>
          </button>

          {/* Avatar Customizer Direct Access Button */}
          <button
            id="nav-avatar-customizer-button"
            onClick={onOpenAvatarCustomizer}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 border-2 border-b-4 border-amber-500/50 active:border-b-2 active:translate-y-0.5 text-[11px] sm:text-xs font-bold shadow-sm transition"
            title="Cambiar Tutor o Subir Foto HD"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tutores</span>
          </button>

          {/* Unified Tool Drawer / Settings Button */}
          {onOpenToolsDrawer && (
            <button
              id="nav-tools-button"
              onClick={onOpenToolsDrawer}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-slate-200 border-2 border-b-4 border-slate-700 active:border-b-2 active:translate-y-0.5 text-[11px] sm:text-xs font-bold shadow-sm transition"
              title="Abrir Centro de Herramientas y Modos"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Herramientas</span>
              {ambienceMode !== "off" && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

