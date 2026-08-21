import React, { useState, useEffect } from "react";
import { X, Zap, Volume2, Mic, Trophy, Sparkles, RefreshCw, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { AvatarConfig } from "../types";
import { speakText, voiceRecognizer } from "../utils/speech";

interface SpeedSpeakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarConfig: AvatarConfig;
  onCompleteChallenge: (score: number, gemsWon: number) => void;
}

interface SpeedPrompt {
  id: string;
  situation: string;
  promptQuestion: string;
  suggestedAnswers: string[];
  keywords: string[];
}

const SPEED_PROMPTS: SpeedPrompt[] = [
  {
    id: "1",
    situation: "☕ En el Café",
    promptQuestion: "The barista asks: 'What can I get started for you today?'",
    suggestedAnswers: ["I'd like an iced latte with oat milk, please.", "Can I get a black coffee to go?"],
    keywords: ["like", "coffee", "latte", "please", "get", "tea"],
  },
  {
    id: "2",
    situation: "✈️ En el Aeropuerto",
    promptQuestion: "The agent asks: 'Window or aisle seat for your flight to New York?'",
    suggestedAnswers: ["Window seat, please!", "An aisle seat would be perfect, thanks."],
    keywords: ["window", "aisle", "seat", "please", "thanks"],
  },
  {
    id: "3",
    situation: "💼 Entrevista de Trabajo",
    promptQuestion: "The interviewer asks: 'How do you usually handle tight deadlines?'",
    suggestedAnswers: ["I prioritize tasks and communicate clearly with my team.", "I stay organized and focus on one step at a time."],
    keywords: ["prioritize", "tasks", "team", "organized", "focus", "time"],
  },
  {
    id: "4",
    situation: "🛍️ De Compras",
    promptQuestion: "The clerk asks: 'Do you need this in a smaller size or different color?'",
    suggestedAnswers: ["Do you have this in medium in navy blue?", "No, this size is just right, thank you."],
    keywords: ["size", "color", "medium", "blue", "have", "right"],
  },
];

export const SpeedSpeakingModal: React.FC<SpeedSpeakingModalProps> = ({
  isOpen,
  onClose,
  avatarConfig,
  onCompleteChallenge,
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentPrompt = SPEED_PROMPTS[currentPromptIndex % SPEED_PROMPTS.length];

  // Timer countdown
  useEffect(() => {
    let timer: number | null = null;
    if (isActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleFinish();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setIsActive(true);
    setTimeLeft(60);
    setScore(0);
    setCorrectAnswers(0);
    setCurrentPromptIndex(0);
    setIsFinished(false);
    playQuestion(SPEED_PROMPTS[0]);
  };

  const playQuestion = (prompt: SpeedPrompt) => {
    speakText(
      prompt.promptQuestion,
      avatarConfig,
      undefined,
      () => {
        // Start listening right after avatar speaks prompt
        if (isActive) {
          startMic();
        }
      },
      undefined,
      { forceLang: avatarConfig.voiceAccent || "en-US", rateMultiplier: 1.05 }
    );
  };

  const startMic = () => {
    setTranscript("");
    setIsListening(true);
    
    // Subscribe to voice recognizer
    const unsubscribe = voiceRecognizer.subscribe({
      onTranscript: (text, isFinal) => {
        setTranscript(text);
        if (isFinal || text.length > 5) {
          evaluateAnswer(text);
        }
      },
      onStart: () => {},
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });

    const started = voiceRecognizer.startListening();
    if (!started) {
      setIsListening(false);
      unsubscribe();
    }
  };

  const evaluateAnswer = (spokenText: string) => {
    const cleanSpoken = spokenText.toLowerCase();
    const matches = currentPrompt.keywords.filter((kw) => cleanSpoken.includes(kw.toLowerCase()));

    if (matches.length >= 1 || cleanSpoken.split(" ").length >= 3) {
      voiceRecognizer.stopListening();
      setIsListening(false);
      const points = 100 + matches.length * 25;
      setScore((prev) => prev + points);
      setCorrectAnswers((prev) => prev + 1);

      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      } catch {}

      // Move to next prompt
      if (currentPromptIndex + 1 < SPEED_PROMPTS.length) {
        setTimeout(() => {
          setCurrentPromptIndex((prev) => prev + 1);
          playQuestion(SPEED_PROMPTS[currentPromptIndex + 1]);
        }, 600);
      } else {
        handleFinish();
      }
    }
  };

  const handleFinish = () => {
    setIsActive(false);
    setIsListening(false);
    voiceRecognizer.stopListening();
    setIsFinished(true);
    const gemsWon = Math.max(10, Math.floor(score / 15));
    onCompleteChallenge(score, gemsWon);
    try {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#0d1117] border border-slate-700 shadow-2xl p-6 relative overflow-hidden flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Speed Speaking 60s</h2>
              <p className="text-xs text-slate-400">Responde rápido en inglés sin traducir</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsActive(false);
              voiceRecognizer.stopListening();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isActive && !isFinished ? (
          /* Start Screen */
          <div className="flex flex-col items-center justify-center py-8 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-4xl shadow-inner animate-pulse">
              ⚡
            </div>
            <div className="max-w-sm">
              <h3 className="text-base font-bold text-white mb-1">¡Entrena tu velocidad de reacción!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                El avatar te hará preguntas situacionales rápidas. Responde en voz alta antes de que termine el tiempo para ganar gemas 💎 y subir de nivel.
              </p>
            </div>
            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-base shadow-lg shadow-rose-500/30 transition active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>¡Comenzar Reto de 60s!</span>
            </button>
          </div>
        ) : isFinished ? (
          /* Results Screen */
          <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg">
              🏆
            </div>
            <div>
              <h3 className="text-xl font-black text-white">¡Reto Completado!</h3>
              <p className="text-xs text-slate-400">Gran agilidad mental en inglés</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Puntos XP</span>
                <p className="text-2xl font-black text-amber-400">+{score}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Gemas Ganadas</span>
                <p className="text-2xl font-black text-emerald-400">+{Math.max(10, Math.floor(score / 15))} 💎</p>
              </div>
            </div>
            <button
              onClick={handleStart}
              className="mt-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Intentar de nuevo</span>
            </button>
          </div>
        ) : (
          /* Active Challenge */
          <div className="flex flex-col gap-4">
            {/* Top Stats: Timer & Score */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Tiempo:</span>
                <span className={`text-lg font-black font-mono ${timeLeft <= 10 ? "text-rose-400 animate-ping" : "text-amber-400"}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Puntos:</span>
                <span className="text-base font-black text-emerald-400">{score} XP</span>
              </div>
            </div>

            {/* Prompt Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-slate-700/80 flex flex-col gap-3">
              <span className="text-xs font-bold text-amber-400 uppercase">{currentPrompt.situation}</span>
              <p className="text-base font-bold text-white">{currentPrompt.promptQuestion}</p>
              <div className="flex flex-col gap-1 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Respuestas sugeridas:</span>
                {currentPrompt.suggestedAnswers.map((ans, idx) => (
                  <p key={idx} className="italic text-slate-300">"{ans}"</p>
                ))}
              </div>
            </div>

            {/* Mic Recording Area */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-300 italic truncate flex-1">
                {transcript || (isListening ? "🎙️ Escuchando tu respuesta..." : "Presiona el botón para responder")}
              </p>
              <button
                onClick={startMic}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isListening ? "Hablando..." : "Responder"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
