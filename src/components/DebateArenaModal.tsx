import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Swords,
  Shield,
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  X,
  RotateCcw,
  BookOpen,
  Award,
  Check,
  ChevronRight,
  ChevronLeft,
  Flame,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Brain,
  Scale,
  MessageSquare,
  BookMarked,
  Languages,
} from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "../utils/soundFx";
import { speakText, stopSpeaking } from "../utils/speech";
import { AvatarConfig, VocabularyItem } from "../types";
import { Avatar2DCanvas } from "./Avatar2DCanvas";
import { AvatarCanvas } from "./AvatarCanvas";
import {
  DEBATE_TOPICS,
  DebateTopic,
  PERSUASIVE_CONNECTORS,
  PersuasiveConnector,
} from "../data/debateTopics";

interface DebateArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarConfig: AvatarConfig;
  onRewardXp?: (xp: number) => void;
  onSaveVocabulary?: (item: Omit<VocabularyItem, "id" | "dateAdded">) => void;
  onSendDebateTurn?: (
    topic: DebateTopic,
    userStance: "PRO" | "CON",
    userArgument: string,
    round: number,
    history: Array<{ role: "user" | "tutor"; text: string }>
  ) => Promise<{
    rebuttalText: string;
    spanishExplanation: string;
    persuasiveScore: number;
    feedbackTip: string;
    usedConnector?: string;
  }>;
}

interface DebateMessage {
  id: string;
  role: "user" | "tutor";
  text: string;
  spanishExplanation?: string;
  persuasiveScore?: number;
  feedbackTip?: string;
  round: number;
}

export const DebateArenaModal: React.FC<DebateArenaModalProps> = ({
  isOpen,
  onClose,
  avatarConfig,
  onRewardXp,
  onSaveVocabulary,
  onSendDebateTurn,
}) => {
  // Phase of the modal: "setup" | "arena" | "verdict"
  const [phase, setPhase] = useState<"setup" | "arena" | "verdict">("setup");

  // Selected topic and stances
  const [selectedTopic, setSelectedTopic] = useState<DebateTopic>(DEBATE_TOPICS[0]);
  const [userStance, setUserStance] = useState<"PRO" | "CON">("PRO");

  // Debate state
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [debateHistory, setDebateHistory] = useState<DebateMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [mouthIntensity, setMouthIntensity] = useState(0);

  // Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const [speechPreview, setSpeechPreview] = useState("");
  const [micSupported, setMicSupported] = useState(true);

  // Tools & Sidebars
  const [showConnectorsDrawer, setShowConnectorsDrawer] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [showTranslations, setShowTranslations] = useState(true);
  const [savedVocabIds, setSavedVocabIds] = useState<Set<string>>(new Set());

  // Performance scoring
  const [scoresHistory, setScoresHistory] = useState<number[]>([]);
  const [connectorsUsedCount, setConnectorsUsedCount] = useState(0);

  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setPhase("setup");
      setCurrentRound(1);
      setDebateHistory([]);
      setInputText("");
      setSpeechPreview("");
      setIsAiResponding(false);
      setIsTutorSpeaking(false);
      setScoresHistory([]);
      setConnectorsUsedCount(0);
      setSavedVocabIds(new Set());
    } else {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    }
  }, [isOpen]);

  // Speech Recognition setup
  useEffect(() => {
    isComponentMounted.current = true;
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    return () => {
      isComponentMounted.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const startListening = () => {
    if (!micSupported || isListening || isTutorSpeaking || isAiResponding) return;

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        soundFx.playPop();
      };

      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = 0; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        setSpeechPreview(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (speechPreview.trim()) {
          setInputText((prev) => (prev ? `${prev} ${speechPreview}` : speechPreview));
          setSpeechPreview("");
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    if (speechPreview.trim()) {
      setInputText((prev) => (prev ? `${prev} ${speechPreview}` : speechPreview));
      setSpeechPreview("");
    }
  };

  // Start the debate
  const handleStartDebate = () => {
    soundFx.playSuccess();
    setPhase("arena");
    setCurrentRound(1);

    const tutorStance = userStance === "PRO" ? "CON" : "PRO";
    const openingTutorPrompt =
      userStance === "PRO"
        ? `Welcome to the debate arena! You are arguing FOR "${selectedTopic.title}", which means I will be defending the CON position: "${selectedTopic.conStance}". Present your opening statement for Round 1!`
        : `Welcome to the debate arena! You are arguing AGAINST "${selectedTopic.title}", so I will be defending the PRO position: "${selectedTopic.proStance}". Deliver your opening argument for Round 1!`;

    const initialMsg: DebateMessage = {
      id: `tutor-intro-${Date.now()}`,
      role: "tutor",
      text: openingTutorPrompt,
      spanishExplanation: `¡Bienvenido al debate! Tú defiendes la postura ${userStance}, por lo que el tutor defenderá la postura contraria (${tutorStance}). Presenta tu argumento inicial para la Ronda 1.`,
      round: 1,
    };

    setDebateHistory([initialMsg]);

    // Speak initial intro
    speakText(
      openingTutorPrompt,
      avatarConfig,
      () => setIsTutorSpeaking(true),
      () => {
        setIsTutorSpeaking(false);
        setMouthIntensity(0);
      },
      (intensity) => setMouthIntensity(intensity)
    );
  };

  // Submit an argument turn
  const handleSubmitArgument = async (customArg?: string) => {
    const textToSend = (customArg || inputText || speechPreview).trim();
    if (!textToSend || isAiResponding || isTutorSpeaking) return;

    soundFx.playPop();
    setInputText("");
    setSpeechPreview("");

    // Check if user used any persuasive connectors
    const foundConnector = PERSUASIVE_CONNECTORS.some((c) =>
      textToSend.toLowerCase().includes(c.phrase.toLowerCase().replace("...", "").trim())
    );
    if (foundConnector) {
      setConnectorsUsedCount((prev) => prev + 1);
    }

    const userMsg: DebateMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend,
      round: currentRound,
    };

    const newHistory = [...debateHistory, userMsg];
    setDebateHistory(newHistory);
    setIsAiResponding(true);

    try {
      let rebuttalResult: {
        rebuttalText: string;
        spanishExplanation: string;
        persuasiveScore: number;
        feedbackTip: string;
      };

      if (onSendDebateTurn) {
        rebuttalResult = await onSendDebateTurn(
          selectedTopic,
          userStance,
          textToSend,
          currentRound,
          newHistory.map((m) => ({ role: m.role, text: m.text }))
        );
      } else {
        // High-quality pedagogical fallback rebuttal engine
        await new Promise((r) => setTimeout(r, 1200));

        const isUserPro = userStance === "PRO";
        const topicRebuttals = isUserPro
          ? selectedTopic.sampleRebuttals?.conTutor || []
          : selectedTopic.sampleRebuttals?.proTutor || [];

        const defaultRebuttals = isUserPro
          ? [
              `To be fair, while your point sounds nice, you have to look at the other side of the story!`,
              `Hold on a second! At the end of the day, there are huge advantages to the opposite choice that we cannot ignore.`,
              `I see what you mean, but from my own experience, the alternative brings so much more joy and satisfaction!`,
            ]
          : [
              `Come on! You have to admit that the other option has made millions of people genuinely happy!`,
              `While I understand your hesitation, don't forget how convenient and exciting the alternative really is!`,
              `At the end of the day, why not enjoy the best of both worlds? The positive side brings unforgettable moments!`,
            ];

        const activeList = topicRebuttals.length > 0 ? topicRebuttals : defaultRebuttals;
        const rebuttalText =
          activeList[(currentRound - 1) % activeList.length] ||
          `That is a very fun point, but let's look at the flip side before deciding!`;

        const calcScore = Math.min(
          98,
          Math.max(78, 82 + (foundConnector ? 10 : 3) + Math.min(6, textToSend.split(" ").length))
        );

        rebuttalResult = {
          rebuttalText,
          spanishExplanation: `El tutor te responde con entusiasmo defendiendo la postura contraria con argumentos divertidos.`,
          persuasiveScore: calcScore,
          feedbackTip: foundConnector
            ? `¡Genial! Usaste conectores naturales para darle fuerza y fluidez a tu opinión.`
            : `¡Buen punto! Prueba usar expresiones como "To be fair...", "At the end of the day..." o "Without a doubt..." para sonar aún más natural.`,
        };
      }

      setScoresHistory((prev) => [...prev, rebuttalResult.persuasiveScore]);

      const tutorMsg: DebateMessage = {
        id: `tutor-${Date.now()}`,
        role: "tutor",
        text: rebuttalResult.rebuttalText,
        spanishExplanation: rebuttalResult.spanishExplanation,
        persuasiveScore: rebuttalResult.persuasiveScore,
        feedbackTip: rebuttalResult.feedbackTip,
        round: currentRound,
      };

      setDebateHistory((prev) => [...prev, tutorMsg]);
      setIsAiResponding(false);

      // Speak rebuttal
      speakText(
        rebuttalResult.rebuttalText,
        avatarConfig,
        () => setIsTutorSpeaking(true),
        () => {
          setIsTutorSpeaking(false);
          setMouthIntensity(0);
          // Advance round or conclude
          if (currentRound < 3) {
            setCurrentRound((prev) => prev + 1);
          } else {
            // Conclude debate and show verdict
            setTimeout(() => {
              handleFinishDebate();
            }, 1000);
          }
        },
        (intensity) => setMouthIntensity(intensity)
      );
    } catch {
      setIsAiResponding(false);
    }
  };

  // Conclude debate and calculate awards
  const handleFinishDebate = () => {
    stopSpeaking();
    setPhase("verdict");
    soundFx.playSuccess();

    const avgScore =
      scoresHistory.length > 0
        ? Math.round(scoresHistory.reduce((a, b) => a + b, 0) / scoresHistory.length)
        : 88;

    const baseXP = 50;
    const connectorBonus = connectorsUsedCount * 10;
    const scoreBonus = Math.floor(avgScore / 5);
    const totalXP = baseXP + connectorBonus + scoreBonus;

    onRewardXp?.(totalXP);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Insert persuasive connector into input field
  const handleInsertConnector = (connector: PersuasiveConnector) => {
    soundFx.playPop();
    setInputText((prev) => {
      const clean = prev.trim();
      return clean ? `${clean} ${connector.phrase} ` : `${connector.phrase} `;
    });
    setShowConnectorsDrawer(false);
  };

  // Save key vocabulary word to SRS Flashcards
  const handleSaveWord = (vocab: DebateTopic["keyVocabulary"][0]) => {
    if (savedVocabIds.has(vocab.word)) return;
    soundFx.playSuccess();
    setSavedVocabIds((prev) => new Set([...prev, vocab.word]));

    if (onSaveVocabulary) {
      onSaveVocabulary({
        word: vocab.word,
        ipa: vocab.ipa,
        meaning: vocab.meaning,
        example: `Debated during topic: ${selectedTopic.title}`,
        mastered: false,
      });
    }
  };

  if (!isOpen) return null;

  const averageScore =
    scoresHistory.length > 0
      ? Math.round(scoresHistory.reduce((a, b) => a + b, 0) / scoresHistory.length)
      : 88;

  const filteredConnectors =
    selectedCategoryFilter === "All"
      ? PERSUASIVE_CONNECTORS
      : PERSUASIVE_CONNECTORS.filter((c) => c.category === selectedCategoryFilter);

  const animationState = isTutorSpeaking ? "speaking" : isAiResponding ? "pensativo" : "idle";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-2xl text-white select-none overflow-y-auto">
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          className="w-full max-w-4xl h-[90vh] max-h-[820px] rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* TOP HEADER */}
          <header className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">Arena de Debate</h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase">
                    Pensamiento Crítico
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {phase === "setup"
                    ? "Selecciona un tema actual y tu postura opuesta"
                    : `Ronda ${currentRound} de 3 • ${selectedTopic.title}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {phase === "arena" && (
                <button
                  onClick={() => setShowConnectorsDrawer(!showConnectorsDrawer)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                    showConnectorsDrawer
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Arsenal Retórico</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* PHASE 1: SETUP & TOPIC SELECTION */}
          {phase === "setup" && (
            <div className="flex-1 p-5 sm:p-8 flex flex-col gap-6 overflow-y-auto">
              <div className="text-center max-w-xl mx-auto flex flex-col items-center gap-1.5">
                <span className="text-3xl">⚔️</span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Elige un Debate y Desafía al Tutor
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Elige un tema divertido y cotidiano que te apasione debatir. El tutor adoptará{" "}
                  <strong className="text-amber-300">con humor y entusiasmo la postura opuesta</strong> para
                  que hables con soltura, defiendas tus gustos y disfrutes expresándote en inglés.
                </p>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {DEBATE_TOPICS.map((topic) => {
                  const isSelected = selectedTopic.id === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedTopic(topic);
                      }}
                      className={`p-4 rounded-2xl text-left border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-2xl">{topic.emoji}</span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {topic.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white">{topic.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {topic.description}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Seleccionado</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stance Selector */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1 text-center sm:text-left">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Tu Postura de Debate:
                  </span>
                  <p className="text-xs text-slate-300">
                    El tutor tomará la postura{" "}
                    <strong className="text-rose-400">
                      {userStance === "PRO" ? "CON (En contra)" : "PRO (A favor)"}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      soundFx.playPop();
                      setUserStance("PRO");
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs transition border cursor-pointer ${
                      userStance === "PRO"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    🟢 PRO (A favor)
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playPop();
                      setUserStance("CON");
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs transition border cursor-pointer ${
                      userStance === "CON"
                        ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    🔴 CON (En contra)
                  </button>
                </div>
              </div>

              {/* Start Debate CTA */}
              <button
                onClick={handleStartDebate}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:brightness-110 text-slate-950 font-black text-base border-2 border-b-4 border-amber-700 active:border-b-2 active:translate-y-0.5 shadow-xl flex items-center justify-center gap-2.5 transition cursor-pointer mt-auto"
              >
                <Swords className="w-5 h-5" />
                <span>Iniciar Debate vs {avatarConfig.name}</span>
              </button>
            </div>
          )}

          {/* PHASE 2: LIVE DEBATE ARENA */}
          {phase === "arena" && (
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden relative">
              {/* LEFT COLUMN: 3D/2.5D Avatar & Opponent Status */}
              <div className="w-full sm:w-72 bg-slate-950/70 border-b sm:border-b-0 sm:border-r border-slate-800 p-4 flex sm:flex-col items-center justify-between sm:justify-start gap-4 shrink-0">
                {/* Avatar Card */}
                <div className="relative flex flex-col items-center">
                  <div className="w-28 h-28 sm:w-44 sm:h-44 relative flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900 border-2 border-slate-700 shadow-xl">
                    {avatarConfig.customGlbUrl ? (
                      <AvatarCanvas
                        config={avatarConfig}
                        animationState={animationState}
                        mouthIntensity={mouthIntensity || (isTutorSpeaking ? 0.45 : 0)}
                        isListening={isListening}
                      />
                    ) : (
                      <Avatar2DCanvas
                        config={avatarConfig}
                        animationState={animationState}
                        mouthIntensity={mouthIntensity || (isTutorSpeaking ? 0.45 : 0)}
                        isListening={isListening}
                        dailyGoalAchievedTrigger={0}
                      />
                    )}
                  </div>

                  {/* Stance Indicator Badge */}
                  <div className="mt-2 text-center">
                    <span className="text-xs font-black text-white">{avatarConfig.name}</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black mt-0.5">
                      <span>Postura Oponente:</span>
                      <strong>{userStance === "PRO" ? "CON" : "PRO"}</strong>
                    </div>
                  </div>
                </div>

                {/* Live Round Gauge */}
                <div className="w-full hidden sm:flex flex-col gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Progreso del Debate
                  </span>
                  <div className="flex items-center justify-between gap-1.5">
                    {[1, 2, 3].map((r) => (
                      <div
                        key={r}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black transition ${
                          currentRound === r
                            ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                            : currentRound > r
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        Ronda {r}
                      </div>
                    ))}
                  </div>

                  {/* Connectors counter */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400 font-bold">
                    <span>Conectores usados:</span>
                    <span className="text-amber-300 font-black">⚡ {connectorsUsedCount}</span>
                  </div>
                </div>

                {/* Key Vocabulary Pills */}
                <div className="hidden sm:flex flex-col gap-1.5 w-full">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    Vocabulario Clave:
                  </span>
                  <div className="flex flex-col gap-1">
                    {selectedTopic.keyVocabulary.map((vocab) => {
                      const isSaved = savedVocabIds.has(vocab.word);
                      return (
                        <div
                          key={vocab.word}
                          className="flex items-center justify-between p-1.5 px-2 rounded-xl bg-slate-900 border border-slate-800 text-left text-[11px]"
                        >
                          <span className="font-bold text-slate-200 truncate">{vocab.word}</span>
                          <button
                            onClick={() => handleSaveWord(vocab)}
                            disabled={isSaved}
                            className={`p-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                              isSaved
                                ? "text-emerald-400"
                                : "text-sky-400 hover:bg-slate-800"
                            }`}
                            title="Añadir a Flashcards"
                          >
                            {isSaved ? <Check className="w-3 h-3" /> : "+"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Debate Transcript & Input Console */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/40">
                {/* Transcript Scroll Area */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col gap-3.5">
                  {debateHistory.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col gap-1 max-w-[88%] ${
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 px-1">
                        <span>{msg.role === "user" ? "Tu Argumento" : avatarConfig.name}</span>
                        <span>• Ronda {msg.round}</span>
                        {msg.persuasiveScore && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-black">
                            {msg.persuasiveScore}% Persuasivo
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-md ${
                          msg.role === "user"
                            ? "bg-amber-500 text-slate-950 font-bold rounded-tr-none"
                            : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/80"
                        }`}
                      >
                        <p>{msg.text}</p>

                        {showTranslations && msg.spanishExplanation && (
                          <p className="text-[11px] text-slate-400 italic mt-2 pt-2 border-t border-slate-700/60 font-normal">
                            💡 {msg.spanishExplanation}
                          </p>
                        )}

                        {msg.feedbackTip && (
                          <div className="mt-2 p-2 rounded-xl bg-slate-950/60 border border-slate-700/60 text-[11px] text-amber-200 flex items-start gap-1.5 font-normal">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{msg.feedbackTip}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {isAiResponding && (
                    <div className="mr-auto p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs flex items-center gap-2 animate-pulse">
                      <Brain className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>{avatarConfig.name} está analizando tu argumento y preparando su refutación...</span>
                    </div>
                  )}
                </div>

                {/* Input Console */}
                <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col gap-2">
                  {/* Speech Preview if recording */}
                  {isListening && speechPreview && (
                    <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs italic flex items-center justify-between gap-2">
                      <span>"{speechPreview}"</span>
                      <button
                        onClick={stopListening}
                        className="px-2 py-1 rounded-lg bg-sky-500 text-slate-950 font-black text-[10px]"
                      >
                        Insertar
                      </button>
                    </div>
                  )}

                  {/* Starter Argument Ideas (Quick Chips) */}
                  {debateHistory.length <= 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        Idea rápida:
                      </span>
                      {selectedTopic.starterArguments[userStance.toLowerCase() as "pro" | "con"]?.map(
                        (idea, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              soundFx.playPop();
                              setInputText(idea);
                            }}
                            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 whitespace-nowrap shrink-0 transition"
                          >
                            "{idea.slice(0, 45)}..."
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {/* Input row */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitArgument();
                        }
                      }}
                      placeholder={`Defiende tu postura en inglés (Ronda ${currentRound}/3)...`}
                      disabled={isAiResponding || isTutorSpeaking}
                      className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border-2 border-slate-700 focus:border-amber-400 focus:outline-none text-white text-xs sm:text-sm placeholder:text-slate-500"
                    />

                    {/* Mic Button */}
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={isAiResponding || isTutorSpeaking}
                      className={`p-3 rounded-2xl border-2 transition cursor-pointer ${
                        isListening
                          ? "bg-rose-600 border-rose-400 text-white animate-pulse"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                      }`}
                      title={isListening ? "Detener grabación" : "Hablar tu argumento en inglés"}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    {/* Send Button */}
                    <button
                      onClick={() => handleSubmitArgument()}
                      disabled={(!inputText.trim() && !speechPreview.trim()) || isAiResponding || isTutorSpeaking}
                      className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm border-2 border-b-4 border-amber-700 active:border-b-2 active:translate-y-0.5 shadow-lg flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Refutar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* PERSUASIVE CONNECTORS ARSENAL DRAWER */}
              {showConnectorsDrawer && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  className="absolute right-0 top-0 bottom-0 w-80 bg-slate-950 border-l border-slate-800 p-4 flex flex-col gap-3 shadow-2xl z-30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        Arsenal Retórico
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowConnectorsDrawer(false)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Toca un conector para insertarlo en tu argumento:
                  </p>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                    {["All", "Concession", "Rebuttal", "Evidence", "Emphasis"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded-md font-bold transition shrink-0 ${
                          selectedCategoryFilter === cat
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Connectors List */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
                    {filteredConnectors.map((conn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleInsertConnector(conn)}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-left transition cursor-pointer flex flex-col gap-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 group-hover:underline">
                            "{conn.phrase}"
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {conn.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{conn.meaning}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* PHASE 3: VERDICT & RHETORIC REPORT */}
          {phase === "verdict" && (
            <div className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-center gap-5 overflow-y-auto">
              <div className="text-center flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-xl shadow-amber-500/25 text-white">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">¡Debate Completado con Éxito!</h3>
                <p className="text-xs text-slate-400">
                  Tema: {selectedTopic.title} • 3 Rondas de Pensamiento Crítico
                </p>
              </div>

              {/* Score Matrix */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Puntaje Retórico</p>
                  <p className="text-xl font-black text-emerald-400">{averageScore}%</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Conectores</p>
                  <p className="text-xl font-black text-amber-400">{connectorsUsedCount} usados</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Rondas</p>
                  <p className="text-xl font-black text-sky-400">3/3 Ganadas</p>
                </div>
              </div>

              {/* Reward Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-500/15 border border-amber-500/40 w-full max-w-lg flex items-center justify-around text-center">
                <div>
                  <p className="text-base font-black text-amber-300">+{50 + connectorsUsedCount * 10} XP</p>
                  <p className="text-[10px] text-slate-400">Experiencia Crítica</p>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div>
                  <p className="text-base font-black text-sky-300">+8 Gemas</p>
                  <p className="text-[10px] text-slate-400">Recompensa</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full max-w-lg pt-2">
                <button
                  onClick={() => {
                    soundFx.playPop();
                    setPhase("setup");
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Nuevo Debate</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs border-2 border-b-4 border-amber-700 active:border-b-2 active:translate-y-0.5 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Volver a Herramientas</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
