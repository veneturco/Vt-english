import React from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Gift, Sparkles, Trophy } from "lucide-react";
import { soundFx } from "../utils/soundFx";
import { haptics } from "../utils/haptics";

export interface DailyQuest {
  id: string;
  title: string;
  target: number;
  current: number;
  icon: string;
  rewardXp: number;
  completed: boolean;
}

interface DailyQuestsWidgetProps {
  quests: DailyQuest[];
  onClaimReward: (questId: string) => void;
}

export const DailyQuestsWidget: React.FC<DailyQuestsWidgetProps> = ({
  quests,
  onClaimReward,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const completedCount = quests.filter((q) => q.completed || q.current >= q.target).length;
  const allCompleted = completedCount === quests.length;

  return (
    <div className="w-full bg-slate-900 border-2 border-b-4 border-slate-800 rounded-3xl p-4 shadow-sm mb-4 select-none">
      {/* Header bar */}
      <div
        onClick={() => {
          soundFx.playPop();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">Misiones del Día</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {completedCount}/{quests.length}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400">
              {allCompleted ? "¡Todas las misiones completadas hoy! 🎉" : "Completa tus retos para ganar gemas extra"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Quest Items */}
      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t-2 border-slate-800 flex flex-col gap-2.5">
          {quests.map((quest) => {
            const isDone = quest.completed || quest.current >= quest.target;
            const progressPct = Math.min(100, Math.round((quest.current / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border-2 border-slate-800 gap-3"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-lg">{quest.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                      <span className="truncate">{quest.title}</span>
                      <span className="text-slate-400 ml-1 shrink-0">
                        {quest.current}/{quest.target}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone ? "bg-emerald-500" : "bg-amber-400"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reward Button */}
                {isDone ? (
                  <button
                    onClick={() => {
                      soundFx.playSuccess();
                      haptics.questComplete();
                      onClaimReward(quest.id);
                    }}
                    disabled={quest.completed}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border-2 border-b-4 transition-all ${
                      quest.completed
                        ? "bg-slate-800 text-slate-500 border-slate-700 cursor-default"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-700 active:border-b-2 active:translate-y-0.5"
                    }`}
                  >
                    {quest.completed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Listo</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-3.5 h-3.5" />
                        <span>+{quest.rewardXp} XP</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-400/80 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>+{quest.rewardXp} XP</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
