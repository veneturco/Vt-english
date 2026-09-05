import React from "react";
import {
  Zap,
  Brain,
  AudioWaveform,
  Microscope,
  Volume2,
  BookOpen,
  History,
  Trophy,
  X,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Eye,
  Check,
} from "lucide-react";
import { AppTheme } from "../types";

interface ToolsDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpeedSpeaking: () => void;
  onOpenFlashcards: () => void;
  onOpenEchoTrainer: () => void;
  onOpenPhoneticCoach: () => void;
  onOpenAmbience: () => void;
  onOpenNotebook: () => void;
  onOpenHistory: () => void;
  onOpenGamification: () => void;
  onOpenResearchRoadmap?: () => void;
  onOpenRoleplay?: () => void;
  onOpenDebate?: () => void;
  onOpenVisualLearning?: () => void;
  onOpenGuessTheWord?: () => void;
  onSwitchToKidsMode?: () => void;
  onOpenSeasonalTheme?: () => void;
  theme?: AppTheme;
  onToggleTheme?: (newTheme: AppTheme) => void;
  streakDays: number;
  gemsCount: number;
  ambienceMode: string;
}

export const ToolsDrawerModal: React.FC<ToolsDrawerModalProps> = ({
  isOpen,
  onClose,
  onOpenSpeedSpeaking,
  onOpenFlashcards,
  onOpenEchoTrainer,
  onOpenPhoneticCoach,
  onOpenAmbience,
  onOpenNotebook,
  onOpenHistory,
  onOpenGamification,
  onOpenResearchRoadmap,
  onOpenRoleplay,
  onOpenDebate,
  onOpenVisualLearning,
  onOpenGuessTheWord,
  onSwitchToKidsMode,
  onOpenSeasonalTheme,
  theme = "dark",
  onToggleTheme,
  streakDays,
  gemsCount,
  ambienceMode,
}) => {
  if (!isOpen) return null;

  const isLight = theme === "high-contrast-light";

  const tools = [
    {
      id: "guess_the_word",
      title: "🔤 Adivina la Palabra (Spelling & Repositorio)",
      desc: "Descubre la palabra viendo la imagen, deletrea o escribe con banco de letras y gana XP con efectos de partículas",
      icon: Sparkles,
      badge: "Nuevo • Vocabulario",
      gradient: "from-emerald-500 via-teal-500 to-sky-500",
      action: () => {
        onClose();
        if (onOpenGuessTheWord) onOpenGuessTheWord();
      },
    },
    {
      id: "visual_learning",
      title: "🖼️ Desafío Visual & Vocabulario",
      desc: "Aprende asociando imágenes reales, escucha activa, reconocimiento de voz y construcción de oraciones estilo Duolingo Pro",
      icon: Sparkles,
      badge: "Nuevo • Visual Quest",
      gradient: "from-amber-500 via-emerald-500 to-teal-500",
      action: () => {
        onClose();
        if (onOpenVisualLearning) onOpenVisualLearning();
      },
    },
    {
      id: "debate_arena",
      title: "⚔️ Arena de Debate (Pensamiento Crítico)",
      desc: "El tutor 3D adopta la postura contraria en dilemas amenos para entrenar persuasión y fluidez en inglés",
      icon: Trophy,
      badge: "Nuevo • Retórica",
      gradient: "from-rose-500 via-amber-500 to-orange-500",
      action: () => {
        onClose();
        if (onOpenDebate) onOpenDebate();
      },
    },
    {
      id: "seasonal_theme",
      title: "❄️ Temas Estacionales & Partículas",
      desc: "Invierno Festivo, Primavera Sakura, Verano Solar u Otoño Cosecha",
      icon: Sparkles,
      badge: "Atmósfera",
      gradient: "from-sky-500 via-cyan-500 to-indigo-600",
      action: () => {
        onClose();
        if (onOpenSeasonalTheme) onOpenSeasonalTheme();
      },
    },
    {
      id: "roleplay",
      title: "💼 Simulaciones & Roleplay Real",
      desc: "Entrevistas en Silicon Valley, control de aduanas y café en Manhattan",
      icon: Trophy,
      badge: "Inmersión",
      gradient: "from-amber-500 via-orange-500 to-amber-600",
      action: () => {
        onClose();
        if (onOpenRoleplay) onOpenRoleplay();
      },
    },
    {
      id: "research",
      title: "🔬 Centro de Investigación & 100 Funciones",
      desc: "Benchmarks de 15+ apps líderes y catálogo priorizado de 100 funciones",
      icon: Brain,
      badge: "Roadmap IA",
      gradient: "from-indigo-600 to-purple-600",
      action: () => {
        onClose();
        if (onOpenResearchRoadmap) onOpenResearchRoadmap();
      },
    },
    {
      id: "kids_mode",
      title: "🦁 Modo Niños (4-10 años)",
      desc: "Mundos mágicos de animales, comidas y colores con estrellas y stickers",
      icon: Sparkles,
      badge: "Kids",
      gradient: "from-amber-500 via-orange-500 to-rose-500",
      action: () => {
        onClose();
        if (onSwitchToKidsMode) onSwitchToKidsMode();
      },
    },
    {
      id: "flashcards",
      title: "Smart Flashcards (SRS)",
      desc: "Repasa vocabulario con algoritmo de repetición espaciada",
      icon: Brain,
      badge: "Memoria",
      gradient: "from-purple-600 to-indigo-600",
      action: () => {
        onClose();
        onOpenFlashcards();
      },
    },
    {
      id: "speed_speaking",
      title: "Reto Speed Speaking (60s)",
      desc: "Responde preguntas contrarreloj para ganar reflejos y fluidez",
      icon: Zap,
      badge: "60s Challenge",
      gradient: "from-rose-500 to-amber-500",
      action: () => {
        onClose();
        onOpenSpeedSpeaking();
      },
    },
    {
      id: "echo_trainer",
      title: "Echo Trainer (Tú vs. Nativo)",
      desc: "Grábate y compara tu onda de entonación y ritmo acústico",
      icon: AudioWaveform,
      badge: "Entonación",
      gradient: "from-cyan-500 to-blue-600",
      action: () => {
        onClose();
        onOpenEchoTrainer();
      },
    },
    {
      id: "phonetics",
      title: "Laboratorio Fonético 2.5D",
      desc: "Guía de colocación lingual, acento silábico y pares mínimos",
      icon: Microscope,
      badge: "Articulación",
      gradient: "from-amber-500 to-orange-600",
      action: () => {
        onClose();
        onOpenPhoneticCoach();
      },
    },
    {
      id: "ambience",
      title: "Audio Espacial de Fondo",
      desc:
        ambienceMode !== "off"
          ? `Activo (${ambienceMode}). Toca para cambiar o calibrar volumen`
          : "Sonido de cafetería, lluvia, aeropuerto u oficina",
      icon: Volume2,
      badge: ambienceMode !== "off" ? "Activo" : "Inmersión",
      gradient: "from-teal-500 to-emerald-600",
      action: () => {
        onClose();
        onOpenAmbience();
      },
    },
    {
      id: "notebook",
      title: "Libreta de Vocabulario",
      desc: "Consulta tus palabras guardadas, modismos y explicaciones",
      icon: BookOpen,
      badge: "Glosario",
      gradient: "from-emerald-600 to-teal-700",
      action: () => {
        onClose();
        onOpenNotebook();
      },
    },
    {
      id: "history",
      title: "Historial de Conversación",
      desc: "Revisa los diálogos, traducciones y correcciones de la sesión",
      icon: History,
      badge: "Transcripción",
      gradient: "from-slate-600 to-slate-700",
      action: () => {
        onClose();
        onOpenHistory();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div
        className={`rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border ${
          isLight
            ? "bg-slate-50 border-slate-300 text-slate-900 shadow-slate-900/20"
            : "bg-slate-900 border-slate-700/80 text-slate-100 shadow-2xl"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition ${
            isLight
              ? "text-slate-500 hover:text-slate-900 bg-slate-200 hover:bg-slate-300"
              : "text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isLight ? "text-slate-950" : "text-slate-100"}`}>
              Centro de Práctica & Herramientas
            </h3>
            <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
              Módulos pedagógicos para acelerar tu fluidez y pronunciación
            </p>
          </div>
        </div>

        {/* THEME TOGGLE CARD (High-Contrast Light vs Dark) */}
        <div
          className={`w-full mb-4 p-3.5 rounded-2xl border transition-all ${
            isLight
              ? "bg-white border-amber-500/40 shadow-md shadow-amber-500/5"
              : "bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-slate-700/80 shadow-md"
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                  isLight
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                }`}
              >
                {isLight ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    Tema & Legibilidad
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      isLight
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    }`}
                  >
                    {isLight ? "Alto Contraste Activo" : "Modo Oscuro"}
                  </span>
                </div>
                <p className={`text-[11px] ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Optimizado especialmente para la libreta de vocabulario y notas
                </p>
              </div>
            </div>
          </div>

          {/* Selector Switcher Pills */}
          <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl ${isLight ? "bg-slate-100 border border-slate-200" : "bg-slate-950/80 border border-slate-800"}`}>
            <button
              onClick={() => onToggleTheme?.("dark")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                !isLight
                  ? "bg-slate-800 text-amber-300 shadow-md border border-slate-700 font-extrabold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Modo Oscuro</span>
              {!isLight && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
            </button>

            <button
              onClick={() => onToggleTheme?.("high-contrast-light")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                isLight
                  ? "bg-amber-400 text-slate-950 shadow-md font-extrabold border border-amber-500"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Alto Contraste</span>
              {isLight && <Check className="w-3.5 h-3.5 text-slate-950 ml-auto" />}
            </button>
          </div>
        </div>

        {/* Quick Gamification Banner */}
        <button
          onClick={() => {
            onClose();
            onOpenGamification();
          }}
          className={`w-full mb-4 p-3 rounded-2xl border flex items-center justify-between text-left transition ${
            isLight
              ? "bg-white border-amber-400/50 hover:border-amber-500 shadow-sm"
              : "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-amber-500/30 hover:border-amber-500/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${isLight ? "text-amber-800" : "text-amber-300"}`}>
                  Progreso & Logros
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    isLight
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  Racha: {streakDays}d
                </span>
              </div>
              <p className={`text-[11px] ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Tienes 💎 {gemsCount} gemas. Toca para ver cofres y estadísticas.
              </p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${isLight ? "text-amber-600" : "text-amber-400/80"}`} />
        </button>

        {/* Tools Grid / List */}
        <div className="space-y-2.5">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={t.action}
                className={`w-full p-3 rounded-2xl border transition flex items-center gap-3.5 text-left group active:scale-[0.99] ${
                  isLight
                    ? "bg-white hover:bg-slate-100/90 border-slate-300 hover:border-slate-400 shadow-sm"
                    : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.gradient} flex items-center justify-center text-white shrink-0 shadow-md`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4
                      className={`text-xs sm:text-sm font-bold transition ${
                        isLight
                          ? "text-slate-900 group-hover:text-blue-700"
                          : "text-slate-100 group-hover:text-blue-300"
                      }`}
                    >
                      {t.title}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? "bg-slate-100 text-slate-700 border-slate-300 font-bold"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {t.badge}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] leading-tight truncate ${
                      isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    {t.desc}
                  </p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition shrink-0 ${
                    isLight ? "text-slate-400 group-hover:text-slate-700" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
