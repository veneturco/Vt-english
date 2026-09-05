import React, { useState, useRef } from "react";
import {
  X,
  Sparkles,
  Sliders,
  Glasses,
  Shirt,
  Volume2,
  Check,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Palette,
  User,
  Award,
  Image as ImageIcon,
  Upload,
  Trash2,
} from "lucide-react";
import { AvatarConfig, AvatarModelPreset } from "../types";
import { AVATAR_PRESETS } from "../data/presets";
import { speakText } from "../utils/speech";
import { Avatar2DCanvas } from "./Avatar2DCanvas";
import { TurpialRigCalibratorModal } from "./mascots/TurpialRigCalibratorModal";

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AvatarConfig;
  onSaveConfig: (newConfig: AvatarConfig) => void;
}

const SKIN_TONES = [
  "#f59e0b", // Turpial/Cunaguaro Amber
  "#292524", // Frontino Dark Fur
  "#10b981", // Tucusito Emerald
  "#78350f", // Tech Monkey Fur
  "#4ade80", // Morrocoy Green
  "#d6d3d1", // Oso Melero Cream/Silver
  "#f5d0b5", // Light Skin
  "#e8beac", // Medium Peach
  "#d89c7a", // Warm Bronze
  "#633c1d", // Deep Dark
];

const HAIR_COLORS = [
  "#0f172a", // Obsidian Black
  "#3b2219", // Dark brown
  "#1c1917", // Espresso Fur
  "#059669", // Emerald Feathers
  "#451a03", // Auburn Fur
  "#78716c", // Slate Feathers
  "#7c3aed", // Cyber violet
  "#d97706", // Amber blonde
  "#b91c1c", // Crimson red
];

const OUTFIT_COLORS = [
  "#ea580c", // Turpial Blaze Orange
  "#d97706", // Safari Khaki Amber
  "#2563eb", // Tech Royal Blue
  "#0ea5e9", // Electric Sky
  "#334155", // Tech Slate
  "#65a30d", // Explorer Olive
  "#1e293b", // Navy charcoal
  "#b91c1c", // Crimson
];

const ACCENT_COLORS = [
  "#facc15", // Golden Medal Yellow
  "#38bdf8", // Sky blue
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#a855f7", // Violet
  "#f43f5e", // Rose
];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<
    "bet_avatars" | "hd_art" | "human_avatars" | "features" | "outfit" | "voice"
  >("bet_avatars");
  const [tempConfig, setTempConfig] = useState<AvatarConfig>(config);
  const [isCalibratorOpen, setIsCalibratorOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (presetKey: AvatarModelPreset) => {
    const preset = AVATAR_PRESETS[presetKey];
    if (preset) {
      if (preset.customGlbUrl) {
        setTempConfig({
          ...preset,
          customImageUrl: undefined,
        });
      } else {
        setTempConfig({
          ...preset,
          customImageUrl: tempConfig.customImageUrl,
          customGlbUrl: undefined,
          customGlbName: undefined,
        });
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isGlb = file.name.toLowerCase().endsWith(".glb") || file.name.toLowerCase().endsWith(".gltf");
      if (isGlb) {
        // Para archivos GLB pequeños (< 20MB) usamos DataURL para que persista entre sesiones y recargas
        if (file.size < 20 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
              setTempConfig((prev) => ({
                ...prev,
                customGlbUrl: dataUrl,
                customGlbName: file.name,
                avatarType: "custom_glb",
              }));
            }
          };
          reader.readAsDataURL(file);
        } else {
          const objectUrl = URL.createObjectURL(file);
          setTempConfig((prev) => ({
            ...prev,
            customGlbUrl: objectUrl,
            customGlbName: file.name,
            avatarType: "custom_glb",
          }));
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setTempConfig((prev) => ({
            ...prev,
            customImageUrl: result,
            avatarType: "2d",
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyImageUrl = () => {
    if (imageUrlInput.trim()) {
      const url = imageUrlInput.trim();
      const isGlb = url.toLowerCase().endsWith(".glb") || url.toLowerCase().endsWith(".gltf");
      if (isGlb) {
        setTempConfig((prev) => ({
          ...prev,
          customGlbUrl: url,
          customGlbName: "Modelo 3D Externo",
          avatarType: "custom_glb",
        }));
      } else {
        setTempConfig((prev) => ({
          ...prev,
          customImageUrl: url,
          avatarType: "2d",
        }));
      }
      setImageUrlInput("");
    }
  };

  const handleRemoveCustomImage = () => {
    setTempConfig((prev) => {
      const updated = { ...prev };
      delete updated.customImageUrl;
      delete updated.customGlbUrl;
      delete updated.customGlbName;
      updated.avatarType = "3d";
      return updated;
    });
  };

  const handleTestVoice = () => {
    speakText(
      `Hello! I'm ${tempConfig.name}. I'm excited to help you master English conversation!`,
      tempConfig
    );
  };

  const handleTestAudio = (customText?: string) => {
    speakText(
      customText || `Hello! Look at my mouth and eyes moving as I speak!`,
      tempConfig
    );
  };

  const handleSave = () => {
    onSaveConfig(tempConfig);
    onClose();
  };

  const handleReset = () => {
    setTempConfig(AVATAR_PRESETS.bet_turpial || AVATAR_PRESETS.teacher_female);
  };

  const betPresets = Object.entries(AVATAR_PRESETS).filter(([key]) => key.startsWith("bet_"));
  const humanPresets = Object.entries(AVATAR_PRESETS).filter(([key]) => !key.startsWith("bet_"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[#161b22] border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1117]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-blue-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Colección de Avatares & Tutores 3D
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                  OFICIAL BET
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Elige tu tutor animal de la fauna criolla BET o sube tu foto HD para el Rig 2.5D
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-[#161b22] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("bet_avatars")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === "bet_avatars"
                ? "text-amber-400 border-amber-500 bg-amber-500/10"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <span>🐦 Fauna BET (10 Animales)</span>
          </button>

          <button
            onClick={() => setActiveTab("hd_art")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === "hd_art"
                ? "text-emerald-400 border-emerald-500 bg-emerald-500/10 font-bold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>🌟 Foto HD & Rig 3D</span>
          </button>

          <button
            onClick={() => setActiveTab("human_avatars")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === "human_avatars"
                ? "text-blue-400 border-blue-500 bg-blue-500/10"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profesores Humanos</span>
          </button>

          <button
            onClick={() => setActiveTab("features")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === "features"
                ? "text-blue-400 border-blue-500 bg-blue-500/10"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Colores & Rasgos</span>
          </button>

          <button
            onClick={() => setActiveTab("outfit")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === "outfit"
                ? "text-blue-400 border-blue-500 bg-blue-500/10"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Traje & Accesorios</span>
          </button>

          <button
            onClick={() => setActiveTab("voice")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === "voice"
                ? "text-blue-400 border-blue-500 bg-blue-500/10"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Voz & Fonética</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto max-h-[62vh] space-y-5">
          {/* Live 2.5D Mascot Interactive Mini-Stage Preview */}
          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#161b22] to-slate-900 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950/80 border border-amber-500/30 overflow-hidden flex items-center justify-center relative shrink-0 shadow-lg">
                <Avatar2DCanvas
                  className="w-full h-full min-h-0 scale-[0.42] sm:scale-[0.5] origin-center"
                  config={tempConfig}
                  animationState="idle"
                  mouthIntensity={0}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white">
                    {tempConfig.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    2.5D Mascot
                  </span>
                </div>
                <p className="text-xs text-amber-400 font-medium">
                  {tempConfig.characterSpecies || tempConfig.role}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                  {tempConfig.teachingStyleBio || "Tutor bilingüe interactivo con animación reactiva y fonética"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {tempConfig.preset === "bet_turpial" && (
                <button
                  type="button"
                  onClick={() => setIsCalibratorOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 font-bold text-xs transition shadow-sm"
                  title="Calibrar distancias de cabeza, alas y medallas"
                >
                  <span>📐</span>
                  <span>Calibrar Rig</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleTestVoice}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>Escuchar Voz</span>
              </button>
            </div>
          </div>

          {/* TAB: HD 3D ILLUSTRATION & RIG 2.5D */}
          {activeTab === "hd_art" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xl">
                    🌟
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">
                      🌟 Modelo 3D (.GLB) o Ilustración HD
                    </h4>
                    <p className="text-xs text-slate-300">
                      Sube tu modelo 3D descargado (.GLB) para Three.js real, o tu imagen HD para el avatar.
                    </p>
                  </div>
                </div>
                {(tempConfig.customImageUrl || tempConfig.customGlbUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomImage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-semibold transition shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar {tempConfig.customGlbUrl ? "Modelo 3D" : "Foto HD"}</span>
                  </button>
                )}
              </div>

              {/* Shiba Inu 3D Model Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-lg">
                    🐕
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        Modelo 3D Oficial: Shiba Inu (shiba.glb)
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        Three.js 3D Real
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Ubicado en <code className="text-amber-300 font-mono text-[11px] bg-black/40 px-1 py-0.5 rounded">public/assets/avatars/shiba.glb</code> con iluminación de estudio, plataforma y rotación 360°.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTempConfig((prev) => ({
                      ...prev,
                      ...AVATAR_PRESETS.shiba_inu,
                      preset: "shiba_inu",
                      customGlbUrl: "/assets/avatars/shiba.glb",
                      customGlbName: "shiba.glb",
                      avatarType: "custom_glb",
                      glbRotationY: Math.PI,
                    }));
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 shadow-md active:scale-95 ${
                    tempConfig.customGlbUrl === "/assets/avatars/shiba.glb" || tempConfig.preset === "shiba_inu"
                      ? "bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-amber-500/30"
                      : "bg-amber-600 hover:bg-amber-500 text-white"
                  }`}
                >
                  <span>{tempConfig.customGlbUrl === "/assets/avatars/shiba.glb" || tempConfig.preset === "shiba_inu" ? "✓ Activado" : "🐕 Activar Shiba Inu 3D"}</span>
                </button>
              </div>

              {/* Upload Zone & File Dropper */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Drag & Drop Card */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-slate-900/60 hover:bg-slate-850 cursor-pointer transition flex flex-col items-center justify-center text-center gap-3 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.glb,.gltf,model/gltf-binary"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      Sube tu Modelo 3D (.GLB) o Foto HD
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Admite archivos 3D (.GLB de Meshy/Blender) o fotos PNG/JPG
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    Seleccionar .GLB o Foto
                  </span>
                </div>

                {/* Paste Direct URL Card */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/80 flex flex-col justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
                      <span>🔗</span> Pegar Enlace / URL de la Imagen
                    </h5>
                    <p className="text-xs text-slate-400 mb-3">
                      Si tienes tu imagen alojada o en Google Drive / Cloud, pega la URL directa aquí:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://ejemplo.com/turpial_hd.png"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyImageUrl}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                    <span>💡</span>
                    <span>
                      Al activar la foto HD o modelo 3D (.GLB), el avatar se renderiza con <strong>iluminación en tiempo real y rotación 360°</strong>.
                    </span>
                  </div>
                </div>
              </div>

              {/* 3D GLB Model Orientation & Rotation Controls */}
              {tempConfig.customGlbUrl && (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🔄</span>
                      <h5 className="text-xs sm:text-sm font-bold text-white">
                        Orientación y Rotación del Modelo 3D (.GLB)
                      </h5>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Three.js Engine
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Si tu personaje cargó de espaldas o en ángulo, pulsa <strong>"Girar 180°"</strong> o usa el deslizador para que quede mirando al frente hacia el estudiante:
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setTempConfig((prev) => ({
                          ...prev,
                          glbRotationY: ((prev.glbRotationY ?? Math.PI) + Math.PI) % (Math.PI * 2),
                        }))
                      }
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Girar 180° (Voltear de Frente)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setTempConfig((prev) => ({
                          ...prev,
                          glbRotationY: ((prev.glbRotationY ?? Math.PI) - Math.PI / 4) % (Math.PI * 2),
                        }))
                      }
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
                    >
                      ↺ -45°
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setTempConfig((prev) => ({
                          ...prev,
                          glbRotationY: ((prev.glbRotationY ?? Math.PI) + Math.PI / 4) % (Math.PI * 2),
                        }))
                      }
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
                    >
                      ↻ +45°
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setTempConfig((prev) => ({
                          ...prev,
                          glbRotationY: Math.PI,
                        }))
                      }
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 text-xs font-semibold transition active:scale-95"
                    >
                      Restablecer Frente
                    </button>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-slate-400 font-semibold text-[11px]">
                      <span>Ángulo de Giro Horizontal (Y):</span>
                      <span className="text-amber-400">
                        {Math.round((((tempConfig.glbRotationY ?? Math.PI) * 180) / Math.PI + 360) % 360)}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={Math.round((((tempConfig.glbRotationY ?? Math.PI) * 180) / Math.PI + 360) % 360)}
                      onChange={(e) => {
                        const deg = Number(e.target.value);
                        setTempConfig((prev) => ({
                          ...prev,
                          glbRotationY: (deg * Math.PI) / 180,
                        }));
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* 3D GLB Mouth & Snout Calibration Controls */}
              {tempConfig.customGlbUrl && (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/40 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👄</span>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-white">
                          Calibración de Boca y Distancias 3D (.GLB)
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          Ajusta la posición frontal (Z), altura (Y), centrado (X), escala y apertura al hablar para que coincida exactamente con el hocico.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                        <input
                          type="checkbox"
                          checked={tempConfig.glbMouthEnabled ?? true}
                          onChange={(e) =>
                            setTempConfig((prev) => ({
                              ...prev,
                              glbMouthEnabled: e.target.checked,
                            }))
                          }
                          className="accent-amber-500 rounded"
                        />
                        <span>Visible</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTestAudio()}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 shrink-0"
                      >
                        <span>🎙️</span>
                        <span>Probar Habla</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Calibration Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Calibración Rápida:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setTempConfig((prev) => ({
                          ...prev,
                          glbMouthX: 0,
                          glbMouthY: 0.94,
                          glbMouthZ: 0.62,
                          glbMouthScale: 1.0,
                          glbMouthOpenDist: 0.08,
                          glbMouthType: "shiba_snout",
                          glbMouthEnabled: true,
                        }))
                      }
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <span>🐕</span>
                      <span>Alinear con Hocico de Shiba Inu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTempConfig((prev) => ({
                          ...prev,
                          glbMouthX: 0,
                          glbMouthY: 1.45,
                          glbMouthZ: 0.42,
                          glbMouthScale: 1.0,
                          glbMouthOpenDist: 0.08,
                          glbMouthType: "avian_beak",
                          glbMouthEnabled: true,
                        }))
                      }
                      className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <span>🐤</span>
                      <span>Alinear con Pico de Búho/Ave</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTempConfig((prev) => ({
                          ...prev,
                          glbMouthType: "kinetic_bounce",
                        }))
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
                    >
                      ⚡ Solo Rebote Kinemático
                    </button>
                  </div>

                  {/* Sliders Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                    {/* Distancia Frontal / Profundidad Z */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400 font-semibold text-[11px]">
                        <span>Distancia Frontal (Z):</span>
                        <span className="text-amber-400 font-mono">
                          {(tempConfig.glbMouthZ ?? 0.62).toFixed(2)}m
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="1.30"
                        step="0.01"
                        value={tempConfig.glbMouthZ ?? 0.62}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            glbMouthZ: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Atrás (Cráneo)</span>
                        <span>Adelante (Punta Hocico)</span>
                      </div>
                    </div>

                    {/* Altura Y */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400 font-semibold text-[11px]">
                        <span>Altura de la Boca (Y):</span>
                        <span className="text-amber-400 font-mono">
                          {(tempConfig.glbMouthY ?? 0.94).toFixed(2)}m
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.40"
                        max="1.90"
                        step="0.01"
                        value={tempConfig.glbMouthY ?? 0.94}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            glbMouthY: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Abajo</span>
                        <span>Arriba</span>
                      </div>
                    </div>

                    {/* Centrado Horizontal X */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400 font-semibold text-[11px]">
                        <span>Centrado Lateral (X):</span>
                        <span className="text-amber-400 font-mono">
                          {(tempConfig.glbMouthX ?? 0).toFixed(2)}m
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.40"
                        max="0.40"
                        step="0.01"
                        value={tempConfig.glbMouthX ?? 0}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            glbMouthX: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Izquierda</span>
                        <span>Derecha</span>
                      </div>
                    </div>

                    {/* Tamaño / Escala */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400 font-semibold text-[11px]">
                        <span>Tamaño de Boca / Hocico:</span>
                        <span className="text-amber-400 font-mono">
                          {(tempConfig.glbMouthScale ?? 1.0).toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.30"
                        max="2.50"
                        step="0.05"
                        value={tempConfig.glbMouthScale ?? 1.0}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            glbMouthScale: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Pequeño</span>
                        <span>Grande</span>
                      </div>
                    </div>

                    {/* Amplitud de Apertura al Hablar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400 font-semibold text-[11px]">
                        <span>Distancia Apertura al Hablar:</span>
                        <span className="text-amber-400 font-mono">
                          {(tempConfig.glbMouthOpenDist ?? 0.08).toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.22"
                        step="0.01"
                        value={tempConfig.glbMouthOpenDist ?? 0.08}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            glbMouthOpenDist: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Sutil</span>
                        <span>Amplia</span>
                      </div>
                    </div>

                    {/* Tipo de Fisiología 3D */}
                    <div className="space-y-1">
                      <div className="text-slate-400 font-semibold text-[11px]">
                        Fisiología Bucal 3D:
                      </div>
                      <select
                        value={tempConfig.glbMouthType ?? "shiba_snout"}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            glbMouthType: e.target.value as any,
                          }))
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="shiba_snout">🐕 Hocico Canino & Lengua (Shiba)</option>
                        <option value="avian_beak">🐤 Pico de Ave Articulado 3D</option>
                        <option value="kinetic_bounce">⚡ Kinematic Cranial Bounce</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 3x3 Collage Character Auto-Cropper Selector */}
              {tempConfig.customImageUrl && (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">✂️</span>
                      <h5 className="text-xs sm:text-sm font-bold text-white">
                        Selector de Personaje del Collage 3x3
                      </h5>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Recorte Automático HD
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Como subiste la imagen collage de 9 personajes, haz clic abajo en cuál de las mascotas quieres enfocar y animar:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { index: 0, name: "Colibrí Esmeralda", emoji: "🕊️", role: "Fluidez Rápida" },
                      { index: 1, name: "Oso Frontino", emoji: "🐻", role: "Guía Bilingüe" },
                      { index: 2, name: "Monito Fresa 'B'", emoji: "🐒", role: "Vocabulario Lúdico" },
                      { index: 3, name: "Turpial BET", emoji: "🐦", role: "Acento & Fonética" },
                      { index: 4, name: "Cunaguaro BET", emoji: "🐆", role: "Roleplay & Slang" },
                      { index: 5, name: "Oso Melero", emoji: "🦔", role: "Gramática Precisa" },
                      { index: 6, name: "Morrocoy BET", emoji: "🐢", role: "Paciencia & Ritmo" },
                      { index: 7, name: "Guacharaca Libro", emoji: "📖", role: "Lectura & Cuentos" },
                      { index: 8, name: "Mono Tech", emoji: "🎧", role: "Business & Tech" },
                      { index: 9, name: "Iguana Bandera", emoji: "🦎", role: "Cultura & Diálogo" },
                    ].map((item) => {
                      const isCropSelected = tempConfig.spriteCropIndex === item.index;
                      return (
                        <button
                          key={item.index}
                          type="button"
                          onClick={() =>
                            setTempConfig((prev) => ({
                              ...prev,
                              spriteCropIndex: item.index,
                              name: `${item.name} HD`,
                              characterSpecies: item.name,
                              role: item.role,
                            }))
                          }
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition text-xs font-semibold ${
                            isCropSelected
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40"
                              : "bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <span className="text-base shrink-0">{item.emoji}</span>
                          <span className="truncate">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Live 2.5D Rig Calibration & Speech Tester */}
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⚙️</span>
                        <h6 className="text-xs font-bold text-slate-200">
                          Ajustes de Calibración de la Boca 2.5D
                        </h6>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCalibratorOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs transition flex items-center gap-1.5"
                        >
                          <span>🎛️</span>
                          <span>Calibrador 2.5D</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTestAudio()}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
                        >
                          <span>🎙️</span>
                          <span>Probar Movimiento</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                      {/* Mouth Vertical Position (Y) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400 font-semibold text-[11px]">
                          <span>Altura de Boca (Y):</span>
                          <span className="text-amber-400">{tempConfig.rigMouthY ?? 65}%</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="85"
                          value={tempConfig.rigMouthY ?? 65}
                          onChange={(e) =>
                            setTempConfig((prev) => ({
                              ...prev,
                              rigMouthY: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>

                      {/* Mouth Scale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400 font-semibold text-[11px]">
                          <span>Tamaño de Boca:</span>
                          <span className="text-amber-400">{tempConfig.rigMouthScale ?? 1.0}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.8"
                          step="0.1"
                          value={tempConfig.rigMouthScale ?? 1.0}
                          onChange={(e) =>
                            setTempConfig((prev) => ({
                              ...prev,
                              rigMouthScale: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>

                      {/* Mouth Type Selector */}
                      <div className="space-y-1">
                        <div className="text-slate-400 font-semibold text-[11px]">
                          Tipo de Boca:
                        </div>
                        <select
                          value={tempConfig.rigMouthType ?? "bird_beak"}
                          onChange={(e) =>
                            setTempConfig((prev) => ({
                              ...prev,
                              rigMouthType: e.target.value as any,
                            }))
                          }
                          className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="bird_beak">Pico de Ave (Turpial/Guacharaca)</option>
                          <option value="long_beak">Pico Largo Fino (Colibrí)</option>
                          <option value="feline_snout">Hocico Felino (Cunaguaro)</option>
                          <option value="bear_snout">Hocico de Oso (Frontino)</option>
                          <option value="monkey_mouth">Labios de Primate (Mono Fresa/Tech)</option>
                          <option value="tamandua_snout">Hocico Melero (Tamandúa)</option>
                          <option value="turtle_mouth">Boca de Tortuga (Morrocoy)</option>
                          <option value="reptile_mouth">Mandíbula Reptil (Iguana)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: BET ANIMAL AVATARS */}
          {activeTab === "bet_avatars" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-blue-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                      Nuevos Avatares BET: Fauna Criolla & Coaches Especialistas
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Cada tutor tiene una personalidad pedagógica única para desbloquear tu fluidez.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {betPresets.map(([key, preset]) => {
                  const isSelected = tempConfig.preset === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectPreset(key as AvatarModelPreset)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-2.5 relative overflow-hidden ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-400 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/40"
                          : "bg-[#0d1117] hover:bg-slate-800/80 border-slate-700/80 hover:border-slate-600"
                      }`}
                    >
                      {/* Top Row: Emoji, Name & Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
                            {preset.characterEmoji || "🐦"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-white text-sm sm:text-base">
                                {preset.name}
                              </h4>
                              {isSelected && (
                                <span className="p-0.5 rounded-full bg-amber-400 text-black">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-amber-400 font-medium block">
                              {preset.characterSpecies}
                            </span>
                          </div>
                        </div>

                        {preset.badgeText && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 font-semibold shrink-0">
                            {preset.badgeText}
                          </span>
                        )}
                      </div>

                      {/* Role & Bio */}
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-slate-200">{preset.role}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                          {preset.teachingStyleBio}
                        </p>
                      </div>

                      {/* Bottom Chips */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {preset.voiceGender === "female" ? "Voz Femenina" : "Voz Masculina"}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {preset.voiceAccent}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(`Hi! I'm ${preset.name}. Let's practice English together!`, preset);
                          }}
                          className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium flex items-center gap-1 transition"
                          title="Escuchar saludo de voz"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Voz</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: HUMAN TUTORS */}
          {activeTab === "human_avatars" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {humanPresets.map(([key, preset]) => {
                const isSelected = tempConfig.preset === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleSelectPreset(key as AvatarModelPreset)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30"
                        : "bg-[#0d1117] hover:bg-slate-800/80 border-slate-700/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{preset.characterEmoji || "👩‍🏫"}</span>
                        <h4 className="font-bold text-white text-sm">{preset.name}</h4>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{preset.role}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{preset.teachingStyleBio}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {preset.voiceAccent}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(`Hello! I'm ${preset.name}. Ready to level up your English?`, preset);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs flex items-center gap-1 transition"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Escuchar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: FEATURES & COLORS */}
          {activeTab === "features" && (
            <div className="space-y-5">
              {/* Skin/Fur Tone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Color de Piel / Pelaje / Plumaje:
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setTempConfig({ ...tempConfig, skinTone: tone })}
                      style={{ backgroundColor: tone }}
                      className={`w-9 h-9 rounded-full transition-transform active:scale-95 flex items-center justify-center border border-white/20 ${
                        tempConfig.skinTone === tone ? "ring-4 ring-amber-400 scale-110" : ""
                      }`}
                    >
                      {tempConfig.skinTone === tone && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair/Feather Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Estilo Superior (Peinado / Plumas / Orejas):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "feathers", label: "🪶 Plumas / Cresta" },
                    { id: "ears", label: "🐾 Orejas Animal BET" },
                    { id: "fur", label: "🐻 Pelaje Suave" },
                    { id: "bun", label: "Prof. Moño (Bun)" },
                    { id: "bob", label: "Corte Bob Elegante" },
                    { id: "short_parted", label: "Corto Ejecutivo" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        setTempConfig({ ...tempConfig, hairStyle: item.id as any })
                      }
                      className={`p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                        tempConfig.hairStyle === item.id
                          ? "bg-amber-500/20 border-amber-400 text-amber-300"
                          : "bg-[#0d1117] border-slate-700 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Color de Cabello / Plumas:
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {HAIR_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTempConfig({ ...tempConfig, hairColor: color })}
                      style={{ backgroundColor: color }}
                      className={`w-9 h-9 rounded-full transition-transform active:scale-95 flex items-center justify-center border border-white/20 ${
                        tempConfig.hairColor === color ? "ring-4 ring-amber-400 scale-110" : ""
                      }`}
                    >
                      {tempConfig.hairColor === color && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OUTFIT & ACCESSORIES */}
          {activeTab === "outfit" && (
            <div className="space-y-5">
              {/* Outfit Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Tipo de Atuendo / Uniforme:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "safari_vest", label: "🦁 Chaleco Safari Explorador BET" },
                    { id: "bet_cap", label: "🧢 Gorra Deportiva BET" },
                    { id: "headphones_suit", label: "🎧 Tech Headset Suit" },
                    { id: "corporate_suit", label: "👔 Traje Corporativo con Medalla" },
                    { id: "tech_hoodie", label: "⚡ Sudadera Tech Moderna" },
                    { id: "casual_blazer", label: "🧥 Blazer Casual" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        setTempConfig({ ...tempConfig, outfit: item.id as any })
                      }
                      className={`p-3 rounded-xl border text-xs font-medium transition text-left ${
                        tempConfig.outfit === item.id
                          ? "bg-amber-500/20 border-amber-400 text-amber-300"
                          : "bg-[#0d1117] border-slate-700 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outfit Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Color Principal del Atuendo:
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {OUTFIT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTempConfig({ ...tempConfig, outfitColor: color })}
                      style={{ backgroundColor: color }}
                      className={`w-9 h-9 rounded-full transition-transform active:scale-95 flex items-center justify-center border border-white/20 ${
                        tempConfig.outfitColor === color ? "ring-4 ring-amber-400 scale-110" : ""
                      }`}
                    >
                      {tempConfig.outfitColor === color && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent & Badge Accessories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Accesorios & Coleccionables BET:
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    🏆 Colección Duolingo BET
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "none", label: "✨ Sin Accesorio", tag: "Básico" },
                    { id: "bet_medal", label: "🥇 Medalla de Oro BET", tag: "Oficial" },
                    { id: "graduation_cap", label: "🎓 Gorro Graduación", tag: "Nivel B2/C1" },
                    { id: "golden_crown", label: "👑 Corona Real BET", tag: "Racha 5+ Días" },
                    { id: "sunglasses_vip", label: "🕶️ Lentes de Sol VIP", tag: "Fluidez Pro" },
                    { id: "scarf_explorer", label: "🧣 Bufanda Explorador", tag: "Andino" },
                    { id: "headset", label: "🎧 Headset Audio Tech", tag: "Pronunciación" },
                    { id: "safari_hat", label: "🤠 Sombrero Safari", tag: "Aventura" },
                    { id: "open_book", label: "📖 Libro de Vocabulario", tag: "Lectura" },
                    { id: "strawberry", label: "🍓 Fresita BET", tag: "Cariñoso" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        setTempConfig({ ...tempConfig, accessory: item.id as any })
                      }
                      className={`p-2.5 rounded-xl border text-xs font-medium transition text-left flex flex-col justify-between gap-1.5 ${
                        tempConfig.accessory === item.id
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/30"
                          : "bg-[#0d1117] border-slate-700 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded self-start">
                        {item.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VOICE & PHONETICS */}
          {activeTab === "voice" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Género y Tono de Voz del Tutor:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setTempConfig({ ...tempConfig, voiceGender: "female" })
                    }
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      tempConfig.voiceGender === "female"
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-[#0d1117] border-slate-700 text-slate-300"
                    }`}
                  >
                    <span>Voz Femenina (Clara / Melódica)</span>
                  </button>
                  <button
                    onClick={() =>
                      setTempConfig({ ...tempConfig, voiceGender: "male" })
                    }
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      tempConfig.voiceGender === "male"
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-[#0d1117] border-slate-700 text-slate-300"
                    }`}
                  >
                    <span>Voz Masculina (Cálida / Grave)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Acento Inglés Objetivo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "en-US", label: "🇺🇸 Americano (US)" },
                    { id: "en-GB", label: "🇬🇧 Británico (UK)" },
                    { id: "en-AU", label: "🇦🇺 Australiano (AU)" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        setTempConfig({ ...tempConfig, voiceAccent: item.id as any })
                      }
                      className={`p-2.5 rounded-xl border text-xs font-medium transition ${
                        tempConfig.voiceAccent === item.id
                          ? "bg-blue-600/20 border-blue-500 text-blue-300"
                          : "bg-[#0d1117] border-slate-700 text-slate-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed / Rate Slider */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span className="font-semibold uppercase tracking-wider">Velocidad del Habla:</span>
                  <span className="font-mono text-amber-400">{tempConfig.voiceRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.2"
                  step="0.05"
                  value={tempConfig.voiceRate}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, voiceRate: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Pitch Slider */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span className="font-semibold uppercase tracking-wider">Tono / Agudeza (Pitch):</span>
                  <span className="font-mono text-amber-400">{tempConfig.voicePitch || 1.0}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={tempConfig.voicePitch || 1.0}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, voicePitch: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Test Audio Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600/30 to-blue-600/30 hover:from-amber-600/40 hover:to-blue-600/40 text-amber-200 text-xs font-semibold border border-amber-500/40 transition active:scale-98"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Probar Voz del Tutor ({tempConfig.name})</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800 bg-[#0d1117]/90">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCalibratorOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1"
            >
              <span>🎛️</span>
              <span>Calibrador 2.5D</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              Elegir este Tutor
            </button>
          </div>
        </div>
      </div>

      {/* 2.5D Calibrator Modal when opened from Customizer */}
      <TurpialRigCalibratorModal
        isOpen={isCalibratorOpen}
        onClose={() => setIsCalibratorOpen(false)}
      />
    </div>
  );
};
