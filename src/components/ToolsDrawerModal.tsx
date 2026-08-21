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
} from "lucide-react";

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
  onSwitchToKidsMode?: () => void;
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
  onSwitchToKidsMode,
  streakDays,
  gemsCount,
  ambienceMode,
}) => {
  if (!isOpen) return null;

  const tools = [
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
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">
              Centro de Práctica & Herramientas
            </h3>
            <p className="text-xs text-slate-400">
              Módulos pedagógicos para acelerar tu fluidez y pronunciación
            </p>
          </div>
        </div>

        {/* Quick Gamification Banner */}
        <button
          onClick={() => {
            onClose();
            onOpenGamification();
          }}
          className="w-full mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between text-left transition hover:border-amber-500/60"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300">
                  Progreso & Logros
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Racha: {streakDays}d
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tienes 💎 {gemsCount} gemas. Toca para ver cofres y estadísticas.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400/80" />
        </button>

        {/* Tools Grid / List */}
        <div className="space-y-2.5">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={t.action}
                className="w-full p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition flex items-center gap-3.5 text-left group active:scale-[0.99]"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.gradient} flex items-center justify-center text-white shrink-0 shadow-md`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-blue-300 transition">
                      {t.title}
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight truncate">
                    {t.desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
