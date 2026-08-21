import React from "react";
import { motion } from "motion/react";
import { Check, Lock, Star, Play, Award, Compass, Zap } from "lucide-react";
import { LEARNING_UNITS } from "../data/learningPathData";
import { CEFRLevel, LearningPathNode } from "../types";

interface LearningPathViewProps {
  currentLevel: CEFRLevel;
  onSelectScenario: (scenarioId: string) => void;
  onOpenSpeedSpeaking: () => void;
  onOpenDiagnostic: () => void;
}

export function LearningPathView({
  currentLevel,
  onSelectScenario,
  onOpenSpeedSpeaking,
  onOpenDiagnostic,
}: LearningPathViewProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-28 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-amber-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-black shadow-md">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                Nivel Actual: {currentLevel}
              </span>
              <span className="text-xs text-amber-300 font-semibold">Marco Común Europeo (CEFR)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Tu Ruta Hacia la Fluidez
            </h2>
            <p className="text-xs text-slate-300">
              Avanza unidad por unidad con roleplay guiado y retos de pronunciación.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDiagnostic}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-black shadow-md hover:scale-105 transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <Award className="w-4 h-4" />
          <span>Test de Nivel (Placement)</span>
        </button>
      </div>

      {/* Units Roadmap */}
      <div className="flex flex-col gap-8">
        {LEARNING_UNITS.map((unit) => (
          <div
            key={unit.id}
            className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-6 shadow-xl relative overflow-hidden"
          >
            {/* Unit Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-5">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                  Unidad {unit.unitNumber} • Nivel {unit.level}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {unit.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{unit.theme}</p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300">
                {unit.nodes.filter((n) => n.status === "completed").length} / {unit.nodes.length}
              </span>
            </div>

            {/* Nodes Sinuous Path */}
            <div className="flex flex-col gap-10 relative py-6">
              {/* Dashed Line Connector */}
              <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 border-l-8 border-dashed border-gray-300 pointer-events-none z-0" />

              {unit.nodes.map((node, idx) => {
                const isCompleted = node.status === "completed";
                const isCurrent = node.status === "current";
                const isLocked = node.status === "locked";

                // Alternating Alignment:
                // Indices 0, 4, 8 -> self-start ml-4
                // Indices 1, 3, 5, 7 -> self-center
                // Indices 2, 6 -> self-end mr-4
                const mod = idx % 4;
                const alignmentClass =
                  mod === 0
                    ? "self-start ml-4"
                    : mod === 2
                    ? "self-end mr-4"
                    : "self-center";

                const handleAction = () => {
                  if (isLocked) return;
                  if (node.scenarioId) onSelectScenario(node.scenarioId);
                  else if (node.type === "speed") onOpenSpeedSpeaking();
                };

                return (
                  <div
                    key={node.id}
                    className={`relative z-10 flex flex-col items-center group transition-all duration-300 ${alignmentClass}`}
                  >
                    {/* Current Node Indicator Badge */}
                    {isCurrent && (
                      <div className="absolute -top-7 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider shadow-lg animate-bounce pointer-events-none">
                        <Zap className="w-3 h-3 fill-current" />
                        <span>ACTUAL</span>
                      </div>
                    )}

                    {/* Perfect Circular Level Node (w-24 h-24 rounded-full) */}
                    <button
                      type="button"
                      onClick={handleAction}
                      disabled={isLocked}
                      className={`
                        relative w-24 h-24 rounded-full flex flex-col items-center justify-center
                        transform transition-all duration-200 ease-out select-none shadow-xl
                        focus:outline-none focus:ring-4
                        ${
                          isCompleted
                            ? "bg-gradient-to-b from-emerald-500 to-teal-600 text-white border-4 border-emerald-300 shadow-[0_6px_0_#065f46] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_#065f46] cursor-pointer hover:scale-105"
                            : isCurrent
                            ? "bg-gradient-to-b from-amber-400 via-orange-500 to-amber-500 text-slate-950 border-4 border-amber-200 shadow-[0_6px_0_#c2410c] hover:brightness-110 hover:scale-105 active:translate-y-1 active:shadow-[0_2px_0_#c2410c] ring-4 ring-amber-400/40 cursor-pointer animate-pulse"
                            : "bg-slate-900 text-slate-500 border-4 border-slate-700 shadow-inner cursor-not-allowed opacity-60"
                        }
                      `}
                    >
                      {/* Node Icon or Status */}
                      {isCompleted ? (
                        <Check className="w-9 h-9 text-white stroke-[3.5]" />
                      ) : isLocked ? (
                        <Lock className="w-8 h-8 opacity-70" />
                      ) : (
                        <span className="text-3xl filter drop-shadow-md">
                          {node.icon || "🎯"}
                        </span>
                      )}

                      <span className="text-[10px] font-black tracking-tighter uppercase mt-0.5">
                        {isCompleted ? "Listo" : isCurrent ? "Jugar" : `Nivel ${idx + 1}`}
                      </span>
                    </button>

                    {/* Title & Details Below Circle */}
                    <div className="mt-3 text-center max-w-[140px]">
                      <h4
                        className={`text-xs font-black tracking-tight leading-tight ${
                          isCompleted
                            ? "text-emerald-300"
                            : isCurrent
                            ? "text-amber-300"
                            : "text-slate-500"
                        }`}
                      >
                        {node.title}
                      </h4>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5 line-clamp-1">
                        {node.description}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400">
                        <span className="text-amber-300">+{node.xpReward} XP</span>
                        <span>•</span>
                        <span className="text-orange-300">+{node.gemsReward} 💎</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
