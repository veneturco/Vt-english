import React from "react";
import { Sparkles, Trophy, CheckCircle2 } from "lucide-react";
import { soundFx } from "../utils/soundFx";

interface IdiomOfTheDayCardProps {
  phrase: string;
  meaningSpanish: string;
  exampleEnglish: string;
  isUsedInSession?: boolean;
  onPracticeIdiom?: (phrase: string) => void;
}

export const IdiomOfTheDayCard: React.FC<IdiomOfTheDayCardProps> = ({
  phrase,
  meaningSpanish,
  exampleEnglish,
  isUsedInSession = false,
  onPracticeIdiom,
}) => {
  return (
    <div className="w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-2 border-amber-500/30 flex items-center justify-between gap-3 select-none">
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
              Expresión del Día (+20 XP)
            </span>
            {isUsedInSession && (
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> ¡Usada!
              </span>
            )}
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-white">"{phrase}"</span>
          <span className="text-[11px] font-medium text-slate-300 line-clamp-1">{meaningSpanish}</span>
        </div>
      </div>

      {onPracticeIdiom && (
        <button
          onClick={() => {
            soundFx.playPop();
            onPracticeIdiom(phrase);
          }}
          className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-b-4 border-amber-600 active:border-b-2 active:translate-y-0.5 transition shrink-0 whitespace-nowrap shadow-sm"
        >
          Usar en Chat
        </button>
      )}
    </div>
  );
};
