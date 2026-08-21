import React, { useState } from "react";
import { Volume2, CheckCircle, AlertCircle, Sparkles, X } from "lucide-react";
import { WordAccuracy } from "../types";
import { speakText } from "../utils/speech";

interface PronunciationMeterProps {
  userTranscript: string;
  targetPhrase: string;
  wordAccuracies: WordAccuracy[];
  overallScore: number;
  onReplayWord?: (word: string) => void;
  onOpenEchoTrainer?: () => void;
  onDismiss?: () => void;
  avatarVoiceAccent?: string;
  avatarVoiceGender?: "male" | "female";
}

export const PronunciationMeter: React.FC<PronunciationMeterProps> = ({
  userTranscript,
  targetPhrase,
  wordAccuracies,
  overallScore,
  onReplayWord,
  onOpenEchoTrainer,
  onDismiss,
  avatarVoiceAccent = "en-US",
  avatarVoiceGender = "female",
}) => {
  const [selectedWord, setSelectedWord] = useState<WordAccuracy | null>(null);

  if (!userTranscript && wordAccuracies.length === 0) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 border-emerald-500/50 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/50 bg-amber-500/10";
    return "text-rose-400 border-rose-500/50 bg-rose-500/10";
  };

  const getBadgeColor = (score: number) => {
    if (score >= 85) return "from-emerald-500 to-teal-600 text-white";
    if (score >= 60) return "from-amber-500 to-orange-600 text-white";
    return "from-rose-500 to-red-600 text-white";
  };

  const handleSpeak = (word: string) => {
    speakText(
      word,
      {
        preset: "teacher_female",
        name: "Tutor",
        role: "coach",
        skinTone: "#f8d9c2",
        hairStyle: "bun",
        hairColor: "#3d2314",
        glasses: "none",
        outfit: "casual_blazer",
        outfitColor: "#1e293b",
        accentColor: "#f59e0b",
        accessory: "none",
        voiceAccent: (avatarVoiceAccent as any) || "en-US",
        voiceGender: avatarVoiceGender === "male" ? "male" : "female",
        voiceRate: 0.9,
        voicePitch: 1.0,
        voiceEngine: "native",
        characterEmoji: "🗣️",
        badgeText: "Native Coach",
      },
      undefined,
      undefined,
      undefined,
      { forceLang: avatarVoiceAccent, rateMultiplier: 0.8 }
    );
  };

  return (
    <div className="w-full p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#161b22] via-[#0d1117] to-[#0d1117] border border-slate-700/80 shadow-xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
      {/* Header & Overall Score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
            Precisión Fonética
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r ${getBadgeColor(
              overallScore
            )} shadow-md flex items-center gap-1`}
          >
            {overallScore >= 85 ? (
              <CheckCircle className="w-3 h-3 text-white" />
            ) : (
              <AlertCircle className="w-3 h-3 text-white" />
            )}
            <span>{overallScore}% Match</span>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cerrar medidor"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Word Chips Breakdown */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {wordAccuracies.map((item, idx) => {
          const colorClass = getScoreColor(item.score);
          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedWord(item);
                if (onReplayWord) onReplayWord(item.word);
                else handleSpeak(item.word);
              }}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all duration-150 active:scale-95 shadow-sm ${colorClass}`}
              title="Toca para escuchar la pronunciación exacta de esta palabra"
            >
              <span>{item.word}</span>
              <span className="text-[10px] font-mono opacity-80">
                {item.score}%
              </span>
              <Volume2 className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>

      {/* Target Phrase Reference */}
      {targetPhrase && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
          <span className="truncate max-w-xs sm:max-w-md">
            <strong className="text-slate-300">Frase objetivo:</strong> "{targetPhrase}"
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSpeak(targetPhrase)}
              className="shrink-0 flex items-center gap-1 text-blue-400 hover:text-blue-300 transition font-medium"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Escuchar</span>
            </button>
            {onOpenEchoTrainer && (
              <button
                onClick={onOpenEchoTrainer}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm active:scale-95"
              >
                <span>🎙️ Echo Trainer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
