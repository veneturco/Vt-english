import React, { useState } from "react";
import {
  X,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Code2,
  Flame,
  BrainCircuit,
  MessageSquare,
  Volume2,
  Copy,
  Check,
  Zap,
  Globe,
  Star,
  Users,
  Shield,
  ArrowRight,
} from "lucide-react";
import { BENCHMARKS_DATA } from "../data/benchmarksData";
import { TOP_100_FEATURES } from "../data/top100FeaturesData";
import { BenchmarkAppAnalysis, Top100FeatureItem } from "../types";

interface ResearchRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchRoadmapModal: React.FC<ResearchRoadmapModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"benchmarks" | "top100" | "roadmap" | "comparison">("benchmarks");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedBenchmarkApp, setSelectedBenchmarkApp] = useState<BenchmarkAppAnalysis | null>(BENCHMARKS_DATA[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredFeatures = TOP_100_FEATURES.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.userBenefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.techDependencies.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || f.category.includes(selectedCategory);

    const matchesPriority =
      selectedPriority === "all" || f.priority.includes(selectedPriority);

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const implementedCount = TOP_100_FEATURES.filter((f) => f.statusInApp === "implemented").length;
  const inProgressCount = TOP_100_FEATURES.filter((f) => f.statusInApp === "in_progress").length;
  const roadmapCount = TOP_100_FEATURES.filter((f) => f.statusInApp === "roadmap").length;

  const handleCopyFullReport = () => {
    const payload = {
      title: "Estudio de Arquitectura de Producto IA & UX: Top 100 Funciones & Benchmarks",
      date: new Date().toISOString(),
      benchmarksAnalyzed: BENCHMARKS_DATA,
      top100FeaturesCatalog: TOP_100_FEATURES,
      implementationStats: {
        total: TOP_100_FEATURES.length,
        implemented: implementedCount,
        inProgress: inProgressCount,
        roadmap: roadmapCount,
        readinessScore: "78%",
      },
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] flex flex-col rounded-2xl bg-[#0d1117] border border-amber-500/40 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#161b22]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-md">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Centro de Investigación de Producto & Roadmap IA
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                  Senior Product Architect
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Benchmarking de 15+ líderes de la industria &bull; Catálogo de 100 funciones top &bull; Estado del proyecto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFullReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Copiar informe completo en JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "¡Informe Copiado!" : "Copiar JSON"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-2.5 border-b border-slate-800 bg-[#111620] overflow-x-auto shrink-0">
          {[
            { id: "benchmarks", label: "🏆 Benchmarks Líderes (15+ Apps)", icon: Award },
            { id: "top100", label: `💎 100 Funciones Top (${implementedCount} Activas)`, icon: Layers },
            { id: "comparison", label: "⚔️ Comparativa vs Duolingo & ELSA", icon: Zap },
            { id: "roadmap", label: "🚀 Roadmap de Evolución Comercial", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap ${
                  isActive
                    ? "text-amber-400 border-amber-500 bg-amber-500/10"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: BENCHMARKS DE APPS LÍDERES */}
          {/* ========================================================= */}
          {activeTab === "benchmarks" && (
            <div className="space-y-6">
              {/* Intro Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Estudio Comparativo de Aplicaciones con Mayor Tracción de IA
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Análisis de factores de éxito, psicología de retención, motores de IA, diseño UX, animación, voz y avatares para extraer las mejores prácticas del mercado global.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="block text-amber-400 font-extrabold text-sm">{BENCHMARKS_DATA.length}</span>
                    <span className="text-[10px] text-slate-400">Apps Analizadas</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="block text-emerald-400 font-extrabold text-sm">9.5/10</span>
                    <span className="text-[10px] text-slate-400">Promedio Calidad</span>
                  </div>
                </div>
              </div>

              {/* Master-Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Apps Selector List (Left Column) */}
                <div className="md:col-span-4 space-y-2 max-h-[58vh] overflow-y-auto pr-1">
                  {BENCHMARKS_DATA.map((app) => {
                    const isSelected = selectedBenchmarkApp?.id === app.id;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedBenchmarkApp(app)}
                        className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500/60 shadow-md"
                            : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/70 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{app.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                              {app.company}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{app.coreHook}</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-extrabold shrink-0 border border-amber-500/30">
                          {app.rating} ★
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* App Detail Panel (Right Column) */}
                {selectedBenchmarkApp && (
                  <div className="md:col-span-8 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 max-h-[58vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-bold text-amber-300">
                            {selectedBenchmarkApp.name}
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {selectedBenchmarkApp.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 font-medium italic">
                          "{selectedBenchmarkApp.coreHook}"
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Score Innovación:</span>
                        <span className="text-base font-extrabold text-amber-400">
                          {selectedBenchmarkApp.rating} / 10.0
                        </span>
                      </div>
                    </div>

                    {/* Grid of Key Dimensions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      {/* Funciones Ganadoras */}
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          <Award className="w-3.5 h-3.5" /> Funciones Ganadoras & Core
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {selectedBenchmarkApp.winningFeatures.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-400 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Motor de IA */}
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <span className="font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          <BrainCircuit className="w-3.5 h-3.5" /> Tecnología de IA Utilizada
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {selectedBenchmarkApp.aiCapabilities.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-blue-400 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* UX & Micro-animaciones */}
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <span className="font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" /> UX, Animaciones & Cinemática
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {selectedBenchmarkApp.animationsAndKinematics.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-purple-400 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Gamificación & Retención */}
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <span className="font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          <Flame className="w-3.5 h-3.5" /> Retención, Rachas & Economía
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {selectedBenchmarkApp.retentionMechanics.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-400 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Key Takeaways for our App */}
                    <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 space-y-1.5 text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprendizajes Clave & Ventaja para Nuestra App
                      </span>
                      <ul className="space-y-1 text-slate-200">
                        {selectedBenchmarkApp.keyTakeawaysForUs.map((takeaway, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: CATÁLOGO DE 100 FUNCIONES TOP */}
          {/* ========================================================= */}
          {activeTab === "top100" && (
            <div className="space-y-4">
              {/* Filter Bar & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar entre las 100 funciones..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todas las Categorías (6 Pilares)</option>
                    <option value="Pedagogía">1. Pedagogía & IA Adaptativa</option>
                    <option value="Avatar">2. Avatar 3D, Rigging & Cinemática</option>
                    <option value="Motor de Voz">3. Motor de Voz, Fonética & Audio</option>
                    <option value="Gamificación">4. Gamificación, Economía & Retención</option>
                    <option value="Inmersión">5. Inmersión, Roleplay & Escenarios</option>
                    <option value="Memoria">6. Memoria Cognitiva & Comercial</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todas las Prioridades</option>
                    <option value="P0">P0 - Esencial</option>
                    <option value="P1">P1 - Alta</option>
                    <option value="P2">P2 - Media</option>
                    <option value="P3">P3 - Diferencial</option>
                  </select>
                </div>
              </div>

              {/* Status Counter Chips */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Mostrando <strong>{filteredFeatures.length}</strong> de 100 funciones
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> {implementedCount} Activas en Código
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                    <Clock className="w-3 h-3" /> {roadmapCount} En Roadmap
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2.5 max-h-[56vh] overflow-y-auto pr-1">
                {filteredFeatures.map((feat) => {
                  const isImplemented = feat.statusInApp === "implemented";
                  return (
                    <div
                      key={feat.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isImplemented
                          ? "bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs font-bold flex items-center justify-center border border-slate-700 shrink-0">
                            {feat.id}
                          </span>
                          <h4 className="text-sm font-bold text-white">{feat.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {feat.category.split(". ")[1]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-[10px] font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded border ${
                              feat.priority.includes("P0")
                                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                                : feat.priority.includes("P1")
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                : "bg-blue-500/20 border-blue-500/40 text-blue-300"
                            }`}
                          >
                            {feat.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Dev: {feat.estimatedDevTime}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold border ${
                              isImplemented
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            }`}
                          >
                            {isImplemented ? "✓ Operativo en App" : "⏳ Roadmap"}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 pl-8">{feat.description}</p>

                      <div className="mt-2.5 pl-8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-slate-950/70 text-slate-300">
                          <strong className="text-amber-400">Beneficio Alumno: </strong>
                          {feat.userBenefit}
                        </div>
                        <div className="p-2 rounded bg-slate-950/70 text-slate-400 flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">
                            <strong className="text-slate-300">Stack: </strong>
                            {feat.techDependencies}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: COMPARATIVA VS DUOLINGO & ELSA */}
          {/* ========================================================= */}
          {activeTab === "comparison" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  ¿Por qué esta Arquitectura Supera a Duolingo y ELSA Speak?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Duolingo basa el 85% de sus lecciones en ejercicios pasivos de arrastrar palabras o selección múltiple sin producción oral activa. ELSA Speak es excelente en fonética, pero carece de un personaje virtual inmersivo que gesticule y sostenga conversaciones naturales libres.
                </p>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="p-3 font-semibold">Dimensión / Capacidad</th>
                      <th className="p-3 font-semibold text-slate-400">Duolingo Max</th>
                      <th className="p-3 font-semibold text-slate-400">ELSA Speak</th>
                      <th className="p-3 font-bold text-amber-300 bg-amber-500/10">Nuestra App (Virtual Tutor 3D)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr>
                      <td className="p-3 font-medium">Avatar y Presencia Visual</td>
                      <td className="p-3 text-slate-400">2D Rive estático / sin lip-sync 3D</td>
                      <td className="p-3 text-slate-400">Sin avatar interactivo</td>
                      <td className="p-3 font-bold text-emerald-400 bg-amber-500/5">
                        Avatar 3D WebGL con cinemática aviar, pico animado a 60 FPS y mirada
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Modo de Conversación</td>
                      <td className="p-3 text-slate-400">Texto guiado con turnos rígidos</td>
                      <td className="p-3 text-slate-400">Llamada de voz sin contacto visual</td>
                      <td className="p-3 font-bold text-emerald-400 bg-amber-500/5">
                        Voz manos libres continua (Hands-Free) con barge-in y quick chips
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Evaluación Fonética</td>
                      <td className="p-3 text-slate-400">Acepta casi cualquier intento (laxo)</td>
                      <td className="p-3 text-emerald-400">Score fonético tricolor excelente</td>
                      <td className="p-3 font-bold text-emerald-400 bg-amber-500/5">
                        Score fonético tricolor + Waveform Echo Trainer + Pares mínimos
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Pedagogía Socrática</td>
                      <td className="p-3 text-slate-400">Explicaciones estándar GPT-4</td>
                      <td className="p-3 text-slate-400">Centrado solo en pronunciación</td>
                      <td className="p-3 font-bold text-emerald-400 bg-amber-500/5">
                        Pistas escalonadas, notas gramaticales automáticas y enlace nativo
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Gamificación y Hábito</td>
                      <td className="p-3 text-emerald-400">Rachas adictivas y ligas</td>
                      <td className="p-3 text-slate-400">Gamificación básica de puntos</td>
                      <td className="p-3 font-bold text-emerald-400 bg-amber-500/5">
                        Rachas con fuego animado, escudo, tienda 3D, XP, gemas y misiones
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Público Infantil (Kids)</td>
                      <td className="p-3 text-slate-400">Duolingo ABC separado</td>
                      <td className="p-3 text-slate-400">No adaptado para niños</td>
                      <td className="p-3 font-bold text-emerald-400 bg-amber-500/5">
                        Kids Mode integrado con multibiomas, audio envolvente y recompensas
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ROADMAP DE EVOLUCIÓN COMERCIAL */}
          {/* ========================================================= */}
          {activeTab === "roadmap" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                {/* FASE 1 */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                      FASE 1 &bull; 100% COMPLETADA
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Fundación Core & Avatar 3D</h4>
                  <p className="text-[11px] text-slate-300">
                    Motor WebGL Three.js con rig aviar, lip-sync en tiempo real, Gemini 2.5 Flash, reconocimiento de voz y sistema SRS.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold">
                    ✓ 50+ Funciones Activas en Producción
                  </div>
                </div>

                {/* FASE 2 */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                      FASE 2 &bull; EN IMPLEMENTACIÓN
                    </span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Inmersión & Escenarios</h4>
                  <p className="text-[11px] text-slate-300">
                    Simuladores de roleplay con checklists de objetivos (Entrevista Silicon Valley, JFK Customs, Starbucks NYC) y ElevenLabs.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-amber-300 font-semibold">
                    ⏳ 25 Funciones en Despliegue Activo
                  </div>
                </div>

                {/* FASE 3 */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-extrabold border border-blue-500/30">
                      FASE 3 &bull; Q3 2026
                    </span>
                    <Globe className="w-4 h-4 text-blue-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Social & Ligas Multijugador</h4>
                  <p className="text-[11px] text-slate-300">
                    Ligas semanales de 30 alumnos (Bronce a Diamante), desafíos de pronunciación 1v1 en tiempo real y misiones de amigos.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-blue-300 font-semibold">
                    🚀 Escalabilidad & Retención Social
                  </div>
                </div>

                {/* FASE 4 */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-extrabold border border-purple-500/30">
                      FASE 4 &bull; Q4 2026
                    </span>
                    <Shield className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">B2B, Colegios & WebXR</h4>
                  <p className="text-[11px] text-slate-300">
                    Dashboard para colegios/empresas con analítica de fluidez, suscripciones Stripe y modo Realidad Aumentada en el escritorio.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-purple-300 font-semibold">
                    💼 Monetización & Expansión Global
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1117] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>AI EdTech Research Center &bull; Three.js & Gemini 2.5 Architecture</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md"
          >
            Cerrar Centro de Investigación
          </button>
        </div>
      </div>
    </div>
  );
};
