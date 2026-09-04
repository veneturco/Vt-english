import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  RotateCcw,
  VolumeX,
  Mic,
  MicOff,
  BookOpen,
} from "lucide-react";
import {
  playPopSound,
  playCoinSound,
  playErrorSoft,
  playJumpSound,
  playSuccessFanfare,
} from "../utils/audioSynth";
import { fireParticles } from "../utils/particleHelper";
import { haptics } from "../utils/haptics";
import { getQuestionsForLessonNode, LessonQuestion } from "../data/lessonQuestionsData";
import { AvatarConfig } from "../types";
import { calculateSimilarity } from "../utils/storage";
import { voiceRecognizer } from "../utils/speech";
import { addMistakeToFlashcards } from "../utils/srs";

export interface LessonEngineViewProps {
  nodeId?: string;
  lessonTitle?: string;
  lessonSubtitle?: string;
  initialXpReward?: number;
  avatarConfig?: AvatarConfig;
  streakDays?: number;
  onClose: () => void;
  onComplete?: (xpEarned: number, accuracy?: number) => void;
}

export const LessonEngineView: React.FC<LessonEngineViewProps> = ({
  nodeId,
  lessonTitle = "El Café de la Mañana & Presentaciones",
  lessonSubtitle = "Vocabulario clave y frases de oficina",
  initialXpReward = 25,
  avatarConfig,
  streakDays = 1,
  onClose,
  onComplete,
}) => {
  const [questions] = useState<LessonQuestion[]>(() =>
    getQuestionsForLessonNode(nodeId, lessonTitle)
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Modo Hablado: Pronunciación por voz
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [speechScores, setSpeechScores] = useState<{ word: string; score: number }[] | null>(null);
  const [overallSpeechAccuracy, setOverallSpeechAccuracy] = useState<number | null>(null);
  const [bonusSpeechXp, setBonusSpeechXp] = useState(0);
  const [showSpeechChallenge, setShowSpeechChallenge] = useState(false);

  // Avatar feedback mood
  const [avatarMood, setAvatarMood] = useState<"idle" | "speaking" | "happy" | "thinking" | "listening">("idle");
  const [avatarBubbleText, setAvatarBubbleText] = useState("¡Vamos! Selecciona la opción correcta.");

  const currentQuestion = questions[currentStep];
  const progressPercent = ((currentStep) / questions.length) * 100;
  const isLastQuestion = currentStep === questions.length - 1;

  // Actualizar estado del avatar según eventos
  useEffect(() => {
    if (checkStatus === "correct") {
      setAvatarMood("happy");
      setAvatarBubbleText("¡Excelente! Bien formulado 🎉");
    } else if (checkStatus === "incorrect") {
      setAvatarMood("thinking");
      setAvatarBubbleText("¡Ánimo! La guardé en tu cuaderno de repaso 📖");
    } else if (isRecording) {
      setAvatarMood("listening");
      setAvatarBubbleText("Te escucho... habla con claridad 🎙️");
    } else if (isSpeaking) {
      setAvatarMood("speaking");
      setAvatarBubbleText("Escucha atentamente el acento nativo 🎧");
    } else {
      setAvatarMood("idle");
      setAvatarBubbleText(
        avatarConfig?.name
          ? `Soy ${avatarConfig.name}, ¡tú puedes lograrlo!`
          : "¡Tú puedes lograrlo!"
      );
    }
  }, [checkStatus, isRecording, isSpeaking, avatarConfig?.name]);

  // Manejador del reconocimiento de voz para práctica oral
  useEffect(() => {
    if (!isRecording) return;

    const unsubscribe = voiceRecognizer.subscribe({
      onStart: () => {
        setIsRecording(true);
      },
      onTranscript: (text, isFinal) => {
        setSpokenTranscript(text);
        if (isFinal && currentQuestion) {
          evaluateSpokenSpeech(text, currentQuestion.englishPrompt);
          setIsRecording(false);
        }
      },
      onError: (_err: string) => {
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    voiceRecognizer.startListening();

    return () => {
      unsubscribe();
      voiceRecognizer.stopListening();
    };
  }, [isRecording, currentQuestion]);

  const evaluateSpokenSpeech = (spoken: string, target: string) => {
    const cleanTargetWords = target
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    const cleanSpokenWords = spoken
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    const scores = cleanTargetWords.map((tWord) => {
      let maxSim = 0;
      cleanSpokenWords.forEach((sWord) => {
        const sim = calculateSimilarity(sWord, tWord);
        if (sim > maxSim) maxSim = sim;
      });
      return { word: tWord, score: Math.round(maxSim * 100) };
    });

    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length)
        : 0;

    setSpeechScores(scores);
    setOverallSpeechAccuracy(avg);

    if (avg >= 70) {
      playCoinSound();
      haptics.success();
      setBonusSpeechXp((prev) => prev + 10);
      fireParticles(window.innerWidth / 2, window.innerHeight * 0.5, "stars", 30);
    }
  };

  const toggleSpeechChallenge = () => {
    if (isRecording) {
      voiceRecognizer.stopListening();
      setIsRecording(false);
    } else {
      setSpokenTranscript("");
      setSpeechScores(null);
      setOverallSpeechAccuracy(null);
      setShowSpeechChallenge(true);
      setIsRecording(true);
    }
  };

  // Reproducir pronunciación por voz nativa
  const speakPrompt = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha"))
      ) || voices.find((v) => v.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Reproducir automáticamente la primera vez que se carga un paso
  useEffect(() => {
    if (currentQuestion && !isFinished) {
      speakPrompt(currentQuestion.englishPrompt);
      // Reset speech challenge for new step
      setShowSpeechChallenge(false);
      setSpokenTranscript("");
      setSpeechScores(null);
      setOverallSpeechAccuracy(null);
    }
  }, [currentStep, isFinished]);

  // Selección de Opción
  const handleSelectOption = (optionId: string) => {
    if (checkStatus !== "idle") return; // Bloquear si ya se comprobó
    playPopSound();
    setSelectedOptionId(optionId);
  };

  // Comprobar Respuesta
  const handleCheck = () => {
    if (!selectedOptionId || !currentQuestion) return;

    const chosenOption = currentQuestion.options.find((o) => o.id === selectedOptionId);
    if (!chosenOption) return;

    if (chosenOption.isCorrect) {
      setCheckStatus("correct");
      setCorrectAnswersCount((prev) => prev + 1);
      playJumpSound();
      haptics.success();
      // Disparar confeti visual
      fireParticles(window.innerWidth / 2, window.innerHeight * 0.75, "confetti", 40);
    } else {
      setCheckStatus("incorrect");
      playErrorSoft();
      haptics.error();

      // Guardar automáticamente en el Cuaderno Inteligente de Repaso (SRS)
      const correctOpt = currentQuestion.options.find((o) => o.isCorrect);
      addMistakeToFlashcards(
        currentQuestion.englishPrompt,
        correctOpt?.text || currentQuestion.explanation,
        currentQuestion.explanation,
        currentQuestion.pronunciationHint
      );
    }
  };

  // Continuar al Siguiente Paso
  const handleContinue = () => {
    playPopSound();

    if (isLastQuestion) {
      // Finalizar lección y mostrar pantalla de celebración
      setIsFinished(true);
      playSuccessFanfare();
      haptics.lessonComplete();
      fireParticles(window.innerWidth / 2, window.innerHeight * 0.4, "stars", 60);
    } else {
      // Pasar a la siguiente pregunta
      setCurrentStep((prev) => prev + 1);
      setSelectedOptionId(null);
      setCheckStatus("idle");
    }
  };

  // Atajo de teclado (Enter para comprobar o continuar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (checkStatus === "idle" && selectedOptionId) {
          handleCheck();
        } else if (checkStatus !== "idle") {
          handleContinue();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [checkStatus, selectedOptionId, isLastQuestion]);

  // ==========================================
  // PANTALLA DE CELEBRACIÓN FINAL (COMPLETADA)
  // ==========================================
  if (isFinished) {
    const accuracy = Math.round((correctAnswersCount / questions.length) * 100);

    const handleFinishAndReturn = () => {
      if (onComplete) {
        onComplete(initialXpReward + bonusSpeechXp, accuracy);
      }
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-6 sm:p-10 animate-in fade-in duration-300">
        <div className="w-full max-w-md flex justify-end">
          <button
            type="button"
            onClick={handleFinishAndReturn}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Celebración Central */}
        <div className="w-full max-w-md flex flex-col items-center text-center gap-6">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-400/40">
              <Trophy className="w-16 h-16 fill-slate-950 text-slate-950" />
            </div>
            <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-black tracking-wider uppercase shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Perfect</span>
            </div>
          </motion.div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ¡Lección Completada!
            </h1>
            <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">
              Has dominado las frases clave de esta unidad profesional.
            </p>
          </div>

          {/* Estadísticas de la sesión */}
          <div className="w-full grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col items-center">
              <div className="flex items-center gap-1 text-amber-600">
                <Zap className="w-4 h-4 fill-amber-500" />
                <span className="text-[11px] font-black uppercase">XP Total</span>
              </div>
              <span className="text-xl font-extrabold text-amber-950 mt-1">
                +{initialXpReward + bonusSpeechXp}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col items-center">
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase">Aciertos</span>
              </div>
              <span className="text-xl font-extrabold text-emerald-950 mt-1">
                {accuracy}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 flex flex-col items-center">
              <div className="flex items-center gap-1 text-orange-600">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span className="text-[11px] font-black uppercase">Racha</span>
              </div>
              <span className="text-xl font-extrabold text-orange-950 mt-1">
                +{streakDays} Días
              </span>
            </div>
          </div>
        </div>

        {/* Botón de Salida y Retorno */}
        <div className="w-full max-w-md pt-6">
          <button
            type="button"
            onClick={handleFinishAndReturn}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Volver al Mapa de Aprendizaje</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const correctOption = currentQuestion.options.find((o) => o.isCorrect);

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-900 flex flex-col justify-between select-none">
      
      {/* 1. TOP BAR (PROGRESO Y SALIDA) */}
      <header className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center gap-4 shrink-0">
        {/* Botón "X" para salir */}
        <button
          type="button"
          onClick={() => setShowExitConfirm(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title="Abandonar lección"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Barra de Progreso Animada */}
        <div className="flex-1 h-3.5 bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
          <motion.div
            className="h-full bg-emerald-500 rounded-full transition-all duration-400 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Avatar Companion Expression Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 shrink-0">
          <span className="text-base select-none">
            {avatarMood === "happy"
              ? "🥳"
              : avatarMood === "thinking"
              ? "🤔"
              : avatarMood === "listening"
              ? "🎙️"
              : avatarMood === "speaking"
              ? "🗣️"
              : avatarConfig?.characterEmoji || "👩‍🏫"}
          </span>
          <span className="text-[11px] font-bold text-slate-700 max-w-[120px] truncate">
            {avatarBubbleText}
          </span>
        </div>

        {/* Contador de Pasos */}
        <span className="text-xs font-extrabold text-slate-400 shrink-0">
          {currentStep + 1} / {questions.length}
        </span>
      </header>

      {/* 2. ÁREA DE DESAFÍO (CENTRO) */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center gap-5 overflow-y-auto">
        
        {/* Encabezado del Desafío + Avatar Reaction para móviles */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black tracking-wider uppercase text-indigo-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Desafío de Traducción & Fonética</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentQuestion.instruction}
            </h2>
          </div>

          <div className="sm:hidden flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            <span>{avatarMood === "happy" ? "🎉" : avatarMood === "thinking" ? "📖" : "✨"}</span>
          </div>
        </div>

        {/* Tarjeta de la Frase en Inglés + Botón de Audio */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border-2 border-slate-200/80 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                "{currentQuestion.englishPrompt}"
              </p>
              {currentQuestion.pronunciationHint && (
                <p className="text-xs text-slate-400 font-medium italic">
                  {currentQuestion.pronunciationHint}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => speakPrompt(currentQuestion.englishPrompt)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer ${
                isSpeaking
                  ? "bg-indigo-600 text-white scale-105"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:scale-95"
              }`}
              title="Escuchar pronunciación nativa"
            >
              <Volume2 className={`w-6 h-6 ${isSpeaking ? "animate-pulse" : ""}`} />
            </button>
          </div>

          {/* Desafío de Pronunciación Oral Interactivo */}
          <div className="pt-2 border-t border-slate-200/70 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleSpeechChallenge}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                  isRecording
                    ? "bg-rose-500 text-white animate-pulse"
                    : overallSpeechAccuracy !== null && overallSpeechAccuracy >= 70
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs"
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 animate-bounce" />
                    <span>Grabando... ¡Lee en voz alta!</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      {overallSpeechAccuracy !== null
                        ? `Precisión oral: ${overallSpeechAccuracy}% (Repetir)`
                        : "Practicar pronunciación oral (+10 XP)"}
                    </span>
                  </>
                )}
              </button>

              {overallSpeechAccuracy !== null && (
                <span className={`text-xs font-black ${
                  overallSpeechAccuracy >= 70 ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {overallSpeechAccuracy >= 70 ? "¡Excelente! +10 XP" : "Sigue practicando"}
                </span>
              )}
            </div>

            {/* Desglose de Palabras Evaluadas */}
            {speechScores && speechScores.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-white border border-slate-200/80 animate-in fade-in">
                {speechScores.map((item, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                      item.score >= 70
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : item.score >= 40
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {item.word} ({item.score}%)
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Opciones de Respuesta */}
        <div className="flex flex-col gap-3 pt-1">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const isChecked = checkStatus !== "idle";

            // Colores condicionales tras comprobar
            let cardStyle = "bg-white border-2 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50";

            if (isSelected && !isChecked) {
              cardStyle = "bg-indigo-50/70 border-2 border-indigo-600 text-indigo-950 shadow-md shadow-indigo-600/10";
            } else if (isChecked) {
              if (option.isCorrect) {
                cardStyle = "bg-emerald-50 border-2 border-emerald-500 text-emerald-950";
              } else if (isSelected && !option.isCorrect) {
                cardStyle = "bg-rose-50 border-2 border-rose-500 text-rose-950";
              } else {
                cardStyle = "bg-white border-2 border-slate-200 text-slate-400 opacity-60";
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(option.id)}
                disabled={isChecked}
                className={`w-full p-4 sm:p-5 rounded-2xl text-left font-semibold text-sm sm:text-base transition-all duration-150 flex items-center gap-3.5 cursor-pointer select-none active:scale-[0.99] ${cardStyle}`}
              >
                {/* Número / Badge de Opción */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border ${
                    isSelected && !isChecked
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : isChecked && option.isCorrect
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : isChecked && isSelected && !option.isCorrect
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {idx + 1}
                </div>

                <span className="flex-1 leading-snug">{option.text}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* 3. LA BARRA INFERIOR DINÁMICA (FEEDBACK BOTTOM SHEET) */}
      <footer
        className={`w-full p-4 sm:p-6 transition-all duration-300 z-40 border-t ${
          checkStatus === "correct"
            ? "bg-emerald-100 border-emerald-400 text-emerald-950"
            : checkStatus === "incorrect"
            ? "bg-rose-100 border-rose-400 text-rose-950"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Mensaje de Feedback */}
          <div className="w-full sm:w-auto flex items-center gap-3">
            {checkStatus === "correct" && (
              <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-emerald-900">
                    ¡Excelente!
                  </h4>
                  <p className="text-xs text-emerald-700 font-medium">
                    {currentQuestion.explanation || "Respuesta 100% correcta."}
                  </p>
                </div>
              </div>
            )}

            {checkStatus === "incorrect" && (
              <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200">
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-rose-900">
                    Respuesta correcta:
                  </h4>
                  <p className="text-xs text-rose-800 font-semibold">
                    {correctOption?.text}
                  </p>
                  <p className="text-[11px] text-rose-700/90 font-medium flex items-center gap-1 mt-0.5">
                    <BookOpen className="w-3 h-3" />
                    <span>Guardado en Cuaderno de Repaso para practicar</span>
                  </p>
                </div>
              </div>
            )}

            {checkStatus === "idle" && (
              <div className="hidden sm:block text-xs font-semibold text-slate-400">
                Selecciona una opción para continuar
              </div>
            )}
          </div>

          {/* Botón de Acción Principal */}
          <div className="w-full sm:w-48">
            {checkStatus === "idle" ? (
              <button
                type="button"
                onClick={handleCheck}
                disabled={!selectedOptionId}
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                  selectedOptionId
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 active:scale-98"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Comprobar
              </button>
            ) : checkStatus === "correct" ? (
              <button
                type="button"
                onClick={handleContinue}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide uppercase shadow-lg shadow-emerald-600/30 active:scale-98 transition cursor-pointer"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinue}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm tracking-wide uppercase shadow-lg shadow-rose-600/30 active:scale-98 transition cursor-pointer"
              >
                Entendido
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                ¿Abandonar lección?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Perderás el progreso actual de este paso. Podrás retomarlo en cualquier momento.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition cursor-pointer"
              >
                Continuar Aprendiendo
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
              >
                Salir de todas formas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
