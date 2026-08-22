import React, { useState } from "react";
import {
  X,
  Flame,
  Star,
  Target,
  Sparkles,
  Award,
  BookOpen,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  TrendingUp,
  User,
  Shield,
} from "lucide-react";
import { useKidsProgress } from "../hooks/useKidsProgress";
import { KIDS_MISSIONS } from "../data/kidsMissionsData";
import { playPopSound } from "../utils/audioSynth";

export interface ParentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

interface VocabularyMetric {
  id: string;
  word: string;
  category: string;
  spanish: string;
  accuracy: number;
  status: "mastered" | "needs_review" | "in_progress";
  attempts: number;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  isOpen,
  onClose,
  studentName = "Amir Yasir",
}) => {
  const { streakDays, stars, coins, completedMissions } = useKidsProgress();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "mastered" | "review">("all");

  if (!isOpen) return null;

  // Vocabulario y métricas pedagógicas
  const vocabularyList: VocabularyMetric[] = [
    {
      id: "v-apple",
      word: "Apple",
      category: "Frutas / Alimentos",
      spanish: "Manzana",
      accuracy: 94,
      status: "mastered",
      attempts: 5,
    },
    {
      id: "v-blue",
      word: "Blue",
      category: "Colores",
      spanish: "Azul",
      accuracy: 88,
      status: "mastered",
      attempts: 4,
    },
    {
      id: "v-lion",
      word: "Lion",
      category: "Animales",
      spanish: "León",
      accuracy: 62,
      status: "needs_review",
      attempts: 3,
    },
    {
      id: "v-cookie",
      word: "Cookie",
      category: "Alimentos",
      spanish: "Galleta",
      accuracy: 78,
      status: "mastered",
      attempts: 2,
    },
    {
      id: "v-yellow",
      word: "Yellow",
      category: "Colores",
      spanish: "Amarillo",
      accuracy: 68,
      status: "needs_review",
      attempts: 3,
    },
  ];

  const filteredVocab = vocabularyList.filter((item) => {
    if (selectedFilter === "mastered") return item.status === "mastered";
    if (selectedFilter === "review") return item.status === "needs_review";
    return true;
  });

  const averageAccuracy = Math.round(
    vocabularyList.reduce((acc, curr) => acc + curr.accuracy, 0) / vocabularyList.length
  );

  const masteredCount = vocabularyList.filter((v) => v.status === "mastered").length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* CABECERA DEL PANEL */}
        <div className="px-6 py-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Reporte de Aprendizaje de {studentName}
                </h2>
                <span className="bg-indigo-950 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-800">
                  Control Parental
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitoreo de pronunciación fonética, retención y vocabulario dominado
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO SCROLLEABLE */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 3 TARJETAS DE MÉTRICAS PRINCIPALES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. RACHA DE ESTUDIO */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Flame className="w-6 h-6 fill-orange-400/20" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Racha Activa
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-white">{streakDays}</span>
                  <span className="text-xs text-slate-400">días seguidos</span>
                </div>
              </div>
            </div>

            {/* 2. PRECISIÓN PROMEDIO */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Precisión Fonética
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-emerald-400">{averageAccuracy}%</span>
                  <span className="text-xs text-slate-400">promedio</span>
                </div>
              </div>
            </div>

            {/* 3. VOCABULARIO Y ESTRELLAS */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Palabras Dominadas
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-indigo-300">
                    {masteredCount}/{vocabularyList.length}
                  </span>
                  <span className="text-xs text-slate-400">({stars} ⭐)</span>
                </div>
              </div>
            </div>

          </div>

          {/* SECCIÓN DE PALABRAS RECIENTES Y ANÁLISIS */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Vocabulario Reciente y Nivel de Retención</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Desglose de palabras practicadas con evaluación de pronunciación
                </p>
              </div>

              {/* FILTROS */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    selectedFilter === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Todas ({vocabularyList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("mastered")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    selectedFilter === "mastered"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Dominadas ({masteredCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("review")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    selectedFilter === "review"
                      ? "bg-amber-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Repasar ({vocabularyList.length - masteredCount})
                </button>
              </div>
            </div>

            {/* TABLA / LISTA DE VOCABULARIO */}
            <div className="divide-y divide-slate-800/80">
              {filteredVocab.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between hover:bg-slate-900/50 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {item.word.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{item.word}</span>
                        <span className="text-xs text-slate-400">({item.spanish})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* BARRA DE PRECISIÓN */}
                    <div className="hidden sm:flex flex-col items-end gap-1 w-28">
                      <div className="flex justify-between w-full text-[11px] font-mono">
                        <span className="text-slate-400">{item.attempts} intentos</span>
                        <span
                          className={`font-bold ${
                            item.accuracy >= 70 ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {item.accuracy}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.accuracy >= 70 ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${item.accuracy}%` }}
                        />
                      </div>
                    </div>

                    {/* BADGE DE ESTADO */}
                    {item.status === "mastered" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dominada</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/80">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Necesita Repaso</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* CONSEJO PEDAGÓGICO */}
          <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-200">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Recomendación para los Padres:</span>
              {studentName} muestra excelente entusiasmo en categorías como frutas y colores. Para reforzar las palabras marcadas como <em>Necesita Repaso</em>, anímale a repetir los retos del Dino usando la opción de micrófono en sesiones cortas de 5 minutos diarios.
            </div>
          </div>

        </div>

        {/* PIE DEL PANEL */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Última sincronización: Hoy • Datos guardados localmente</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer"
          >
            Cerrar Reporte
          </button>
        </div>

      </div>
    </div>
  );
};
export default ParentDashboard;
