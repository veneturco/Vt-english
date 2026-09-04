import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhoneOff, Mic, MicOff, Volume2, Sparkles, Languages, CheckCircle2 } from "lucide-react";
import { soundFx } from "../utils/soundFx";

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
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [userSpeechPreview, setUserSpeechPreview] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Call timer
  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      return;
    }
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Voice Activity Detection & Speech Recognition Simulation / Web Speech API
  useEffect(() => {
    if (!isOpen || isMuted || isTutorSpeaking) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    let silenceTimer: NodeJS.Timeout | null = null;

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
      setUserSpeechPreview(currentText);

      // Auto-send on silence (VAD)
      if (silenceTimer) clearTimeout(silenceTimer);
      if (currentText.trim().length > 3) {
        silenceTimer = setTimeout(() => {
          onSendMessage(currentText.trim());
          setUserSpeechPreview("");
          try {
            recognition.stop();
          } catch {}
        }, 1600);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {}

    return () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      try {
        recognition.stop();
      } catch {}
    };
  }, [isOpen, isMuted, isTutorSpeaking, onSendMessage]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-slate-950/95 backdrop-blur-xl text-white select-none">
        {/* Top Call Info */}
        <div className="flex flex-col items-center gap-1.5 mt-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Llamada en Vivo: {topicTitle}</span>
          </div>
          <span className="text-sm font-mono font-bold text-slate-400">{formatTime(callDuration)}</span>
        </div>

        {/* Central Audio Waves & Avatar Stage */}
        <div className="flex flex-col items-center justify-center gap-6 my-auto">
          {/* Avatar Ring with pulsing reactive audio waves */}
          <div className="relative flex items-center justify-center">
            {/* Outer sound rings when tutor speaks */}
            {isTutorSpeaking && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                  className="absolute w-44 h-44 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40"
                />
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                  className="absolute w-36 h-36 rounded-full bg-amber-500/20 border-2 border-amber-400/40"
                />
              </>
            )}

            {/* Outer sound rings when user is speaking */}
            {isListening && userSpeechPreview && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.1, 0.7] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                className="absolute w-40 h-40 rounded-full bg-sky-500/25 border-2 border-sky-400/50"
              />
            )}

            {/* Avatar Circle */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900 border-4 border-slate-700 shadow-2xl flex items-center justify-center text-5xl sm:text-6xl relative z-10">
              {avatarEmoji}
            </div>
          </div>

          {/* Status Label */}
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-xl font-black text-white">{characterName}</h2>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              {isTutorSpeaking ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  <span>{characterName} está hablando...</span>
                </>
              ) : isListening ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  <span className="text-sky-300">Te escucho, habla con naturalidad...</span>
                </>
              ) : (
                <span className="text-slate-400">Procesando...</span>
              )}
            </p>
          </div>

          {/* Live Subtitle Transcript Card */}
          {showSubtitles && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full p-4 rounded-2xl bg-slate-900/90 border-2 border-slate-800 text-center shadow-lg"
            >
              {userSpeechPreview ? (
                <p className="text-sm font-bold text-sky-300 italic">"{userSpeechPreview}"</p>
              ) : latestTutorMessage ? (
                <div>
                  <p className="text-sm sm:text-base font-extrabold text-white mb-1">"{latestTutorMessage}"</p>
                  {latestSpanishTranslation && (
                    <p className="text-xs font-medium text-slate-400 italic">{latestSpanishTranslation}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-500">Saluda en inglés para comenzar la llamada</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Bottom Call Action Controls */}
        <div className="flex items-center gap-4 mb-4">
          {/* Subtitles Toggle */}
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`p-3.5 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition ${
              showSubtitles
                ? "bg-slate-800 border-slate-700 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
            title="Subtítulos"
          >
            <Languages className="w-5 h-5" />
          </button>

          {/* Mute Mic */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition ${
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
            onClick={() => {
              if (callDuration >= 10) {
                soundFx.playSuccess();
                onRewardXp?.(25);
              } else {
                soundFx.playPop();
              }
              onClose();
            }}
            className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm border-2 border-b-4 border-rose-800 active:border-b-2 active:translate-y-0.5 shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Colgar {callDuration >= 10 ? "(+25 XP)" : ""}</span>
          </button>
        </div>
      </div>
    </AnimatePresence>
  );
};
