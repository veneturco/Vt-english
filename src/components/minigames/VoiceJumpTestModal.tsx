import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  X,
  Radio,
  Sliders,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { playJumpSound, playCoinSound, playErrorSoft, playSuccessFanfare } from "../../utils/audioSynth";
import { speakText } from "../../utils/speech";
import { AvatarConfig } from "../../types";

interface VoiceJumpTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWord: string;
  targetEmoji?: string;
  phoneticGuide?: string;
  spanishTranslation?: string;
  companionName?: string;
  companionAvatarConfig?: AvatarConfig;
  onTriggerJumpTest?: () => void;
}

export const VoiceJumpTestModal: React.FC<VoiceJumpTestModalProps> = ({
  isOpen,
  onClose,
  targetWord,
  targetEmoji = "🦘",
  phoneticGuide = "",
  spanishTranslation = "",
  companionName = "Dino Yoshi",
  companionAvatarConfig,
  onTriggerJumpTest,
}) => {
  const [activeTab, setActiveTab] = useState<"mic" | "speech" | "simulation">("mic");
  
  // Microphone & AudioContext state
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isMicTesting, setIsMicTesting] = useState<boolean>(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [peakDetected, setPeakDetected] = useState<boolean>(false);
  const [micErrorMessage, setMicErrorMessage] = useState<string>("");

  // Speech Recognition state
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [isListeningTest, setIsListeningTest] = useState<boolean>(false);
  const [testTranscript, setTestTranscript] = useState<string>("");
  const [testAccuracyResult, setTestAccuracyResult] = useState<{
    status: "idle" | "matched" | "partial" | "no_match";
    message: string;
  }>({ status: "idle", message: "" });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API availability on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSpeechSupported(Boolean(SpeechClass));
    }
  }, []);

  // Cleanup audio tracks on modal close
  const stopMicStream = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicTesting(false);
    setMicVolumeLevel(0);
  };

  useEffect(() => {
    if (!isOpen) {
      stopMicStream();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsListeningTest(false);
    }
  }, [isOpen]);

  // Start Live Microphone Metering
  const startMicMeter = async () => {
    setMicErrorMessage("");
    try {
      stopMicStream();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasMicPermission(true);
      setIsMicTesting(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        setMicVolumeLevel(normalized);
        if (normalized > 25) {
          setPeakDetected(true);
        }

        animFrameIdRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err: any) {
      setHasMicPermission(false);
      setIsMicTesting(false);
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setMicErrorMessage(
          "El navegador o iframe bloqueó el acceso al micrófono. Si estás en una vista previa integrada, abre la aplicación en una nueva pestaña o usa el simulador de prueba."
        );
      } else {
        setMicErrorMessage(
          "No se detectó ningún micrófono de entrada activo en este dispositivo."
        );
      }
    }
  };

  // Run Speech Recognition Test
  const startSpeechRecognitionTest = () => {
    const SpeechClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechClass) {
      setTestAccuracyResult({
        status: "no_match",
        message: "Web Speech API no es soportada en este navegador (Recomendado: Chrome o Edge).",
      });
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechClass();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      setTestTranscript("");
      setIsListeningTest(true);
      setTestAccuracyResult({
        status: "idle",
        message: `Habla ahora claro al micrófono: "${targetWord}"...`,
      });

      recognition.onstart = () => {
        playJumpSound();
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const heard = lastResult[0].transcript.trim();
        setTestTranscript(heard);

        const cleanHeard = heard.toLowerCase().replace(/[^a-z0-9]/gi, "");
        const cleanTarget = targetWord.toLowerCase().replace(/[^a-z0-9]/gi, "");

        if (cleanHeard === cleanTarget || cleanHeard.includes(cleanTarget) || cleanTarget.includes(cleanHeard)) {
          setTestAccuracyResult({
            status: "matched",
            message: `¡Excelente pronunciación! Coincidencia 100% con "${targetWord}".`,
          });
          playSuccessFanfare();
        } else if (cleanHeard.length > 0) {
          setTestAccuracyResult({
            status: "partial",
            message: `Escuchamos: "${heard}". Casi perfecto, intenta modular un poco más claro.`,
          });
        }
      };

      recognition.onerror = (err: any) => {
        setIsListeningTest(false);
        if (err.error === "no-speech") {
          setTestAccuracyResult({
            status: "partial",
            message: "No se detectó voz a tiempo. Vuelve a tocar e intenta hablar más fuerte.",
          });
          playErrorSoft();
        } else {
          setTestAccuracyResult({
            status: "no_match",
            message: `Aviso del micrófono (${err.error}). Puedes usar la simulación si estás en un entorno ruidoso o en un iframe.`,
          });
        }
      };

      recognition.onend = () => {
        setIsListeningTest(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListeningTest(false);
      setTestAccuracyResult({
        status: "no_match",
        message: "No se pudo iniciar el servicio de reconocimiento de voz.",
      });
    }
  };

  // Run Simulation Jump (100% reliable test for kids & testing)
  const handleSimulatedJump = () => {
    playJumpSound();
    speakText(
      targetWord,
      companionAvatarConfig,
      undefined,
      undefined,
      undefined,
      { forceLang: "en-US", rateMultiplier: 0.9 }
    );
    if (onTriggerJumpTest) {
      setTimeout(() => {
        onTriggerJumpTest();
      }, 350);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-400/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl shadow-cyan-500/20 relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Top decorative cyan bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

        {/* Close Button */}
        <button
          type="button"
          id="voice-test-modal-close-btn"
          onClick={() => {
            stopMicStream();
            onClose();
          }}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black tracking-wider uppercase mb-2">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Banco de Pruebas • Voice Jump</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
          Prueba de Funcionamiento del Micrófono
        </h3>
        <p className="text-xs text-slate-300 max-w-sm mb-4">
          Comprueba el nivel de audio en tiempo real, la detección de voz y el salto de tu compañero {companionName}.
        </p>

        {/* Subtabs for diagnostic */}
        <div className="w-full grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("mic")}
            className={`py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "mic"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>1. Nivel Mic</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("speech")}
            className={`py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "speech"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>2. Voz Real</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("simulation")}
            className={`py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "simulation"
                ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md shadow-amber-400/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. Simular Salto</span>
          </button>
        </div>

        {/* Current Word Preview Box */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl">{targetEmoji}</span>
            <div>
              <div className="text-xs font-black text-cyan-300 uppercase tracking-wide">
                Palabra Objetivo de Prueba
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                "{targetWord}"
              </div>
              {spanishTranslation && (
                <div className="text-xs text-slate-400">
                  {spanishTranslation} {phoneticGuide && `• /${phoneticGuide}/`}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playJumpSound();
              speakText(
                targetWord,
                companionAvatarConfig,
                undefined,
                undefined,
                undefined,
                { forceLang: "en-US", rateMultiplier: 0.85 }
              );
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
            title="Escuchar pronunciación nativa de ejemplo"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* TAB 1: HARDWARE & AUDIO METER (VÚMETRO EN VIVO) */}
        {activeTab === "mic" && (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
              <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                <span>Vúmetro de Entrada de Voz (Decibeles en Vivo):</span>
                <span className="font-mono text-cyan-400 font-black">{micVolumeLevel}%</span>
              </div>

              {/* 12-Segment Live Audio Bar Meter */}
              <div className="w-full flex items-end justify-center gap-1.5 h-16 px-4 py-2 bg-slate-900/90 rounded-xl border border-slate-800">
                {[...Array(14)].map((_, i) => {
                  const threshold = (i + 1) * 7;
                  const isActive = isMicTesting && micVolumeLevel >= threshold;
                  let colorClass = "bg-emerald-500 shadow-emerald-500/40";
                  if (i > 8) colorClass = "bg-amber-400 shadow-amber-400/40";
                  if (i > 11) colorClass = "bg-rose-500 shadow-rose-500/40";

                  return (
                    <div
                      key={i}
                      className={`w-3 sm:w-4 rounded-md transition-all duration-75 ${
                        isActive
                          ? `${colorClass} shadow-md`
                          : "bg-slate-800/80"
                      }`}
                      style={{
                        height: `${Math.max(15, (i + 1) * 7)}%`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Peak detection status */}
              <div className="mt-3 text-xs font-semibold">
                {isMicTesting ? (
                  peakDetected ? (
                    <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Voz detectada correctamente! Tu micrófono funciona al 100%.</span>
                    </span>
                  ) : (
                    <span className="text-amber-300 animate-pulse">
                      🎙️ Habla al micrófono ahora para mover las barras verdes...
                    </span>
                  )
                ) : (
                  <span className="text-slate-400">
                    Pulsa el botón de abajo para activar el vúmetro de prueba.
                  </span>
                )}
              </div>
            </div>

            {/* Error / Iframe Warning message if any */}
            {micErrorMessage && (
              <div className="w-full p-3 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{micErrorMessage}</span>
              </div>
            )}

            {/* Control Button */}
            <div className="w-full flex gap-2">
              {!isMicTesting ? (
                <button
                  type="button"
                  id="start-mic-test-btn"
                  onClick={startMicMeter}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>Iniciar Medidor de Micrófono</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="stop-mic-test-btn"
                  onClick={stopMicStream}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Detener Medidor</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SPEECH RECOGNITION LIVE ACCURACY TEST */}
        {activeTab === "speech" && (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center mb-2 text-cyan-300">
                <Mic className={`w-8 h-8 ${isListeningTest ? "animate-bounce text-rose-400" : ""}`} />
              </div>

              <div className="text-xs font-bold text-slate-300 mb-1">
                {isListeningTest ? "¡Escuchando en vivo! Di:" : "Prueba de Reconocimiento Fonético"}
              </div>
              <div className="text-lg font-black text-cyan-300 mb-3">
                "{targetWord}"
              </div>

              {/* Status Message */}
              {testAccuracyResult.message && (
                <div
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold mb-2 ${
                    testAccuracyResult.status === "matched"
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                      : testAccuracyResult.status === "partial"
                      ? "bg-amber-950/80 border-amber-500 text-amber-200"
                      : "bg-slate-900 border-slate-700 text-slate-300"
                  }`}
                >
                  {testAccuracyResult.message}
                </div>
              )}

              {/* Real-time transcribed text bubble */}
              {testTranscript && (
                <div className="px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-200">
                  Detectado: "{testTranscript}"
                </div>
              )}
            </div>

            <button
              type="button"
              id="voice-test-speak-btn"
              onClick={startSpeechRecognitionTest}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${
                isListeningTest
                  ? "bg-rose-600 text-white animate-pulse shadow-rose-600/30"
                  : "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/30"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isListeningTest ? "Escuchando... Di la palabra" : "Presiona para Pronunciar de Prueba"}</span>
            </button>
          </div>
        )}

        {/* TAB 3: INSTANT SIMULATOR JUMP */}
        {activeTab === "simulation" && (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400/40 flex items-center justify-center text-4xl mb-2">
                🦘
              </div>
              <h4 className="text-sm font-black text-white mb-1">
                Simulador de Salto y Efectos 1-Clic
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                ¿Estás en un entorno en silencio o probando sin micrófono? Este botón activa inmediatamente el salto de física de {companionName}, las partículas de monedas, la fanfarria y el desbloqueo del reto.
              </p>

              <button
                type="button"
                id="voice-test-simulate-jump-btn"
                onClick={handleSimulatedJump}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer select-none"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>¡Simular Salto Exitoso con Voz! (+25 🪙)</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-slate-800 w-full flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Modo Niños: Tolerancia Fonética Alta</span>
          </span>
          <button
            type="button"
            onClick={() => {
              stopMicStream();
              onClose();
            }}
            className="text-cyan-400 hover:underline font-bold cursor-pointer"
          >
            Cerrar Prueba
          </button>
        </div>
      </div>
    </div>
  );
};
