import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Sparkles, Volume2, RotateCcw, Award, Headphones, Star } from "lucide-react";
import { playJumpSound, playSuccessFanfare, playErrorSoft } from "../../utils/audioSynth";
import { kidsSFX } from "../../utils/kidsAudioAndStorage";
import { speakText } from "../../utils/speech";
import { fireParticles } from "../../utils/particleHelper";
import { AvatarConfig } from "../../types";

interface DinoPipeTunnelMinigameProps {
  targetWord: string;
  targetEmoji?: string;
  spanishTranslation?: string;
  companionName?: string;
  companionAvatarConfig?: AvatarConfig;
  distractorOptions?: string[];
  onSuccess: () => void;
}

interface PipeOption {
  id: number;
  word: string;
  emoji: string;
  isCorrect: boolean;
  color: {
    rim: string;
    body: string;
    border: string;
    glow: string;
  };
}

const PIPE_COLORS = [
  {
    rim: "from-emerald-400 via-green-500 to-emerald-600",
    body: "from-emerald-600 via-green-700 to-emerald-800",
    border: "border-emerald-300",
    glow: "shadow-emerald-500/40",
  },
  {
    rim: "from-cyan-400 via-blue-500 to-cyan-600",
    body: "from-blue-600 via-indigo-700 to-blue-800",
    border: "border-cyan-300",
    glow: "shadow-cyan-500/40",
  },
  {
    rim: "from-amber-400 via-yellow-500 to-orange-500",
    body: "from-amber-600 via-orange-700 to-amber-800",
    border: "border-amber-300",
    glow: "shadow-amber-500/40",
  },
];

const FUN_FALLBACK_DISTRACTORS = [
  { word: "Cat", emoji: "🐱" },
  { word: "Car", emoji: "🚗" },
  { word: "Star", emoji: "⭐" },
  { word: "Ball", emoji: "⚽" },
  { word: "Fish", emoji: "🐟" },
  { word: "Bird", emoji: "🐦" },
  { word: "Banana", emoji: "🍌" },
];

export const DinoPipeTunnelMinigame: React.FC<DinoPipeTunnelMinigameProps> = ({
  targetWord,
  targetEmoji = "🍎",
  spanishTranslation = "",
  companionName = "Dino Yoshi",
  companionAvatarConfig,
  distractorOptions = [],
  onSuccess,
}) => {
  const [selectedPipeId, setSelectedPipeId] = useState<number | null>(null);
  const [diveState, setDiveState] = useState<"idle" | "diving" | "celebrating" | "wrong">("idle");
  const [feedback, setFeedback] = useState<string>("¡Escucha con atención y elige la tubería correcta!");
  const [pipes, setPipes] = useState<PipeOption[]>([]);

  // Prepare pipe options (1 correct + 2 distractors)
  const initializePipes = useCallback(() => {
    const distractors = FUN_FALLBACK_DISTRACTORS.filter(
      (d) => d.word.toLowerCase() !== targetWord.toLowerCase()
    ).sort(() => Math.random() - 0.5);

    const pipeData: PipeOption[] = [
      {
        id: 0,
        word: targetWord,
        emoji: targetEmoji,
        isCorrect: true,
        color: PIPE_COLORS[0],
      },
      {
        id: 1,
        word: distractorOptions[0] || distractors[0].word,
        emoji: distractors[0].emoji,
        isCorrect: false,
        color: PIPE_COLORS[1],
      },
      {
        id: 2,
        word: distractorOptions[1] || distractors[1].word,
        emoji: distractors[1].emoji,
        isCorrect: false,
        color: PIPE_COLORS[2],
      },
    ];

    // Shuffle pipe positions
    const shuffledPipes = pipeData
      .sort(() => Math.random() - 0.5)
      .map((p, idx) => ({
        ...p,
        id: idx,
        color: PIPE_COLORS[idx % PIPE_COLORS.length],
      }));

    setPipes(shuffledPipes);
    setSelectedPipeId(null);
    setDiveState("idle");
    setFeedback(`¡Escucha a ${companionName.split(" ")[0]} y entra en la tubería correcta! 🎧`);
  }, [targetWord, targetEmoji, distractorOptions, companionName]);

  useEffect(() => {
    initializePipes();
  }, [initializePipes]);

  // Play auditory prompt in English
  const handlePlayAudioPrompt = () => {
    kidsSFX.playPopBubble();
    speakText(
      `Where is: ${targetWord}?`,
      companionAvatarConfig,
      undefined,
      undefined,
      undefined,
      { forceLang: "en-US", rateMultiplier: 0.85 }
    );
  };

  // When child taps a pipe
  const handleSelectPipe = (pipe: PipeOption, event: React.MouseEvent<HTMLDivElement>) => {
    if (diveState === "diving" || diveState === "celebrating") return;

    setSelectedPipeId(pipe.id);

    if (pipe.isCorrect) {
      // Pipe diving animation
      setDiveState("diving");
      kidsSFX.playJumpSound();

      const rect = event.currentTarget.getBoundingClientRect();
      const pipeMouthX = rect.left + rect.width / 2;
      const pipeMouthY = rect.top + 20;

      // Burst of golden Mario-style coins & stars
      fireParticles(pipeMouthX, pipeMouthY, "coins", 18);
      fireParticles(pipeMouthX, pipeMouthY, "stars", 22);

      setFeedback(`¡SIII! ¡Encontraste "${targetWord}"! 🚀`);

      // Celebration fanfare & success
      setTimeout(() => {
        setDiveState("celebrating");
        kidsSFX.playCoinSound();
        playSuccessFanfare();
        speakText(
          `Awesome! ${targetWord}!`,
          companionAvatarConfig,
          undefined,
          undefined,
          undefined,
          { forceLang: "en-US", rateMultiplier: 0.9 }
        );
      }, 500);

      setTimeout(() => {
        onSuccess();
      }, 1400);
    } else {
      // Wrong pipe
      setDiveState("wrong");
      playErrorSoft();
      setFeedback(`¡Ups! Esa no era "${targetWord}". ¡Intenta con otra tubería! 🔍`);

      setTimeout(() => {
        setDiveState("idle");
        setSelectedPipeId(null);
      }, 900);
    }
  };

  return (
    <div className="w-full my-2 flex flex-col items-center gap-3 p-3 sm:p-4 rounded-3xl bg-slate-900/95 border-2 border-emerald-400/40 shadow-2xl relative overflow-hidden select-none">
      {/* Soft retro background lighting */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-300">
          <Headphones className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-black tracking-wider uppercase">Dino Pipe Tunnel</span>
        </div>

        <button
          type="button"
          onClick={initializePipes}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          title="Mezclar tuberías"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mezclar</span>
        </button>
      </div>

      {/* Auditory Clue Card */}
      <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800 z-10">
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl">
            {targetEmoji}
          </div>
          <div>
            <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wide">
              Misión Auditiva:
            </div>
            <div className="text-sm font-black text-white">
              Encuentra: "{targetWord}"{" "}
              {spanishTranslation && (
                <span className="text-xs text-slate-400 font-normal">
                  ({spanishTranslation})
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          id="pipe-listen-clue-btn"
          onClick={handlePlayAudioPrompt}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition active:scale-95 cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>¡Escuchar Voz!</span>
        </button>
      </div>

      {/* Feedback text */}
      <p className="text-xs font-bold text-center text-emerald-200 min-h-[20px] z-10">
        {feedback}
      </p>

      {/* 3 Retro Pipes Stage */}
      <div className="w-full pt-10 pb-4 px-2 sm:px-6 rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/90 to-emerald-950/30 border border-slate-800 flex items-end justify-around gap-2 sm:gap-6 relative z-10">
        {pipes.map((pipe) => {
          const isSelected = selectedPipeId === pipe.id;
          const isDivingHere = isSelected && diveState === "diving";
          const isCelebratedHere = isSelected && diveState === "celebrating";
          const isWrongHere = isSelected && diveState === "wrong";

          return (
            <div
              key={pipe.id}
              onClick={(e) => handleSelectPipe(pipe, e)}
              className={`
                group relative flex flex-col items-center cursor-pointer transition-all duration-200 active:scale-95 select-none
                ${isWrongHere ? "animate-bounce ring-4 ring-rose-500 rounded-3xl" : "hover:-translate-y-1"}
              `}
            >
              {/* Comic surprise reaction on incorrect selection */}
              {isWrongHere && (
                <div className="absolute -top-10 px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-xs shadow-lg animate-ping z-30">
                  👀 ¡Oops!
                </div>
              )}

              {/* Peek-a-boo item popping out of pipe */}
              <div
                className={`
                  w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300
                  ${
                    isDivingHere
                      ? "translate-y-12 opacity-0 scale-x-125 scale-y-50"
                      : isCelebratedHere
                      ? "-translate-y-6 scale-125 animate-bounce"
                      : "-translate-y-2 group-hover:-translate-y-4"
                  }
                `}
              >
                <span className="text-3xl sm:text-4xl filter drop-shadow-lg animate-bounce">
                  {pipe.emoji}
                </span>
                <span className="text-[10px] font-black text-white/90 bg-slate-950/80 px-1.5 py-0.5 rounded-md mt-0.5 shadow">
                  {pipe.word}
                </span>
              </div>

              {/* Poof cloud on plunge */}
              {isDivingHere && (
                <div className="absolute top-4 text-2xl z-30 animate-ping">
                  💨
                </div>
              )}

              {/* 3D Pipe Rim Collar */}
              <div
                className={`
                  w-20 sm:w-24 h-6 sm:h-7 rounded-t-lg bg-gradient-to-r ${pipe.color.rim}
                  border-2 ${pipe.color.border} shadow-lg ${pipe.color.glow} relative z-20 flex items-center justify-center
                  ${isSelected && pipe.isCorrect ? "ring-4 ring-yellow-300" : ""}
                `}
              >
                {/* Pipe lip dark opening groove */}
                <div className="w-[85%] h-2 rounded-full bg-slate-950/70 border border-black/40" />
              </div>

              {/* 3D Pipe Body Cylinder */}
              <div
                className={`
                  w-16 sm:w-20 h-20 sm:h-24 bg-gradient-to-r ${pipe.color.body}
                  border-x-2 border-b-2 ${pipe.color.border} shadow-2xl relative overflow-hidden flex flex-col items-center justify-end pb-2
                `}
              >
                {/* Vertical reflective specular stripe */}
                <div className="absolute top-0 left-2 bottom-0 w-2.5 bg-white/20 blur-[0.5px]" />
                <div className="absolute top-0 right-3 bottom-0 w-1 bg-black/30" />

                {/* Star icon badge on pipe */}
                <div className="w-6 h-6 rounded-full bg-slate-950/50 border border-white/20 flex items-center justify-center text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Ground Platform (Mario/Yoshi style brick ground accent) */}
      <div className="w-full h-3 bg-gradient-to-r from-amber-700 via-yellow-800 to-amber-700 border-t-2 border-amber-500 rounded-full shadow-md z-10" />

      {/* Completion Banner */}
      {diveState === "celebrating" && (
        <div className="w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 animate-bounce z-10 shadow-lg">
          <Award className="w-4 h-4" />
          <span>¡Tubería Superada! +25 🪙 Monedas Fósil</span>
        </div>
      )}
    </div>
  );
};
