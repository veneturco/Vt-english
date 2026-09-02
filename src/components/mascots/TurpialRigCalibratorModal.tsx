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
} from "lucide-react";
import {
  TurpialRigOffsets,
  DEFAULT_TURPIAL_RIG_OFFSETS,
  loadTurpialRigOffsets,
  saveTurpialRigOffsets,
  resetTurpialRigOffsets,
} from "../../types/turpialRig";

interface TurpialRigCalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOffsetsChange?: (offsets: TurpialRigOffsets) => void;
}

export const TurpialRigCalibratorModal: React.FC<
  TurpialRigCalibratorModalProps
> = ({ isOpen, onClose, onOffsetsChange }) => {
  const [offsets, setOffsets] = useState<TurpialRigOffsets>(loadTurpialRigOffsets);
  const [activeTab, setActiveTab] = useState<"cabeza" | "alas" | "medallas" | "pico">("cabeza");
  const [isSymmetricWings, setIsSymmetricWings] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
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
                Ajusta las distancias, articulaciones y medallas en tiempo real
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

        {/* Categories Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2 px-4 border-b border-slate-800 bg-slate-950/30 overflow-x-auto">
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
            onClick={() => setActiveTab("pico")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === "pico"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <span>🐤</span>
            <span>Pico Lip-Sync</span>
          </button>
        </div>

        {/* Sliders Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
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

          {/* TAB 4: PICO LIP-SYNC */}
          {activeTab === "pico" && (
            <div className="space-y-4">
              {/* Beak Mode Selector */}
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-200 block">
                  Modo de Articulación del Pico
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateOffset("beakMode", "anatomical")}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                      offsets.beakMode === "anatomical" || !offsets.beakMode
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs">🐤 Anatómico (2 Capas)</span>
                    <span className="text-[10px] text-slate-400">Pico sup. fijo + inf. móvil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateOffset("beakMode", "sprite_swap")}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                      offsets.beakMode === "sprite_swap"
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs">🔄 Sprite Swap</span>
                    <span className="text-[10px] text-slate-400">Cerrado ↔ Abierto al hablar</span>
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
                </div>
              </div>

              {/* Controles Pico Inferior */}
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🔽</span>
                  <span>Pico Inferior (Mandíbula / Boca Abierta)</span>
                </span>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Altura Y</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {offsets.beakTop} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="75"
                    max="115"
                    step="1"
                    value={offsets.beakTop}
                    onChange={(e) => updateOffset("beakTop", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Posición X</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {offsets.beakLeft} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="80"
                    step="1"
                    value={offsets.beakLeft}
                    onChange={(e) => updateOffset("beakLeft", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Ancho</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {offsets.beakWidth} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="28"
                    max="55"
                    step="1"
                    value={offsets.beakWidth}
                    onChange={(e) => updateOffset("beakWidth", Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Controles Pico Superior */}
              {offsets.beakMode !== "lower_only" && (
                <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🔼</span>
                    <span>Pico Superior (Mandíbula Fija / Boca Cerrada)</span>
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
                      min="70"
                      max="110"
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
                      min="40"
                      max="80"
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
                      min="28"
                      max="55"
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
