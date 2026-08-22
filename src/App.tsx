import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import {
  AvatarAnimationState,
  AvatarConfig,
  CEFRLevel,
  ChatMessage,
  TeachingMode,
  TopicScenario,
  UserStats,
  VocabularyItem,
  UserGamificationState,
  WordAccuracy,
  ScenarioGoal,
  AppExperienceMode,
} from "./types";
import {
  getStoredAvatarConfig,
  getStoredHistory,
  getStoredLevel,
  getStoredStats,
  getStoredTopic,
  getStoredVocabulary,
  getStoredGamification,
  saveAvatarConfig,
  saveStoredHistory,
  saveStoredLevel,
  saveStoredStats,
  saveStoredTopic,
  saveStoredVocabulary,
  saveStoredGamification,
  calculateSimilarity,
  restoreLargeAvatarAssets,
} from "./utils/storage";
import { TOPIC_SCENARIOS, AVATAR_PRESETS, TEACHING_MODES } from "./data/presets";
import { speakText, stopSpeaking, voiceRecognizer } from "./utils/speech";
import { Navbar } from "./components/Navbar";
import { KidsModeView } from "./components/KidsModeView";
import { Avatar2DCanvas } from "./components/Avatar2DCanvas";
import { AvatarCanvas } from "./components/AvatarCanvas";
import { DialogueBubble } from "./components/DialogueBubble";
import { InteractionBar } from "./components/InteractionBar";
import { PronunciationMeter } from "./components/PronunciationMeter";
import { ScenarioMissionsPanel } from "./components/ScenarioMissionsPanel";
import { WaveformEchoTrainerModal } from "./components/WaveformEchoTrainerModal";
import { SRSFlashcardsModal } from "./components/SRSFlashcardsModal";
import { AmbienceSelectorModal } from "./components/AmbienceSelectorModal";
import { ToolsDrawerModal } from "./components/ToolsDrawerModal";
import { ambienceEngine } from "./utils/ambience";
import { importVocabularyToFlashcards, getStoredFlashcards } from "./utils/srs";
import { SpeedSpeakingModal } from "./components/SpeedSpeakingModal";
import { GamificationModal } from "./components/GamificationModal";
import { AvatarCustomizerModal } from "./components/AvatarCustomizerModal";
import { TopicSelectorModal } from "./components/TopicSelectorModal";
import { LevelSelectorModal } from "./components/LevelSelectorModal";
import { TeachingModeModal } from "./components/TeachingModeModal";
import { VocabularyNotebookModal } from "./components/VocabularyNotebookModal";
import { TranscriptHistory } from "./components/TranscriptHistory";
import { PhoneticCoachModal } from "./components/PhoneticCoachModal";
import { BottomNavBar, MainAppTab } from "./components/BottomNavBar";
import { AdultLearningPath, LessonNode } from "./components/AdultLearningPath";
import { LessonEngineView } from "./components/LessonEngineView";
import { ToolsHubView } from "./components/ToolsHubView";
import { PlacementTestModal } from "./components/PlacementTestModal";
import { QuestsAndShopModal } from "./components/QuestsAndShopModal";
import { GrammarFeedbackSheet } from "./components/GrammarFeedbackSheet";
import { ResearchRoadmapModal } from "./components/ResearchRoadmapModal";
import { RoleplayImmersionModal } from "./components/RoleplayImmersionModal";
import { analyzeGrammar } from "./utils/grammarEngine";
import { GrammarCorrection, RoleplayScenarioItem } from "./types";

export default function App() {
  // State Initialization
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(getStoredAvatarConfig);
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>(getStoredLevel);
  const [teachingMode, setTeachingMode] = useState<TeachingMode>("bilingual_coach");
  const [appExperienceMode, setAppExperienceMode] = useState<AppExperienceMode>(() => {
    try {
      return (localStorage.getItem("app_exp_mode") as AppExperienceMode) || "adults";
    } catch {
      return "adults";
    }
  });

  const handleSwitchToKidsMode = () => {
    setAppExperienceMode("kids");
    try {
      localStorage.setItem("app_exp_mode", "kids");
    } catch {}
  };

  const handleSwitchToAdultsMode = () => {
    setAppExperienceMode("adults");
    try {
      localStorage.setItem("app_exp_mode", "adults");
    } catch {}
  };

  const [activeTopicId, setActiveTopicId] = useState<string>(getStoredTopic);
  const [messages, setMessages] = useState<ChatMessage[]>(getStoredHistory);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(getStoredVocabulary);
  const [userStats, setUserStats] = useState<UserStats>(getStoredStats);
  const [gamification, setGamification] = useState<UserGamificationState>(getStoredGamification);

  // Pronunciation Evaluation State
  const [lastSpokenText, setLastSpokenText] = useState<string>("");
  const [targetPhraseToEvaluate, setTargetPhraseToEvaluate] = useState<string>("");
  const [wordAccuracies, setWordAccuracies] = useState<WordAccuracy[]>([]);
  const [overallPronunciationScore, setOverallPronunciationScore] = useState<number>(0);

  // Interaction & UI State
  const [animationState, setAnimationState] = useState<AvatarAnimationState>("idle");
  const [mouthIntensity, setMouthIntensity] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [handsFreeMode, setHandsFreeMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("vt_handsfree_mode") !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("vt_handsfree_mode", String(handsFreeMode));
    } catch {}
  }, [handsFreeMode]);

  // Restore high-resolution 3D models or custom images from IndexedDB if stored
  useEffect(() => {
    restoreLargeAvatarAssets(avatarConfig).then((restored) => {
      if (
        restored.customGlbUrl !== avatarConfig.customGlbUrl ||
        restored.customImageUrl !== avatarConfig.customImageUrl
      ) {
        setAvatarConfig(restored);
      }
    });
  }, []);

  // Navigation & Modals
  const [activeMainTab, setActiveMainTab] = useState<MainAppTab>("chat");
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState(false);
  const [isQuestsAndShopOpen, setIsQuestsAndShopOpen] = useState(false);
  const [liveGrammarCorrection, setLiveGrammarCorrection] = useState<GrammarCorrection | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isTeachingModeModalOpen, setIsTeachingModeModalOpen] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPhoneticModalOpen, setIsPhoneticModalOpen] = useState(false);
  const [isSpeedSpeakingModalOpen, setIsSpeedSpeakingModalOpen] = useState(false);
  const [isGamificationModalOpen, setIsGamificationModalOpen] = useState(false);
  const [isEchoTrainerModalOpen, setIsEchoTrainerModalOpen] = useState(false);
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState(false);
  const [isAmbienceModalOpen, setIsAmbienceModalOpen] = useState(false);
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);
  const [isResearchRoadmapOpen, setIsResearchRoadmapOpen] = useState(false);
  const [isRoleplayModalOpen, setIsRoleplayModalOpen] = useState(false);
  const [activeLessonNode, setActiveLessonNode] = useState<LessonNode | null>(null);
  const [ambienceMode, setAmbienceMode] = useState<string>("off");
  const [ambienceVolume, setAmbienceVolume] = useState<number>(0.25);
  const [phoneticModalTab, setPhoneticModalTab] = useState<"articulation" | "stress" | "minimal_pairs" | "linking">("articulation");

  // Handler for Roleplay Scenario Launch
  const handleSelectRoleplayScenario = (scenario: RoleplayScenarioItem) => {
    setActiveMainTab("chat");
    setCefrLevel(scenario.difficulty);
    setAnimationState(scenario.avatarMood || "speaking");

    const newTutorMessage: ChatMessage = {
      id: `roleplay-${Date.now()}`,
      sender: "tutor",
      text: scenario.initialTutorMessage,
      timestamp: Date.now(),
      targetEnglishPhrase: scenario.targetVocab?.[0] || scenario.initialTutorMessage,
      teacherCommentary: `[Escenario de Inmersión: ${scenario.title}] Estás hablando con ${scenario.personaName} (${scenario.personaRole}). ¡Responde con naturalidad!`,
      quickChips: [
        `Yes, absolutely! Let's get started.`,
        `Could you repeat that once more, please?`,
        `I'd like to share my thoughts on that.`,
      ],
    };

    const updated = [...messages, newTutorMessage];
    setMessages(updated);
    saveStoredHistory(updated);
    playTutorAudio(scenario.initialTutorMessage, false, "en", scenario.avatarMood || "speaking");
  };

  // Goals State for Active Topic
  const [scenarioGoals, setScenarioGoals] = useState<Record<string, ScenarioGoal[]>>(() => {
    const initial: Record<string, ScenarioGoal[]> = {};
    TOPIC_SCENARIOS.forEach((t) => {
      initial[t.id] = t.goals ? t.goals.map((g) => ({ ...g })) : [];
    });
    return initial;
  });

  // Active topic metadata
  const activeTopic =
    TOPIC_SCENARIOS.find((t) => t.id === activeTopicId) || TOPIC_SCENARIOS[0];

  // Latest tutor message
  const latestTutorMessage =
    [...messages].reverse().find((m) => m.sender === "tutor") || null;

  // Current Quick Chips
  const currentQuickChips = latestTutorMessage?.quickChips || [
    "¡Hola profesora! Estoy listo para practicar.",
    "Could you give me an example of how to say that?",
    "Let's practice a real-life conversation.",
  ];

  // Helper to determine expressive emotion state from tutor speech and pedagogical context
  const determineTutorEmotion = (msg: ChatMessage): AvatarAnimationState => {
    const text = ((msg.text || "") + " " + (msg.teacherCommentary || "")).toLowerCase();
    const hasPraise = Boolean(msg.correction?.praise) || (msg.correction && !msg.correction.hasError);
    const isPraiseOrExcited =
      hasPraise ||
      /excelente|perfecto|gran trabajo|great job|awesome|brilliant|wonderful|congratulations|amazing|¡muy bien!|¡genial!|well done/i.test(
        text
      );

    const hasSpecialSecretOrDiscovery =
      Boolean(msg.nativeLinkingTrick) ||
      /did you know|truco nativo|sabías que|curiosidad|dato curioso|¡wow!|sorprendente/i.test(text);

    const isQuestion =
      text.includes("?") ||
      text.includes("¿") ||
      /what|how|why|could you|tell me|dime|cuéntame|qué opinas|cómo dirías|practiquemos/i.test(text);

    if (hasSpecialSecretOrDiscovery) return "sorpresa";
    if (isPraiseOrExcited) return "alegre";
    if (isQuestion) return "pensativo";
    return "speaking";
  };

  // Audio Player Trigger with emotional facial memory & hands-free auto-mic loop
  const playTutorAudio = useCallback(
    (
      text: string,
      slow = false,
      forceLang?: string,
      emotionContext?: AvatarAnimationState,
      bilingualContext?: {
        teacherCommentary?: string;
        targetEnglishPhrase?: string;
      }
    ) => {
      stopSpeaking();
      setIsPlayingAudio(true);
      const activeEmotion = emotionContext || "speaking";
      setAnimationState(activeEmotion);

      speakText(
        text,
        avatarConfig,
        () => {
          setIsPlayingAudio(true);
          setAnimationState(activeEmotion);
        },
        () => {
          setIsPlayingAudio(false);
          // Keep the expressive face (alegre, pensativo, sorpresa) briefly after speech finishes
          setAnimationState(activeEmotion);
          setMouthIntensity(0);
          setTimeout(() => {
            setAnimationState("idle");
          }, 2000);

          // FLUIDEZ MANOS LIBRES: Si está activado, activar el micrófono para el turno del estudiante
          if (handsFreeMode) {
            setTimeout(() => {
              voiceRecognizer.startListening();
            }, 350);
          }
        },
        (intensity) => {
          setMouthIntensity(intensity);
        },
        {
          forceLang,
          rateMultiplier: slow ? 0.75 : 1.0,
          bilingualContext,
        }
      );
    },
    [avatarConfig, handsFreeMode]
  );

  // Send initial pedagogical welcome message if empty
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: ChatMessage = {
        id: "init-1",
        sender: "tutor",
        teacherCommentary: `¡Hola! Soy tu profesora ${avatarConfig.name}. Te enseñaré inglés explicándote en español y practicando juntos en inglés con situaciones reales.`,
        targetEnglishPhrase: "I am ready to practice speaking English today.",
        phoneticGuide: "aɪ æm ˈred.i tuː ˈpræk.tɪs ˈspiː.kɪŋ ˈɪŋ.ɡlɪʃ (Suena: aim redi tu præk-tis spi-king ing-glish)",
        nativeLinkingTrick: "Une 'ready to' como 'redi-tu' de forma fluida.",
        text: `¡Hola! Soy tu profesora ${avatarConfig.name}. Te enseñaré inglés paso a paso, explicándote en español y practicando en inglés. Para comenzar, ¿cómo te sientes hoy? Puedes decirme: 'I am ready to practice English'.`,
        spanishTranslation: `¡Hola! Soy tu profesora ${avatarConfig.name}. Te enseñaré inglés paso a paso, explicándote en español y practicando en inglés. Para comenzar, ¿cómo te sientes hoy? Puedes decirme: 'Estoy listo para practicar inglés'.`,
        timestamp: Date.now(),
        correction: {
          hasError: false,
          praise: "¡Excelente iniciativa al empezar tu clase hoy!",
        },
        quickChips: [
          "I'm feeling great and ready to learn!",
          "I had a busy day, but I want to practice.",
          "Tell me how to improve my English fluency.",
        ],
        vocabularyNotes: [
          {
            word: "fluency",
            ipa: "/ˈfluː.ən.si/",
            phoneticSpanish: "flu-en-si",
            meaning: "Fluidez o soltura al hablar",
            example: "Daily practice builds speaking fluency.",
          },
        ],
        pedagogicalTip:
          "En lugar de traducir palabra por palabra en tu mente, enfócate en la frase completa (chunks).",
      };

      setMessages([initialGreeting]);
      saveStoredHistory([initialGreeting]);

      // Play greeting audio automatically with slight delay
      const timer = setTimeout(() => {
        playTutorAudio(
          initialGreeting.text,
          false,
          undefined,
          "alegre",
          {
            teacherCommentary: initialGreeting.teacherCommentary,
            targetEnglishPhrase: initialGreeting.targetEnglishPhrase,
          }
        );
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Send message to Express Backend with Gemini AI
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    stopSpeaking();
    setIsPlayingAudio(false);
    setIsListening(false);

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: Date.now(),
    };

    // Calculate Pronunciation Accuracy if there was a target phrase
    const currentTarget = latestTutorMessage?.targetEnglishPhrase || "";
    if (currentTarget) {
      setTargetPhraseToEvaluate(currentTarget);
      setLastSpokenText(text.trim());

      const spokenWords = text.trim().toLowerCase().split(/\s+/);
      const targetWords = currentTarget.toLowerCase().replace(/[.,!?;:]/g, "").split(/\s+/);

      const calculatedAccuracies: WordAccuracy[] = targetWords.map((tWord) => {
        let bestMatch = 0;
        spokenWords.forEach((sWord) => {
          const sim = calculateSimilarity(sWord, tWord);
          if (sim > bestMatch) bestMatch = sim;
        });
        return {
          word: tWord,
          score: bestMatch,
          isTarget: true,
        };
      });

      const avgScore = Math.round(
        calculatedAccuracies.reduce((acc, curr) => acc + curr.score, 0) / (calculatedAccuracies.length || 1)
      );

      setWordAccuracies(calculatedAccuracies);
      setOverallPronunciationScore(avgScore);

      // Reward Gamification XP & Gems on high scores
      if (avgScore >= 80) {
        const addedGems = avgScore >= 95 ? 5 : 2;
        const addedXP = avgScore >= 95 ? 30 : 15;
        const newGam = {
          ...gamification,
          xpPoints: gamification.xpPoints + addedXP,
          gems: gamification.gems + addedGems,
          perfectPhrasesCount: avgScore >= 90 ? gamification.perfectPhrasesCount + 1 : gamification.perfectPhrasesCount,
          level: Math.floor((gamification.xpPoints + addedXP) / 100) + 1,
        };
        setGamification(newGam);
        saveStoredGamification(newGam);
      }
    }

    // Check Scenario Goals Completion
    const currentTopicGoals = scenarioGoals[activeTopic.id] || [];
    let newlyCompletedGoals = 0;
    const lowerText = text.toLowerCase();

    const updatedGoals = currentTopicGoals.map((g) => {
      if (!g.completed) {
        const matched = g.targetKeywords.some((kw) => lowerText.includes(kw.toLowerCase()));
        if (matched) {
          newlyCompletedGoals++;
          return { ...g, completed: true };
        }
      }
      return g;
    });

    if (newlyCompletedGoals > 0) {
      setScenarioGoals((prev) => ({
        ...prev,
        [activeTopic.id]: updatedGoals,
      }));

      // Confetti effect when completing goals
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {}

      // Add extra XP
      const addedXP = newlyCompletedGoals * 25;
      const updatedGam = {
        ...gamification,
        xpPoints: gamification.xpPoints + addedXP,
        gems: gamification.gems + newlyCompletedGoals,
      };
      setGamification(updatedGam);
      saveStoredGamification(updatedGam);
    }

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveStoredHistory(updatedMessages);

    // Live Intelligent Grammar & Natural Rephrasing Analysis
    const grammarFeedback = analyzeGrammar(text.trim());
    if (grammarFeedback && !grammarFeedback.isPerfect) {
      setLiveGrammarCorrection(grammarFeedback);
    }

    setIsLoading(true);
    // Tutor enters thinking state while processing student input
    setAnimationState("pensativo");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-8),
          level: cefrLevel,
          topic: activeTopic.title,
          targetAccent: avatarConfig.voiceAccent,
          teachingMode,
          teacherName: avatarConfig.name,
        }),
      });

      const resData = await response.json();
      const aiData = resData.data || {};

      const tutorSpeech =
        aiData.tutorSpeech ||
        "Thank you for sharing that! Could you tell me a little more about it?";

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: "tutor",
        text: tutorSpeech,
        timestamp: Date.now(),
        teacherCommentary: aiData.teacherCommentary,
        targetEnglishPhrase: aiData.targetEnglishPhrase,
        phoneticGuide: aiData.phoneticGuide,
        nativeLinkingTrick: aiData.nativeLinkingTrick,
        spanishTranslation: aiData.spanishTranslation,
        correction: aiData.correction,
        quickChips: aiData.quickChips || [
          "That sounds interesting!",
          "Could you give me an example?",
          "Let's move on to the next question.",
        ],
        vocabularyNotes: aiData.vocabularyNotes || [],
        pedagogicalTip: aiData.pedagogicalTip,
      };

      const finalMessages = [...updatedMessages, tutorMsg];
      setMessages(finalMessages);
      saveStoredHistory(finalMessages);

      // Update User Stats
      const newStats = {
        ...userStats,
        messagesExchanged: userStats.messagesExchanged + 2,
        minutesPracticed: userStats.minutesPracticed + 1,
      };
      setUserStats(newStats);
      saveStoredStats(newStats);

      // Milestone celebration every 10 exchanges or achievement
      if (newStats.messagesExchanged % 10 === 0) {
        confetti({
          particleCount: 75,
          spread: 90,
          origin: { y: 0.35 },
          colors: ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"],
        });
      }

      // Detect emotion (alegre, pensativo, sorpresa) based on pedagogical intent
      const reactionEmotion = determineTutorEmotion(tutorMsg);

      // Play audio automatically with bilingual dual voice and facial emotion
      playTutorAudio(
        tutorSpeech,
        false,
        undefined,
        reactionEmotion,
        {
          teacherCommentary: tutorMsg.teacherCommentary,
          targetEnglishPhrase: tutorMsg.targetEnglishPhrase || tutorSpeech,
        }
      );
    } catch (err) {
      console.error("Error communicating with AI tutor:", err);

      const fallbackMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: "tutor",
        teacherCommentary:
          "¡Muy bien! Vamos a continuar practicando juntos paso a paso con este ejemplo.",
        targetEnglishPhrase: "Could you tell me more about that?",
        phoneticGuide: "kʊd juː tel miː mɔːr əˈbaʊt ðæt (Suena: kud-yu tel mi mor a-baut dat)",
        nativeLinkingTrick: "Une 'Could you' como 'kud-ya' para sonar muy natural.",
        text: "¡Eso estuvo muy bien dicho! Para seguir practicando dime: 'Could you tell me more about that?'. ¿Qué otras metas quieres alcanzar con tu inglés?",
        spanishTranslation:
          "¡Eso estuvo muy bien dicho! Para seguir practicando dime: '¿Podrías contarme más sobre eso?'. ¿Qué otras metas quieres alcanzar con tu inglés?",
        timestamp: Date.now(),
        correction: {
          hasError: false,
          praise: "¡Excelente claridad al expresarte!",
        },
        quickChips: [
          "I want to speak fluently at work.",
          "I want to travel with confidence.",
          "I want to pass the IELTS exam.",
        ],
      };

      const finalMessages = [...updatedMessages, fallbackMsg];
      setMessages(finalMessages);
      saveStoredHistory(finalMessages);
      playTutorAudio(
        fallbackMsg.text,
        false,
        undefined,
        "alegre",
        {
          teacherCommentary: fallbackMsg.teacherCommentary,
          targetEnglishPhrase: fallbackMsg.targetEnglishPhrase,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Practice target phrase immediately
  const handlePracticePhrase = (phrase: string) => {
    handleSendMessage(phrase);
  };

  // Switch Topic Scenario
  const handleSelectTopic = (scenario: TopicScenario) => {
    setActiveTopicId(scenario.id);
    saveStoredTopic(scenario.id);

    // Auto-adjust ambience audio if active
    if (ambienceMode !== "off") {
      let suitableAmbience: "cafe" | "airport" | "rain" | "office" = "cafe";
      if (scenario.category === "Travel") suitableAmbience = "airport";
      else if (scenario.category === "Professional") suitableAmbience = "office";
      else if (scenario.category === "Everyday") suitableAmbience = "cafe";
      else suitableAmbience = "rain";

      setAmbienceMode(suitableAmbience);
      ambienceEngine.playAmbience(suitableAmbience);
    }

    // Send scenario context starter prompt
    handleSendMessage(
      `¡Hola ${avatarConfig.name}! Me gustaría practicar el escenario: "${scenario.title}". ${scenario.initialPrompt}`
    );
  };

  // Switch Level
  const handleSelectLevel = (newLevel: CEFRLevel) => {
    setCefrLevel(newLevel);
    saveStoredLevel(newLevel);

    // Trigger feedback
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.2 },
    });

    handleSendMessage(
      `He cambiado mi nivel objetivo a ${newLevel}. Por favor adapta la velocidad, vocabulario y explicaciones al nivel ${newLevel}.`
    );
  };

  // Switch Teaching Mode
  const handleSelectTeachingMode = (mode: TeachingMode) => {
    setTeachingMode(mode);
    const modeObj = TEACHING_MODES.find((m) => m.id === mode);
    if (modeObj) {
      handleSendMessage(
        `Profesora, cambiemos al modo de clase "${modeObj.title}". Adapta tu dinámica a este estilo pedagógico.`
      );
    }
  };

  // Avatar Config Update
  const handleSaveAvatarConfig = (newConfig: AvatarConfig) => {
    setAvatarConfig(newConfig);
    saveAvatarConfig(newConfig);
  };

  // Save Vocabulary
  const handleSaveVocabulary = (
    item: Omit<VocabularyItem, "id" | "dateAdded">
  ) => {
    // Check if already in notebook
    const exists = vocabulary.some(
      (v) => v.word.toLowerCase() === item.word.toLowerCase()
    );
    if (!exists) {
      const newItem: VocabularyItem = {
        ...item,
        id: `v-${Date.now()}`,
        dateAdded: Date.now(),
        mastered: false,
      };

      const updated = [newItem, ...vocabulary];
      setVocabulary(updated);
      saveStoredVocabulary(updated);

      setUserStats((prev) => {
        const stats = { ...prev, wordsLearned: prev.wordsLearned + 1 };
        saveStoredStats(stats);
        return stats;
      });

      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.8 },
      });
    }
  };

  // Delete Vocabulary Item
  const handleDeleteVocabulary = (id: string) => {
    const updated = vocabulary.filter((v) => v.id !== id);
    setVocabulary(updated);
    saveStoredVocabulary(updated);
  };

  // Toggle Mastered
  const handleToggleMastered = (id: string) => {
    const updated = vocabulary.map((v) =>
      v.id === id ? { ...v, mastered: !v.mastered } : v
    );
    setVocabulary(updated);
    saveStoredVocabulary(updated);
  };

  // Pronounce single word
  const handleSpeakWord = (word: string) => {
    speakText(word, avatarConfig);
  };

  // Clear Chat History
  const handleClearHistory = () => {
    setMessages([]);
    saveStoredHistory([]);
    setIsHistoryModalOpen(false);
  };

  // If user is in Kids Mode, render dedicated Kids Experience View
  if (appExperienceMode === "kids") {
    return <KidsModeView onSwitchToAdultsMode={handleSwitchToAdultsMode} />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <Navbar
        currentLevel={cefrLevel}
        teachingMode={teachingMode}
        stats={userStats}
        currentTopicTitle={activeTopic.title}
        streakDays={gamification.streakDays}
        gemsCount={gamification.gems}
        level={gamification.level}
        ambienceMode={ambienceMode}
        onOpenAvatarCustomizer={() => setIsAvatarModalOpen(true)}
        onOpenLevelModal={() => setIsLevelModalOpen(true)}
        onOpenTopicModal={() => setIsTopicModalOpen(true)}
        onOpenTeachingModeModal={() => setIsTeachingModeModalOpen(true)}
        onOpenGamificationModal={() => setIsQuestsAndShopOpen(true)}
        onOpenResearchRoadmap={() => setIsResearchRoadmapOpen(true)}
        onOpenRoleplay={() => setIsRoleplayModalOpen(true)}
        onSwitchToKidsMode={handleSwitchToKidsMode}
      />

      {/* Main Tabbed Views: Conversar vs. Camino vs. Herramientas */}
      {activeMainTab === "path" ? (
        <main className="flex-1 w-full mx-auto z-10">
          <AdultLearningPath
            currentLevel={cefrLevel}
            streakDays={gamification.streakDays}
            gemsCount={gamification.gems}
            onStartLesson={(node) => {
              if (node.type === "boss_roleplay") {
                setIsRoleplayModalOpen(true);
              } else {
                setActiveLessonNode(node);
              }
            }}
            onOpenRoleplayModal={() => setIsRoleplayModalOpen(true)}
            onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
          />
        </main>
      ) : activeMainTab === "tools" ? (
        <main className="flex-1 w-full mx-auto z-10">
          <ToolsHubView
            onOpenFlashcards={() => {
              const currentCards = getStoredFlashcards();
              importVocabularyToFlashcards(currentCards, vocabulary);
              setIsFlashcardsModalOpen(true);
            }}
            onOpenSpeedSpeaking={() => setIsSpeedSpeakingModalOpen(true)}
            onOpenEchoTrainer={() => setIsEchoTrainerModalOpen(true)}
            onOpenPhoneticCoach={() => {
              setPhoneticModalTab("articulation");
              setIsPhoneticModalOpen(true);
            }}
            onOpenAmbience={() => setIsAmbienceModalOpen(true)}
            onOpenNotebook={() => setIsNotebookModalOpen(true)}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
            onOpenQuestsAndShop={() => setIsQuestsAndShopOpen(true)}
            onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
            onOpenResearchRoadmap={() => setIsResearchRoadmapOpen(true)}
            onOpenRoleplay={() => setIsRoleplayModalOpen(true)}
            onSwitchToKidsMode={handleSwitchToKidsMode}
            onStartDailyPractice={() => setActiveMainTab("chat")}
            streakDays={gamification.streakDays}
            gemsCount={gamification.gems}
          />
        </main>
      ) : (
        /* Live Call & Dialogue Stage (Conversar) - Minimalist Apple/Duolingo Layout */
        <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-5 pb-24 max-w-4xl w-full mx-auto gap-3.5 z-10">
          {/* Central 2.5D Mascot Stage (Apple-style immersive canvas) */}
          <motion.section
            id="avatar-stage"
            style={
              {
                "--mouth-intensity": mouthIntensity,
              } as React.CSSProperties
            }
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`w-full flex-1 min-h-[300px] sm:min-h-[360px] max-h-[460px] flex items-center justify-center relative rounded-[32px] bg-gradient-to-b from-[#151a24]/90 via-[#0b0e14]/90 to-[#080b10] border border-white/[0.08] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden transition-all duration-300 ${
              animationState === "speaking"
                ? "[filter:saturate(1.2)_contrast(1.08)_drop-shadow(0_20px_25px_rgba(0,0,0,0.5))_drop-shadow(0_0_15px_rgba(139,92,246,0.4))]"
                : "[filter:saturate(1.15)_contrast(1.05)_drop-shadow(0_20px_25px_rgba(0,0,0,0.5))]"
            }`}
          >
            {/* Top Floating Controls Bar */}
            <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between z-20 pointer-events-auto">
              {/* Mascot Identity Tag Pill */}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 shadow-md transition active:scale-95 text-left"
                title="Cambiar tutor o personalizar"
              >
                <span className="text-base leading-none">{avatarConfig.characterEmoji || "🐦"}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100">{avatarConfig.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                    2.5D BET
                  </span>
                </div>
              </button>

              {/* Quick Actions Pills */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setPhoneticModalTab("articulation");
                    setIsPhoneticModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 backdrop-blur-xl border border-white/10 hover:border-sky-500/40 text-sky-300 text-xs font-semibold shadow-md transition active:scale-95"
                  title="Abrir Laboratorio Fonético 2.5D"
                >
                  <span>🔬</span>
                  <span className="hidden sm:inline">Fonética</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 text-amber-300 text-xs font-bold shadow-md transition active:scale-95"
                  title="Cambiar tutor o personalizar"
                >
                  <span>✨</span>
                  <span className="hidden sm:inline">Tutores</span>
                </button>
              </div>
            </div>

            {/* Avatar 3D (Three.js para GLB) o Avatar 2.5D */}
            {avatarConfig.customGlbUrl ? (
              <div className="w-full h-full min-h-[380px] sm:min-h-[420px] flex items-center justify-center relative">
                <AvatarCanvas
                  config={avatarConfig}
                  animationState={animationState}
                  mouthIntensity={mouthIntensity}
                  isListening={isListening}
                  onMascotClick={() => {
                    setAnimationState("encouraging");
                    setTimeout(() => setAnimationState("idle"), 1800);
                  }}
                />
                <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-black text-emerald-400 flex items-center gap-1 shadow-lg pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  3D GLB THREE.JS
                </div>
              </div>
            ) : (
              <Avatar2DCanvas
                config={avatarConfig}
                animationState={animationState}
                mouthIntensity={mouthIntensity}
                isListening={isListening}
                onMascotClick={() => {
                  setAnimationState("encouraging");
                  setTimeout(() => setAnimationState("idle"), 1500);
                }}
                onCustomizerClick={() => setIsAvatarModalOpen(true)}
              />
            )}

            {/* Bottom Floating Minimalist Mascot Selector Dock (Apple Dock style) */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-xl border border-white/10 shadow-lg z-20 max-w-[95%] overflow-x-auto no-scrollbar">
              {Object.entries(AVATAR_PRESETS)
                .filter(([key]) => key.startsWith("bet_"))
                .map(([key, preset]) => {
                  const isSelected =
                    avatarConfig.preset === key && !avatarConfig.customImageUrl;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        const updated: AvatarConfig = { ...preset };
                        delete updated.customImageUrl;
                        delete updated.spriteCropIndex;
                        handleSaveAvatarConfig(updated);
                        speakText(
                          `Hi! I'm ${preset.name}. Let's speak English!`,
                          updated
                        );
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shrink-0 transition-all duration-200 ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50 scale-105"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]"
                      }`}
                      title={preset.name}
                    >
                      <span className="text-sm leading-none">
                        {preset.characterEmoji}
                      </span>
                      <span className={`text-[11px] whitespace-nowrap ${isSelected ? "inline font-black" : "hidden md:inline"}`}>
                        {preset.name.replace(" BET", "")}
                      </span>
                    </button>
                  );
                })}
            </div>
          </motion.section>

          {/* Scenario Roleplay Missions & Goals Panel */}
          <section className="w-full">
            <ScenarioMissionsPanel
              topicTitle={activeTopic.title}
              category={activeTopic.category}
              goals={scenarioGoals[activeTopic.id] || []}
            />
          </section>

          {/* AI Dialogue Bubble */}
          <section className="w-full">
            <DialogueBubble
              currentMessage={latestTutorMessage}
              isPlayingAudio={isPlayingAudio}
              onRepeatAudio={(slow, customText, forceLang) => {
                const textToSpeak = customText || latestTutorMessage?.text;
                if (textToSpeak) {
                  const emotion = latestTutorMessage
                    ? determineTutorEmotion(latestTutorMessage)
                    : "speaking";
                  playTutorAudio(
                    textToSpeak,
                    slow,
                    forceLang,
                    emotion,
                    !customText && latestTutorMessage
                      ? {
                          teacherCommentary: latestTutorMessage.teacherCommentary,
                          targetEnglishPhrase: latestTutorMessage.targetEnglishPhrase,
                        }
                      : undefined
                  );
                }
              }}
              onSaveVocabulary={handleSaveVocabulary}
              onSpeakWord={handleSpeakWord}
              onPracticePhrase={handlePracticePhrase}
              onOpenPhoneticLab={(tab) => {
                setPhoneticModalTab(tab || "articulation");
                setIsPhoneticModalOpen(true);
              }}
              teacherName={avatarConfig.name}
              teacherRole={avatarConfig.role}
              avatarEmoji={avatarConfig.characterEmoji}
              avatarBadge={avatarConfig.badgeText}
              isLoading={isLoading}
            />
          </section>

          {/* Pronunciation Meter */}
          {wordAccuracies.length > 0 && (
            <section className="w-full">
              <PronunciationMeter
                userTranscript={lastSpokenText}
                targetPhrase={targetPhraseToEvaluate}
                wordAccuracies={wordAccuracies}
                overallScore={overallPronunciationScore}
                avatarVoiceAccent={avatarConfig.voiceAccent}
                avatarVoiceGender={avatarConfig.voiceGender}
                onOpenEchoTrainer={() => setIsEchoTrainerModalOpen(true)}
                onDismiss={() => setWordAccuracies([])}
              />
            </section>
          )}

          {/* Live Grammar & Rephrase Feedback Sheet */}
          {liveGrammarCorrection && (
            <section className="w-full z-20">
              <GrammarFeedbackSheet
                correction={liveGrammarCorrection}
                onDismiss={() => setLiveGrammarCorrection(null)}
                avatarConfig={avatarConfig}
              />
            </section>
          )}

          {/* Bottom Interaction Zone */}
          <section className="w-full sticky bottom-2 z-20">
            <InteractionBar
              quickChips={currentQuickChips}
              onSendMessage={handleSendMessage}
              isListening={isListening}
              setIsListening={setIsListening}
              isLoading={isLoading}
              isPlayingAudio={isPlayingAudio}
              handsFreeMode={handsFreeMode}
              setHandsFreeMode={setHandsFreeMode}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              historyCount={messages.length}
            />
          </section>
        </main>
      )}

      {/* Bottom Navigation Bar (Apple / Duolingo Style) */}
      <BottomNavBar
        activeTab={activeMainTab}
        onTabChange={(tab) => setActiveMainTab(tab)}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        onSwitchToKidsMode={handleSwitchToKidsMode}
      />

      {/* Modals */}
      <SpeedSpeakingModal
        isOpen={isSpeedSpeakingModalOpen}
        onClose={() => setIsSpeedSpeakingModalOpen(false)}
        avatarConfig={avatarConfig}
        onCompleteChallenge={(score, gemsWon) => {
          const updatedGam: UserGamificationState = {
            ...gamification,
            xpPoints: gamification.xpPoints + score,
            gems: gamification.gems + gemsWon,
            completedChallenges: gamification.completedChallenges + 1,
            unlockedAchievements: Array.from(
              new Set([...gamification.unlockedAchievements, "speed_demon"])
            ),
            level: Math.floor((gamification.xpPoints + score) / 100) + 1,
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
      />

      <GamificationModal
        isOpen={isGamificationModalOpen}
        onClose={() => setIsGamificationModalOpen(false)}
        gamification={gamification}
      />
      <PhoneticCoachModal
        isOpen={isPhoneticModalOpen}
        onClose={() => setIsPhoneticModalOpen(false)}
        avatarConfig={avatarConfig}
        initialTab={phoneticModalTab}
      />
      <AvatarCustomizerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        config={avatarConfig}
        onSaveConfig={handleSaveAvatarConfig}
      />

      <TopicSelectorModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        currentTopicId={activeTopicId}
        onSelectTopic={handleSelectTopic}
      />

      <LevelSelectorModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        currentLevel={cefrLevel}
        onSelectLevel={handleSelectLevel}
      />

      <TeachingModeModal
        isOpen={isTeachingModeModalOpen}
        onClose={() => setIsTeachingModeModalOpen(false)}
        currentMode={teachingMode}
        onSelectMode={handleSelectTeachingMode}
      />

      <VocabularyNotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        items={vocabulary}
        onDeleteItem={handleDeleteVocabulary}
        onToggleMastered={handleToggleMastered}
        onSpeakWord={handleSpeakWord}
      />

      <WaveformEchoTrainerModal
        isOpen={isEchoTrainerModalOpen}
        onClose={() => setIsEchoTrainerModalOpen(false)}
        targetPhrase={targetPhraseToEvaluate || latestTutorMessage?.targetEnglishPhrase || ""}
        phoneticGuide={latestTutorMessage?.phoneticGuide}
        avatarConfig={avatarConfig}
        onSuccess={() => {
          const updatedGam = {
            ...gamification,
            xpPoints: gamification.xpPoints + 25,
            gems: gamification.gems + 2,
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
      />

      <SRSFlashcardsModal
        isOpen={isFlashcardsModalOpen}
        onClose={() => setIsFlashcardsModalOpen(false)}
        avatarConfig={avatarConfig}
        onGemsEarned={(earned) => {
          const updatedGam = {
            ...gamification,
            xpPoints: gamification.xpPoints + earned * 10,
            gems: gamification.gems + earned,
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
      />

      <AmbienceSelectorModal
        isOpen={isAmbienceModalOpen}
        onClose={() => setIsAmbienceModalOpen(false)}
        currentMode={ambienceMode}
        onModeChange={(mode) => setAmbienceMode(mode)}
        volume={ambienceVolume}
        onVolumeChange={(vol) => setAmbienceVolume(vol)}
      />

      <ToolsDrawerModal
        isOpen={isToolsDrawerOpen}
        onClose={() => setIsToolsDrawerOpen(false)}
        onOpenSpeedSpeaking={() => setIsSpeedSpeakingModalOpen(true)}
        onOpenFlashcards={() => {
          const currentCards = getStoredFlashcards();
          importVocabularyToFlashcards(currentCards, vocabulary);
          setIsFlashcardsModalOpen(true);
        }}
        onOpenEchoTrainer={() => setIsEchoTrainerModalOpen(true)}
        onOpenPhoneticCoach={() => {
          setPhoneticModalTab("articulation");
          setIsPhoneticModalOpen(true);
        }}
        onOpenAmbience={() => setIsAmbienceModalOpen(true)}
        onOpenNotebook={() => setIsNotebookModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenGamification={() => setIsGamificationModalOpen(true)}
        onOpenResearchRoadmap={() => setIsResearchRoadmapOpen(true)}
        onOpenRoleplay={() => setIsRoleplayModalOpen(true)}
        onSwitchToKidsMode={handleSwitchToKidsMode}
        streakDays={gamification.streakDays}
        gemsCount={gamification.gems}
        ambienceMode={ambienceMode}
      />

      <TranscriptHistory
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        messages={messages}
        onReplayAudio={(text) => playTutorAudio(text)}
        onClearHistory={handleClearHistory}
      />

      <PlacementTestModal
        isOpen={isPlacementTestOpen}
        onClose={() => setIsPlacementTestOpen(false)}
        avatarConfig={avatarConfig}
        onComplete={(recommendedLevel) => {
          handleSelectLevel(recommendedLevel);
          const updatedGam = {
            ...gamification,
            xpPoints: gamification.xpPoints + 100,
            gems: gamification.gems + 10,
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
      />

      <QuestsAndShopModal
        isOpen={isQuestsAndShopOpen}
        onClose={() => setIsQuestsAndShopOpen(false)}
        gamification={gamification}
        onClaimQuest={(questId, xp, gems) => {
          const updatedGam = {
            ...gamification,
            xpPoints: gamification.xpPoints + xp,
            gems: gamification.gems + gems,
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
        onBuyItem={(cost) => {
          const updatedGam = {
            ...gamification,
            gems: Math.max(0, gamification.gems - cost),
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
      />

      <ResearchRoadmapModal
        isOpen={isResearchRoadmapOpen}
        onClose={() => setIsResearchRoadmapOpen(false)}
      />

      <RoleplayImmersionModal
        isOpen={isRoleplayModalOpen}
        onClose={() => setIsRoleplayModalOpen(false)}
        onSelectScenario={handleSelectRoleplayScenario}
      />

      {activeLessonNode && (
        <LessonEngineView
          lessonTitle={activeLessonNode.title}
          lessonSubtitle={activeLessonNode.subtitle}
          initialXpReward={activeLessonNode.xp}
          onClose={() => setActiveLessonNode(null)}
          onComplete={(xpEarned) => {
            const updatedGam = {
              ...gamification,
              xpPoints: gamification.xpPoints + xpEarned,
              gems: gamification.gems + 5,
            };
            setGamification(updatedGam);
            saveStoredGamification(updatedGam);
          }}
        />
      )}
    </div>
  );
}
