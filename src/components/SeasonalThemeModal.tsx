import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Check, Wind, Calendar, CheckCircle2, ShieldCheck } from "lucide-react";
import { SeasonalThemeId, SeasonalThemeConfig } from "../types";
import {
  SEASONAL_THEMES,
  ParticleDensity,
  resolveSeasonalTheme,
  getSeasonFromDate,
} from "../utils/seasonalTheme";
import { soundFx } from "../utils/soundFx";

interface SeasonalThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: SeasonalThemeId;
  onSelectTheme: (themeId: SeasonalThemeId) => void;
  particlesEnabled: boolean;
  onToggleParticles: (enabled: boolean) => void;
  particleDensity: ParticleDensity;
  onChangeDensity: (density: ParticleDensity) => void;
}

export const SeasonalThemeModal: React.FC<SeasonalThemeModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  particlesEnabled,
  onToggleParticles,
  particleDensity,
  onChangeDensity,
}) => {
  if (!isOpen) return null;

  const resolved = resolveSeasonalTheme(currentThemeId);
  const autoDetectedSeason = getSeasonFromDate();
  const autoConfig = SEASONAL_THEMES[autoDetectedSeason];

  const themeList: (
    | SeasonalThemeConfig
    | {
        id: "auto";
        nameSpanish: string;
        seasonLabel: string;
        icon: string;
        description: string;
        holidayBadge: string;
        dateRangeLabel: string;
        colors: SeasonalThemeConfig["colors"];
      }
  )[] = [
    {
      id: "auto",
      nameSpanish: "Motor Automático por Calendario",
      seasonLabel: `Auto (${autoConfig.seasonLabel})`,
      icon: "📅",
      holidayBadge: `Sincronizado: ${autoConfig.nameSpanish}`,
      dateRangeLabel: "Cambia solo en cada solsticio / equinoccio",
      description: "Detecta automáticamente el día del año y ajusta la paleta de botones, bordes y partículas sin intervención manual.",
      colors: autoConfig.colors,
    },
    SEASONAL_THEMES.summer_glow,
    SEASONAL_THEMES.autumn_harvest,
    SEASONAL_THEMES.winter_holiday,
    SEASONAL_THEMES.spring_bloom,
    SEASONAL_THEMES.default_dark,
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl bg-slate-900 border-2 border-b-8 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>Motor de Paletas Estacionales</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                    <span>{resolved.icon}</span>
                    <span>{resolved.seasonLabel}</span>
                  </span>
                </h3>
                <p className="text-[11px] font-bold text-slate-400">
                  Ajuste automático de botones, bordes y acentos según el calendario real
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border-2 border-slate-700 transition"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time Status Card */}
          <div className="mb-3 p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Temporada actual:</span>
                  <span className="text-amber-300">{autoConfig.icon} {autoConfig.nameSpanish}</span>
                </div>
                <div className="text-[10px] font-medium text-slate-400">
                  {autoConfig.dateRangeLabel}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3 h-3" />
              <span>Activo 365 días</span>
            </span>
          </div>

          {/* Theme Grid */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
            {themeList.map((item) => {
              const isSelected = currentThemeId === item.id;
              const isAutoItem = item.id === "auto";

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFx.playSuccess();
                    onSelectTheme(item.id as SeasonalThemeId);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 transition relative overflow-hidden group flex flex-col gap-2 ${
                    isSelected
                      ? isAutoItem
                        ? "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.22)] ring-1 ring-amber-400"
                        : "bg-slate-950 border-amber-400/80 shadow-md ring-1 ring-amber-400"
                      : "bg-slate-950/80 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {/* Icon Circle */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 border-2 ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400/60 shadow-inner"
                            : "bg-slate-900 border-slate-800"
                        }`}
                      >
                        {item.icon}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs sm:text-sm font-black ${isSelected ? "text-white" : "text-slate-200"}`}>
                            {item.nameSpanish}
                          </span>
                          {item.holidayBadge && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-800/90 text-amber-300 border border-amber-500/30">
                              {item.holidayBadge}
                            </span>
                          )}
                        </div>
                        {item.dateRangeLabel && (
                          <span className="text-[10px] font-bold text-slate-500">
                            {item.dateRangeLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    <div
                      className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 border-2 transition ${
                        isSelected
                          ? "bg-amber-400 border-amber-300 text-slate-950"
                          : "border-slate-700 bg-slate-900 text-transparent group-hover:border-slate-600"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  {/* Description & Mini Swatch */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-850/60">
                    <p className="text-[11px] text-slate-400 line-clamp-1 flex-1 pr-2">
                      {item.description}
                    </p>
                    {/* Palette Swatches */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item.id === "winter_holiday" ? "#38bdf8" : item.id === "spring_bloom" ? "#34d399" : item.id === "summer_glow" ? "#fbbf24" : item.id === "autumn_harvest" ? "#f97316" : "#10b981" }} title="Acento primario" />
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item.id === "winter_holiday" ? "#06b6d4" : item.id === "spring_bloom" ? "#14b8a6" : item.id === "summer_glow" ? "#f59e0b" : item.id === "autumn_harvest" ? "#ea580c" : "#059669" }} title="Gradiente botón" />
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item.id === "winter_holiday" ? "#bae6fd" : item.id === "spring_bloom" ? "#fbcfe8" : item.id === "summer_glow" ? "#fef08a" : item.id === "autumn_harvest" ? "#fed7aa" : "#a7f3d0" }} title="Acento suave" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Particle Settings Box */}
          <div className="mt-3 p-3 rounded-2xl bg-slate-950 border-2 border-slate-800 shrink-0 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">Partículas de Ambiente Flotantes</span>
              </div>
              <button
                onClick={() => {
                  soundFx.playPop();
                  onToggleParticles(!particlesEnabled);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black border-2 transition ${
                  particlesEnabled
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-900 border-slate-700 text-slate-500"
                }`}
              >
                {particlesEnabled ? "Activadas ✓" : "Pausadas ✗"}
              </button>
            </div>

            {particlesEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <span className="text-[11px] font-bold text-slate-400">Densidad de partículas:</span>
                <div className="flex items-center gap-1.5">
                  {(["subtle", "normal", "festive"] as ParticleDensity[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        soundFx.playPop();
                        onChangeDensity(d);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black border-2 capitalize transition ${
                        particleDensity === d
                          ? "bg-amber-500/20 border-amber-400 text-amber-200"
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {d === "subtle" ? "Suave" : d === "normal" ? "Normal" : "Festivo ✨"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t-2 border-slate-800 mt-2 text-center shrink-0">
            <button
              onClick={() => {
                soundFx.playSuccess();
                onClose();
              }}
              className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-b-4 border-amber-600 active:border-b-2 active:translate-y-0.5 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Configuración y Continuar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

