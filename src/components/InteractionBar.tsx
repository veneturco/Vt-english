import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  History,
  Volume2,
  StopCircle,
  Keyboard,
  AudioWaveform,
  Radio,
  Zap,
} from "lucide-react";
import { voiceRecognizer, stopSpeaking, isSpeaking } from "../utils/speech";

interface InteractionBarProps {
  quickChips: string[];
  onSendMessage: (text: string) => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isLoading: boolean;
  isPlayingAudio: boolean;
  handsFreeMode: boolean;
  setHandsFreeMode: (val: boolean) => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const InteractionBar: React.FC<InteractionBarProps> = ({
  quickChips,
  onSendMessage,
  isListening,
  setIsListening,
  isLoading,
  isPlayingAudio,
  handsFreeMode,
  setHandsFreeMode,
  onOpenHistory,
  historyCount,
}) => {
  const [inputText, setInputText] = useState("");
  const [transcriptPreview, setTranscriptPreview] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [isMicSupported, setIsMicSupported] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMicSupported(voiceRecognizer.isSupported());

    let silenceTimer: number | undefined;

    const unsubscribe = voiceRecognizer.subscribe({
      onStart: () => {
        setIsListening(true);
        setTranscriptPreview("");
      },
      onTranscript: (text, isFinal) => {
        setTranscriptPreview(text);
        if (silenceTimer) window.clearTimeout(silenceTimer);

        if (isFinal && text.trim()) {
          onSendMessage(text.trim());
          setTranscriptPreview("");
          voiceRecognizer.stopListening();
          setIsListening(false);
        } else if (text.trim().length >= 2) {
          // Pausa natural e inteligente: 1.1s de silencio tras frase para enviar sin retrasos
          silenceTimer = window.setTimeout(() => {
            if (voiceRecognizer.getIsListening() && text.trim()) {
              onSendMessage(text.trim());
              setTranscriptPreview("");
              voiceRecognizer.stopListening();
              setIsListening(false);
            }
          }, 1150);
        }
      },
      onError: (err) => {
        console.warn("Recognition error:", err);
        if (silenceTimer) window.clearTimeout(silenceTimer);
        setIsListening(false);
      },
      onEnd: () => {
        if (silenceTimer) window.clearTimeout(silenceTimer);
        setIsListening(false);
      },
    });

    return () => {
      if (silenceTimer) window.clearTimeout(silenceTimer);
      unsubscribe();
    };
  }, [onSendMessage, setIsListening]);

  const handleToggleMic = () => {
    if (isLoading) return;

    // Barge-in: Si el tutor está hablando, detenerlo de inmediato
    if (isPlayingAudio || isSpeaking()) {
      stopSpeaking();
    }

    if (isListening) {
      voiceRecognizer.stopListening();
      setIsListening(false);
      if (transcriptPreview.trim()) {
        onSendMessage(transcriptPreview.trim());
        setTranscriptPreview("");
      }
    } else {
      const started = voiceRecognizer.startListening();
      if (!started) {
        setShowManualInput(true);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      if (isPlayingAudio || isSpeaking()) {
        stopSpeaking();
      }
      onSendMessage(inputText.trim());
      setInputText("");
      setTranscriptPreview("");
    }
  };

  const handleChipClick = (chip: string) => {
    if (isLoading) return;
    if (isPlayingAudio || isSpeaking()) {
      stopSpeaking();
    }
    onSendMessage(chip);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-2 relative">
      {/* Real-time speech preview banner when listening */}
      {isListening && (
        <div className="w-full p-3.5 rounded-2xl bg-slate-900 border-2 border-b-4 border-emerald-500 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
            <div className="flex gap-1 items-end h-5 px-1">
              <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-5 bg-emerald-300 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-2 bg-emerald-400 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-4 bg-emerald-300 rounded-full animate-bounce delay-150" />
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 font-bold truncate">
              {transcriptPreview || "🎙️ Escuchando tu inglés..."}
            </p>
          </div>
          <button
            onClick={handleToggleMic}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black border-2 border-b-4 border-emerald-700 active:border-b-2 active:translate-y-0.5 transition shadow-sm"
          >
            Enviar
          </button>
        </div>
      )}

      {/* Quick Chips Row (Duolingo style flat 3D chips) */}
      {quickChips && quickChips.length > 0 && !isListening && (
        <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth px-1">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              disabled={isLoading}
              className="group shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-850 hover:border-emerald-500/80 border-2 border-b-4 border-slate-700 active:border-b-2 active:translate-y-0.5 text-xs font-bold text-slate-100 transition-all text-left shadow-sm disabled:opacity-50"
            >
              <span className="w-4 h-4 rounded-lg bg-slate-800 text-amber-300 flex items-center justify-center text-[10px] font-black group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                {idx + 1}
              </span>
              <span className="truncate max-w-[200px]">{chip}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Unified Voice & Text Solid Capsule */}
      <div className="w-full p-2.5 rounded-3xl bg-slate-900 border-2 border-b-4 border-slate-800 shadow-sm flex flex-col gap-2">
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
          {/* Text input with embedded send */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe en inglés o pulsa hablar..."
              disabled={isLoading}
              className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-slate-950 border-2 border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition disabled:opacity-60 font-bold"
            />
            {inputText && (
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-b-4 border-emerald-700 active:border-b-2 active:translate-y-0.5 transition shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Central Push-to-Talk Flat 3D Mic Button */}
          <button
            id="main-voice-mic-button"
            type="button"
            onClick={handleToggleMic}
            disabled={isLoading}
            className={`group relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all shadow-sm shrink-0 ${
              isListening
                ? "bg-rose-500 hover:bg-rose-400 text-white border-rose-700"
                : isPlayingAudio
                ? "bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-600"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-700"
            } disabled:opacity-50`}
          >
            {isListening ? (
              <>
                <StopCircle className="w-4 h-4 animate-spin text-white" />
                <span>Detener</span>
              </>
            ) : isPlayingAudio ? (
              <>
                <Radio className="w-4 h-4 animate-pulse text-slate-950" />
                <span>Interrumpir</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 group-hover:scale-110 transition-transform text-slate-950" />
                <span>Hablar</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom subtle status & quick links bar */}
        <div className="flex items-center justify-between text-[11px] px-3 pt-0.5 text-slate-400">
          <button
            type="button"
            onClick={() => setHandsFreeMode(!handsFreeMode)}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl font-bold transition-all border-2 ${
              handsFreeMode
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                : "border-transparent hover:text-slate-200"
            }`}
            title="El micrófono se abrirá automáticamente después de que hable el tutor"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                handsFreeMode ? "bg-emerald-400 animate-ping" : "bg-slate-500"
              }`}
            />
            <span>{handsFreeMode ? "Auto-Mic Activo" : "Manos Libres"}</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-slate-500 font-semibold">
              Voz Bilingüe Dual Activa
            </span>
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1 hover:text-amber-300 transition font-bold"
            >
              <History className="w-3.5 h-3.5" />
              <span>Historial ({historyCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

