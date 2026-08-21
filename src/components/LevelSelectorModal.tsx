import React from "react";
import { X, Award, Check, BookOpen, Sparkles } from "lucide-react";
import { CEFRLevel } from "../types";
import { LEVEL_DEFINITIONS } from "../data/presets";

interface LevelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: CEFRLevel;
  onSelectLevel: (level: CEFRLevel) => void;
}

export const LevelSelectorModal: React.FC<LevelSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-[#161b22] border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1117]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Nivel de Inglés (MCER / CEFR)
              </h3>
              <p className="text-xs text-slate-400">
                El tutor adaptará su velocidad, vocabulario y complejidad gramatical
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Options */}
        <div className="p-5 overflow-y-auto space-y-3">
          {(Object.keys(LEVEL_DEFINITIONS) as CEFRLevel[]).map((levelKey) => {
            const info = LEVEL_DEFINITIONS[levelKey];
            const isSelected = currentLevel === levelKey;
            return (
              <div
                key={levelKey}
                onClick={() => {
                  onSelectLevel(levelKey);
                  onClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 ${
                  isSelected
                    ? "bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30"
                    : "bg-[#0d1117] hover:bg-slate-800/80 border-slate-700/80"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow-md bg-gradient-to-br ${info.color}`}
                  >
                    {info.level}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        {info.title}
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">
                        ({info.subtitle})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{info.description}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
