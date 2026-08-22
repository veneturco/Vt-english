import React, { useState } from "react";
import { Sparkles, Flame, Gift, Volume2, ArrowRight, Heart, HelpCircle } from "lucide-react";
import { useKidsProgress } from "../hooks/useKidsProgress";
import {
  MYSTERY_DINO_SPECIES,
  REQUIRED_STREAK_TO_HATCH,
  getEggStageByStreak,
  EggStage,
} from "../types/kidsProgress";
import {
  playJumpSound,
  playSuccessFanfare,
  playVictoryFanfare,
  playCoinSound,
  playPopSound,
} from "../utils/audioSynth";
import { fireLevelUpConfetti, fireSuccessConfetti } from "../utils/confettiHelper";
import { fireParticles } from "../utils/particleHelper";

export interface MysteryEggWidgetProps {
  className?: string;
  onOpenMission?: () => void;
}

export const MysteryEggWidget: React.FC<MysteryEggWidgetProps> = ({
  className = "",
  onOpenMission,
}) => {
  const { streakDays, currentEggSpeciesIndex, claimEggReward } = useKidsProgress();
  const [isWiggling, setIsWiggling] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [isClaimedCelebration, setIsClaimedCelebration] = useState(false);

  // Especie activa que está creciendo dentro del huevo
  const currentSpecies =
    MYSTERY_DINO_SPECIES[currentEggSpeciesIndex % MYSTERY_DINO_SPECIES.length];

  // Etapa del huevo según la racha
  const stage: EggStage = getEggStageByStreak(streakDays);
  const progressPercent = Math.min(100, Math.round((streakDays / REQUIRED_STREAK_TO_HATCH) * 100));

  // Frases motivacionales habladas en inglés
  const speakMotivation = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1.3;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleEggClick = (e: React.MouseEvent) => {
    setIsWiggling(true);
    playPopSound();
    fireParticles(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, "confetti", 15);

    setTimeout(() => setIsWiggling(false), 600);

    if (stage === "hatched") {
      speakMotivation(`Congratulations! You hatched ${currentSpecies.name}!`);
      setHintMessage(`¡Eclosionaste a ${currentSpecies.name}! 🎉`);
    } else {
      const messages = [
        "Practice today to hatch me! 🥚",
        "Keep your streak to see me grow! 🦖",
        "I can hear you! Say more words! 🌟",
        "Almost ready! You are doing super! 🚀",
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setHintMessage(randomMsg);
      speakMotivation(randomMsg.replace(/[^\w\s!]/gi, ""));
    }
  };

  const handleClaimCelebration = () => {
    playVictoryFanfare();
    fireLevelUpConfetti(3500);
    claimEggReward(currentSpecies.bonusCoins, currentSpecies.bonusStars, currentSpecies.id);
    setIsClaimedCelebration(true);
    setTimeout(() => setIsClaimedCelebration(false), 3000);
  };

  return (
    <div
      className={`relative w-full max-w-md bg-gradient-to-b from-amber-500/10 via-amber-950/20 to-slate-950/80 rounded-3xl p-5 border-2 border-amber-400/40 shadow-2xl backdrop-blur-md flex flex-col items-center gap-4 text-white select-none ${className}`}
    >
      {/* HEADER DEL WIDGET */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-amber-200">
              Huevo Misterioso de Dino
            </h3>
            <p className="text-[11px] font-semibold text-slate-300">
              {stage === "hatched"
                ? "¡Eclosión lista!"
                : `Día ${Math.min(streakDays, REQUIRED_STREAK_TO_HATCH)} de ${REQUIRED_STREAK_TO_HATCH} para eclosionar`}
            </p>
          </div>
        </div>

        {/* INDICADOR DE RACHA */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-rose-500/20 border border-rose-400/30">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-300 animate-pulse" />
          <span className="text-xs font-black text-rose-300">{streakDays}d Racha</span>
        </div>
      </div>

      {/* ÁREA INTERACTIVA DEL HUEVO / DINOSAURIO */}
      <div className="relative my-2 flex flex-col items-center justify-center">
        
        {/* HALO DE LUZ DE FONDO */}
        <div
          className={`absolute w-36 h-36 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
            stage === "hatched"
              ? "bg-amber-400/40 scale-125"
              : stage === "cracking_heavy"
              ? "bg-yellow-400/30 scale-110"
              : "bg-amber-500/20 scale-90"
          }`}
        />

        {/* HUEVO / DINO CLICKEABLE */}
        <button
          type="button"
          onClick={handleEggClick}
          className={`group relative flex items-center justify-center p-4 transition-all transform cursor-pointer active:scale-95 focus:outline-none ${
            isWiggling ? "animate-bounce scale-110" : "hover:scale-105"
          }`}
          title="Toca el huevo para interactuar"
        >
          {stage === "hatched" ? (
            /* AVATAR DEL DINO ECLOSIONADO */
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 p-1.5 border-4 border-amber-300 shadow-xl flex items-center justify-center overflow-hidden">
                {currentSpecies.avatar.startsWith("/") || currentSpecies.avatar.startsWith("http") ? (
                  <img
                    src={currentSpecies.avatar}
                    alt={currentSpecies.name}
                    className="w-full h-full object-contain filter drop-shadow-md animate-pulse"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-6xl drop-shadow-md">{currentSpecies.avatar}</span>
                )}
              </div>
              <span className="mt-2 text-xs font-black text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-400/50">
                ¡{currentSpecies.name}! 🎉
              </span>
            </div>
          ) : (
            /* HUEVO EN DISTINTAS ETAPAS DE INCUBACIÓN */
            <div className="relative flex items-center justify-center">
              {/* Forma del Huevo mediante SVG dinámico con grietas */}
              <svg
                width="110"
                height="140"
                viewBox="0 0 110 140"
                className={`filter drop-shadow-2xl transition-transform ${
                  stage === "cracking_heavy"
                    ? "animate-pulse"
                    : stage === "cracking_light"
                    ? "hover:rotate-3"
                    : ""
                }`}
              >
                <defs>
                  <linearGradient id="eggGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="spotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Cascarón base de huevo */}
                <ellipse cx="55" cy="75" rx="45" ry="60" fill="url(#eggGrad)" />
                {/* Manchas de dinosaurio */}
                <circle cx="40" cy="55" r="10" fill="url(#spotGrad)" />
                <circle cx="75" cy="80" r="14" fill="url(#spotGrad)" />
                <circle cx="45" cy="105" r="8" fill="url(#spotGrad)" />

                {/* Grietas ligeras (Día 2-3) */}
                {(stage === "cracking_light" || stage === "cracking_heavy") && (
                  <path
                    d="M 50,45 L 56,58 L 48,68 L 58,80"
                    stroke="#78350f"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Grietas pesadas con destellos de luz (Día 4) */}
                {stage === "cracking_heavy" && (
                  <>
                    <path
                      d="M 58,80 L 68,92 L 60,105"
                      stroke="#78350f"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 56,58 L 70,60 L 78,50"
                      stroke="#78350f"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Rayos de luz saliendo de las fisuras */}
                    <circle cx="56" cy="58" r="4" fill="#ffffff" className="animate-ping" />
                    <circle cx="58" cy="80" r="5" fill="#fef08a" className="animate-pulse" />
                  </>
                )}
              </svg>

              {/* Badges Flotantes de Estado */}
              <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md">
                {stage === "cracking_heavy"
                  ? "¡Casi listo!"
                  : stage === "cracking_light"
                  ? "¡Crujiendo!"
                  : "Incubando"}
              </div>
            </div>
          )}
        </button>

        {/* PISTA / DIÁLOGO MOTIVACIONAL AL TOCAR */}
        {hintMessage && (
          <div className="mt-1 bg-amber-200 text-amber-950 px-3 py-1.5 rounded-xl font-black text-xs shadow-md border border-amber-400 text-center animate-in fade-in zoom-in-95 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{hintMessage}</span>
          </div>
        )}
      </div>

      {/* BARRA DE PROGRESO DE INCUBACIÓN */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-black">
          <span className="text-amber-300">Progreso de Incubación</span>
          <span className="text-amber-400">{progressPercent}%</span>
        </div>

        <div className="w-full h-3 bg-slate-900/80 rounded-full border border-amber-400/30 overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ACCIONES DEL WIDGET */}
      {stage === "hatched" ? (
        <button
          type="button"
          onClick={handleClaimCelebration}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Gift className="w-4 h-4" />
          <span>¡Reclamar Recompensa (+{currentSpecies.bonusCoins} 🪙 / +{currentSpecies.bonusStars} ⭐)!</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenMission}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>¡Practicar Hoy para Continuar Racha!</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
export default MysteryEggWidget;
