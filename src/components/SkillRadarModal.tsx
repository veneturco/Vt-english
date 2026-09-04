import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  BarChart3,
  Sparkles,
  X,
  CheckCircle2,
  TrendingUp,
  Clock,
  BookOpen,
  Zap,
} from "lucide-react";
import { soundFx } from "../utils/soundFx";

interface SkillRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  fluencyScore?: number; // 0 - 100
  pronunciationScore?: number;
  grammarScore?: number;
  vocabularyScore?: number;
  comprehensionScore?: number;
  cefrLevel?: string;
  totalStudyHours?: number;
  streakDays?: number;
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
  totalStudyHours = 14.5,
  streakDays = 7,
}) => {
  if (!isOpen) return null;

  const skills = [
    { name: "Pronunciación", score: pronunciationScore, color: "#10b981", label: "Fonética" },
    { name: "Velocidad", score: fluencyScore, color: "#0ea5e9", label: "WPM / Fluidez" },
    { name: "Vocabulario", score: vocabularyScore, color: "#f59e0b", label: "Riqueza Léxica" },
    { name: "Gramática", score: grammarScore, color: "#f43f5e", label: "Estructura" },
    { name: "Retención SRS", score: comprehensionScore, color: "#8b5cf6", label: "Memoria Largo Plazo" },
  ];

  const overallAverage = Math.round(
    (fluencyScore + pronunciationScore + grammarScore + vocabularyScore + comprehensionScore) / 5
  );

  // SVG Spider Radar Calculations (5 points)
  const size = 220;
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = skills.length;

  const getCoordinates = (index: number, valueRatio: number) => {
    // 0 is top (-pi/2)
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  // Polygon points for actual score
  const polygonPoints = skills
    .map((s, idx) => {
      const { x, y } = getCoordinates(idx, s.score / 100);
      return `${x},${y}`;
    })
    .join(" ");

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Identify lowest skill for executive coaching tip
  const sortedSkills = [...skills].sort((a, b) => a.score - b.score);
  const weakestSkill = sortedSkills[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Radar de Fluidez & Analítica Ejecutiva
                </h3>
                <p className="text-xs font-semibold text-slate-400">
                  Desglose psicométrico y evolución continua de competencias
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Nivel Actual
              </span>
              <span className="text-xl font-black text-white">CEFR {cefrLevel}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">
                Índice Global
              </span>
              <span className="text-xl font-black text-indigo-400">{overallAverage}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                Proyección B2
              </span>
              <span className="text-xl font-black text-amber-400">28 días</span>
            </div>
          </div>

          {/* Center Visual Spider / Radar Chart */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-950/70 rounded-3xl border border-slate-800/80 mb-4 relative">
            <svg width={size} height={size} className="overflow-visible">
              {/* Concentric grid webs */}
              {gridLevels.map((lvl, gIdx) => {
                const gridPoints = skills
                  .map((_, idx) => {
                    const { x, y } = getCoordinates(idx, lvl);
                    return `${x},${y}`;
                  })
                  .join(" ");

                return (
                  <polygon
                    key={gIdx}
                    points={gridPoints}
                    fill="none"
                    stroke="#334155"
                    strokeWidth={gIdx === gridLevels.length - 1 ? "1.5" : "0.75"}
                    strokeDasharray={gIdx === gridLevels.length - 1 ? "" : "3 3"}
                  />
                );
              })}

              {/* Axis lines from center */}
              {skills.map((_, idx) => {
                const { x, y } = getCoordinates(idx, 1.0);
                return (
                  <line
                    key={idx}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Filled Student Polygon */}
              <polygon
                points={polygonPoints}
                fill="rgba(99, 102, 241, 0.35)"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Data points on vertices */}
              {skills.map((s, idx) => {
                const { x, y } = getCoordinates(idx, s.score / 100);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={s.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>

            {/* Quick Skill Labels around polygon */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-2 pt-2 border-t border-slate-800/80 text-xs">
              {skills.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300 font-semibold">{s.name}</span>
                  </div>
                  <span className="font-extrabold text-white">{s.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Executive Coaching Tip */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3 mb-4">
            <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h5 className="text-xs font-black text-indigo-200">
                Plan de Aceleración Sugerido
              </h5>
              <p className="text-[11px] text-indigo-300 leading-relaxed">
                Tu mayor oportunidad de mejora está en <strong>{weakestSkill.name}</strong> ({weakestSkill.score}%). Te recomendamos realizar una sesión en el <strong>Cuaderno de Repaso SRS</strong> o completar un reto <strong>Blitz de 60s</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-full py-3 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs shadow-md transition cursor-pointer active:scale-98"
          >
            Continuar Mi Plan de Aprendizaje
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
