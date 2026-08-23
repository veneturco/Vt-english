import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Wand2, X, Play, CheckCircle2, MessageSquare } from "lucide-react";
import { soundFx } from "../utils/soundFx";

interface CustomScenarioPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomScenario: (title: string, promptInstruction: string) => void;
}

const PRESET_IDEAS = [
  { title: "🛍️ Regateando en Camden Market", text: "Estoy en un puesto de ropa vintage en Londres y quiero conseguir un descuento del 20%." },
  { title: "✈️ Reclamando equipaje perdido", text: "Mi maleta no llegó en el vuelo a Nueva York y necesito describir su contenido en el mostrador." },
  { title: "💼 Entrevista para Programador", text: "Una entrevista de trabajo para desarrollador Frontend donde me preguntan sobre mi experiencia con React." },
  { title: "🍕 Quejándome en un restaurante", text: "Pedí una pizza vegetariana pero me la trajeron con carne y fría, quiero pedir un cambio amablemente." },
];

export const CustomScenarioPromptModal: React.FC<CustomScenarioPromptModalProps> = ({
  isOpen,
  onClose,
  onStartCustomScenario,
}) => {
  const [customText, setCustomText] = useState("");
  const [scenarioTitle, setScenarioTitle] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    soundFx.playSuccess();
    const finalTitle = scenarioTitle.trim() || "🎭 Situación Personalizada";
    onStartCustomScenario(finalTitle, customText.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border-2 border-b-8 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 border-2 border-purple-500/40 text-purple-400">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Generador de Escenarios IA</h3>
                <p className="text-xs font-bold text-slate-400">Crea cualquier situación de la vida real al instante</p>
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

          {/* Quick Preset Ideas */}
          <div className="mb-4">
            <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block mb-2">
              Ideas Populares
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_IDEAS.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setScenarioTitle(idea.title);
                    setCustomText(idea.text);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border-2 border-slate-800 text-left transition"
                >
                  <span className="text-xs font-black text-white block mb-0.5">{idea.title}</span>
                  <span className="text-[10px] font-medium text-slate-400 line-clamp-1">{idea.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Título de la situación (opcional)</label>
              <input
                type="text"
                placeholder="Ej: Pedir un café especial en Starbucks"
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-800 text-white text-xs font-bold focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">¿Qué quieres simular?</label>
              <textarea
                rows={3}
                placeholder="Describe qué rol toma el tutor y cuál es tu objetivo en la conversación..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-950 border-2 border-slate-800 text-white text-xs font-medium focus:border-purple-500 outline-none resize-none leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!customText.trim()}
              className="w-full mt-2 py-3 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-black border-2 border-b-4 border-purple-800 active:border-b-2 active:translate-y-0.5 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Comenzar Roleplay Personalizado</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
