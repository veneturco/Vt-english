import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3,
  Clock,
  Brain,
  Flame,
  Sparkles,
  X,
  CheckCircle2,
  TrendingUp,
  Mic,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { soundFx } from "../utils/soundFx";

interface WeeklyProgressDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  wordsLearnedCount: number;
  totalSpeakingMinutes: number;
  cefrLevel: string;
  overallPronunciationScore?: number;
}

export const WeeklyProgressDashboardModal: React.FC<WeeklyProgressDashboardModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  wordsLearnedCount = 42,
  totalSpeakingMinutes = 18,
  cefrLevel = "B1",
  overallPronunciationScore = 92,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<"accuracy" | "minutes">("accuracy");

  if (!isOpen) return null;

  // Pronunciation accuracy progression over time (Monday to Sunday)
  const accuracyTrendData = [
    { day: "Lun", accuracy: 68, benchmark: 80, notes: "Alineación vocal" },
    { day: "Mar", accuracy: 74, benchmark: 80, notes: "Ritmo y acento" },
    { day: "Mié", accuracy: 79, benchmark: 80, notes: "Terminaciones -ed" },
    { day: "Jue", accuracy: 83, benchmark: 80, notes: "Sonidos Th sonoros" },
    { day: "Vie", accuracy: 87, benchmark: 80, notes: "Connected speech" },
    { day: "Sáb", accuracy: 90, benchmark: 80, notes: "Entonación ejecutiva" },
    {
      day: "Dom",
      accuracy: Math.max(88, Math.round(overallPronunciationScore)),
      benchmark: 80,
      notes: "Fluidez nativa",
    },
  ];

  // Daily speaking activity (Monday to Sunday)
  const weeklyData = [
    { day: "Lun", minutes: 5, active: true },
    { day: "Mar", minutes: 8, active: true },
    { day: "Mié", minutes: 12, active: true },
    { day: "Jue", minutes: 6, active: true },
    { day: "Vie", minutes: 15, active: true },
    { day: "Sáb", minutes: 10, active: true },
    { day: "Dom", minutes: 4, active: true },
  ];

  const maxMinutes = 15;
  const currentAccuracy = Math.max(88, Math.round(overallPronunciationScore));
  const accuracyImprovement = currentAccuracy - 68;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border-2 border-b-8 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-sky-500/20 border-2 border-sky-500/40 text-sky-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Progreso & Analíticas Semanales</h3>
                <p className="text-[11px] font-bold text-slate-400">Tu evolución en precisión de pronunciación y práctica</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border-2 border-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="p-3 rounded-2xl bg-slate-950 border-2 border-slate-800 flex flex-col items-center text-center">
              <div className="flex items-center gap-1 text-sky-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Hablado</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-white">{totalSpeakingMinutes + 42} min</span>
              <span className="text-[9px] font-bold text-slate-500">Esta semana</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border-2 border-slate-800 flex flex-col items-center text-center">
              <div className="flex items-center gap-1 text-emerald-400 mb-1">
                <Mic className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Precisión</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-emerald-400">{currentAccuracy}%</span>
              <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +{accuracyImprovement}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border-2 border-slate-800 flex flex-col items-center text-center">
              <div className="flex items-center gap-1 text-orange-400 mb-1">
                <Flame className="w-4 h-4 fill-orange-400" />
                <span className="text-[10px] font-black uppercase">Racha</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-white">{streakDays} días</span>
              <span className="text-[9px] font-bold text-emerald-400">Al rojo vivo 🔥</span>
            </div>
          </div>

          {/* Chart View Toggle Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-3">
            <button
              onClick={() => {
                soundFx.playPop();
                setActiveChartTab("accuracy");
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeChartTab === "accuracy"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Precisión Fonética (Línea)</span>
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setActiveChartTab("minutes");
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeChartTab === "minutes"
                  ? "bg-sky-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Minutos Diarios</span>
            </button>
          </div>

          {/* 1. Pronunciation Accuracy Trend Line Chart (Recharts) */}
          {activeChartTab === "accuracy" ? (
            <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-black text-white">
                    Tendencia de Pronunciación en el Tiempo
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="text-slate-400">Meta C2: 80%</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                    +{accuracyImprovement}% esta sem.
                  </span>
                </div>
              </div>

              <div className="w-full h-44 pt-2">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={160}>
                  <LineChart
                    data={accuracyTrendData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="accuracyLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                      axisLine={{ stroke: "#334155" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[50, 100]}
                      ticks={[50, 65, 80, 95, 100]}
                      tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border-2 border-emerald-500/40 p-2.5 rounded-xl shadow-xl">
                              <p className="text-[11px] font-black text-white flex items-center justify-between gap-2">
                                <span>Día {data.day}</span>
                                <span className="text-emerald-400 font-extrabold text-xs">
                                  {data.accuracy}%
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{data.notes}</p>
                              <p className="text-[9px] text-sky-400 mt-1 font-bold">
                                {data.accuracy >= 80 ? "✨ Meta B2 Superada" : "En progreso"}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      y={80}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: "Meta B2 (80%)",
                        fill: "#f59e0b",
                        fontSize: 9,
                        position: "insideTopRight",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="url(#accuracyLineGrad)"
                      strokeWidth={3.5}
                      dot={{
                        r: 4.5,
                        fill: "#10b981",
                        stroke: "#0f172a",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 7,
                        fill: "#34d399",
                        stroke: "#ffffff",
                        strokeWidth: 2.5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* 2. Weekly Minutes Bar Chart */
            <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>Tiempo de Práctica Oral por Día</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">Meta: 10 min/día</span>
              </div>

              {/* Bars */}
              <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-1">
                {weeklyData.map((item) => {
                  const heightPercent = Math.min(100, Math.round((item.minutes / maxMinutes) * 100));
                  const isTargetMet = item.minutes >= 10;

                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[9px] font-black text-slate-400">{item.minutes}m</span>
                      <div className="w-full h-full max-h-[70px] bg-slate-900 rounded-t-lg flex items-end overflow-hidden">
                        <motion.div
                          className={`w-full rounded-t-lg ${
                            isTargetMet
                              ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                              : "bg-gradient-to-t from-sky-600 to-sky-400"
                          }`}
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CEFR Level Mastery Progress */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-xs flex items-center justify-center">
                {cefrLevel}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white">Dominio del Nivel {cefrLevel}</span>
                <span className="text-[10px] text-slate-400">76% completado para desbloquear B2</span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-xl border border-emerald-500/30">
              76%
            </span>
          </div>

          {/* Action */}
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs border-2 border-b-4 border-sky-700 active:border-b-2 active:translate-y-0.5 transition shadow-sm cursor-pointer"
          >
            Continuar Mi Entrenamiento
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
