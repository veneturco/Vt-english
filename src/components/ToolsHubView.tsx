import React from "react";
import { motion } from "motion/react";
import {
  Layers,
  Zap,
  Mic,
  Activity,
  Volume2,
  BookMarked,
  History,
  Gift,
  Award,
  Sparkles,
  Baby,
  Flame,
  Gem,
  BrainCircuit,
  Briefcase,
} from "lucide-react";

interface ToolsHubViewProps {
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
  streakDays,
  gemsCount,
}: ToolsHubViewProps) {
  const tools = [
    {
      id: "roleplay",
      title: "Simulaciones & Roleplay Real",
      desc: "Entrevistas en Silicon Valley, aduana de aeropuerto y café en Manhattan.",
      icon: Briefcase,
      color: "from-amber-500 to-orange-600",
      action: onOpenRoleplay,
      tag: "Inmersión",
      isFeatured: true,
    },
    {
      id: "research",
      title: "Centro de Investigación & 100 Funciones",
      desc: "Benchmarks de 15+ apps líderes y catálogo completo de 100 funciones.",
      icon: BrainCircuit,
      color: "from-indigo-500 to-purple-600",
      action: onOpenResearchRoadmap,
      tag: "Roadmap IA",
      isFeatured: true,
    },
    {
      id: "flashcards",
      title: "Repetición Espaciada (SRS)",
      desc: "Memoriza vocabulario con el algoritmo de intervalos SM-2.",
      icon: Layers,
      color: "from-blue-500 to-indigo-600",
      action: onOpenFlashcards,
      tag: "SRS",
    },
    {
      id: "speed",
      title: "Speed Speaking Challenge",
      desc: "Reto contrarreloj para superar el bloqueo y hablar sin titubeos.",
      icon: Zap,
      color: "from-amber-500 to-orange-600",
      action: onOpenSpeedSpeaking,
      tag: "Fluidez",
    },
    {
      id: "echo",
      title: "Waveform Echo Trainer",
      desc: "Compara visualmente tu onda de voz con la del nativo.",
      icon: Activity,
      color: "from-purple-500 to-pink-600",
      action: onOpenEchoTrainer,
      tag: "Entonación",
    },
    {
      id: "phonetics",
      title: "Laboratorio Fonético 2.5D",
      desc: "Guía de articulación lingual y pares mínimos difíciles.",
      icon: Mic,
      color: "from-emerald-500 to-teal-600",
      action: onOpenPhoneticCoach,
      tag: "IPA",
    },
    {
      id: "quests",
      title: "Misiones Diarias y Tienda",
      desc: "Completa objetivos diarios y canjea gemas por premios.",
      icon: Gift,
      color: "from-rose-500 to-pink-600",
      action: onOpenQuestsAndShop,
      tag: "Recompensas",
    },
    {
      id: "placement",
      title: "Test de Diagnóstico CEFR",
      desc: "Evalúa tu nivel actual de A1 a C1 con preguntas adaptativas.",
      icon: Award,
      color: "from-amber-400 to-yellow-600",
      action: onOpenPlacementTest,
      tag: "Evaluación",
    },
    {
      id: "notebook",
      title: "Cuaderno de Vocabulario",
      desc: "Repasa las palabras y expresiones guardadas en tus llamadas.",
      icon: BookMarked,
      color: "from-teal-500 to-cyan-600",
      action: onOpenNotebook,
      tag: "Palabras",
    },
    {
      id: "ambience",
      title: "Ambiente Inmersivo",
      desc: "Activa sonidos de fondo como lluvia, café o aeropuerto.",
      icon: Volume2,
      color: "from-slate-600 to-slate-800",
      action: onOpenAmbience,
      tag: "Audio",
    },
    {
      id: "history",
      title: "Historial de Conversación",
      desc: "Revisa los diálogos anteriores y escucha las grabaciones.",
      icon: History,
      color: "from-slate-700 to-slate-900",
      action: onOpenHistory,
      tag: "Registro",
    },
  ];


  return (
    <div className="w-full max-w-4xl mx-auto p-4 pb-28 flex flex-col gap-6">
      {/* Header Summary Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-4 sm:p-5 flex items-center justify-between shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>🧰</span> Centro de Práctica & Herramientas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Todo tu arsenal de entrenamiento de pronunciación, memoria y fluidez.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black">
            <Flame className="w-4 h-4 fill-current" />
            <span>{streakDays} días</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
            <Gem className="w-4 h-4 fill-current" />
            <span>{gemsCount}</span>
          </div>
        </div>
      </div>

      {/* Kids Mode Switch Card */}
      <div
        onClick={onSwitchToKidsMode}
        className="rounded-2xl bg-gradient-to-r from-red-500/20 via-amber-500/20 to-emerald-500/20 border-2 border-amber-400/40 p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition shadow-lg group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 via-amber-500 to-emerald-500 flex items-center justify-center text-2xl font-black shadow-md text-slate-950 group-hover:rotate-6 transition">
            🍄
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                MODO NIÑOS 4-10
              </span>
              <span className="text-xs font-bold text-amber-300">Mario & Luigi Adventure</span>
            </div>
            <h3 className="text-base font-black text-white mt-0.5">
              Entrar al Modo Niños con Mario & Luigi ⭐
            </h3>
            <p className="text-xs text-slate-300">
              Mundos temáticos, tarjetas mágicas, sonidos auténticos y álbum de Super Estrellas.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md group-hover:scale-105 transition"
        >
          ¡Vamos!
        </button>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={tool.action}
              className="flex flex-col text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 shadow-md group hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {tool.tag}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {tool.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {tool.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
