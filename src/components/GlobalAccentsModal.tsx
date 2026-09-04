import React, { useState } from "react";
import {
  X,
  Volume2,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Award,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  GLOBAL_ACCENTS_DATA,
  GlobalAccentTrack,
  AccentExercise,
} from "../data/globalAccentsData";
import { speakEnglish, stopSpeech } from "../utils/speech";
import { playPopSound, playCoinSound } from "../utils/audioSynth";

interface GlobalAccentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXp?: (xp: number) => void;
}

export const GlobalAccentsModal: React.FC<GlobalAccentsModalProps> = ({
  isOpen,
  onClose,
  onRewardXp,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<GlobalAccentTrack>(
    GLOBAL_ACCENTS_DATA[0]
  );
  const [activeTab, setActiveTab] = useState<"exercises" | "jargon" | "phonetics">(
    "exercises"
  );
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const currentExercise: AccentExercise =
    selectedTrack.exercises[currentExerciseIndex] || selectedTrack.exercises[0];

  const handlePlayAudio = (text: string, rate: number = 1.0) => {
    stopSpeech();
    setIsPlayingAudio(true);
    playPopSound();
    speakEnglish(text, {
      lang: selectedTrack.speechLang,
      gender: selectedTrack.preferredGender,
      rate,
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleSelectOption = (optionId: string) => {
    if (hasSubmitted) return;
    setSelectedOptionId(optionId);
    playPopSound();
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || hasSubmitted) return;
    setHasSubmitted(true);

    const chosen = currentExercise.options.find((o) => o.id === selectedOptionId);
    if (chosen?.isCorrect) {
      playCoinSound();
      if (!completedExercises[currentExercise.id]) {
        setCompletedExercises((prev) => ({ ...prev, [currentExercise.id]: true }));
        onRewardXp?.(20);
      }
    }
  };

  const handleNextExercise = () => {
    stopSpeech();
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setShowTranscript(false);
    if (currentExerciseIndex < selectedTrack.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      setCurrentExerciseIndex(0);
    }
  };

  const selectedOption = currentExercise.options.find(
    (o) => o.id === selectedOptionId
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors">
        {/* Header con gradiente elegante */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-blue-600 via-indigo-600 to-sky-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  Gimnasio de Acentos Globales
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 uppercase">
                  Global Pro
                </span>
              </div>
              <p className="text-xs text-blue-100/90">
                Entrena tu oído para entender colegas y clientes de todo el mundo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Acentos (Píldoras) */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {GLOBAL_ACCENTS_DATA.map((track) => {
            const isSelected = track.id === selectedTrack.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  stopSpeech();
                  setSelectedTrack(track);
                  setCurrentExerciseIndex(0);
                  setSelectedOptionId(null);
                  setHasSubmitted(false);
                  setShowTranscript(false);
                  playPopSound();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{track.flag}</span>
                <span>{track.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Pestañas de Vista */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("exercises")}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "exercises"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Reto de Audio ({selectedTrack.exercises.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("jargon")}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "jargon"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Jerga Regional ({selectedTrack.jargon.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("phonetics")}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "phonetics"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guía Fonética</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: EJERCICIOS AUDITIVOS */}
          {activeTab === "exercises" && (
            <div className="space-y-4">
              {/* Tarjeta del Hablante y Situación */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedTrack.flag}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {currentExercise.speakerRole}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold">
                      Ejercicio {currentExerciseIndex + 1} de {selectedTrack.exercises.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {currentExercise.situation}
                  </p>
                </div>

                {/* Controles de Reproducción de Voz */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(currentExercise.audioText, 1.0)}
                    disabled={isPlayingAudio}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse" : ""}`} />
                    <span>{isPlayingAudio ? "Reproduciendo..." : "Escuchar (1.0x)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlayAudio(currentExercise.audioText, 0.8)}
                    disabled={isPlayingAudio}
                    className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                    title="Reproducción más lenta"
                  >
                    0.8x
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTranscript((prev) => !prev)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title={showTranscript ? "Ocultar texto" : "Mostrar texto"}
                  >
                    {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Transcripción Opcional */}
              {showTranscript && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 italic animate-fadeIn">
                  "{currentExercise.audioText}"
                </div>
              )}

              {/* Pregunta de Comprensión */}
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>{currentExercise.question}</span>
                </h3>

                <div className="space-y-2">
                  {currentExercise.options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    let optionStyle =
                      "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750";

                    if (hasSubmitted) {
                      if (option.isCorrect) {
                        optionStyle =
                          "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold";
                      } else if (isSelected && !option.isCorrect) {
                        optionStyle =
                          "border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200";
                      }
                    } else if (isSelected) {
                      optionStyle =
                        "border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 font-bold";
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(option.id)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition cursor-pointer flex items-start gap-2.5 ${optionStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                          {option.id.toUpperCase()}
                        </span>
                        <span className="flex-1">{option.text}</span>
                        {hasSubmitted && option.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                        {hasSubmitted && isSelected && !option.isCorrect && (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback y Explicación */}
              {hasSubmitted && selectedOption && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1.5 animate-fadeIn ${
                    selectedOption.isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    {selectedOption.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>¡Respuesta Correcta! (+20 XP)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Respuesta Incorrecta</span>
                      </>
                    )}
                  </div>
                  <p>{selectedOption.explanation}</p>
                  <div className="pt-2 border-t border-current/10 text-[11px] opacity-90">
                    <strong>💡 Tip Cultural:</strong> {currentExercise.culturalTip}
                  </div>
                </div>
              )}

              {/* Botón de Acción Inferior */}
              <div className="flex justify-end gap-2 pt-2">
                {!hasSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOptionId}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    Confirmar Respuesta
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextExercise}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <span>Siguiente Ejercicio</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: JERGA REGIONAL */}
          {activeTab === "jargon" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Expresiones de negocios y modismos de uso diario con el acento de{" "}
                <strong>{selectedTrack.name}</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTrack.jargon.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-blue-400 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {item.term}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(item.example, 0.95)}
                        className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition cursor-pointer"
                        title="Escuchar ejemplo en este acento"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        Equivalente:
                      </span>{" "}
                      {item.equivalent}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.meaning}
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] italic text-slate-700 dark:text-slate-300">
                      "{item.example}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GUÍA FONÉTICA Y DE ENTONACIÓN */}
          {activeTab === "phonetics" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <h4 className="text-xs font-black uppercase text-indigo-900 dark:text-indigo-300 tracking-wider">
                  Claves de Pronunciación: {selectedTrack.name}
                </h4>
                <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
                  {selectedTrack.phoneticTip}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Rasgos Distintivos del Acento:
                </h5>
                <ul className="space-y-2">
                  {selectedTrack.keyFeatures.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Ejercicios superados: {Object.keys(completedExercises).length}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
