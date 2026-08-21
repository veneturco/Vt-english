import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Award, Coins, Flame, Star, CheckCircle2, ChevronRight, RefreshCw } from "lucide-react";
import { fireParticles } from "../../utils/particleHelper";
import { playSuccessFanfare, playCoinSound, playJumpSound, playErrorSoft } from "../../utils/audioSynth";
import { useSpringAnimation } from "../../utils/useSpringAnimation";

export interface DinoMedal {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

interface DinoEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTodayCount?: number;
  dailyGoal?: number;
  currentStreak?: number;
  mascotEmoji?: string;
  onEggHatched?: (reward: { coins: number; medal: DinoMedal }) => void;
}

const STORAGE_KEY_REWARDS = "vt_dino_egg_rewards_v1";

const REWARD_MEDALS: DinoMedal[] = [
  { id: "m_dino_star", name: "Dino Star", description: "Master of prehistoric vocabulary!", icon: "⭐" },
  { id: "m_raptor_speaker", name: "Raptor Speaker", description: "Clear and loud English pronunciation!", icon: "🎙️" },
  { id: "m_egg_master", name: "Egg Master", description: "Hatched a daily streak mystery egg!", icon: "🥚" },
  { id: "m_fossil_hunter", name: "Fossil Hunter", description: "Completed 5 adventure levels in a row!", icon: "🦴" },
  { id: "m_rex_champion", name: "Rex Champion", description: "Fearless English language explorer!", icon: "👑" },
];

export const DinoEggModal: React.FC<DinoEggModalProps> = ({
  isOpen,
  onClose,
  completedTodayCount = 5,
  dailyGoal = 5,
  currentStreak = 3,
  mascotEmoji = "🦖",
  onEggHatched,
}) => {
  const [eggState, setEggState] = useState<"intact" | "cracking" | "hatched">("intact");
  const [rewardData, setRewardData] = useState<{ coins: number; medal: DinoMedal } | null>(null);
  const [persistedCoins, setPersistedCoins] = useState<number>(100);
  const [persistedMedals, setPersistedMedals] = useState<string[]>([]);
  const eggContainerRef = useRef<HTMLDivElement | null>(null);

  // Hook de físicas de resorte para el rebote del huevo al hacer clic o temblar
  const { ref: eggSpringRef, triggerBounce: triggerEggBounce } = useSpringAnimation<HTMLDivElement>({
    tension: 240,
    friction: 10,
    mass: 0.9,
  });

  const isReadyToHatch = completedTodayCount >= dailyGoal;

  // Cargar estado de recompensas desde LocalStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY_REWARDS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.coins) setPersistedCoins(parsed.coins);
          if (parsed.medals) setPersistedMedals(parsed.medals);
        }
      }
    } catch (e) {
      console.warn("Failed to load rewards from localStorage:", e);
    }
  }, []);

  // Reiniciar estado visual si se abre el modal
  useEffect(() => {
    if (isOpen) {
      setEggState("intact");
      setRewardData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Ejecución de la animación de eclosión
  const handleEggClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isReadyToHatch) {
      playErrorSoft();
      triggerEggBounce(1.18, 0.88);
      return;
    }

    if (eggState === "hatched") return;

    if (eggState === "intact") {
      playJumpSound();
      triggerEggBounce(1.35, 0.7);
      setEggState("cracking");

      // Explosión y eclosión a los 400ms
      setTimeout(() => {
        setEggState("hatched");
        playSuccessFanfare();

        // Obtener coordenadas del huevo para la ráfaga de partículas
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        fireParticles(centerX, centerY, "stars", 50);
        fireParticles(centerX, centerY, "confetti", 70);

        // Notificar a la mascota global
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("mascot-action", { detail: { action: "jump" } }));
        }

        // Selección aleatoria de medalla
        const availableMedals = REWARD_MEDALS.filter((m) => !persistedMedals.includes(m.id));
        const chosenMedal = availableMedals.length > 0
          ? availableMedals[Math.floor(Math.random() * availableMedals.length)]
          : REWARD_MEDALS[0];

        const awardedCoins = 50;
        const newTotalCoins = persistedCoins + awardedCoins;
        const newMedalsList = Array.from(new Set([...persistedMedals, chosenMedal.id]));

        setPersistedCoins(newTotalCoins);
        setPersistedMedals(newMedalsList);

        const newReward = {
          coins: awardedCoins,
          medal: { ...chosenMedal, unlockedAt: new Date().toISOString() },
        };
        setRewardData(newReward);

        // Guardar en LocalStorage
        try {
          localStorage.setItem(
            STORAGE_KEY_REWARDS,
            JSON.stringify({
              coins: newTotalCoins,
              medals: newMedalsList,
              lastHatched: new Date().toISOString(),
            })
          );
        } catch (err) {
          console.warn("Could not save to localStorage:", err);
        }

        if (onEggHatched) {
          onEggHatched(newReward);
        }
      }, 450);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Contenedor Principal del Modal con Glassmorphism */}
      <div className="relative w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-2xl border-2 border-amber-400/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col items-center select-none overflow-hidden text-center">
        {/* Luces decorativas de fondo */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs transition cursor-pointer z-20"
        >
          ✕
        </button>

        {/* HEADER: Racha & Título */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 mb-4 shadow-inner">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">
            {currentStreak} Días de Racha!
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs font-bold text-amber-200">
            {persistedCoins} 🪙
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
          {eggState === "hatched"
            ? "¡HUEVO ECLOSIONADO!"
            : isReadyToHatch
            ? "¡TU HUEVO ESTÁ LISTO!"
            : "INCUBADORA DE DINOSAURIO"}
        </h2>

        <p className="text-xs text-slate-400 font-medium mt-1 max-w-xs">
          {eggState === "hatched"
            ? "¡Has desbloqueado una medalla legendaria y monedas!"
            : isReadyToHatch
            ? "¡Toca el huevo para romper el cascarón y recibir tu premio!"
            : `Completa tus lecciones de hoy para incubar el huevo sorpresa.`}
        </p>

        {/* BARRA DE PROGRESO DE LA RACHA (Ej. 4/5 o 5/5) */}
        <div className="w-full max-w-xs my-5">
          <div className="flex items-center justify-between text-xs font-black mb-1.5 px-1">
            <span className="text-slate-400">Progreso Diario</span>
            <span className={isReadyToHatch ? "text-emerald-400" : "text-amber-400"}>
              {completedTodayCount} / {dailyGoal} Lecciones
            </span>
          </div>

          <div className="w-full h-3.5 rounded-full bg-slate-800/80 border border-slate-700/80 overflow-hidden p-0.5 shadow-inner">
            <div
              style={{ width: `${Math.min(100, (completedTodayCount / dailyGoal) * 100)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isReadyToHatch
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                  : "bg-gradient-to-r from-amber-400 to-orange-400"
              }`}
            />
          </div>
        </div>

        {/* EL HUEVO DINOSAURIO INTERACTIVO O RECOMPENSA DESBLOQUEADA */}
        <div className="relative my-2 flex items-center justify-center min-h-[180px]">
          {eggState !== "hatched" ? (
            <div
              ref={eggSpringRef}
              onClick={handleEggClick}
              className={`
                relative w-36 h-48 sm:w-40 sm:h-52 rounded-[50%_50%_46%_46%/60%_60%_40%_40%]
                cursor-pointer select-none transition-all duration-300 will-change-transform
                flex flex-col items-center justify-center border-4
                ${
                  isReadyToHatch
                    ? "bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 border-amber-100 shadow-[0_0_40px_rgba(251,191,36,0.6)] animate-bounce"
                    : "bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-slate-600 opacity-80"
                }
              `}
            >
              {/* Manchas del Huevo */}
              <div className="absolute top-8 left-6 w-7 h-7 rounded-full bg-amber-600/30 blur-[1px]" />
              <div className="absolute top-20 right-5 w-9 h-9 rounded-full bg-amber-600/30 blur-[1px]" />
              <div className="absolute bottom-10 left-8 w-10 h-10 rounded-full bg-amber-600/30 blur-[1px]" />

              {/* Grietas de Quiebre al Tocarlo (Estado Cracking) */}
              {eggState === "cracking" ? (
                <div className="text-5xl font-black text-amber-950 animate-ping">
                  ⚡
                </div>
              ) : (
                <span className="text-4xl filter drop-shadow">
                  {isReadyToHatch ? "✨" : "🔒"}
                </span>
              )}

              {/* Brillo Superior del Cascarón */}
              <div className="absolute top-4 left-6 w-12 h-6 rounded-full bg-white/40 rotate-[-25deg] blur-[2px]" />

              {isReadyToHatch && (
                <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg animate-pulse border border-white">
                  ¡Tócame!
                </div>
              )}
            </div>
          ) : (
            /* RECOMPENSA FLOTANTE DESBLOQUEADA */
            <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border-4 border-white shadow-[0_0_35px_rgba(251,191,36,0.8)] flex items-center justify-center text-6xl animate-bounce">
                <span className="filter drop-shadow-md">{rewardData?.medal.icon || "⭐"}</span>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow border border-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-black text-amber-300 mt-4 tracking-tight">
                {rewardData?.medal.name}
              </h3>
              <p className="text-xs text-slate-300 font-semibold max-w-xs mt-0.5">
                {rewardData?.medal.description}
              </p>

              <div className="flex items-center gap-2 mt-3 px-4 py-1.5 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-sm shadow">
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" />
                <span>+{rewardData?.coins} Monedas Extra</span>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER: Botones de Acción */}
        <div className="w-full mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <span>Colección:</span>
            <span className="text-amber-400 font-black">{persistedMedals.length}</span>
            <span>/ {REWARD_MEDALS.length}</span>
          </div>

          {eggState === "hatched" ? (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_4px_0_#065f46] hover:brightness-110 active:translate-y-0.5 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>¡Genial, Gracias!</span>
              <Award className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
