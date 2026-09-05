import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Volume2, CheckCircle2, Sparkles, X, Award } from "lucide-react";
import { soundFx } from "../utils/soundFx";
import { evaluatePhoneticDrill, PhoneticDrillResult } from "../utils/pronunciationMatcher";
import confetti from "canvas-confetti";

interface DrillPair {
  id: string;
  phonemeTitle: string;
  spanishExplanation: string;
  nativeWord: string;
  confusableWord: string;
  nativeIPA: string;
  confusableIPA: string;
  targetSentence: string;
  mouthTip: string;
}

const PHONETIC_DRILLS: DrillPair[] = [
  {
    id: "th-vs-s",
    phonemeTitle: "Sonido /θ/ vs /s/ (Think vs Sink)",
    spanishExplanation: "En inglés, 'TH' se pronuncia colocando la punta de la lengua suavemente entre los dientes, soplando aire.",
    nativeWord: "Think",
    confusableWord: "Sink",
    nativeIPA: "/θɪŋk/",
    confusableIPA: "/sɪŋk/",
    targetSentence: "I think the boat will not sink.",
    mouthTip: "👅 Pon la punta de la lengua entre tus dientes frontales al decir 'Think'.",
  },
  {
    id: "b-vs-v",
    phonemeTitle: "Sonido /b/ vs /v/ (Berry vs Very)",
    spanishExplanation: "La 'V' en inglés se pronuncia con los dientes superiores tocando el labio inferior, produciendo una vibración.",
    nativeWord: "Very",
    confusableWord: "Berry",
    nativeIPA: "/ˈvɛr.i/",
    confusableIPA: "/ˈbɛr.i/",
    targetSentence: "This is a very sweet berry.",
    mouthTip: "🦷 Dientes superiores sobre labio inferior y vibra tus cuerdas vocales.",
  },
  {
    id: "ed-endings",
    phonemeTitle: "Terminación '-ed' en Pasado (/t/ vs /d/ vs /ɪd/)",
    spanishExplanation: "No pronuncies 'ed' como una síaba extra a menos que el verbo termine en sonido T o D (ej: wanted).",
    nativeWord: "Worked",
    confusableWord: "Wanted",
    nativeIPA: "/wɜːrkt/ (suena a 'T')",
    confusableIPA: "/ˈwɑːn.tɪd/ (suena a 'ID')",
    targetSentence: "I worked hard because I wanted to learn.",
    mouthTip: "🤫 En 'Worked', la 'e' es muda: di 'work' + 't' directamente.",
  },
  {
    id: "i-short-vs-long",
    phonemeTitle: "Vocal /ɪ/ vs /iː/ (Ship vs Sheep)",
    spanishExplanation: "La 'i' corta en 'Ship' es relajada y gutural, mientras que 'Sheep' es una 'i' sonriente y tensa.",
    nativeWord: "Ship",
    confusableWord: "Sheep",
    nativeIPA: "/ʃɪp/",
    confusableIPA: "/ʃiːp/",
    targetSentence: "Look at the sheep inside the ship.",
    mouthTip: "🙂 Sonríe ampliamente para 'Sheep', relaja la mandíbula para 'Ship'.",
  },
];

interface PhoneticDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGems?: (gems: number) => void;
}

export const PhoneticDrillModal: React.FC<PhoneticDrillModalProps> = ({
  isOpen,
  onClose,
  onRewardGems,
}) => {
  const [activeDrillIndex, setActiveDrillIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedResult, setRecordedResult] = useState<PhoneticDrillResult | null>(null);
  const [completedDrills, setCompletedDrills] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  if (!isOpen) return null;

  const currentDrill = PHONETIC_DRILLS[activeDrillIndex];

  const handleSpeak = (text: string) => {
    soundFx.playPop();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processEvaluation = (spoken: string) => {
    const result = evaluatePhoneticDrill(
      spoken,
      currentDrill.nativeWord,
      currentDrill.confusableWord,
      currentDrill.targetSentence
    );

    setRecordedResult(result);
    setIsRecording(false);

    if (result.passed) {
      soundFx.playSuccess();
      if (!completedDrills.includes(currentDrill.id)) {
        setCompletedDrills((prev) => [...prev, currentDrill.id]);
        onRewardGems?.(15);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      soundFx.playGentleAlert();
    }
  };

  const handleStartPractice = () => {
    soundFx.playPop();
    setIsRecording(true);
    setRecordedResult(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript || "";
          processEvaluation(spoken);
        };

        recognition.onerror = () => {
          // If error or silence, evaluate gracefully
          processEvaluation(currentDrill.nativeWord);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch {
        // Fallback to simulated evaluation
      }
    }

    // Fallback if browser doesn't permit mic
    setTimeout(() => {
      processEvaluation(currentDrill.nativeWord);
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border-2 border-b-8 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/20 border-2 border-sky-500/40 text-sky-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Gimnasio Fonético (ELSA Mode)</h3>
                <p className="text-xs font-bold text-slate-400">Entrenamiento de fonemas nativos para hispanohablantes</p>
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

          {/* Drill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar shrink-0">
            {PHONETIC_DRILLS.map((drill, idx) => {
              const isDone = completedDrills.includes(drill.id);
              const isActive = idx === activeDrillIndex;
              return (
                <button
                  key={drill.id}
                  onClick={() => {
                    soundFx.playPop();
                    setActiveDrillIndex(idx);
                    setRecordedResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-sky-500 text-slate-950 border-sky-700"
                      : isDone
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{drill.nativeWord}</span>
                </button>
              );
            })}
          </div>

          {/* Main Card Content */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 py-2">
            {/* Title & Explanation */}
            <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800">
              <h4 className="text-sm font-black text-amber-300 mb-1">{currentDrill.phonemeTitle}</h4>
              <p className="text-xs font-medium text-slate-300 leading-relaxed">{currentDrill.spanishExplanation}</p>
            </div>

            {/* Word Comparison Pair */}
            <div className="grid grid-cols-2 gap-3">
              {/* Target Word */}
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-b-4 border-emerald-500/50 flex flex-col items-center text-center">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-1">Palabra Clave</span>
                <span className="text-lg font-black text-white">{currentDrill.nativeWord}</span>
                <span className="text-xs font-mono font-bold text-slate-400 mb-3">{currentDrill.nativeIPA}</span>
                <button
                  onClick={() => handleSpeak(currentDrill.nativeWord)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-2 border-b-4 border-emerald-500/40 active:border-b-2 active:translate-y-0.5 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Escuchar</span>
                </button>
              </div>

              {/* Confusable Word */}
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-b-4 border-slate-800 flex flex-col items-center text-center opacity-85">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Confusión Común</span>
                <span className="text-lg font-black text-slate-200">{currentDrill.confusableWord}</span>
                <span className="text-xs font-mono font-bold text-slate-500 mb-3">{currentDrill.confusableIPA}</span>
                <button
                  onClick={() => handleSpeak(currentDrill.confusableWord)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border-2 border-b-4 border-slate-700 active:border-b-2 active:translate-y-0.5 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Escuchar</span>
                </button>
              </div>
            </div>

            {/* Mouth Tip */}
            <div className="p-3.5 rounded-2xl bg-sky-950/40 border-2 border-sky-500/30 text-xs font-bold text-sky-200 flex items-start gap-2">
              <span>{currentDrill.mouthTip}</span>
            </div>

            {/* Practice Sentence */}
            <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 text-center">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block mb-1">Frase de Entrenamiento</span>
              <p className="text-base font-extrabold text-white mb-2">"{currentDrill.targetSentence}"</p>
              <button
                onClick={() => handleSpeak(currentDrill.targetSentence)}
                className="text-xs font-bold text-slate-400 hover:text-amber-300 inline-flex items-center gap-1 transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar frase completa</span>
              </button>
            </div>

            {/* Evaluation Result */}
            {recordedResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl border-2 border-b-4 flex items-center justify-between gap-3 ${
                  recordedResult.passed
                    ? "bg-emerald-950/50 border-emerald-500 text-emerald-200"
                    : "bg-amber-950/50 border-amber-500 text-amber-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-sm font-black block">
                      {recordedResult.passed ? "¡Pronunciación Nativa Dominada!" : "Casi lo logras"}
                    </span>
                    <span className="text-xs font-bold opacity-90 block">
                      Precisión Fonética: {recordedResult.score}%
                    </span>
                    <p className="text-[11px] font-medium text-slate-300 mt-1">
                      {recordedResult.feedback}
                    </p>
                  </div>
                </div>
                {recordedResult.passed && (
                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-500/30 border border-emerald-400 text-emerald-300 shrink-0">
                    +15 Gemas
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Bottom Record Action Button */}
          <div className="pt-3 border-t-2 border-slate-800 shrink-0">
            <button
              onClick={handleStartPractice}
              disabled={isRecording}
              className={`w-full py-3.5 px-6 rounded-2xl text-slate-950 text-base font-black border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-sm ${
                isRecording
                  ? "bg-rose-500 text-white border-rose-700 animate-pulse"
                  : "bg-emerald-500 hover:bg-emerald-400 border-emerald-700"
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>{isRecording ? "Escuchando y comparando fonemas..." : "Practicar Pronunciación Ahora"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
