import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Timer, CheckCircle2, Award, RotateCcw, X, Mic } from "lucide-react";
import { soundFx } from "../utils/soundFx";
import { haptics } from "../utils/haptics";
import confetti from "canvas-confetti";

interface SpeedSpeakingChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXP: (xp: number) => void;
}

const SPEED_QUESTIONS = [
  { q: "What's your favorite food and why?", hint: "Ej: My favorite food is pizza because..." },
  { q: "What did you do yesterday evening?", hint: "Ej: Yesterday I watched a movie and..." },
  { q: "Where would you like to travel next?", hint: "Ej: I would love to visit Japan because..." },
  { q: "How do you start your morning routine?", hint: "Ej: I wake up, drink coffee and..." },
  { q: "What is your dream job?", hint: "Ej: My dream job is to work as..." },
];

export const SpeedSpeakingChallengeModal: React.FC<SpeedSpeakingChallengeModalProps> = ({
  isOpen,
  onClose,
  onRewardXP,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    setIsPlaying(true);
    setTimeLeft(60);
    setScore(0);
    setCurrentIdx(0);
    setIsFinished(false);
    soundFx.playPop();
    haptics.medium();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          setIsFinished(true);
          soundFx.playQuestComplete();
          haptics.celebrate();
          confetti({ particleCount: 50, spread: 70 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNextQuestion = () => {
    soundFx.playSuccess();
    haptics.success();
    setScore((prev) => prev + 1);
    if (currentIdx < SPEED_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-slate-900 border-2 border-b-8 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden text-center"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border-2 border-amber-500/40">
                <Zap className="w-5 h-5 fill-amber-400" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-white">Speed Speaking en 60s</h3>
                <p className="text-xs font-bold text-slate-400">Entrena tu fluidez sin traducir en tu cabeza</p>
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

          {!isPlaying && !isFinished ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-20 h-20 rounded-3xl bg-amber-400/20 border-2 border-amber-400/40 flex items-center justify-center text-4xl">
                ⚡
              </div>
              <div className="max-w-xs">
                <h4 className="text-lg font-black text-white mb-1">¿Listo para el reto?</h4>
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  Responde tantas preguntas en inglés como puedas en 60 segundos. ¡Cada respuesta cuenta!
                </p>
              </div>
              <button
                onClick={handleStart}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-black border-2 border-b-4 border-amber-600 active:border-b-2 active:translate-y-0.5 transition shadow-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>¡Iniciar Reto de 60 Segundos!</span>
              </button>
            </div>
          ) : isPlaying ? (
            <div className="flex flex-col gap-4 py-2">
              {/* Timer Bar */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border-2 border-slate-800 text-xs font-black">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Timer className="w-4 h-4 animate-spin" /> Tiempo: {timeLeft}s
                </span>
                <span className="text-emerald-400">Respondidas: {score}</span>
              </div>

              {/* Question Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-slate-800 text-left">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Pregunta #{currentIdx + 1}
                </span>
                <p className="text-base font-black text-white mb-2">"{SPEED_QUESTIONS[currentIdx].q}"</p>
                <span className="text-xs font-medium text-slate-400 italic">
                  {SPEED_QUESTIONS[currentIdx].hint}
                </span>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black border-2 border-b-4 border-emerald-700 active:border-b-2 active:translate-y-0.5 transition flex items-center justify-center gap-2 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Respondí en voz alta (Siguiente)</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <Award className="w-14 h-14 text-amber-400 animate-bounce" />
              <div>
                <h4 className="text-xl font-black text-white mb-1">¡Tiempo Terminado!</h4>
                <p className="text-xs font-bold text-slate-300">
                  Lograste responder <strong className="text-emerald-400">{score} preguntas</strong> con rapidez nativa.
                </p>
              </div>
              <button
                onClick={() => {
                  onRewardXP(score * 15);
                  onClose();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black border-2 border-b-4 border-emerald-700 transition"
              >
                Reclamar +{score * 15} XP y Salir
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
