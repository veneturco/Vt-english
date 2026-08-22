import React from "react";
import { MessageSquare, Map, Grid, Sparkles, Smile } from "lucide-react";

export type MainAppTab = "chat" | "path" | "tools";

interface BottomNavBarProps {
  activeTab: MainAppTab;
  onTabChange: (tab: MainAppTab) => void;
  onOpenAvatarModal?: () => void;
  onSwitchToKidsMode?: () => void;
}

export function BottomNavBar({
  activeTab,
  onTabChange,
  onOpenAvatarModal,
  onSwitchToKidsMode,
}: BottomNavBarProps) {
  return (
    <nav
      id="bottom-nav-bar"
      aria-label="Navegación Principal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t-2 border-slate-800 px-3 sm:px-6 py-2 flex items-center justify-between max-w-xl mx-auto sm:rounded-t-3xl shadow-none select-none"
    >
      {/* 1. Hablar / Conversar */}
      <button
        type="button"
        id="nav-tab-chat"
        onClick={() => onTabChange("chat")}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-150 active:translate-y-0.5 ${
          activeTab === "chat"
            ? "text-emerald-400 font-extrabold"
            : "text-slate-400 hover:text-slate-200 font-semibold"
        }`}
      >
        <div
          className={`p-1.5 rounded-xl border-2 transition-all ${
            activeTab === "chat"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
              : "text-slate-400 border-transparent hover:bg-slate-800"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
        </div>
        <span className="text-[11px] tracking-wide">Conversar</span>
      </button>

      {/* 2. Tutores 3D Direct Trigger Button */}
      {onOpenAvatarModal && (
        <button
          type="button"
          id="nav-tab-tutors"
          onClick={onOpenAvatarModal}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-slate-400 hover:text-amber-400 font-semibold transition-all duration-150 active:translate-y-0.5"
        >
          <div className="p-1.5 rounded-xl border-2 border-transparent hover:bg-slate-800 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 transition-all">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[11px] tracking-wide">Tutores</span>
        </button>
      )}

      {/* 3. Camino de Aprendizaje */}
      <button
        type="button"
        id="nav-tab-path"
        onClick={() => onTabChange("path")}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-150 active:translate-y-0.5 ${
          activeTab === "path"
            ? "text-emerald-400 font-extrabold"
            : "text-slate-400 hover:text-slate-200 font-semibold"
        }`}
      >
        <div
          className={`p-1.5 rounded-xl border-2 transition-all ${
            activeTab === "path"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
              : "text-slate-400 border-transparent hover:bg-slate-800"
          }`}
        >
          <Map className="w-5 h-5" />
        </div>
        <span className="text-[11px] tracking-wide">Camino</span>
      </button>

      {/* 4. Modo Niños Direct Access Button */}
      {onSwitchToKidsMode && (
        <button
          type="button"
          id="nav-tab-kids"
          onClick={onSwitchToKidsMode}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-amber-300 hover:text-amber-200 font-bold transition-all duration-150 active:translate-y-0.5 group"
          title="Ir al Modo Niños (Mario, Luigi y Leo)"
        >
          <div className="p-1.5 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-300 group-hover:scale-105 transition-transform">
            <span className="text-base leading-none">🍄</span>
          </div>
          <span className="text-[11px] tracking-wide text-amber-300">Niños</span>
        </button>
      )}

      {/* 5. Herramientas & Práctica */}
      <button
        type="button"
        id="nav-tab-tools"
        onClick={() => onTabChange("tools")}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-150 active:translate-y-0.5 ${
          activeTab === "tools"
            ? "text-emerald-400 font-extrabold"
            : "text-slate-400 hover:text-slate-200 font-semibold"
        }`}
      >
        <div
          className={`p-1.5 rounded-xl border-2 transition-all ${
            activeTab === "tools"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
              : "text-slate-400 border-transparent hover:bg-slate-800"
          }`}
        >
          <Grid className="w-5 h-5" />
        </div>
        <span className="text-[11px] tracking-wide">Práctica</span>
      </button>
    </nav>
  );
}
