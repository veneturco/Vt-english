import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Sparkles, X, Volume2, ArrowRight } from "lucide-react";
import { GrammarCorrection, AvatarConfig } from "../types";
import { speakText } from "../utils/speech";

interface GrammarFeedbackSheetProps {
  correction: GrammarCorrection;
  onDismiss: () => void;
  avatarConfig: AvatarConfig;
}

export function GrammarFeedbackSheet({
  correction,
  onDismiss,
  avatarConfig,
}: GrammarFeedbackSheetProps) {
  if (!correction) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl mx-auto rounded-2xl p-4 bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-100 relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          aria-label="Cerrar corrección"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Praise */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="p-1.5 rounded-full bg-amber-500/20 text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-amber-400">
              Coaching Gramatical & Fluidez
            </h4>
            <p className="text-sm font-semibold text-slate-200">
              {correction.praise || "¡Gran esfuerzo al expresarte!"}
            </p>
          </div>
        </div>

        {/* Correction Comparison */}
        <div className="space-y-2 text-xs sm:text-sm">
          {correction.originalSentence && correction.correctedSentence && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Lo que dijiste:
                </span>
                <p className="text-slate-300 line-through decoration-rose-500/80">
                  {correction.originalSentence}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 mb-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Forma Correcta:
                </span>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-emerald-300 font-bold">
                    {correction.correctedSentence}
                  </p>
                  <button
                    type="button"
                    onClick={() => speakText(correction.correctedSentence || "", avatarConfig)}
                    className="p-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition"
                    title="Escuchar pronunciación"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Friendly Spanish Pedagogical Explanation */}
          {correction.explanation && (
            <p className="text-xs text-slate-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-relaxed">
              💡 <span className="font-semibold text-amber-300">Regla clave:</span>{" "}
              {correction.explanation}
            </p>
          )}

          {/* Native Speaker Alternative */}
          {correction.nativeAlternative && (
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🇺🇸</span>
                <span className="text-xs font-semibold">
                  Opción nativa: <span className="italic text-white">"{correction.nativeAlternative}"</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => speakText(correction.nativeAlternative || "", avatarConfig)}
                className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition shrink-0"
                title="Escuchar alternativa nativa"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
