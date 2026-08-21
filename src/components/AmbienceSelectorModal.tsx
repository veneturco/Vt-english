import React from "react";
import { ambienceEngine } from "../utils/ambience";
import { Volume2, VolumeX, Coffee, Plane, CloudRain, Briefcase, Sparkles, X } from "lucide-react";

interface AmbienceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: string;
  onModeChange: (mode: "cafe" | "airport" | "rain" | "office" | "off") => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const AmbienceSelectorModal: React.FC<AmbienceSelectorModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onModeChange,
  volume,
  onVolumeChange,
}) => {
  if (!isOpen) return null;

  const ambiences = [
    {
      id: "cafe" as const,
      name: "Cafetería Acogedora",
      desc: "Murmullo suave y calidez de tazas de café",
      icon: Coffee,
      color: "from-amber-600 to-orange-700",
    },
    {
      id: "airport" as const,
      name: "Terminal de Aeropuerto",
      desc: "Ambiente internacional y anuncios lejanos",
      icon: Plane,
      color: "from-sky-600 to-blue-700",
    },
    {
      id: "rain" as const,
      name: "Lluvia de Fondo",
      desc: "Lluvia suave relajante para máxima concentración",
      icon: CloudRain,
      color: "from-teal-600 to-cyan-700",
    },
    {
      id: "office" as const,
      name: "Oficina / Tech Hub",
      desc: "Murmullo productivo de espacio de trabajo",
      icon: Briefcase,
      color: "from-indigo-600 to-slate-700",
    },
    {
      id: "off" as const,
      name: "Silencio Total (Apagado)",
      desc: "Sin sonido de fondo ambiental",
      icon: VolumeX,
      color: "from-slate-700 to-slate-800",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Audio Espacial de Fondo</h3>
            <p className="text-xs text-slate-400">Simulación acústica para acostumbrarte al mundo real</p>
          </div>
        </div>

        {/* Volume Slider */}
        {currentMode !== "off" && (
          <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800 mb-4">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-medium">
              <span>Volumen de ambiente:</span>
              <span className="text-cyan-400 font-mono font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const newVol = parseFloat(e.target.value);
                onVolumeChange(newVol);
                ambienceEngine.setVolume(newVol);
              }}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Ambience Modes */}
        <div className="space-y-2.5 mb-5">
          {ambiences.map((amb) => {
            const Icon = amb.icon;
            const isSelected = currentMode === amb.id;
            return (
              <button
                key={amb.id}
                onClick={() => {
                  onModeChange(amb.id);
                  ambienceEngine.playAmbience(amb.id);
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? "bg-slate-800 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30"
                    : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${amb.color} flex items-center justify-center text-white shrink-0 shadow`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                      {amb.name}
                    </h4>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{amb.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition active:scale-95"
        >
          Aplicar y Continuar
        </button>
      </div>
    </div>
  );
};
