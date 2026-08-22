import React, { useState, useEffect } from "react";
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
} from "../types";
import {
  getStoredKidsProgress,
  saveStoredKidsProgress,
  kidsSFX,
} from "../utils/kidsAudioAndStorage";
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
} from "lucide-react";
import confetti from "canvas-confetti";

interface KidsModeViewProps {
  onSwitchToAdultsMode: () => void;
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

export const KidsModeView: React.FC<KidsModeViewProps> = ({
  onSwitchToAdultsMode,
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

  const [mascotMood, setMascotMood] = useState<
    "happy" | "speaking" | "celebrating" | "encouraging" | "eating"
  >("happy");
  const [blockHitEffect, setBlockHitEffect] = useState<number | null>(null);
  const [comboCount, setComboCount] = useState<number>(0);
  const [isDraggingFood, setIsDraggingFood] = useState<boolean>(false);
  const [mouthIntensity, setMouthIntensity] = useState<number>(0);

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

  // Mascot speak
  const handleMascotClick = () => {
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

  // Drag & Drop for Dino Snack
  const handleDragStart = (e: React.DragEvent, optIndex: number) => {
    e.dataTransfer.setData("text/plain", optIndex.toString());
    setIsDraggingFood(true);
    kidsSFX.playPopBubble();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropFood = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFood(false);
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

    // Crunch sequence
    setTimeout(() => setMouthIntensity(0.2), 150);
    setTimeout(() => setMouthIntensity(0.9), 300);
    setTimeout(() => setMouthIntensity(0.1), 450);
    setTimeout(() => setMouthIntensity(0.8), 600);
    setTimeout(() => {
      setMascotMood("celebrating");
      setMouthIntensity(0);
    }, 800);
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
      setMascotMood("listening");
      setFeedbackMessage({
        text: `¡${currentCompanion.name} está escuchando! Di en voz alta: "${currentCard.englishWord}"...`,
        type: "neutral",
      });

      recognition.onresult = (event: any) => {
        setIsListening(false);
        const transcript = event.results[0][0].transcript.toLowerCase();
        const target = currentCard.englishWord.toLowerCase();

        // High tolerance recognition for kids
        const isAcceptable =
          transcript.includes(target) ||
          target.includes(transcript) ||
          (ageGroup === "preschool" && transcript.length >= 2);

        if (isAcceptable) {
          playJumpSound();
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

    setTimeout(() => {
      setMascotMood("happy");
    }, 2800);
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
    playPopSound();
    setCurrentCardIndex(cardIndex);
    setFeedbackMessage(null);
    setActiveView("level");
  };

  const nextCard = () => {
    playPopSound();
    setFeedbackMessage(null);
    setCurrentCardIndex((prev) => (prev + 1) % currentWorld.cards.length);
  };

  const prevCard = () => {
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

      {/* Background Animated Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar for Kids */}
      <header className="w-full bg-slate-900/90 backdrop-blur-2xl border-b border-amber-500/20 sticky top-0 z-30 px-3 sm:px-6 py-2.5 shadow-lg shadow-black/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Adventure Title */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                kidsSFX.playPopBubble();
                setActiveView("map");
              }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-amber-500 to-rose-500 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition"
              title="Volver al Mapa de Aventura"
            >
              <span className="text-xl">🗺️</span>
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                  VT English IA Kids
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  Modo Niños 4-12
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden xs:block">
                Aprende jugando con Pip, Rexy, Mario y Luigi
              </p>
            </div>
          </div>

          {/* Right Controls: Coins, Stars, Incubator Egg, Shop & Mode Switch */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Fossil Coins */}
            <div
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black shadow-sm cursor-pointer hover:bg-amber-500/30 transition active:scale-95"
              onClick={() => {
                kidsSFX.playCoinSound();
                setIsShopOpen(true);
              }}
              title="Monedas Fósil para la Tienda"
            >
              <span className="text-sm">🪙</span>
              <span>{kidsProgress.fossilCoins}</span>
            </div>

            {/* Stars Counter Pill */}
            <div
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black shadow-md shadow-amber-500/10 cursor-pointer hover:scale-105 active:scale-95 transition"
              onClick={() => {
                kidsSFX.playPopBubble();
                setIsStickerAlbumOpen(true);
              }}
              title="Toca para ver tu Álbum de Stickers"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" />
              <span>{kidsProgress.totalStars}</span>
            </div>

            {/* Egg Incubator Pill (Daily Quest) */}
            <button
              onClick={handleHatchEggClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900/80 transition active:scale-95"
              title={`Incubadora Dino: Reto Diario ${kidsProgress.dailyQuestsCompleted}/5`}
            >
              <span className="text-sm animate-bounce">{currentEgg.emoji}</span>
              <span className="hidden md:inline font-bold">
                {kidsProgress.dailyQuestsCompleted >= 5 ? "¡Listo! 🎁" : `${kidsProgress.dailyQuestsCompleted}/5`}
              </span>
            </button>

            {/* Shop Button */}
            <button
              onClick={() => {
                kidsSFX.playPopBubble();
                setIsShopOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-950/60 hover:bg-orange-900/60 text-orange-300 border border-orange-500/40 text-xs font-bold transition active:scale-95 shadow-sm"
              title="Tienda de Exploradores"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">Tienda</span>
            </button>

            {/* Switch to Adults Mode */}
            <button
              onClick={onSwitchToAdultsMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition active:scale-95 shadow-md"
              title="Regresar al modo para adultos"
            >
              <span>🧑</span>
              <span className="hidden md:inline">Adultos Pro</span>
              <span className="md:hidden">Adultos</span>
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
                      setCurrentCardIndex(0);
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
                    onClick={() => openLevel(0)}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition active:scale-95"
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

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {[
                  { id: "dino_snack", label: "Dino Snack (Arrastrar)", icon: "🍎" },
                  { id: "voice_jump", label: "Voice Jump (Micrófono)", icon: "🎤" },
                  { id: "block_bash", label: "Block Bash (8-bit)", icon: "🧱" },
                ].map((gm) => (
                  <button
                    key={gm.id}
                    onClick={() => {
                      kidsSFX.playPopBubble();
                      setGameMode(gm.id as KidsGameMode);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
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
                  } p-1 shadow-2xl shadow-orange-500/25 cursor-pointer group transition duration-300 relative flex items-center justify-center ${
                    isDraggingFood ? "ring-4 ring-amber-400 scale-105" : "hover:scale-[1.02]"
                  }`}
                  title={`¡Arrastra la comida hacia ${currentCompanion.name} para alimentarlo!`}
                >
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
                      onMascotClick={handleMascotClick}
                    />

                    <span className="absolute top-2 right-2 text-lg drop-shadow-md z-10">
                      {currentCompanion.emoji}
                    </span>

                    {/* Feeding Zone Drop Hint Banner */}
                    {gameMode === "dino_snack" && (
                      <div className="absolute bottom-2 left-2 right-2 py-1 px-2 rounded-xl bg-amber-500/90 backdrop-blur-md text-slate-950 font-black text-[10px] text-center shadow-lg border border-white/30 z-10 animate-bounce">
                        🍖 ¡Arrastra la comida aquí para alimentar!
                      </div>
                    )}
                  </div>
                </div>

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
                <div className="w-full max-w-xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-2 border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
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
                                onClick={() => handleOptionSelect(idx)}
                                className={`p-3 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing transition-all duration-200 active:scale-95 ${
                                  isHitting
                                    ? "bg-amber-400 text-slate-950 border-white scale-110 shadow-xl shadow-amber-400/50"
                                    : "bg-gradient-to-b from-rose-600/90 to-amber-600/90 hover:from-rose-500 hover:to-amber-500 text-white border-amber-400 shadow-md shadow-rose-950/50"
                                }`}
                              >
                                <span className="text-2xl">🍽️</span>
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
                      <p className="text-xs text-cyan-300 font-bold">
                        🎤 ¡Toca el micrófono y pronuncia la palabra fuerte para que {currentCompanion.name.split(" ")[0]} salte!
                      </p>
                      <button
                        onClick={handleVoiceJumpPractice}
                        className={`w-full py-4 px-6 rounded-3xl font-black text-sm sm:text-base shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 ${
                          isListening
                            ? "bg-rose-600 text-white animate-pulse shadow-rose-600/40 ring-4 ring-rose-400/50"
                            : "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/30"
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-5 h-5 animate-spin" />
                            <span>¡Escuchando tu voz...!</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5" />
                            <span>¡Decir en Inglés para Saltar! (+25 🪙)</span>
                          </>
                        )}
                      </button>
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
                                onClick={() => handleOptionSelect(idx)}
                                className={`p-3 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90 ${
                                  isHitting
                                    ? "bg-amber-400 text-slate-950 border-white scale-110 shadow-xl shadow-amber-400/50"
                                    : "bg-gradient-to-b from-amber-600/90 to-amber-700/90 hover:from-amber-500 hover:to-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/50"
                                }`}
                              >
                                <span className="text-xl sm:text-2xl">❓</span>
                                <span className="truncate w-full">{opt}</span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feedback Message Alert */}
                  {feedbackMessage && (
                    <div
                      className={`w-full p-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-200 my-2 ${
                        feedbackMessage.type === "success"
                          ? "bg-emerald-950/90 border-emerald-500 text-emerald-200"
                          : feedbackMessage.type === "try_again"
                          ? "bg-amber-950/90 border-amber-500 text-amber-200"
                          : "bg-blue-950/90 border-blue-500 text-blue-200"
                      }`}
                    >
                      <span>{feedbackMessage.text}</span>
                    </div>
                  )}

                  {/* Level Controls Footer */}
                  <div className="w-full flex items-center justify-between pt-3 border-t border-slate-800 mt-2">
                    <button
                      onClick={prevCard}
                      className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition"
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
                      onClick={nextCard}
                      className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition"
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
    </div>
  );
};
