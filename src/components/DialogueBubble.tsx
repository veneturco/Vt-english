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
} from "lucide-react";
import { ChatMessage, VocabularyItem } from "../types";
import { WordPopup } from "./WordPopup";

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
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    pos: { x: number; y: number };
  } | null>(null);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-[#161b22]/90 backdrop-blur-xl border border-blue-500/30 shadow-xl shadow-blue-950/40 text-slate-200 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
          <p className="text-sm sm:text-base text-blue-300 font-medium">
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

      {/* Main Dialogue Card */}
      <div
        id="tutor-dialogue-card"
        className="w-full p-4 sm:p-6 rounded-[28px] bg-[#121722]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300"
      >
        {/* Header line of Teacher */}
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-base">{avatarEmoji}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                {teacherName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 font-semibold">
                {teacherRole}
              </span>
              {avatarBadge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                  {avatarBadge}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-medium">
              Toca palabras para traducir
            </span>
          </div>
        </div>

        {/* 🎯 Target English Practice Phrase (Apple / Elsa style focus card) */}
        {currentMessage.targetEnglishPhrase && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/[0.07] via-slate-900/60 to-slate-950/80 border border-amber-500/25 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Frase Clave a Dominar:</span>
              </span>
              
              <div className="flex items-center gap-1.5">
                {/* Play target phrase */}
                <button
                  onClick={() => onRepeatAudio(false, currentMessage.targetEnglishPhrase, "en-US")}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition active:scale-95 shadow-sm"
                  title="Escuchar pronunciación nativa"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Escuchar</span>
                </button>

                {/* Slow audio 0.75x */}
                <button
                  onClick={() => onRepeatAudio(true, currentMessage.targetEnglishPhrase, "en-US")}
                  className="px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-medium transition active:scale-95 border border-slate-700/60"
                  title="Escuchar lento (0.75x)"
                >
                  <span>🐢 0.75x</span>
                </button>

                {/* Practice this phrase button */}
                {onPracticePhrase && (
                  <button
                    onClick={() => onPracticePhrase(currentMessage.targetEnglishPhrase || "")}
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1 transition active:scale-95 shadow-sm"
                    title="Cargar esta frase para practicar hablarla tú"
                  >
                    <Mic className="w-3 h-3" />
                    <span>Practicar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Target English Phrase Text */}
            <p className="text-base sm:text-lg font-bold text-white tracking-tight">
              "{currentMessage.targetEnglishPhrase}"
            </p>

            {/* Phonetic guide for Spanish speakers */}
            {currentMessage.phoneticGuide && (
              <div className="mt-2.5 text-xs text-sky-200/90 font-mono bg-sky-950/30 px-3 py-1.5 rounded-xl border border-sky-500/20 flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-sky-400 font-sans uppercase">Fonética:</span>
                  <span>{currentMessage.phoneticGuide}</span>
                </div>
                {onOpenPhoneticLab && (
                  <button
                    onClick={() => onOpenPhoneticLab("articulation")}
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-sans font-bold flex items-center gap-1 transition"
                    title="Ver rayos X de posición de lengua y boca"
                  >
                    <span>🔬 Ver Boca 2.5D</span>
                  </button>
                )}
              </div>
            )}

            {/* Native Linking Trick */}
            {currentMessage.nativeLinkingTrick && (
              <div className="mt-2 text-xs text-amber-300/90 flex items-center justify-between gap-1.5 flex-wrap bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    <strong>Truco nativo: </strong>
                    {currentMessage.nativeLinkingTrick}
                  </span>
                </div>
                {onOpenPhoneticLab && (
                  <button
                    onClick={() => onOpenPhoneticLab("linking")}
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center gap-1 transition"
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
        <div className="text-base sm:text-lg leading-relaxed text-slate-100 font-medium">
          {words.map((word, index) => (
            <span
              key={index}
              onClick={(e) => handleWordClick(e, word)}
              className="inline-block hover:text-amber-300 hover:bg-amber-500/15 px-1 py-0.5 rounded-md cursor-pointer transition-colors duration-150 active:scale-95"
            >
              {word}{" "}
            </span>
          ))}
        </div>

        {/* Teacher Warm Commentary in Spanish/Bilingual */}
        {currentMessage.teacherCommentary && (
          <div className="mt-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm text-slate-300 leading-relaxed flex items-start gap-2.5">
            <Smile className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 text-xs block mb-0.5">
                Guía Pedagógica:
              </span>
              <p>{currentMessage.teacherCommentary}</p>
            </div>
          </div>
        )}

        {/* Spanish Translation (Accordion / Toggle) */}
        {showTranslation && currentMessage.spanishTranslation && (
          <div className="mt-3.5 pt-3 border-t border-white/[0.06] text-sm sm:text-base text-slate-300 italic bg-black/20 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 not-italic mb-1">
              <Languages className="w-3.5 h-3.5" />
              <span>Traducción en Español:</span>
            </div>
            <p>{currentMessage.spanishTranslation}</p>
          </div>
        )}

        {/* Pedagogical Tip or Cultural Highlight */}
        {showTip && currentMessage.pedagogicalTip && (
          <div className="mt-3 text-xs sm:text-sm text-indigo-200 bg-indigo-950/30 p-3 rounded-2xl border border-indigo-500/30 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-300 block mb-0.5">Consejo Pedagógico:</span>
              <p>{currentMessage.pedagogicalTip}</p>
            </div>
          </div>
        )}

        {/* Key Vocabulary Highlight Chips */}
        {currentMessage.vocabularyNotes && currentMessage.vocabularyNotes.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-white/[0.06]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Vocabulario Clave:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentMessage.vocabularyNotes.map((vocab, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-200"
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
                    className="p-1 hover:text-amber-300 hover:bg-white/10 rounded-full transition ml-0.5"
                    title="Escuchar pronunciación"
                  >
                    <Volume2 className="w-3 h-3" />
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
                    className="p-1 hover:text-amber-300 hover:bg-white/10 rounded-full transition"
                    title="Guardar en libreta de vocabulario"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls Bar (Sleek Apple pill bar) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            {/* Repeat Full Audio */}
            <button
              onClick={() => onRepeatAudio(false)}
              disabled={isPlayingAudio}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition active:scale-95 ${
                isPlayingAudio
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                  : "bg-white/10 hover:bg-white/20 text-white shadow-sm"
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 text-amber-400 ${isPlayingAudio ? "animate-bounce" : ""}`} />
              <span>{isPlayingAudio ? "Reproduciendo..." : "Escuchar Todo"}</span>
            </button>

            {/* Slow Audio 0.75x */}
            <button
              onClick={() => onRepeatAudio(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-medium transition active:scale-95 border border-white/10"
              title="Escuchar respuesta completa más lenta (0.75x)"
            >
              <span>🐢 0.75x</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Translate Button */}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition active:scale-95 border ${
                showTranslation
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-white/10"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{showTranslation ? "Ocultar Español" : "Ver en Español"}</span>
            </button>

            {/* Tip Toggle */}
            {currentMessage.pedagogicalTip && (
              <button
                onClick={() => setShowTip(!showTip)}
                className={`p-2 rounded-full text-xs transition border ${
                  showTip
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-white/10"
                }`}
                title="Consejo pedagógico"
              >
                <Lightbulb className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grammar / Pronunciation Correction Alert Box (If user had a mistake or polish opportunity) */}
      {hasCorrection && (
        <div
          id="grammar-feedback-box"
          className="w-full p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-100 shadow-xl backdrop-blur-md animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-amber-300">
                  Retroalimentación Pedagógica de {teacherName}:
                </h4>
                {correction.praise && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium">
                    {correction.praise}
                  </span>
                )}
              </div>

              {correction.originalSentence && (
                <div className="mb-1 text-slate-300">
                  <span className="text-amber-400 font-semibold">Dijiste: </span>
                  <span className="line-through text-rose-300">{correction.originalSentence}</span>
                </div>
              )}

              {correction.correctedSentence && (
                <div className="mb-2 text-emerald-300 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    <strong className="text-emerald-400">Forma recomendada: </strong>
                    "{correction.correctedSentence}"
                  </span>
                </div>
              )}

              {correction.explanation && (
                <p className="text-slate-200 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-amber-500/20 mb-2">
                  {correction.explanation}
                </p>
              )}

              {correction.nativeAlternative && (
                <div className="text-xs text-sky-300 bg-sky-950/30 p-2 rounded-lg border border-sky-500/20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>
                    <strong>Como lo diría un nativo: </strong>
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

