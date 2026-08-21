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
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-2xl border-t border-white/[0.08] px-3 sm:px-6 py-2 flex items-center justify-between max-w-xl mx-auto sm:rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.8)]"
    >
      {/* 1. Hablar / Conversar */}
      <button
        type="button"
        id="nav-tab-chat"
        onClick={() => onTabChange("chat")}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all duration-200 ${
          activeTab === "chat"
            ? "text-amber-400 font-extrabold scale-105"
            : "text-slate-400 hover:text-slate-200 font-semibold"
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all ${
            activeTab === "chat"
              ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              : "text-slate-400 hover:bg-white/[0.05]"
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
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl text-slate-400 hover:text-amber-300 font-semibold transition-all duration-200 active:scale-95"
        >
          <div className="p-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-white/[0.05] transition-all">
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
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all duration-200 ${
          activeTab === "path"
            ? "text-amber-400 font-extrabold scale-105"
            : "text-slate-400 hover:text-slate-200 font-semibold"
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all ${
            activeTab === "path"
              ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              : "text-slate-400 hover:bg-white/[0.05]"
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
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl text-amber-300 hover:text-amber-200 font-bold transition-all duration-200 active:scale-95 group"
          title="Ir al Modo Niños (Mario, Luigi y Leo)"
        >
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-red-500/20 via-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
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
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all duration-200 ${
          activeTab === "tools"
            ? "text-amber-400 font-extrabold scale-105"
            : "text-slate-400 hover:text-slate-200 font-semibold"
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all ${
            activeTab === "tools"
              ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              : "text-slate-400 hover:bg-white/[0.05]"
          }`}
        >
          <Grid className="w-5 h-5" />
        </div>
        <span className="text-[11px] tracking-wide">Práctica</span>
      </button>
    </nav>
  );
}
