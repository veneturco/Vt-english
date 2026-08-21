import React, { useState, useEffect, useRef } from "react";
import { Award, Coins, Flame, CheckCircle2, Sparkles, X } from "lucide-react";
import { fireParticles } from "../../utils/particleHelper";
import { playSuccessFanfare, playJumpSound, playErrorSoft } from "../../utils/audioSynth";
import { useSpringAnimation } from "../../utils/useSpringAnimation";

export interface DinoMedal {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
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
  { id: "m_dino_star", name: "Dino Star", description: "¡Maestro del vocabulario prehistórico!", icon: "⭐", color: "from-amber-400 to-yellow-500" },
  { id: "m_raptor_speaker", name: "Raptor Speaker", description: "¡Pronunciación clara y sonora en inglés!", icon: "🎙️", color: "from-sky-400 to-blue-500" },
  { id: "m_egg_master", name: "Egg Master", description: "¡Has eclosionado el huevo de la racha diaria!", icon: "🥚", color: "from-emerald-400 to-teal-500" },
  { id: "m_fossil_hunter", name: "Fossil Hunter", description: "¡5 niveles de aventura completados con éxito!", icon: "🦴", color: "from-orange-400 to-amber-600" },
  { id: "m_rex_champion", name: "Rex Champion", description: "¡Explorador intrépido del idioma inglés!", icon: "👑", color: "from-purple-400 to-pink-500" },
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
  const [eggState, setEggState] = useState<"intact" | "shaking" | "cracked" | "hatched">("intact");
  const [rewardData, setRewardData] = useState<{ coins: number; medal: DinoMedal } | null>(null);
  const [persistedCoins, setPersistedCoins] = useState<number>(100);
  const [persistedMedals, setPersistedMedals] = useState<string[]>([]);
  const eggContainerRef = useRef<HTMLDivElement | null>(null);

  // Físicas elásticas para squash and stretch del huevo
  const { ref: eggSpringRef, triggerBounce: triggerEggBounce } = useSpringAnimation<HTMLDivElement>({
    tension: 250,
    friction: 12,
    mass: 0.9,
  });

  const isReadyToHatch = completedTodayCount >= dailyGoal;

  // Cargar estado de premios desde LocalStorage
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

  // Reset del ciclo al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setEggState("intact");
      setRewardData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Manejo de la secuencia cinematográfica de eclosión
  const handleEggClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isReadyToHatch) {
      playErrorSoft();
      triggerEggBounce(1.15, 0.88);
      return;
    }

    if (eggState !== "intact") return;

    // Paso 1: Vibración de inicio
    playJumpSound();
    triggerEggBounce(1.3, 0.72);
    setEggState("shaking");

    // Paso 2: Cascarón con grietas luminosas (a los 250ms)
    setTimeout(() => {
      setEggState("cracked");
      triggerEggBounce(0.8, 1.35);

      // Paso 3: Ruptura total, explosión y revelación centrada (a los 650ms)
      setTimeout(() => {
        setEggState("hatched");
        playSuccessFanfare();

        // Disparo de partículas desde el centro del huevo
        if (eggContainerRef.current) {
          const rect = eggContainerRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          fireParticles(centerX, centerY, "stars", 55);
          fireParticles(centerX, centerY, "confetti", 75);
        } else {
          fireParticles(window.innerWidth / 2, window.innerHeight / 2, "stars", 55);
          fireParticles(window.innerWidth / 2, window.innerHeight / 2, "confetti", 75);
        }

        // Salto global para mascotas activas
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("mascot-action", { detail: { action: "jump" } }));
        }

        // Elegir medalla
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

        // Guardar progreso en LocalStorage
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
      }, 400);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Contenedor Principal Glassmorphism */}
      <div className="relative w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-2xl border-2 border-amber-400/30 shadow-[0_25px_60px_rgba(0,0,0,0.7)] flex flex-col items-center select-none overflow-hidden text-center">
        {/* Resplandores ambientales de fondo */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs transition cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER: Racha & Monedas */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 mb-3 shadow-inner">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">
            {currentStreak} Días de Racha
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-bold text-amber-200">
            {persistedCoins} 🪙
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          {eggState === "hatched"
            ? "¡PREMIO DESBLOQUEADO!"
            : isReadyToHatch
            ? "¡HUEVO LISTO PARA ABRIR!"
            : "INCUBADORA DE DINOSAURIO"}
        </h2>

        <p className="text-xs text-slate-400 font-medium mt-1 max-w-xs">
          {eggState === "hatched"
            ? "¡Has descubierto una medalla coleccionable y monedas!"
            : isReadyToHatch
            ? "¡Toca el huevo para romper el cascarón y recibir tu premio!"
            : "Completa tu racha de hoy para abrir el huevo sorpresa."}
        </p>

        {/* BARRA DE PROGRESO DE LA RACHA */}
        <div className="w-full max-w-xs my-4">
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

        {/* CONTENEDOR CENTRAL: HUEVO / SECUENCIA DE QUIEBRE / RECOMPENSA */}
        <div
          ref={eggContainerRef}
          className="relative my-3 flex items-center justify-center min-h-[220px] w-full"
        >
          {eggState !== "hatched" ? (
            <div
              ref={eggSpringRef}
              onClick={handleEggClick}
              className={`
                relative w-40 h-52 sm:w-44 sm:h-56 cursor-pointer select-none
                flex flex-col items-center justify-center will-change-transform
                ${eggState === "shaking" ? "animate-bounce" : ""}
              `}
            >
              {/* HUEVO VECTORIAL SVG CON GRIETAS DINÁMICAS */}
              <svg
                viewBox="0 0 160 210"
                className={`w-full h-full filter drop-shadow-2xl transition-transform duration-300 ${
                  isReadyToHatch ? "hover:scale-105 active:scale-95" : "opacity-80"
                }`}
              >
                <defs>
                  {/* Gradiente del cascarón dorado */}
                  <linearGradient id="eggGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="40%" stopColor="#fde047" />
                    <stop offset="85%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>

                  {/* Gradiente bloqueado */}
                  <linearGradient id="eggLockedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>

                  {/* Filtro de brillo */}
                  <filter id="eggGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Sombra de la base */}
                <ellipse cx="80" cy="195" rx="55" ry="12" fill="#000000" opacity="0.4" />

                {/* Resplandor exterior cuando está listo */}
                {isReadyToHatch && (
                  <path
                    d="M 80,10 C 135,10 152,85 152,145 C 152,185 125,200 80,200 C 35,200 8,185 8,145 C 8,85 25,10 80,10 Z"
                    fill="none"
                    stroke="#fde047"
                    strokeWidth="6"
                    opacity="0.5"
                    filter="url(#eggGlow)"
                  />
                )}

                {/* Cascarón del huevo */}
                <path
                  d="M 80,10 C 135,10 152,85 152,145 C 152,185 125,200 80,200 C 35,200 8,185 8,145 C 8,85 25,10 80,10 Z"
                  fill={isReadyToHatch ? "url(#eggGrad)" : "url(#eggLockedGrad)"}
                  stroke={isReadyToHatch ? "#fef08a" : "#64748b"}
                  strokeWidth="4"
                />

                {/* Manchas divertidas del huevo */}
                <circle cx="50" cy="65" r="14" fill="#b45309" opacity="0.35" />
                <circle cx="115" cy="95" r="18" fill="#b45309" opacity="0.35" />
                <circle cx="65" cy="150" r="20" fill="#b45309" opacity="0.35" />
                <circle cx="110" cy="165" r="12" fill="#b45309" opacity="0.35" />

                {/* Brillo especular superior */}
                <path
                  d="M 45,35 C 55,20 75,18 75,18 C 75,18 55,25 48,48 C 45,42 45,35 45,35 Z"
                  fill="#ffffff"
                  opacity="0.65"
                />

                {/* GRIETAS DE ECLOSIÓN (Estado cracked o shaking) */}
                {(eggState === "cracked" || eggState === "shaking") && (
                  <g stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    {/* Grieta principal central en zig-zag */}
                    <path d="M 80,45 L 70,75 L 95,100 L 65,130 L 90,155 L 75,180" className="animate-pulse" />
                    {/* Ramificaciones laterales */}
                    <path d="M 70,75 L 45,85" />
                    <path d="M 95,100 L 125,110" />
                    <path d="M 65,130 L 40,140" />
                  </g>
                )}

                {/* Candado si está bloqueado */}
                {!isReadyToHatch && (
                  <text x="80" y="125" fontSize="32" textAnchor="middle" fill="#94a3b8">
                    🔒
                  </text>
                )}
              </svg>

              {/* Etiqueta interactiva inferior */}
              {isReadyToHatch && eggState === "intact" && (
                <div className="absolute -bottom-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-lg animate-bounce border-2 border-white">
                  ¡Toca para Romper!
                </div>
              )}
            </div>
          ) : (
            /* RECOMPENSA REVELADA (Centrada, limpia y con animación Zoom In) */
            <div className="flex flex-col items-center justify-center animate-in zoom-in-50 duration-500 w-full">
              {/* Tarjeta / Medalla Flotante */}
              <div
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${
                  rewardData?.medal.color || "from-amber-400 to-yellow-500"
                } border-4 border-white shadow-[0_0_40px_rgba(251,191,36,0.7)] flex items-center justify-center text-5xl sm:text-6xl animate-bounce`}
              >
                <span className="filter drop-shadow-md select-none">
                  {rewardData?.medal.icon || "⭐"}
                </span>

                {/* Badge de Verificación */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                </div>
              </div>

              {/* Nombre y Descripción */}
              <h3 className="text-xl sm:text-2xl font-black text-amber-300 mt-4 tracking-tight">
                {rewardData?.medal.name}
              </h3>
              <p className="text-xs text-slate-300 font-semibold max-w-xs mt-1 leading-relaxed">
                {rewardData?.medal.description}
              </p>

              {/* Monedas Extras Ganadas */}
              <div className="flex items-center gap-2 mt-3 px-4 py-1.5 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-300 font-black text-sm shadow-md">
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" />
                <span>+{rewardData?.coins} Monedas Extra</span>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER: Colección & Botón de Acción */}
        <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Colección:</span>
            <span className="text-amber-400 font-black">{persistedMedals.length}</span>
            <span>/ {REWARD_MEDALS.length}</span>
          </div>

          {eggState === "hatched" ? (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_4px_0_#065f46] hover:brightness-110 active:translate-y-0.5 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>¡Genial!</span>
              <Sparkles className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Volver al mapa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
