import React from "react";
import {
  X,
  History,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Sparkles,
  User,
  Bot,
} from "lucide-react";
import { ChatMessage } from "../types";

interface TranscriptHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onReplayAudio: (text: string) => void;
  onClearHistory: () => void;
}

export const TranscriptHistory: React.FC<TranscriptHistoryProps> = ({
  isOpen,
  onClose,
  messages,
  onReplayAudio,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#161b22] border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1117]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Historial de Conversación ({messages.length})
              </h3>
              <p className="text-xs text-slate-400">
                Registro de mensajes, correcciones pedagógicas y audios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition text-xs flex items-center gap-1"
                title="Limpiar historial"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message stream */}
        <div className="p-5 overflow-y-auto max-h-[65vh] space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-slate-300">
                Aún no hay mensajes en esta sesión
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Comienza a hablar o escribir para interactuar con tu tutor de inglés.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl border flex flex-col gap-2.5 transition ${
                  msg.sender === "tutor"
                    ? "bg-[#0d1117] border-blue-500/30 text-slate-100"
                    : "bg-blue-950/20 border-slate-700/80 text-blue-100 ml-4 sm:ml-8"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {msg.sender === "tutor" ? (
                      <div className="p-1 rounded bg-blue-500/20 text-blue-400">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="p-1 rounded bg-slate-700 text-slate-300">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-300">
                      {msg.sender === "tutor" ? "Tutor VT" : "Tú (Estudiante)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => onReplayAudio(msg.text)}
                      className="p-1 rounded hover:bg-slate-800 text-blue-400 hover:text-blue-300 transition"
                      title="Reproducir audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed">{msg.text}</p>

                {msg.spanishTranslation && (
                  <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    🇪🇸 {msg.spanishTranslation}
                  </p>
                )}

                {msg.correction && msg.correction.hasError && (
                  <div className="mt-1 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                    <div className="flex items-center gap-1 text-amber-400 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Nota pedagógica:</span>
                    </div>
                    {msg.correction.correctedSentence && (
                      <p>
                        <strong>Corrección:</strong> "{msg.correction.correctedSentence}"
                      </p>
                    )}
                    {msg.correction.explanation && <p>{msg.correction.explanation}</p>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
