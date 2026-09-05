import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Mic,
  Volume2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Headphones,
  CheckCircle2,
  Crown,
} from "lucide-react";
import { ROLEPLAY_SCENARIOS } from "../data/roleplayScenariosData";
import { RoleplayScenarioItem } from "../types";
import { playPopSound, playCoinSound, playErrorSoft } from "../utils/audioSynth";

export interface MessageItem {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp?: number;
}

interface RoleplayImmersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario?: (scenario: RoleplayScenarioItem) => void;
}

// Banco de respuestas contextuales de la IA para cada escenario
const SCENARIO_RESPONSES: Record<string, string[]> = {
  tech_interview: [
    "That is a very structured answer! Could you tell me how you handle critical production incidents under high pressure?",
    "Great explanation! Can you describe a challenging technical bottleneck you solved recently?",
    "Excellent! How do you align architectural decisions with product managers and business stakeholders?",
    "Thank you for sharing that in detail. Do you have any questions for me regarding our engineering culture?",
  ],
  airport_customs: [
    "Thank you. How many days do you plan to stay in the country, and what is your local accommodation address?",
    "Understood. Are you carrying any commercial goods, plants, or currency exceeding ten thousand dollars?",
    "Everything looks completely in order. Enjoy your stay in New York! Welcome.",
  ],
  starbucks_nyc: [
    "Got it! What size would you like for that: Tall, Grande, or Venti? And any preference for oat or almond milk?",
    "Perfect choice! Would you like that iced or extra hot with any flavored syrup?",
    "Awesome! That comes to $5.40. Can I get a name for your cup?",
    "Here is your receipt! We'll have your drink handcrafted at the counter in just a moment.",
  ],
  medical_doctor: [
    "I understand. How long have you been experiencing these symptoms, and is the pain sharp or dull?",
    "Thank you for that context. Are you currently taking any prescription medications or do you have known allergies?",
    "I'm going to prescribe a mild treatment. Please stay hydrated, rest, and follow up if symptoms persist.",
  ],
  hotel_concierge: [
    "Thank you very much. I have confirmed your reservation for an Executive King Suite with skyline views.",
    "Certainly! Breakfast is served from 7:00 to 10:30 AM in the Sky Lounge, and Wi-Fi access is complimentary.",
    "Would you like our bellhop to assist you with your luggage up to the twenty-second floor?",
  ],
};

export const RoleplayImmersionModal: React.FC<RoleplayImmersionModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenarioItem>(
    ROLEPLAY_SCENARIOS[0]
  );
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcriptInterim, setTranscriptInterim] = useState("");
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const aiThinkingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleUserSpeechFinishedRef = useRef<((spokenText: string) => void) | null>(null);

  // Auto-scroll fluido al recibir o emitir nuevos mensajes
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, transcriptInterim, isListening, isAiThinking, isAiSpeaking]);

  // Inicializar conversación y bienvenida por voz al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setMicError(null);
      const initialMessage: MessageItem = {
        id: `ai-${Date.now()}`,
        role: "ai",
        text: selectedScenario.initialTutorMessage,
        timestamp: Date.now(),
      };
      setMessages([initialMessage]);
      setResponseIndex(0);
      setTranscriptInterim("");

      // Reproducción inmediata del saludo inicial por voz
      const timer = setTimeout(() => {
        speakResponse(selectedScenario.initialTutorMessage);
      }, 450);

      return () => {
        clearTimeout(timer);
        stopAllAudio();
      };
    } else {
      stopAllAudio();
    }
  }, [isOpen, selectedScenario]);

  // Configuración de Web Speech API (SpeechRecognition)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
        setTranscriptInterim("");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setTranscriptInterim(interim);
        }

        if (final) {
          handleUserSpeechFinishedRef.current?.(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech Recognition Error:", event.error);
        setIsListening(false);
        setTranscriptInterim("");
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setMicError("Permiso de micrófono denegado. Habilítalo en tu navegador para hablar.");
          playErrorSoft();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isOpen]);

  // Detener toda síntesis y captura de audio
  const stopAllAudio = () => {
    if (aiThinkingTimerRef.current) {
      clearTimeout(aiThinkingTimerRef.current);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setIsAiThinking(false);
    setIsAiSpeaking(false);
  };

  // Text-to-Speech nativo (en-US / en-GB)
  const speakResponse = (textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          (v.lang.startsWith("en-US") || v.lang.startsWith("en-GB") || v.lang.startsWith("en")) &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel") ||
            v.name.includes("Arthur"))
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null;

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsAiSpeaking(true);
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Procesar cuando el usuario finaliza su turno de voz
  const handleUserSpeechFinished = (spokenText: string) => {
    if (!spokenText.trim()) return;

    playCoinSound();
    setTranscriptInterim("");
    setIsListening(false);

    // 1. Agregar mensaje del usuario al historial
    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: "user",
      text: spokenText,
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);

    // 2. Estado de simulación de 1 segundo ("La IA está pensando...")
    setIsAiThinking(true);

    if (aiThinkingTimerRef.current) {
      clearTimeout(aiThinkingTimerRef.current);
    }

    aiThinkingTimerRef.current = setTimeout(() => {
      setIsAiThinking(false);

      // Selección de la siguiente respuesta contextual
      const scenarioKey = selectedScenario.id;
      const pool =
        SCENARIO_RESPONSES[scenarioKey] || SCENARIO_RESPONSES["tech_interview"];
      const nextResponseText =
        pool[responseIndex % pool.length] ||
        "Excellent point! Now, tell me about your previous experience.";

      setResponseIndex((prev) => prev + 1);

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        role: "ai",
        text: nextResponseText,
        timestamp: Date.now(),
      };

      setMessages([...updated, aiMsg]);

      // 3. Sintetizar por voz en inglés
      speakResponse(nextResponseText);
    }, 1000);
  };

  handleUserSpeechFinishedRef.current = handleUserSpeechFinished;

  // Alternar el estado del micrófono
  const toggleListening = () => {
    playPopSound();

    if (isAiSpeaking) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsAiSpeaking(false);
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Could not start speech recognition:", e);
        }
      }
    }
  };

  // Reiniciar la conversación
  const handleReset = () => {
    playPopSound();
    stopAllAudio();
    const initialAiMsg: MessageItem = {
      id: `ai-${Date.now()}`,
      role: "ai",
      text: selectedScenario.initialTutorMessage,
      timestamp: Date.now(),
    };
    setMessages([initialAiMsg]);
    setResponseIndex(0);
    setTranscriptInterim("");
    setTimeout(() => {
      speakResponse(selectedScenario.initialTutorMessage);
    }, 350);
  };

  // Cambio de Escenario
  const handleSelectScenario = (sc: RoleplayScenarioItem) => {
    playPopSound();
    setSelectedScenario(sc);
    setShowScenarioDropdown(false);
    stopAllAudio();
    if (onSelectScenario) {
      onSelectScenario(sc);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[90vh] max-h-[850px] flex flex-col rounded-3xl bg-[#090d16] border border-slate-800 shadow-2xl overflow-hidden text-slate-100 relative">
        
        {/* 1. HEADER EJECUTIVO & MINIMALISTA */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#0d1322] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-xl text-indigo-300 shadow-inner">
              {selectedScenario.icon || "💼"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  {selectedScenario.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black tracking-wider uppercase border border-indigo-500/30">
                  {selectedScenario.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {selectedScenario.personaName} •{" "}
                <span className="text-slate-300">{selectedScenario.personaRole}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Selector de Escenario */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowScenarioDropdown(!showScenarioDropdown)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
              >
                <span>Cambiar rol</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showScenarioDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-30 space-y-1">
                  {ROLEPLAY_SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => handleSelectScenario(sc)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition cursor-pointer ${
                        selectedScenario.id === sc.id
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-base">{sc.icon}</span>
                      <div className="truncate">
                        <p className="truncate font-bold">{sc.title}</p>
                        <p className="text-[10px] opacity-75">{sc.difficulty} • {sc.personaName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reiniciar Conversación */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Reiniciar conversación"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Cerrar */}
            <button
              type="button"
              onClick={() => {
                stopAllAudio();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 2. BARRA DE ESTADO Y ONDAS DE AUDIO */}
        <div className="px-5 py-2.5 bg-[#0b101c] border-b border-slate-800/60 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2.5">
            {isAiSpeaking ? (
              <div className="flex items-center gap-2 text-indigo-300">
                {/* Ondas de audio animadas */}
                <div className="flex items-center gap-1 h-3.5">
                  <span className="w-1 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-3.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.45s]" />
                  <span className="w-1 h-4 bg-indigo-400 rounded-full animate-bounce" />
                </div>
                <span className="font-bold text-indigo-200">
                  {selectedScenario.personaName} está hablando...
                </span>
              </div>
            ) : isAiThinking ? (
              <div className="flex items-center gap-2 text-amber-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="font-bold">Analizando tu respuesta...</span>
              </div>
            ) : isListening ? (
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-bold">Escuchándote en inglés... ¡Habla ahora!</span>
              </div>
            ) : (
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                <span>Conversación inmersiva 100% por voz</span>
              </span>
            )}
          </div>

          {isAiSpeaking && (
            <button
              onClick={() => {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
                setIsAiSpeaking(false);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Silenciar
            </button>
          )}
        </div>

        {/* 3. HISTORIAL DE MENSAJES (ESTILO WHATSAPP/IMESSAGE CORPORATIVO) */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth"
        >
          {messages.map((msg) => {
            const isAi = msg.role === "ai";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 max-w-[85%] ${
                  isAi ? "mr-auto items-start" : "ml-auto flex-row-reverse items-start"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm shrink-0 shadow-md ${
                    isAi
                      ? "bg-[#161f36] border border-indigo-500/30 text-indigo-300"
                      : "bg-indigo-700/60 border border-indigo-500/40 text-white"
                  }`}
                >
                  {isAi ? selectedScenario.icon || "🤖" : "🎙️"}
                </div>

                {/* Speech Bubble */}
                <div
                  className={`p-4 rounded-3xl text-sm sm:text-[15px] leading-relaxed shadow-lg ${
                    isAi
                      ? "bg-[#131b2e] border border-slate-800/90 text-slate-100 rounded-tl-xs"
                      : "bg-indigo-600 border border-indigo-500/40 text-white rounded-tr-xs shadow-indigo-950/40"
                  }`}
                >
                  <p className="font-medium tracking-wide">{msg.text}</p>

                  {isAi && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => speakResponse(msg.text)}
                        className="flex items-center gap-1 hover:text-indigo-300 transition cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Escuchar otra vez</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Transcripción en Vivo Mientras Habla el Usuario */}
          {isListening && transcriptInterim && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse items-start"
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-sm shrink-0 animate-pulse">
                🎙️
              </div>
              <div className="p-4 rounded-3xl rounded-tr-xs bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-sm leading-relaxed shadow-lg">
                <p className="italic font-medium">{transcriptInterim}...</p>
              </div>
            </motion.div>
          )}

          {/* Burbuja Animada: La IA está Pensando... */}
          {isAiThinking && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[80%] mr-auto items-start"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#161f36] border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-sm shrink-0">
                {selectedScenario.icon || "🤖"}
              </div>
              <div className="p-4 rounded-3xl rounded-tl-xs bg-[#131b2e] border border-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <span className="text-xs text-slate-400 font-semibold ml-1">
                  {selectedScenario.personaName} está respondiendo...
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 4. CONTROLES INFERIORES: BOTÓN CIRCULAR GIGANTE DE MICRÓFONO */}
        <footer className="p-6 bg-[#0c111e] border-t border-slate-800/80 shrink-0 flex flex-col items-center justify-center gap-3 relative">
          
          {/* Ondas reactivas en vivo */}
          {isListening && (
            <div className="absolute inset-x-0 -top-3 flex justify-center items-center gap-1.5 pointer-events-none">
              <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-10 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.45s]" />
              <span className="w-1.5 h-12 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-7 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
            </div>
          )}

          {/* Botón Circular Gigante */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <span className="absolute w-28 h-28 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
            )}

            <button
              type="button"
              onClick={toggleListening}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer z-10 ${
                isListening
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/50 scale-105 ring-4 ring-emerald-400/40 animate-pulse"
                  : isAiSpeaking
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40 ring-4 ring-indigo-400/30"
                  : "bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-950/80 hover:scale-105"
              }`}
            >
              <Mic className="w-9 h-9 sm:w-10 sm:h-10" />
            </button>
          </div>

          <p className="text-xs text-slate-400 font-semibold tracking-tight text-center">
            {isListening
              ? "Escuchando... Di tu respuesta en inglés"
              : isAiSpeaking
              ? "Escuchando a tu interlocutor... Toca para interrumpir"
              : isAiThinking
              ? "Procesando respuesta..."
              : "Toca el micrófono para hablar en inglés"}
          </p>

          {micError && (
            <div className="text-xs text-rose-300 bg-rose-950/50 px-3 py-1.5 rounded-full border border-rose-500/40 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{micError}</span>
            </div>
          )}

          {!isSpeechSupported && (
            <div className="text-xs text-amber-300 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
              Reconocimiento de voz nativo compatible en Chrome, Edge y Safari.
            </div>
          )}
        </footer>

      </div>
    </div>
  );
};
