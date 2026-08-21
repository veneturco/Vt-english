import React, { useState } from "react";
import { SRSFlashcard, AvatarConfig } from "../types";
import { getStoredFlashcards, reviewFlashcard, saveStoredFlashcards } from "../utils/srs";
import { speakText } from "../utils/speech";
import { Brain, Volume2, RotateCcw, Sparkles, Check, Flame, X, ChevronRight } from "lucide-react";

interface SRSFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarConfig: AvatarConfig;
  onGemsEarned?: (gems: number) => void;
}

export const SRSFlashcardsModal: React.FC<SRSFlashcardsModalProps> = ({
  isOpen,
  onClose,
  avatarConfig,
  onGemsEarned,
}) => {
  const [cards, setCards] = useState<SRSFlashcard[]>(getStoredFlashcards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(0);

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];
  const isFinished = !currentCard || currentIndex >= cards.length;

  const handleSpeak = (text: string) => {
    speakText(text, avatarConfig);
  };

  const handleGrade = (grade: 0 | 1 | 2 | 3) => {
    if (!currentCard) return;

    const updatedCard = reviewFlashcard(currentCard, grade);
    const updatedCards = [...cards];
    updatedCards[currentIndex] = updatedCard;

    setCards(updatedCards);
    saveStoredFlashcards(updatedCards);

    setCompletedCount((prev) => prev + 1);
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);

    if (grade >= 2 && onGemsEarned) {
      onGemsEarned(1);
    }
  };

  const handleResetDeck = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Smart Audio Flashcards</h3>
            <p className="text-xs text-slate-400">Repetición espaciada (SRS) para memoria de largo plazo</p>
          </div>
        </div>

        {!isFinished ? (
          <div>
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-medium">
              <span>Tarjeta {currentIndex + 1} de {cards.length}</span>
              <span className="text-purple-400 font-semibold">Repeticiones: {currentCard.repetitions}</span>
            </div>

            {/* Flashcard Card (Interactive Flip) */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`w-full min-h-[220px] rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center shadow-xl relative ${
                isFlipped
                  ? "bg-gradient-to-b from-purple-950/40 to-slate-900 border-purple-500/40"
                  : "bg-slate-800/60 border-slate-700 hover:border-purple-500/30"
              }`}
            >
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentCard.frontWord);
                  }}
                  className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition"
                  title="Escuchar audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {!isFlipped ? (
                <div>
                  <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block mb-2">
                    Inglés
                  </span>
                  <h2 className="text-2xl font-black text-slate-100 mb-2">
                    {currentCard.frontWord}
                  </h2>
                  {currentCard.phoneticSpanish && (
                    <p className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full inline-block border border-amber-500/20">
                      🗣️ {currentCard.phoneticSpanish}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-4">
                    👉 Toca para voltear y ver traducción
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in duration-200">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                    Significado & Uso
                  </span>
                  <h3 className="text-xl font-bold text-slate-100 mb-3">
                    {currentCard.backMeaning}
                  </h3>
                  {currentCard.exampleSentence && (
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 italic">
                      "{currentCard.exampleSentence}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SRS Action Buttons */}
            {isFlipped ? (
              <div className="grid grid-cols-4 gap-2 mt-5">
                <button
                  onClick={() => handleGrade(0)}
                  className="py-2.5 px-2 rounded-xl bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold transition flex flex-col items-center gap-0.5 active:scale-95"
                >
                  <span>Repetir</span>
                  <span className="text-[10px] text-rose-400 font-normal">1 día</span>
                </button>
                <button
                  onClick={() => handleGrade(1)}
                  className="py-2.5 px-2 rounded-xl bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 text-amber-300 text-xs font-bold transition flex flex-col items-center gap-0.5 active:scale-95"
                >
                  <span>Difícil</span>
                  <span className="text-[10px] text-amber-400 font-normal">2 días</span>
                </button>
                <button
                  onClick={() => handleGrade(2)}
                  className="py-2.5 px-2 rounded-xl bg-blue-950/60 border border-blue-500/40 hover:bg-blue-900/60 text-blue-300 text-xs font-bold transition flex flex-col items-center gap-0.5 active:scale-95"
                >
                  <span>Bien</span>
                  <span className="text-[10px] text-blue-400 font-normal">4 días</span>
                </button>
                <button
                  onClick={() => handleGrade(3)}
                  className="py-2.5 px-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold transition flex flex-col items-center gap-0.5 active:scale-95"
                >
                  <span>Fácil</span>
                  <span className="text-[10px] text-emerald-400 font-normal">7 días</span>
                </button>
              </div>
            ) : (
              <div className="mt-5">
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition active:scale-95"
                >
                  Mostrar Respuesta
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished State */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-emerald-500/30">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-xl font-black text-slate-100 mb-1">
              ¡Repaso Diario Completado!
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
              Has afianzado {completedCount} expresiones en tu memoria de largo plazo con el algoritmo SM-2.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResetDeck}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repasar Otra Vez</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
