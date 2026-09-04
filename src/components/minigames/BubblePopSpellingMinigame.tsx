import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Sparkles, Volume2, RotateCcw, Award, CheckCircle2, HelpCircle } from "lucide-react";
import { playSuccessFanfare, playErrorSoft } from "../../utils/audioSynth";
import { kidsSFX } from "../../utils/kidsAudioAndStorage";
import { speakText } from "../../utils/speech";
import { fireParticles } from "../../utils/particleHelper";
import { AvatarConfig } from "../../types";

interface BubblePopSpellingMinigameProps {
  targetWord: string;
  targetEmoji?: string;
  spanishTranslation?: string;
  companionName?: string;
  companionAvatarConfig?: AvatarConfig;
  onSuccess: () => void;
}

interface BubbleItem {
  id: string;
  letter: string;
  isPopped: boolean;
  color: string;
  wobbleClass: string;
  size: number;
}

const BUBBLE_COLORS = [
  "from-sky-400/80 via-blue-500/80 to-cyan-300/80 border-cyan-200 text-white shadow-cyan-400/50",
  "from-pink-400/80 via-rose-500/80 to-purple-400/80 border-pink-200 text-white shadow-pink-400/50",
  "from-amber-400/80 via-yellow-500/80 to-orange-400/80 border-amber-200 text-slate-950 shadow-amber-400/50",
  "from-emerald-400/80 via-teal-500/80 to-green-300/80 border-emerald-200 text-white shadow-emerald-400/50",
  "from-violet-400/80 via-purple-600/80 to-indigo-400/80 border-violet-200 text-white shadow-violet-400/50",
];

const WOBBLE_DELAYS = [
  "animate-[bounce_3s_infinite_ease-in-out]",
  "animate-[pulse_2.5s_infinite_ease-in-out]",
  "animate-[bounce_3.4s_infinite_ease-in-out_0.2s]",
  "animate-[pulse_2.8s_infinite_ease-in-out_0.4s]",
  "animate-[bounce_2.8s_infinite_ease-in-out_0.6s]",
];

export const BubblePopSpellingMinigame: React.FC<BubblePopSpellingMinigameProps> = ({
  targetWord,
  targetEmoji = "🍎",
  spanishTranslation = "",
  companionName = "Dino Yoshi",
  companionAvatarConfig,
  onSuccess,
}) => {
  // Clean letters only for spelling slots (uppercase, letters A-Z only)
  const letters = useMemo(() => {
    return targetWord
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .split("");
  }, [targetWord]);

  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("¡Toca la primera burbuja para comenzar!");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [flyingLetter, setFlyingLetter] = useState<{
    letter: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  // Initialize bubbles with target letters + 2 fun distractor letters
  const initializeBubbles = useCallback(() => {
    const targetLetters = [...letters];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const distractors: string[] = [];

    // Add 2 or 3 random distractors not immediately in target if possible
    while (distractors.length < Math.min(3, 8 - targetLetters.length)) {
      const randChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      distractors.push(randChar);
    }

    const allLetters = [...targetLetters, ...distractors];
    // Shuffle
    const shuffled = allLetters.sort(() => Math.random() - 0.5);

    const newBubbles: BubbleItem[] = shuffled.map((letter, idx) => ({
      id: `bubble-${idx}-${letter}-${Date.now()}`,
      letter,
      isPopped: false,
      color: BUBBLE_COLORS[idx % BUBBLE_COLORS.length],
      wobbleClass: WOBBLE_DELAYS[idx % WOBBLE_DELAYS.length],
      size: Math.floor(Math.random() * 8) + 56, // 56 to 64px
    }));

    setBubbles(newBubbles);
    setCurrentLetterIndex(0);
    setIsCompleted(false);
    setShowHint(false);
    setFlyingLetter(null);
    setFeedback(`¡Encuentra la letra "${targetLetters[0]}" para hacerla explotar!`);
  }, [letters]);

  useEffect(() => {
    initializeBubbles();
  }, [initializeBubbles]);

  // Handle letter bubble click
  const handleBubbleClick = (bubble: BubbleItem, event: React.MouseEvent<HTMLButtonElement>) => {
    if (bubble.isPopped || isCompleted) return;

    const nextTargetLetter = letters[currentLetterIndex];

    if (bubble.letter === nextTargetLetter) {
      // Correct bubble popped!
      kidsSFX.playPopBubble();

      // Fire liquid droplets + sparks from bubble location
      const rect = event.currentTarget.getBoundingClientRect();
      const bubbleCenterX = rect.left + rect.width / 2;
      const bubbleCenterY = rect.top + rect.height / 2;
      fireParticles(bubbleCenterX, bubbleCenterY, "bubbles", 14);
      fireParticles(bubbleCenterX, bubbleCenterY, "sparks", 16);

      // Target slot location for flying letter animation
      const targetSlotEl = document.getElementById(`spelling-slot-${currentLetterIndex}`);
      if (targetSlotEl) {
        const slotRect = targetSlotEl.getBoundingClientRect();
        setFlyingLetter({
          letter: bubble.letter,
          startX: bubbleCenterX,
          startY: bubbleCenterY,
          endX: slotRect.left + slotRect.width / 2,
          endY: slotRect.top + slotRect.height / 2,
        });

        setTimeout(() => {
          setFlyingLetter(null);
        }, 550);
      }

      // Pronounce letter sound
      speakText(
        bubble.letter,
        companionAvatarConfig,
        undefined,
        undefined,
        undefined,
        { forceLang: "en-US", rateMultiplier: 1.1 }
      );

      // Mark bubble popped
      setBubbles((prev) =>
        prev.map((b) => (b.id === bubble.id ? { ...b, isPopped: true } : b))
      );

      const nextIdx = currentLetterIndex + 1;
      setCurrentLetterIndex(nextIdx);

      if (nextIdx >= letters.length) {
        // Complete word spelled!
        setIsCompleted(true);
        setFeedback(`¡Increíble! ¡Completaste "${targetWord}"! ⭐`);
        playSuccessFanfare();
        fireParticles(window.innerWidth / 2, window.innerHeight / 3, "coins", 25);
        fireParticles(window.innerWidth / 2, window.innerHeight / 3, "confetti", 50);

        // Pronounce full word
        setTimeout(() => {
          speakText(
            targetWord,
            companionAvatarConfig,
            undefined,
            undefined,
            undefined,
            { forceLang: "en-US", rateMultiplier: 0.9 }
          );
        }, 500);

        // Trigger success reward and victory
        setTimeout(() => {
          onSuccess();
        }, 1300);
      } else {
        setFeedback(`¡Excelente! Ahora busca la letra "${letters[nextIdx]}" ✨`);
      }
    } else {
      // Wrong bubble (gentle encouraging feedback)
      playErrorSoft();
      setFeedback(`¡Casi! Busca la letra "${nextTargetLetter}". ¡Tú puedes! 💪`);
    }
  };

  const handleSpeakWord = () => {
    kidsSFX.playPopBubble();
    speakText(
      targetWord,
      companionAvatarConfig,
      undefined,
      undefined,
      undefined,
      { forceLang: "en-US", rateMultiplier: 0.85 }
    );
  };

  return (
    <div className="w-full my-2 flex flex-col items-center gap-3 p-3 sm:p-4 rounded-3xl bg-slate-900/95 border-2 border-cyan-400/40 shadow-2xl relative overflow-hidden select-none">
      {/* Background soft bubble ambient lights */}
      <div className="absolute -top-10 -left-10 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-300">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="text-[11px] font-black tracking-wider uppercase">Bubble Pop Spelling</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            title="Mostrar u ocultar pista"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pista</span>
          </button>
          <button
            type="button"
            onClick={initializeBubbles}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            title="Reiniciar burbujas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Word Goal Banner */}
      <div className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{targetEmoji}</span>
          <div className="text-left">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wide">
              Deletrea en orden fonético:
            </span>
            <div className="text-sm font-black text-white">
              "{targetWord}"{" "}
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
          onClick={handleSpeakWord}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-black flex items-center gap-1 border border-cyan-400/30 transition cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Escuchar</span>
        </button>
      </div>

      {/* Spelling Letter Slots (Target Word Visual Progression) */}
      <div className="flex items-center justify-center gap-2 my-1 z-10 flex-wrap">
        {letters.map((letter, idx) => {
          const isFilled = idx < currentLetterIndex;
          const isCurrentTarget = idx === currentLetterIndex && !isCompleted;

          return (
            <div
              key={idx}
              id={`spelling-slot-${idx}`}
              style={{
                animationDelay: isCompleted ? `${idx * 120}ms` : undefined,
              }}
              className={`
                w-10 h-12 sm:w-12 sm:h-14 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl border-2 transition-all duration-300 select-none
                ${
                  isCompleted
                    ? "bg-gradient-to-tr from-amber-400 via-pink-500 to-cyan-400 text-white border-yellow-200 shadow-xl shadow-cyan-400/40 animate-bounce scale-110"
                    : isFilled
                    ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/30 scale-105"
                    : isCurrentTarget
                    ? "bg-slate-800 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-400/40 animate-pulse scale-105 ring-2 ring-cyan-400/40"
                    : "bg-slate-950/80 text-slate-600 border-slate-800"
                }
              `}
            >
              {isFilled ? letter : isCurrentTarget && showHint ? letter : "_"}
            </div>
          );
        })}
      </div>

      {/* Dynamic Flying Letter Animation Portal */}
      {flyingLetter && (
        <div
          className="fixed pointer-events-none z-[100] w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-500 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center shadow-2xl shadow-yellow-400/80 border-2 border-white will-change-transform"
          style={{
            left: `${flyingLetter.startX}px`,
            top: `${flyingLetter.startY}px`,
            transform: "translate(-50%, -50%) scale(1)",
            transition: "all 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2)",
          }}
          ref={(el) => {
            if (el) {
              requestAnimationFrame(() => {
                el.style.left = `${flyingLetter.endX}px`;
                el.style.top = `${flyingLetter.endY}px`;
                el.style.transform = "translate(-50%, -50%) scale(1.15) rotate(12deg)";
              });
            }
          }}
        >
          {flyingLetter.letter}
        </div>
      )}

      {/* Feedback Message */}
      <p className="text-xs font-bold text-center text-cyan-200 min-h-[20px] z-10">
        {feedback}
      </p>

      {/* Floating Bubbles Lagoon */}
      <div className="w-full min-h-[140px] sm:min-h-[160px] p-3 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-cyan-500/20 flex items-center justify-center gap-3 sm:gap-4 flex-wrap relative z-10">
        {bubbles.map((bubble) => {
          const isNextLetter =
            !bubble.isPopped && bubble.letter === letters[currentLetterIndex];

          if (bubble.isPopped) {
            return (
              <div
                key={bubble.id}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-cyan-500/10 flex items-center justify-center opacity-10 pointer-events-none"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            );
          }

          return (
            <button
              key={bubble.id}
              type="button"
              onClick={(e) => handleBubbleClick(bubble, e)}
              className={`
                relative rounded-full bg-gradient-to-tr ${bubble.color}
                border-2 backdrop-blur-md flex items-center justify-center font-black text-xl sm:text-2xl shadow-xl
                transform transition-all duration-200 active:scale-75 cursor-pointer touch-manipulation select-none
                ${bubble.wobbleClass}
                ${
                  showHint && isNextLetter
                    ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-950 scale-110"
                    : "hover:scale-110"
                }
              `}
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
              }}
            >
              {/* Bubble Highlight shine specular reflex */}
              <span className="absolute top-1.5 left-2 w-3 h-2 bg-white/70 rounded-full blur-[0.5px] rotate-[-35deg]" />
              <span className="filter drop-shadow">{bubble.letter}</span>
            </button>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 animate-bounce z-10 shadow-lg">
          <Award className="w-4 h-4" />
          <span>¡Palabra Completada! +25 🪙 Monedas Fósil</span>
        </div>
      )}
    </div>
  );
};
