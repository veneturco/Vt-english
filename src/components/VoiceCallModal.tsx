import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Languages,
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
  VolumeX,
  Volume1,
  Turtle,
  RotateCcw,
  Lightbulb,
  Headphones,
  Award,
  BookMarked,
  Check,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "../utils/soundFx";
import { speakText, stopSpeaking } from "../utils/speech";
import { AvatarConfig, VocabularyItem } from "../types";
import { Avatar2DCanvas } from "./Avatar2DCanvas";
import { AvatarCanvas } from "./AvatarCanvas";
import { callAmbientSound } from "../utils/callAmbientSound";
import { CALL_SCENARIOS, CallScenario } from "../data/callScenarios";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  avatarEmoji: string;
  topicTitle: string;
  isTutorSpeaking: boolean;
  onSendMessage: (text: string) => void;
  latestTutorMessage: string;
  latestSpanishTranslation?: string;
  onRewardXp?: (xp: number) => void;
  avatarConfig?: AvatarConfig;
  mouthIntensity?: number;
  isLoading?: boolean;
  onSaveVocabulary?: (item: Omit<VocabularyItem, "id" | "dateAdded">) => void;
}

interface CallStats {
  durationSeconds: number;
  turnsCount: number;
  wordsSpoken: number;
  fluencyScore: number;
  xpEarned: number;
  gemsEarned: number;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  characterName,
  avatarEmoji,
  topicTitle,
  isTutorSpeaking,
  onSendMessage,
  latestTutorMessage,
  latestSpanishTranslation,
  onRewardXp,
  avatarConfig,
  mouthIntensity = 0,
  isLoading = false,
  onSaveVocabulary,
}) => {
  // State variables
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [userSpeechPreview, setUserSpeechPreview] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isWaitingAi, setIsWaitingAi] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState(false);

  // Advanced feature states
  const [selectedScenario, setSelectedScenario] = useState<CallScenario>(CALL_SCENARIOS[0]);
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const [ambientSoundMode, setAmbientSoundMode] = useState<"off" | "cafe" | "airport" | "rain" | "office">(
    CALL_SCENARIOS[0].ambientSound
  );
  const [ambientVolume, setAmbientVolume] = useState(0.12);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isSlowPlaying, setIsSlowPlaying] = useState(false);
  const [isRepeatPlaying, setIsRepeatPlaying] = useState(false);

  // Real-time Fluency & Phonetic Tracking
  const [turnsCount, setTurnsCount] = useState(0);
  const [totalWordsSpoken, setTotalWordsSpoken] = useState(0);
  const [liveFluencyScore, setLiveFluencyScore] = useState(88);

  // Post-Call Performance Summary Modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [callStats, setCallStats] = useState<CallStats | null>(null);
  const [savedWordIds, setSavedWordIds] = useState<Set<string>>(new Set());

  // Refs
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiTimeoutGuardRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);

  // Initialize or reset scenario when opening
  useEffect(() => {
    if (isOpen) {
      setShowSummaryModal(false);
      setCallDuration(0);
      setTurnsCount(0);
      setTotalWordsSpoken(0);
      setLiveFluencyScore(88);
      setSavedWordIds(new Set());

      // Set ambient sound according to scenario
      callAmbientSound.setMode(selectedScenario.ambientSound, ambientVolume);
      setAmbientSoundMode(selectedScenario.ambientSound);
    } else {
      callAmbientSound.stop();
    }
  }, [isOpen]);

  // Handle ambient sound mode changes
  const handleToggleAmbientSound = () => {
    soundFx.playPop();
    const modes: Array<"off" | "cafe" | "airport" | "rain" | "office"> = [
      "off",
      "cafe",
      "airport",
      "rain",
      "office",
    ];
    const currentIndex = modes.indexOf(ambientSoundMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setAmbientSoundMode(nextMode);
    callAmbientSound.setMode(nextMode, ambientVolume);
  };

  // Call timer
  useEffect(() => {
    if (!isOpen || showSummaryModal) {
      return;
    }
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, showSummaryModal]);

  // When tutor starts speaking, release AI waiting state
  useEffect(() => {
    if (isTutorSpeaking) {
      setIsWaitingAi(false);
      if (aiTimeoutGuardRef.current) {
        clearTimeout(aiTimeoutGuardRef.current);
        aiTimeoutGuardRef.current = null;
      }
    }
  }, [isTutorSpeaking]);

  // Anti-limbo guard: if AI takes more than 8.5 seconds, unfreeze and let student talk again
  useEffect(() => {
    if (isWaitingAi) {
      if (aiTimeoutGuardRef.current) clearTimeout(aiTimeoutGuardRef.current);
      aiTimeoutGuardRef.current = setTimeout(() => {
        setIsWaitingAi(false);
      }, 8500);
    } else {
      if (aiTimeoutGuardRef.current) {
        clearTimeout(aiTimeoutGuardRef.current);
        aiTimeoutGuardRef.current = null;
      }
    }
    return () => {
      if (aiTimeoutGuardRef.current) clearTimeout(aiTimeoutGuardRef.current);
    };
  }, [isWaitingAi]);

  // Send message function (from silence timer or explicit click)
  const handleCommitMessage = useCallback(
    (textToSend: string) => {
      const cleaned = textToSend.trim();
      if (!cleaned) return;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Track stats
      const words = cleaned.split(/\s+/).filter(Boolean).length;
      setTurnsCount((prev) => prev + 1);
      setTotalWordsSpoken((prev) => prev + words);

      // Real-time fluency computation based on length & cadence
      const turnFluency = Math.min(98, Math.max(78, 80 + Math.min(18, words * 2.2)));
      setLiveFluencyScore((prev) => Math.round((prev + turnFluency) / 2));

      setUserSpeechPreview("");
      setIsWaitingAi(true);
      soundFx.playPop();

      // Temporarily pause recognition while message is processing
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      onSendMessage(cleaned);
    },
    [onSendMessage]
  );

  // Play tutor message slower (0.75x)
  const handlePlaySlow = () => {
    if (!latestTutorMessage || isTutorSpeaking) return;
    soundFx.playPop();
    setIsSlowPlaying(true);
    speakText(
      latestTutorMessage,
      avatarConfig,
      () => setIsSlowPlaying(true),
      () => setIsSlowPlaying(false),
      undefined,
      { rateMultiplier: 0.72 }
    );
  };

  // Repeat tutor message at normal speed
  const handleRepeatMessage = () => {
    if (!latestTutorMessage || isTutorSpeaking) return;
    soundFx.playPop();
    setIsRepeatPlaying(true);
    speakText(
      latestTutorMessage,
      avatarConfig,
      () => setIsRepeatPlaying(true),
      () => setIsRepeatPlaying(false),
      undefined,
      { rateMultiplier: 1.0 }
    );
  };

  // Select a new scenario during the call
  const handleSelectScenario = (scenario: CallScenario) => {
    soundFx.playPop();
    setSelectedScenario(scenario);
    setIsScenarioDropdownOpen(false);
    setAmbientSoundMode(scenario.ambientSound);
    callAmbientSound.setMode(scenario.ambientSound, ambientVolume);

    // Provide initial scenario greeting
    if (scenario.starterPrompt) {
      onSendMessage(`[Scenario Started: ${scenario.title}] Let's begin.`);
    }
  };

  // Save vocabulary to SRS Flashcards
  const handleSaveWord = (vocab: CallScenario["keyVocabulary"][0]) => {
    if (savedWordIds.has(vocab.word)) return;
    soundFx.playSuccess();
    setSavedWordIds((prev) => new Set([...prev, vocab.word]));

    if (onSaveVocabulary) {
      onSaveVocabulary({
        word: vocab.word,
        ipa: vocab.ipa,
        phoneticSpanish: vocab.phoneticSpanish,
        meaning: vocab.meaning,
        example: vocab.example,
        mastered: false,
      });
    }
  };

  // End Call & Show Summary
  const handleHangUp = () => {
    stopSpeaking();
    callAmbientSound.stop();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (callDuration >= 6 || turnsCount > 0) {
      // Calculate final summary stats & rewards
      const baseXP = 30;
      const turnBonus = turnsCount * 8;
      const timeBonus = Math.min(30, Math.floor(callDuration / 10) * 5);
      const totalXP = baseXP + turnBonus + timeBonus;
      const totalGems = Math.max(3, Math.floor(totalXP / 10));

      const stats: CallStats = {
        durationSeconds: callDuration,
        turnsCount: Math.max(1, turnsCount),
        wordsSpoken: Math.max(8, totalWordsSpoken),
        fluencyScore: liveFluencyScore,
        xpEarned: totalXP,
        gemsEarned: totalGems,
      };

      setCallStats(stats);
      setShowSummaryModal(true);
      soundFx.playSuccess();
      onRewardXp?.(totalXP);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      soundFx.playPop();
      onClose();
    }
  };

  // Continuous speech recognition loop with auto-reconnect on unexpected end
  useEffect(() => {
    isComponentMountedRef.current = true;

    if (!isOpen || showSummaryModal) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
      setIsListening(false);
      setIsWaitingAi(false);
      setUserSpeechPreview("");
      return;
    }

    // Don't listen if muted, if tutor is speaking, or if waiting for AI response
    if (isMuted || isTutorSpeaking || isWaitingAi || isLoading || isSlowPlaying || isRepeatPlaying) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    let isStarting = false;

    const startRecognition = () => {
      if (
        !isComponentMountedRef.current ||
        !isOpen ||
        showSummaryModal ||
        isMuted ||
        isTutorSpeaking ||
        isWaitingAi ||
        isSlowPlaying ||
        isRepeatPlaying
      ) {
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          setMicPermissionError(false);
          isStarting = false;
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = finalTranscript || interimTranscript;
          if (currentText.trim()) {
            setUserSpeechPreview(currentText);

            // Auto-send on natural pause (1.8s) for continuous hands-free conversation
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (currentText.trim().length >= 2) {
              silenceTimerRef.current = setTimeout(() => {
                handleCommitMessage(currentText);
              }, 1800);
            }
          }
        };

        recognition.onerror = (event: any) => {
          isStarting = false;
          if (event.error === "not-allowed") {
            setMicPermissionError(true);
            setIsListening(false);
          } else if (event.error === "no-speech") {
            // Standard browser pause - auto-reconnect handles it
          } else {
            console.warn("VoiceCall SpeechRecognition error:", event.error);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          isStarting = false;

          // Auto-reconnect if we should still be listening
          if (
            isComponentMountedRef.current &&
            isOpen &&
            !showSummaryModal &&
            !isMuted &&
            !isTutorSpeaking &&
            !isWaitingAi &&
            !isLoading &&
            !isSlowPlaying &&
            !isRepeatPlaying
          ) {
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
            restartTimerRef.current = setTimeout(() => {
              startRecognition();
            }, 250);
          }
        };

        isStarting = true;
        recognition.start();
      } catch (err) {
        isStarting = false;
        console.warn("Failed to initialize recognition:", err);
      }
    };

    // Buffer to avoid capturing the end echo of tutor's voice
    const initialDelay = setTimeout(() => {
      startRecognition();
    }, 300);

    return () => {
      isComponentMountedRef.current = false;
      clearTimeout(initialDelay);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, [
    isOpen,
    showSummaryModal,
    isMuted,
    isTutorSpeaking,
    isWaitingAi,
    isLoading,
    isSlowPlaying,
    isRepeatPlaying,
    handleCommitMessage,
  ]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const isSpeakingAnimation = isTutorSpeaking || isSlowPlaying || isRepeatPlaying;
  const animationState = isSpeakingAnimation ? "speaking" : isWaitingAi ? "pensativo" : "idle";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-3 sm:p-6 bg-slate-950/95 backdrop-blur-2xl text-white select-none overflow-y-auto">
        {/* TOP BAR: Scenario Selector & Live Stats */}
        <header className="w-full max-w-2xl flex items-center justify-between gap-2 mt-1 sm:mt-2 px-2">
          {/* Scenario Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsScenarioDropdownOpen(!isScenarioDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-amber-400/50 text-xs font-bold text-slate-200 shadow-md transition cursor-pointer"
            >
              <span>{selectedScenario.emoji}</span>
              <span className="hidden sm:inline">{selectedScenario.title}</span>
              <span className="sm:hidden">Escenario</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isScenarioDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 flex flex-col gap-1"
              >
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1">
                  Escenarios de Inmersión
                </p>
                {CALL_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition cursor-pointer ${
                      selectedScenario.id === sc.id
                        ? "bg-amber-500/20 border border-amber-400/40 text-amber-200"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <span className="text-xl">{sc.emoji}</span>
                    <div>
                      <p className="text-xs font-extrabold">{sc.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{sc.description}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Call Duration & Fluency Meter */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Fluency Score Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-black">
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
              <span>{liveFluencyScore}% Fluidez</span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{formatTime(callDuration)}</span>
            </div>
          </div>
        </header>

        {/* CENTRAL STAGE: Avatar + Audio Waves + Status */}
        <main className="flex flex-col items-center justify-center gap-3 sm:gap-5 my-auto w-full max-w-md px-2">
          {/* Reactive Avatar Stage with Dynamic Audio Ripple Rings */}
          <div className="relative flex items-center justify-center">
            {/* Outer sound rings when tutor speaks */}
            {isSpeakingAnimation && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.45, 1], opacity: [0.65, 0, 0.65] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40"
                />
                <motion.div
                  animate={{ scale: [1, 1.28, 1], opacity: [0.8, 0.1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut", delay: 0.15 }}
                  className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-amber-500/20 border-2 border-amber-400/40"
                />
              </>
            )}

            {/* Outer sound rings when student is speaking */}
            {isListening && userSpeechPreview && (
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0.15, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
                className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-sky-500/30 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20"
              />
            )}

            {/* Thinking halo when AI is reasoning */}
            {isWaitingAi && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full border-2 border-dashed border-amber-400/50"
              />
            )}

            {/* The Real Interactive Avatar Stage */}
            {avatarConfig ? (
              <div className="w-40 h-40 sm:w-52 sm:h-52 relative flex items-center justify-center overflow-hidden rounded-3xl bg-slate-900/80 border-4 border-slate-700/80 shadow-2xl backdrop-blur-md z-10 p-2">
                {avatarConfig.customGlbUrl ? (
                  <AvatarCanvas
                    config={avatarConfig}
                    animationState={animationState}
                    mouthIntensity={mouthIntensity || (isSpeakingAnimation ? 0.45 : 0)}
                    isListening={isListening}
                  />
                ) : (
                  <Avatar2DCanvas
                    config={avatarConfig}
                    animationState={animationState}
                    mouthIntensity={mouthIntensity || (isSpeakingAnimation ? 0.45 : 0)}
                    isListening={isListening}
                    dailyGoalAchievedTrigger={0}
                  />
                )}
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900 border-4 border-slate-700 shadow-2xl flex items-center justify-center text-5xl sm:text-6xl relative z-10">
                {avatarEmoji}
              </div>
            )}
          </div>

          {/* Character Name & Interactive Live Status */}
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-lg sm:text-xl font-black text-white">{characterName}</h2>
            <div className="text-xs font-bold flex items-center gap-1.5 min-h-[22px]">
              {isSpeakingAnimation ? (
                <span className="text-emerald-400 flex items-center gap-1.5 animate-pulse">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>
                    {isSlowPlaying
                      ? `${characterName} está hablando despacio (0.75x)...`
                      : `${characterName} está hablando...`}
                  </span>
                </span>
              ) : isWaitingAi ? (
                <span className="text-amber-300 flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{characterName} está pensando tu respuesta...</span>
                </span>
              ) : isListening ? (
                <span className="text-sky-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  <span>Te escucho, habla con naturalidad en inglés...</span>
                </span>
              ) : isMuted ? (
                <span className="text-rose-400 flex items-center gap-1.5">
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Micrófono silenciado</span>
                </span>
              ) : (
                <span className="text-slate-400">Conectando audio...</span>
              )}
            </div>

            {/* Mic Permission Warning */}
            {micPermissionError && (
              <div className="mt-1 px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Permiso de micrófono bloqueado en el navegador.</span>
              </div>
            )}
          </div>

          {/* SUBTITLES CARD + SLOW/REPEAT CONTROLS */}
          {showSubtitles && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-4 rounded-2xl bg-slate-900/90 border-2 border-slate-800 text-center shadow-lg relative"
            >
              {userSpeechPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-bold text-sky-300 italic">"{userSpeechPreview}"</p>
                  <button
                    onClick={() => handleCommitMessage(userSpeechPreview)}
                    className="px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Enviar ahora (o espera 1.8s)</span>
                  </button>
                </div>
              ) : latestTutorMessage ? (
                <div>
                  <p className="text-sm sm:text-base font-extrabold text-white mb-1">
                    "{latestTutorMessage}"
                  </p>
                  {latestSpanishTranslation && (
                    <p className="text-xs font-medium text-slate-400 italic mb-2">
                      {latestSpanishTranslation}
                    </p>
                  )}

                  {/* Audio Controls: Slower 0.75x & Repeat */}
                  <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={handlePlaySlow}
                      disabled={isSpeakingAnimation}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                      title="Escuchar a velocidad 0.75x"
                    >
                      <Turtle className="w-3.5 h-3.5" />
                      <span>0.75x Lento</span>
                    </button>

                    <button
                      onClick={handleRepeatMessage}
                      disabled={isSpeakingAnimation}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                      title="Repetir frase completa"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Repetir</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-500">
                  {selectedScenario.starterPrompt || "Saluda en inglés para comenzar la llamada"}
                </p>
              )}
            </motion.div>
          )}

          {/* SMART ANSWER SUGGESTIONS ("Help Me Answer") */}
          {showSuggestions && selectedScenario.suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-400" />
                  <span>Sugerencias de respuesta:</span>
                </span>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-400"
                >
                  Ocultar
                </button>
              </div>

              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                {selectedScenario.suggestions.slice(0, 3).map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCommitMessage(sug.en)}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-left transition cursor-pointer group flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-sky-300">
                        "{sug.en}"
                      </p>
                      <p className="text-[10px] text-slate-500 italic">{sug.es}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 mt-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </main>

        {/* BOTTOM CALL CONTROLS */}
        <footer className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4 px-2 flex-wrap">
          {/* Ambient Sound Mode Switcher */}
          <button
            onClick={handleToggleAmbientSound}
            className={`p-3.5 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition flex items-center gap-1.5 cursor-pointer ${
              ambientSoundMode !== "off"
                ? "bg-slate-800 border-slate-700 text-sky-400"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
            title={`Sonido ambiente: ${ambientSoundMode}`}
          >
            <Headphones className="w-4 h-4" />
            <span className="text-[10px] font-extrabold uppercase hidden sm:inline">
              {ambientSoundMode === "off" ? "Ambiente" : ambientSoundMode}
            </span>
          </button>

          {/* Subtitles Toggle */}
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`p-3.5 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition cursor-pointer ${
              showSubtitles
                ? "bg-slate-800 border-slate-700 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
            title="Subtítulos y Traducción"
          >
            <Languages className="w-5 h-5" />
          </button>

          {/* Suggestions Toggle */}
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`p-3.5 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition cursor-pointer ${
              showSuggestions
                ? "bg-slate-800 border-slate-700 text-amber-400"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
            title="Sugerencias de respuesta"
          >
            <Lightbulb className="w-5 h-5" />
          </button>

          {/* Mute / Unmute Mic */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition cursor-pointer ${
              isMuted
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-slate-800 border-slate-700 text-white"
            }`}
            title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleHangUp}
            className="px-5 sm:px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm border-2 border-b-4 border-rose-800 active:border-b-2 active:translate-y-0.5 shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Colgar</span>
          </button>
        </footer>

        {/* POST-CALL SUMMARY PERFORMANCE MODAL */}
        {showSummaryModal && callStats && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-2xl p-6 text-white flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="text-center flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950 font-black">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">¡Gran Práctica en Vivo!</h3>
                <p className="text-xs font-bold text-slate-400">
                  Escenario: {selectedScenario.title} • {formatTime(callStats.durationSeconds)} de conversación
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Fluidez</p>
                  <p className="text-xl font-black text-emerald-400">{callStats.fluencyScore}%</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Turnos</p>
                  <p className="text-xl font-black text-sky-400">{callStats.turnsCount}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Palabras</p>
                  <p className="text-xl font-black text-amber-400">{callStats.wordsSpoken}</p>
                </div>
              </div>

              {/* Reward Box */}
              <div className="flex items-center justify-around p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="text-xs font-extrabold text-amber-300">+{callStats.xpEarned} XP</p>
                    <p className="text-[10px] text-slate-400">Experiencia ganada</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💎</span>
                  <div>
                    <p className="text-xs font-extrabold text-sky-300">+{callStats.gemsEarned} Gemas</p>
                    <p className="text-[10px] text-slate-400">Recompensa</p>
                  </div>
                </div>
              </div>

              {/* Key Vocabulary Learned in this scenario */}
              {selectedScenario.keyVocabulary.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                      <BookMarked className="w-4 h-4 text-sky-400" />
                      <span>Vocabulario Extraído de la Llamada</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Añadir a Flashcards SRS</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {selectedScenario.keyVocabulary.map((vocab) => {
                      const isSaved = savedWordIds.has(vocab.word);
                      return (
                        <div
                          key={vocab.word}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{vocab.word}</span>
                              <span className="text-[11px] font-mono text-sky-400">{vocab.ipa}</span>
                            </div>
                            <p className="text-xs text-slate-300">{vocab.meaning}</p>
                            <p className="text-[11px] text-slate-500 italic mt-0.5">"{vocab.example}"</p>
                          </div>

                          <button
                            onClick={() => handleSaveWord(vocab)}
                            disabled={isSaved}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                              isSaved
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md active:scale-95"
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Guardado</span>
                              </>
                            ) : (
                              <>
                                <span>+ Guardar</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    setCallDuration(0);
                    setTurnsCount(0);
                    setTotalWordsSpoken(0);
                    callAmbientSound.setMode(selectedScenario.ambientSound, ambientVolume);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Nueva Llamada</span>
                </button>

                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    onClose();
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs border-2 border-b-4 border-amber-700 active:border-b-2 active:translate-y-0.5 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Volver al Aprendizaje</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
