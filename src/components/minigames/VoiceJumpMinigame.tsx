import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, Sparkles, RotateCcw, Award, CheckCircle2, AlertCircle } from "lucide-react";
import { fireParticles } from "../../utils/particleHelper";
import { playCoinSound, playJumpSound, playErrorSoft } from "../../utils/audioSynth";
import { useSpringAnimation } from "../../utils/useSpringAnimation";
import { hablarSegmentoNativo } from "../../utils/speech";

// Declaración de tipos para Web Speech API Nativa
type SpeechRecognitionType = any;

interface VoiceJumpMinigameProps {
  targetWord: string;
  targetEmoji?: string;
  phoneticGuide?: string;
  spanishTranslation?: string;
  onSuccess?: () => void;
  onNext?: () => void;
  onClose?: () => void;
  mascotEmoji?: string;
}

type GameState = "idle" | "listening" | "processing" | "success" | "retry";

export const VoiceJumpMinigame: React.FC<VoiceJumpMinigameProps> = ({
  targetWord = "Apple",
  targetEmoji = "🍎",
  phoneticGuide = "/ˈæp.əl/",
  spanishTranslation = "Manzana",
  onSuccess,
  onNext,
  onClose,
  mascotEmoji = "🦖",
}) => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(0);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Hook de físicas de resorte para el salto de celebración de la mascota
  const { ref: mascotSpringRef, triggerBounce: triggerMascotBounce } = useSpringAnimation<HTMLDivElement>({
    tension: 200,
    friction: 10,
    mass: 0.8,
  });

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const micButtonRef = useRef<HTMLButtonElement | null>(null);

  // Inicialización de la Web Speech API
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setGameState("listening");
      setFeedbackMessage("Listening... Speak now!");
    };

    recognition.onresult = (event: any) => {
      setGameState("processing");
      const currentTranscript = event.results[0][0].transcript.trim();
      setTranscript(currentTranscript);
      evaluatePronunciation(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        setFeedbackMessage("We didn't hear you! Try again 🎤");
      } else {
        setFeedbackMessage("Oops! Microphone paused. Tap to retry!");
      }
      setGameState("retry");
      playErrorSoft();
    };

    recognition.onend = () => {
      // Si estaba escuchando pero terminó sin resultados
      setGameState((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [targetWord]);

  // Reproducir la pronunciación modelo nativa
  const handleListenModel = () => {
    hablarSegmentoNativo(targetWord, "female", "en-US", 0.9);
    playJumpSound();
  };

  // Evaluar coincidencia de pronunciación
  const evaluatePronunciation = (userVoiceText: string) => {
    const cleanUser = userVoiceText.toLowerCase().replace(/[^a-z0-9]/gi, "").trim();
    const cleanTarget = targetWord.toLowerCase().replace(/[^a-z0-9]/gi, "").trim();

    setAttempts((prev) => prev + 1);

    if (cleanUser === cleanTarget || cleanUser.includes(cleanTarget) || cleanTarget.includes(cleanUser)) {
      // 1. Éxito: Partículas, Audio y Resorte
      setGameState("success");
      setFeedbackMessage("Awesome job! You nailed it! ⭐");

      playCoinSound();

      // Disparar confeti desde la posición del botón del micrófono
      if (micButtonRef.current) {
        const rect = micButtonRef.current.getBoundingClientRect();
        fireParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, "confetti", 60);
        fireParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, "stars", 30);
      } else {
        fireParticles(window.innerWidth / 2, window.innerHeight / 2, "confetti", 60);
      }

      // Salto elástico alto de la mascota local y notificación a mascotas globales
      triggerMascotBounce(0.8, 1.4);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mascot-action", { detail: { action: "jump" } }));
      }

      if (onSuccess) {
        onSuccess();
      }
    } else {
      // 2. Intento fallido suave (no punitivo)
      setGameState("retry");
      setFeedbackMessage(`Almost! We heard "${userVoiceText}". Try again! 🌟`);
      playErrorSoft();

      // Pequeño bamboleo de ánimo
      triggerMascotBounce(1.15, 0.9);
    }
  };

  // Iniciar reconocimiento de voz
  const toggleListening = () => {
    if (!isSupported) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge or Safari.");
      return;
    }

    if (gameState === "listening") {
      recognitionRef.current?.stop();
      setGameState("idle");
    } else {
      setTranscript("");
      setFeedbackMessage("Get ready...");
      try {
        recognitionRef.current?.start();
      } catch (e) {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      }
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-2xl border-2 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center select-none overflow-hidden">
      {/* Luces decorativas de fondo */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header del Minijuego */}
      <div className="w-full flex items-center justify-between mb-6 z-10">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="text-xs font-black tracking-wider uppercase">Voice Jump Challenge</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Mascota Reactiva Saltarina con Físicas */}
      <div
        ref={mascotSpringRef}
        onClick={() => {
          triggerMascotBounce(1.25, 0.75);
          playJumpSound();
        }}
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-400/20 to-orange-500/20 border-2 border-amber-400/40 flex items-center justify-center text-5xl sm:text-6xl cursor-pointer hover:scale-105 active:scale-95 shadow-xl mb-4 will-change-transform"
      >
        <span className="filter drop-shadow-md">{mascotEmoji}</span>
      </div>

      {/* Palabra Objetivo Gigante para Niños */}
      <div className="text-center z-10 my-2">
        <div className="text-5xl sm:text-6xl filter drop-shadow mb-1 animate-bounce">
          {targetEmoji}
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 tracking-wide font-sans">
          {targetWord}
        </h2>
        <p className="text-sm font-semibold text-slate-400 mt-1">
          {spanishTranslation} • <span className="font-mono text-amber-300/80">{phoneticGuide}</span>
        </p>

        {/* Botón para escuchar la pronunciación correcta */}
        <button
          onClick={handleListenModel}
          className="mt-3 px-4 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-sky-300 hover:text-sky-200 text-xs font-black flex items-center gap-1.5 mx-auto border border-sky-400/30 shadow-md transition-transform active:scale-95"
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen & Repeat</span>
        </button>
      </div>

      {/* Botón Central de Micrófono con Juiciness */}
      <div className="my-6 z-10 flex flex-col items-center">
        <div className="relative">
          {/* Ondas pulsantes de audio cuando está escuchando */}
          {gameState === "listening" && (
            <>
              <div className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping" />
              <div className="absolute -inset-3 rounded-full bg-rose-400/20 animate-pulse" />
            </>
          )}

          <button
            ref={micButtonRef}
            onClick={toggleListening}
            className={`
              relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center
              transform transition-all duration-200 ease-out select-none shadow-2xl
              focus:outline-none focus:ring-4 cursor-pointer
              ${
                gameState === "listening"
                  ? "bg-gradient-to-b from-rose-400 to-rose-600 text-white border-4 border-rose-300 shadow-[0_8px_0_#be123c] animate-pulse ring-4 ring-rose-400/50 scale-105"
                  : gameState === "success"
                  ? "bg-gradient-to-b from-emerald-400 to-teal-600 text-white border-4 border-emerald-300 shadow-[0_8px_0_#065f46] scale-105"
                  : "bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 border-4 border-amber-200 shadow-[0_8px_0_#c2410c] hover:brightness-110 hover:scale-105 active:translate-y-1 active:shadow-[0_2px_0_#c2410c] ring-4 ring-amber-400/30"
              }
            `}
          >
            {gameState === "listening" ? (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
            ) : gameState === "success" ? (
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[3]" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
            <span className="text-[10px] sm:text-xs font-black tracking-tight uppercase mt-1">
              {gameState === "listening" ? "Listening" : gameState === "success" ? "Great!" : "Say Word"}
            </span>
          </button>
        </div>

        {/* Estado Visual Dinámico */}
        <p className="mt-4 text-xs sm:text-sm font-bold tracking-wide text-slate-300 text-center min-h-[24px]">
          {feedbackMessage || "Tap the microphone and say the word!"}
        </p>

        {transcript && (
          <div className="mt-2 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-amber-300">
            We heard: "{transcript}"
          </div>
        )}
      </div>

      {/* Footer y Acciones de Continuación */}
      <div className="w-full mt-2 pt-4 border-t border-slate-800/80 flex items-center justify-between z-10">
        <span className="text-xs font-bold text-slate-400">
          Attempts: <span className="text-amber-400 font-black">{attempts}</span>
        </span>

        {gameState === "success" && onNext ? (
          <button
            onClick={onNext}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_4px_0_#065f46] hover:brightness-110 active:translate-y-0.5 transition flex items-center gap-1.5 animate-bounce"
          >
            <span>Next Level</span>
            <Award className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                evaluatePronunciation(targetWord);
              }}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 transition border border-amber-400/30 cursor-pointer"
              title="Test jump simulation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Jump</span>
            </button>
            <button
              onClick={() => {
                setGameState("idle");
                setFeedbackMessage("");
                setTranscript("");
              }}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
