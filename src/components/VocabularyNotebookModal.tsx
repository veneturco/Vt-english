import React, { useState } from "react";
import {
  X,
  BookOpen,
  Volume2,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  Layers,
  RotateCw,
  Sun,
  Moon,
} from "lucide-react";
import { VocabularyItem, AppTheme } from "../types";

interface VocabularyNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: VocabularyItem[];
  onDeleteItem: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onSpeakWord: (word: string) => void;
  theme?: AppTheme;
  onToggleTheme?: (theme: AppTheme) => void;
}

export const VocabularyNotebookModal: React.FC<VocabularyNotebookModalProps> = ({
  isOpen,
  onClose,
  items,
  onDeleteItem,
  onToggleMastered,
  onSpeakWord,
  theme = "dark",
  onToggleTheme,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "flashcard">("list");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === "high-contrast-light";
  const currentCard = items[currentCardIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? "bg-slate-50 border-slate-300 text-slate-900 shadow-slate-950/20"
            : "bg-[#161b22] border-slate-700 text-slate-100"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isLight
              ? "bg-white border-slate-200"
              : "bg-[#0d1117]/60 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isLight
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-extrabold ${isLight ? "text-slate-950" : "text-white"}`}>
                  Libreta de Vocabulario ({items.length})
                </h3>
                {isLight && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    Alto Contraste
                  </span>
                )}
              </div>
              <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                Palabras guardadas durante tus sesiones con el Tutor VT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Theme Switcher Button */}
            {onToggleTheme && (
              <button
                onClick={() => onToggleTheme(isLight ? "dark" : "high-contrast-light")}
                className={`p-1.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
                  isLight
                    ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                }`}
                title={isLight ? "Cambiar a Modo Oscuro" : "Cambiar a Alto Contraste (Lectura Óptima)"}
              >
                {isLight ? <Sun className="w-4 h-4 text-amber-700" /> : <Moon className="w-4 h-4 text-indigo-300" />}
                <span className="hidden sm:inline text-[11px]">{isLight ? "Luz" : "Noche"}</span>
              </button>
            )}

            {/* View Mode Pill Selector */}
            <div
              className={`flex items-center p-0.5 rounded-xl border text-xs ${
                isLight ? "bg-slate-200 border-slate-300" : "bg-slate-800 border-slate-700"
              }`}
            >
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  viewMode === "list"
                    ? isLight
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-blue-600 text-white shadow"
                    : isLight
                    ? "text-slate-700 hover:text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => {
                  setViewMode("flashcard");
                  setIsFlipped(false);
                  setCurrentCardIndex(0);
                }}
                disabled={items.length === 0}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  viewMode === "flashcard"
                    ? isLight
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-blue-600 text-white shadow"
                    : isLight
                    ? "text-slate-700 hover:text-slate-950 font-semibold disabled:opacity-40"
                    : "text-slate-400 hover:text-white disabled:opacity-40"
                }`}
              >
                Flashcards
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ${
                isLight
                  ? "text-slate-600 hover:text-slate-950 hover:bg-slate-200"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[65vh]">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className={`w-10 h-10 mx-auto mb-3 ${isLight ? "text-slate-400" : "text-slate-600"}`} />
              <h4 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-slate-300"}`}>
                Tu libreta está vacía por ahora
              </h4>
              <p className={`text-xs max-w-sm mx-auto mt-1 ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                Haz clic en cualquier palabra del diálogo del tutor para guardarla y revisarla después.
              </p>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                    isLight
                      ? item.mastered
                        ? "bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-sm"
                        : "bg-white border-slate-300 hover:border-slate-400 text-slate-900 shadow-sm"
                      : item.mastered
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-100"
                      : "bg-[#0d1117] border-slate-700/80 text-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleMastered(item.id)}
                      className={`mt-0.5 transition ${
                        isLight
                          ? "text-slate-400 hover:text-emerald-700"
                          : "text-slate-500 hover:text-emerald-400"
                      }`}
                      title={item.mastered ? "Marcar como pendiente" : "Marcar como dominada"}
                    >
                      {item.mastered ? (
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            isLight
                              ? "text-emerald-600 fill-emerald-100"
                              : "text-emerald-400 fill-emerald-500/20"
                          }`}
                        />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-extrabold text-base ${isLight ? "text-slate-950" : "text-white"}`}>
                          {item.word}
                        </span>
                        {item.ipa && (
                          <span
                            className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                              isLight
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "text-blue-400 border-transparent"
                            }`}
                          >
                            {item.ipa}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${isLight ? "text-slate-800 font-medium" : "text-slate-300"}`}>
                        {item.meaning}
                      </p>
                      {item.example && (
                        <p
                          className={`text-[11px] italic mt-1 ${
                            isLight
                              ? "text-slate-600 font-medium border-l-2 border-slate-300 pl-2"
                              : "text-slate-400"
                          }`}
                        >
                          "{item.example}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onSpeakWord(item.word)}
                      className={`p-2 rounded-lg transition ${
                        isLight
                          ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                          : "bg-slate-800 hover:bg-slate-700 text-blue-400"
                      }`}
                      title="Escuchar audio nativo"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className={`p-2 rounded-lg transition ${
                        isLight
                          ? "bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 hover:border-rose-300 shadow-sm"
                          : "bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400"
                      }`}
                      title="Eliminar de la libreta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Flashcard Practice Mode */
            <div className="flex flex-col items-center justify-center py-4">
              <div className={`text-xs mb-3 font-bold ${isLight ? "text-slate-700" : "text-slate-400"}`}>
                Tarjeta {currentCardIndex + 1} de {items.length}
              </div>

              {currentCard && (
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`w-full max-w-md h-64 p-6 rounded-2xl border-2 shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative ${
                    isLight
                      ? isFlipped
                        ? "bg-emerald-50 border-emerald-400 shadow-emerald-900/10 hover:border-emerald-500"
                        : "bg-white border-blue-500 shadow-blue-900/10 hover:border-blue-600"
                      : "bg-gradient-to-br from-[#161b22] to-[#0d1117] border-blue-500/40 hover:border-blue-400"
                  }`}
                >
                  <div
                    className={`absolute top-4 right-4 flex items-center gap-1 text-[11px] font-mono font-bold ${
                      isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Girar</span>
                  </div>

                  {!isFlipped ? (
                    <div className="space-y-3">
                      <span
                        className={`text-xs uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isLight
                            ? "bg-blue-100 text-blue-900 border-blue-300"
                            : "text-blue-400 border-transparent"
                        }`}
                      >
                        Inglés
                      </span>
                      <h3 className={`text-3xl font-black ${isLight ? "text-slate-950" : "text-white"}`}>
                        {currentCard.word}
                      </h3>
                      {currentCard.ipa && (
                        <p
                          className={`text-sm font-mono font-bold px-2 py-0.5 rounded border inline-block ${
                            isLight
                              ? "text-blue-800 bg-blue-50 border-blue-200"
                              : "text-slate-400 border-transparent"
                          }`}
                        >
                          {currentCard.ipa}
                        </p>
                      )}
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSpeakWord(currentCard.word);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition shadow-sm ${
                            isLight
                              ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-700"
                              : "bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30"
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Escuchar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <span
                        className={`text-xs uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isLight
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "text-emerald-400 border-transparent"
                        }`}
                      >
                        Significado & Contexto
                      </span>
                      <p className={`text-xl font-extrabold ${isLight ? "text-slate-950" : "text-slate-100"}`}>
                        {currentCard.meaning}
                      </p>
                      {currentCard.example && (
                        <p
                          className={`text-xs italic max-w-xs ${
                            isLight
                              ? "text-slate-700 font-medium border-l-2 border-emerald-500 pl-2"
                              : "text-slate-400"
                          }`}
                        >
                          "{currentCard.example}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Flashcard navigation controls */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                    isLight
                      ? "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent"
                  }`}
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => onToggleMastered(currentCard.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    currentCard?.mastered
                      ? isLight
                        ? "bg-emerald-100 text-emerald-900 border-emerald-400 shadow-sm"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : isLight
                      ? "bg-white text-slate-800 border-slate-300 hover:bg-slate-100 shadow-sm"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {currentCard?.mastered ? "✓ Dominada" : "Marcar Dominada"}
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
