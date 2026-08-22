import React, { useState } from "react";
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
} from "lucide-react";
import { CEFRLevel, RoleplayScenarioItem } from "../types";
import { playPopSound, playCoinSound } from "../utils/audioSynth";

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
        scenarioId: "daily_coffee",
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
        scenarioId: "daily_coffee",
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
        scenarioId: "daily_coffee",
        icon: "✉️",
      },
      {
        id: "u2-n2",
        title: "Participar en la Daily",
        subtitle: "Qué hiciste ayer, qué harás hoy",
        type: "lesson",
        status: "locked",
        xp: 35,
        scenarioId: "daily_coffee",
        icon: "🗣️",
      },
      {
        id: "u2-n3",
        title: "Reporte de Bloqueos",
        subtitle: "Cómo pedir ayuda y explicar problemas",
        type: "practice",
        status: "locked",
        xp: 40,
        scenarioId: "daily_coffee",
        icon: "⚡",
      },
      {
        id: "u2-boss",
        title: "Simulación: Reunión con el Manager",
        subtitle: "Presenta el avance de tus proyectos clave",
        type: "boss_roleplay",
        status: "locked",
        xp: 75,
        scenarioId: "job_interview",
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
        scenarioId: "job_interview",
        icon: "💼",
      },
      {
        id: "u3-n2",
        title: "Preguntas de Comportamiento (STAR)",
        subtitle: "Situación, Tarea, Acción y Resultado",
        type: "practice",
        status: "locked",
        xp: 50,
        scenarioId: "job_interview",
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
        scenarioId: "tech_startup",
        icon: "💡",
      },
      {
        id: "u4-boss",
        title: "Simulación: Cierre de Acuerdo con Clientes",
        subtitle: "Roleplay final de alta exigencia ejecutiva",
        type: "boss_roleplay",
        status: "locked",
        xp: 120,
        scenarioId: "tech_startup",
        icon: "🏆",
      },
    ],
  },
];

import { DailyGoalProgressRing } from "./DailyGoalProgressRing";

export interface AdultLearningPathProps {
  currentLevel: CEFRLevel;
  streakDays: number;
  gemsCount: number;
  onStartLesson: (node: LessonNode) => void;
  onOpenRoleplayModal?: () => void;
  onOpenPlacementTest?: () => void;
}

export function AdultLearningPath({
  currentLevel,
  streakDays,
  gemsCount,
  onStartLesson,
  onOpenRoleplayModal,
  onOpenPlacementTest,
}: AdultLearningPathProps) {
  const [selectedNodeModal, setSelectedNodeModal] = useState<LessonNode | null>(null);

  const handleNodeClick = (node: LessonNode) => {
    if (node.status === "locked") return;

    playPopSound();
    setSelectedNodeModal(node);
  };

  const handleConfirmStart = () => {
    if (!selectedNodeModal) return;
    playCoinSound();
    const target = selectedNodeModal;
    setSelectedNodeModal(null);
    onStartLesson(target);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center pb-32">
      
      {/* 1. TOP BAR ELEGANTE & MINIMALISTA */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Selector de Idioma Activo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-base shadow-xs">
              🇺🇸
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                English Pro
              </span>
              <span className="text-[10px] font-semibold text-indigo-600">
                Nivel {currentLevel} (CEFR)
              </span>
            </div>
          </div>

          {/* Gamification Stats: Racha y Gemas */}
          <div className="flex items-center gap-3">
            {/* Racha con fuego resplandeciente */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 font-extrabold text-xs shadow-xs">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{streakDays}</span>
            </div>

            {/* Gemas */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-900 font-extrabold text-xs shadow-xs">
              <span className="text-sm">💎</span>
              <span>{gemsCount}</span>
            </div>

            {/* Test de nivel discreto */}
            {onOpenPlacementTest && (
              <button
                type="button"
                onClick={onOpenPlacementTest}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                title="Evaluar mi nivel CEFR"
              >
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. FEED VERTICAL DE UNIDADES & TIMELINE */}
      <main className="w-full max-w-xl mx-auto px-4 pt-4 sm:pt-6 flex flex-col gap-8">
        {/* COMPONENTE META DIARIA DE APRENDIZAJE (PROGRESS RING UI) */}
        <DailyGoalProgressRing
          currentXp={35}
          targetXp={50}
          streakDays={streakDays}
          completedLessonsToday={2}
          targetLessonsToday={3}
        />

        {ADULT_UNITS.map((unit) => {
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
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                    {unit.title}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed font-normal">
                    {unit.goalDescription}
                  </p>
                </div>

                {/* Progress Mini-Pill */}
                <div className="z-10 shrink-0 self-end sm:self-center px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                  {completedCount} / {totalCount} pasos
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
