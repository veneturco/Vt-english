import React from "react";
import {
  X,
  Compass,
  Briefcase,
  Plane,
  Coffee,
  Code,
  GraduationCap,
  Sparkles,
  Check,
} from "lucide-react";
import { TopicScenario } from "../types";
import { TOPIC_SCENARIOS } from "../data/presets";

interface TopicSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopicId: string;
  onSelectTopic: (topic: TopicScenario) => void;
}

export const TopicSelectorModal: React.FC<TopicSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTopicId,
  onSelectTopic,
}) => {
  if (!isOpen) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case "Briefcase":
        return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case "Plane":
        return <Plane className="w-5 h-5 text-sky-400" />;
      case "Coffee":
        return <Coffee className="w-5 h-5 text-amber-400" />;
      case "Code":
        return <Code className="w-5 h-5 text-emerald-400" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#161b22] border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1117]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Escenarios y Temas de Conversación
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona una situación del mundo real para practicar con el tutor
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

        {/* List of scenarios */}
        <div className="p-5 overflow-y-auto max-h-[65vh] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {TOPIC_SCENARIOS.map((scenario) => {
            const isSelected = currentTopicId === scenario.id;
            return (
              <div
                key={scenario.id}
                onClick={() => {
                  onSelectTopic(scenario);
                  onClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30"
                    : "bg-[#0d1117] hover:bg-slate-800/80 border-slate-700/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                      {getIcon(scenario.iconName)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                        {scenario.levelRecommendation}+
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-sm mb-1">{scenario.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{scenario.subtitle}</p>
                </div>

                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                  {scenario.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
