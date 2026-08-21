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
} from "lucide-react";
import { VocabularyItem } from "../types";

interface VocabularyNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: VocabularyItem[];
  onDeleteItem: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onSpeakWord: (word: string) => void;
}

export const VocabularyNotebookModal: React.FC<VocabularyNotebookModalProps> = ({
  isOpen,
  onClose,
  items,
  onDeleteItem,
  onToggleMastered,
  onSpeakWord,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "flashcard">("list");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  const currentCard = items[currentCardIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#161b22] border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1117]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Libreta de Vocabulario ({items.length})
              </h3>
              <p className="text-xs text-slate-400">
                Palabras guardadas durante tus sesiones con el Tutor VT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow"
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
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  viewMode === "flashcard"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white disabled:opacity-40"
                }`}
              >
                Flashcards
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[65vh]">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-slate-300">
                Tu libreta está vacía por ahora
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Haz clic en cualquier palabra del diálogo del tutor para guardarla y revisarla después.
              </p>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                    item.mastered
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-100"
                      : "bg-[#0d1117] border-slate-700/80 text-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleMastered(item.id)}
                      className="mt-0.5 text-slate-500 hover:text-emerald-400 transition"
                      title={item.mastered ? "Marcar como pendiente" : "Marcar como dominada"}
                    >
                      {item.mastered ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{item.word}</span>
                        {item.ipa && (
                          <span className="text-xs text-blue-400 font-mono">{item.ipa}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{item.meaning}</p>
                      {item.example && (
                        <p className="text-[11px] text-slate-400 italic mt-1">"{item.example}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onSpeakWord(item.word)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition"
                      title="Escuchar audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 transition"
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
              <div className="text-xs text-slate-400 mb-3 font-medium">
                Tarjeta {currentCardIndex + 1} de {items.length}
              </div>

              {currentCard && (
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full max-w-md h-64 p-6 rounded-2xl bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-blue-500/40 shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-blue-400 relative"
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Girar</span>
                  </div>

                  {!isFlipped ? (
                    <div className="space-y-3">
                      <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">
                        Inglés
                      </span>
                      <h3 className="text-3xl font-extrabold text-white">{currentCard.word}</h3>
                      {currentCard.ipa && (
                        <p className="text-sm font-mono text-slate-400">{currentCard.ipa}</p>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSpeakWord(currentCard.word);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/30 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Escuchar</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                        Significado & Contexto
                      </span>
                      <p className="text-lg font-bold text-slate-100">{currentCard.meaning}</p>
                      {currentCard.example && (
                        <p className="text-xs text-slate-400 italic max-w-xs">
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
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => onToggleMastered(currentCard.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    currentCard?.mastered
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
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
