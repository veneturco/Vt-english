import React, { useState } from "react";
import {
  Volume2,
  Languages,
  Sparkles,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  BookmarkPlus,
  Play,
  RotateCcw,
  Headphones,
  Mic,
  Smile,
  Zap,
  Activity,
} from "lucide-react";
import { ChatMessage, VocabularyItem } from "../types";
import { WordPopup } from "./WordPopup";
import { useMicVolume } from "../utils/useMicVolume";

interface DialogueBubbleProps {
  currentMessage: ChatMessage | null;
  isPlayingAudio: boolean;
  onRepeatAudio: (slow?: boolean, customText?: string, forceLang?: string) => void;
  onSaveVocabulary: (item: Omit<VocabularyItem, "id" | "dateAdded">) => void;
  onSpeakWord: (word: string) => void;
  onPracticePhrase?: (phrase: string) => void;
  onOpenPhoneticLab?: (tab?: "articulation" | "stress" | "minimal_pairs" | "linking") => void;
  teacherName?: string;
  teacherRole?: string;
  avatarEmoji?: string;
  avatarBadge?: string;
  isLoading?: boolean;
  micVolume?: number;
}

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({
  currentMessage,
  isPlayingAudio,
  onRepeatAudio,
  onSaveVocabulary,
  onSpeakWord,
  onPracticePhrase,
  onOpenPhoneticLab,
  teacherName = "Prof. Sarah Miller",
  teacherRole = "Profesora Bilingüe",
  avatarEmoji = "🐦",
  avatarBadge,
  isLoading = false,
  micVolume: propMicVolume,
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    pos: { x: number; y: number };
  } | null>(null);

  // Fallback to local mic volume tracker if prop is not provided
  const { volume: localMicVolume } = useMicVolume(true);
  const activeMicVolume = propMicVolume !== undefined ? propMicVolume : localMicVolume;

  // Dynamic Glassmorphism computations based on ambient noise / mic volume
  // Background alpha shifts dynamically between 0.78 (quiet) and 0.95 (active speech/noise)
  const dynamicAlpha = 0.78 + activeMicVolume * 0.18;
  // Backdrop blur intensity shifts between 12px and 30px based on ambient microphone level
  const dynamicBlur = 12 + activeMicVolume * 18;
  // Dynamic border glow ring alpha
  const borderAlpha = 0.4 + activeMicVolume * 0.5;

  if (isLoading) {
    return (
      <div
        className="w-full max-w-2xl mx-auto p-4 sm:p-5 rounded-3xl border-2 border-b-4 shadow-xl transition-all duration-300 text-slate-200 animate-pulse"
        style={{
          backgroundColor: `rgba(15, 23, 42, ${dynamicAlpha})`,
          backdropFilter: `blur(${dynamicBlur}px)`,
          WebkitBackdropFilter: `blur(${dynamicBlur}px)`,
          borderColor: `rgba(51, 65, 85, ${borderAlpha})`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <p className="text-sm sm:text-base text-emerald-300 font-bold">
            {teacherName} está preparando tu explicación y reto pedagógico...
          </p>
        </div>
      </div>
    );
  }

  if (!currentMessage) return null;

  const words = currentMessage.text.split(" ");
  const correction = currentMessage.correction;
  const hasCorrection = correction && correction.hasError;

  const handleWordClick = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectedWord({
      word,
      pos: { x: rect.left, y: rect.top },
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3 relative">
      {/* Word Popup Modal */}
      {selectedWord && (
        <WordPopup
          word={selectedWord.word}
          position={selectedWord.pos}
          onClose={() => setSelectedWord(null)}
          onSaveToNotebook={onSaveVocabulary}
          onSpeakWord={onSpeakWord}
        />
      )}

      {/* Main Dialogue Card with Dynamic Glassmorphism (Adjusts transparency and blur based on ambient mic volume) */}
      <div
        id="tutor-dialogue-card"
        className="w-full p-4 sm:p-6 rounded-3xl border-2 border-b-4 shadow-xl transition-all duration-200 relative overflow-hidden"
        style={{
          backgroundColor: `rgba(15, 23, 42, ${dynamicAlpha})`,
          backdropFilter: `blur(${dynamicBlur}px)`,
          WebkitBackdropFilter: `blur(${dynamicBlur}px)`,
          borderColor: `rgba(51, 65, 85, ${borderAlpha})`,
          boxShadow: activeMicVolume > 0.03
            ? `0 12px 30px -8px rgba(56, 189, 248, ${activeMicVolume * 0.3}), 0 0 20px rgba(245, 158, 11, ${activeMicVolume * 0.22})`
            : "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Ambient acoustic glassmorphism reflection sheen */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 80% 20%, rgba(56, 189, 248, ${activeMicVolume * 0.18}), transparent 60%)`,
          }}
        />

        {/* Header line of Teacher */}
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b-2 border-slate-800 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-base">{avatarEmoji}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                {teacherName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-xl bg-slate-800 border-2 border-slate-700 text-slate-300 font-bold">
                {teacherRole}
              </span>
              {avatarBadge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-xl bg-amber-500/20 text-amber-300 font-black border-2 border-amber-500/40">
                  {avatarBadge}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            {/* Ambient Noise / Mic Glassmorphism Level indicator pill */}
            <div
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[10px] font-black border transition-all duration-300"
              style={{
                backgroundColor: activeMicVolume > 0.02 ? "rgba(14, 165, 233, 0.2)" : "rgba(30, 41, 59, 0.8)",
                borderColor: activeMicVolume > 0.02 ? "rgba(56, 189, 248, 0.5)" : "rgba(51, 65, 85, 0.8)",
                color: activeMicVolume > 0.02 ? "#38bdf8" : "#94a3b8",
              }}
              title="Glassmorphism acústico reactivo al ruido ambiente"
            >
              <Activity className="w-3 h-3 animate-pulse" />
              <span>Mic: {Math.round(activeMicVolume * 100)}%</span>
            </div>

            <span className="text-[10px] px-2.5 py-0.5 rounded-xl bg-slate-800 text-slate-300 font-bold border-2 border-slate-700 hidden sm:inline-block">
              Toca palabras para traducir
            </span>
          </div>
        </div>

        {/* 🎯 Target English Practice Phrase (Flat gamified card) */}
        {currentMessage.targetEnglishPhrase && (
          <div className="mb-4 p-4 rounded-2xl bg-slate-950 border-2 border-b-4 border-amber-500/50 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Frase Clave a Dominar:</span>
              </span>
              
              <div className="flex items-center gap-1.5">
                {/* Play target phrase */}
                <button
                  onClick={() => onRepeatAudio(false, currentMessage.targetEnglishPhrase, "en-US")}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 border-2 border-b-4 border-slate-700 active:border-b-2 active:translate-y-0.5 transition shadow-sm"
                  title="Escuchar pronunciación nativa"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Escuchar</span>
                </button>

                {/* Slow audio 0.75x */}
                <button
                  onClick={() => onRepeatAudio(true, currentMessage.targetEnglishPhrase, "en-US")}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border-2 border-b-4 border-slate-700 active:border-b-2 active:translate-y-0.5 transition"
                  title="Escuchar lento (0.75x)"
                >
                  <span>🐢 0.75x</span>
                </button>

                {/* Practice this phrase button */}
                {onPracticePhrase && (
                  <button
                    onClick={() => onPracticePhrase(currentMessage.targetEnglishPhrase || "")}
                    className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 border-2 border-b-4 border-emerald-700 active:border-b-2 active:translate-y-0.5 transition shadow-sm"
                    title="Cargar esta frase para practicar hablarla tú"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Practicar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Target English Phrase Text */}
            <p className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              "{currentMessage.targetEnglishPhrase}"
            </p>

            {/* Phonetic guide for Spanish speakers */}
            {currentMessage.phoneticGuide && (
              <div className="mt-2.5 text-xs text-sky-200 font-mono bg-slate-900 px-3 py-2 rounded-xl border-2 border-sky-500/30 flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-sky-400 font-sans uppercase">Fonética:</span>
                  <span>{currentMessage.phoneticGuide}</span>
                </div>
                {onOpenPhoneticLab && (
                  <button
                    onClick={() => onOpenPhoneticLab("articulation")}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-sans font-bold border-2 border-b-2 border-sky-500/40 flex items-center gap-1 transition"
                    title="Ver rayos X de posición de lengua y boca"
                  >
                    <span>🔬 Ver Boca 2.5D</span>
                  </button>
                )}
              </div>
            )}

            {/* Native Linking Trick */}
            {currentMessage.nativeLinkingTrick && (
              <div className="mt-2 text-xs text-amber-200 flex items-center justify-between gap-1.5 flex-wrap bg-slate-900 px-3 py-2 rounded-xl border-2 border-amber-500/30">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    <strong className="text-amber-300">Truco nativo: </strong>
                    {currentMessage.nativeLinkingTrick}
                  </span>
                </div>
                {onOpenPhoneticLab && (
                  <button
                    onClick={() => onOpenPhoneticLab("linking")}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border-2 border-b-2 border-amber-500/40 flex items-center gap-1 transition"
                    title="Ver animación de unión de palabras"
                  >
                    <span>🌉 Linking Bridge</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* English Speech Text (Clickable Words) */}
        <div className="text-base sm:text-lg leading-relaxed text-slate-100 font-bold">
          {words.map((word, index) => (
            <span
              key={index}
              onClick={(e) => handleWordClick(e, word)}
              className="inline-block hover:text-amber-300 hover:bg-slate-800 px-1 py-0.5 rounded-lg cursor-pointer transition-colors duration-150 active:scale-95"
            >
              {word}{" "}
            </span>
          ))}
        </div>

        {/* Teacher Warm Commentary in Spanish/Bilingual */}
        {currentMessage.teacherCommentary && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-950 border-2 border-slate-800 text-sm text-slate-300 leading-relaxed flex items-start gap-2.5">
            <Smile className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 text-xs block mb-0.5">
                Guía Pedagógica:
              </span>
              <p className="font-medium">{currentMessage.teacherCommentary}</p>
            </div>
          </div>
        )}

        {/* Spanish Translation (Accordion / Toggle) */}
        {showTranslation && currentMessage.spanishTranslation && (
          <div className="mt-3.5 pt-3 border-t-2 border-slate-800 text-sm sm:text-base text-slate-300 italic bg-slate-950 p-3.5 rounded-2xl border-2 border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 not-italic mb-1">
              <Languages className="w-3.5 h-3.5" />
              <span>Traducción en Español:</span>
            </div>
            <p>{currentMessage.spanishTranslation}</p>
          </div>
        )}

        {/* Pedagogical Tip or Cultural Highlight */}
        {showTip && currentMessage.pedagogicalTip && (
          <div className="mt-3 text-xs sm:text-sm text-indigo-200 bg-slate-950 p-3.5 rounded-2xl border-2 border-indigo-500/40 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-300 block mb-0.5">Consejo Pedagógico:</span>
              <p>{currentMessage.pedagogicalTip}</p>
            </div>
          </div>
        )}

        {/* Key Vocabulary Highlight Chips */}
        {currentMessage.vocabularyNotes && currentMessage.vocabularyNotes.length > 0 && (
          <div className="mt-3.5 pt-3 border-t-2 border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Vocabulario Clave:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentMessage.vocabularyNotes.map((vocab, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border-2 border-slate-800 text-xs text-slate-200"
                >
                  <span className="font-extrabold text-amber-400">{vocab.word}</span>
                  {vocab.phoneticSpanish ? (
                    <span className="text-[11px] text-sky-300 font-mono">({vocab.phoneticSpanish})</span>
                  ) : (
                    vocab.ipa && <span className="text-[11px] text-slate-400 font-mono">{vocab.ipa}</span>
                  )}
                  <span className="text-slate-300">— {vocab.meaning}</span>
                  <button
                    onClick={() => onSpeakWord(vocab.word)}
                    className="p-1 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition ml-0.5"
                    title="Escuchar pronunciación"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      onSaveVocabulary({
                        word: vocab.word,
                        ipa: vocab.ipa,
                        phoneticSpanish: vocab.phoneticSpanish,
                        meaning: vocab.meaning,
                        example: vocab.example,
                      })
                    }
                    className="p-1 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition"
                    title="Guardar en libreta de vocabulario"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls Bar (Flat 3D buttons) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3.5 border-t-2 border-slate-800">
          <div className="flex items-center gap-2">
            {/* Repeat Full Audio */}
            <button
              onClick={() => onRepeatAudio(false)}
              disabled={isPlayingAudio}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all ${
                isPlayingAudio
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm"
              }`}
            >
              <Volume2 className={`w-4 h-4 text-amber-400 ${isPlayingAudio ? "animate-bounce" : ""}`} />
              <span>{isPlayingAudio ? "Reproduciendo..." : "Escuchar Todo"}</span>
            </button>

            {/* Slow Audio 0.75x */}
            <button
              onClick={() => onRepeatAudio(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border-2 border-b-4 border-slate-700 active:border-b-2 active:translate-y-0.5 transition"
              title="Escuchar respuesta completa más lenta (0.75x)"
            >
              <span>🐢 0.75x</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Translate Button */}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all ${
                showTranslation
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>{showTranslation ? "Ocultar Español" : "Ver en Español"}</span>
            </button>

            {/* Tip Toggle */}
            {currentMessage.pedagogicalTip && (
              <button
                onClick={() => setShowTip(!showTip)}
                className={`p-2 rounded-2xl text-xs font-bold border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all ${
                  showTip
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
                title="Consejo pedagógico"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grammar / Pronunciation Correction Alert Box (If user had a mistake or polish opportunity) */}
      {hasCorrection && (
        <div
          id="grammar-feedback-box"
          className="w-full p-4 sm:p-5 rounded-3xl bg-slate-900 border-2 border-b-4 border-amber-500 text-amber-100 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-amber-300">
                  Retroalimentación Pedagógica de {teacherName}:
                </h4>
                {correction.praise && (
                  <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-300 font-black">
                    {correction.praise}
                  </span>
                )}
              </div>

              {correction.originalSentence && (
                <div className="mb-2 text-slate-300">
                  <span className="text-amber-400 font-bold block mb-1">Evaluación de Fonemas y Pronunciación:</span>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950 border-2 border-slate-800">
                    {correction.originalSentence.split(" ").map((w, idx) => {
                      const cleanWord = w.replace(/[.,?!]/g, "").toLowerCase();
                      const isCorrected = correction.correctedSentence?.toLowerCase().includes(cleanWord);
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-transform active:scale-95 border ${
                            isCorrected
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border-rose-500/40 line-through"
                          }`}
                          title={isCorrected ? "Pronunciación correcta (≥85%)" : "Palabra o estructura a mejorar"}
                        >
                          {w}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {correction.correctedSentence && (
                <div className="mb-2 text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong className="text-emerald-400">Forma recomendada: </strong>
                    "{correction.correctedSentence}"
                  </span>
                </div>
              )}

              {correction.explanation && (
                <p className="text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-2xl border-2 border-slate-800 mb-2 font-medium">
                  {correction.explanation}
                </p>
              )}

              {correction.nativeAlternative && (
                <div className="text-xs text-sky-300 bg-slate-950 p-2.5 rounded-2xl border-2 border-sky-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    <strong className="text-sky-300">Como lo diría un nativo: </strong>
                    "{correction.nativeAlternative}"
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

