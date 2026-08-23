import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Flame, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { soundFx } from "../utils/soundFx";
import { haptics } from "../utils/haptics";

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  xpGained: number;
  streakCount: number;
  accuracyScore: number;
  wordsLearned: number;
  topicTitle: string;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  xpGained,
  streakCount,
  accuracyScore,
  wordsLearned,
  topicTitle,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      soundFx.playQuestComplete();
      haptics.celebrate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-md bg-slate-900 border-2 border-b-8 border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
        >
          {/* Top celebratory icon */}
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            ¡Práctica Completada!
          </h2>
          <p className="text-sm font-bold text-slate-400 mt-1 mb-6">
            Has dominado el tema: <span className="text-amber-300">"{topicTitle}"</span>
          </p>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-3 gap-2.5 mb-6">
            {/* XP Gained */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950 border-2 border-slate-800">
              <Sparkles className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-lg font-black text-amber-300">+{xpGained}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gemas XP</span>
            </div>

            {/* Streak */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950 border-2 border-slate-800">
              <Flame className="w-5 h-5 text-orange-400 mb-1" />
              <span className="text-lg font-black text-orange-400">{streakCount} días</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Racha</span>
            </div>

            {/* Accuracy */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950 border-2 border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-lg font-black text-emerald-400">{accuracyScore}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Precisión</span>
            </div>
          </div>

          {wordsLearned > 0 && (
            <div className="w-full p-3 mb-6 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/30 text-xs font-bold text-indigo-200 flex items-center justify-center gap-2">
              <span>📖 +{wordsLearned} palabras nuevas añadidas a tu vocabulario</span>
            </div>
          )}

          {/* Action Continue Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-base font-black border-2 border-b-4 border-emerald-700 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Continuar al Menú</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
