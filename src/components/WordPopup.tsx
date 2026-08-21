import React, { useState } from "react";
import { Volume2, Bookmark, BookmarkCheck, X } from "lucide-react";
import { VocabularyItem } from "../types";

interface WordPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  onSaveToNotebook: (item: Omit<VocabularyItem, "id" | "dateAdded">) => void;
  isSaved?: boolean;
  onSpeakWord: (word: string) => void;
}

export const WordPopup: React.FC<WordPopupProps> = ({
  word,
  position,
  onClose,
  onSaveToNotebook,
  isSaved = false,
  onSpeakWord,
}) => {
  const [saved, setSaved] = useState(isSaved);
  const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "").trim();

  // Instant heuristic translation / dictionary hint
  const handleSave = () => {
    setSaved(true);
    onSaveToNotebook({
      word: cleanWord,
      meaning: `Término en contexto: "${cleanWord}"`,
      example: `Práctica en VT English IA con ${cleanWord}.`,
    });
  };

  return (
    <div
      style={{
        top: Math.max(10, position.y - 120),
        left: Math.max(10, Math.min(window.innerWidth - 260, position.x - 110)),
      }}
      className="fixed z-50 w-64 p-3.5 rounded-xl bg-[#161b22] border border-blue-500/40 shadow-2xl shadow-blue-950/60 text-slate-100 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <h4 className="text-base font-bold text-white capitalize">{cleanWord}</h4>
          <span className="text-xs text-blue-400 font-mono">/ {cleanWord.toLowerCase()} /</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
        <button
          onClick={() => onSpeakWord(cleanWord)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium border border-blue-500/30 transition active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Pronunciar</span>
        </button>

        <button
          onClick={handleSave}
          disabled={saved}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium border transition active:scale-95 ${
            saved
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
          }`}
        >
          {saved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guardado</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
