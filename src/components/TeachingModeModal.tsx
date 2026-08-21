import React from "react";
import { X, GraduationCap, Globe, Drama, Mic, CheckCircle2, Sparkles } from "lucide-react";
import { TeachingMode } from "../types";
import { TEACHING_MODES } from "../data/presets";

interface TeachingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: TeachingMode;
  onSelectMode: (mode: TeachingMode) => void;
}

export const TeachingModeModal: React.FC<TeachingModeModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 text-blue-400" />;
      case "Globe":
        return <Globe className="w-5 h-5 text-emerald-400" />;
      case "Drama":
        return <Drama className="w-5 h-5 text-purple-400" />;
      case "Mic":
        return <Mic className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div
      id="teaching-mode-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="teaching-mode-modal"
        className="w-full max-w-xl bg-[#161b22] border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Metodología y Modo de Clase
              </h3>
              <p className="text-xs text-slate-400">
                Elige cómo interactúa tu profesora según tus metas de aprendizaje
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modes Grid */}
        <div className="grid grid-cols-1 gap-3">
          {TEACHING_MODES.map((mode) => {
            const isSelected = currentMode === mode.id;

            return (
              <div
                key={mode.id}
                onClick={() => {
                  onSelectMode(mode.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? "bg-blue-950/40 border-blue-500/80 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500/50"
                    : "bg-[#0d1117]/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0 mt-0.5">
                    {getIcon(mode.icon)}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-white">
                        {mode.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 font-semibold border border-slate-700">
                        {mode.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 mt-1">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Insight */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>💡 Puedes cambiar de modo en cualquier momento durante tu práctica.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
