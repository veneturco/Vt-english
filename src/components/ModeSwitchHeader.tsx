import React, { useState } from "react";
import { Sparkles, Briefcase, Gamepad2, Lock } from "lucide-react";
import { RoleplayImmersionModal } from "./RoleplayImmersionModal";
import { KidsInteractiveMissionModal } from "./KidsInteractiveMissionModal";
import { KidsRewardsHeader } from "./KidsRewardsHeader";
import { ParentGate } from "./ParentGate";
import { ParentDashboard } from "./ParentDashboard";

export const ModeSwitchHeader: React.FC = () => {
  const [appMode, setAppMode] = useState<"adults" | "kids">("kids");
  const [isAdultModalOpen, setIsAdultModalOpen] = useState(false);
  const [isKidsModalOpen, setIsKidsModalOpen] = useState(false);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [isParentDashboardOpen, setIsParentDashboardOpen] = useState(false);

  const handleOpenActiveModal = () => {
    if (appMode === "kids") {
      setIsKidsModalOpen(true);
    } else {
      setIsAdultModalOpen(true);
    }
  };

  const handleParentGateSuccess = () => {
    setIsParentGateOpen(false);
    setIsParentDashboardOpen(true);
  };

  return (
    <div className="w-full flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white select-none gap-1.5 sm:gap-3">
      {/* LOGO & RECOMPENSAS */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <span className="text-base sm:text-lg">🚀</span>
          <span className="font-black tracking-tight text-xs sm:text-sm bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
            BTI <span className="hidden sm:inline">English</span>
          </span>
        </div>

        {/* Header de Recompensas si está en Modo Niños */}
        {appMode === "kids" && (
          <KidsRewardsHeader onOpenParentGate={() => setIsParentGateOpen(true)} />
        )}
      </div>

      {/* SELECTOR DE MODO & BOTÓN ACCIÓN */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* SELECTOR DE MODO */}
        <div className="flex items-center bg-slate-950 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-800 shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => setAppMode("kids")}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              appMode === "kids"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Gamepad2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Niños</span>
            <span className="xs:hidden">🦖</span>
            <span className="hidden sm:inline">🦖</span>
          </button>

          <button
            type="button"
            onClick={() => setAppMode("adults")}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              appMode === "adults"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Adultos</span>
            <span className="xs:hidden">💼</span>
            <span className="hidden sm:inline">💼</span>
          </button>
        </div>

        {/* BOTÓN PRINCIPAL PARA PRACTICAR / JUGAR */}
        <button
          type="button"
          onClick={handleOpenActiveModal}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
            appMode === "kids"
              ? "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-amber-500/20 ring-1 sm:ring-2 ring-amber-400/40 animate-pulse"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
          }`}
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {appMode === "kids" ? (
            <>
              <span className="sm:hidden">¡Jugar!</span>
              <span className="hidden sm:inline">¡Jugar con Rexy!</span>
            </>
          ) : (
            <>
              <span className="sm:hidden">Roleplay</span>
              <span className="hidden sm:inline">Práctica Roleplay</span>
            </>
          )}
        </button>
      </div>

      {/* MODALES */}
      <RoleplayImmersionModal
        isOpen={isAdultModalOpen}
        onClose={() => setIsAdultModalOpen(false)}
      />

      <KidsInteractiveMissionModal
        isOpen={isKidsModalOpen}
        onClose={() => setIsKidsModalOpen(false)}
      />

      <ParentGate
        isOpen={isParentGateOpen}
        onSuccess={handleParentGateSuccess}
        onClose={() => setIsParentGateOpen(false)}
      />

      <ParentDashboard
        isOpen={isParentDashboardOpen}
        onClose={() => setIsParentDashboardOpen(false)}
        studentName="Amir Yasir"
      />
    </div>
  );
};
export default ModeSwitchHeader;
