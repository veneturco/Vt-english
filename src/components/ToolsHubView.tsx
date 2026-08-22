import React from "react";
import { motion } from "motion/react";
import {
  Briefcase,
  Mic,
  Sparkles,
  Zap,
  Activity,
  Award,
  Gift,
  BrainCircuit,
  Flame,
  Gem,
  Play,
  Volume2,
  BookMarked,
  History,
  ArrowRight,
} from "lucide-react";

export interface ToolsHubViewProps {
  onOpenFlashcards: () => void;
  onOpenSpeedSpeaking: () => void;
  onOpenEchoTrainer: () => void;
  onOpenPhoneticCoach: () => void;
  onOpenAmbience: () => void;
  onOpenNotebook: () => void;
  onOpenHistory: () => void;
  onOpenQuestsAndShop: () => void;
  onOpenPlacementTest: () => void;
  onOpenResearchRoadmap?: () => void;
  onOpenRoleplay?: () => void;
  onSwitchToKidsMode: () => void;
  onStartDailyPractice?: () => void;
  streakDays: number;
  gemsCount: number;
}

export function ToolsHubView({
  onOpenFlashcards,
  onOpenSpeedSpeaking,
  onOpenEchoTrainer,
  onOpenPhoneticCoach,
  onOpenAmbience,
  onOpenNotebook,
  onOpenHistory,
  onOpenQuestsAndShop,
  onOpenPlacementTest,
  onOpenResearchRoadmap,
  onOpenRoleplay,
  onSwitchToKidsMode,
  onStartDailyPractice,
  streakDays,
  gemsCount,
}: ToolsHubViewProps) {
  // Lista de herramientas ultra-minimalistas sin párrafos de texto (Zero-Text Rule)
  const toolItems = [
    {
      id: "roleplay",
      title: "Business Roleplay",
      icon: Briefcase,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      action: onOpenRoleplay,
    },
    {
      id: "phonetics",
      title: "Phonetics Coach",
      icon: Mic,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      action: onOpenPhoneticCoach,
    },
    {
      id: "vocabulary",
      title: "Smart Vocabulary",
      icon: Sparkles,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      action: onOpenFlashcards,
    },
    {
      id: "echo",
      title: "Waveform Echo",
      icon: Activity,
      iconColor: "text-sky-600",
      bgColor: "bg-sky-50",
      action: onOpenEchoTrainer,
    },
    {
      id: "speed",
      title: "Speed Speaking",
      icon: Zap,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      action: onOpenSpeedSpeaking,
    },
    {
      id: "placement",
      title: "Placement Test",
      icon: Award,
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
      action: onOpenPlacementTest,
    },
    {
      id: "quests",
      title: "Misiones & Tienda",
      icon: Gift,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      action: onOpenQuestsAndShop,
    },
    {
      id: "roadmap",
      title: "Research Roadmap",
      icon: BrainCircuit,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      action: onOpenResearchRoadmap,
    },
    {
      id: "notebook",
      title: "Mi Cuaderno",
      icon: BookMarked,
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50",
      action: onOpenNotebook,
    },
    {
      id: "ambience",
      title: "Ambiente & Audio",
      icon: Volume2,
      iconColor: "text-slate-600",
      bgColor: "bg-slate-100",
      action: onOpenAmbience,
    },
    {
      id: "history",
      title: "Historial",
      icon: History,
      iconColor: "text-slate-600",
      bgColor: "bg-slate-100",
      action: onOpenHistory,
    },
  ];

  const handleStartPractice = () => {
    if (onStartDailyPractice) {
      onStartDailyPractice();
    } else if (onOpenRoleplay) {
      onOpenRoleplay();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-6 sm:py-8 pb-32 flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* 1. EL "CALL TO ACTION" CENTRAL (FOCO PRINCIPAL) */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Acentos decorativos de fondo sutiles */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-16 w-52 h-52 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Información y Título Inspirador */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 gap-3 max-w-lg">
            {/* Gamification Pills */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-amber-300">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>{streakDays} días de racha</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-sky-300">
                <Gem className="w-4 h-4 text-sky-400 fill-sky-400" />
                <span>{gemsCount} gemas</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Tu Práctica Diaria
            </h1>
            <p className="text-indigo-200 text-sm sm:text-base font-medium">
              Solo 5 minutos hoy para mantener tu racha y alcanzar fluidez natural.
            </p>
          </div>

          {/* Botón Principal Llamativo */}
          <div className="z-10 w-full md:w-auto flex justify-center">
            <button
              type="button"
              onClick={handleStartPractice}
              className="w-full md:w-auto px-8 py-5 rounded-2xl bg-white text-indigo-950 font-black text-lg sm:text-xl shadow-lg hover:shadow-2xl hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 group cursor-pointer"
            >
              <span>Empezar ahora</span>
              <div className="w-8 h-8 rounded-full bg-indigo-950 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </motion.section>

        {/* 2. GRID DE HERRAMIENTAS MINIMALISTA (ZERO TEXT) */}
        <section className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Herramientas de Aprendizaje
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              Acceso Directo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {toolItems.map((tool, idx) => {
              const IconComponent = tool.icon;
              return (
                <motion.button
                  key={tool.id}
                  type="button"
                  onClick={tool.action}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  className="p-6 rounded-3xl bg-white border border-slate-200/70 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center text-center gap-4 cursor-pointer group select-none"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl ${tool.bgColor} ${tool.iconColor} flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-sm sm:text-base text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                    {tool.title}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Acceso discreto al Modo Niños */}
        <div className="w-full flex justify-center pt-2">
          <button
            type="button"
            onClick={onSwitchToKidsMode}
            className="px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-amber-400 text-slate-600 hover:text-slate-900 shadow-sm text-xs font-semibold flex items-center gap-2 hover:scale-105 transition-all"
          >
            <span>🍄</span>
            <span>Cambiar al Modo Niños (4-10 años)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
