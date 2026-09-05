import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Flame,
  Award,
  Layers,
  ArrowRight,
  Eye,
  Grid,
  Zap,
  Bookmark,
  BookmarkCheck,
  Trophy,
  VolumeX,
  HelpCircle,
  ChevronRight,
  Play,
  Clock,
  Sparkle,
  Music,
  SpellCheck,
  Delete,
  Trash2,
  Shuffle,
  Wand2,
  Lightbulb,
  Keyboard,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { AvatarAnimationState, AvatarConfig } from "../types";
import { speakText, stopSpeaking } from "../utils/speech";
import { evaluatePhrasePronunciation } from "../utils/pronunciationMatcher";
import { AvatarCanvas } from "./AvatarCanvas";
import { Avatar2DCanvas } from "./Avatar2DCanvas";
import {
  VISUAL_ITEMS,
  VISUAL_CATEGORIES,
  VisualChallengeItem,
} from "../data/visualQuizData";
import {
  playSoundCorrect,
  playSoundWrong,
  playSoundTap,
  playSoundLevelComplete,
} from "../utils/visualSoundEffects";
import { SmartVisualCard } from "./SmartVisualCard";
import {
  VisualParticleCelebrationCanvas,
  VisualParticleCelebrationRef,
} from "./VisualParticleCelebrationCanvas";

export type VisualGameMode = "match" | "spelling" | "four_grid" | "look_speak" | "sentence_builder";

export interface SpellingTile {
  id: string;
  char: string;
  isUsed: boolean;
  isRevealed?: boolean;
}

export interface VisualLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarConfig: AvatarConfig;
  onSaveVocabulary?: (vocab: {
    word: string;
    meaning: string;
    ipa?: string;
    example?: string;
    category?: string;
  }) => void;
  onRewardXp?: (xp: number, gems: number) => void;
}

export function VisualLearningModal({
  isOpen,
  onClose,
  avatarConfig,
  onSaveVocabulary,
  onRewardXp,
}: VisualLearningModalProps) {
  // State: Game Mode & Filters
  const [activeMode, setActiveMode] = useState<VisualGameMode>("match");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtered Items
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return VISUAL_ITEMS;
    return VISUAL_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const currentItem: VisualChallengeItem =
    filteredItems[currentIndex % filteredItems.length] || VISUAL_ITEMS[0];

  // Match Options generation (current word + 3 distractors shuffled)
  const matchOptions = useMemo(() => {
    return [currentItem.englishWord, ...currentItem.distractors].sort(
      () => Math.random() - 0.5
    );
  }, [currentItem]);

  // Game Progress & Stats
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [gemsEarned, setGemsEarned] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Current Question State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFunFact, setShowFunFact] = useState(false);
  const [isSavedInVocab, setIsSavedInVocab] = useState(false);

  // Auto-advance state & timer
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 4-Grid Mode State
  const [fourGridItems, setFourGridItems] = useState<VisualChallengeItem[]>([]);
  const [selectedGridId, setSelectedGridId] = useState<string | null>(null);

  // Mode 2: Spelling & Writing Game State
  const [spellingBank, setSpellingBank] = useState<SpellingTile[]>([]);
  const [spellingSlots, setSpellingSlots] = useState<(SpellingTile | null)[]>([]);
  const [spellingDirectInput, setSpellingDirectInput] = useState("");
  const [isDirectTyping, setIsDirectTyping] = useState(false);
  const [spellingShaking, setSpellingShaking] = useState(false);
  const spellingInputRef = useRef<HTMLInputElement | null>(null);

  // Look & Speak Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [speechConfidence, setSpeechConfidence] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sentence Builder State
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  // Avatar Companion Reaction State
  const [avatarAnimationState, setAvatarAnimationState] = useState<AvatarAnimationState>("idle");
  const [avatarReaction, setAvatarReaction] = useState<{
    mood: "happy" | "thinking" | "praising" | "support" | "dancing" | "idle";
    message: string;
  }>({
    mood: "idle",
    message: "¡Vamos a aprender inglés asociando imágenes reales!",
  });

  // Level Complete Summary
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [danceIntensity, setDanceIntensity] = useState<"normal" | "turbo">("normal");

  // Inactivity / Idle Support Timer (Shows visual encouragement when user takes time)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (isAnswerChecked || isSessionComplete) return;

    idleTimerRef.current = setTimeout(() => {
      setAvatarAnimationState("pensativo");
      let supportMsg = "💡 ¡Toma tu tiempo! Observa con atención los detalles de la foto...";
      if (activeMode === "match") {
        supportMsg = `💡 Observa "${currentItem.spanishTranslation}". ¿Recuerdas cómo se escribe o pronuncia?`;
      } else if (activeMode === "spelling") {
        supportMsg = `💡 Observa "${currentItem.spanishTranslation}". La palabra empieza por "${currentItem.englishWord.charAt(0).toUpperCase()}". ¡Pulsa "Pista" si necesitas ayuda!`;
      } else if (activeMode === "four_grid") {
        supportMsg = "👂 Pulsa el botón de sonido 🔊 para volver a escuchar la pronunciación nativa.";
      } else if (activeMode === "look_speak") {
        supportMsg = "🎙️ ¡Sin miedo! Respira hondo, toca el micrófono y di la palabra con calma.";
      } else if (activeMode === "sentence_builder") {
        supportMsg = "🧩 Intenta buscar primero el sujeto o la primera palabra de la frase.";
      }

      setAvatarReaction({
        mood: "support",
        message: supportMsg,
      });
    }, 7000);
  }, [isAnswerChecked, isSessionComplete, activeMode, currentItem]);

  // References for Canvas Particle Layer & Origin Tracking
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const celebrationCanvasRef = useRef<VisualParticleCelebrationRef | null>(null);
  const lastTargetCoordsRef = useRef<{ clientX: number; clientY: number } | null>(null);

  // Clear auto-advance timer safely
  const clearAutoTimer = useCallback(() => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoAdvanceCountdown(null);
  }, []);

  // Multi-style celebration confetti and particle burst helper
  const triggerCelebrationEffect = useCallback(
    (
      streakLevel = 1,
      customOrigin?: { clientX: number; clientY: number },
      badgeText?: string
    ) => {
      try {
        const originCoords = customOrigin || lastTargetCoordsRef.current;
        let relX = 350;
        let relY = 250;
        let normNormX = 0.5;
        let normNormY = 0.55;

        if (originCoords) {
          normNormX = Math.max(0.1, Math.min(0.9, originCoords.clientX / window.innerWidth));
          normNormY = Math.max(0.1, Math.min(0.9, originCoords.clientY / window.innerHeight));

          if (modalContainerRef.current) {
            const rect = modalContainerRef.current.getBoundingClientRect();
            relX = originCoords.clientX - rect.left;
            relY = originCoords.clientY - rect.top;
          }
        } else if (modalContainerRef.current) {
          const rect = modalContainerRef.current.getBoundingClientRect();
          relX = rect.width / 2;
          relY = rect.height * 0.45;
        }

        // 1. Trigger custom floating particle canvas burst (stars, sparkles, shockwaves, XP pill)
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

        // 2. Confetti Explosion with accurate origin tracking
        const styles = ["radial_blast", "dual_cannons", "star_shower"];
        const chosenStyle = styles[streakLevel % styles.length];

        if (chosenStyle === "dual_cannons") {
          // Dual side cannons
          confetti({
            particleCount: 35,
            angle: 60,
            spread: 55,
            origin: { x: Math.max(0.05, normNormX - 0.2), y: normNormY },
            colors: ["#34d399", "#fbbf24", "#38bdf8", "#f43f5e"],
          });
          confetti({
            particleCount: 35,
            angle: 120,
            spread: 55,
            origin: { x: Math.min(0.95, normNormX + 0.2), y: normNormY },
            colors: ["#34d399", "#fbbf24", "#38bdf8", "#f43f5e"],
          });
        } else if (chosenStyle === "star_shower") {
          // Star shower
          confetti({
            particleCount: 45,
            spread: 80,
            origin: { x: normNormX, y: Math.max(0.15, normNormY - 0.05) },
            shapes: ["star", "circle"],
            colors: ["#fbbf24", "#f59e0b", "#34d399", "#a855f7"],
          });
        } else {
          // Radial blast from exact click location
          confetti({
            particleCount: 50,
            spread: 75,
            origin: { x: normNormX, y: normNormY },
            colors: ["#38bdf8", "#4ade80", "#fbbf24", "#f43f5e", "#a855f7"],
          });
        }
      } catch {}
    },
    []
  );

  // --- ADVANCE TO NEXT QUESTION ---
  const handleNextQuestion = useCallback(() => {
    clearAutoTimer();
    playSoundTap();
    if (currentIndex + 1 >= filteredItems.length) {
      playSoundLevelComplete();
      triggerCelebrationEffect(4, undefined, "¡NIVEL COMPLETADO! 🏆");
      setAvatarAnimationState("celebrating");
      setAvatarReaction({
        mood: "dancing",
        message: "🎉 ¡Victoria magistral! Has superado todas las pruebas visuales.",
      });
      setIsSessionComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [clearAutoTimer, currentIndex, filteredItems.length, triggerCelebrationEffect]);

  // Schedule auto-advance upon winning (1.5 seconds)
  const scheduleAutoAdvance = useCallback(
    (delayMs = 1500) => {
      clearAutoTimer();
      setAutoAdvanceCountdown(1.5);

      const startTime = Date.now();
      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (delayMs - elapsed) / 1000);
        setAutoAdvanceCountdown(parseFloat(remaining.toFixed(1)));
        if (remaining <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }
      }, 50);

      autoNextTimerRef.current = setTimeout(() => {
        handleNextQuestion();
      }, delayMs);
    },
    [clearAutoTimer, handleNextQuestion]
  );

  // Setup current item & question whenever index, mode or category changes
  useEffect(() => {
    if (!isOpen) return;

    clearAutoTimer();
    setSelectedOption(null);
    setSelectedGridId(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setShowFunFact(false);
    setIsSavedInVocab(false);
    setSpeechTranscript("");
    setSpeechConfidence(null);
    setAvatarAnimationState("idle");

    // Setup Spelling Mode Tiles
    const rawWord = currentItem.englishWord.toUpperCase().trim();
    const letters = rawWord.split("");
    const distractorPool = ["A", "E", "I", "O", "U", "S", "T", "R", "N", "L", "M", "P", "D", "C", "H", "B"]
      .filter((l) => !letters.includes(l))
      .sort(() => Math.random() - 0.5);
    const extraCount = Math.min(4, Math.max(2, 10 - letters.length));
    const distractorLetters = distractorPool.slice(0, extraCount);
    const combined = [...letters, ...distractorLetters].sort(() => Math.random() - 0.5);
    const tiles: SpellingTile[] = combined.map((char, i) => ({
      id: `sp-tile-${char}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      char,
      isUsed: false,
    }));
    setSpellingBank(tiles);
    setSpellingSlots(new Array(letters.length).fill(null));
    setSpellingDirectInput("");
    setSpellingShaking(false);

    // Setup 4-Grid Items (Current item + 3 random distinct distractors)
    const otherItems = VISUAL_ITEMS.filter((i) => i.id !== currentItem.id);
    const shuffledOthers = [...otherItems].sort(() => Math.random() - 0.5);
    const gridSelection = [currentItem, ...shuffledOthers.slice(0, 3)].sort(
      () => Math.random() - 0.5
    );
    setFourGridItems(gridSelection);

    // Setup Sentence Builder scrambled tokens
    const tokens = [...currentItem.sentenceBuilder.tokens].sort(
      () => Math.random() - 0.5
    );
    setAvailableTokens(tokens);
    setSelectedTokens([]);

    // Speak prompt if in 4-grid mode
    if (activeMode === "four_grid") {
      speakText(currentItem.englishWord, avatarConfig, () => {}, () => {}, () => {}, {
        rateMultiplier: 0.92,
      });
      setAvatarReaction({
        mood: "thinking",
        message: `Escucha atentamente: "${currentItem.englishWord}". ¿Cuál es la imagen correcta?`,
      });
    } else if (activeMode === "spelling") {
      setAvatarReaction({
        mood: "idle",
        message: `Observa la foto de "${currentItem.spanishTranslation}". ¡Escribe o deletrea su nombre en inglés!`,
      });
    } else {
      setAvatarReaction({
        mood: "idle",
        message: `Observa la imagen. ¿Cómo se dice en inglés?`,
      });
    }

    resetIdleTimer();
  }, [currentIndex, activeMode, selectedCategory, isOpen, clearAutoTimer, resetIdleTimer]);

  // Cleanups on unmount
  useEffect(() => {
    return () => {
      clearAutoTimer();
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopSpeaking();
    };
  }, [clearAutoTimer]);

  // Sound & Speech Helpers
  const handlePlayWordAudio = (word: string = currentItem.englishWord) => {
    playSoundTap();
    resetIdleTimer();
    setAvatarAnimationState("speaking");
    speakText(word, avatarConfig, () => {}, () => {}, () => {
      setAvatarAnimationState("idle");
    }, {
      rateMultiplier: 0.9,
    });
  };

  const handlePlaySentenceAudio = () => {
    playSoundTap();
    resetIdleTimer();
    setAvatarAnimationState("speaking");
    speakText(
      currentItem.sentenceBuilder.targetSentence,
      avatarConfig,
      () => {},
      () => {},
      () => {
        setAvatarAnimationState("idle");
      },
      { rateMultiplier: 0.9 }
    );
  };

  // --- 1. PICTURE MATCH MODE SUBMISSION ---
  const handleOptionSelect = (option: string, e?: React.MouseEvent) => {
    if (isAnswerChecked) return;
    resetIdleTimer();
    const clickCoords = e ? { clientX: e.clientX, clientY: e.clientY } : undefined;
    if (clickCoords) {
      lastTargetCoordsRef.current = clickCoords;
    }
    playSoundTap();
    setSelectedOption(option);

    // Instant validation on selection for seamless frictionless gameplay
    const correct = option === currentItem.englishWord;
    setIsAnswerChecked(true);
    setIsCorrect(correct);
    setTotalAnswered((prev) => prev + 1);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
      const xpGained = 15 + Math.min(10, newStreak * 2);
      const gemsGained = newStreak % 3 === 0 ? 3 : 1;
      setScore((prev) => prev + xpGained);
      setGemsEarned((prev) => prev + gemsGained);
      onRewardXp?.(xpGained, gemsGained);

      playSoundCorrect(newStreak);
      triggerCelebrationEffect(
        newStreak,
        clickCoords || lastTargetCoordsRef.current || undefined,
        `+${xpGained} XP 🔥 x${newStreak}`
      );

      setAvatarAnimationState(newStreak >= 3 ? "celebrating" : "alegre");
      setAvatarReaction({
        mood: "praising",
        message: `¡Brillante! "${currentItem.englishWord}" es exactamente correcto. 🔥 Racha x${newStreak}`,
      });
      handlePlayWordAudio(currentItem.englishWord);

      // Auto-advance in 1.5s
      scheduleAutoAdvance(1500);
    } else {
      clearAutoTimer();
      setStreak(0);
      playSoundWrong();
      setAvatarAnimationState("encouraging");
      setAvatarReaction({
        mood: "thinking",
        message: `Casi. La respuesta correcta es "${currentItem.englishWord}". ¡Escucha su pronunciación!`,
      });
      handlePlayWordAudio(currentItem.englishWord);
    }
  };

  const handleCheckMatch = (e?: React.MouseEvent) => {
    if (!selectedOption || isAnswerChecked) return;
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (e && !lastTargetCoordsRef.current) {
      lastTargetCoordsRef.current = { clientX: e.clientX, clientY: e.clientY };
    }

    const correct = selectedOption === currentItem.englishWord;
    setIsAnswerChecked(true);
    setIsCorrect(correct);
    setTotalAnswered((prev) => prev + 1);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
      const xpGained = 15 + Math.min(10, newStreak * 2);
      const gemsGained = newStreak % 3 === 0 ? 3 : 1;
      setScore((prev) => prev + xpGained);
      setGemsEarned((prev) => prev + gemsGained);
      onRewardXp?.(xpGained, gemsGained);

      playSoundCorrect(newStreak);
      triggerCelebrationEffect(
        newStreak,
        lastTargetCoordsRef.current || undefined,
        `+${xpGained} XP 🔥 x${newStreak}`
      );

      setAvatarAnimationState(newStreak >= 3 ? "celebrating" : "alegre");
      setAvatarReaction({
        mood: "praising",
        message: `¡Brillante! "${currentItem.englishWord}" es exactamente correcto. 🔥 Racha x${newStreak}`,
      });
      handlePlayWordAudio(currentItem.englishWord);

      // Auto-advance in 1.5s
      scheduleAutoAdvance(1500);
    } else {
      clearAutoTimer();
      setStreak(0);
      playSoundWrong();
      setAvatarAnimationState("encouraging");
      setAvatarReaction({
        mood: "thinking",
        message: `Casi. La respuesta correcta es "${currentItem.englishWord}". ¡Escucha su pronunciación!`,
      });
      handlePlayWordAudio(currentItem.englishWord);
    }
  };

  // --- 2. SPELLING & WRITING GAME HANDLERS ---
  const handleSpellingTileClick = (tile: SpellingTile, e?: React.MouseEvent) => {
    if (isAnswerChecked || tile.isUsed) return;
    playSoundTap();
    resetIdleTimer();

    const emptyIndex = spellingSlots.findIndex((s) => s === null);
    if (emptyIndex === -1) return;

    const nextSlots = [...spellingSlots];
    const placedTile: SpellingTile = { ...tile, isUsed: true };
    nextSlots[emptyIndex] = placedTile;

    const nextBank = spellingBank.map((t) =>
      t.id === tile.id ? { ...t, isUsed: true } : t
    );

    setSpellingSlots(nextSlots);
    setSpellingBank(nextBank);

    // If all slots are now filled, validate!
    const isFull = nextSlots.every((s) => s !== null);
    if (isFull) {
      const spelledWord = nextSlots.map((s) => s?.char || "").join("");
      handleCheckSpelling(spelledWord, e);
    }
  };

  const handleRemoveSpellingSlot = (index: number) => {
    if (isAnswerChecked) return;
    const slot = spellingSlots[index];
    if (!slot || slot.isRevealed) return;

    playSoundTap();
    resetIdleTimer();

    const nextSlots = [...spellingSlots];
    nextSlots[index] = null;

    const nextBank = spellingBank.map((t) =>
      t.id === slot.id ? { ...t, isUsed: false } : t
    );

    setSpellingSlots(nextSlots);
    setSpellingBank(nextBank);
  };

  const handleSpellingClear = () => {
    if (isAnswerChecked) return;
    playSoundTap();
    resetIdleTimer();

    const nextSlots = spellingSlots.map((s) => (s?.isRevealed ? s : null));
    const keptIds = new Set(nextSlots.filter(Boolean).map((s) => s!.id));

    setSpellingSlots(nextSlots);
    setSpellingBank((prev) =>
      prev.map((t) => (keptIds.has(t.id) ? t : { ...t, isUsed: false }))
    );
    setSpellingDirectInput("");
  };

  const handleSpellingBackspace = () => {
    if (isAnswerChecked) return;
    for (let i = spellingSlots.length - 1; i >= 0; i--) {
      if (spellingSlots[i] !== null && !spellingSlots[i]?.isRevealed) {
        handleRemoveSpellingSlot(i);
        break;
      }
    }
  };

  const handleSpellingShuffle = () => {
    if (isAnswerChecked) return;
    playSoundTap();
    resetIdleTimer();
    setSpellingBank((prev) => {
      const unused = prev.filter((t) => !t.isUsed).sort(() => Math.random() - 0.5);
      const used = prev.filter((t) => t.isUsed);
      return [...used, ...unused];
    });
  };

  const handleSpellingHint = () => {
    if (isAnswerChecked) return;
    playSoundTap();
    resetIdleTimer();

    const targetWord = currentItem.englishWord.toUpperCase().trim();
    const emptyIndex = spellingSlots.findIndex((s) => s === null);
    if (emptyIndex === -1) return;

    const targetChar = targetWord[emptyIndex];
    const matchTile = spellingBank.find((t) => !t.isUsed && t.char === targetChar);

    let tileToPlace: SpellingTile;
    let nextBank = [...spellingBank];

    if (matchTile) {
      tileToPlace = { ...matchTile, isUsed: true, isRevealed: true };
      nextBank = nextBank.map((t) =>
        t.id === matchTile.id ? { ...t, isUsed: true } : t
      );
    } else {
      tileToPlace = {
        id: `hint-tile-${targetChar}-${emptyIndex}`,
        char: targetChar,
        isUsed: true,
        isRevealed: true,
      };
    }

    const nextSlots = [...spellingSlots];
    nextSlots[emptyIndex] = tileToPlace;
    setSpellingSlots(nextSlots);
    setSpellingBank(nextBank);

    if (nextSlots.every((s) => s !== null)) {
      const spelledWord = nextSlots.map((s) => s?.char || "").join("");
      handleCheckSpelling(spelledWord);
    }
  };

  const handleSpellingDiscardDistractors = () => {
    if (isAnswerChecked) return;
    playSoundTap();
    resetIdleTimer();

    const targetLetters = currentItem.englishWord.toUpperCase().trim().split("");
    let discarded = 0;
    setSpellingBank((prev) =>
      prev.map((t) => {
        if (!t.isUsed && !targetLetters.includes(t.char) && discarded < 2) {
          discarded++;
          return { ...t, isUsed: true };
        }
        return t;
      })
    );
  };

  const handleCheckSpelling = (spelledWord: string, e?: React.MouseEvent) => {
    if (isAnswerChecked) return;
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    const clickCoords = e ? { clientX: e.clientX, clientY: e.clientY } : undefined;
    const targetWord = currentItem.englishWord.toUpperCase().trim();
    const cleanGuess = spelledWord.toUpperCase().trim();
    const isWin = cleanGuess === targetWord;

    setIsAnswerChecked(true);
    setIsCorrect(isWin);
    setTotalAnswered((prev) => prev + 1);

    if (isWin) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
      const xpGained = 25 + Math.min(15, newStreak * 3);
      const gemsGained = 3;
      setScore((prev) => prev + xpGained);
      setGemsEarned((prev) => prev + gemsGained);
      onRewardXp?.(xpGained, gemsGained);

      playSoundCorrect(newStreak);

      // Trigger rich particle animation: Custom canvas star burst + Confetti with stars
      triggerCelebrationEffect(
        newStreak,
        clickCoords,
        `+${xpGained} XP 🌟 ¡Deletreo Perfecto!`
      );

      setAvatarAnimationState(newStreak >= 3 ? "celebrating" : "alegre");
      setAvatarReaction({
        mood: "praising",
        message: `¡Excelente ortografía! "${currentItem.englishWord}" deletreado con total precisión. 🌟✨`,
      });

      handlePlayWordAudio(currentItem.englishWord);
      scheduleAutoAdvance(1500);
    } else {
      clearAutoTimer();
      setStreak(0);
      playSoundWrong();
      setSpellingShaking(true);
      setTimeout(() => setSpellingShaking(false), 600);
      setAvatarAnimationState("encouraging");
      setAvatarReaction({
        mood: "thinking",
        message: `¡Casi! La palabra correcta es "${currentItem.englishWord}". Revisa las letras o pulsa "Pista".`,
      });
      handlePlayWordAudio(currentItem.englishWord);
    }
  };

  // Keyboard shortcut listener for spelling mode
  useEffect(() => {
    if (!isOpen || activeMode !== "spelling" || isAnswerChecked || isDirectTyping) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        const tile = spellingBank.find((t) => !t.isUsed && t.char === key);
        if (tile) {
          handleSpellingTileClick(tile);
        }
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleSpellingBackspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const spelled = spellingSlots.map((s) => s?.char || "").join("");
        if (spelled.length === spellingSlots.length) {
          handleCheckSpelling(spelled);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeMode, isAnswerChecked, isDirectTyping, spellingBank, spellingSlots]);

  // --- 3. 4-GRID RUSH SUBMISSION ---
  const handleGridCardClick = (item: VisualChallengeItem, e?: React.MouseEvent) => {
    if (isAnswerChecked) return;
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    const clickCoords = e ? { clientX: e.clientX, clientY: e.clientY } : undefined;
    if (clickCoords) {
      lastTargetCoordsRef.current = clickCoords;
    }
    setSelectedGridId(item.id);
    const correct = item.id === currentItem.id;
    setIsAnswerChecked(true);
    setIsCorrect(correct);
    setTotalAnswered((prev) => prev + 1);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
      const xpGained = 20 + Math.min(10, newStreak * 2);
      const gemsGained = 2;
      setScore((prev) => prev + xpGained);
      setGemsEarned((prev) => prev + gemsGained);
      onRewardXp?.(xpGained, gemsGained);

      playSoundCorrect(newStreak);
      triggerCelebrationEffect(
        newStreak,
        clickCoords,
        `+${xpGained} XP 💎 +${gemsGained}`
      );

      setAvatarAnimationState(newStreak >= 3 ? "celebrating" : "alegre");
      setAvatarReaction({
        mood: "praising",
        message: `¡Excelente oído visual! "${currentItem.englishWord}" coincide perfectamente. 🎯`,
      });
      handlePlayWordAudio(currentItem.englishWord);

      // Auto-advance in 1.5s
      scheduleAutoAdvance(1500);
    } else {
      clearAutoTimer();
      setStreak(0);
      playSoundWrong();
      setAvatarAnimationState("encouraging");
      setAvatarReaction({
        mood: "thinking",
        message: `Has elegido "${item.englishWord}". La correcta era "${currentItem.englishWord}".`,
      });
      handlePlayWordAudio(currentItem.englishWord);
    }
  };

  // --- 3. LOOK & SPEAK VOICE RECOGNITION ---
  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAvatarReaction({
        mood: "thinking",
        message: "Tu navegador no soporta reconocimiento de voz nativo.",
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechTranscript("");
        setAvatarAnimationState("listening");
        setAvatarReaction({
          mood: "thinking",
          message: "🎙️ Te escucho... Pronuncia la palabra en voz alta y clara.",
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const confidence = Math.round((event.results[0][0].confidence || 0.85) * 100);
        setSpeechTranscript(transcript);
        setSpeechConfidence(confidence);
        handleEvaluateSpeech(transcript, confidence);
      };

      recognition.onerror = (e: any) => {
        setIsRecording(false);
        setAvatarAnimationState("encouraging");
        setAvatarReaction({
          mood: "thinking",
          message: "No pude escuchar con claridad. Intenta de nuevo hablando cerca del micrófono.",
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleEvaluateSpeech = (transcript: string, _confidence: number) => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    const target = currentItem.speechPrompt || currentItem.englishWord;
    const evalResult = evaluatePhrasePronunciation(transcript, target, 70);
    const score = Math.max(0, Math.min(100, evalResult.overallScore));
    const isPass = evalResult.isApproved;

    setIsAnswerChecked(true);
    setIsCorrect(isPass);
    setTotalAnswered((prev) => prev + 1);

    if (isPass) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
      const xpGained = 25 + Math.min(15, newStreak * 3);
      const gemsGained = 3;
      setScore((prev) => prev + xpGained);
      setGemsEarned((prev) => prev + gemsGained);
      onRewardXp?.(xpGained, gemsGained);

      playSoundCorrect(newStreak);
      triggerCelebrationEffect(
        newStreak,
        undefined,
        `+${xpGained} XP 🎙️ ${score}% Precisión`
      );

      setAvatarAnimationState(newStreak >= 3 ? "celebrating" : "alegre");
      setAvatarReaction({
        mood: "praising",
        message: `¡Pronunciación fantástica (${score}%)! Sonó como un nativo. 🎙️⭐`,
      });

      // Auto-advance in 1.5s
      scheduleAutoAdvance(1500);
    } else {
      clearAutoTimer();
      setStreak(0);
      playSoundWrong();
      setAvatarAnimationState("encouraging");
      setAvatarReaction({
        mood: "thinking",
        message: evalResult.feedback || `Escuché "${transcript}". La pronunciación objetivo es "${currentItem.englishWord}". ¡Escucha y repite!`,
      });
      handlePlayWordAudio(currentItem.englishWord);
    }
  };

  // --- 4. SENTENCE BUILDER PUZZLE ---
  const handleAddToken = (token: string, index: number) => {
    if (isAnswerChecked) return;
    resetIdleTimer();
    playSoundTap();
    const nextSelected = [...selectedTokens, token];
    const nextAvailable = availableTokens.filter((_, i) => i !== index);
    setSelectedTokens(nextSelected);
    setAvailableTokens(nextAvailable);

    // If all tokens placed, automatically evaluate immediately!
    if (nextAvailable.length === 0) {
      const userSentence = nextSelected.join(" ").trim();
      const target = currentItem.sentenceBuilder.targetSentence.trim();
      const cleanUser = userSentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
      const cleanTarget = target.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();

      if (cleanUser === cleanTarget) {
        setIsAnswerChecked(true);
        setIsCorrect(true);
        setTotalAnswered((prev) => prev + 1);

        const newStreak = streak + 1;
        setStreak(newStreak);
        setCorrectCount((prev) => prev + 1);
        const xpGained = 30 + Math.min(15, newStreak * 2);
        const gemsGained = 3;
        setScore((prev) => prev + xpGained);
        setGemsEarned((prev) => prev + gemsGained);
        onRewardXp?.(xpGained, gemsGained);

        playSoundCorrect(newStreak);
        triggerCelebrationEffect(
          newStreak,
          undefined,
          `+${xpGained} XP 🏆 Oración Perfecta`
        );

        setAvatarAnimationState(newStreak >= 3 ? "celebrating" : "alegre");
        setAvatarReaction({
          mood: "praising",
          message: `¡Estructura de oración perfecta! Dominas la sintaxis en contexto. 🏆`,
        });
        handlePlaySentenceAudio();

        // Auto-advance in 1.5s
        scheduleAutoAdvance(1500);
      }
    }
  };

  const handleRemoveToken = (token: string, index: number) => {
    if (isAnswerChecked) return;
    resetIdleTimer();
    playSoundTap();
    setSelectedTokens((prev) => prev.filter((_, i) => i !== index));
    setAvailableTokens((prev) => [...prev, token]);
  };

  const handleCheckSentence = (e?: React.MouseEvent) => {
    if (selectedTokens.length === 0 || isAnswerChecked) return;
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    const clickCoords = e ? { clientX: e.clientX, clientY: e.clientY } : undefined;
    const userSentence = selectedTokens.join(" ").trim();
    const target = currentItem.sentenceBuilder.targetSentence.trim();

    const cleanUser = userSentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
    const cleanTarget = target.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();

    const correct = cleanUser === cleanTarget;
    setIsAnswerChecked(true);
    setIsCorrect(correct);
    setTotalAnswered((prev) => prev + 1);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
      const xpGained = 30 + Math.min(15, newStreak * 2);
      const gemsGained = 3;
      setScore((prev) => prev + xpGained);
      setGemsEarned((prev) => prev + gemsGained);
      onRewardXp?.(xpGained, gemsGained);

      playSoundCorrect(newStreak);
      triggerCelebrationEffect(
        newStreak,
        clickCoords,
        `+${xpGained} XP 🏆 Oración Perfecta`
      );

      setAvatarAnimationState(newStreak >= 3 ? "celebrating" : "alegre");
      setAvatarReaction({
        mood: "praising",
        message: `¡Estructura de oración perfecta! Dominas la sintaxis en contexto. 🏆`,
      });
      handlePlaySentenceAudio();

      // Auto-advance in 1.5s
      scheduleAutoAdvance(1500);
    } else {
      clearAutoTimer();
      setStreak(0);
      playSoundWrong();
      setAvatarAnimationState("encouraging");
      setAvatarReaction({
        mood: "thinking",
        message: `El orden correcto es: "${target}". ¡Escucha cómo suena!`,
      });
      handlePlaySentenceAudio();
    }
  };

  // --- SAVE FLASHCARD ACTION ---
  const handleSaveToFlashcards = () => {
    playSoundTap();
    setIsSavedInVocab(true);
    onSaveVocabulary?.({
      word: currentItem.englishWord,
      meaning: currentItem.spanishTranslation,
      ipa: currentItem.phoneticIpa,
      example: currentItem.sentenceBuilder.targetSentence,
      category: currentItem.category,
    });
    setAvatarReaction({
      mood: "happy",
      message: `¡Guardado en tus Flashcards SRS! La repasarás en el momento óptimo para memorizarla. 📚`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <motion.div
        ref={modalContainerRef}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Custom Particle Celebration Overlay Canvas */}
        <VisualParticleCelebrationCanvas ref={celebrationCanvasRef} />

        {/* TOP BAR: GAME STATS & CLOSE */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  Aventura Visual <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Estilo Duolingo Pro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aprende asociando imágenes reales en alta resolución
              </p>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-bold text-xs sm:text-sm">
              <Flame className={`w-4 h-4 text-amber-400 ${streak > 0 ? "animate-bounce" : ""}`} />
              <span>{streak}</span>
              {streak >= 3 && (
                <span className="hidden md:inline text-[10px] text-amber-300 font-normal">
                  ({(1 + streak * 0.1).toFixed(1)}x XP)
                </span>
              )}
            </div>

            {/* Gems counter */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 font-bold text-xs sm:text-sm">
              <span>💎</span>
              <span>{gemsEarned}</span>
            </div>

            {/* Score / XP */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold text-xs">
              <Award className="w-3.5 h-3.5" />
              <span>+{score} XP</span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                clearAutoTimer();
                playSoundTap();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Cerrar Aventura Visual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GAME MODE TABS */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clearAutoTimer();
                playSoundTap();
                setActiveMode("match");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeMode === "match"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>1. Imagen & Opción</span>
            </button>

            <button
              onClick={() => {
                clearAutoTimer();
                playSoundTap();
                setActiveMode("spelling");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeMode === "spelling"
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 font-bold"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <SpellCheck className="w-3.5 h-3.5" />
              <span>2. Deletrea & Escribe</span>
            </button>

            <button
              onClick={() => {
                clearAutoTimer();
                playSoundTap();
                setActiveMode("four_grid");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeMode === "four_grid"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>3. Escucha & 4 Fotos</span>
            </button>

            <button
              onClick={() => {
                clearAutoTimer();
                playSoundTap();
                setActiveMode("look_speak");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeMode === "look_speak"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 font-bold"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>4. Mira & Pronuncia</span>
            </button>

            <button
              onClick={() => {
                clearAutoTimer();
                playSoundTap();
                setActiveMode("sentence_builder");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeMode === "sentence_builder"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 font-bold"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>5. Arma la Oración</span>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span>
              Reto {currentIndex + 1} de {filteredItems.length}
            </span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    ((currentIndex + 1) / filteredItems.length) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="px-4 sm:px-6 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">
            Categorías:
          </span>
          {VISUAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                clearAutoTimer();
                playSoundTap();
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? "bg-slate-700 text-amber-300 border border-amber-400/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* MAIN GAME BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* SESSION COMPLETE VICTORY VIEW WITH 3D AVATAR DANCE */}
          {isSessionComplete ? (
            <div className="py-6 px-4 text-center space-y-6 max-w-xl mx-auto">
              {/* 3D AVATAR CELEBRATION PODIUM */}
              <div className="relative w-full max-w-sm mx-auto h-64 sm:h-72 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col items-center justify-center p-2">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating Confetti Badges */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Danza de Victoria 3D</span>
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <Music className="w-3.5 h-3.5" />
                  <span>Celebrando</span>
                </div>

                {/* Avatar Canvas Render */}
                <div className="w-full h-full relative z-10 flex items-center justify-center">
                  {avatarConfig?.avatarType === "2d" ? (
                    <Avatar2DCanvas
                      config={avatarConfig}
                      animationState={avatarAnimationState}
                      className="w-full h-full"
                    />
                  ) : (
                    avatarConfig && (
                      <AvatarCanvas
                        config={avatarConfig}
                        animationState={avatarAnimationState}
                        isCompact={false}
                        className="w-full h-full"
                      />
                    )
                  )}
                </div>

                {/* Pedestal Glow Base */}
                <div className="absolute bottom-2 w-48 h-6 bg-gradient-to-r from-amber-500/30 via-emerald-400/40 to-cyan-400/30 blur-md rounded-full pointer-events-none" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-2">
                  <span>¡Sesión Visual Completada!</span>
                  <span>🎉</span>
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Tu avatar está bailando de emoción por tu maestría visual en inglés.
                </p>
              </div>

              {/* Stats Summary Card */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-center shadow-lg">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Aciertos</div>
                  <div className="text-xl font-black text-emerald-400">
                    {correctCount}/{totalAnswered}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">XP Total</div>
                  <div className="text-xl font-black text-amber-400">+{score}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Gemas</div>
                  <div className="text-xl font-black text-cyan-300">+{gemsEarned} 💎</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    playSoundTap();
                    setIsSessionComplete(false);
                    setCurrentIndex(0);
                    setStreak(0);
                    setAvatarAnimationState("idle");
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Jugar Otra Ronda</span>
                </button>
                <button
                  onClick={() => {
                    clearAutoTimer();
                    onClose();
                  }}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
                >
                  Cerrar & Volver al Menú
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* COMPANION REACTION BUBBLE WITH LIVE MINI AVATAR */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/70 border border-slate-700/70 rounded-2xl shadow-md">
                {/* Mini Live Avatar Stage */}
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shrink-0 shadow-lg overflow-hidden">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] overflow-hidden flex items-center justify-center relative">
                    {avatarConfig?.avatarType === "2d" ? (
                      <Avatar2DCanvas
                        config={avatarConfig}
                        animationState={avatarAnimationState}
                        className="w-full h-full scale-125"
                      />
                    ) : (
                      avatarConfig && (
                        <AvatarCanvas
                          config={avatarConfig}
                          animationState={avatarAnimationState}
                          isCompact={true}
                          className="w-full h-full scale-125"
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      {avatarConfig.name || "Compañero Visual"}
                    </span>
                    {avatarReaction.mood === "praising" && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        ¡Celebrando!
                      </span>
                    )}
                    {avatarReaction.mood === "support" && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        Pista & Apoyo
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 font-medium line-clamp-2">
                    {avatarReaction.message}
                  </div>
                </div>

                {/* Auto-Advance countdown indicator banner */}
                {autoAdvanceCountdown !== null && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleNextQuestion}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/30 transition-all shadow-md"
                    title="Avanzar de inmediato"
                  >
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Siguiente ({autoAdvanceCountdown}s) ⏩</span>
                  </motion.button>
                )}
              </div>

              {/* MODE 1: PICTURE MATCH (DUOLINGO CLASSIC) */}
              {activeMode === "match" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Left: Smart Image Card with Victory Effects */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div className="w-full max-w-[280px] sm:max-w-[320px]">
                      <SmartVisualCard
                        imageUrl={currentItem.imageUrl}
                        fallbackImageUrl={currentItem.fallbackImageUrl}
                        emojiFallback={currentItem.emojiFallback}
                        title={currentItem.englishWord}
                        spanishTranslation={currentItem.spanishTranslation}
                        category={currentItem.category}
                        categoryEmoji={currentItem.categoryEmoji}
                        isWinner={isAnswerChecked && isCorrect === true}
                      />
                    </div>
                  </div>

                  {/* Right: 4 Option Buttons & Submission */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Selecciona el nombre correcto en inglés:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {matchOptions.map((option) => {
                        const isSelected = selectedOption === option;
                        let btnStyle = "bg-slate-800/90 text-slate-200 border-slate-700 hover:border-slate-500 hover:bg-slate-800";

                        if (isAnswerChecked) {
                          if (option === currentItem.englishWord) {
                            btnStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-500/20 font-bold";
                          } else if (isSelected && !isCorrect) {
                            btnStyle = "bg-rose-500/20 text-rose-300 border-rose-500";
                          } else {
                            btnStyle = "bg-slate-800/40 text-slate-500 border-slate-800 opacity-60";
                          }
                        } else if (isSelected) {
                          btnStyle = "bg-amber-500/20 text-amber-300 border-amber-400 shadow-lg shadow-amber-500/20 font-bold";
                        }

                        return (
                          <button
                            key={option}
                            onClick={(e) => handleOptionSelect(option, e)}
                            className={`p-3.5 rounded-2xl border-2 text-left text-sm font-semibold transition-all flex items-center justify-between gap-2 active:scale-98 ${btnStyle}`}
                          >
                            <span className="truncate">{option}</span>
                            {isAnswerChecked && option === currentItem.englishWord && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {isAnswerChecked && isSelected && !isCorrect && (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Action button: Check or Next */}
                    <div className="pt-2 flex items-center gap-3">
                      {!isAnswerChecked ? (
                        <button
                          disabled={!selectedOption}
                          onClick={(e) => handleCheckMatch(e)}
                          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                            selectedOption
                              ? "bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 shadow-amber-500/25 active:scale-98 cursor-pointer"
                              : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Comprobar Respuesta</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
                        >
                          <span>
                            {autoAdvanceCountdown !== null
                              ? `Siguiente en ${autoAdvanceCountdown}s (o pulsa aquí)`
                              : "Siguiente Desafío"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: SPELLING & WRITING GAME (DELETREA & ESCRIBE) */}
              {activeMode === "spelling" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Left Column: High quality image with SmartVisualCard */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div className="w-full max-w-[280px] sm:max-w-[320px]">
                      <SmartVisualCard
                        imageUrl={currentItem.imageUrl}
                        fallbackImageUrl={currentItem.fallbackImageUrl}
                        emojiFallback={currentItem.emojiFallback}
                        title={isAnswerChecked ? currentItem.englishWord : "???"}
                        spanishTranslation={currentItem.spanishTranslation}
                        category={currentItem.category}
                        categoryEmoji={currentItem.categoryEmoji}
                        isWinner={isAnswerChecked && isCorrect === true}
                      />
                    </div>
                  </div>

                  {/* Right Column: Interactive Letter Slots, Spelling Bank & Typing */}
                  <div className="md:col-span-7 space-y-3.5">
                    {/* Header instruction + Translation & IPA pronunciation audio */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-md">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Escribe o deletrea el nombre en inglés:
                        </div>
                        <div className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2 mt-0.5">
                          <span>{currentItem.spanishTranslation}</span>
                          <span className="text-xs text-slate-400 font-normal">
                            ({currentItem.categoryEmoji} {currentItem.category})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlayWordAudio(currentItem.englishWord)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                          title="Escuchar pronunciación"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{currentItem.phoneticIpa}</span>
                        </button>

                        <button
                          onClick={() => setIsDirectTyping(!isDirectTyping)}
                          className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                            isDirectTyping
                              ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-md"
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                          }`}
                          title={isDirectTyping ? "Cambiar a fichas interactivas" : "Escribir con teclado"}
                        >
                          <Keyboard className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Direct Typing Input Box Mode */}
                    {isDirectTyping ? (
                      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5">
                        <div className="flex items-center gap-2">
                          <input
                            ref={spellingInputRef}
                            type="text"
                            disabled={isAnswerChecked}
                            value={spellingDirectInput}
                            onChange={(e) => setSpellingDirectInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && spellingDirectInput.trim()) {
                                handleCheckSpelling(spellingDirectInput.trim());
                              }
                            }}
                            placeholder="Escribe la palabra aquí..."
                            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-center text-lg font-black tracking-widest text-white uppercase placeholder:text-slate-600 focus:outline-none transition-all"
                            autoFocus
                          />
                          {!isAnswerChecked && (
                            <button
                              disabled={!spellingDirectInput.trim()}
                              onClick={(e) => handleCheckSpelling(spellingDirectInput.trim(), e)}
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-md hover:from-amber-400 hover:to-emerald-400 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Comprobar
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Tactile Letter Slots */
                      <div
                        className={`flex flex-wrap items-center justify-center gap-2 p-3.5 bg-slate-950/90 border rounded-2xl min-h-[72px] transition-all ${
                          spellingShaking
                            ? "border-rose-500 animate-shake bg-rose-950/20"
                            : isAnswerChecked && isCorrect
                            ? "border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10"
                            : "border-slate-800"
                        }`}
                      >
                        {spellingSlots.map((slot, index) => {
                          const isFilled = Boolean(slot);
                          return (
                            <motion.button
                              key={`slot-${index}`}
                              layout
                              disabled={isAnswerChecked || !isFilled || Boolean(slot?.isRevealed)}
                              onClick={() => handleRemoveSpellingSlot(index)}
                              whileHover={isFilled && !isAnswerChecked ? { scale: 1.05 } : {}}
                              whileTap={isFilled && !isAnswerChecked ? { scale: 0.95 } : {}}
                              className={`w-10 h-11 sm:w-12 sm:h-13 rounded-xl flex items-center justify-center font-black text-base sm:text-lg transition-all relative select-none ${
                                isFilled
                                  ? isAnswerChecked
                                    ? isCorrect
                                      ? "bg-gradient-to-b from-emerald-500 to-teal-600 text-slate-950 border-2 border-emerald-300 shadow-md shadow-emerald-500/30 font-black"
                                      : "bg-rose-500/20 text-rose-300 border-2 border-rose-500"
                                    : slot?.isRevealed
                                    ? "bg-amber-500/30 text-amber-300 border-2 border-amber-400 shadow-md font-black"
                                    : "bg-slate-800 text-white border-2 border-amber-400/70 shadow-md hover:border-amber-300 cursor-pointer"
                                  : "bg-slate-900/80 border-2 border-dashed border-slate-700 text-slate-600"
                              }`}
                            >
                              {isFilled && slot ? (
                                <motion.span
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                >
                                  {slot.char}
                                </motion.span>
                              ) : (
                                <span className="w-2.5 h-0.5 bg-slate-700 rounded-full" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* Scrambled Letter Bank */}
                    {!isDirectTyping && (
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-2.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                          {spellingBank.map((tile) => {
                            if (tile.isUsed) {
                              return (
                                <div
                                  key={tile.id}
                                  className="w-9 h-10 sm:w-11 sm:h-12 rounded-xl bg-slate-900/40 border border-slate-800/60 opacity-20 pointer-events-none"
                                />
                              );
                            }
                            return (
                              <motion.button
                                key={tile.id}
                                layout
                                disabled={isAnswerChecked}
                                onClick={(e) => handleSpellingTileClick(tile, e)}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                className="w-9 h-10 sm:w-11 sm:h-12 rounded-xl bg-gradient-to-b from-slate-800 to-slate-800/90 hover:from-amber-500/20 hover:to-amber-500/10 border-2 border-slate-700 hover:border-amber-400 text-slate-100 hover:text-amber-300 font-black text-sm sm:text-base flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                              >
                                {tile.char}
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Clues & Utility Actions Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={isAnswerChecked}
                              onClick={handleSpellingHint}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40"
                              title="Revela una letra correcta"
                            >
                              <Lightbulb className="w-3.5 h-3.5" />
                              <span>Pista</span>
                            </button>

                            <button
                              disabled={isAnswerChecked}
                              onClick={handleSpellingDiscardDistractors}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40"
                              title="Descarta letras incorrectas"
                            >
                              <Wand2 className="w-3.5 h-3.5" />
                              <span>Descartar 2</span>
                            </button>

                            <button
                              disabled={isAnswerChecked}
                              onClick={handleSpellingShuffle}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40"
                              title="Mezclar letras"
                            >
                              <Shuffle className="w-3.5 h-3.5" />
                              <span>Mezclar</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={isAnswerChecked}
                              onClick={handleSpellingBackspace}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all disabled:opacity-40"
                              title="Borrar última letra"
                            >
                              <Delete className="w-4 h-4" />
                            </button>

                            <button
                              disabled={isAnswerChecked}
                              onClick={handleSpellingClear}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all disabled:opacity-40"
                              title="Limpiar todo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Result or Advance Action */}
                    {isAnswerChecked && (
                      <div className="pt-2">
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
                        >
                          <span>
                            {autoAdvanceCountdown !== null
                              ? `Siguiente en ${autoAdvanceCountdown}s (o pulsa aquí)`
                              : "Siguiente Palabra"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 3: 4-GRID RUSH (LISTEN & TAP PICTURE) */}
              {activeMode === "four_grid" && (
                <div className="space-y-4">
                  {/* Listening Audio Banner */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePlayWordAudio(currentItem.englishWord)}
                        className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform shrink-0"
                        title="Escuchar palabra de nuevo"
                      >
                        <Volume2 className="w-6 h-6" />
                      </button>
                      <div>
                        <div className="text-xs text-slate-400 uppercase font-semibold">
                          Escucha y selecciona la imagen correcta
                        </div>
                        <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <span>"{currentItem.englishWord}"</span>
                          <span className="text-xs font-normal text-amber-300">
                            {currentItem.phoneticIpa}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayWordAudio(currentItem.englishWord)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Repetir Audio</span>
                    </button>
                  </div>

                  {/* 4 Picture Grid with SmartVisualCard */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {fourGridItems.map((item) => {
                      const isSelected = selectedGridId === item.id;
                      const isWinningCard = isAnswerChecked && item.id === currentItem.id;

                      return (
                        <button
                          key={item.id}
                          disabled={isAnswerChecked}
                          onClick={(e) => handleGridCardClick(item, e)}
                          className={`text-left transition-transform active:scale-95 ${
                            isSelected && !isWinningCard && isAnswerChecked ? "opacity-50" : ""
                          }`}
                        >
                          <SmartVisualCard
                            imageUrl={item.imageUrl}
                            fallbackImageUrl={item.fallbackImageUrl}
                            emojiFallback={item.emojiFallback}
                            title={item.englishWord}
                            spanishTranslation={item.spanishTranslation}
                            category={item.category}
                            categoryEmoji={item.categoryEmoji}
                            isWinner={isWinningCard}
                            showLabels={isAnswerChecked}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Step button if answered */}
                  {isAnswerChecked && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleNextQuestion}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span>
                          {autoAdvanceCountdown !== null
                            ? `Siguiente en ${autoAdvanceCountdown}s`
                            : "Siguiente Desafío"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 3: LOOK & SPEAK (VOICE RECOGNITION & ACCURACY) */}
              {activeMode === "look_speak" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Photo Display */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div className="w-full max-w-[280px]">
                      <SmartVisualCard
                        imageUrl={currentItem.imageUrl}
                        fallbackImageUrl={currentItem.fallbackImageUrl}
                        emojiFallback={currentItem.emojiFallback}
                        title={currentItem.englishWord}
                        spanishTranslation={currentItem.spanishTranslation}
                        category={currentItem.category}
                        categoryEmoji={currentItem.categoryEmoji}
                        isWinner={isAnswerChecked && isCorrect === true}
                      />
                    </div>
                  </div>

                  {/* Voice Control & Evaluation */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                      <div className="text-xs font-semibold text-slate-400">Palabra objetivo:</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl sm:text-2xl font-black text-white">
                            {currentItem.englishWord}
                          </div>
                          <div className="text-xs text-amber-300 font-mono">
                            {currentItem.phoneticIpa}
                          </div>
                        </div>
                        <button
                          onClick={() => handlePlayWordAudio(currentItem.englishWord)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                          title="Escuchar modelo nativo"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Microphone Action Area */}
                    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center space-y-3">
                      <button
                        onClick={handleToggleRecord}
                        className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all shadow-xl ${
                          isRecording
                            ? "bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-500/20"
                            : "bg-gradient-to-tr from-rose-500 to-amber-500 text-white hover:scale-105 active:scale-95 shadow-rose-500/25"
                        }`}
                      >
                        {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                      </button>

                      <div className="text-xs text-slate-300">
                        {isRecording
                          ? "🎙️ Escuchando... Di la palabra en voz alta ahora"
                          : "Toca el micrófono para hablar y evaluar tu acento"}
                      </div>

                      {/* Live Transcript & Confidence Meter */}
                      {speechTranscript && (
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                          <div className="text-slate-400">
                            Detectado: <strong className="text-white">"{speechTranscript}"</strong>
                          </div>
                          {speechConfidence !== null && (
                            <div className="flex items-center justify-center gap-2 font-bold">
                              <span
                                className={
                                  speechConfidence >= 75 ? "text-emerald-400" : "text-amber-400"
                                }
                              >
                                Precisión fonética: {speechConfidence}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {isAnswerChecked && (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span>
                          {autoAdvanceCountdown !== null
                            ? `Siguiente en ${autoAdvanceCountdown}s`
                            : "Siguiente Desafío"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 4: SENTENCE BUILDER (WORD PUZZLE BLOCKS) */}
              {activeMode === "sentence_builder" && (
                <div className="space-y-4">
                  {/* Top Scene Guide */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 shrink-0">
                      <SmartVisualCard
                        imageUrl={currentItem.imageUrl}
                        fallbackImageUrl={currentItem.fallbackImageUrl}
                        emojiFallback={currentItem.emojiFallback}
                        title={currentItem.englishWord}
                        category={currentItem.category}
                        categoryEmoji={currentItem.categoryEmoji}
                        isWinner={isAnswerChecked && isCorrect === true}
                        showLabels={false}
                      />
                    </div>
                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <div className="text-xs text-slate-400 uppercase font-semibold">
                        Construye la oración que describe la escena:
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-amber-300">
                        🇪🇸 "{currentItem.sentenceBuilder.spanishSentence}"
                      </div>
                    </div>
                    <button
                      onClick={handlePlaySentenceAudio}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
                      title="Escuchar oración"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Dropzone: User Constructed Sentence */}
                  <div className="min-h-[80px] p-3.5 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl flex flex-wrap items-center gap-2">
                    {selectedTokens.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">
                        Toca las fichas de abajo en orden para construir la oración...
                      </span>
                    ) : (
                      selectedTokens.map((tok, idx) => (
                        <button
                          key={`${tok}-${idx}`}
                          onClick={() => handleRemoveToken(tok, idx)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs sm:text-sm font-semibold hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500 transition-all flex items-center gap-1 active:scale-95"
                        >
                          <span>{tok}</span>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Scrambled Word Bank */}
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800/40 rounded-2xl border border-slate-800">
                    {availableTokens.map((tok, idx) => (
                      <button
                        key={`${tok}-${idx}`}
                        onClick={() => handleAddToken(tok, idx)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 text-xs sm:text-sm font-semibold hover:bg-slate-700 transition-all active:scale-95"
                      >
                        {tok}
                      </button>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    {!isAnswerChecked ? (
                      <button
                        disabled={selectedTokens.length === 0}
                        onClick={(e) => handleCheckSentence(e)}
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                          selectedTokens.length > 0
                            ? "bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow-lg shadow-indigo-500/25 active:scale-95 cursor-pointer"
                            : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Comprobar Oración</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span>
                          {autoAdvanceCountdown !== null
                            ? `Siguiente en ${autoAdvanceCountdown}s`
                            : "Siguiente Desafío"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* POST-ANSWER LEARNING DRAWER: VOCABULARY & FUN FACT */}
              {isAnswerChecked && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Dato Curioso & Vocabulario:</span>
                    </div>

                    <button
                      onClick={handleSaveToFlashcards}
                      disabled={isSavedInVocab}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isSavedInVocab
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      }`}
                    >
                      {isSavedInVocab ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Guardado en Flashcards</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          <span>Guardar en Flashcards SRS</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    💡 <em>{currentItem.funFact}</em>
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
