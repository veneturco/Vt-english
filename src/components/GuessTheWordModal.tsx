import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  X,
  Volume2,
  Sparkles,
  Flame,
  Gem,
  Shuffle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Clock,
  RotateCcw,
  Trophy,
  Delete,
  Eye,
  Trash2,
  Share2,
  Wand2,
  Music,
} from "lucide-react";
import { AvatarAnimationState, AvatarConfig } from "../types";
import { AvatarCanvas } from "./AvatarCanvas";
import { Avatar2DCanvas } from "./Avatar2DCanvas";
import {
  GUESS_THE_WORD_ITEMS,
  GUESS_CATEGORIES,
  WordGuessItem,
} from "../data/guessTheWordData";
import {
  VisualParticleCelebrationCanvas,
  VisualParticleCelebrationRef,
} from "./VisualParticleCelebrationCanvas";
import {
  playSoundTap,
  playSoundCorrect,
  playSoundWrong,
  playSoundStreakMilestone,
  playSoundLevelComplete,
  playDynamicEchoFanfare,
} from "../utils/visualSoundEffects";

export type GuessGameMode = "standard" | "random" | "time_rush";

interface LetterTile {
  id: string; // unique tile identifier
  char: string; // letter character uppercase
  isUsed: boolean;
  isHintRevealed?: boolean;
}

interface GuessTheWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarConfig?: AvatarConfig;
  onRewardXp?: (xp: number, gems: number) => void;
  userStreak?: number;
  userGems?: number;
}

export const GuessTheWordModal: React.FC<GuessTheWordModalProps> = ({
  isOpen,
  onClose,
  avatarConfig,
  onRewardXp,
  userStreak = 1,
  userGems = 10,
}) => {
  // Modal Container & Canvas Refs
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const celebrationCanvasRef = useRef<VisualParticleCelebrationRef | null>(null);
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Game Settings & Category State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [gameMode, setGameMode] = useState<GuessGameMode>("standard");
  const [isDirectTypingMode, setIsDirectTypingMode] = useState<boolean>(false);
  const [showHintExplanation, setShowHintExplanation] = useState<boolean>(false);
  const [showTranslationClue, setShowTranslationClue] = useState<boolean>(true);

  // Filtered Items Playlist
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return GUESS_THE_WORD_ITEMS;
    return GUESS_THE_WORD_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  // Current Progression Index
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentItem: WordGuessItem = useMemo(() => {
    if (!filteredItems.length) return GUESS_THE_WORD_ITEMS[0];
    return filteredItems[currentIndex % filteredItems.length];
  }, [filteredItems, currentIndex]);

  // Scoring & Stats State
  const [sessionStreak, setSessionStreak] = useState<number>(0);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [sessionGems, setSessionGems] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [hintsUsedThisWord, setHintsUsedThisWord] = useState<number>(0);

  // Time Rush State (60s)
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTimeRushActive, setIsTimeRushActive] = useState<boolean>(false);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);

  // Word Spelling State
  const [letterBank, setLetterBank] = useState<LetterTile[]>([]);
  const [slottedTiles, setSlottedTiles] = useState<(LetterTile | null)[]>(() =>
    new Array(GUESS_THE_WORD_ITEMS[0]?.word?.length || 6).fill(null)
  );
  const [directInputText, setDirectInputText] = useState<string>("");
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

  // Avatar Companion Reaction State
  const [avatarAnimationState, setAvatarAnimationState] = useState<AvatarAnimationState>("idle");
  const [avatarReaction, setAvatarReaction] = useState<{
    mood: "praising" | "thinking" | "support" | "idle";
    message: string;
  }>({
    mood: "idle",
    message: "¡Mira la foto y adivina el término en inglés!",
  });

  // Inactivity / Idle Support Timer (avatar encourages user when taking long time)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (isAnswerChecked || isSessionComplete) return;

    idleTimerRef.current = setTimeout(() => {
      setAvatarAnimationState("pensativo");
      setAvatarReaction({
        mood: "support",
        message: `💡 Pista: Significa "${currentItem.spanishTranslation}". La palabra empieza por "${currentItem.word.charAt(0).toUpperCase()}".`,
      });
    }, 7500);
  }, [isAnswerChecked, isSessionComplete, currentItem]);

  // Image Load & Error Handling
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Speech Synthesis Helper
  const speakWord = useCallback((textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }, []);

  // Clear auto-advance timer safely
  const clearAutoTimer = useCallback(() => {
    if (autoNextTimerRef.current) {
      clearInterval(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    setAutoAdvanceCountdown(null);
  }, []);

  // Helper: Build Scrambled Letter Bank for Current Word
  const initializeLetterBank = useCallback((item: WordGuessItem) => {
    const targetWord = item.word.toUpperCase();
    const targetLetters = targetWord.split("");
    
    // Choose distractors
    const distractors = item.distractorLetters || ["A", "E", "R", "S", "T", "O", "L", "N"];
    const extraLettersCount = Math.max(3, 12 - targetLetters.length);
    const extraPicked = [...distractors]
      .sort(() => 0.5 - Math.random())
      .slice(0, extraLettersCount);

    const allChars = [...targetLetters, ...extraPicked].sort(() => 0.5 - Math.random());

    const tiles: LetterTile[] = allChars.map((char, index) => ({
      id: `${item.id}-${char}-${index}-${Math.random().toString(36).substring(2, 5)}`,
      char,
      isUsed: false,
    }));

    setLetterBank(tiles);
    setSlottedTiles(new Array(targetWord.length).fill(null));
    setDirectInputText("");
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setImageError(false);
    setImageLoaded(false);
    setHintsUsedThisWord(0);
    setShowHintExplanation(false);
    setAvatarAnimationState("idle");
    setAvatarReaction({
      mood: "idle",
      message: "¡Mira la foto y adivina el término en inglés!",
    });
  }, []);

  // Initialize or update current item
  useEffect(() => {
    if (isOpen && currentItem) {
      initializeLetterBank(currentItem);
      resetIdleTimer();
    }
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isOpen, currentItem, initializeLetterBank, resetIdleTimer]);

  // Timer Effect for Time Rush Mode
  useEffect(() => {
    if (!isOpen || gameMode !== "time_rush" || !isTimeRushActive || isSessionComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSessionComplete(true);
          setAvatarAnimationState("celebrating");
          playSoundLevelComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, gameMode, isTimeRushActive, isSessionComplete]);

  // Particle Celebration Helper
  const triggerCelebrationEffect = useCallback(
    (streakLevel = 1, customOrigin?: { clientX: number; clientY: number }, badgeText?: string) => {
      try {
        let relX = 350;
        let relY = 250;
        let normX = 0.5;
        let normY = 0.55;

        if (customOrigin) {
          normX = Math.max(0.1, Math.min(0.9, customOrigin.clientX / window.innerWidth));
          normY = Math.max(0.1, Math.min(0.9, customOrigin.clientY / window.innerHeight));

          if (modalContainerRef.current) {
            const rect = modalContainerRef.current.getBoundingClientRect();
            relX = customOrigin.clientX - rect.left;
            relY = customOrigin.clientY - rect.top;
          }
        } else if (modalContainerRef.current) {
          const rect = modalContainerRef.current.getBoundingClientRect();
          relX = rect.width / 2;
          relY = rect.height * 0.45;
        }

        const theme =
          streakLevel >= 4
            ? "fire"
            : streakLevel >= 3
            ? "gold"
            : streakLevel >= 2
            ? "emerald"
            : "rainbow";

        celebrationCanvasRef.current?.spawnBurst({
          x: relX,
          y: relY,
          combo: streakLevel,
          textBadge: badgeText,
          theme,
        });

        // Confetti burst
        confetti({
          particleCount: 50,
          spread: 75,
          origin: { x: normX, y: normY },
          colors: ["#38bdf8", "#4ade80", "#fbbf24", "#f43f5e", "#a855f7"],
        });
      } catch {}
    },
    []
  );

  // --- SUBMIT ANSWER LOGIC ---
  const handleValidateAnswer = useCallback(
    (currentGuessedWord: string, originCoords?: { clientX: number; clientY: number }) => {
      if (isAnswerChecked) return;
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      const target = currentItem.word.toUpperCase().trim();
      const guessed = currentGuessedWord.toUpperCase().trim();

      if (guessed.length === 0) return;

      if (guessed === target) {
        // Correct Answer!
        setIsAnswerChecked(true);
        setIsCorrect(true);
        const newStreak = sessionStreak + 1;
        setSessionStreak(newStreak);
        const newSolvedCount = solvedCount + 1;
        setSolvedCount(newSolvedCount);

        const xpGained = 20 + Math.min(newStreak * 5, 25);
        const gemsGained = newStreak % 3 === 0 ? 2 : 1;

        setSessionScore((prev) => prev + xpGained);
        setSessionGems((prev) => prev + gemsGained);
        onRewardXp?.(xpGained, gemsGained);

        // Progressive Dynamic Echo Fanfare according to completed level and combo intensity
        const currentProgressionLevel = Math.max(newStreak, newSolvedCount);
        if (newStreak % 5 === 0) {
          playDynamicEchoFanfare(currentProgressionLevel + 2, { echoFeedback: 0.52 });
        } else {
          playDynamicEchoFanfare(currentProgressionLevel);
        }

        triggerCelebrationEffect(
          newStreak,
          originCoords,
          `+${xpGained} XP 🔥 Combo x${newStreak}`
        );

        setAvatarAnimationState(newStreak >= 3 ? "celebrating" : "alegre");
        setAvatarReaction({
          mood: "praising",
          message: `¡Brillante! "${currentItem.word}" deletreado a la perfección. 🔥 Combo x${newStreak}`,
        });

        // Speak the correct word with clear native pronunciation
        setTimeout(() => {
          speakWord(currentItem.word);
        }, 300);

        // Auto Advance Timer Countdown (3 seconds)
        let count = 3;
        setAutoAdvanceCountdown(count);
        clearAutoTimer();
        autoNextTimerRef.current = setInterval(() => {
          count -= 1;
          if (count <= 0) {
            clearAutoTimer();
            handleNextWord();
          } else {
            setAutoAdvanceCountdown(count);
          }
        }, 1000);
      } else {
        // Incorrect Answer!
        playSoundWrong();
        setIsShaking(true);
        setAvatarAnimationState("encouraging");
        setAvatarReaction({
          mood: "thinking",
          message: `¡Casi! Revisa el orden de las letras o toca una pista si lo necesitas.`,
        });
        setTimeout(() => setIsShaking(false), 500);
      }
    },
    [
      isAnswerChecked,
      currentItem,
      sessionStreak,
      onRewardXp,
      triggerCelebrationEffect,
      speakWord,
      clearAutoTimer,
    ]
  );

  // Handle Tile Click in Bank -> Move to first free slot
  const handleTileClickInBank = (tile: LetterTile, e?: React.MouseEvent) => {
    if (isAnswerChecked || tile.isUsed) return;
    playSoundTap();

    const targetLength = currentItem.word.length;
    const firstEmptyIndex = slottedTiles.findIndex((t) => t === null);

    if (firstEmptyIndex !== -1 && firstEmptyIndex < targetLength) {
      const updatedSlotted = [...slottedTiles];
      updatedSlotted[firstEmptyIndex] = { ...tile, isUsed: true };
      setSlottedTiles(updatedSlotted);

      // Mark tile as used in bank
      setLetterBank((prev) =>
        prev.map((t) => (t.id === tile.id ? { ...t, isUsed: true } : t))
      );

      // Check if all slots are filled now
      const isComplete = updatedSlotted.every((t) => t !== null);
      if (isComplete) {
        const fullWord = updatedSlotted.map((t) => t?.char || "").join("");
        const coords = e ? { clientX: e.clientX, clientY: e.clientY } : undefined;
        handleValidateAnswer(fullWord, coords);
      }
    }
  };

  // Handle Tile Click in Slot -> Remove back to bank
  const handleSlotClick = (slotIndex: number) => {
    if (isAnswerChecked) return;
    const tileInSlot = slottedTiles[slotIndex];
    if (!tileInSlot) return;

    playSoundTap();
    // Return tile to bank
    setLetterBank((prev) =>
      prev.map((t) => (t.id === tileInSlot.id ? { ...t, isUsed: false } : t))
    );

    const updatedSlotted = [...slottedTiles];
    updatedSlotted[slotIndex] = null;
    setSlottedTiles(updatedSlotted);
  };

  // Clear all slotted letters
  const handleClearSlots = () => {
    if (isAnswerChecked) return;
    playSoundTap();
    setSlottedTiles(new Array(currentItem.word.length).fill(null));
    setLetterBank((prev) => prev.map((t) => ({ ...t, isUsed: false })));
  };

  // Delete last slotted letter
  const handleDeleteLastSlot = () => {
    if (isAnswerChecked) return;
    for (let i = slottedTiles.length - 1; i >= 0; i--) {
      if (slottedTiles[i] !== null) {
        handleSlotClick(i);
        break;
      }
    }
  };

  // Shuffle remaining unused tiles in bank
  const handleShuffleBank = () => {
    playSoundTap();
    setLetterBank((prev) => {
      const used = prev.filter((t) => t.isUsed);
      const unused = prev.filter((t) => !t.isUsed).sort(() => 0.5 - Math.random());
      return [...used, ...unused];
    });
  };

  // HINT 1: Reveal next correct letter
  const handleRevealLetterHint = () => {
    if (isAnswerChecked) return;
    playSoundTap();
    const targetLetters = currentItem.word.toUpperCase().split("");

    // Find the first slot that is either empty or has the wrong letter
    let targetSlotIdx = -1;
    for (let i = 0; i < targetLetters.length; i++) {
      if (!slottedTiles[i] || slottedTiles[i]?.char !== targetLetters[i]) {
        targetSlotIdx = i;
        break;
      }
    }

    if (targetSlotIdx === -1) return;

    const neededChar = targetLetters[targetSlotIdx];

    // If there's an incorrect letter in that slot, return it to bank
    if (slottedTiles[targetSlotIdx]) {
      const oldTile = slottedTiles[targetSlotIdx]!;
      setLetterBank((prev) =>
        prev.map((t) => (t.id === oldTile.id ? { ...t, isUsed: false } : t))
      );
    }

    // Find an unused matching tile in bank, or create/reset one
    const matchingInBank = letterBank.find((t) => !t.isUsed && t.char === neededChar);
    const tileToUse: LetterTile = matchingInBank || {
      id: `hint-${neededChar}-${Math.random().toString(36).substring(2, 5)}`,
      char: neededChar,
      isUsed: true,
      isHintRevealed: true,
    };

    if (matchingInBank) {
      setLetterBank((prev) =>
        prev.map((t) => (t.id === matchingInBank.id ? { ...t, isUsed: true } : t))
      );
    }

    const updatedSlotted = [...slottedTiles];
    updatedSlotted[targetSlotIdx] = { ...tileToUse, isHintRevealed: true, isUsed: true };
    setSlottedTiles(updatedSlotted);
    setHintsUsedThisWord((h) => h + 1);

    // If this completed the word
    if (updatedSlotted.every((t) => t !== null)) {
      const fullWord = updatedSlotted.map((t) => t?.char || "").join("");
      handleValidateAnswer(fullWord);
    }
  };

  // HINT 2: Remove 2 distractor letters from bank
  const handleRemoveDistractorHint = () => {
    if (isAnswerChecked) return;
    playSoundTap();
    const targetLetters = currentItem.word.toUpperCase().split("");

    // Find unused letters that aren't in target word or exceed target count
    const unusedTiles = letterBank.filter((t) => !t.isUsed);
    const distractors = unusedTiles.filter((t) => !targetLetters.includes(t.char));

    const toRemove = distractors.slice(0, 2);
    if (toRemove.length > 0) {
      const idsToRemove = toRemove.map((t) => t.id);
      setLetterBank((prev) => prev.filter((t) => !idsToRemove.includes(t.id)));
      setHintsUsedThisWord((h) => h + 1);
    }
  };

  // Physical Keyboard listener for desktop typers
  useEffect(() => {
    if (!isOpen || isAnswerChecked || isDirectTypingMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses inside input elements
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();

      if (key === "BACKSPACE") {
        e.preventDefault();
        handleDeleteLastSlot();
      } else if (key === "ENTER") {
        e.preventDefault();
        const fullWord = slottedTiles.map((t) => t?.char || "").join("");
        handleValidateAnswer(fullWord);
      } else if (/^[A-Z]$/.test(key)) {
        // Find unused tile in bank with this letter
        const matchingTile = letterBank.find((t) => !t.isUsed && t.char === key);
        if (matchingTile) {
          handleTileClickInBank(matchingTile);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isAnswerChecked, isDirectTypingMode, letterBank, slottedTiles, handleValidateAnswer]);

  // Next Word Navigation
  const handleNextWord = useCallback(() => {
    clearAutoTimer();
    playSoundTap();

    if (gameMode === "random") {
      const randomIndex = Math.floor(Math.random() * filteredItems.length);
      setCurrentIndex(randomIndex);
    } else if (currentIndex + 1 >= filteredItems.length) {
      playDynamicEchoFanfare(10, { isSessionVictory: true });
      triggerCelebrationEffect(sessionStreak, undefined, "¡SESIÓN COMPLETADA! 🏆");
      setIsSessionComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [clearAutoTimer, gameMode, currentIndex, filteredItems.length, sessionStreak, triggerCelebrationEffect]);

  // Restart Game / Round
  const handleRestart = () => {
    clearAutoTimer();
    playSoundTap();
    setCurrentIndex(0);
    setSessionStreak(0);
    setSolvedCount(0);
    setTimeLeft(60);
    setIsTimeRushActive(gameMode === "time_rush");
    setIsSessionComplete(false);
    initializeLetterBank(filteredItems[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto select-none">
      <motion.div
        ref={modalContainerRef}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Custom Particle Celebration Overlay Canvas */}
        <VisualParticleCelebrationCanvas ref={celebrationCanvasRef} />

        {/* TOP BAR: GAME TITLE & CONTROLS */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/95 border-b border-slate-800/90 z-20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                  Adivina la Palabra
                </h2>
                <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentItem.cefrLevel} • {currentItem.difficulty}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Observa la imagen y deletrea el término en inglés
              </p>
            </div>
          </div>

          {/* Stat Pills & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
                sessionStreak > 0
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse"
                  : "bg-slate-800/80 border-slate-700 text-slate-400"
              }`}
            >
              <Flame
                className={`w-4 h-4 ${
                  sessionStreak > 0 ? "text-amber-400 fill-amber-400" : "text-slate-400"
                }`}
              />
              <span>{sessionStreak}</span>
            </div>

            {/* Session XP */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-black text-sky-300">
              <Trophy className="w-4 h-4 text-sky-400" />
              <span>+{sessionScore} XP</span>
            </div>

            {/* Time Rush Timer (If active) */}
            {gameMode === "time_rush" && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${
                  timeLeft <= 10
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-300 animate-bounce"
                    : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                clearAutoTimer();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition"
              title="Cerrar juego"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* SUB-HEADER: CATEGORY PILLS & GAME MODES */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none z-10">
          {/* Category Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            {GUESS_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playSoundTap();
                    setSelectedCategory(cat.id);
                    setCurrentIndex(0);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-102"
                      : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Mode Toggles */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                playSoundTap();
                setGameMode((m) => (m === "random" ? "standard" : "random"));
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                gameMode === "random"
                  ? "bg-purple-600/30 border-purple-500 text-purple-200"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title="Modo Aleatorio"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Aleatorio</span>
            </button>

            <button
              onClick={() => {
                playSoundTap();
                setIsDirectTypingMode((prev) => !prev);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isDirectTypingMode
                  ? "bg-sky-600/30 border-sky-500 text-sky-200"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title="Modo Teclado Directo"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isDirectTypingMode ? "Teclado ON" : "Deletreo"}
              </span>
            </button>
          </div>
        </div>

        {/* MAIN GAME BODY */}
        {!isSessionComplete ? (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-between gap-4 sm:gap-6 z-10">
            
            {/* AVATAR COMPANION BANNER */}
            {avatarConfig && (
              <div className="w-full max-w-lg flex items-center gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-lg">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-teal-400 p-0.5 shrink-0 shadow-md overflow-hidden">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] overflow-hidden flex items-center justify-center relative">
                    {avatarConfig.avatarType === "2d" ? (
                      <Avatar2DCanvas
                        config={avatarConfig}
                        animationState={avatarAnimationState}
                        className="w-full h-full scale-125"
                      />
                    ) : (
                      <AvatarCanvas
                        config={avatarConfig}
                        animationState={avatarAnimationState}
                        isCompact={true}
                        className="w-full h-full scale-125"
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      {avatarConfig.name || "Compañero"}
                    </span>
                    {avatarReaction.mood === "praising" && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        ¡Celebrando!
                      </span>
                    )}
                    {avatarReaction.mood === "support" && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        Pista del Avatar
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-medium line-clamp-2">
                    {avatarReaction.message}
                  </div>
                </div>
              </div>
            )}

            {/* 1. VISUAL IMAGE & CLUE CONTAINER */}
            <div className="w-full max-w-lg flex flex-col items-center gap-3">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-700/80 shadow-xl group">
                
                {/* Image or Emoji Fallback */}
                {!imageError ? (
                  <img
                    src={currentItem.imageUrl}
                    alt={currentItem.word}
                    referrerPolicy="no-referrer"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 gap-3">
                    <span className="text-7xl sm:text-8xl">{currentItem.emoji}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      {currentItem.categoryName}
                    </span>
                  </div>
                )}

                {/* Gradient Shading Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 pointer-events-none" />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 shadow-md">
                  <span>{currentItem.categoryEmoji}</span>
                  <span>{currentItem.categoryName}</span>
                </div>

                {/* Top Audio Speaker Button */}
                <button
                  type="button"
                  onClick={() => speakWord(currentItem.word)}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 backdrop-blur-md border border-white/20 text-slate-200 transition shadow-md active:scale-95 cursor-pointer"
                  title="Escuchar pronunciación"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Bottom Translation Clue Bar */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Traducción:
                    </span>
                    <span className="text-xs sm:text-sm font-black text-amber-300">
                      {currentItem.spanishTranslation}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400 font-mono">
                    {currentItem.word.length} letras
                  </span>
                </div>
              </div>

              {/* Optional Hint Banner / Context Clue */}
              {showHintExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold mb-0.5">Pista:</p>
                    <p className="text-amber-100/90 leading-relaxed">{currentItem.hint}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 2. LETTER SLOTS (Target Word Placeholder) */}
            <div
              className={`w-full max-w-xl flex flex-col items-center gap-4 transition-transform ${
                isShaking ? "animate-shake" : ""
              }`}
            >
              {/* Slotted Letters Display */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {Array.from({ length: currentItem.word.length }).map((_, slotIdx) => {
                  const slotted = slottedTiles?.[slotIdx] ?? null;
                  const isFilled = Boolean(slotted);
                  const isCorrectState = isAnswerChecked && isCorrect;

                  return (
                    <motion.button
                      key={`slot-${slotIdx}`}
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleSlotClick(slotIdx)}
                      className={`w-11 h-13 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center text-xl sm:text-2xl font-black transition-all cursor-pointer select-none shadow-md ${
                        isCorrectState
                          ? "bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-300 text-slate-950 shadow-emerald-500/40 scale-105"
                          : isFilled
                          ? slotted?.isHintRevealed
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/20"
                            : "bg-slate-800 border-indigo-500/80 text-white shadow-indigo-500/20 hover:border-rose-400"
                          : "bg-slate-950/80 border-slate-700/80 text-slate-600 border-dashed hover:border-slate-500"
                      }`}
                    >
                      {isFilled && slotted ? (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          {slotted.char}
                        </motion.span>
                      ) : (
                        <span className="text-slate-600 text-base">•</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Direct Keyboard Input Alternative (if enabled) */}
              {isDirectTypingMode && (
                <div className="w-full max-w-md flex items-center gap-2 mt-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={directInputText}
                    onChange={(e) => setDirectInputText(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleValidateAnswer(directInputText);
                      }
                    }}
                    placeholder="Escribe la palabra aquí..."
                    maxLength={currentItem.word.length}
                    autoFocus
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border-2 border-slate-700 focus:border-amber-400 text-white text-center font-black tracking-widest text-lg outline-none uppercase placeholder:text-slate-600"
                  />
                  <button
                    onClick={() => handleValidateAnswer(directInputText)}
                    disabled={directInputText.length === 0}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-sm shadow-md transition active:scale-95"
                  >
                    Comprobar
                  </button>
                </div>
              )}
            </div>

            {/* 3. LETTER BANK & INTERACTIVE TOOLS */}
            {!isDirectTypingMode && (
              <div className="w-full max-w-xl flex flex-col items-center gap-3.5">
                {/* Scrambled Letter Tiles */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-inner max-w-lg">
                  {letterBank.map((tile) => {
                    return (
                      <motion.button
                        key={tile.id}
                        type="button"
                        whileHover={!tile.isUsed ? { scale: 1.08, y: -2 } : {}}
                        whileTap={!tile.isUsed ? { scale: 0.92 } : {}}
                        disabled={tile.isUsed || isAnswerChecked}
                        onClick={(e) => handleTileClickInBank(tile, e)}
                        className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl font-black text-lg sm:text-xl flex items-center justify-center transition-all select-none shadow-sm ${
                          tile.isUsed
                            ? "opacity-20 bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed scale-90"
                            : "bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-slate-600/80 text-white shadow-md active:scale-95 cursor-pointer hover:border-amber-400/80"
                        }`}
                      >
                        {tile.char}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Helper Action Buttons */}
                <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
                  {/* Shuffle Button */}
                  <button
                    type="button"
                    onClick={handleShuffleBank}
                    className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold flex items-center gap-1.5 transition active:scale-95"
                    title="Mezclar letras"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mezclar</span>
                  </button>

                  {/* Backspace Button */}
                  <button
                    type="button"
                    onClick={handleDeleteLastSlot}
                    className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold flex items-center gap-1.5 transition active:scale-95"
                    title="Borrar última letra"
                  >
                    <Delete className="w-3.5 h-3.5 text-rose-400" />
                    <span>Borrar</span>
                  </button>

                  {/* Clear All Slots */}
                  <button
                    type="button"
                    onClick={handleClearSlots}
                    className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold flex items-center gap-1.5 transition active:scale-95"
                    title="Reiniciar letras"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Limpiar</span>
                  </button>

                  {/* Hint: Reveal Letter */}
                  <button
                    type="button"
                    onClick={handleRevealLetterHint}
                    className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 transition active:scale-95"
                    title="Revelar una letra"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Revelar Letra</span>
                  </button>

                  {/* Hint: Remove Distractors */}
                  <button
                    type="button"
                    onClick={handleRemoveDistractorHint}
                    className="px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 font-bold flex items-center gap-1.5 transition active:scale-95"
                    title="Eliminar 2 letras sobrantes"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Descartar 2</span>
                  </button>

                  {/* Hint: Clue description */}
                  <button
                    type="button"
                    onClick={() => setShowHintExplanation((prev) => !prev)}
                    className="px-3 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 font-bold flex items-center gap-1.5 transition active:scale-95"
                    title="Ver pista en texto"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                    <span>Pista Texto</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. SUCCESS CELEBRATION FOOTER BANNER */}
            <AnimatePresence>
              {isAnswerChecked && isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="w-full max-w-xl p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/60 shadow-2xl flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-white">
                            {currentItem.word}
                          </h3>
                          <span className="text-xs text-emerald-300 font-mono">
                            {currentItem.phoneticIpa}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {currentItem.spanishTranslation} • {currentItem.spanishSentence}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakWord(currentItem.word)}
                      className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 transition"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Trivia Fun Fact */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/30 text-[11px] text-emerald-200/90 leading-relaxed">
                    <span className="font-bold text-amber-300">💡 Sabías que: </span>
                    {currentItem.funFact}
                  </div>

                  {/* Next Button with Countdown */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleNextWord}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <span>Siguiente Palabra</span>
                      {autoAdvanceCountdown !== null && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-950/20 text-slate-950 text-xs font-mono">
                          ({autoAdvanceCountdown}s)
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ) : (
          /* SESSION / ROUND SUMMARY SCREEN WITH 3D AVATAR CELEBRATION DANCE */
          <div className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-5 z-10 max-w-xl mx-auto">
            {/* 3D Avatar Victory Podium */}
            {avatarConfig && (
              <div className="relative w-full max-w-xs h-56 sm:h-64 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col items-center justify-center p-2">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating Confetti Badges */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Danza de Victoria</span>
                </div>

                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  <span>¡Celebrando!</span>
                </div>

                {/* Avatar Canvas Render */}
                <div className="w-full h-full relative z-10 flex items-center justify-center">
                  {avatarConfig.avatarType === "2d" ? (
                    <Avatar2DCanvas
                      config={avatarConfig}
                      animationState={avatarAnimationState}
                      className="w-full h-full"
                    />
                  ) : (
                    <AvatarCanvas
                      config={avatarConfig}
                      animationState={avatarAnimationState}
                      isCompact={false}
                      className="w-full h-full"
                    />
                  )}
                </div>

                {/* Pedestal Glow Base */}
                <div className="absolute bottom-1 w-40 h-5 bg-gradient-to-r from-amber-500/30 via-emerald-400/40 to-teal-400/30 blur-md rounded-full pointer-events-none" />
              </div>
            )}

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center justify-center gap-2">
                <span>¡Ronda Completada!</span>
                <span>🎉</span>
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                Has demostrado gran dominio ortográfico y vocabulario visual en inglés.
              </p>
            </div>

            {/* Stats Overview Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold mb-0.5">Aciertos</span>
                <span className="text-2xl font-black text-emerald-400">{solvedCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold mb-0.5">XP Ganado</span>
                <span className="text-2xl font-black text-amber-400">+{sessionScore}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold mb-0.5">Racha Máx.</span>
                <span className="text-2xl font-black text-sky-400">{sessionStreak}🔥</span>
              </div>
            </div>

            {/* Restart or Change Category */}
            <div className="flex items-center gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={handleRestart}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jugar Otra Ronda</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  clearAutoTimer();
                  onClose();
                }}
                className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
