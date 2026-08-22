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
    <div className="w-full flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white select-none gap-2">
      {/* LOGO & RECOMPENSAS */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <span className="font-extrabold tracking-tight text-sm sm:text-base bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
            BTI English
          </span>
        </div>

        {/* Header de Recompensas si está en Modo Niños */}
        {appMode === "kids" && (
          <KidsRewardsHeader onOpenParentGate={() => setIsParentGateOpen(true)} />
        )}
      </div>

      {/* SELECTOR DE MODO & BOTÓN ACCIÓN */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => setAppMode("kids")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              appMode === "kids"
                ? "bg-amber-400 text-slate-950 shadow-md scale-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Modo Niños 🦖</span>
          </button>

          <button
            type="button"
            onClick={() => setAppMode("adults")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              appMode === "adults"
                ? "bg-indigo-600 text-white shadow-md scale-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Modo Adultos 💼</span>
          </button>
        </div>

        {/* BOTÓN DISCRETO DE CONTROL PARENTAL */}
        {appMode === "kids" && (
          <button
            type="button"
            onClick={() => setIsParentGateOpen(true)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-400/40 transition cursor-pointer shadow-inner"
            title="Panel de Control Parental (Amir Yasir)"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}

        {/* BOTÓN PRINCIPAL PARA PRACTICAR */}
        <button
          type="button"
          onClick={handleOpenActiveModal}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 cursor-pointer ${
            appMode === "kids"
              ? "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-amber-500/20 ring-2 ring-amber-400/40 animate-pulse"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{appMode === "kids" ? "¡Jugar con Rexy!" : "Práctica Roleplay"}</span>
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
