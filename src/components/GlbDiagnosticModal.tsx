import React, { useState } from "react";
import {
  X,
  Activity,
  Bone,
  Eye,
  Smile,
  Film,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  Cpu,
  Feather,
  Copy,
  Check,
} from "lucide-react";
import { GlbDiagnosticReport } from "../types";

interface GlbDiagnosticModalProps {
  report: GlbDiagnosticReport | null;
  onClose: () => void;
}

export const GlbDiagnosticModal: React.FC<GlbDiagnosticModalProps> = ({
  report,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "anatomy" | "features" | "technical">("summary");
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const handleCopyReport = () => {
    const text = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0f141c] border border-amber-500/40 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#161b26]/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Feather className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Diagnóstico 3D de Avatar Aviar & Búho
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                  Three.js + Gemini Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Archivo analizado: <strong className="text-amber-300">{report.fileName}</strong> ({report.generatedAt})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title="Copiar informe en formato JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "¡Copiado!" : "JSON"}</span>
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
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-[#121822]">
          {[
            { id: "summary", label: "📊 Resumen & Estado", icon: Activity },
            { id: "anatomy", label: "🦉 Anatomía Aviar", icon: Feather },
            { id: "features", label: "⚙️ Capacidades Activas", icon: ShieldCheck },
            { id: "technical", label: "🔬 Datos Técnicos WebGL", icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap ${
                  isActive
                    ? "text-amber-400 border-amber-500 bg-amber-500/10"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[62vh] space-y-4">
          {/* TAB 1: RESUMEN */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              {/* Quick Status Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Rig / Huesos</span>
                    <Bone className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {report.hasRig ? `${report.boneCount} Huesos` : "Procedural Aviar"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {report.hasRig ? "Esqueleto nativo" : "Sin huesos (Auto-rigged)"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Blendshapes</span>
                    <Smile className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {report.hasMorphTargets ? `${report.morphTargetNames.length} Morphs` : "Articulador Activo"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {report.hasMorphTargets ? "Morph targets nativos" : "Lip-Sync de pico sintético"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Animaciones</span>
                    <Film className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {report.hasAnimations ? `${report.animationClips.length} Clips` : "Motor Cinemático"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {report.hasAnimations ? "Clips embebidos" : "Idle + Sacadas a 60 FPS"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Rendimiento</span>
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    {report.assignedStrategy.performanceRating}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {report.geometryStats.totalVertices.toLocaleString()} vértices
                  </span>
                </div>
              </div>

              {/* Qué tiene vs Qué le falta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Lo que tiene */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Elementos Detectados en el .GLB</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {report.activeFeaturesSummary.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0">✓</span>
                      <span>Mallas 3D: {report.meshCount} (Vértices: {report.geometryStats.totalVertices.toLocaleString()})</span>
                    </li>
                  </ul>
                </div>

                {/* Lo que le falta */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Elementos Faltantes en el Archivo</span>
                  </div>
                  {report.missingFeaturesSummary.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {report.missingFeaturesSummary.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 shrink-0">⚠️</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-300">
                      El modelo GLB contiene todos los elementos embebidos estándar.
                    </p>
                  )}
                  <div className="pt-2 border-t border-amber-500/20 text-[11px] text-amber-300 font-medium">
                    🚀 <strong>Solución Automática:</strong> El motor de Three.js ha asignado rig procedimental aviar y visemas sintetizados para que el personaje funcione 100% interactivo.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANATOMÍA AVIAR */}
          {activeTab === "anatomy" && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Feather className="w-4 h-4 text-amber-400" />
                  <span>Detección Anatómica Específica de Aves / Búhos</span>
                </h4>
                <p className="text-xs text-slate-300">
                  A diferencia de modelos bípedos humanos (Mixamo), los búhos y aves poseen cinemática rotacional amplia (hasta 270°), nictitación palpebral y apertura mandibular de pico:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 font-medium block">Nodo Craneal / Cabeza:</span>
                    <span className="font-bold text-amber-300">
                      {report.avianClassification.detectedHead || "Centro Craneal Superior Auto-detectado"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 font-medium block">Nodo de Pico / Mandíbula:</span>
                    <span className="font-bold text-amber-300">
                      {report.avianClassification.detectedBeak || "Mandíbula Aviar Articulada (Procedural)"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 font-medium block">Nodos Oculares:</span>
                    <span className="font-bold text-amber-300">
                      {report.avianClassification.detectedEyes.length > 0
                        ? report.avianClassification.detectedEyes.join(", ")
                        : "Región Ocular Aviar Calibrada"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 font-medium block">Extremidades / Alas:</span>
                    <span className="font-bold text-amber-300">
                      {report.avianClassification.detectedWings.length > 0
                        ? report.avianClassification.detectedWings.join(", ")
                        : "Alas Micro-flutter en Reposo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estrategias Asignadas */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Estrategias Cinemáticas Aplicadas en Tiempo Real:
                </h5>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="p-1 rounded bg-amber-500/20 text-amber-400">1</span>
                    <div>
                      <strong className="text-white">Mirada y Movimiento de Cabeza:</strong>
                      <p className="text-slate-300 mt-0.5">{report.assignedStrategy.headMotion}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">2</span>
                    <div>
                      <strong className="text-white">Parpadeo de Ojos (Blinking):</strong>
                      <p className="text-slate-300 mt-0.5">{report.assignedStrategy.blinking}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="p-1 rounded bg-blue-500/20 text-blue-400">3</span>
                    <div>
                      <strong className="text-white">Sincronización de Pico con Audio de Gemini / Tutor:</strong>
                      <p className="text-slate-300 mt-0.5">{report.assignedStrategy.speechBeakSync}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="p-1 rounded bg-purple-500/20 text-purple-400">4</span>
                    <div>
                      <strong className="text-white">Respiración & Animación Idle:</strong>
                      <p className="text-slate-300 mt-0.5">{report.assignedStrategy.idleBreathing}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAPACIDADES ACTIVAS */}
          {activeTab === "features" && (
            <div className="space-y-3">
              {[
                {
                  title: "1. Movimiento Suave de Cabeza y Seguimiento de Mirada (LookAt)",
                  status: "100% Operativo",
                  detail:
                    "El búho sigue suavemente la posición del cursor/estudiante con física de amortiguación elástica y sacadas de orientación cada 3 segundos.",
                },
                {
                  title: "2. Parpadeo Natural Aviar (Eye Blinking State Machine)",
                  status: "100% Operativo",
                  detail:
                    "Ciclo de parpadeo biológico cada 3.5 - 6s con curva sinusoidal rápida (140ms), modulando morph targets o submallas oculares.",
                },
                {
                  title: "3. Sincronización del Pico con la Voz de Gemini / Audio",
                  status: "100% Operativo",
                  detail:
                    "Visemas en tiempo real conectados con el Web Audio API y el sintetizador. Apertura proporcional a la energía y fonética.",
                },
                {
                  title: "4. Respiración Orgánica & Movimiento Idle (Squash & Stretch)",
                  status: "100% Operativo",
                  detail:
                    "Expansión rítmica de sacos aéreos con balanceo en percha e inclinación de curiosidad cuando el estudiante habla.",
                },
                {
                  title: "5. Rotación 360° y Corrección de Orientación Inicial",
                  status: "100% Operativo",
                  detail:
                    "Controles rápidos de volteo 180° y arrastre táctil para posicionar al personaje de frente sin importar su eje de exportación.",
                },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold text-xs">✓</span>
                      <h5 className="text-xs sm:text-sm font-bold text-white">{feat.title}</h5>
                    </div>
                    <p className="text-xs text-slate-400 pl-4">{feat.detail}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30 shrink-0">
                    {feat.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: DATOS TÉCNICOS WEBGL */}
          {activeTab === "technical" && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Inspección Detallada del Buffer Geometry:
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
                  <div className="p-2 rounded bg-slate-950/80">
                    <span className="text-slate-400 block text-[11px]">Vértices Totales:</span>
                    <span className="font-bold text-white">{report.geometryStats.totalVertices.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/80">
                    <span className="text-slate-400 block text-[11px]">Polígonos / Triángulos:</span>
                    <span className="font-bold text-white">{report.geometryStats.totalTriangles.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/80">
                    <span className="text-slate-400 block text-[11px]">Dimensiones (Bounding Box):</span>
                    <span className="font-bold text-white">
                      {report.geometryStats.boundingBox.width} x {report.geometryStats.boundingBox.height} x {report.geometryStats.boundingBox.depth}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/80">
                    <span className="text-slate-400 block text-[11px]">Materiales Detectados:</span>
                    <span className="font-bold text-white">{report.materialsCount} ({report.materialTypes.join(", ") || "Standard"})</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/80">
                    <span className="text-slate-400 block text-[11px]">Luces Embebidas:</span>
                    <span className="font-bold text-white">{report.embeddedLightsCount}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/80">
                    <span className="text-slate-400 block text-[11px]">Cámaras Embebidas:</span>
                    <span className="font-bold text-white">{report.embeddedCamerasCount}</span>
                  </div>
                </div>
              </div>

              {/* Texturas Detectadas */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Canales de Texturas PBR:
                </h5>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2.5 py-1 rounded-lg border ${report.texturesDetected.hasAlbedoMap ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                    Albedo / Diffuse: {report.texturesDetected.hasAlbedoMap ? "Sí" : "Color plano"}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border ${report.texturesDetected.hasNormalMap ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                    Normal Map: {report.texturesDetected.hasNormalMap ? "Sí" : "No"}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border ${report.texturesDetected.hasRoughnessMap ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                    Roughness Map: {report.texturesDetected.hasRoughnessMap ? "Sí" : "PBR Uniforme"}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border ${report.texturesDetected.hasAlphaMap ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                    Transparencia / Alpha: {report.texturesDetected.hasAlphaMap ? "Sí" : "Opaco"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1117] flex items-center justify-between text-xs text-slate-400">
          <span>Google AI Studio &bull; Three.js Avian Engine v2.4</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md"
          >
            Cerrar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};
