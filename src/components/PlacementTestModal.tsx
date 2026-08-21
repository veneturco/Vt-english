import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Award, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Volume2 } from "lucide-react";
import { PLACEMENT_QUESTIONS, PlacementQuestion } from "../data/placementQuestions";
import { CEFRLevel, AvatarConfig } from "../types";
import { speakText } from "../utils/speech";

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarConfig: AvatarConfig;
  onComplete: (recommendedLevel: CEFRLevel) => void;
}

export function PlacementTestModal({
  isOpen,
  onClose,
  avatarConfig,
  onComplete,
}: PlacementTestModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ: PlacementQuestion = PLACEMENT_QUESTIONS[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100);

  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOptionIndex(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null) return;
    const isCorrect = currentQ.options[selectedOptionIndex].isCorrect;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
    setIsAnswerChecked(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < PLACEMENT_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerChecked(false);
    } else {
      setIsFinished(true);
    }
  };

  const calculateResultLevel = (): CEFRLevel => {
    const ratio = correctCount / PLACEMENT_QUESTIONS.length;
    if (ratio >= 0.85) return "C1";
    if (ratio >= 0.65) return "B2";
    if (ratio >= 0.45) return "B1";
    if (ratio >= 0.25) return "A2";
    return "A1";
  };

  const recommendedLevel = calculateResultLevel();

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerChecked(false);
    setCorrectCount(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!isFinished ? (
          <div>
            {/* Header & Progress */}
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-white">
                  Test de Nivelación CEFR
                </h3>
                <p className="text-xs text-slate-400">
                  Pregunta {currentIndex + 1} de {PLACEMENT_QUESTIONS.length} • Nivel objetivo {currentQ.level}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="mb-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                {currentQ.question}
              </p>
              <button
                type="button"
                onClick={() => speakText(currentQ.question, avatarConfig)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 shrink-0 transition"
                title="Escuchar pregunta"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-2.5 mb-5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;
                let optStyle = "bg-slate-950/40 hover:bg-slate-800 border-slate-800 text-slate-200";

                if (isSelected) {
                  optStyle = "bg-amber-500/20 border-amber-500/60 text-amber-200 ring-2 ring-amber-500/30";
                }

                if (isAnswerChecked) {
                  if (opt.isCorrect) {
                    optStyle = "bg-emerald-500/20 border-emerald-500/60 text-emerald-200 ring-2 ring-emerald-500/30";
                  } else if (isSelected && !opt.isCorrect) {
                    optStyle = "bg-rose-500/20 border-rose-500/60 text-rose-200 ring-2 ring-rose-500/30";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerChecked}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center justify-between ${optStyle}`}
                  >
                    <span>{opt.text}</span>
                    {isAnswerChecked && opt.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after checking */}
            {isAnswerChecked && (
              <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-300">
                💡 <span className="font-bold text-amber-300">Explicación:</span> {currentQ.explanation}
              </div>
            )}

            {/* Action Buttons */}
            <div>
              {!isAnswerChecked ? (
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  disabled={selectedOptionIndex === null}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:scale-[1.01] transition"
                >
                  Comprobar Respuesta
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-lg hover:scale-[1.01] transition flex items-center justify-center gap-1.5"
                >
                  <span>Siguiente Pregunta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl text-slate-950">
              🏆
            </div>

            <h3 className="text-xl font-black text-white">¡Test Completado!</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Acertaste {correctCount} de {PLACEMENT_QUESTIONS.length} preguntas evaluadas.
            </p>

            {/* Level Recommendation Badge */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6">
              <span className="text-[11px] font-black uppercase text-amber-400">
                Nivel Recomendado
              </span>
              <div className="text-3xl font-black text-amber-300 mt-1">
                {recommendedLevel}
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Hemos calibrado tu vocabulario, gramática y velocidad de respuesta ideal para este nivel.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repetir Test</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onComplete(recommendedLevel);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-lg hover:scale-105 transition"
              >
                Aplicar Nivel {recommendedLevel}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
