import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, RotateCcw, Volume2, Award, Heart, Utensils } from "lucide-react";
import { fireParticles } from "../../utils/particleHelper";
import { playCoinSound, playJumpSound, playErrorSoft } from "../../utils/audioSynth";
import { useSpringAnimation } from "../../utils/useSpringAnimation";
import { hablarSegmentoNativo } from "../../utils/speech";

export interface SnackItem {
  id: string;
  englishWord: string;
  spanishMeaning: string;
  emoji: string;
  phonetic: string;
  isCorrect?: boolean;
}

interface DinoSnackMinigameProps {
  snacks?: SnackItem[];
  targetSnack?: SnackItem;
  mascotEmoji?: string;
  mascotName?: string;
  onSuccess?: () => void;
  onNext?: () => void;
  onClose?: () => void;
}

const DEFAULT_SNACKS: SnackItem[] = [
  { id: "s1", englishWord: "Apple", spanishMeaning: "Manzana", emoji: "🍎", phonetic: "/ˈæp.əl/", isCorrect: true },
  { id: "s2", englishWord: "Banana", spanishMeaning: "Plátano", emoji: "🍌", phonetic: "/bəˈnæn.ə/", isCorrect: false },
  { id: "s3", englishWord: "Cookie", spanishMeaning: "Galleta", emoji: "🍪", phonetic: "/ˈkʊk.i/", isCorrect: false },
];

export const DinoSnackMinigame: React.FC<DinoSnackMinigameProps> = ({
  snacks = DEFAULT_SNACKS,
  targetSnack = DEFAULT_SNACKS[0],
  mascotEmoji = "🦖",
  mascotName = "Pip Raptor",
  onSuccess,
  onNext,
  onClose,
}) => {
  const [fedCount, setFedCount] = useState<number>(0);
  const [maxFeedGoal] = useState<number>(3);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [isMouthHovered, setIsMouthHovered] = useState<boolean>(false);

  // Físicas elásticas para la mascota en la zona de la boca
  const { ref: mascotRef, triggerBounce: triggerMascotBounce } = useSpringAnimation<HTMLDivElement>({
    tension: 220,
    friction: 12,
    mass: 0.85,
  });

  // Referencias a los contenedores para detección geométrica de colisiones (Hitbox)
  const mouthZoneRef = useRef<HTMLDivElement | null>(null);
  const activeDragElementRef = useRef<HTMLDivElement | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startTouchOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pronunciar la palabra objetivo
  const handlePronounceTarget = () => {
    hablarSegmentoNativo(targetSnack.englishWord, "female", "en-US", 0.9);
    playJumpSound();
  };

  // Evaluar colisión geométrica entre el elemento arrastrado y la boca del dinosaurio
  const checkMouthCollision = (clientX: number, clientY: number): boolean => {
    if (!mouthZoneRef.current) return false;
    const mouthRect = mouthZoneRef.current.getBoundingClientRect();

    // Hitbox ampliado para facilidad táctil infantil
    const padding = 25;
    return (
      clientX >= mouthRect.left - padding &&
      clientX <= mouthRect.right + padding &&
      clientY >= mouthRect.top - padding &&
      clientY <= mouthRect.bottom + padding
    );
  };

  // INICIO DE ARRASTRE (Mouse & Touch)
  const handlePointerStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    snack: SnackItem
  ) => {
    if (isGameCompleted) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const targetEl = e.currentTarget;
    const rect = targetEl.getBoundingClientRect();

    startTouchOffsetRef.current = {
      x: clientX - (rect.left + rect.width / 2),
      y: clientY - (rect.top + rect.height / 2),
    };

    setDraggedItemId(snack.id);
    setIsDragging(true);
    setDragPosition({ x: clientX, y: clientY });
    hablarSegmentoNativo(snack.englishWord, "female", "en-US", 1.0);
    playJumpSound();
  };

  // MOVIMIENTO DE ARRASTRE FLUIDO (Global Mouse/Touch)
  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !draggedItemId) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      setDragPosition({
        x: clientX - startTouchOffsetRef.current.x,
        y: clientY - startTouchOffsetRef.current.y,
      });

      // Feedback visual anticipado si el snack está flotando sobre la boca
      const isColliding = checkMouthCollision(clientX, clientY);
      setIsMouthHovered(isColliding);
      if (isColliding) {
        triggerMascotBounce(1.08, 0.94);
      }
    },
    [isDragging, draggedItemId, triggerMascotBounce]
  );

  // FIN DE ARRASTRE & EVALUACIÓN (Mouse Up / Touch End)
  const handlePointerEnd = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !draggedItemId) return;

      let clientX = 0;
      let clientY = 0;

      if ("changedTouches" in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if ("clientX" in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      const isColliding = checkMouthCollision(clientX, clientY);
      const droppedSnack = snacks.find((s) => s.id === draggedItemId);

      setIsMouthHovered(false);
      setIsDragging(false);
      setDraggedItemId(null);

      // 1. RECOMPENSA DE ACIERTO: Comida correcta en la boca
      if (isColliding && droppedSnack && droppedSnack.id === targetSnack.id) {
        playCoinSound();

        // Disparo de estrellas en la boca del dinosaurio
        if (mouthZoneRef.current) {
          const mRect = mouthZoneRef.current.getBoundingClientRect();
          fireParticles(mRect.left + mRect.width / 2, mRect.top + mRect.height / 2, "stars", 45);
          fireParticles(mRect.left + mRect.width / 2, mRect.top + mRect.height / 2, "confetti", 30);
        } else {
          fireParticles(clientX, clientY, "stars", 40);
        }

        // Salto elástico enérgico de la mascota y evento global
        triggerMascotBounce(0.8, 1.45);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("mascot-action", { detail: { action: "jump" } }));
        }

        const newFed = fedCount + 1;
        setFedCount(newFed);

        if (newFed >= maxFeedGoal) {
          setIsGameCompleted(true);
          if (onSuccess) onSuccess();
        }
      } else {
        // 2. FALLO O SOLTADO FUERA: Snap-back elástico suave y tono suave
        playErrorSoft();
        triggerMascotBounce(1.15, 0.9);
      }
    },
    [isDragging, draggedItemId, snacks, targetSnack, fedCount, maxFeedGoal, triggerMascotBounce, onSuccess]
  );

  // Registro de listeners globales de puntero para evitar que el arrastre se corte al salir del elemento
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handlePointerMove, { passive: false });
      window.addEventListener("mouseup", handlePointerEnd);
      window.addEventListener("touchmove", handlePointerMove, { passive: false });
      window.addEventListener("touchend", handlePointerEnd);
      window.addEventListener("touchcancel", handlePointerEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerEnd);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerEnd);
      window.removeEventListener("touchcancel", handlePointerEnd);
    };
  }, [isDragging, handlePointerMove, handlePointerEnd]);

  return (
    <div className="relative w-full max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-2xl border-2 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center select-none overflow-hidden touch-none">
      {/* Resplandores ambientales decorativos */}
      <div className="absolute -top-20 -left-20 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER DEL JUEGO CON MARCADOR DE APETITO */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
          <Utensils className="w-4 h-4" />
          <span className="text-xs font-black tracking-wider uppercase">Dino Snack Time!</span>
        </div>

        {/* Marcador de Corazones/Apetito */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300">
          {[...Array(maxFeedGoal)].map((_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 transition-all duration-300 ${
                i < fedCount ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-600 fill-slate-800"
              }`}
            />
          ))}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs transition cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* ZONA DE LA BOCA / HITBOX DE LA MASCOTA */}
      <div className="relative flex flex-col items-center my-2 z-10">
        <div
          ref={mouthZoneRef}
          className={`
            relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center
            transition-all duration-200 border-4
            ${
              isMouthHovered
                ? "bg-amber-400/30 border-amber-300 scale-110 shadow-[0_0_35px_rgba(251,191,36,0.6)] animate-pulse"
                : "bg-slate-800/60 border-emerald-400/40 shadow-inner"
            }
          `}
        >
          {/* Mascota con físicas de resorte anclada */}
          <div
            ref={mascotRef}
            onClick={() => {
              triggerMascotBounce(1.3, 0.7);
              playJumpSound();
            }}
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer will-change-transform"
          >
            <span className="text-6xl sm:text-7xl filter drop-shadow-xl select-none">
              {mascotEmoji}
            </span>
            {isMouthHovered && (
              <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow">
                ¡ÑAM ÑAM!
              </span>
            )}
          </div>
        </div>

        <p className="text-xs font-black text-slate-300 mt-2">
          Feed <span className="text-amber-300">{mascotName}</span>:
        </p>
      </div>

      {/* PALABRA OBJETIVO EN INGLÉS */}
      <div className="text-center z-10 my-3">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400">
            {targetSnack.englishWord}
          </h3>
          <button
            onClick={handlePronounceTarget}
            className="w-8 h-8 rounded-full bg-amber-400/20 hover:bg-amber-400/40 border border-amber-400/50 text-amber-300 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">
          {targetSnack.spanishMeaning} • <span className="font-mono text-amber-300/80">{targetSnack.phonetic}</span>
        </p>
      </div>

      {/* BANDEJA DE SNACKS PARA ARRASTRAR (DRAG & DROP) */}
      <div className="w-full mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-around gap-3 z-10">
        {snacks.map((snack) => {
          const isBeingDragged = draggedItemId === snack.id;

          return (
            <div
              key={snack.id}
              onMouseDown={(e) => handlePointerStart(e, snack)}
              onTouchStart={(e) => handlePointerStart(e, snack)}
              className={`
                relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl
                bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700
                shadow-lg hover:border-amber-400/60 cursor-grab active:cursor-grabbing
                transform transition-transform select-none touch-none
                ${isBeingDragged ? "opacity-30 scale-90" : "hover:scale-105 active:scale-95"}
              `}
            >
              <span className="text-4xl sm:text-5xl filter drop-shadow mb-1">
                {snack.emoji}
              </span>
              <span className="text-xs font-black text-white">
                {snack.englishWord}
              </span>
            </div>
          );
        })}
      </div>

      {/* ELEMENTO FLOTANTE CLONADO QUE SIGUE EL DEDO/PUNTERO */}
      {isDragging && draggedItemId && (
        <div
          ref={activeDragElementRef}
          style={{
            position: "fixed",
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
            transform: "translate(-50%, -50%) scale(1.18)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
          className="flex flex-col items-center justify-center p-4 rounded-3xl bg-amber-400/90 text-slate-950 shadow-2xl border-4 border-white backdrop-blur-md animate-pulse"
        >
          <span className="text-5xl filter drop-shadow-md">
            {snacks.find((s) => s.id === draggedItemId)?.emoji}
          </span>
          <span className="text-xs font-black uppercase mt-1 tracking-tight">
            {snacks.find((s) => s.id === draggedItemId)?.englishWord}
          </span>
        </div>
      )}

      {/* FOOTER CON BOTÓN DE CONTINUAR O REINICIAR */}
      <div className="w-full mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between z-10">
        <p className="text-[11px] font-bold text-slate-400">
          💡 ¡Arrastra el snack correcto a la boca de {mascotName}!
        </p>

        {isGameCompleted && onNext ? (
          <button
            onClick={onNext}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_4px_0_#065f46] hover:brightness-110 active:translate-y-0.5 transition flex items-center gap-1.5 animate-bounce cursor-pointer"
          >
            <span>Next Level</span>
            <Award className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              setFedCount(0);
              setIsGameCompleted(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
