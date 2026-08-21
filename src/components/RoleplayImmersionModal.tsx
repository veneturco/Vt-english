import React, { useState } from "react";
import {
  X,
  Sparkles,
  MapPin,
  Briefcase,
  CheckCircle2,
  Play,
  Award,
  ArrowRight,
  Shield,
  Coffee,
  Plane,
  HeartPulse,
  Building,
  Rocket,
  MessageSquare,
} from "lucide-react";
import { ROLEPLAY_SCENARIOS } from "../data/roleplayScenariosData";
import { RoleplayScenarioItem } from "../types";

interface RoleplayImmersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: RoleplayScenarioItem) => void;
}

export const RoleplayImmersionModal: React.FC<RoleplayImmersionModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenarioItem>(ROLEPLAY_SCENARIOS[0]);

  if (!isOpen) return null;

  const handleStartRoleplay = (scenario: RoleplayScenarioItem) => {
    onSelectScenario(scenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0e131d] border border-amber-500/40 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#161c28]/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Simulaciones de Inmersión & Roleplay Real
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                  AI Actor Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Entrena situaciones reales de alto impacto: entrevistas en Silicon Valley, control de aduanas, Starbucks NYC y consultas médicas.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left: Scenarios Grid */}
          <div className="md:col-span-5 space-y-2.5 max-h-[62vh] overflow-y-auto pr-1">
            {ROLEPLAY_SCENARIOS.map((sc) => {
              const isSelected = selectedScenario.id === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedScenario(sc)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/60 shadow-lg"
                      : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/70 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {sc.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{sc.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span className="truncate">{sc.location}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-extrabold border border-slate-700 shrink-0">
                    {sc.difficulty}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Scenario Detail */}
          <div className="md:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4 max-h-[62vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Card Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedScenario.icon}</span>
                    <h4 className="text-base font-bold text-white">{selectedScenario.title}</h4>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                      Nivel {selectedScenario.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{selectedScenario.location}</span>
                  </p>
                </div>
              </div>

              {/* Persona Profile */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">
                  Tu Interlocutor de IA:
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm">{selectedScenario.personaName}</span>
                  <span className="text-slate-400 italic text-[11px]">{selectedScenario.personaRole}</span>
                </div>
                <p className="text-slate-300 pt-1 text-[11px]">
                  <strong>Primer mensaje:</strong> "{selectedScenario.initialTutorMessage}"
                </p>
              </div>

              {/* Objectives Checklist */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">
                  Objetivos Clave de la Misión:
                </span>
                <div className="space-y-1.5">
                  {selectedScenario.objectives.map((obj, i) => (
                    <div key={obj.id} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2 text-slate-200">
                      <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                      <span>{obj.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocabulario Clave */}
              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">
                  Vocabulario Clave Recomendado:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScenario.targetVocab.map((w, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25 text-[11px] font-medium">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <button
              type="button"
              onClick={() => handleStartRoleplay(selectedScenario)}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Comenzar Simulación con el Avatar 3D</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1117] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>AI Actor & Natural Conversation Engine v2.4</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};
