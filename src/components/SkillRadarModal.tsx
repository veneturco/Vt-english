import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, BarChart3, Sparkles, X, CheckCircle2 } from "lucide-react";
import { soundFx } from "../utils/soundFx";

interface SkillRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  fluencyScore: number; // 0 - 100
  pronunciationScore: number;
  grammarScore: number;
  vocabularyScore: number;
  comprehensionScore: number;
  cefrLevel: string;
}

export const SkillRadarModal: React.FC<SkillRadarModalProps> = ({
  isOpen,
  onClose,
  fluencyScore = 82,
  pronunciationScore = 88,
  grammarScore = 79,
  vocabularyScore = 85,
  comprehensionScore = 90,
  cefrLevel = "B1",
}) => {
  if (!isOpen) return null;

  const skills = [
    { name: "Pronunciación & Fonética", score: pronunciationScore, color: "bg-emerald-500", text: "text-emerald-400" },
    { name: "Fluidez & Velocidad", score: fluencyScore, color: "bg-sky-500", text: "text-sky-400" },
    { name: "Amplitud de Vocabulario", score: vocabularyScore, color: "bg-amber-500", text: "text-amber-400" },
    { name: "Comprensión Auditiva", score: comprehensionScore, color: "bg-purple-500", text: "text-purple-400" },
    { name: "Gramática & Tiempos", score: grammarScore, color: "bg-rose-500", text: "text-rose-400" },
  ];

  const overallAverage = Math.round(
    (fluencyScore + pronunciationScore + grammarScore + vocabularyScore + comprehensionScore) / 5
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-slate-900 border-2 border-b-8 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Diagnóstico de Habilidades</h3>
                <p className="text-xs font-bold text-slate-400">Evaluación continua CEFR en tiempo real</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border-2 border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Overall Score Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nivel Actual</span>
              <span className="text-2xl font-black text-white">CEFR {cefrLevel}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Puntaje Global</span>
              <span className="text-2xl font-black text-emerald-400">{overallAverage}%</span>
            </div>
          </div>

          {/* Skill Bars */}
          <div className="flex flex-col gap-3 mb-4">
            {skills.map((skill) => (
              <div key={skill.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">{skill.name}</span>
                  <span className={`font-black ${skill.text}`}>{skill.score}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <motion.div
                    className={`h-full ${skill.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-full py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs border-2 border-b-4 border-emerald-700 active:border-b-2 active:translate-y-0.5 transition shadow-sm"
          >
            Entendido, Seguir Practicando
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
