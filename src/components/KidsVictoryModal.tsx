import React, { useState, useEffect } from "react";
import { Sparkles, Star, Coins, ArrowRight, RotateCcw, Trophy, PartyPopper } from "lucide-react";
import { playVictoryFanfare, playCoinCollect, playPopSound } from "../utils/audioSynth";
import { fireSuccessConfetti } from "../utils/confettiHelper";
import { haptics } from "../utils/haptics";

export interface KidsVictoryModalProps {
  isOpen: boolean;
  score: number;
  earnedCoins?: number;
  earnedStars?: number;
  characterAvatar?: string;
  characterName?: string;
  missionTitle?: string;
  onNextMission: () => void;
  onClose: () => void;
  hasNextMission?: boolean;
}

export const KidsVictoryModal: React.FC<KidsVictoryModalProps> = ({
  isOpen,
  score,
  earnedCoins = 10,
  earnedStars = 3,
  characterAvatar = "🦖",
  characterName = "Rexy",
  missionTitle = "Misión Completada",
  onNextMission,
  onClose,
  hasNextMission = true,
}) => {
  const [displayCoins, setDisplayCoins] = useState(0);
  const [displayStars, setDisplayStars] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setDisplayCoins(0);
      setDisplayStars(0);

      // 1. Audio, háptica y confeti de victoria
      playVictoryFanfare();
      haptics.celebrate();
      fireSuccessConfetti();

      // 2. Animación de conteo ascendente para monedas
      let currentC = 0;
      const coinInterval = setInterval(() => {
        if (currentC < earnedCoins) {
          currentC += 1;
          setDisplayCoins(currentC);
          playCoinCollect();
        } else {
          clearInterval(coinInterval);
        }
      }, 70);

      // 3. Animación de conteo para estrellas
      let currentS = 0;
      const starInterval = setInterval(() => {
        if (currentS < earnedStars) {
          currentS += 1;
          setDisplayStars(currentS);
        } else {
          clearInterval(starInterval);
        }
      }, 180);

      return () => {
        clearInterval(coinInterval);
        clearInterval(starInterval);
      };
    }
  }, [isOpen, earnedCoins, earnedStars]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 p-1.5 rounded-[36px] shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-in zoom-in-95 duration-300">
        
        {/* CONTENEDOR INTERIOR */}
        <div className="w-full bg-amber-50 rounded-[32px] p-6 sm:p-8 flex flex-col items-center gap-5 text-slate-900 border-4 border-yellow-200 text-center relative overflow-hidden">
          
          {/* DECORACIÓN RADIAL */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />

          {/* AVATAR CELEBRANDO */}
          <div className="relative flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-100 border-4 border-amber-400 flex items-center justify-center shadow-xl animate-bounce">
              {characterAvatar.startsWith("/") || characterAvatar.startsWith("http") ? (
                <img
                  src={characterAvatar}
                  alt={characterName}
                  className="w-20 h-20 object-contain drop-shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-6xl drop-shadow-md">{characterAvatar}</span>
              )}
            </div>
            
            <div className="absolute -bottom-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-4 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1">
              <PartyPopper className="w-3.5 h-3.5" />
              <span>¡Excelente!</span>
            </div>
          </div>

          {/* TÍTULO Y SCORE */}
          <div className="flex flex-col items-center gap-1 mt-1">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
              ¡Misión Completada!
            </h2>
            <p className="text-xs sm:text-sm font-extrabold text-amber-800/90">
              {missionTitle}
            </p>
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border-2 border-emerald-400 px-3 py-0.5 rounded-full font-black text-xs mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Precisión: {score}%</span>
            </div>
          </div>

          {/* CAJA DE RECOMPENSAS GANADAS */}
          <div className="w-full grid grid-cols-2 gap-3.5 my-1">
            
            {/* MONEDAS GANADAS */}
            <div className="bg-gradient-to-br from-amber-100 to-yellow-200/70 border-2 border-amber-300 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Coins className="w-6 h-6 text-amber-600 fill-amber-400 animate-pulse" />
                <span className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
                  +{displayCoins}
                </span>
              </div>
              <span className="text-[11px] font-black text-amber-800 tracking-wide">
                Monedas de Oro
              </span>
            </div>

            {/* ESTRELLAS GANADAS */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-200/70 border-2 border-indigo-300 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Star className="w-6 h-6 text-indigo-600 fill-yellow-400 animate-spin" style={{ animationDuration: "4s" }} />
                <span className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono">
                  +{displayStars}
                </span>
              </div>
              <span className="text-[11px] font-black text-indigo-800 tracking-wide">
                Estrellas Mágicas
              </span>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN GIGANTE REBOTANTE */}
          <div className="w-full flex flex-col gap-2.5 mt-1">
            <button
              type="button"
              onClick={() => {
                playPopSound();
                if (hasNextMission) {
                  onNextMission();
                } else {
                  onClose();
                }
              }}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base sm:text-lg rounded-2xl shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_10px_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-emerald-300 animate-bounce hover:animate-none"
            >
              <span>{hasNextMission ? "¡Siguiente Misión!" : "¡Volver al Menú!"}</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={() => {
                playPopSound();
                onClose();
              }}
              className="text-xs font-black text-amber-900/80 hover:text-amber-950 py-1 transition cursor-pointer"
            >
              Cerrar y volver
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
export default KidsVictoryModal;
