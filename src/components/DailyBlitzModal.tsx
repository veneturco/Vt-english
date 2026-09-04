import React, { useState, useEffect, useRef } from "react";
import { Zap, Clock, CheckCircle, XCircle, Award, RotateCcw, X, Flame } from "lucide-react";
import confetti from "canvas-confetti";
import { playJumpSound, playErrorSoft, playSuccessFanfare, playCoinSound } from "../utils/audioSynth";
import { haptics } from "../utils/haptics";

interface BlitzQuestion {
  id: string;
  prompt: string;
  translation: string;
  options: string[];
  correctAnswer: string;
}

const BLITZ_QUESTIONS: BlitzQuestion[] = [
  {
    id: "bq_1",
    prompt: "I am writing to ___ about the meeting tomorrow.",
    translation: "Escribo para confirmar sobre la reunión de mañana.",
    options: ["confirm", "confirms", "confirmed", "confirming"],
    correctAnswer: "confirm",
  },
  {
    id: "bq_2",
    prompt: "Could you please send me the ___ by 5 PM?",
    translation: "¿Podrías enviarme el informe antes de las 5 PM?",
    options: ["report", "reported", "reporting", "reports"],
    correctAnswer: "report",
  },
  {
    id: "bq_3",
    prompt: "We need to schedule a quick ___ with the team.",
    translation: "Necesitamos agendar una llamada rápida con el equipo.",
    options: ["call", "called", "calling", "caller"],
    correctAnswer: "call",
  },
  {
    id: "bq_4",
    prompt: "Let's ___ over coffee this Friday!",
    translation: "¡Pongámonos al día con un café este viernes!",
    options: ["catch up", "take off", "look up", "break down"],
    correctAnswer: "catch up",
  },
  {
    id: "bq_5",
    prompt: "I look forward to ___ from you soon.",
    translation: "Espero tener noticias tuyas pronto.",
    options: ["hearing", "hear", "heard", "hears"],
    correctAnswer: "hearing",
  },
  {
    id: "bq_6",
    prompt: "Thank you for your quick ___.",
    translation: "Gracias por tu rápida respuesta.",
    options: ["response", "respond", "responded", "responding"],
    correctAnswer: "response",
  },
];

export interface DailyBlitzModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xpEarned: number, gemsEarned: number) => void;
}

export const DailyBlitzModal: React.FC<DailyBlitzModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streakCombo, setStreakCombo] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Initialize and run timer
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(60);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreakCombo(0);
    setIsFinished(false);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = BLITZ_QUESTIONS[currentIndex % BLITZ_QUESTIONS.length];

  const handleSelectOption = (option: string) => {
    if (isAnswered || isFinished) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      playJumpSound();
      haptics.success();
      setScore((s) => s + 10 + streakCombo * 2);
      setStreakCombo((sc) => sc + 1);
    } else {
      playErrorSoft();
      haptics.error();
      setStreakCombo(0);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= BLITZ_QUESTIONS.length || timeLeft <= 1) {
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);
        playSuccessFanfare();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      }
    }, 800);
  };

  const handleFinishAndClaim = () => {
    const xpBonus = Math.max(score, 25);
    const gemsBonus = score >= 30 ? 5 : 2;
    playCoinSound();
    onComplete(xpBonus, gemsBonus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col">
        
        {/* Top Header with Timer and Score */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-200 fill-amber-300" />
            <span className="text-sm font-black uppercase tracking-wider">
              Reto Blitz 60s
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Combo Badge */}
            {streakCombo > 1 && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[11px] animate-bounce">
                <Flame className="w-3.5 h-3.5 text-amber-200 fill-amber-300" />
                {streakCombo}x
              </span>
            )}

            {/* Countdown Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs ${
              timeLeft <= 10 ? "bg-red-500 text-white animate-pulse" : "bg-white/20 text-white"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isFinished ? (
          <div className="p-6 flex flex-col gap-5">
            {/* Question Counter */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Pregunta {currentIndex + 1} de {BLITZ_QUESTIONS.length}</span>
              <span className="text-amber-600 font-extrabold">Puntos: {score}</span>
            </div>

            {/* Prompt */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
              <p className="text-lg font-bold text-slate-900 leading-snug">
                {currentQ.prompt}
              </p>
              <p className="text-xs text-slate-500 mt-2 italic">
                {currentQ.translation}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2.5">
              {currentQ.options.map((opt) => {
                let btnStyle = "bg-white border-slate-200 text-slate-800 hover:bg-slate-50";

                if (isAnswered) {
                  if (opt === currentQ.correctAnswer) {
                    btnStyle = "bg-emerald-500 border-emerald-600 text-white font-black";
                  } else if (opt === selectedOption) {
                    btnStyle = "bg-rose-500 border-rose-600 text-white font-black";
                  } else {
                    btnStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt)}
                    className={`py-3 px-3 rounded-xl border-2 text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Finished Screen */
          <div className="p-6 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-inner">
              ⚡
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">¡Tiempo Cumplido!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Completaste el simulacro de velocidad y agilidad mental.
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 py-3 border-y border-slate-100">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Puntaje Total</span>
                <span className="text-xl font-black text-amber-600">+{score} pts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Recompensa</span>
                <span className="text-xl font-black text-emerald-600">
                  +{Math.max(score, 25)} XP 💎
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishAndClaim}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              Reclamar Puntos y Salvar Racha
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
