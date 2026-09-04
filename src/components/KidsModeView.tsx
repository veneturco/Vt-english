import React, { useState, useEffect, useRef } from "react";
import {
  KIDS_WORLDS,
  STICKER_CATALOG,
  EXPLORER_SHOP_ITEMS,
} from "../data/kidsWorlds";
import {
  KidsLessonCard,
  KidsWorld,
  AvatarConfig,
  KidsProgress,
  KidsAgeGroup,
  KidsGameMode,
  AppExperienceMode,
} from "../types";
import {
  getStoredKidsProgress,
  saveStoredKidsProgress,
  kidsSFX,
} from "../utils/kidsAudioAndStorage";
import { soundFx } from "../utils/soundFx";
import {
  playCoinSound,
  playJumpSound,
  playErrorSoft,
  playSuccessFanfare,
  playPopSound,
} from "../utils/audioSynth";
import { speakText } from "../utils/speech";
import { Avatar2DCanvas } from "./Avatar2DCanvas";
import { ParticleEngine } from "./effects/ParticleEngine";
import { fireParticles } from "../utils/particleHelper";
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  Star,
  Trophy,
  Crown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Smile,
  X,
  ShoppingBag,
  Zap,
  Flame,
  Egg,
  Lock,
  Play,
  MapPin,
  Compass,
  ArrowRight,
  Gift,
  HelpCircle,
  Gamepad2,
  Utensils,
  VolumeX,
  GraduationCap,
  Pause,
  PartyPopper,
  Sliders,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ModeSwitcher } from "./ModeSwitcher";
import { VoiceJumpTestModal } from "./minigames/VoiceJumpTestModal";
import { BubblePopSpellingMinigame } from "./minigames/BubblePopSpellingMinigame";
import { DinoPipeTunnelMinigame } from "./minigames/DinoPipeTunnelMinigame";

interface KidsModeViewProps {
  onSwitchToAdultsMode: () => void;
  onExperienceModeChange?: (mode: AppExperienceMode) => void;
}

interface KidsCompanionOption {
  id: string;
  name: string;
  role: string;
  emoji: string;
  themeColor: string;
  avatarConfig: AvatarConfig;
  greetingPhrases: (word: string) => string[];
  victoryPhrases: (word: string) => string[];
  soundboard: { label: string; phrase: string }[];
}

const KIDS_COMPANIONS: KidsCompanionOption[] = [
  {
    id: "raptor",
    name: "Pip el Velociraptor",
    role: "Astuto, Veloz y Aventurero",
    emoji: "⚡",
    themeColor: "from-cyan-500 via-sky-500 to-teal-400",
    avatarConfig: {
      preset: "raptor_dino",
      name: "Pip Raptor",
      role: "Guía Veloz",
      skinTone: "#06b6d4",
      hairStyle: "feathers",
      hairColor: "#0891b2",
      glasses: "none",
      outfit: "casual_blazer",
      outfitColor: "#06b6d4",
      accentColor: "#facc15",
      accessory: "none",
      voiceGender: "male",
      voiceRate: 1.06,
      voicePitch: 1.15,
      voiceAccent: "en-US",
    },
    greetingPhrases: (word) => [
      `Swoosh! I'm Pip the fast raptor! Jump over the rock and say: ${word}!`,
      `Turbo sprint! Speak fast and clear: ${word}!`,
      `Catch the word before it escapes! Say: ${word}!`,
    ],
    victoryPhrases: (word) => [
      `Speedy and perfect! Turbo boost activated with ${word}! ⚡`,
      `Super Sonic Combo unlocked! You are super fast! 🌟`,
    ],
    soundboard: [
      { label: '⚡ "Super Fast!"', phrase: "Swoosh! Lightning speed learning!" },
      { label: '🦕 "Raptor Power!"', phrase: "Velociraptor agility! You nailed it!" },
      { label: '🌟 "Awesome!"', phrase: "You are the quickest learner in the kingdom!" },
    ],
  },
  {
    id: "trex",
    name: "Rexy el T-Rex",
    role: "Fuerte, Gigante y Tierno",
    emoji: "🦖",
    themeColor: "from-emerald-600 via-green-500 to-amber-500",
    avatarConfig: {
      preset: "trex_friendly",
      name: "Rexy T-Rex",
      role: "Coach Jurásico",
      skinTone: "#16a34a",
      hairStyle: "short_parted",
      hairColor: "#14532d",
      glasses: "none",
      outfit: "casual_blazer",
      outfitColor: "#16a34a",
      accentColor: "#f97316",
      accessory: "none",
      voiceGender: "male",
      voiceRate: 0.9,
      voicePitch: 0.8,
      voiceAccent: "en-US",
    },
    greetingPhrases: (word) => [
      `ROAAAR! I'm hungry Rexy! Feed me by saying: ${word}!`,
      `Dino power! Speak loud and proud: ${word}!`,
      `Let's make a mighty Jurassic roar! Repeat: ${word}!`,
    ],
    victoryPhrases: (word) => [
      `ROAAAR! Munch crunch! Rexy loved that: ${word}! 🦖`,
      `Colossal work! You fed Rexy and earned a Golden Fossil Coin! 🥚`,
    ],
    soundboard: [
      { label: '🦖 "ROAAR!"', phrase: "ROAAAR! Dino power activated!" },
      { label: '🌴 "Jurassic Jump!"', phrase: "Let's explore the prehistoric world together!" },
      { label: '⭐ "Colossal!"', phrase: "Colossal pronunciation! You are a superstar!" },
    ],
  },
  {
    id: "mario",
    name: "Hero Mario",
    role: "Aventurero & Saltarín",
    emoji: "🍄",
    themeColor: "from-red-500 via-rose-500 to-amber-500",
    avatarConfig: {
      preset: "mario_hero",
      name: "Super Mario",
      role: "Coach Heroico",
      skinTone: "#fcd34d",
      hairStyle: "short_parted",
      hairColor: "#451a03",
      glasses: "none",
      outfit: "casual_blazer",
      outfitColor: "#dc2626",
      accentColor: "#2563eb",
      accessory: "mario_cap",
      voiceGender: "male",
      voiceRate: 1.02,
      voicePitch: 1.12,
      voiceAccent: "en-US",
    },
    greetingPhrases: (word) => [
      `It's-a me, Mario! Hit the block and say: ${word}! Let's-a go!`,
      `Mamma Mia! Jump high and pronounce: ${word}!`,
      `Yahoo! Let's collect Fossil Coins! Repeat with me: ${word}!`,
    ],
    victoryPhrases: (word) => [
      `Yahoo! Mamma Mia! You smashed the block with ${word}! ⭐`,
      `Super! You got +10 Fossil Coins and a Power Star! 🍄`,
    ],
    soundboard: [
      { label: '🍄 "It\'s-a me!"', phrase: "It's-a me, Mario! Let's-a go!" },
      { label: '⭐ "Yahoo!"', phrase: "Yahoo! Super Star power!" },
      { label: '🍕 "Mamma Mia!"', phrase: "Mamma Mia! You are fantastic!" },
    ],
  },
  {
    id: "luigi",
    name: "Luigi Explorador",
    role: "Hermano de Expedición",
    emoji: "🟢",
    themeColor: "from-green-500 via-emerald-500 to-teal-500",
    avatarConfig: {
      preset: "luigi_hero",
      name: "Luigi",
      role: "Coach de Confianza",
      skinTone: "#fcd34d",
      hairStyle: "short_parted",
      hairColor: "#451a03",
      glasses: "none",
      outfit: "casual_blazer",
      outfitColor: "#16a34a",
      accentColor: "#2563eb",
      accessory: "luigi_cap",
      voiceGender: "male",
      voiceRate: 0.98,
      voicePitch: 1.06,
      voiceAccent: "en-US",
    },
    greetingPhrases: (word) => [
      `I'm Luigi, number one! Slide through the pipe and say: ${word}!`,
      `Okie Dokie! Jump over the obstacle and repeat: ${word}!`,
    ],
    victoryPhrases: (word) => [
      `Bingo! Luigi is super proud of you! Great job with ${word}! 🌟`,
    ],
    soundboard: [
      { label: '🟢 "Luigi #1!"', phrase: "I'm Luigi, number one!" },
      { label: '🍀 "Okie Dokie!"', phrase: "Okie Dokie! Let's practice English together!" },
    ],
  },
];

interface LevelVictoryData {
  worldId: string;
  worldTitle: string;
  worldIcon: string;
  cardIndex: number;
  totalCards: number;
  completedCard: KidsLessonCard;
  nextCard: KidsLessonCard | null;
  starsEarned: number;
  coinsEarned: number;
  combo: number;
  isWorldBoss: boolean;
}

export const KidsModeView: React.FC<KidsModeViewProps> = ({
  onSwitchToAdultsMode,
  onExperienceModeChange,
}) => {
  const [kidsProgress, setKidsProgress] = useState<KidsProgress>(() =>
    getStoredKidsProgress()
  );
  const [selectedWorldId, setSelectedWorldId] = useState<string>("dino_valley");
  const [selectedCompanionId, setSelectedCompanionId] = useState<string>("raptor");
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [ageGroup, setAgeGroup] = useState<KidsAgeGroup>("preschool");
  const [gameMode, setGameMode] = useState<KidsGameMode>("dino_snack");
  const [activeView, setActiveView] = useState<"map" | "level">("map");

  const [isListening, setIsListening] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "success" | "try_again" | "neutral";
  } | null>(null);

  const [isStickerAlbumOpen, setIsStickerAlbumOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isEggModalOpen, setIsEggModalOpen] = useState<boolean>(false);
  const [eggCrackAnim, setEggCrackAnim] = useState<boolean>(false);

  const [victoryModalData, setVictoryModalData] = useState<LevelVictoryData | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number>(4);
  const [isAutoAdvancePaused, setIsAutoAdvancePaused] = useState<boolean>(false);

  const [isVoiceJumpTestModalOpen, setIsVoiceJumpTestModalOpen] = useState<boolean>(false);
  const [voiceJumpTranscript, setVoiceJumpTranscript] = useState<string>("");

  const [mascotMood, setMascotMood] = useState<
    "happy" | "speaking" | "celebrating" | "encouraging" | "eating"
  >("happy");
  const [blockHitEffect, setBlockHitEffect] = useState<number | null>(null);
  const [comboCount, setComboCount] = useState<number>(0);
  const [isDraggingFood, setIsDraggingFood] = useState<boolean>(false);
  const [foodDragPos, setFoodDragPos] = useState<{ x: number; y: number } | undefined>(undefined);
  const [isMascotJumping, setIsMascotJumping] = useState<boolean>(false);
  const [mouthIntensity, setMouthIntensity] = useState<number>(0);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Companion Idle Animation: gentle encouraging reaction if inactive for 9 seconds
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setMascotMood("encouraging");
        setTimeout(() => setMascotMood("happy"), 1800);
      }, 9000);
    };

    window.addEventListener("pointerdown", resetIdleTimer);
    resetIdleTimer();
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("pointerdown", resetIdleTimer);
    };
  }, []);

  // Clean up auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  // Safe and guaranteed switch to Adult Mode (clears timers, drags, and triggers sound)
  const handleSwitchToAdults = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setIsDraggingFood(false);
    try {
      kidsSFX.playPopBubble();
    } catch (e) {}
    if (onExperienceModeChange) {
      onExperienceModeChange("adults");
    }
    if (onSwitchToAdultsMode) {
      onSwitchToAdultsMode();
    }
  };

  const currentCompanion =
    KIDS_COMPANIONS.find((c) => c.id === selectedCompanionId) || KIDS_COMPANIONS[0];

  const currentWorld: KidsWorld =
    KIDS_WORLDS.find((w) => w.id === selectedWorldId) || KIDS_WORLDS[0];
  const currentCard: KidsLessonCard =
    currentWorld.cards[currentCardIndex] || currentWorld.cards[0];

  // Egg hatching progress stages
  const eggStages = [
    { title: "Huevo Fósil de Piedra", emoji: "🥚", description: "Completa retos diarios para calentarlo." },
    { title: "Huevo Agrietado Mágico", emoji: "🐣", description: "¡Se escuchan latidos y golpecitos!" },
    { title: "Bebé T-Rex Nacido", emoji: "🦖", description: "¡Nació tu compañero con gorrita de explorador!" },
    { title: "Golden Raptor Celestial", emoji: "🦅", description: "¡Evolución suprema legendaria!" },
  ];

  const currentEgg = eggStages[Math.min(kidsProgress.dinoEggStage, eggStages.length - 1)];

  // Handler for advancing to the next challenge from victory modal
  const handleGoToNextChallenge = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    kidsSFX.playJumpSound();
    setFeedbackMessage(null);
    const targetNextIndex = currentCardIndex + 1;
    setVictoryModalData(null);

    if (targetNextIndex < currentWorld.cards.length) {
      setCurrentCardIndex(targetNextIndex);
      setActiveView("level");
      const nextCardToPlay = currentWorld.cards[targetNextIndex];
      if (nextCardToPlay) {
        setTimeout(() => {
          handleSpeakCard(nextCardToPlay);
        }, 400);
      }
    } else {
      setActiveView("map");
    }
  };

  // Handler for replaying current completed challenge
  const handleReplayCurrentChallenge = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    kidsSFX.playPopBubble();
    setFeedbackMessage(null);
    setVictoryModalData(null);
    setActiveView("level");
    setTimeout(() => {
      handleSpeakCard(currentCard);
    }, 300);
  };

  // Handler for closing modal and returning to the Adventure Map to inspect progress
  const handleGoToAdventureMap = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    kidsSFX.playPopBubble();
    setFeedbackMessage(null);
    setVictoryModalData(null);
    setActiveView("map");
  };

  // Auto-advance countdown effect when victory modal is open
  useEffect(() => {
    if (!victoryModalData || isAutoAdvancePaused) return;

    if (autoAdvanceCountdown <= 0) {
      if (victoryModalData.nextCard) {
        handleGoToNextChallenge();
      } else {
        handleGoToAdventureMap();
      }
      return;
    }

    const timer = setTimeout(() => {
      setAutoAdvanceCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [victoryModalData, autoAdvanceCountdown, isAutoAdvancePaused]);

  // Mascot speak
  const handleMascotClick = () => {
    soundFx.playCharacterStageSound(currentCompanion.avatarConfig.preset);
    kidsSFX.playPopBubble();
    setMascotMood("speaking");
    setMouthIntensity(0.95);
    const phrases = currentCompanion.greetingPhrases(currentCard.englishWord);
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    speakText(randomPhrase, currentCompanion.avatarConfig, undefined, () => {
      setMascotMood("happy");
      setMouthIntensity(0);
    });
  };

  // Speak Card Word
  const handleSpeakCard = (card: KidsLessonCard) => {
    kidsSFX.playPopBubble();
    setMascotMood("speaking");
    setMouthIntensity(0.95);
    speakText(
      card.englishWord,
      currentCompanion.avatarConfig,
      undefined,
      () => {
        setMascotMood("happy");
        setMouthIntensity(0);
      },
      undefined,
      { forceLang: "en-US", rateMultiplier: ageGroup === "preschool" ? 0.82 : 0.95 }
    );
  };

  // Speak Example Phrase
  const handleSpeakPhrase = (card: KidsLessonCard) => {
    kidsSFX.playPopBubble();
    speakText(
      card.examplePhrase,
      currentCompanion.avatarConfig,
      undefined,
      undefined,
      undefined,
      { forceLang: "en-US", rateMultiplier: 0.9 }
    );
  };

  // Select Option in Block Bash or Dino Snack
  const handleOptionSelect = (optionIndex: number) => {
    const isCorrect =
      currentCard.correctOptionIndex !== undefined
        ? optionIndex === currentCard.correctOptionIndex
        : optionIndex === 0;

    if (isCorrect) {
      setBlockHitEffect(optionIndex);
      if (gameMode === "dino_snack") {
        triggerDinoEatingAnimation();
      } else {
        kidsSFX.playCoinSound();
        if (typeof window !== "undefined") {
          fireParticles(window.innerWidth / 2, window.innerHeight / 2, "coins", 14);
          fireParticles(window.innerWidth / 2, window.innerHeight / 2, "stars", 18);
        }
      }
      setTimeout(() => setBlockHitEffect(null), 600);
      handleSuccessReward(3);
    } else {
      kidsSFX.playErrorSoft();
      setComboCount(0);
      setMascotMood("encouraging");
      setFeedbackMessage({
        text: `¡Casi casi! ${currentCompanion.name.split(" ")[0]} te anima: ¡Escucha de nuevo y prueba! 🌟`,
        type: "try_again",
      });
      handleSpeakCard(currentCard);
    }
  };

  // Drag & Drop for Dino Snack with magnetic eye & mouth tracking
  const handleDragStart = (e: React.DragEvent, optIndex: number) => {
    e.dataTransfer.setData("text/plain", optIndex.toString());
    setIsDraggingFood(true);
    setMouthIntensity(0.7);
    kidsSFX.playPopBubble();
  };

  const handleDragEnd = () => {
    setIsDraggingFood(false);
    setFoodDragPos(undefined);
    setMouthIntensity(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFood(true);
    setFoodDragPos({ x: e.clientX, y: e.clientY });
    setMouthIntensity(0.85); // Dino opens mouth wide anticipating food!
  };

  const handleDropFood = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFood(false);
    setFoodDragPos(undefined);
    setMouthIntensity(0);
    const data = e.dataTransfer.getData("text/plain");
    const optIndex = parseInt(data, 10);
    if (!isNaN(optIndex)) {
      handleOptionSelect(optIndex);
    }
  };

  const triggerDinoEatingAnimation = () => {
    kidsSFX.playDinoMunch();
    setMascotMood("eating");
    setMouthIntensity(1.0);
    setFoodDragPos(undefined);

    // Crunch sequence with heart/spark particles
    if (typeof window !== "undefined") {
      fireParticles(window.innerWidth * 0.35, window.innerHeight * 0.45, "sparks", 18);
    }

    setTimeout(() => setMouthIntensity(0.2), 150);
    setTimeout(() => {
      setMouthIntensity(0.95);
      if (typeof window !== "undefined") {
        fireParticles(window.innerWidth * 0.35, window.innerHeight * 0.45, "coins", 8);
      }
    }, 300);
    setTimeout(() => setMouthIntensity(0.1), 450);
    setTimeout(() => setMouthIntensity(0.85), 600);
    setTimeout(() => {
      setMascotMood("celebrating");
      setMouthIntensity(0);
    }, 850);
  };

  // Voice Jump Microphone Practice with webkitSpeechRecognition
  const handleVoiceJumpPractice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback for environments without speech recognition
      kidsSFX.playJumpSound();
      handleSuccessReward(3);
      return;
    }

    try {
      kidsSFX.playPopBubble();
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setVoiceJumpTranscript("");
      setMascotMood("listening");
      setFeedbackMessage({
        text: `¡${currentCompanion.name} está escuchando! Di en voz alta: "${currentCard.englishWord}"...`,
        type: "neutral",
      });

      recognition.onresult = (event: any) => {
        setIsListening(false);
        const rawTranscript = event.results[0][0].transcript;
        setVoiceJumpTranscript(rawTranscript);
        const transcript = rawTranscript.toLowerCase();
        const target = currentCard.englishWord.toLowerCase();

        // High tolerance recognition for kids
        const isAcceptable =
          transcript.includes(target) ||
          target.includes(transcript) ||
          (ageGroup === "preschool" && transcript.length >= 2);

        if (isAcceptable) {
          setIsMascotJumping(true);
          kidsSFX.playJumpSound();
          setMascotMood("celebrating");
          if (typeof window !== "undefined") {
            fireParticles(window.innerWidth * 0.35, window.innerHeight * 0.45, "stars", 28);
            fireParticles(window.innerWidth * 0.35, window.innerHeight * 0.45, "coins", 12);
          }
          setTimeout(() => setIsMascotJumping(false), 900);
          handleSuccessReward(3);
        } else {
          playErrorSoft();
          setComboCount(0);
          setMascotMood("encouraging");
          setFeedbackMessage({
            text: `¡Casi! Escucha a ${currentCompanion.name.split(" ")[0]} y repite: "${currentCard.englishWord}" ⭐`,
            type: "try_again",
          });
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setMascotMood("encouraging");
        setFeedbackMessage({
          text: `¡No te preocupes! Vuelve a tocar el micrófono e inténtalo.`,
          type: "try_again",
        });
      };

      recognition.start();
    } catch {
      setIsListening(false);
      handleSuccessReward(3);
    }
  };

  // Reward calculation and state update
  const handleSuccessReward = (starsEarned: number = 3) => {
    playSuccessFanfare();
    setMascotMood("celebrating");
    const newCombo = comboCount + 1;
    setComboCount(newCombo);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mascot-action", { detail: { action: "jump" } }));
    }

    try {
      confetti({
        particleCount: newCombo >= 3 ? 90 : 50,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#f59e0b", "#ec4899", "#3b82f6", "#10b981", "#8b5cf6"],
        zIndex: 25, // Behind header (z-100) and interactive buttons
      });
    } catch (e) {}

    const isAlreadyCompleted = kidsProgress.completedCards.includes(currentCard.id);
    const prevScore = kidsProgress.levelScores[currentCard.id] || 0;
    const bestScore = Math.max(prevScore, starsEarned);

    const updatedScores = {
      ...kidsProgress.levelScores,
      [currentCard.id]: bestScore,
    };

    const addedStars = isAlreadyCompleted ? Math.max(0, starsEarned - prevScore) : starsEarned;
    const updatedStars = kidsProgress.totalStars + addedStars;
    const updatedCoins = kidsProgress.fossilCoins + (newCombo >= 3 ? 25 : 15);
    const updatedDaily = Math.min(5, kidsProgress.dailyQuestsCompleted + 1);

    // Evolve egg on milestones
    let newEggStage = kidsProgress.dinoEggStage;
    if (updatedStars >= 24) newEggStage = 3;
    else if (updatedStars >= 14) newEggStage = 2;
    else if (updatedStars >= 5) newEggStage = 1;

    // Check newly unlocked stickers
    const newStickers = [...kidsProgress.unlockedStickers];
    STICKER_CATALOG.forEach((st) => {
      if (updatedStars >= st.starsRequired && !newStickers.includes(st.id)) {
        newStickers.push(st.id);
      }
    });

    const updatedCompleted = isAlreadyCompleted
      ? kidsProgress.completedCards
      : [...kidsProgress.completedCards, currentCard.id];

    // Check if next world is unlocked
    const newUnlockedWorlds = [...kidsProgress.unlockedWorlds];
    if (updatedStars >= 6 && !newUnlockedWorlds.includes("adventure_kingdom")) {
      newUnlockedWorlds.push("adventure_kingdom");
    }
    if (updatedStars >= 14 && !newUnlockedWorlds.includes("sky_castle")) {
      newUnlockedWorlds.push("sky_castle");
    }

    const updatedState: KidsProgress = {
      ...kidsProgress,
      totalStars: updatedStars,
      fossilCoins: updatedCoins,
      completedCards: updatedCompleted,
      levelScores: updatedScores,
      unlockedWorlds: newUnlockedWorlds,
      dailyQuestsCompleted: updatedDaily,
      unlockedStickers: newStickers,
      currentWorldId: selectedWorldId,
      dinoEggStage: newEggStage,
    };

    setKidsProgress(updatedState);
    saveStoredKidsProgress(updatedState);

    const victoryList = currentCompanion.victoryPhrases(currentCard.englishWord);
    const victoryText = victoryList[Math.floor(Math.random() * victoryList.length)];

    setFeedbackMessage({
      text: newCombo >= 3 ? `🔥 ¡COMBO x${newCombo}! ${victoryText}` : victoryText,
      type: "success",
    });

    const isLastCard = currentCardIndex === currentWorld.cards.length - 1;
    const nextCardItem = !isLastCard ? currentWorld.cards[currentCardIndex + 1] : null;

    // Trigger full celebratory modal with stars, rewards, and auto-advance
    setVictoryModalData({
      worldId: currentWorld.id,
      worldTitle: currentWorld.spanishTitle,
      worldIcon: currentWorld.icon,
      cardIndex: currentCardIndex,
      totalCards: currentWorld.cards.length,
      completedCard: currentCard,
      nextCard: nextCardItem,
      starsEarned: 3,
      coinsEarned: newCombo >= 3 ? 25 : 15,
      combo: newCombo,
      isWorldBoss: isLastCard,
    });
    setAutoAdvanceCountdown(4);
    setIsAutoAdvancePaused(false);

    // Audio narration celebrating the specific achievement in native voice
    const voiceLine = isLastCard
      ? `¡Felicidades! ¡Completaste el reto final del ${currentWorld.spanishTitle}! ¡Eres un super campeón!`
      : `¡Increíble! ¡Has completado el Reto ${currentCardIndex + 1}: ${currentCard.englishWord}! ¡Ahora vamos al Reto ${currentCardIndex + 2}: ${nextCardItem?.englishWord}!`;

    speakText(
      voiceLine,
      currentCompanion.avatarConfig,
      undefined,
      undefined,
      undefined,
      { forceLang: "es-ES", rateMultiplier: 0.95 }
    );
  };

  // Dino Egg Hatching Modal Trigger
  const handleHatchEggClick = () => {
    playPopSound();
    setIsEggModalOpen(true);
    setEggCrackAnim(false);
  };

  const handlePerformEggHatch = () => {
    kidsSFX.playEggCrack();
    setEggCrackAnim(true);

    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#ffd700", "#ff69b4", "#00ffff", "#7cfc00"],
        zIndex: 25,
      });
    } catch (e) {}

    setTimeout(() => {
      const nextStage = Math.min(3, kidsProgress.dinoEggStage + 1);
      const bonusCoins = kidsProgress.fossilCoins + 50;
      const updated = {
        ...kidsProgress,
        dinoEggStage: nextStage,
        fossilCoins: bonusCoins,
        dailyQuestsCompleted: 0, // Reset daily quest for next hatch
      };
      setKidsProgress(updated);
      saveStoredKidsProgress(updated);
    }, 600);
  };

  const handleBuyShopItem = (item: (typeof EXPLORER_SHOP_ITEMS)[0]) => {
    if (kidsProgress.fossilCoins < item.price) {
      playErrorSoft();
      alert(`¡Necesitas ${item.price} Monedas Fósil! Sigue completando niveles.`);
      return;
    }

    playCoinSound();
    const updated = {
      ...kidsProgress,
      fossilCoins: kidsProgress.fossilCoins - item.price,
      equippedHat: item.type === "hat" ? item.id : kidsProgress.equippedHat,
      equippedBackpack:
        item.type === "backpack" ? item.id : kidsProgress.equippedBackpack,
      equippedAura: item.type === "aura" ? item.id : kidsProgress.equippedAura,
    };
    setKidsProgress(updated);
    saveStoredKidsProgress(updated);
  };

  const openLevel = (cardIndex: number) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    playPopSound();
    setCurrentCardIndex(cardIndex);
    setFeedbackMessage(null);
    setActiveView("level");
  };

  const nextCard = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    playPopSound();
    setFeedbackMessage(null);
    setCurrentCardIndex((prev) => (prev + 1) % currentWorld.cards.length);
  };

  const prevCard = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    playPopSound();
    setFeedbackMessage(null);
    setCurrentCardIndex(
      (prev) => (prev - 1 + currentWorld.cards.length) % currentWorld.cards.length
    );
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-white">
      {/* 2D Canvas Particle Engine (60 FPS Native Confetti & Stars) */}
      <ParticleEngine />

      {/* Background Animated Glows & Parallax Floating Clouds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

        {/* Ambient floating sky elements */}
        <div className="absolute top-14 left-10 text-3xl opacity-20 select-none animate-bounce" style={{ animationDuration: "6s" }}>
          ☁️
        </div>
        <div className="absolute top-28 right-20 text-4xl opacity-15 select-none animate-pulse" style={{ animationDuration: "7s" }}>
          ☁️
        </div>
        <div className="absolute top-60 left-1/3 text-2xl opacity-10 select-none animate-bounce" style={{ animationDuration: "8s" }}>
          ☁️
        </div>
        <div className="absolute top-44 right-1/4 text-2xl opacity-25 select-none animate-pulse" style={{ animationDuration: "4s" }}>
          🦋
        </div>
      </div>

      {/* Top Header Bar for Kids */}
      <header className="w-full bg-slate-900/95 backdrop-blur-2xl border-b border-amber-500/20 sticky top-0 z-[100] px-2 sm:px-6 py-2 shadow-lg shadow-black/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Logo & Adventure Title */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => {
                kidsSFX.playPopBubble();
                setActiveView("map");
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-amber-500 to-rose-500 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer"
              title="Volver al Mapa de Aventura"
            >
              <span className="text-lg sm:text-xl">🗺️</span>
            </button>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <h1 className="text-sm sm:text-lg font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent truncate max-w-[110px] sm:max-w-none">
                  VT Kids
                </h1>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 hidden xs:inline">
                  Niños
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Coins, Stars, Shop & High-Visibility Adults Mode Switch */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative z-[110]">
            {/* Fossil Coins */}
            <div
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black shadow-sm cursor-pointer hover:bg-amber-500/30 transition active:scale-95"
              onClick={() => {
                kidsSFX.playCoinSound();
                setIsShopOpen(true);
              }}
              title="Monedas Fósil para la Tienda"
            >
              <span className="text-xs sm:text-sm">🪙</span>
              <span className="text-xs">{kidsProgress.fossilCoins}</span>
            </div>

            {/* Stars Counter Pill */}
            <div
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-300 text-xs font-black shadow-md shadow-amber-500/10 cursor-pointer hover:scale-105 active:scale-95 transition"
              onClick={() => {
                kidsSFX.playPopBubble();
                setIsStickerAlbumOpen(true);
              }}
              title="Toca para ver tu Álbum de Stickers"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs">{kidsProgress.totalStars}</span>
            </div>

            {/* Unified High-Visibility Mode Switcher (Adult vs Kid) */}
            <div className="relative z-[120]">
              <ModeSwitcher
                currentMode="kids"
                onModeChange={(mode) => {
                  if (mode === "adults") {
                    handleSwitchToAdults();
                  }
                }}
              />
            </div>

            {/* Dedicated Direct Adult Mode Button for immediate 1-tap switch */}
            <button
              type="button"
              id="kids-header-btn-adult-mode"
              onClick={handleSwitchToAdults}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-950/90 hover:bg-slate-800 border-2 border-emerald-500/60 hover:border-emerald-400 text-emerald-300 text-xs font-black transition active:scale-95 shadow-sm cursor-pointer touch-manipulation select-none"
              title="Volver a la interfaz de Adultos"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Modo Adultos</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Bar: Map vs Game Mode & Age Selector */}
      <div className="w-full bg-slate-950/70 border-b border-slate-800/80 px-3 sm:px-6 py-2 z-20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* View Mode Toggle: Adventure Map vs Mini-Game */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                kidsSFX.playPopBubble();
                setActiveView("map");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 ${
                activeView === "map"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Mapa de Mundos</span>
            </button>

            <button
              onClick={() => {
                kidsSFX.playPopBubble();
                setActiveView("level");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 ${
                activeView === "level"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Jugar Nivel ({currentCard.englishWord})</span>
            </button>
          </div>

          {/* Age Selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              Edad:
            </span>
            {[
              { id: "preschool", label: "4-6 Años", sub: "Visual" },
              { id: "explorer", label: "7-9 Años", sub: "Palabras" },
              { id: "champion", label: "10-12 Años", sub: "Reto Pro" },
            ].map((age) => (
              <button
                key={age.id}
                onClick={() => {
                  kidsSFX.playPopBubble();
                  setAgeGroup(age.id as KidsAgeGroup);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition active:scale-95 ${
                  ageGroup === age.id
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dynamic View: Map vs Level Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 z-10">
        {/* ============================================================ */}
        {/* FEATURE 2: ADVENTURE WORLD MAP VIEW                          */}
        {/* ============================================================ */}
        {activeView === "map" && (
          <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            {/* World Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {KIDS_WORLDS.map((world, worldIdx) => {
                const isSelected = world.id === selectedWorldId;
                const isUnlocked =
                  worldIdx === 0 || kidsProgress.unlockedWorlds.includes(world.id);
                const totalWorldStars = world.cards.reduce(
                  (acc, c) => acc + (kidsProgress.levelScores[c.id] || 0),
                  0
                );
                const maxWorldStars = world.cards.length * 3;

                return (
                  <button
                    key={world.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      kidsSFX.playPopBubble();
                      setSelectedWorldId(world.id);
                      const nextUncompletedIdx = world.cards.findIndex(
                        (c) => !kidsProgress.completedCards.includes(c.id)
                      );
                      setCurrentCardIndex(nextUncompletedIdx >= 0 ? nextUncompletedIdx : 0);
                    }}
                    className={`p-4 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-br " +
                          world.themeColor +
                          " text-white border-white/40 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/50 scale-[1.02]"
                        : isUnlocked
                        ? "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 text-slate-300"
                        : "bg-slate-950/60 border-slate-900 opacity-60 grayscale cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{world.icon}</span>
                      {!isUnlocked ? (
                        <span className="px-2 py-1 rounded-full bg-slate-900/90 text-slate-400 text-[10px] font-black border border-slate-700 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Bloqueado
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-black/40 text-amber-300 text-xs font-black flex items-center gap-1 border border-white/10">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>
                            {totalWorldStars}/{maxWorldStars}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <h3 className="text-base font-black leading-tight">
                        {world.title}
                      </h3>
                      <p className="text-xs opacity-80 font-medium mt-0.5">
                        {world.spanishTitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-bold">
                      <span>Jefe: {world.bossName || "Jefe"}</span>
                      {isSelected && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-md">
                          Mundo Activo 📍
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* The Winding Adventure Trail Map for Selected World */}
            <div className="w-full bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              {/* World Header inside Map */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg">
                    {currentWorld.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {currentWorld.spanishTitle}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {currentWorld.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const nextUncompletedIdx = currentWorld.cards.findIndex(
                        (c) => !kidsProgress.completedCards.includes(c.id)
                      );
                      const targetIdx = nextUncompletedIdx >= 0 ? nextUncompletedIdx : 0;
                      openLevel(targetIdx);
                    }}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition active:scale-95 cursor-pointer touch-manipulation select-none"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Jugar Siguiente Nivel</span>
                  </button>
                </div>
              </div>

              {/* Sinuous Snake Path (Zig-Zag Adventure Map) */}
              <div className="relative py-12 px-4 sm:px-12 flex flex-col items-center">
                {/* 4. Dotted Connector Road simulating the winding dirt path */}
                <div className="absolute top-16 bottom-16 left-1/2 -translate-x-1/2 w-1 border-l-8 border-dashed border-amber-400/30 dark:border-amber-500/25 pointer-events-none z-0" />

                {/* 1. Flexbox Vertical Container */}
                <div className="w-full max-w-xl flex flex-col gap-14 sm:gap-16 relative z-10">
                  {currentWorld.cards.map((card, idx) => {
                    const stars = kidsProgress.levelScores[card.id] || 0;
                    const isCompleted = kidsProgress.completedCards.includes(card.id);
                    const isUnlocked =
                      idx === 0 ||
                      kidsProgress.completedCards.includes(currentWorld.cards[idx - 1]?.id);
                    const isBoss = idx === currentWorld.cards.length - 1;
                    const isCurrent = isUnlocked && !isCompleted;

                    // 2. Alternated Alignment (Zig-Zag cycle: Left -> Center -> Right -> Center)
                    const alignmentCycle = idx % 4;
                    const alignmentClass =
                      alignmentCycle === 0
                        ? "self-start ml-2 sm:ml-8"
                        : alignmentCycle === 1
                        ? "self-center"
                        : alignmentCycle === 2
                        ? "self-end mr-2 sm:mr-8"
                        : "self-center";

                    return (
                      <div
                        key={card.id}
                        className={`relative flex flex-col items-center group transition-all duration-300 ${alignmentClass}`}
                      >
                        {/* Current Level Bouncing Mascot Marker */}
                        {isCurrent && (
                          <div className="absolute -top-12 z-20 flex flex-col items-center animate-bounce pointer-events-none">
                            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[11px] font-black tracking-wider shadow-lg flex items-center gap-1 border border-amber-200">
                              <Sparkles className="w-3 h-3 animate-spin" />
                              <span>¡AQUÍ!</span>
                            </div>
                            <span className="text-2xl filter drop-shadow-md">
                              {currentCompanion.emoji}
                            </span>
                          </div>
                        )}

                        {/* 3. Circular Node (W-24 H-24 Rounded-Full) */}
                        <button
                          onClick={(e) => {
                            if (isUnlocked) {
                              kidsSFX.playJumpSound();
                              fireParticles(e.clientX, e.clientY, "stars", 30);
                              openLevel(idx);
                            } else {
                              kidsSFX.playErrorSoft();
                            }
                          }}
                          disabled={!isUnlocked}
                          className={`
                            relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center
                            transform transition-all duration-200 ease-out select-none
                            focus:outline-none focus:ring-4
                            ${
                              !isUnlocked
                                ? "bg-slate-900/90 text-slate-500 border-4 border-slate-700 shadow-inner cursor-not-allowed opacity-65"
                                : isCompleted
                                ? "bg-gradient-to-b from-emerald-400 to-teal-600 text-white border-4 border-emerald-300 shadow-[0_8px_0_#065f46] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_#065f46] cursor-pointer hover:scale-105"
                                : "bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 text-amber-950 border-4 border-amber-200 shadow-[0_8px_0_#c2410c] hover:brightness-110 hover:scale-110 active:translate-y-1 active:shadow-[0_2px_0_#c2410c] ring-4 ring-amber-400/40 cursor-pointer animate-pulse"
                            }
                          `}
                        >
                          {/* Crown for Boss Level */}
                          {isBoss && (
                            <div className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg border-2 border-amber-200">
                              <Crown className="w-4 h-4" />
                            </div>
                          )}

                          {/* Center Content: Lock or Big Emoji */}
                          {!isUnlocked ? (
                            <Lock className="w-8 h-8 opacity-70" />
                          ) : (
                            <>
                              <span className="text-3xl sm:text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">
                                {card.emoji}
                              </span>
                              <span className="text-[10px] sm:text-xs font-black tracking-tighter uppercase mt-0.5">
                                {isBoss ? "Jefe" : `Reto ${idx + 1}`}
                              </span>
                            </>
                          )}

                          {/* 1 to 3 Floating Stars Indicator on Completed Nodes */}
                          {isCompleted && (
                            <div className="absolute -bottom-3 flex items-center gap-0.5 bg-slate-950/90 px-2.5 py-0.5 rounded-full border border-amber-400/50 shadow-lg">
                              {[1, 2, 3].map((starNum) => (
                                <Star
                                  key={starNum}
                                  className={`w-3.5 h-3.5 ${
                                    stars >= starNum
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-slate-700 text-slate-700"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </button>

                        {/* Title & Spanish Subtitle pill under node */}
                        <div className="mt-3.5 text-center max-w-[150px]">
                          <p
                            className={`text-xs sm:text-sm font-black tracking-tight leading-tight ${
                              !isUnlocked
                                ? "text-slate-500"
                                : isCompleted
                                ? "text-emerald-300"
                                : "text-amber-300"
                            }`}
                          >
                            {isUnlocked ? card.englishWord : `Reto ${idx + 1} 🔒`}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
                            {isUnlocked ? card.spanishMeaning : "Bloqueado"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FEATURE 3 & 4: INTERACTIVE MINIGAME & REACTIVE MASCOT VIEW   */}
        {/* ============================================================ */}
        {activeView === "level" && (
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Minigame Mode Switcher Pills */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800">
              <button
                onClick={() => {
                  kidsSFX.playPopBubble();
                  setActiveView("map");
                }}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver al Mapa</span>
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                {[
                  { id: "dino_snack", label: "Dino Snack", icon: "🍎" },
                  { id: "voice_jump", label: "Voice Jump", icon: "🎤" },
                  { id: "block_bash", label: "Block Bash", icon: "🧱" },
                  { id: "bubble_spelling", label: "Bubble Pop", icon: "🫧" },
                  { id: "pipe_tunnel", label: "Dino Pipe", icon: "🟢" },
                ].map((gm) => (
                  <button
                    key={gm.id}
                    onClick={() => {
                      kidsSFX.playPopBubble();
                      setGameMode(gm.id as KidsGameMode);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap active:scale-95 cursor-pointer ${
                      gameMode === gm.id
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{gm.icon} </span>
                    <span>{gm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Stage Grid: Mascot Canvas on Left + Interactive Challenge on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
              {/* Left Column: Reactive Mascot with Drop Zone */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-2xl relative">
                {/* Companion Selector Pills */}
                <div className="w-full flex items-center justify-center gap-1.5 mb-3 bg-slate-950/60 p-1 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
                  {KIDS_COMPANIONS.map((comp) => {
                    const isActive = comp.id === selectedCompanionId;
                    return (
                      <button
                        key={comp.id}
                        onClick={() => {
                          kidsSFX.playPopBubble();
                          setSelectedCompanionId(comp.id);
                          setMascotMood("speaking");
                          setMouthIntensity(0.95);
                          const quote = comp.greetingPhrases(currentCard.englishWord)[0];
                          speakText(quote, comp.avatarConfig, undefined, () => {
                            setMascotMood("happy");
                            setMouthIntensity(0);
                          });
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition duration-200 whitespace-nowrap ${
                          isActive
                            ? "bg-gradient-to-r " +
                              comp.themeColor +
                              " text-white shadow-md shadow-amber-500/20 scale-105"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        }`}
                      >
                        <span>{comp.emoji}</span>
                        <span className="text-[11px]">{comp.name.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mascot 2D HD Vector Canvas with Drag & Drop Feeding Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDropFood}
                  onClick={handleMascotClick}
                  className={`w-full max-w-[270px] h-64 sm:h-72 rounded-3xl bg-gradient-to-tr ${
                    currentCompanion.themeColor
                  } p-1 shadow-2xl shadow-orange-500/25 cursor-pointer group transition-all duration-300 relative flex items-center justify-center ${
                    isMascotJumping ? "-translate-y-8 scale-105 rotate-[-3deg] shadow-cyan-400/50" : ""
                  } ${
                    isDraggingFood ? "ring-4 ring-amber-400 scale-105" : "hover:scale-[1.02]"
                  }`}
                  title={`¡Arrastra la comida hacia ${currentCompanion.name} para alimentarlo!`}
                >
                  {/* Sonic Wave Rings during Voice Jump listening */}
                  {isListening && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
                      <div className="w-72 h-72 rounded-full border-4 border-cyan-400/40 animate-ping" />
                      <div className="w-80 h-80 rounded-full border-2 border-pink-400/30 animate-pulse" />
                    </div>
                  )}

                  <div className="w-full h-full bg-slate-950/90 rounded-[22px] overflow-hidden relative flex flex-col items-center justify-center p-2">
                    <Avatar2DCanvas
                      config={currentCompanion.avatarConfig}
                      isListening={isListening}
                      animationState={
                        mascotMood === "speaking"
                          ? "speaking"
                          : mascotMood === "celebrating"
                          ? "celebrating"
                          : mascotMood === "encouraging"
                          ? "encouraging"
                          : mascotMood === "eating"
                          ? "speaking"
                          : isListening
                          ? "listening"
                          : "idle"
                      }
                      mouthIntensity={mouthIntensity}
                      stageMousePos={foodDragPos}
                      onMascotClick={handleMascotClick}
                    />

                    <span className="absolute top-2 right-2 text-lg drop-shadow-md z-10">
                      {currentCompanion.emoji}
                    </span>

                    {/* Feeding Zone Drop Hint Banner */}
                    {gameMode === "dino_snack" && (
                      <div className={`absolute bottom-2 left-2 right-2 py-1 px-2 rounded-xl text-slate-950 font-black text-[10px] text-center shadow-lg border border-white/30 z-10 transition-all ${
                        isDraggingFood
                          ? "bg-emerald-400 text-slate-950 animate-pulse scale-105"
                          : "bg-amber-500/90 backdrop-blur-md animate-bounce"
                      }`}>
                        {isDraggingFood ? "😋 ¡Suelta la comida en mi boca!" : "🍖 ¡Arrastra la comida aquí!"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Floor Shadow beneath Mascot */}
                <div
                  className={`w-36 h-3 rounded-full bg-black/60 blur-md mx-auto transition-all duration-300 mt-1 ${
                    isMascotJumping ? "scale-50 opacity-25" : "scale-100 opacity-70"
                  }`}
                />

                {/* Mascot Soundboard */}
                <div className="mt-3 text-center w-full flex flex-col items-center gap-2">
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {currentCompanion.soundboard.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          kidsSFX.playPopBubble();
                          setMascotMood("speaking");
                          setMouthIntensity(0.9);
                          speakText(
                            item.phrase,
                            currentCompanion.avatarConfig,
                            undefined,
                            () => {
                              setMascotMood("happy");
                              setMouthIntensity(0);
                            }
                          );
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-[10px] font-bold transition active:scale-95 hover:border-amber-500/40 hover:text-amber-300"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Giant Minigame Challenge Card */}
              <div className="lg:col-span-8 flex flex-col items-center">
                <div
                  className={`w-full max-w-xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-2 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col items-center text-center transition-all duration-300 ${
                    comboCount >= 3
                      ? "border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.35)] ring-4 ring-amber-400/40"
                      : "border-slate-700/80"
                  }`}
                >
                  {/* Top Level Mission Info */}
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        Nivel {currentCardIndex + 1} de {currentWorld.cards.length}
                      </span>
                    </span>

                    {comboCount >= 2 && (
                      <span className="text-xs font-black text-orange-400 bg-orange-500/20 border border-orange-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <Flame className="w-3.5 h-3.5" /> Combo x{comboCount}
                      </span>
                    )}

                    {kidsProgress.completedCards.includes(currentCard.id) && (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ¡Completado!
                      </span>
                    )}
                  </div>

                  {/* Target Card Visual Banner */}
                  <div
                    onClick={() => handleSpeakCard(currentCard)}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-850 border-2 border-amber-400/40 flex items-center justify-center text-6xl sm:text-7xl shadow-inner cursor-pointer hover:scale-105 active:scale-95 transition duration-200 my-1 select-none relative"
                    title="Toca para escuchar la pronunciación"
                  >
                    {currentCard.emoji}
                    <span className="absolute -bottom-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                      TOCA PARA OÍR 🔊
                    </span>
                  </div>

                  {/* English Word & Spanish Translation */}
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wide mt-2 mb-1">
                    {currentCard.englishWord}
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-base sm:text-lg font-bold text-amber-300">
                      {currentCard.spanishMeaning}
                    </span>
                    <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                      "{currentCard.phoneticSimple}"
                    </span>
                  </div>

                  {/* MINIGAME 1: DINO SNACK (DRAG & DROP / CLICK FOOD) */}
                  {gameMode === "dino_snack" && (
                    <div className="w-full my-2">
                      <p className="text-xs text-amber-300 font-bold mb-2">
                        🍎 ¡Arrastra la comida correcta hacia la boca de {currentCompanion.name.split(" ")[0]} o tócala para alimentarlo!
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {(currentCard.options || [currentCard.englishWord, "Cookie 🍪", "Apple 🍎"]).map(
                          (opt, idx) => {
                            const isHitting = blockHitEffect === idx;
                            return (
                              <div
                                key={idx}
                                draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragEnd={handleDragEnd}
                                onClick={() => {
                                  setIsDraggingFood(false);
                                  handleOptionSelect(idx);
                                }}
                                className={`p-3 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing transition-all duration-200 active:scale-90 hover:scale-105 select-none touch-manipulation shadow-lg ${
                                  isHitting
                                    ? "bg-gradient-to-tr from-amber-300 to-yellow-400 text-slate-950 border-white scale-110 shadow-xl shadow-amber-400/50 animate-bounce"
                                    : "bg-gradient-to-b from-rose-600/90 to-amber-600/90 hover:from-rose-500 hover:to-amber-500 text-white border-amber-400 shadow-md shadow-rose-950/50"
                                }`}
                              >
                                <span className="text-2xl animate-pulse">🍽️</span>
                                <span className="truncate w-full">{opt}</span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* MINIGAME 2: VOICE JUMP (MICROPHONE RETO) */}
                  {gameMode === "voice_jump" && (
                    <div className="w-full my-2 flex flex-col items-center gap-3">
                      {/* Subtitle & Target Guide */}
                      <div className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
                        <div className="flex items-center gap-2 text-left">
                          <span className="text-2xl">{currentCard.emoji}</span>
                          <div>
                            <div className="text-[11px] text-cyan-300 font-bold uppercase tracking-wider">
                              Di en voz alta para saltar:
                            </div>
                            <div className="text-sm font-black text-white">
                              "{currentCard.englishWord}"{" "}
                              <span className="text-xs text-slate-400 font-normal">
                                ({currentCard.spanishMeaning})
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          id="listen-voice-jump-target-btn"
                          onClick={() => {
                            kidsSFX.playPopBubble();
                            speakText(
                              currentCard.englishWord,
                              currentCompanion.avatarConfig,
                              undefined,
                              undefined,
                              undefined,
                              { forceLang: "en-US", rateMultiplier: 0.85 }
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-black flex items-center gap-1.5 transition cursor-pointer border border-cyan-500/30"
                          title="Escuchar pronunciación modelo"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Escuchar</span>
                        </button>
                      </div>

                      {/* Main Mic Button with Pulsing Wave Indicator */}
                      <div className="w-full relative">
                        {isListening && (
                          <div className="absolute -inset-1 rounded-3xl bg-rose-500/30 animate-pulse blur-sm pointer-events-none" />
                        )}

                        <button
                          type="button"
                          id="kids-voice-jump-record-btn"
                          onClick={handleVoiceJumpPractice}
                          className={`w-full py-4 px-6 rounded-3xl font-black text-sm sm:text-base shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer select-none relative z-10 ${
                            isListening
                              ? "bg-gradient-to-r from-rose-500 to-red-600 text-white animate-pulse shadow-rose-600/40 ring-4 ring-rose-400/50"
                              : "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/30"
                          }`}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="w-5 h-5 animate-spin" />
                              <span>¡Escuchando tu voz! Habla ahora...</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-5 h-5" />
                              <span>¡Tocar Micrófono y Hablar para Saltar! (+25 🪙)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Real-time speech transcript bubble */}
                      {voiceJumpTranscript && (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs font-medium text-cyan-200 animate-in fade-in">
                          Escuchamos: <span className="font-bold font-mono">"{voiceJumpTranscript}"</span>
                        </div>
                      )}

                      {/* Action Bar: Test de Funcionamiento + Simulación Rápida */}
                      <div className="w-full grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          id="open-voice-jump-test-modal-btn"
                          onClick={() => {
                            kidsSFX.playPopBubble();
                            setIsVoiceJumpTestModalOpen(true);
                          }}
                          className="py-2.5 px-3 rounded-2xl bg-slate-800/90 hover:bg-slate-750 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer select-none"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>🛠️ Prueba de Micrófono</span>
                        </button>

                        <button
                          type="button"
                          id="quick-simulate-jump-btn"
                          onClick={() => {
                            kidsSFX.playJumpSound();
                            setVoiceJumpTranscript(currentCard.englishWord);
                            handleSuccessReward(3);
                          }}
                          className="py-2.5 px-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer select-none"
                          title="Simula un salto exitoso con voz instantáneamente para probar"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>⚡ Salto de Prueba (Simular)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MINIGAME 3: BLOCK BASH (8-BIT BOX HIT) */}
                  {gameMode === "block_bash" && (
                    <div className="w-full my-2">
                      <p className="text-xs text-slate-300 font-bold mb-2">
                        🧱 ¡Golpea el bloque flotante correcto con un salto retro!
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {(currentCard.options || [currentCard.englishWord, "Wrong 1", "Wrong 2"]).map(
                          (opt, idx) => {
                            const isHitting = blockHitEffect === idx;
                            return (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  if (typeof window !== "undefined") {
                                    fireParticles(rect.left + rect.width / 2, rect.top, "coins", 10);
                                    fireParticles(rect.left + rect.width / 2, rect.top, "sparks", 12);
                                  }
                                  handleOptionSelect(idx);
                                }}
                                className={`p-3 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90 cursor-pointer ${
                                  isHitting
                                    ? "bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 border-white -translate-y-4 scale-110 shadow-2xl shadow-yellow-400/60 ring-4 ring-yellow-300 animate-bounce"
                                    : "bg-gradient-to-b from-amber-600/90 to-amber-700/90 hover:from-amber-500 hover:to-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/50 hover:-translate-y-1"
                                }`}
                              >
                                <span className={`text-xl sm:text-2xl transition-transform duration-200 ${isHitting ? "rotate-12 scale-125" : ""}`}>
                                  {isHitting ? "⭐" : "❓"}
                                </span>
                                <span className="truncate w-full">{opt}</span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* MINIGAME 4: BUBBLE POP SPELLING */}
                  {gameMode === "bubble_spelling" && (
                    <BubblePopSpellingMinigame
                      targetWord={currentCard.englishWord}
                      targetEmoji={currentCard.emoji}
                      spanishTranslation={currentCard.spanishMeaning}
                      companionName={currentCompanion.name}
                      companionAvatarConfig={currentCompanion.avatarConfig}
                      onSuccess={() => handleSuccessReward(3)}
                    />
                  )}

                  {/* MINIGAME 5: DINO PIPE TUNNEL */}
                  {(gameMode === "pipe_tunnel" || gameMode === "pipe_listening") && (
                    <DinoPipeTunnelMinigame
                      targetWord={currentCard.englishWord}
                      targetEmoji={currentCard.emoji}
                      spanishTranslation={currentCard.spanishMeaning}
                      companionName={currentCompanion.name}
                      companionAvatarConfig={currentCompanion.avatarConfig}
                      distractorOptions={
                        currentCard.options?.filter(
                          (opt) => opt.toLowerCase() !== currentCard.englishWord.toLowerCase()
                        )
                      }
                      onSuccess={() => handleSuccessReward(3)}
                    />
                  )}

                  {/* Feedback Message Alert with prominent Victory Next Card button */}
                  {feedbackMessage && (
                    <div
                      className={`w-full p-3 rounded-2xl border text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-in fade-in zoom-in-95 duration-200 my-2 relative z-20 ${
                        feedbackMessage.type === "success"
                          ? "bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-900/30"
                          : feedbackMessage.type === "try_again"
                          ? "bg-amber-950/90 border-amber-500 text-amber-200 shadow-lg shadow-amber-900/30"
                          : "bg-blue-950/90 border-blue-500 text-blue-200"
                      }`}
                    >
                      <span className="flex-1 text-center sm:text-left">{feedbackMessage.text}</span>
                      {feedbackMessage.type === "success" && (
                        <button
                          type="button"
                          id="kids-victory-next-btn"
                          onClick={() => {
                            if (autoAdvanceTimerRef.current) {
                              clearTimeout(autoAdvanceTimerRef.current);
                              autoAdvanceTimerRef.current = null;
                            }
                            nextCard();
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/30 transition active:scale-95 cursor-pointer shrink-0 touch-manipulation select-none"
                        >
                          <span>Siguiente Tarjeta</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Level Controls Footer */}
                  <div className="w-full flex items-center justify-between pt-3 border-t border-slate-800 mt-2 relative z-20">
                    <button
                      type="button"
                      id="kids-footer-prev-btn"
                      onClick={prevCard}
                      className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer touch-manipulation select-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {currentWorld.cards.map((_, i) => (
                        <span
                          key={i}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            i === currentCardIndex
                              ? "w-6 bg-amber-400"
                              : "w-2 bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      id="kids-footer-next-btn"
                      onClick={nextCard}
                      className="flex items-center gap-1.5 text-xs font-black text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3.5 py-1.5 rounded-xl transition active:scale-95 cursor-pointer touch-manipulation select-none shadow-sm"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* FEATURE 3: DINO EGG HATCHING INCUBATOR MODAL                 */}
      {/* ============================================================ */}
      {isEggModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEggModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                Incubadora de Dinosaurio
              </span>
              <h3 className="text-xl font-black text-white mb-3">
                {currentEgg.title}
              </h3>

              {/* Egg Giant Interactive Button */}
              <div
                onClick={handlePerformEggHatch}
                className={`w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border-4 border-emerald-400/50 flex items-center justify-center text-7xl shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition duration-300 my-3 select-none ${
                  eggCrackAnim ? "animate-spin" : "animate-bounce"
                }`}
                title="¡Toca para eclosionar el huevo!"
              >
                {currentEgg.emoji}
              </div>

              <p className="text-xs text-slate-300 max-w-xs mt-2 font-medium">
                {currentEgg.description}
              </p>

              {/* Daily Streak Progress */}
              <div className="w-full bg-slate-800/80 rounded-2xl p-3 my-4 border border-slate-700 text-left">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Racha de Hoy:</span>
                  <span className="text-emerald-400">
                    {kidsProgress.dailyQuestsCompleted} de 5 Retos
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{
                      width: `${(kidsProgress.dailyQuestsCompleted / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handlePerformEggHatch}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition active:scale-95 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                <span>¡Eclosionar / Romper Cascarón! (+50 🪙)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explorer Shop Modal */}
      {isShopOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border-2 border-orange-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsShopOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-2xl shadow-lg">
                🛍️
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-100">
                  Tienda de Exploradores
                </h3>
                <p className="text-xs text-amber-300 font-bold">
                  Tus Monedas Fósil: 🪙 {kidsProgress.fossilCoins}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
              {EXPLORER_SHOP_ITEMS.map((item) => {
                const isEquipped =
                  kidsProgress.equippedHat === item.id ||
                  kidsProgress.equippedBackpack === item.id ||
                  kidsProgress.equippedAura === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-850 border border-slate-700/80 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{item.emoji}</span>
                      <div className="text-left">
                        <h4 className="text-xs font-black text-white">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
                      <span className="text-xs font-black text-amber-400">
                        🪙 {item.price}
                      </span>
                      <button
                        onClick={() => handleBuyShopItem(item)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-black transition active:scale-95 ${
                          isEquipped
                            ? "bg-emerald-600 text-white"
                            : kidsProgress.fossilCoins >= item.price
                            ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isEquipped ? "Equipado ✅" : "Comprar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sticker Album Modal */}
      {isStickerAlbumOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border-2 border-purple-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsStickerAlbumOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
                📖
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-100">
                  Álbum Mágico de Stickers
                </h3>
                <p className="text-xs text-slate-400">
                  ¡Gana estrellas superando niveles para coleccionar todos los stickers!
                </p>
              </div>
            </div>

            {/* Sticker Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              {STICKER_CATALOG.map((st) => {
                const isUnlocked = kidsProgress.unlockedStickers.includes(st.id);
                return (
                  <div
                    key={st.id}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                      isUnlocked
                        ? "bg-gradient-to-b from-purple-950/40 to-slate-800/80 border-purple-500/50 shadow-md scale-100"
                        : "bg-slate-950/60 border-slate-800 opacity-50 grayscale"
                    }`}
                  >
                    <span className="text-4xl my-1">{st.emoji}</span>
                    <h4 className="text-xs font-bold text-slate-100 mt-1">
                      {st.name}
                    </h4>
                    <span className="text-[10px] text-amber-300 font-bold mt-0.5">
                      {isUnlocked ? "✨ ¡Coleccionado!" : `🔒 ${st.starsRequired} ⭐`}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setIsStickerAlbumOpen(false)}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition active:scale-95 shadow-lg shadow-purple-600/30"
            >
              ¡Seguir Ganando Estrellas!
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* LEVEL VICTORY & NEXT CHALLENGE MODAL (¡RETO SUPERADO!)        */}
      {/* ============================================================ */}
      {victoryModalData && (
        <div className="fixed inset-0 z-[130] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl shadow-amber-500/20 relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top decorative glow bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400" />

            {/* Close / Dismiss button */}
            <button
              type="button"
              id="kids-victory-close-btn"
              onClick={handleGoToAdventureMap}
              className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
              title="Volver al mapa"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase mb-2">
              <PartyPopper className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>
                {victoryModalData.isWorldBoss
                  ? `👑 ¡Mundo Conquistado!`
                  : `🎉 ¡Reto ${victoryModalData.cardIndex + 1} Completado!`}
              </span>
            </div>

            {/* 3 Golden Stars Celebration */}
            <div className="flex items-center justify-center gap-2.5 my-2">
              {[1, 2, 3].map((starIdx) => (
                <div
                  key={starIdx}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-yellow-100 flex items-center justify-center shadow-lg shadow-amber-400/50 animate-bounce"
                  style={{ animationDelay: `${starIdx * 120}ms` }}
                >
                  <Star className="w-7 h-7 fill-slate-950 text-slate-950" />
                </div>
              ))}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white mt-1 mb-1">
              {victoryModalData.isWorldBoss
                ? `¡Completaste todo el ${victoryModalData.worldTitle}!`
                : `¡Excelente! ¡Aprendiste "${victoryModalData.completedCard.englishWord}"!`}
            </h3>

            {/* Card Info Box */}
            <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3 my-2.5 flex items-center justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-850 border border-amber-400/30 flex items-center justify-center text-3xl shrink-0">
                {victoryModalData.completedCard.emoji}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-black text-white">
                  {victoryModalData.completedCard.englishWord}
                </div>
                <div className="text-xs text-amber-300 font-bold">
                  {victoryModalData.completedCard.spanishMeaning}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  "{victoryModalData.completedCard.phoneticSimple}"
                </div>
              </div>
              <button
                type="button"
                id="kids-repeat-word-audio-btn"
                onClick={() => handleSpeakCard(victoryModalData.completedCard)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                title="Repetir pronunciación"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Rewards Won */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>+3 Estrellas</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black flex items-center gap-1">
                <span>🪙</span>
                <span>+{victoryModalData.coinsEarned} Monedas</span>
              </span>
            </div>

            {/* Next Challenge Preview */}
            {victoryModalData.nextCard ? (
              <div className="w-full bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/50 rounded-2xl p-3 mb-3 text-left">
                <div className="flex items-center justify-between text-[11px] font-black text-emerald-400 uppercase tracking-wider mb-1">
                  <span>Próximo Reto Desbloqueado:</span>
                  <span>Reto {victoryModalData.cardIndex + 2} de {victoryModalData.totalCards}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{victoryModalData.nextCard.emoji}</span>
                  <div>
                    <div className="text-xs font-black text-white">
                      {victoryModalData.nextCard.englishWord}
                    </div>
                    <div className="text-[11px] text-emerald-300 font-medium">
                      {victoryModalData.nextCard.spanishMeaning}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Auto-Advance Countdown Bar */}
            {victoryModalData.nextCard && (
              <div className="w-full mb-3">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold mb-1">
                  <span>
                    {isAutoAdvancePaused
                      ? "⏸️ Avance en pausa"
                      : `🚀 Pasando al Reto ${victoryModalData.cardIndex + 2} en ${autoAdvanceCountdown}s...`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAutoAdvancePaused(!isAutoAdvancePaused)}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isAutoAdvancePaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{isAutoAdvancePaused ? "Reanudar" : "Pausar"}</span>
                  </button>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-1000 ease-linear"
                    style={{
                      width: isAutoAdvancePaused ? "100%" : `${(autoAdvanceCountdown / 4) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2">
              {victoryModalData.nextCard ? (
                <button
                  type="button"
                  id="kids-next-challenge-btn"
                  onClick={handleGoToNextChallenge}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer touch-manipulation select-none"
                >
                  <span>¡Jugar Reto {victoryModalData.cardIndex + 2}: {victoryModalData.nextCard.englishWord}!</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  id="kids-finish-world-btn"
                  onClick={handleGoToAdventureMap}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer touch-manipulation select-none"
                >
                  <span>🏆 ¡Ver mi Corona en el Mapa!</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  id="kids-return-map-btn"
                  onClick={handleGoToAdventureMap}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer touch-manipulation select-none"
                >
                  <span>🗺️ Ver Mapa</span>
                </button>
                <button
                  type="button"
                  id="kids-replay-challenge-btn"
                  onClick={handleReplayCurrentChallenge}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer touch-manipulation select-none"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repetir Reto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Jump Microphone Test & Diagnostics Modal */}
      <VoiceJumpTestModal
        isOpen={isVoiceJumpTestModalOpen}
        onClose={() => setIsVoiceJumpTestModalOpen(false)}
        targetWord={currentCard.englishWord}
        targetEmoji={currentCard.emoji}
        phoneticGuide={currentCard.phoneticSimple}
        spanishTranslation={currentCard.spanishMeaning}
        companionName={currentCompanion.name}
        companionAvatarConfig={currentCompanion.avatarConfig}
        onTriggerJumpTest={() => {
          setIsVoiceJumpTestModalOpen(false);
          kidsSFX.playJumpSound();
          handleSuccessReward(3);
        }}
      />

      {/* Floating Mobile Quick Switch to Adults */}
      <div className="fixed bottom-4 right-4 z-[120] sm:hidden">
        <button
          type="button"
          id="kids-floating-btn-adults"
          onClick={handleSwitchToAdults}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-900/95 border-2 border-indigo-500 text-white shadow-2xl shadow-black/80 text-xs font-black backdrop-blur-md active:scale-90 transition cursor-pointer touch-manipulation select-none"
        >
          <span className="text-sm">💼</span>
          <span>Modo Adultos</span>
        </button>
      </div>
    </div>
  );
};
