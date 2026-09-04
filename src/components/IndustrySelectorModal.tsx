import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  X,
  Check,
  Volume2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Mail,
  MessageSquare,
} from "lucide-react";
import {
  INDUSTRY_TRACKS,
  IndustryTrack,
  saveStoredIndustryTrack,
} from "../data/industryTracksData";
import { speakEnglish } from "../utils/speech";
import { playPopSound, playCoinSound } from "../utils/audioSynth";
import { haptics } from "../utils/haptics";

interface IndustrySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrackId: string;
  onSelectTrack: (track: IndustryTrack) => void;
}

export const IndustrySelectorModal: React.FC<IndustrySelectorModalProps> = ({
  isOpen,
  onClose,
  currentTrackId,
  onSelectTrack,
}) => {
  const [activeTab, setActiveTab] = useState<"jargon" | "scenarios" | "emails">("jargon");
  const [selectedTrackId, setSelectedTrackId] = useState<string>(currentTrackId || "tech");

  if (!isOpen) return null;

  const currentSelectedTrack =
    INDUSTRY_TRACKS.find((t) => t.id === selectedTrackId) || INDUSTRY_TRACKS[0];

  const handleSelectTrack = (track: IndustryTrack) => {
    playCoinSound();
    haptics.success();
    saveStoredIndustryTrack(track.id);
    onSelectTrack(track);
    onClose();
  };

  const handleSpeak = (text: string) => {
    playPopSound();
    haptics.light();
    speakEnglish(text);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-xl shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Especialización por Industria
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Adapta el vocabulario, simulaciones y correos a tu campo laboral real
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                playPopSound();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Industry Pills Carousel */}
          <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/60 overflow-x-auto no-scrollbar flex items-center gap-2.5 shrink-0">
            {INDUSTRY_TRACKS.map((track) => {
              const isSelected = track.id === selectedTrackId;
              const isCurrent = track.id === currentTrackId;

              return (
                <button
                  key={track.id}
                  onClick={() => {
                    playPopSound();
                    haptics.selection();
                    setSelectedTrackId(track.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/60"
                  }`}
                >
                  <span className="text-base">{track.icon}</span>
                  <span>{track.shortName}</span>
                  {isCurrent && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                      Activo
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Industry Details View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Banner of active industry */}
            <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentSelectedTrack.icon}</span>
                  <h4 className="text-lg font-black text-white">
                    {currentSelectedTrack.name}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-indigo-200 font-medium">
                  {currentSelectedTrack.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSelectTrack(currentSelectedTrack)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {currentTrackId === currentSelectedTrack.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Especialidad Activa</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Activar esta Especialidad</span>
                  </>
                )}
              </button>
            </div>

            {/* Sub-tabs: Jargon / Scenarios / Emails */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("jargon")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "jargon"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Jerga & Términos Clave ({currentSelectedTrack.keyJargon.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("scenarios")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "scenarios"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Simulaciones de Rol</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("emails")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "emails"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Plantillas de Email</span>
              </button>
            </div>

            {/* Content for Jargon */}
            {activeTab === "jargon" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentSelectedTrack.keyJargon.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-indigo-300">
                          {item.term}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSpeak(item.term)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Escuchar pronunciación nativa"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] font-mono text-amber-300 block mb-1">
                        /{item.phonetic}/
                      </span>
                      <p className="text-xs font-medium text-slate-300">
                        {item.spanish}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <p className="text-[11px] italic text-slate-400">
                        "{item.example}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Content for Scenarios */}
            {activeTab === "scenarios" && (
              <div className="space-y-3">
                {currentSelectedTrack.scenarios.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-black text-[10px] border border-indigo-500/30">
                          CEFR {sc.difficulty}
                        </span>
                        <h5 className="font-bold text-sm text-white">{sc.title}</h5>
                      </div>
                      <p className="text-xs text-slate-400">{sc.goal}</p>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-400 shrink-0">
                      Roleplay Disponible
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Content for Emails */}
            {activeTab === "emails" && (
              <div className="space-y-3">
                {currentSelectedTrack.emailTemplates.map((email, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-300">
                        Asunto: {email.subject}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSpeak(email.snippet)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Escuchar</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800/80 font-mono leading-relaxed">
                      {email.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
