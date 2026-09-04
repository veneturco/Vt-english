import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  Check,
  Lock,
  Flame,
  Crown,
  Trophy,
  Play,
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Award,
  Zap,
  PhoneCall,
  Headphones,
  BarChart3,
  Briefcase,
  Moon,
  Sun,
  Globe,
  Plane,
  Target,
} from "lucide-react";
import { CEFRLevel, RoleplayScenarioItem } from "../types";
import { playPopSound, playCoinSound } from "../utils/audioSynth";
import { haptics } from "../utils/haptics";
import {
  getStoredLearningPathProgress,
  LearningPathProgress,
} from "../utils/learningPathStorage";
import { getDueFlashcardsCount } from "../utils/srs";
import { IndustryTrack, DEFAULT_INDUSTRY_TRACK } from "../data/industryTracksData";

export interface LessonNode {
  id: string;
  title: string;
  subtitle: string;
  type: "lesson" | "practice" | "boss_roleplay";
  status: "completed" | "current" | "locked";
  xp: number;
  scenarioId?: string;
  icon?: string;
}

export interface LearningUnitData {
  id: string;
  unitNumber: number;
  level: CEFRLevel;
  title: string;
  goalDescription: string;
  nodes: LessonNode[];
}

export const ADULT_UNITS: LearningUnitData[] = [
  {
    id: "unit-1",
    unitNumber: 1,
    level: "A1",
    title: "Primeros Pasos en la Oficina",
    goalDescription: "Presentaciones profesionales, saludos corporativos y tu primer café de trabajo.",
    nodes: [
      {
        id: "u1-n1",
        title: "Presentación Personal",
        subtitle: "Aprende a decir tu cargo y especialidad",
        type: "lesson",
        status: "completed",
        xp: 20,
        scenarioId: "tech_interview",
        icon: "👋",
      },
      {
        id: "u1-n2",
        title: "El Café de la Mañana",
        subtitle: "Pedir y socializar en la cafetería",
        type: "lesson",
        status: "current",
        xp: 25,
        scenarioId: "starbucks_nyc",
        icon: "☕",
      },
      {
        id: "u1-n3",
        title: "Agendar una Llamada",
        subtitle: "Horarios y confirmaciones básicas",
        type: "practice",
        status: "locked",
        xp: 30,
        scenarioId: "starbucks_nyc",
        icon: "📅",
      },
      {
        id: "u1-boss",
        title: "Simulación: Primer Día de Trabajo",
        subtitle: "Roleplay final con tu nuevo colega",
        type: "boss_roleplay",
        status: "locked",
        xp: 60,
        scenarioId: "tech_interview",
        icon: "👑",
      },
    ],
  },
  {
    id: "unit-2",
    unitNumber: 2,
    level: "A2",
    title: "Reuniones & Correos Profesionales",
    goalDescription: "Redacción de emails breves, confirmar entregas y participar en daily standups.",
    nodes: [
      {
        id: "u2-n1",
        title: "Escribir un Email Claro",
        subtitle: "Asunto, cuerpo y despedidas formales",
        type: "lesson",
        status: "locked",
        xp: 30,
        scenarioId: "hotel_concierge",
        icon: "✉️",
      },
      {
        id: "u2-n2",
        title: "Participar en la Daily",
        subtitle: "Qué hiciste ayer, qué harás hoy",
        type: "lesson",
        status: "locked",
        xp: 35,
        scenarioId: "hotel_concierge",
        icon: "🗣️",
      },
      {
        id: "u2-n3",
        title: "Reporte de Bloqueos",
        subtitle: "Cómo pedir ayuda y explicar problemas",
        type: "practice",
        status: "locked",
        xp: 40,
        scenarioId: "hotel_concierge",
        icon: "⚡",
      },
      {
        id: "u2-boss",
        title: "Simulación: Reunión con el Manager",
        subtitle: "Presenta el avance de tus proyectos clave",
        type: "boss_roleplay",
        status: "locked",
        xp: 75,
        scenarioId: "hotel_concierge",
        icon: "🏆",
      },
    ],
  },
  {
    id: "unit-3",
    unitNumber: 3,
    level: "B1",
    title: "Negociaciones & Entrevistas de Trabajo",
    goalDescription: "Destacar fortalezas, responder preguntas complejas y negociar propuestas.",
    nodes: [
      {
        id: "u3-n1",
        title: "Tell Me About Yourself",
        subtitle: "Pitch personal de 60 segundos",
        type: "lesson",
        status: "locked",
        xp: 45,
        scenarioId: "tech_interview",
        icon: "💼",
      },
      {
        id: "u3-n2",
        title: "Preguntas de Comportamiento (STAR)",
        subtitle: "Situación, Tarea, Acción y Resultado",
        type: "practice",
        status: "locked",
        xp: 50,
        scenarioId: "tech_interview",
        icon: "🎯",
      },
      {
        id: "u3-boss",
        title: "Simulación: Entrevista Técnica Final",
        subtitle: "Roleplay inmersivo con el Hiring Manager",
        type: "boss_roleplay",
        status: "locked",
        xp: 100,
        scenarioId: "tech_interview",
        icon: "👑",
      },
    ],
  },
  {
    id: "unit-4",
    unitNumber: 4,
    level: "B2",
    title: "Liderazgo & Fluidez Ejecutiva",
    goalDescription: "Debates estratégicos, manejo de objeciones y persuasión de alto nivel.",
    nodes: [
      {
        id: "u4-n1",
        title: "Manejo de Objeciones",
        subtitle: "Conectores avanzados de contraste y diplomacia",
        type: "lesson",
        status: "locked",
        xp: 55,
        scenarioId: "startup_pitch",
        icon: "💡",
      },
      {
        id: "u4-boss",
        title: "Simulación: Cierre de Acuerdo con Clientes",
        subtitle: "Roleplay final de alta exigencia ejecutiva",
        type: "boss_roleplay",
        status: "locked",
        xp: 120,
        scenarioId: "startup_pitch",
        icon: "🏆",
      },
    ],
  },
];

import { DailyGoalProgressRing } from "./DailyGoalProgressRing";
import { WeeklyLeagueWidget } from "./WeeklyLeagueWidget";
import { LearnHub } from "./LearnHub";

export interface AdultLearningPathProps {
  currentLevel: CEFRLevel;
  streakDays: number;
  gemsCount: number;
  userXP?: number;
  userName?: string;
  progressVersion?: number;
  onStartLesson: (node: LessonNode) => void;
  onOpenRoleplayModal?: () => void;
  onOpenPlacementTest?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenFlashcards?: () => void;
  onOpenSpeedSpeaking?: () => void;
  onOpenEchoTrainer?: () => void;
  onOpenPhoneticCoach?: () => void;
  onOpenAmbience?: () => void;
  onOpenNotebook?: () => void;
  onOpenHistory?: () => void;
  onOpenQuestsAndShop?: () => void;
  onOpenResearchRoadmap?: () => void;
  onOpenSeasonalTheme?: () => void;
  onSwitchToKidsMode?: () => void;
  onOpenDailyBlitz?: () => void;
  onOpenCertificate?: (data: { unitTitle: string; unitNumber: number; cefrLevel: string }) => void;
  onOpenVoiceCall?: () => void;
  onOpenIndustryModal?: () => void;
  onOpenSkillRadar?: () => void;
  onOpenAudioImmersion?: () => void;
  onOpenGlobalAccents?: () => void;
  onOpenStarInterview?: () => void;
  onOpenOfflineCommute?: () => void;
  isAirplaneModeActive?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  currentIndustry?: IndustryTrack;
}

export function AdultLearningPath({
  currentLevel,
  streakDays,
  gemsCount,
  userXP = 520,
  userName = "Tú",
  progressVersion = 0,
  onStartLesson,
  onOpenRoleplayModal,
  onOpenPlacementTest,
  onOpenLeaderboard,
  onOpenFlashcards,
  onOpenSpeedSpeaking,
  onOpenEchoTrainer,
  onOpenPhoneticCoach,
  onOpenAmbience,
  onOpenNotebook,
  onOpenHistory,
  onOpenQuestsAndShop,
  onOpenResearchRoadmap,
  onOpenSeasonalTheme,
  onSwitchToKidsMode,
  onOpenDailyBlitz,
  onOpenCertificate,
  onOpenVoiceCall,
  onOpenIndustryModal,
  onOpenSkillRadar,
  onOpenAudioImmersion,
  onOpenGlobalAccents,
  onOpenStarInterview,
  onOpenOfflineCommute,
  isAirplaneModeActive = false,
  isDarkMode = false,
  onToggleDarkMode,
  currentIndustry = DEFAULT_INDUSTRY_TRACK,
}: AdultLearningPathProps) {
  const [selectedNodeModal, setSelectedNodeModal] = useState<LessonNode | null>(null);

  const [progress, setProgress] = useState<LearningPathProgress>(() =>
    getStoredLearningPathProgress(currentLevel)
  );

  const dueFlashcardsCount = useMemo(() => getDueFlashcardsCount(), [progressVersion]);

  useEffect(() => {
    setProgress(getStoredLearningPathProgress(currentLevel));
  }, [progressVersion, currentLevel]);

  const dynamicUnits = useMemo(() => {
    return ADULT_UNITS.map((unit) => {
      const isUnitUnlocked = progress.unlockedUnitIds.includes(unit.id);
      const dynamicNodes = unit.nodes.map((node) => {
        let status: "completed" | "current" | "locked" = "locked";
        if (progress.completedNodeIds.includes(node.id)) {
          status = "completed";
        } else if (progress.currentNodeId === node.id && isUnitUnlocked) {
          status = "current";
        } else {
          status = "locked";
        }
        return {
          ...node,
          status,
        };
      });
      return {
        ...unit,
        isUnlocked: isUnitUnlocked,
        nodes: dynamicNodes,
      };
    });
  }, [progress]);

  const handleNodeClick = (node: LessonNode) => {
    if (node.status === "locked") return;

    playPopSound();
    haptics.light();
    setSelectedNodeModal(node);
  };

  const handleConfirmStart = () => {
    if (!selectedNodeModal) return;
    playCoinSound();
    haptics.medium();
    const target = selectedNodeModal;
    setSelectedNodeModal(null);
    onStartLesson(target);
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      } flex flex-col items-center pb-32 transition-colors duration-200`}
    >
      {/* 1. TOP BAR ELEGANTE & MINIMALISTA CON ACCESO A HERRAMIENTAS EJECUTIVAS */}
      <header
        className={`sticky top-0 z-30 w-full ${
          isDarkMode
            ? "bg-slate-900/95 border-slate-800"
            : "bg-white/95 border-slate-200/80"
        } backdrop-blur-md border-b shadow-xs transition-colors`}
      >
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Selector de Idioma Activo y Nivel */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full ${
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
              } border flex items-center justify-center text-base shadow-xs`}
            >
              🇺🇸
            </div>
            <div className="flex flex-col">
              <span
                className={`text-xs font-bold ${
                  isDarkMode ? "text-white" : "text-slate-900"
                } leading-tight`}
              >
                English Pro
              </span>
              <span className="text-[10px] font-semibold text-indigo-500">
                Nivel {currentLevel} (CEFR)
              </span>
            </div>
          </div>

          {/* Gamification Stats & Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Racha con fuego */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${
                isDarkMode
                  ? "bg-amber-950/50 border-amber-800/80 text-amber-200"
                  : "bg-amber-50 border-amber-200/80 text-amber-900"
              } border font-extrabold text-xs shadow-xs`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{streakDays}</span>
            </div>

            {/* Gemas */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${
                isDarkMode
                  ? "bg-sky-950/50 border-sky-800/80 text-sky-200"
                  : "bg-sky-50 border-sky-200/80 text-sky-900"
              } border font-extrabold text-xs shadow-xs`}
            >
              <span className="text-xs">💎</span>
              <span>{gemsCount}</span>
            </div>

            {/* Reto Blitz 60s */}
            {onOpenDailyBlitz && (
              <button
                type="button"
                onClick={onOpenDailyBlitz}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-xs transition cursor-pointer"
                title="Desafío rápido de 60 segundos"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Blitz</span>
              </button>
            )}

            {/* Toggle Modo Oscuro Ejecutivo */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`p-2 rounded-full border transition cursor-pointer ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
                title={isDarkMode ? "Cambiar a modo claro" : "Activar Modo Oscuro Ejecutivo"}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Barra de Acciones Ejecutivas: Industria, Llamada Manos Libres, Radar & Podcast */}
        <div
          className={`border-t ${
            isDarkMode ? "border-slate-800/80 bg-slate-950/60" : "border-slate-200/60 bg-slate-50/70"
          } px-4 py-2`}
        >
          <div className="max-w-xl mx-auto flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
            {/* Especialidad / Industria */}
            {onOpenIndustryModal && (
              <button
                type="button"
                onClick={onOpenIndustryModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  isDarkMode
                    ? "bg-indigo-950/50 hover:bg-indigo-900/60 border-indigo-500/40 text-indigo-300"
                    : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900"
                }`}
                title="Especialidad profesional activa"
              >
                <span>{currentIndustry.icon}</span>
                <span className="font-extrabold">{currentIndustry.shortName}</span>
              </button>
            )}

            {/* Llamada Manos Libres */}
            {onOpenVoiceCall && (
              <button
                type="button"
                onClick={onOpenVoiceCall}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  isDarkMode
                    ? "bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-300"
                    : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900"
                }`}
                title="Simulación de llamada telefónica manos libres"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                <span>Llamada</span>
              </button>
            )}

            {/* Radar de Fluidez */}
            {onOpenSkillRadar && (
              <button
                type="button"
                onClick={onOpenSkillRadar}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  isDarkMode
                    ? "bg-sky-950/50 hover:bg-sky-900/60 border-sky-500/40 text-sky-300"
                    : "bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-900"
                }`}
                title="Radar de fluidez y analíticas"
              >
                <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
                <span>Radar</span>
              </button>
            )}

            {/* Podcast / Audio Inmersión */}
            {onOpenAudioImmersion && (
              <button
                type="button"
                onClick={onOpenAudioImmersion}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  isDarkMode
                    ? "bg-amber-950/50 hover:bg-amber-900/60 border-amber-500/40 text-amber-300"
                    : "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900"
                }`}
                title="Podcast en segundo plano"
              >
                <Headphones className="w-3.5 h-3.5 text-amber-500" />
                <span>Podcast</span>
              </button>
            )}

            {/* Gimnasio de Acentos Globales */}
            {onOpenGlobalAccents && (
              <button
                type="button"
                onClick={onOpenGlobalAccents}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  isDarkMode
                    ? "bg-blue-950/50 hover:bg-blue-900/60 border-blue-500/40 text-blue-300"
                    : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900"
                }`}
                title="Entrenador de acentos internacionales (US, UK, IN, AU, EU)"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Acentos</span>
              </button>
            )}

            {/* Entrenador de Entrevistas STAR */}
            {onOpenStarInterview && (
              <button
                type="button"
                onClick={onOpenStarInterview}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  isDarkMode
                    ? "bg-teal-950/50 hover:bg-teal-900/60 border-teal-500/40 text-teal-300"
                    : "bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-900"
                }`}
                title="Entrevistas de trabajo con Método STAR"
              >
                <Target className="w-3.5 h-3.5 text-teal-500" />
                <span>STAR</span>
              </button>
            )}

            {/* Paquetes Offline Metro / Avión */}
            {onOpenOfflineCommute && (
              <button
                type="button"
                onClick={onOpenOfflineCommute}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  isDarkMode
                    ? "bg-purple-950/50 hover:bg-purple-900/60 border-purple-500/40 text-purple-300"
                    : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900"
                }`}
                title="Descargar paquetes offline para el metro o avión"
              >
                <Plane className="w-3.5 h-3.5 text-purple-500" />
                <span>Offline</span>
              </button>
            )}

            {/* Test de nivel */}
            {onOpenPlacementTest && (
              <button
                type="button"
                onClick={onOpenPlacementTest}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border shrink-0 ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
                title="Evaluar mi nivel CEFR"
              >
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                <span>Test CEFR</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Banner de Modo Avión Activo */}
      {isAirplaneModeActive && (
        <div className="w-full bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-xs font-bold py-2 px-4 shadow-md flex items-center justify-center gap-2 animate-fadeIn sticky top-[102px] z-20">
          <Plane className="w-4 h-4 animate-pulse" />
          <span>Modo Avión / Desconectado Activo: Todas las lecciones y audios funcionan desde la memoria local.</span>
        </div>
      )}

      {/* 2. FEED VERTICAL DE APRENDIZAJE: PRIORIZANDO LA RUTA DEL DÍA */}
      <main className="w-full max-w-xl mx-auto px-4 pt-4 sm:pt-6 flex flex-col gap-6">
        {/* COMPONENTE META DIARIA DE APRENDIZAJE (PROGRESS RING UI) */}
        <DailyGoalProgressRing
          currentXp={35}
          targetXp={50}
          streakDays={streakDays}
          completedLessonsToday={2}
          targetLessonsToday={3}
        />

        {/* PROGRESSIVE DISCLOSURE: LEARN HUB COLLAPSIBLE ACCORDION */}
        <LearnHub
          onOpenFlashcards={onOpenFlashcards || (() => {})}
          onOpenSpeedSpeaking={onOpenSpeedSpeaking || (() => {})}
          onOpenEchoTrainer={onOpenEchoTrainer || (() => {})}
          onOpenPhoneticCoach={onOpenPhoneticCoach || (() => {})}
          onOpenAmbience={onOpenAmbience || (() => {})}
          onOpenNotebook={onOpenNotebook || (() => {})}
          onOpenHistory={onOpenHistory || (() => {})}
          onOpenQuestsAndShop={onOpenQuestsAndShop || (() => {})}
          onOpenPlacementTest={onOpenPlacementTest || (() => {})}
          onOpenResearchRoadmap={onOpenResearchRoadmap}
          onOpenRoleplay={onOpenRoleplayModal}
          onOpenSeasonalTheme={onOpenSeasonalTheme}
          onOpenLeaderboard={onOpenLeaderboard}
          onSwitchToKidsMode={onSwitchToKidsMode}
          streakDays={streakDays}
          gemsCount={gemsCount}
        />

        {/* WIDGET CUADERNO INTELIGENTE DE REPASO (SRS MISTAKES) */}
        {dueFlashcardsCount > 0 && onOpenFlashcards && (
          <div className="p-4 rounded-3xl bg-amber-50/90 border-2 border-amber-200 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-amber-950">
                  Cuaderno de Errores ({dueFlashcardsCount} frases listas)
                </h4>
                <p className="text-[11px] sm:text-xs text-amber-800 font-medium">
                  Repasa tus errores con repetición espaciada (+15 XP).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenFlashcards}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shrink-0 shadow-sm active:scale-95 transition cursor-pointer"
            >
              Repasar
            </button>
          </div>
        )}

        {/* WIDGET LIGA SEMANAL COMPACTO */}
        <WeeklyLeagueWidget
          userXP={userXP}
          userName={userName}
          userStreak={streakDays}
          onOpenFullLeaderboard={onOpenLeaderboard}
        />

        {dynamicUnits.map((unit) => {
          const completedCount = unit.nodes.filter((n) => n.status === "completed").length;
          const totalCount = unit.nodes.length;
          const isUnitCompleted = completedCount === totalCount;

          return (
            <section
              key={unit.id}
              className="flex flex-col gap-6"
            >
              {/* ENCABEZADO SÓLIDO Y ELEGANTE DE LA UNIDAD */}
              <div className="rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="flex flex-col gap-1 z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 font-black text-[11px] tracking-wider uppercase border border-indigo-400/20">
                      Unidad {unit.unitNumber} • {unit.level}
                    </span>
                    {isUnitCompleted && (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <Check className="w-3.5 h-3.5" />
                        Completada
                      </span>
                    )}
                    {!unit.isUnlocked && (
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        Bloqueada
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                    {unit.title}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed font-normal">
                    {unit.goalDescription}
                  </p>
                </div>

                {/* Progress Mini-Pill & Certificate Button */}
                <div className="z-10 shrink-0 self-end sm:self-center flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  {isUnitCompleted && onOpenCertificate && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenCertificate({
                          unitTitle: unit.title,
                          unitNumber: unit.unitNumber,
                          cefrLevel: unit.level,
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer active:scale-95"
                    >
                      <Award className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Certificado</span>
                    </button>
                  )}
                  <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                    {completedCount} / {totalCount} pasos
                  </div>
                </div>
              </div>

              {/* TIMELINE VERTICAL DE NODOS */}
              <div className="flex flex-col items-center gap-8 py-2 relative">
                {/* Línea vertical conectora continua */}
                <div className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-1.5 bg-slate-200 rounded-full pointer-events-none z-0" />

                {unit.nodes.map((node, nodeIdx) => {
                  const isCompleted = node.status === "completed";
                  const isCurrent = node.status === "current";
                  const isLocked = node.status === "locked";
                  const isBoss = node.type === "boss_roleplay";

                  // Patrón de sinuosidad sutil:
                  // 0: centro | 1: izquierda (-32px) | 2: derecha (+32px) | 3: centro
                  const offsetClass =
                    nodeIdx % 3 === 1
                      ? "-translate-x-8 sm:-translate-x-12"
                      : nodeIdx % 3 === 2
                      ? "translate-x-8 sm:translate-x-12"
                      : "translate-x-0";

                  return (
                    <div
                      key={node.id}
                      className={`relative z-10 flex flex-col items-center group transition-transform ${offsetClass}`}
                    >
                      {/* Botón Circular del Nodo */}
                      <button
                        type="button"
                        onClick={() => handleNodeClick(node)}
                        disabled={isLocked}
                        className={`relative transition-all duration-300 select-none cursor-pointer flex items-center justify-center ${
                          isBoss
                            ? "w-20 h-20 sm:w-24 sm:h-24 rounded-3xl"
                            : "w-16 h-16 sm:w-18 sm:h-18 rounded-full"
                        } ${
                          isCompleted
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95"
                            : isCurrent
                            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 ring-4 ring-indigo-400/40 animate-pulse hover:scale-110 active:scale-95"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-75"
                        }`}
                      >
                        {/* Indicador de Corona si es Boss */}
                        {isBoss && isCurrent && (
                          <div className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Crown className="w-3 h-3 fill-slate-950" />
                            <span>Boss</span>
                          </div>
                        )}

                        {/* Ícono o Contenido del Nodo */}
                        {isCompleted ? (
                          <Check className="w-7 h-7 stroke-[3]" />
                        ) : isLocked ? (
                          <Lock className="w-6 h-6 stroke-[2.5]" />
                        ) : isBoss ? (
                          <Trophy className="w-8 h-8 text-amber-300" />
                        ) : (
                          <span className="text-2xl">{node.icon || "⭐"}</span>
                        )}

                        {/* Badge de "EMPEZAR" para el nodo actual */}
                        {isCurrent && (
                          <div className="absolute -bottom-6 px-3 py-1 rounded-full bg-indigo-950 text-white text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                            Empezar
                          </div>
                        )}
                      </button>

                      {/* Título de la Lección Debajo del Nodo */}
                      <div className="mt-3 text-center max-w-[140px]">
                        <p
                          className={`text-xs font-bold leading-tight ${
                            isCurrent
                              ? "text-indigo-950"
                              : isCompleted
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {node.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* 3. MODAL RÁPIDO DE DETALLE DE LECCIÓN ANTES DE EMPEZAR */}
      {selectedNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-150">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                selectedNodeModal.type === "boss_roleplay"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              {selectedNodeModal.icon || "⭐"}
            </div>

            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-indigo-600 px-2 py-0.5 rounded-full bg-indigo-50">
                {selectedNodeModal.type === "boss_roleplay" ? "Simulación Final" : "Paso Práctico"}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                {selectedNodeModal.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedNodeModal.subtitle}
              </p>
            </div>

            <div className="w-full flex items-center justify-center gap-4 py-2 border-y border-slate-100 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>+{selectedNodeModal.xp} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>Práctica Guiada</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmStart}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Comenzar Lección</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedNodeModal(null)}
                className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-600 text-xs font-semibold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
