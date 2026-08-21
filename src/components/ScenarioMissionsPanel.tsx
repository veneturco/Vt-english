import React, { useState } from "react";
import { ScenarioGoal } from "../types";
import { CheckCircle2, Target, Trophy, ChevronDown, ChevronUp } from "lucide-react";

interface ScenarioMissionsPanelProps {
  topicTitle: string;
  category: string;
  goals: ScenarioGoal[];
  onToggleGoal?: (goalId: string) => void;
}

export const ScenarioMissionsPanel: React.FC<ScenarioMissionsPanelProps> = ({
  topicTitle,
  category,
  goals,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!goals || goals.length === 0) return null;

  const completedCount = goals.filter((g) => g.completed).length;
  const progressPercent = Math.round((completedCount / goals.length) * 100);
  const isAllComplete = completedCount === goals.length;

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-2.5 sm:p-3 shadow-lg transition-all">
      {/* Header Bar / Collapsed Pill */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 text-left group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 truncate">
              Misión: {topicTitle}
            </span>
            {isAllComplete ? (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 animate-pulse">
                <Trophy className="w-3 h-3 text-emerald-400" /> ¡Completada!
              </span>
            ) : (
              <span className="text-[10px] text-amber-400/90 font-medium hidden sm:inline">
                ({completedCount}/{goals.length} objetivos)
              </span>
            )}
          </div>
        </div>

        {/* Right Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mini progress bar on collapsed */}
          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden xs:block">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAllComplete
                  ? "bg-emerald-400"
                  : "bg-gradient-to-r from-amber-500 to-orange-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition font-medium flex items-center gap-0.5">
            <span>{isExpanded ? "Ocultar" : "Ver"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>
        </div>
      </button>

      {/* Expanded Goal Items */}
      {isExpanded && (
        <div className="mt-3 pt-2.5 border-t border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {goals.map((goal, idx) => (
              <div
                key={goal.id}
                className={`p-2.5 rounded-xl border transition-all duration-300 flex items-start gap-2.5 ${
                  goal.completed
                    ? "bg-emerald-950/30 border-emerald-500/40 shadow-sm"
                    : "bg-slate-800/40 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {goal.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-500">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs leading-tight font-medium ${
                      goal.completed
                        ? "text-emerald-200 line-through opacity-90"
                        : "text-slate-200"
                    }`}
                  >
                    {goal.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {goal.targetKeywords.slice(0, 2).map((kw, kidx) => (
                      <span
                        key={kidx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono"
                      >
                        "{kw}"
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
