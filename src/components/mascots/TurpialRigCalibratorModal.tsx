import React, { useState, useEffect } from "react";
import {
  X,
  Sliders,
  RotateCcw,
  Check,
  Copy,
  Award,
  Sparkles,
  Layers,
  Move,
  Info,
  Volume2,
  VolumeX,
  Eye,
  Smile,
} from "lucide-react";
import {
  TurpialRigOffsets,
  DEFAULT_TURPIAL_RIG_OFFSETS,
  loadTurpialRigOffsets,
  saveTurpialRigOffsets,
  resetTurpialRigOffsets,
} from "../../types/turpialRig";
import { TurpialSpriteRig25D } from "./TurpialSpriteRig25D";

interface TurpialRigCalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOffsetsChange?: (offsets: TurpialRigOffsets) => void;
}

export const TurpialRigCalibratorModal: React.FC<
  TurpialRigCalibratorModalProps
> = ({ isOpen, onClose, onOffsetsChange }) => {
  const [offsets, setOffsets] = useState<TurpialRigOffsets>(loadTurpialRigOffsets);
  const [activeTab, setActiveTab] = useState<"cabeza" | "alas" | "medallas" | "pico" | "ojos">("pico");
  const [isSymmetricWings, setIsSymmetricWings] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estados de prueba interactiva en vivo dentro del calibrador
  const [testMouthOpen, setTestMouthOpen] = useState(true);
  const [testMouthOpening, setTestMouthOpening] = useState(0.85);
  const [testSpeaking, setTestSpeaking] = useState(false);
  const [showMouthGuide, setShowMouthGuide] = useState(true);
  const [previewMouseOffset, setPreviewMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      const loaded = loadTurpialRigOffsets();
      setOffsets(loaded);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateOffset = <K extends keyof TurpialRigOffsets>(
    key: K,
    value: TurpialRigOffsets[K]
  ) => {
    setOffsets((prev) => {
      const next = { ...prev, [key]: value };

      // Si el modo simétrico de alas está activo, replicar X/Y/Escala al ala opuesta
      if (isSymmetricWings) {
        if (key === "wingLeftLeft") {
          next.wingRightRight = Number(value);
        } else if (key === "wingRightRight") {
          next.wingLeftLeft = Number(value);
        } else if (key === "wingLeftTop") {
          next.wingRightTop = Number(value);
        } else if (key === "wingRightTop") {
          next.wingLeftTop = Number(value);
        } else if (key === "wingLeftWidth") {
          next.wingRightWidth = Number(value);
        } else if (key === "wingRightWidth") {
          next.wingLeftWidth = Number(value);
        }
      }

      saveTurpialRigOffsets(next);
      if (onOffsetsChange) {
        queueMicrotask(() => {
          onOffsetsChange(next);
        });
      }
      return next;
    });
  };

  const handleReset = () => {
    const defaultVal = resetTurpialRigOffsets();
    setOffsets(defaultVal);
    if (onOffsetsChange) {
      queueMicrotask(() => {
        onOffsetsChange(defaultVal);
      });
    }
  };

  const handleCopyCode = () => {
    const code = JSON.stringify(offsets, null, 2);
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAndClose = () => {
    saveTurpialRigOffsets(offsets);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-50 flex items-center gap-2">
                Calibrador Anatómico 2.5D
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                  TURPIAL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calibra la boca, distancias, ojos y extremidades en tiempo real
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split Grid: Live Stage on Left, Sliders & Tabs on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-0">
          {/* Panel Izquierdo: Escenario de Calibración en Vivo */}
          <div className="md:col-span-5 bg-slate-950/80 p-3.5 sm:p-4 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col items-center justify-between gap-3 overflow-y-auto">
            {/* Header del Escenario */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Escenario en Tiempo Real</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Boca: {offsets.beakLeft}px, {offsets.beakTop}px
              </span>
            </div>

            {/* Escenario Interactivo con cursor tracking */}
            <div
              className="relative w-full aspect-[4/4.6] max-w-[250px] sm:max-w-[270px] flex items-center justify-center rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950 border border-amber-500/25 shadow-2xl overflow-hidden p-2 select-none cursor-crosshair group"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPreviewMouseOffset({
                  x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
                  y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
                });
              }}
              onMouseLeave={() => setPreviewMouseOffset({ x: 0, y: 0 })}
            >
              <TurpialSpriteRig25D
                offsets={offsets}
                isSpeaking={testSpeaking}
                previewMouthOpen={testMouthOpen ? testMouthOpening : undefined}
                showMouthGuide={showMouthGuide}
                mouseOffset={previewMouseOffset}
                className="w-48 h-56"
              />

              {/* Tag flotante de indicación */}
              <div className="absolute bottom-2 inset-x-2 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition duration-200">
                <span className="text-[9px] font-medium bg-slate-950/85 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Mueve el cursor para probar seguimiento ocular
                </span>
              </div>
            </div>

            {/* Banco de Pruebas de Boca y Expresión */}
            <div className="w-full space-y-2.5 bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span>👄</span>
                  <span>Boca Abierta (Fija para calibrar)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setTestMouthOpen(!testMouthOpen)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition border ${
                    testMouthOpen
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {testMouthOpen ? "ABIERTA" : "CERRADA"}
                </button>
              </div>

              {testMouthOpen && (
                <div className="space-y-1 pt-1 border-t border-slate-800/50">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Apertura de Muestra</span>
                    <span className="text-amber-300 font-mono font-bold">
                      {Math.round(testMouthOpening * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={testMouthOpening}
                    onChange={(e) => setTestMouthOpening(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setTestSpeaking(!testSpeaking)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    testSpeaking
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {testSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{testSpeaking ? "Hablando..." : "Simular Habla"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMouthGuide(!showMouthGuide)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    showMouthGuide
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>{showMouthGuide ? "Guía Activa" : "Ocultar Guía"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Panel Derecho: Pestañas de Selección y Deslizadores */}
          <div className="md:col-span-7 flex flex-col flex-1 overflow-hidden min-h-0 bg-slate-900/40">
            {/* Categories Tab Navigation */}
            <div className="flex items-center gap-1.5 p-2.5 px-4 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("cabeza")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "cabeza"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span>👤</span>
                <span>Cabeza y Cuello</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("alas")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "alas"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span>🪶</span>
                <span>Alas y Separación</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("medallas")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "medallas"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Medallas ({offsets.medalsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("pico");
                  setTestMouthOpen(true);
                  setShowMouthGuide(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "pico"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span>👄</span>
                <span>Boca y Pico Lip-Sync</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ojos")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "ojos"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span>👀</span>
                <span>Ojos y Mirada</span>
              </button>
            </div>

            {/* Sliders Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* TAB 1: CABEZA Y CUELLO */}
              {activeTab === "cabeza" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      <strong>Tip de separación:</strong> Si notas que la cabeza está despegada del cuerpo, baja el valor de <strong>Altura Vertical (Y)</strong> hacia 25px - 35px para que el cuello encaje exactamente en el collarín del torso.
                    </span>
                  </div>

              {/* Head Top */}
              <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-amber-400" />
                    Altura Cabeza / Unión con Cuello (Y)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                    {offsets.headTop} px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={offsets.headTop}
                  onChange={(e) => updateOffset("headTop", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0px (Muy arriba)</span>
                  <span>28px (Recomendado)</span>
                  <span>60px (Muy abajo)</span>
                </div>
              </div>

              {/* Head Left */}
              <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Centrado Horizontal Cabeza (X)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                    {offsets.headLeft} px
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="1"
                  value={offsets.headLeft}
                  onChange={(e) => updateOffset("headLeft", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Head Size */}
              <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Tamaño / Escala Cabeza</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                    {offsets.headWidth} px
                  </span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="190"
                  step="1"
                  value={offsets.headWidth}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updateOffset("headWidth", val);
                    updateOffset("headHeight", val);
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Head Base Rotation */}
              <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Inclinación Base de la Cabeza</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                    {offsets.headRotationBase}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  step="1"
                  value={offsets.headRotationBase}
                  onChange={(e) => updateOffset("headRotationBase", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ALAS Y SEPARACIÓN */}
          {activeTab === "alas" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Ajuste Simétrico (ambas alas a la vez)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSymmetricWings(!isSymmetricWings)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    isSymmetricWings
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {isSymmetricWings ? "Activado ✓" : "Independiente"}
                </button>
              </div>

              {/* Distancia Ala Izquierda al Cuerpo */}
              <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Separación Ala Izquierda (X)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                    {offsets.wingLeftLeft} px
                  </span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="60"
                  step="1"
                  value={offsets.wingLeftLeft}
                  onChange={(e) => updateOffset("wingLeftLeft", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>-40px (Muy afuera)</span>
                  <span>0px (Abierta)</span>
                  <span>45px (Hacia adentro)</span>
                </div>
              </div>

              {/* Distancia Ala Derecha al Cuerpo */}
              <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Separación Ala Derecha (X)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                    {offsets.wingRightRight} px
                  </span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="60"
                  step="1"
                  value={offsets.wingRightRight}
                  onChange={(e) => updateOffset("wingRightRight", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>-40px (Muy afuera)</span>
                  <span>0px (Abierta)</span>
                  <span>45px (Hacia adentro)</span>
                </div>
              </div>

              {/* Altura de Inserción del Hombro */}
              <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Altura de Hombros / Inserción (Y)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                    {offsets.wingLeftTop} px
                  </span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="150"
                  step="1"
                  value={offsets.wingLeftTop}
                  onChange={(e) => updateOffset("wingLeftTop", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Tamaño de las Alas */}
              <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Tamaño / Escala de las Alas</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                    {offsets.wingLeftWidth} px
                  </span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="135"
                  step="1"
                  value={offsets.wingLeftWidth}
                  onChange={(e) => updateOffset("wingLeftWidth", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MEDALLAS DE HONOR */}
          {activeTab === "medallas" && (
            <div className="space-y-4">
              {/* Medals Count Selector */}
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-200 block">
                  Cantidad de Medallas Superpuestas en el Pecho
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateOffset("medalsCount", 0)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      offsets.medalsCount === 0
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-sm">🚫</span>
                    <span className="text-xs">0 Medallas</span>
                    <span className="text-[10px] text-slate-500">Solo arte base</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateOffset("medalsCount", 1)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      offsets.medalsCount === 1
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-sm">🥇</span>
                    <span className="text-xs">1 Medalla</span>
                    <span className="text-[10px] text-emerald-400">Recomendado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateOffset("medalsCount", 3)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      offsets.medalsCount === 3
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-sm">🏅🏅🏅</span>
                    <span className="text-xs">3 Medallas</span>
                    <span className="text-[10px] text-slate-500">Trío clásico</span>
                  </button>
                </div>
              </div>

              {offsets.medalsCount > 0 && (
                <>
                  {/* Medal Top */}
                  <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Altura de la Medalla en el Pecho (Y)</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {offsets.medalTop} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="170"
                      step="1"
                      value={offsets.medalTop}
                      onChange={(e) => updateOffset("medalTop", Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Medal Left */}
                  <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Centrado Horizontal Medalla (X)</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {offsets.medalLeft} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="65"
                      max="125"
                      step="1"
                      value={offsets.medalLeft}
                      onChange={(e) => updateOffset("medalLeft", Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Medal Size */}
                  <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Tamaño de la Medalla</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {offsets.medalWidth} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="110"
                      step="1"
                      value={offsets.medalWidth}
                      onChange={(e) => updateOffset("medalWidth", Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: BOCA Y PICO LIP-SYNC */}
          {activeTab === "pico" && (
            <div className="space-y-4">
              {/* Banner informativo y de alineación rápida */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-amber-200">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <strong className="text-amber-300">Calibración Anatómica de la Boca:</strong>
                    <p className="mt-0.5 text-slate-300 leading-relaxed">
                      Alinea la boca exactamente sobre el pico de la imagen <code>cabeza.png</code>. Puedes ver la boca abierta en el escenario izquierdo en tiempo real y regular su posición (X/Y), dimensiones, proporción de altura y distancia de apertura al hablar.
                    </p>
                  </div>
                </div>

                {/* Botón de centrado rápido oficial */}
                <div className="pt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateOffset("beakLeft", 58);
                      updateOffset("beakTop", 88);
                      updateOffset("beakWidth", 40);
                      updateOffset("beakHeightRatio", 0.72);
                      updateOffset("beakScale", 1.0);
                      updateOffset("beakOpenDistance", 6);
                      setTestMouthOpen(true);
                      setShowMouthGuide(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition shadow-sm"
                  >
                    <span>✨</span>
                    <span>Alinear Boca al Centro Oficial (X: 58px, Y: 88px, W: 40px)</span>
                  </button>
                </div>
              </div>

              {/* Selector de modo de articulación */}
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-200 block">
                  Modo de Articulación y Renderizado
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => updateOffset("beakMode", "sprite_swap")}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                      offsets.beakMode === "sprite_swap" || !offsets.beakMode
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs">🔄 Sprite Swap</span>
                    <span className="text-[10px] text-slate-400">Boca fluida limpia (Recomendado)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateOffset("beakMode", "anatomical")}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                      offsets.beakMode === "anatomical"
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs">🐤 Anatómico</span>
                    <span className="text-[10px] text-slate-400">Pico sup. fijo + inf. móvil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateOffset("beakMode", "lower_only")}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                      offsets.beakMode === "lower_only"
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs">🔽 Solo Inferior</span>
                    <span className="text-[10px] text-slate-400">Pico inf. sobre arte base</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateOffset("beakMode", "hidden")}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                      offsets.beakMode === "hidden"
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs">🚫 Arte Fijo</span>
                    <span className="text-[10px] text-slate-400">Sin capas superpuestas</span>
                  </button>
                </div>
              </div>

              {/* Controles Principales de Posición y Distancia de la Boca */}
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>👄</span>
                    <span>Posición y Distancias de la Boca</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    X:{offsets.beakLeft}px · Y:{offsets.beakTop}px
                  </span>
                </div>

                {/* Altura Y */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Altura Vertical (Y)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {offsets.beakTop} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="140"
                    step="1"
                    value={offsets.beakTop}
                    onChange={(e) => updateOffset("beakTop", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Más arriba (40px)</span>
                    <span className="text-amber-400/80 font-medium">88px (Pico Base)</span>
                    <span>Más abajo (140px)</span>
                  </div>
                </div>

                {/* Posición X */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Posición Horizontal (X / Centrado)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {offsets.beakLeft} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="110"
                    step="1"
                    value={offsets.beakLeft}
                    onChange={(e) => updateOffset("beakLeft", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Izquierda (20px)</span>
                    <span className="text-amber-400/80 font-medium">58px (Centro de Cara)</span>
                    <span>Derecha (110px)</span>
                  </div>
                </div>

                {/* Ancho */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Ancho Base de la Boca</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {offsets.beakWidth} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="1"
                    value={offsets.beakWidth}
                    onChange={(e) => updateOffset("beakWidth", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Proporción de Alto (Height Ratio) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Proporción Vertical de Boca (Alto / Ancho)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {((offsets.beakHeightRatio ?? 0.72)).toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.40"
                    max="1.30"
                    step="0.02"
                    value={offsets.beakHeightRatio ?? 0.72}
                    onChange={(e) => updateOffset("beakHeightRatio", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Boca Fina (0.40x)</span>
                    <span className="text-amber-400/80 font-medium">0.72x (Estándar)</span>
                    <span>Boca Redondeada (1.30x)</span>
                  </div>
                </div>

                {/* Escala Global */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Escala Multiplicadora de Boca</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {((offsets.beakScale ?? 1.0)).toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.6"
                    step="0.05"
                    value={offsets.beakScale ?? 1.0}
                    onChange={(e) => updateOffset("beakScale", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Distancia / Amplitud de Apertura */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Amplitud / Distancia de Apertura al Hablar</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {offsets.beakOpenDistance ?? 6} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={offsets.beakOpenDistance ?? 6}
                    onChange={(e) => updateOffset("beakOpenDistance", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Apertura Sutil (2px)</span>
                    <span className="text-amber-400/80 font-medium">6px (Recomendado)</span>
                    <span>Apertura Amplia (20px)</span>
                  </div>
                </div>
              </div>

              {/* Si es Modo Anatómico: Controles Especiales */}
              {offsets.beakMode === "anatomical" && (
                <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🔼</span>
                    <span>Pico Superior (Modo Anatómico)</span>
                  </span>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Altura Y</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {offsets.beakSupTop ?? 82} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="130"
                      step="1"
                      value={offsets.beakSupTop ?? 82}
                      onChange={(e) => updateOffset("beakSupTop", Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Posición X</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {offsets.beakSupLeft ?? 58} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="110"
                      step="1"
                      value={offsets.beakSupLeft ?? 58}
                      onChange={(e) => updateOffset("beakSupLeft", Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Ancho</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {offsets.beakSupWidth ?? 42} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="90"
                      step="1"
                      value={offsets.beakSupWidth ?? 42}
                      onChange={(e) => updateOffset("beakSupWidth", Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: OJOS Y MIRADA */}
          {activeTab === "ojos" && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  <strong>Alineación Anatómica de Mirada:</strong> Las pupilas interactivas siguen el cursor del usuario dentro del escenario. Están calibradas para superponerse exactamente sobre los ojos de la ilustración de la cabeza (<strong>cabeza.png</strong>), logrando un efecto vivo y orgánico.
                </span>
              </div>

              {/* Quick Preset Align Button & Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="eyeTrackingToggle"
                    checked={offsets.eyeTrackingEnabled !== false}
                    onChange={(e) => updateOffset("eyeTrackingEnabled", e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="eyeTrackingToggle" className="text-xs font-bold text-slate-200 cursor-pointer">
                    Activar seguimiento interactivo de ojos
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateOffset("eyeLeftX", 30.8);
                    updateOffset("eyeLeftY", 25.4);
                    updateOffset("eyeRightX", 70.8);
                    updateOffset("eyeRightY", 25.4);
                    updateOffset("eyeScale", 1.0);
                    updateOffset("eyeLookIntensity", 1.0);
                    updateOffset("eyeTrackingEnabled", true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>✨</span>
                  <span>Alinear con Ilustración Oficial (30.8% / 70.8%)</span>
                </button>
              </div>

              {/* Left Eye Sliders */}
              <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>👁️</span>
                  <span>Ojo Izquierdo</span>
                </h3>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Posición Horizontal (X)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {(offsets.eyeLeftX ?? 30.8).toFixed(1)} %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="45"
                    step="0.2"
                    value={offsets.eyeLeftX ?? 30.8}
                    onChange={(e) => updateOffset("eyeLeftX", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Posición Vertical (Y)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {(offsets.eyeLeftY ?? 25.4).toFixed(1)} %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="42"
                    step="0.2"
                    value={offsets.eyeLeftY ?? 25.4}
                    onChange={(e) => updateOffset("eyeLeftY", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Eye Sliders */}
              <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>👁️</span>
                  <span>Ojo Derecho</span>
                </h3>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Posición Horizontal (X)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {(offsets.eyeRightX ?? 70.8).toFixed(1)} %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="55"
                    max="85"
                    step="0.2"
                    value={offsets.eyeRightX ?? 70.8}
                    onChange={(e) => updateOffset("eyeRightX", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Posición Vertical (Y)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {(offsets.eyeRightY ?? 25.4).toFixed(1)} %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="42"
                    step="0.2"
                    value={offsets.eyeRightY ?? 25.4}
                    onChange={(e) => updateOffset("eyeRightY", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Scale & Look Intensity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Tamaño de Pupila / Iris</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {(offsets.eyeScale ?? 1.0).toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.6"
                    step="0.05"
                    value={offsets.eyeScale ?? 1.0}
                    onChange={(e) => updateOffset("eyeScale", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Sensibilidad al Cursor</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {(offsets.eyeLookIntensity ?? 1.0).toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2.0"
                    step="0.1"
                    value={offsets.eyeLookIntensity ?? 1.0}
                    onChange={(e) => updateOffset("eyeLookIntensity", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Restablecer a valores recomendados"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Copiar configuración en formato JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "¡Copiado!" : "Copiar JSON"}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{savedSuccess ? "Guardado" : "Guardar Calibración"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
