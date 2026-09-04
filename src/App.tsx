import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "motion/react";
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
import { speakText, stopSpeaking, voiceRecognizer, prewarmAudioContext } from "./utils/speech";
import { useMicVolume } from "./utils/useMicVolume";
import { Navbar } from "./components/Navbar";
import { KidsModeView } from "./components/KidsModeView";
import { Avatar2DCanvas } from "./components/Avatar2DCanvas";
import { AvatarCanvas } from "./components/AvatarCanvas";
import { MascotPokeContainer } from "./components/mascots/MascotPokeContainer";
import { isMascotBodyElement } from "./utils/avatarBodyDetection";
import { TurpialRigCalibratorModal } from "./components/mascots/TurpialRigCalibratorModal";
import { DialogueBubble } from "./components/DialogueBubble";
import { InteractionBar } from "./components/InteractionBar";
import { PronunciationMeter } from "./components/PronunciationMeter";
import { ScenarioMissionsPanel } from "./components/ScenarioMissionsPanel";
import { WaveformEchoTrainerModal } from "./components/WaveformEchoTrainerModal";
import { SRSFlashcardsModal } from "./components/SRSFlashcardsModal";
import { WeeklyLeaderboardModal } from "./components/WeeklyLeaderboardModal";
import { WeeklyProgressDashboardModal } from "./components/WeeklyProgressDashboardModal";
import { AmbienceSelectorModal } from "./components/AmbienceSelectorModal";
import { ToolsDrawerModal } from "./components/ToolsDrawerModal";
import { SeasonalThemeModal } from "./components/SeasonalThemeModal";
import { SeasonalParticlesCanvas } from "./components/effects/SeasonalParticlesCanvas";
import { AvatarStageRipple, AvatarStageRippleRef } from "./components/effects/AvatarStageRipple";
import { useSeasonalThemeEngine } from "./hooks/useSeasonalThemeEngine";
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
import { SwipeNavigationIndicator } from "./components/SwipeNavigationIndicator";
import { AdultLearningPath, LessonNode } from "./components/AdultLearningPath";
import { LessonEngineView } from "./components/LessonEngineView";
import { DailyBlitzModal } from "./components/DailyBlitzModal";
import { UnitCertificateModal, UnitCertificateData } from "./components/UnitCertificateModal";
import { ToolsHubView } from "./components/ToolsHubView";
import { PlacementTestModal } from "./components/PlacementTestModal";
import { QuestsAndShopModal } from "./components/QuestsAndShopModal";
import { GrammarFeedbackSheet } from "./components/GrammarFeedbackSheet";
import { ResearchRoadmapModal } from "./components/ResearchRoadmapModal";
import { RoleplayImmersionModal } from "./components/RoleplayImmersionModal";
import { ROLEPLAY_SCENARIOS } from "./data/roleplayScenariosData";
import { markNodeCompleted } from "./utils/learningPathStorage";
import { playSuccessFanfare } from "./utils/audioSynth";
import { analyzeGrammar } from "./utils/grammarEngine";
import { GrammarCorrection, RoleplayScenarioItem } from "./types";
import { soundFx } from "./utils/soundFx";
import { haptics } from "./utils/haptics";
import { VictoryModal } from "./components/VictoryModal";
import { DailyQuestsWidget, DailyQuest } from "./components/DailyQuestsWidget";
import { AvatarAccuracyRing } from "./components/AvatarAccuracyRing";
import { AvatarLevelCheckpointBorder } from "./components/AvatarLevelCheckpointBorder";
import { PhoneticDrillModal } from "./components/PhoneticDrillModal";
import { VoiceCallModal } from "./components/VoiceCallModal";
import { CustomScenarioPromptModal } from "./components/CustomScenarioPromptModal";
import { SpeedSpeakingChallengeModal } from "./components/SpeedSpeakingChallengeModal";
import { SkillRadarModal } from "./components/SkillRadarModal";
import { IndustrySelectorModal } from "./components/IndustrySelectorModal";
import { AudioImmersionModal } from "./components/AudioImmersionModal";
import { GlobalAccentsModal } from "./components/GlobalAccentsModal";
import { StarInterviewModal } from "./components/StarInterviewModal";
import { OfflineCommuteModal } from "./components/OfflineCommuteModal";
import { isAirplaneModeActive as checkAirplaneModeActive } from "./utils/offlineCommuteManager";
import { IndustryTrack, getStoredIndustryTrack } from "./data/industryTracksData";
import { IdiomOfTheDayCard } from "./components/IdiomOfTheDayCard";
import { useAppMode } from "./hooks/useAppMode";
import { useOfflineStatus } from "./hooks/useOfflineStatus";
import { OfflineStatusIndicator } from "./components/OfflineStatusIndicator";
import { generateOfflineTutorTurn } from "./utils/offlineSessionManager";

export default function App() {
  // State Initialization - Turpial BET as default active avatar
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    const defaultTurpial = AVATAR_PRESETS.bet_turpial || getStoredAvatarConfig();
    saveAvatarConfig(defaultTurpial);
    return defaultTurpial;
  });
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>(getStoredLevel);
  const [teachingMode, setTeachingMode] = useState<TeachingMode>("bilingual_coach");
  const {
    mode: appExperienceMode,
    setMode: setAppExperienceMode,
  } = useAppMode();
  const { isOnline, lastSession, saveSession } = useOfflineStatus();

  const handleSwitchToKidsMode = () => {
    setAppExperienceMode("kids");
  };

  const handleSwitchToAdultsMode = () => {
    setAppExperienceMode("adults");
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

  // Navigation & Modals: Default to 'path' (Duolingo Learning Path) for clean single-task focus
  const MAIN_TABS: MainAppTab[] = ["chat", "path", "tools"];
  const [tabSlideDirection, setTabSlideDirection] = useState<number>(0);
  const [activeMainTab, setActiveMainTab] = useState<MainAppTab>(() => {
    try {
      const saved = localStorage.getItem("vt_active_main_tab");
      if (saved === "chat" || saved === "path" || saved === "tools") return saved as MainAppTab;
      return "path";
    } catch {
      return "path";
    }
  });

  const handleTabChange = useCallback((newTab: MainAppTab) => {
    setActiveMainTab((prevTab) => {
      const prevIndex = MAIN_TABS.indexOf(prevTab);
      const nextIndex = MAIN_TABS.indexOf(newTab);
      if (nextIndex !== prevIndex) {
        setTabSlideDirection(nextIndex > prevIndex ? 1 : -1);
      }
      return newTab;
    });
    try {
      localStorage.setItem("vt_active_main_tab", newTab);
    } catch {}
  }, []);

  const handleSwipeNextTab = useCallback(() => {
    const currentIndex = MAIN_TABS.indexOf(activeMainTab);
    if (currentIndex < MAIN_TABS.length - 1) {
      handleTabChange(MAIN_TABS[currentIndex + 1]);
      soundFx.playPop();
    }
  }, [activeMainTab, handleTabChange]);

  const handleSwipePrevTab = useCallback(() => {
    const currentIndex = MAIN_TABS.indexOf(activeMainTab);
    if (currentIndex > 0) {
      handleTabChange(MAIN_TABS[currentIndex - 1]);
      soundFx.playPop();
    }
  }, [activeMainTab, handleTabChange]);

  const handleTabPanEnd = useCallback(
    (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
    ) => {
      const horizontalDist = info.offset.x;
      const verticalDist = info.offset.y;
      const isHorizontalSwipe = Math.abs(horizontalDist) > Math.abs(verticalDist) * 1.25;

      if (isHorizontalSwipe) {
        // Swiping Left (finger moves to left): go forward/right in tabs
        if (horizontalDist < -45 || info.velocity.x < -200) {
          handleSwipeNextTab();
        } else if (horizontalDist > 45 || info.velocity.x > 200) {
          // Swiping Right (finger moves to right): go backward/left in tabs
          handleSwipePrevTab();
        }
      }
    },
    [handleSwipeNextTab, handleSwipePrevTab]
  );
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState(false);
  const [isQuestsAndShopOpen, setIsQuestsAndShopOpen] = useState(false);
  const [isDailyBlitzOpen, setIsDailyBlitzOpen] = useState(false);
  const [certificateModalData, setCertificateModalData] = useState<UnitCertificateData | null>(null);
  const [isTurpialCalibratorOpen, setIsTurpialCalibratorOpen] = useState(false);
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
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProgressDashboardOpen, setIsProgressDashboardOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isGlobalAccentsOpen, setIsGlobalAccentsOpen] = useState(false);
  const [isStarInterviewOpen, setIsStarInterviewOpen] = useState(false);
  const [isOfflineCommuteOpen, setIsOfflineCommuteOpen] = useState(false);
  const [isAirplaneMode, setIsAirplaneMode] = useState<boolean>(() => checkAirplaneModeActive());
  const [isSeasonalThemeModalOpen, setIsSeasonalThemeModalOpen] = useState(false);
  const [activeCompanionPanel, setActiveCompanionPanel] = useState<"none" | "quests" | "scenario" | "idiom">("none");
  const [activeBossNodeId, setActiveBossNodeId] = useState<string | null>(null);
  const [pathProgressVersion, setPathProgressVersion] = useState(0);

  const handleCompleteBossMission = () => {
    if (!activeBossNodeId) return;
    markNodeCompleted(activeBossNodeId);
    setPathProgressVersion((v) => v + 1);

    const bonusXp = 60;
    const updatedGam = {
      ...gamification,
      xpPoints: gamification.xpPoints + bonusXp,
      gems: gamification.gems + 15,
      streakDays: Math.max(gamification.streakDays, 1),
    };
    setGamification(updatedGam);
    saveStoredGamification(updatedGam);
    playSuccessFanfare();
    haptics.lessonComplete();
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
    });

    setActiveBossNodeId(null);
    handleTabChange("roadmap");
  };

  // Seasonal & Holiday Theme Engine (Automatic Calendar Detection + Live CSS sync)
  const {
    themeId: seasonalThemeId,
    themeConfig: seasonalThemeConfig,
    particlesEnabled,
    particleDensity,
    selectTheme: handleSelectSeasonalTheme,
    toggleParticles: handleToggleParticles,
    changeParticleDensity: handleChangeParticleDensity,
  } = useSeasonalThemeEngine();

  const mascotSquishAnimation = useAnimation();
  const stageScaleAnimation = useAnimation();
  const lastStageClickTimeRef = useRef(0);
  const lastGoldenHaloTimeRef = useRef(0);

  const stageRippleRef = useRef<AvatarStageRippleRef>(null);
  const avatarStageRef = useRef<HTMLElement>(null);

  const triggerGoldenHaloAt = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastGoldenHaloTimeRef.current < 60) return; // Debounce duplicate triggers within 60ms
    lastGoldenHaloTimeRef.current = now;
    stageRippleRef.current?.triggerGoldenHalo(x, y);
  }, []);

  // Real-time microphone input volume tracking during speaking state
  const isSpeakingState = animationState === "speaking" || isPlayingAudio || isListening;
  const { volume: rawMicVolume } = useMicVolume(isSpeakingState);

  // Dynamic effective mic volume during speaking state (with smooth fallback to playback audio intensity)
  const effectiveMicVolume = isListening
    ? rawMicVolume
    : (animationState === "speaking" || isPlayingAudio)
    ? Math.max(rawMicVolume, mouthIntensity)
    : rawMicVolume;

  // Dynamic acoustic color hue: gently shifts from 222deg (deep slate blue) towards 254deg (acoustic indigo/violet)
  const dynamicStageHue = 222 + Math.round(effectiveMicVolume * 34);

  // Dynamic background opacity: subtly breathes from 0.90 to 0.98 based on mic input levels
  const dynamicStageOpacity = isSpeakingState && effectiveMicVolume > 0.01
    ? 0.90 + effectiveMicVolume * 0.08
    : 0.92;

  useEffect(() => {
    if (activeMainTab === "chat") {
      stageScaleAnimation.start({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeOut" },
      });
    }
  }, [activeMainTab, stageScaleAnimation]);

  const handleAvatarStageClick = (e: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>) => {
    const now = Date.now();
    if (now - lastStageClickTimeRef.current < 50) return;
    lastStageClickTimeRef.current = now;

    const stage = avatarStageRef.current || e.currentTarget;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Quick tactile scale feedback: subtly shrink then expand #avatar-stage
    stageScaleAnimation.start({
      scale: [1, 0.982, 1.008, 1],
      transition: {
        duration: 0.22,
        ease: "easeOut",
        times: [0, 0.35, 0.7, 1],
      },
    });

    // CONDITIONAL POKE INTERACTION:
    // Check if the user specifically clicked/poked the mascot body element!
    const target = (e.target as HTMLElement | SVGElement) || null;
    const isBody = isMascotBodyElement(target);

    if (!isBody) {
      // Stage background click: trigger standard ambient ripple
      stageRippleRef.current?.triggerRipple(x, y);
      return;
    }

    // TRANSIENT GOLDEN HALO GLOW:
    // Expand and fade a radiant golden halo glow from the point of contact on the mascot body!
    triggerGoldenHaloAt(x, y);

    // Play character-type specific tactile sound and haptics only on body poke
    soundFx.playCharacterStageSound(avatarConfig.preset);
    haptics.punch();

    // Trigger physical squish & stretch keyframe animation via Framer Motion useAnimation
    mascotSquishAnimation.start({
      scaleX: [1, 1.32, 0.76, 1.18, 0.9, 1.06, 0.98, 1],
      scaleY: [1, 0.68, 1.28, 0.86, 1.12, 0.95, 1.02, 1],
      y: [0, 10, -18, 8, -4, 2, 0],
      rotate: [0, -5, 5, -3, 2, -1, 0],
      transition: {
        duration: 0.7,
        ease: "easeOut",
        times: [0, 0.14, 0.32, 0.5, 0.68, 0.82, 0.92, 1],
      },
    });

    setAnimationState("encouraging");
    setTimeout(() => setAnimationState("idle"), 1600);
  };

  // Interactive mouse-tracking effect within #avatar-stage boundaries
  const [stageMousePos, setStageMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleStagePointerMove = useCallback((e: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
    const stage = avatarStageRef.current || (e.currentTarget as HTMLElement);
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    // Normalized relative coordinates: -0.5 to 0.5
    const normX = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
    const normY = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));

    setStageMousePos({ x: normX, y: normY });

    // Update CSS variables directly on #avatar-stage for responsive atmospheric lighting
    stage.style.setProperty("--stage-mouse-x", normX.toFixed(3));
    stage.style.setProperty("--stage-mouse-y", normY.toFixed(3));
    stage.style.setProperty("--stage-mouse-px", `${((normX + 0.5) * 100).toFixed(1)}%`);
    stage.style.setProperty("--stage-mouse-py", `${((normY + 0.5) * 100).toFixed(1)}%`);
  }, []);

  const handleStagePointerLeave = useCallback(() => {
    setStageMousePos({ x: 0, y: 0 });
    const stage = avatarStageRef.current;
    if (stage) {
      stage.style.setProperty("--stage-mouse-x", "0");
      stage.style.setProperty("--stage-mouse-y", "0");
      stage.style.setProperty("--stage-mouse-px", "50%");
      stage.style.setProperty("--stage-mouse-py", "50%");
    }
  }, []);

  // Pre-warm AudioContext on first user interaction for zero latency
  useEffect(() => {
    const handleFirstInteraction = () => {
      prewarmAudioContext();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);
  const [isCustomScenarioOpen, setIsCustomScenarioOpen] = useState(false);
  const [isSpeedChallengeOpen, setIsSpeedChallengeOpen] = useState(false);
  const [isSkillRadarOpen, setIsSkillRadarOpen] = useState(false);
  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);
  const [isAudioImmersionOpen, setIsAudioImmersionOpen] = useState(false);
  const [currentIndustry, setCurrentIndustry] = useState<IndustryTrack>(() => getStoredIndustryTrack());
  const [isExecutiveDarkMode, setIsExecutiveDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("vt_executive_theme") === "dark";
    } catch {
      return false;
    }
  });

  const handleToggleExecutiveDarkMode = () => {
    setIsExecutiveDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("vt_executive_theme", next ? "dark" : "light");
      } catch {}
      return next;
    });
  };
  const [idiomOfTheDay, setIdiomOfTheDay] = useState({
    phrase: "Piece of cake",
    meaningSpanish: "Algo muy fácil o sencillo de hacer (pan comido).",
    exampleEnglish: "Don't worry about the exam, it's a piece of cake!",
    isUsed: false,
  });
  const [activeLessonNode, setActiveLessonNode] = useState<LessonNode | null>(null);

  // Victory Session Modal State
  const [victoryModalState, setVictoryModalState] = useState<{
    isOpen: boolean;
    xpGained: number;
    streakCount: number;
    accuracyScore: number;
    wordsLearned: number;
    topicTitle: string;
  }>({
    isOpen: false,
    xpGained: 25,
    streakCount: 1,
    accuracyScore: 92,
    wordsLearned: 2,
    topicTitle: "Conversación en Inglés",
  });

  // Daily Quests State
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([
    {
      id: "quest-speak-3",
      title: "Practica hablar 3 frases en inglés",
      target: 3,
      current: 1,
      icon: "🎙️",
      rewardXp: 15,
      completed: false,
    },
    {
      id: "quest-vocab-2",
      title: "Descubre 2 palabras de vocabulario",
      target: 2,
      current: 1,
      icon: "📖",
      rewardXp: 10,
      completed: false,
    },
    {
      id: "quest-pronounce-85",
      title: "Logra pronunciación superior al 85%",
      target: 1,
      current: 1,
      icon: "🎯",
      rewardXp: 20,
      completed: false,
    },
  ]);

  const [dailyGoalAchievedTrigger, setDailyGoalAchievedTrigger] = useState<number>(0);

  const handleClaimQuestReward = (questId: string) => {
    const quest = dailyQuests.find((q) => q.id === questId);
    if (!quest || quest.completed) return;

    setDailyQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
    );

    const updatedGam: UserGamificationState = {
      ...gamification,
      gems: gamification.gems + quest.rewardXp,
      xpPoints: gamification.xpPoints + quest.rewardXp,
    };
    setGamification(updatedGam);
    saveStoredGamification(updatedGam);
    haptics.questComplete();

    // Trigger Mascot Goal Achieved Medal Scale-In Entrance and Joyful Animation
    setDailyGoalAchievedTrigger(Date.now());
    setAnimationState("alegre");
    setTimeout(() => {
      setAnimationState("idle");
    }, 2200);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#f59e0b", "#3b82f6"],
    });
  };
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
  const determineTutorEmotion = (
    msg: ChatMessage,
    context?: { score?: number; streak?: number }
  ): AvatarAnimationState => {
    const text = ((msg.text || "") + " " + (msg.teacherCommentary || "")).toLowerCase();
    
    // High streak, exceptional score, or loving feedback triggers heart-eyes loving animation
    const isLovingContext =
      (context?.streak && context.streak >= 3) ||
      (context?.score && context.score >= 90) ||
      /heart|love|enamorado|orgulloso|proud of you|in love with|impecable|obra de arte|perfección|perfect pronunciation|mastery|racha|racha de fuego|high streak|exceptional|brillante/i.test(
        text
      );

    if (isLovingContext) return "loving";

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

  // Continuously sync and cache active learning session for offline access
  useEffect(() => {
    saveSession({
      cefrLevel,
      topicId: activeTopicId,
      topicTitle: activeTopic?.title,
      teachingMode,
      experienceMode: appExperienceMode,
      recentMessages: messages.slice(-15),
      lastTargetPhrase: latestTutorMessage?.targetEnglishPhrase,
      lastPhoneticGuide: latestTutorMessage?.phoneticGuide,
      lastPedagogicalTip: latestTutorMessage?.pedagogicalTip,
      vocabulary,
      stats: userStats,
      activeLessonNodeId: activeLessonNode?.id,
      activeLessonTitle: activeLessonNode?.title,
    });
  }, [
    cefrLevel,
    activeTopicId,
    activeTopic?.title,
    teachingMode,
    appExperienceMode,
    messages,
    vocabulary,
    userStats,
    activeLessonNode,
    latestTutorMessage,
    saveSession,
  ]);

  // Send message to Express Backend with Gemini AI or Offline Tutor Engine
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

      // Trigger Avatar VT Medal scale-in entrance animation
      setDailyGoalAchievedTrigger(Date.now());

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

    // If offline, seamlessly generate tutor turn locally without blocking
    if (!isOnline) {
      setTimeout(() => {
        const offlineTutorMsg = generateOfflineTutorTurn(text.trim(), {
          level: cefrLevel,
          topicId: activeTopic.id,
          teacherName: avatarConfig.name,
        });

        const finalMessages = [...updatedMessages, offlineTutorMsg];
        setMessages(finalMessages);
        saveStoredHistory(finalMessages);

        const newStats = {
          ...userStats,
          messagesExchanged: userStats.messagesExchanged + 2,
          minutesPracticed: userStats.minutesPracticed + 1,
        };
        setUserStats(newStats);
        saveStoredStats(newStats);

        setIsLoading(false);
        playTutorAudio(
          offlineTutorMsg.text,
          false,
          undefined,
          "alegre",
          {
            teacherCommentary: offlineTutorMsg.teacherCommentary,
            targetEnglishPhrase: offlineTutorMsg.targetEnglishPhrase,
          }
        );
      }, 350);
      return;
    }

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

      // Detect emotion (loving, alegre/celebrating, pensativo, sorpresa) based on AI output, streak & score
      const reactionEmotion =
        aiData.animationState === "loving" || aiData.animationState === "celebrating" || aiData.animationState === "alegre" || aiData.animationState === "pensativo" || aiData.animationState === "sorpresa"
          ? (aiData.animationState as AvatarAnimationState)
          : determineTutorEmotion(tutorMsg, {
              score: overallPronunciationScore,
              streak: userStats.streakDays,
            });

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

  // If user is in Kids Mode, render dedicated Kids Experience View with cross-fade
  return (
    <div className={`min-h-screen ${seasonalThemeConfig.colors.bgRoot} bg-gradient-to-b ${seasonalThemeConfig.colors.bgGradient} text-slate-100 flex flex-col font-sans ${seasonalThemeConfig.colors.selection} relative overflow-x-hidden transition-colors duration-500`}>
      {/* Dynamic Seasonal Gentle Particles Layer */}
      <SeasonalParticlesCanvas
        themeConfig={seasonalThemeConfig}
        enabled={particlesEnabled}
        density={particleDensity}
      />

      {/* Seasonal Aurora & Ambient Backdrop Glow */}
      <div
        className={`fixed inset-0 pointer-events-none bg-gradient-to-tr ${seasonalThemeConfig.colors.auroraGlow} blur-3xl opacity-60 z-0 transition-all duration-700`}
        aria-hidden="true"
      />

      {/* Global Offline Status & Cached Active Session Indicator */}
      <OfflineStatusIndicator isOnline={isOnline} lastSession={lastSession} />

      <AnimatePresence mode="wait">
        {appExperienceMode === "kids" ? (
          <motion.div
            key="kids-view-transition"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="w-full flex-1 flex flex-col z-10"
          >
            <KidsModeView
              onSwitchToAdultsMode={handleSwitchToAdultsMode}
              onExperienceModeChange={setAppExperienceMode}
            />
          </motion.div>
        ) : (
          <motion.div
            key="adults-view-transition"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="w-full flex-1 flex flex-col z-10"
          >
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
        experienceMode={appExperienceMode}
        onExperienceModeChange={setAppExperienceMode}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenProgressDashboard={() => setIsProgressDashboardOpen(true)}
        onOpenSeasonalTheme={() => setIsSeasonalThemeModalOpen(true)}
        seasonalThemeConfig={seasonalThemeConfig}
        onOpenToolsDrawer={() => setIsToolsDrawerOpen(true)}
        onOpenSRSFlashcards={() => {
          const currentCards = getStoredFlashcards();
          importVocabularyToFlashcards(currentCards, vocabulary);
          setIsFlashcardsModalOpen(true);
        }}
        dueCardsCount={getStoredFlashcards().length}
      />

      {/* Top Segmented Tab Swipe Indicator with Gesture Breadcrumbs */}
      <SwipeNavigationIndicator
        activeTab={activeMainTab}
        onSelectTab={handleTabChange}
      />

      {/* Main Tabbed Views with Mobile Native Swipe Gesture Navigation */}
      <div
        id="main-tab-swipe-viewport"
        className="w-full flex-1 flex flex-col relative overflow-hidden"
      >
        <AnimatePresence mode="wait" custom={tabSlideDirection}>
          {activeMainTab === "path" ? (
            <motion.main
              key="main-view-path"
              custom={tabSlideDirection}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? 40 : dir < 0 ? -40 : 0,
                  opacity: 0,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                },
                exit: (dir: number) => ({
                  x: dir > 0 ? -40 : dir < 0 ? 40 : 0,
                  opacity: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              onPanEnd={handleTabPanEnd}
              className="flex-1 w-full mx-auto z-10 touch-pan-y"
            >
              <AdultLearningPath
                currentLevel={cefrLevel}
                streakDays={gamification.streakDays}
                gemsCount={gamification.gems}
                userXP={gamification.xpPoints}
                userName={avatarConfig.name === "Sarah" ? "Estudiante" : "Tú"}
                progressVersion={pathProgressVersion}
                onStartLesson={(node) => {
                  if (node.type === "boss_roleplay") {
                    const scenario =
                      ROLEPLAY_SCENARIOS.find((s) => s.id === node.scenarioId) ||
                      ROLEPLAY_SCENARIOS[0];
                    handleSelectRoleplayScenario(scenario);
                    setActiveBossNodeId(node.id);
                  } else {
                    setActiveLessonNode(node);
                  }
                }}
                onOpenRoleplayModal={() => setIsRoleplayModalOpen(true)}
                onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
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
                onOpenResearchRoadmap={() => setIsResearchRoadmapOpen(true)}
                onOpenSeasonalTheme={() => setIsSeasonalThemeModalOpen(true)}
                onSwitchToKidsMode={handleSwitchToKidsMode}
                onOpenDailyBlitz={() => setIsDailyBlitzOpen(true)}
                onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
                onOpenIndustryModal={() => setIsIndustryModalOpen(true)}
                onOpenSkillRadar={() => setIsSkillRadarOpen(true)}
                onOpenAudioImmersion={() => setIsAudioImmersionOpen(true)}
                onOpenGlobalAccents={() => setIsGlobalAccentsOpen(true)}
                onOpenStarInterview={() => setIsStarInterviewOpen(true)}
                onOpenOfflineCommute={() => setIsOfflineCommuteOpen(true)}
                isAirplaneModeActive={isAirplaneMode}
                isDarkMode={isExecutiveDarkMode}
                onToggleDarkMode={handleToggleExecutiveDarkMode}
                currentIndustry={currentIndustry}
                onOpenCertificate={(cert) => {
                  setCertificateModalData({
                    studentName: avatarConfig.name === "Sarah" ? "Estudiante Pro" : "Usuario LinguaPro",
                    unitTitle: cert.unitTitle,
                    cefrLevel: cert.cefrLevel,
                    completedDate: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
                    accuracy: 96,
                    xpEarned: 250,
                  });
                }}
              />
            </motion.main>
          ) : activeMainTab === "tools" ? (
            <motion.main
              key="main-view-tools"
              custom={tabSlideDirection}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? 40 : dir < 0 ? -40 : 0,
                  opacity: 0,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                },
                exit: (dir: number) => ({
                  x: dir > 0 ? -40 : dir < 0 ? 40 : 0,
                  opacity: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              onPanEnd={handleTabPanEnd}
              className="flex-1 w-full mx-auto z-10 touch-pan-y"
            >
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
                onOpenSeasonalTheme={() => setIsSeasonalThemeModalOpen(true)}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
                onOpenGlobalAccents={() => setIsGlobalAccentsOpen(true)}
                onOpenStarInterview={() => setIsStarInterviewOpen(true)}
                onOpenOfflineCommute={() => setIsOfflineCommuteOpen(true)}
                onSwitchToKidsMode={handleSwitchToKidsMode}
                onStartDailyPractice={() => handleTabChange("chat")}
                streakDays={gamification.streakDays}
                gemsCount={gamification.gems}
              />
            </motion.main>
          ) : (
            /* Live Call & Dialogue Stage (Conversar) - Modern Flat Gamified Layout */
            <motion.main
              key="main-view-chat"
              custom={tabSlideDirection}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? 40 : dir < 0 ? -40 : 0,
                  opacity: 0,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                },
                exit: (dir: number) => ({
                  x: dir > 0 ? -40 : dir < 0 ? 40 : 0,
                  opacity: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              onPanEnd={handleTabPanEnd}
              className="flex-1 flex flex-col items-center justify-start p-3 sm:p-5 pb-28 max-w-2xl w-full mx-auto gap-4 z-10 touch-pan-y"
            >
              {/* Active Boss Mission Notification Banner */}
              {activeBossNodeId && (
                <div className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white p-3.5 shadow-md flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg shrink-0">
                      👑
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-amber-200">
                        Simulación Boss en Curso
                      </p>
                      <p className="text-xs font-medium text-white/90">
                        Completa el diálogo para superar la prueba y desbloquear la siguiente Unidad.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCompleteBossMission}
                    className="px-3.5 py-2 rounded-xl bg-white text-slate-950 hover:bg-amber-100 font-extrabold text-xs shadow-sm transition shrink-0 cursor-pointer"
                  >
                    Completar Misión (+60 XP)
                  </button>
                </div>
              )}

              {/* Central Mascot Stage (Flat 3D Geometric Stage) */}
              <motion.section
                id="avatar-stage"
                ref={avatarStageRef}
                onMouseDown={handleAvatarStageClick}
                onPointerDown={handleAvatarStageClick}
                onPointerMove={handleStagePointerMove}
                onPointerLeave={handleStagePointerLeave}
                style={
                  {
                    "--mouth-intensity": mouthIntensity,
                    "--mic-volume": effectiveMicVolume,
                    "--stage-bg-hue": `${dynamicStageHue}deg`,
                    "--stage-bg-opacity": dynamicStageOpacity,
                    "--stage-mouse-x": stageMousePos.x,
                    "--stage-mouse-y": stageMousePos.y,
                    "--stage-mouse-px": `${((stageMousePos.x + 0.5) * 100).toFixed(1)}%`,
                    "--stage-mouse-py": `${((stageMousePos.y + 0.5) * 100).toFixed(1)}%`,
                  } as React.CSSProperties
                }
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={stageScaleAnimation}
                whileTap={{ scale: 0.985 }}
                className={`w-full min-h-[280px] sm:min-h-[320px] max-h-[380px] grid grid-rows-[auto_minmax(200px,1fr)_auto] relative rounded-3xl border-2 border-b-4 shadow-sm overflow-hidden select-none transition-all duration-300 p-3 sm:p-4 gap-2 cursor-pointer ${
                  isPlayingAudio || animationState === "speaking"
                    ? "border-amber-400/80 stage-speaking-pulse"
                    : "border-slate-800"
                }`}
              >
                {/* Circular Ripple Effect at Pointer Coordinate */}
                <AvatarStageRipple
                  ref={stageRippleRef}
                  seasonalThemeConfig={seasonalThemeConfig}
                />

                {/* Periodic Subtle Light Glint & Glass Sheen on Idle Stage */}
                <div className="avatar-stage-sheen" aria-hidden="true" />
                <div className="avatar-stage-corner-glint" aria-hidden="true" />

                {/* Smooth Checkpoint Level-Up Progression Surrounding Border */}
                <AvatarLevelCheckpointBorder
                  currentLevel={cefrLevel}
                  xpPoints={gamification.xpPoints}
                  isSpeaking={isPlayingAudio || animationState === "speaking"}
                />

                {/* Row 1 (Auto): Top Header with Mascot Identity & Tutor Selector */}
                <header className="w-full flex items-center justify-between gap-2 z-20 pointer-events-auto shrink-0 self-start">
                  {/* Mascot Identity Tag Pill */}
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-sm border-2 border-b-4 border-slate-800 hover:border-amber-500/50 active:border-b-2 active:translate-y-0.5 shadow-sm transition text-left"
                    title="Cambiar tutor o personalizar"
                  >
                    <span className="text-sm leading-none">{avatarConfig.characterEmoji || "🐦"}</span>
                    <span className="text-xs font-bold text-slate-100">{avatarConfig.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-black border border-amber-500/40">
                      {avatarConfig.voiceAccent || "US"}
                    </span>
                  </button>

                  {/* Center Live Status Indicator */}
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800/80 text-[11px] font-semibold text-slate-300 shadow-inner">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPlayingAudio || animationState === "speaking"
                          ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                          : isListening
                          ? "bg-sky-400 animate-ping"
                          : "bg-amber-400/80"
                      }`}
                    />
                    <span className="text-[10px] tracking-wide">
                      {isPlayingAudio || animationState === "speaking"
                        ? "Hablando..."
                        : isListening
                        ? "Escuchando..."
                        : "Listo para hablar"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Quick Tutor Selector */}
                    <button
                      type="button"
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-sm border-2 border-b-4 border-slate-800 hover:border-amber-500/50 active:border-b-2 active:translate-y-0.5 text-amber-300 text-xs font-bold shadow-sm transition"
                      title="Cambiar tutor o personalizar"
                    >
                      <span>✨</span>
                      <span>Tutores</span>
                    </button>
                  </div>
                </header>

                {/* Row 2 (1fr): Central Primary Flexible Mascot Viewport with Framer Motion Poke Squish Interaction */}
                <main className="w-full h-full min-h-[200px] flex-1 flex items-center justify-center relative z-10 overflow-visible">
                  <MascotPokeContainer
                    preset={avatarConfig.preset}
                    controls={mascotSquishAnimation}
                    mousePos={stageMousePos}
                    onPoke={(contactPoint) => {
                      if (contactPoint && contactPoint.clientX && avatarStageRef.current) {
                        const rect = avatarStageRef.current.getBoundingClientRect();
                        const x = contactPoint.clientX - rect.left;
                        const y = contactPoint.clientY - rect.top;
                        triggerGoldenHaloAt(x, y);
                      } else if (avatarStageRef.current) {
                        const rect = avatarStageRef.current.getBoundingClientRect();
                        triggerGoldenHaloAt(rect.width / 2, rect.height * 0.48);
                      }
                      setAnimationState("encouraging");
                      setTimeout(() => setAnimationState("idle"), 1600);
                    }}
                  >
                    {avatarConfig.customGlbUrl ? (
                      <div
                        id="avatar-body"
                        data-avatar-body="true"
                        data-mascot-body="true"
                        className="avatar-body-component w-full h-full min-h-[220px] sm:min-h-[260px] flex items-center justify-center relative cursor-pointer"
                      >
                        <AvatarCanvas
                          config={avatarConfig}
                          animationState={animationState}
                          mouthIntensity={mouthIntensity}
                          isListening={isListening}
                          stageMousePos={stageMousePos}
                          onMascotClick={() => {
                            if (avatarStageRef.current) {
                              const rect = avatarStageRef.current.getBoundingClientRect();
                              triggerGoldenHaloAt(rect.width / 2, rect.height * 0.48);
                            }
                            setAnimationState("encouraging");
                            setTimeout(() => setAnimationState("idle"), 1800);
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        id="avatar-body"
                        data-avatar-body="true"
                        data-mascot-body="true"
                        className="avatar-body-component w-full h-full flex items-center justify-center relative cursor-pointer"
                      >
                        <Avatar2DCanvas
                          config={avatarConfig}
                          animationState={animationState}
                          mouthIntensity={mouthIntensity}
                          isListening={isListening}
                          dailyGoalAchievedTrigger={dailyGoalAchievedTrigger}
                          stageMousePos={stageMousePos}
                          onMascotClick={() => {
                            if (avatarStageRef.current) {
                              const rect = avatarStageRef.current.getBoundingClientRect();
                              triggerGoldenHaloAt(rect.width / 2, rect.height * 0.48);
                            }
                            setAnimationState("encouraging");
                            setTimeout(() => setAnimationState("idle"), 1500);
                          }}
                          onCustomizerClick={() => setIsAvatarModalOpen(true)}
                          onCalibrateRigClick={() => setIsTurpialCalibratorOpen(true)}
                        />
                      </div>
                    )}
                  </MascotPokeContainer>
                </main>

                {/* Row 3 (Auto): Anchored Footer with Live Feedback & Mic Cue */}
                <footer className="w-full flex items-center justify-between text-[11px] text-slate-400 z-20 pointer-events-auto shrink-0 px-1 self-end">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isPlayingAudio || animationState === "speaking"
                          ? "bg-amber-400 animate-pulse"
                          : isListening
                          ? "bg-emerald-400 animate-ping"
                          : "bg-slate-600"
                      }`}
                    />
                    <span className="text-[10px] text-slate-300">
                      {isPlayingAudio || animationState === "speaking"
                        ? "Audio activo • Pronunciación en vivo"
                        : isListening
                        ? "Micrófono detectando voz..."
                        : "Toca el avatar para interactuar"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                    <span>Nivel {cefrLevel}</span>
                    <span className="text-slate-600">•</span>
                    <span>{gamification.xpPoints} XP</span>
                  </div>
                </footer>
              </motion.section>

              {/* AI Dialogue Bubble (Immediately below Avatar Stage for natural conversational focus) */}
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

              {/* Collapsible Session Companion Bar: Misiones, Metas y Modismo */}
              {(() => {
                const completedQuestsCount = dailyQuests.filter((q) => q.completed || q.current >= q.target).length;
                const currentScenarioGoals = scenarioGoals[activeTopic.id] || [];
                const completedGoalsCount = currentScenarioGoals.filter((g) => g.completed).length;

                return (
                  <section className="w-full flex flex-col gap-2.5">
                    {/* Segmented Companion Pills */}
                    <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5 p-1 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-2xl select-none shadow-sm">
                      {/* 1. Misiones Diarias Pill */}
                      <button
                        type="button"
                        id="companion-pill-quests"
                        onClick={() => {
                          soundFx.playPop();
                          setActiveCompanionPanel((prev) => (prev === "quests" ? "none" : "quests"));
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          activeCompanionPanel === "quests"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                        title="Ver misiones y recompensas diarias"
                      >
                        <span className="text-xs">🎯</span>
                        <span className="truncate">Misiones</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                            completedQuestsCount === dailyQuests.length
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {completedQuestsCount}/{dailyQuests.length}
                        </span>
                      </button>

                      {/* 2. Metas de Escenario Pill */}
                      <button
                        type="button"
                        id="companion-pill-scenario"
                        onClick={() => {
                          soundFx.playPop();
                          setActiveCompanionPanel((prev) => (prev === "scenario" ? "none" : "scenario"));
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          activeCompanionPanel === "scenario"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                        title="Ver retos y metas del tema actual"
                      >
                        <span className="text-xs">🎭</span>
                        <span className="truncate">Retos</span>
                        {currentScenarioGoals.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-slate-800 text-slate-400">
                            {completedGoalsCount}/{currentScenarioGoals.length}
                          </span>
                        )}
                      </button>

                      {/* 3. Modismo del Día Pill */}
                      <button
                        type="button"
                        id="companion-pill-idiom"
                        onClick={() => {
                          soundFx.playPop();
                          setActiveCompanionPanel((prev) => (prev === "idiom" ? "none" : "idiom"));
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          activeCompanionPanel === "idiom"
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                        title="Modismo recomendado del día"
                      >
                        <span className="text-xs">💡</span>
                        <span className="truncate">Modismo</span>
                        {idiomOfTheDay.isUsed && (
                          <span className="text-[10px] text-emerald-400 font-black">✓</span>
                        )}
                      </button>
                    </div>

                    {/* Animated Collapsible Panel Area */}
                    <AnimatePresence>
                      {activeCompanionPanel === "quests" && (
                        <motion.div
                          key="panel-quests"
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="w-full overflow-hidden"
                        >
                          <DailyQuestsWidget
                            quests={dailyQuests}
                            onClaimReward={handleClaimQuestReward}
                          />
                        </motion.div>
                      )}

                      {activeCompanionPanel === "scenario" && (
                        <motion.div
                          key="panel-scenario"
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="w-full overflow-hidden"
                        >
                          <ScenarioMissionsPanel
                            topicTitle={activeTopic.title}
                            category={activeTopic.category}
                            goals={currentScenarioGoals}
                          />
                        </motion.div>
                      )}

                      {activeCompanionPanel === "idiom" && (
                        <motion.div
                          key="panel-idiom"
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="w-full overflow-hidden"
                        >
                          <IdiomOfTheDayCard
                            phrase={idiomOfTheDay.phrase}
                            meaningSpanish={idiomOfTheDay.meaningSpanish}
                            exampleEnglish={idiomOfTheDay.exampleEnglish}
                            isUsedInSession={idiomOfTheDay.isUsed}
                            onPracticeIdiom={(phrase) => {
                              handleSendMessage(`Can we practice using the phrase "${phrase}"?`);
                              setIdiomOfTheDay((prev) => ({ ...prev, isUsed: true }));
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                );
              })()}

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
              <section className="w-full sticky bottom-16 sm:bottom-20 z-20">
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
                  onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
                  onOpenSpeedSpeaking={() => setIsSpeedChallengeOpen(true)}
                  onOpenCustomScenario={() => setIsCustomScenarioOpen(true)}
                  onOpenSkillRadar={() => setIsSkillRadarOpen(true)}
                />
              </section>
            </motion.main>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar (Apple / Duolingo Style) */}
      <BottomNavBar
        activeTab={activeMainTab}
        onTabChange={handleTabChange}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        onSwitchToKidsMode={handleSwitchToKidsMode}
      />
          </motion.div>
        )}
      </AnimatePresence>

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
        onOpenSeasonalTheme={() => setIsSeasonalThemeModalOpen(true)}
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
          nodeId={activeLessonNode.id}
          lessonTitle={activeLessonNode.title}
          lessonSubtitle={activeLessonNode.subtitle}
          initialXpReward={activeLessonNode.xp}
          avatarConfig={avatarConfig}
          streakDays={gamification.streakDays}
          onClose={() => setActiveLessonNode(null)}
          onComplete={(xpEarned, accuracy) => {
            // Persist completed node & unlock next lesson in sequence
            markNodeCompleted(activeLessonNode.id);
            setPathProgressVersion((v) => v + 1);

            const earnedGems = accuracy && accuracy >= 90 ? 10 : 5;
            const updatedGam = {
              ...gamification,
              xpPoints: gamification.xpPoints + xpEarned,
              gems: gamification.gems + earnedGems,
              streakDays: Math.max(gamification.streakDays, 1),
            };
            setGamification(updatedGam);
            saveStoredGamification(updatedGam);
            haptics.lessonComplete();

            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.6 },
            });
            setActiveLessonNode(null);

            // Si es un nodo de culminación de unidad o jefe, premiar con Certificado de Unidad
            if (activeLessonNode.id.includes("boss") || activeLessonNode.id.includes("n3")) {
              setCertificateModalData({
                studentName: avatarConfig.name === "Sarah" ? "Estudiante Pro" : "Usuario LinguaPro",
                unitTitle: activeLessonNode.title,
                cefrLevel: cefrLevel,
                completedDate: new Date().toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
                accuracy: accuracy || 95,
                xpEarned: xpEarned,
              });
            }
          }}
        />
      )}

      {/* Daily Blitz Rapid-Fire Modal */}
      <DailyBlitzModal
        isOpen={isDailyBlitzOpen}
        onClose={() => setIsDailyBlitzOpen(false)}
        onComplete={(xpEarned, gemsEarned) => {
          const updatedGam = {
            ...gamification,
            xpPoints: gamification.xpPoints + xpEarned,
            gems: gamification.gems + gemsEarned,
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
          setIsDailyBlitzOpen(false);
          soundFx.playSuccess();
        }}
      />

      {/* Unit Completion Certificate Modal */}
      {certificateModalData && (
        <UnitCertificateModal
          isOpen={!!certificateModalData}
          onClose={() => setCertificateModalData(null)}
          data={certificateModalData}
        />
      )}

      {/* Session Victory Modal */}
      <VictoryModal
        isOpen={victoryModalState.isOpen}
        onClose={() => setVictoryModalState((prev) => ({ ...prev, isOpen: false }))}
        xpGained={victoryModalState.xpGained}
        streakCount={victoryModalState.streakCount}
        accuracyScore={victoryModalState.accuracyScore}
        wordsLearned={victoryModalState.wordsLearned}
        topicTitle={victoryModalState.topicTitle}
      />

      {/* 1. Full-Screen Voice Call Modal (Hands-Free with VAD) */}
      <VoiceCallModal
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        characterName={avatarConfig.name}
        avatarEmoji={avatarConfig.characterEmoji || "🐦"}
        topicTitle={activeTopic.title}
        isTutorSpeaking={isPlayingAudio}
        onSendMessage={handleSendMessage}
        latestTutorMessage={latestTutorMessage?.text || ""}
        latestSpanishTranslation={latestTutorMessage?.spanishExplanation}
        onRewardXp={(xp) => {
          const updatedGam = {
            ...gamification,
            xpPoints: gamification.xpPoints + xp,
            gems: gamification.gems + 5,
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
      />

      {/* 2. Industry Track Selector Modal */}
      <IndustrySelectorModal
        isOpen={isIndustryModalOpen}
        onClose={() => setIsIndustryModalOpen(false)}
        currentTrackId={currentIndustry.id}
        onSelectTrack={(track) => setCurrentIndustry(track)}
      />

      {/* 3. Audio Immersion / Executive Podcast Player */}
      <AudioImmersionModal
        isOpen={isAudioImmersionOpen}
        onClose={() => setIsAudioImmersionOpen(false)}
        onRewardXp={(xp) => {
          const updatedGam = {
            ...gamification,
            xpPoints: gamification.xpPoints + xp,
            gems: gamification.gems + 10,
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
      />

      {/* 4. Custom Roleplay Scenario Generator with AI */}
      <CustomScenarioPromptModal
        isOpen={isCustomScenarioOpen}
        onClose={() => setIsCustomScenarioOpen(false)}
        onStartCustomScenario={(title, promptText) => {
          handleSendMessage(`Let's do a roleplay scenario: ${promptText}`);
        }}
      />

      {/* 3. Speed Speaking 60s Challenge Modal */}
      <SpeedSpeakingChallengeModal
        isOpen={isSpeedChallengeOpen}
        onClose={() => setIsSpeedChallengeOpen(false)}
        onRewardXP={(rewardXP) => {
          const updatedGam = {
            ...gamification,
            xpPoints: gamification.xpPoints + rewardXP,
            gems: gamification.gems + Math.floor(rewardXP / 5),
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
      />

      {/* 4. CEFR Skills Radar Modal */}
      <SkillRadarModal
        isOpen={isSkillRadarOpen}
        onClose={() => setIsSkillRadarOpen(false)}
        cefrLevel={cefrLevel}
        fluencyScore={85}
        pronunciationScore={overallPronunciationScore > 0 ? overallPronunciationScore : 88}
        grammarScore={82}
        vocabularyScore={90}
        comprehensionScore={94}
      />

      {/* 5. Weekly Competitive League Leaderboard Modal */}
      <WeeklyLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        userXP={gamification.xpPoints}
        userName={avatarConfig.name === "Bet el Turpial" ? "Tú" : "Estudiante"}
        userStreak={gamification.streakDays}
      />

      {/* 6. Weekly Speaking Minutes & CEFR Progress Analytics Dashboard */}
      <WeeklyProgressDashboardModal
        isOpen={isProgressDashboardOpen}
        onClose={() => setIsProgressDashboardOpen(false)}
        streakDays={gamification.streakDays}
        wordsLearnedCount={userStats.wordsLearned || vocabulary.length}
        totalSpeakingMinutes={userStats.minutesPracticed || 18}
        cefrLevel={cefrLevel}
      />

      {/* 7. Seasonal Theme Engine & Particle Effects Modal */}
      <SeasonalThemeModal
        isOpen={isSeasonalThemeModalOpen}
        onClose={() => setIsSeasonalThemeModalOpen(false)}
        currentThemeId={seasonalThemeId}
        onSelectTheme={handleSelectSeasonalTheme}
        particlesEnabled={particlesEnabled}
        onToggleParticles={handleToggleParticles}
        particleDensity={particleDensity}
        onChangeDensity={handleChangeParticleDensity}
      />

      {/* 8. Turpial Rig 2.5D Calibrator Modal (Manual Spacing & Medals Controls) */}
      <TurpialRigCalibratorModal
        isOpen={isTurpialCalibratorOpen}
        onClose={() => setIsTurpialCalibratorOpen(false)}
      />

      {/* 9. Global Accents Trainer Modal */}
      <GlobalAccentsModal
        isOpen={isGlobalAccentsOpen}
        onClose={() => setIsGlobalAccentsOpen(false)}
        onScoreUpdate={(earnedXp) => {
          const updatedGam = {
            ...gamification,
            xpPoints: gamification.xpPoints + earnedXp,
            gems: gamification.gems + Math.max(1, Math.round(earnedXp / 10)),
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
      />

      {/* 10. STAR Method Job Interview Coach Modal */}
      <StarInterviewModal
        isOpen={isStarInterviewOpen}
        onClose={() => setIsStarInterviewOpen(false)}
        onScoreEarned={(score, earnedGems) => {
          const earnedXp = Math.round(score);
          const updatedGam = {
            ...gamification,
            xpPoints: gamification.xpPoints + earnedXp,
            gems: gamification.gems + earnedGems,
          };
          setGamification(updatedGam);
          saveStoredGamification(updatedGam);
        }}
      />

      {/* 11. Offline Commute Packs Modal (Metro & Flight) */}
      <OfflineCommuteModal
        isOpen={isOfflineCommuteOpen}
        onClose={() => setIsOfflineCommuteOpen(false)}
        onAirplaneModeChange={(active) => setIsAirplaneMode(active)}
      />
    </div>
  );
}
