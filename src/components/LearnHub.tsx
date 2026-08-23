import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BookOpen,
  Mic,
  Activity,
  Zap,
  Gift,
  Award,
  History,
  BookMarked,
  Volume2,
  BrainCircuit,
  Briefcase,
  ChevronDown,
  Layers,
  Flame,
  Gem,
  ArrowRight,
  Compass,
} from "lucide-react";
import { playPopSound } from "../utils/audioSynth";
import { haptics } from "../utils/haptics";

export interface LearnHubProps {
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
  onOpenSeasonalTheme?: () => void;
  onOpenLeaderboard?: () => void;
  onSwitchToKidsMode?: () => void;
  streakDays: number;
  gemsCount: number;
  isOpenDefault?: boolean;
}

export function LearnHub({
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
  onOpenSeasonalTheme,
  onOpenLeaderboard,
  onSwitchToKidsMode,
  streakDays,
  gemsCount,
  isOpenDefault = false,
}: LearnHubProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(isOpenDefault);
  const [activeCategory, setActiveCategory] = useState<"all" | "practice" | "grammar" | "gamification">("all");

  const categories = [
    { id: "all", label: "Todas" },
    { id: "practice", label: "Pronunciación" },
    { id: "grammar", label: "Vocabulario & Rol" },
    { id: "gamification", label: "Recompensas" },
  ] as const;

  const tools = [
    // Practice & Pronunciation
    {
      id: "phonetics",
      title: "Phonetic Coach",
      subtitle: "Laboratorio articulatorio",
      category: "practice",
      icon: Mic,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200/60",
      action: onOpenPhoneticCoach,
    },
    {
      id: "echo",
      title: "Waveform Echo",
      subtitle: "Entrena entonación y ritmo",
      category: "practice",
      icon: Activity,
      iconColor: "text-sky-600",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200/60",
      action: onOpenEchoTrainer,
    },
    {
      id: "speed",
      title: "Speed Speaking",
      subtitle: "Desafío de fluidez por tiempo",
      category: "practice",
      icon: Zap,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200/60",
      action: onOpenSpeedSpeaking,
    },
    // Vocabulary & Roleplay
    {
      id: "roleplay",
      title: "Business Roleplay",
      subtitle: "Simulaciones profesionales",
      category: "grammar",
      icon: Briefcase,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200/60",
      action: onOpenRoleplay,
    },
    {
      id: "vocabulary",
      title: "Smart Flashcards (SRS)",
      subtitle: "Repetición espaciada inteligente",
      category: "grammar",
      icon: Sparkles,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200/60",
      action: onOpenFlashcards,
    },
    {
      id: "notebook",
      title: "Mi Cuaderno",
      subtitle: "Vocabulario guardado",
      category: "grammar",
      icon: BookMarked,
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200/60",
      action: onOpenNotebook,
    },
    // Gamification & Progression
    {
      id: "leaderboard",
      title: "Liga Semanal 🏆",
      subtitle: "Compite con otros aprendices",
      category: "gamification",
      icon: Award,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200/60",
      action: onOpenLeaderboard,
    },
    {
      id: "quests",
      title: "Misiones & Tienda",
      subtitle: "Gemas y cosméticos",
      category: "gamification",
      icon: Gift,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200/60",
      action: onOpenQuestsAndShop,
    },
    {
      id: "placement",
      title: "Placement Test",
      subtitle: "Evaluación CEFR oficial",
      category: "gamification",
      icon: Award,
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200/60",
      action: onOpenPlacementTest,
    },
    {
      id: "seasonal",
      title: "Temas Estacionales",
      subtitle: "Partículas y ambientación",
      category: "gamification",
      icon: Sparkles,
      iconColor: "text-sky-500",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200/60",
      action: onOpenSeasonalTheme,
    },
    {
      id: "ambience",
      title: "Paisajes Sonoros",
      subtitle: "Audio inmersivo de fondo",
      category: "practice",
      icon: Volume2,
      iconColor: "text-slate-600",
      bgColor: "bg-slate-100",
      borderColor: "border-slate-200/60",
      action: onOpenAmbience,
    },
    {
      id: "history",
      title: "Historial de Práctica",
      subtitle: "Transcripciones pasadas",
      category: "grammar",
      icon: History,
      iconColor: "text-slate-600",
      bgColor: "bg-slate-100",
      borderColor: "border-slate-200/60",
      action: onOpenHistory,
    },
  ];

  const filteredTools =
    activeCategory === "all"
      ? tools
      : tools.filter((tool) => tool.category === activeCategory);

  const toggleAccordion = () => {
    playPopSound();
    haptics.light();
    setIsExpanded((prev) => !prev);
  };

  return (
    <section className="w-full flex flex-col rounded-3xl bg-white border-2 border-slate-200/80 shadow-xs overflow-hidden transition-all">
      {/* 1. Accordion Toggle Header */}
      <button
        type="button"
        onClick={toggleAccordion}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors select-none cursor-pointer"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Learn Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                {tools.length} Herramientas
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium line-clamp-1">
              Fonética, Roleplays, Repetición SRS y Desafíos de fluidez
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-transform duration-200 ${
              isExpanded ? "rotate-180 bg-indigo-50 text-indigo-600" : ""
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* 2. Collapsible Tools Matrix (Progressive Disclosure) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-4 sm:p-5 flex flex-col gap-4 bg-slate-50/50">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        haptics.light();
                        setActiveCategory(cat.id);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all select-none cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Grid of Tools */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {filteredTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        haptics.light();
                        if (tool.action) tool.action();
                      }}
                      className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs active:scale-97 transition-all flex flex-col items-start gap-2 text-left group select-none cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={`w-9 h-9 rounded-xl ${tool.bgColor} ${tool.iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {tool.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium line-clamp-1 leading-snug">
                          {tool.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Optional Quick Link to Kids Mode */}
              {onSwitchToKidsMode && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={onSwitchToKidsMode}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-amber-200 hover:border-amber-400 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <span>🍄</span>
                    <span>Modo Niños</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
