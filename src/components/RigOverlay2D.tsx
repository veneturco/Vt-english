import React from "react";
import { MascotGestureEmotion } from "./Avatar2DCanvas";

export interface RigOverlay2DProps {
  cropIndex?: number;
  mouthX?: number; // 0 to 100%
  mouthY?: number; // 0 to 100%
  mouthScale?: number; // 0.5 to 2.0
  mouthType?:
    | "bird_beak"
    | "long_beak"
    | "feline_snout"
    | "bear_snout"
    | "monkey_mouth"
    | "tamandua_snout"
    | "turtle_mouth"
    | "reptile_mouth";
  eyeLX?: number;
  eyeLY?: number;
  eyeRX?: number;
  eyeRY?: number;
  mouthOpenAmount: number; // 0 to 1
  visemeIndex: number; // 0 to 4
  isBlinking: boolean;
  emotion: MascotGestureEmotion;
  pupilX?: number;
  pupilY?: number;
}

interface DefaultLandmarks {
  mouthX: number;
  mouthY: number;
  mouthScale: number;
  mouthType: "bird_beak" | "long_beak" | "feline_snout" | "bear_snout" | "monkey_mouth" | "tamandua_snout" | "turtle_mouth" | "reptile_mouth";
  eyeLX: number;
  eyeLY: number;
  eyeRX: number;
  eyeRY: number;
}

const DEFAULT_LANDMARKS: Record<number, DefaultLandmarks> = {
  0: { mouthX: 52, mouthY: 62, mouthScale: 0.9, mouthType: "long_beak", eyeLX: 38, eyeLY: 42, eyeRX: 62, eyeRY: 42 },
  1: { mouthX: 50, mouthY: 66, mouthScale: 1.1, mouthType: "bear_snout", eyeLX: 34, eyeLY: 44, eyeRX: 66, eyeRY: 44 },
  2: { mouthX: 49, mouthY: 62, mouthScale: 1.0, mouthType: "monkey_mouth", eyeLX: 36, eyeLY: 42, eyeRX: 62, eyeRY: 42 },
  3: { mouthX: 51, mouthY: 58, mouthScale: 1.0, mouthType: "bird_beak", eyeLX: 35, eyeLY: 43, eyeRX: 65, eyeRY: 43 },
  4: { mouthX: 50, mouthY: 64, mouthScale: 1.1, mouthType: "feline_snout", eyeLX: 34, eyeLY: 44, eyeRX: 66, eyeRY: 44 },
  5: { mouthX: 52, mouthY: 68, mouthScale: 1.0, mouthType: "tamandua_snout", eyeLX: 37, eyeLY: 44, eyeRX: 63, eyeRY: 44 },
  6: { mouthX: 50, mouthY: 64, mouthScale: 1.0, mouthType: "turtle_mouth", eyeLX: 36, eyeLY: 44, eyeRX: 64, eyeRY: 44 },
  7: { mouthX: 50, mouthY: 59, mouthScale: 1.0, mouthType: "bird_beak", eyeLX: 36, eyeLY: 43, eyeRX: 64, eyeRY: 43 },
  8: { mouthX: 50, mouthY: 64, mouthScale: 1.05, mouthType: "monkey_mouth", eyeLX: 35, eyeLY: 43, eyeRX: 65, eyeRY: 43 },
  9: { mouthX: 52, mouthY: 65, mouthScale: 1.0, mouthType: "reptile_mouth", eyeLX: 34, eyeLY: 43, eyeRX: 66, eyeRY: 43 },
};

export const RigOverlay2D: React.FC<RigOverlay2DProps> = ({
  cropIndex = 3,
  mouthX,
  mouthY,
  mouthScale,
  mouthType,
  eyeLX,
  eyeLY,
  eyeRX,
  eyeRY,
  mouthOpenAmount = 0,
  visemeIndex = 0,
  isBlinking = false,
  emotion = "idle",
  pupilX = 0,
  pupilY = 0,
}) => {
  const fallback = DEFAULT_LANDMARKS[cropIndex] || DEFAULT_LANDMARKS[3];
  const activeMouthX = mouthX !== undefined ? mouthX : fallback.mouthX;
  const activeMouthY = mouthY !== undefined ? mouthY : fallback.mouthY;
  const activeMouthScale = mouthScale !== undefined ? mouthScale : fallback.mouthScale;
  const activeMouthType = mouthType || fallback.mouthType;
  const activeEyeLX = eyeLX !== undefined ? eyeLX : fallback.eyeLX;
  const activeEyeLY = eyeLY !== undefined ? eyeLY : fallback.eyeLY;
  const activeEyeRX = eyeRX !== undefined ? eyeRX : fallback.eyeRX;
  const activeEyeRY = eyeRY !== undefined ? eyeRY : fallback.eyeRY;

  const isHappy = emotion === "alegre" || emotion === "celebrating" || emotion === "encouraging";
  const isSurprised = emotion === "sorpresa";
  const isSpeaking = emotion === "speaking" || mouthOpenAmount > 0.04;

  // Mouth opening calculations
  const openH = Math.max(0, mouthOpenAmount * 34);
  const jawDrop = Math.max(0, mouthOpenAmount * 18);
  const isVisemeRound = visemeIndex === 2 || isSurprised; // 'OO' / 'OH'
  const isVisemeSmile = visemeIndex === 1 || isHappy; // 'EE' / 'AY'

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden rounded-3xl">
      {/* 1. Dynamic Eyelids & Eye Expressions */}
      {/* Left Eye */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-75"
        style={{
          left: `${activeEyeLX}%`,
          top: `${activeEyeLY}%`,
          width: "40px",
          height: "40px",
        }}
      >
        {isBlinking && (
          <div className="w-10 h-3 bg-slate-950/90 rounded-full border-t-2 border-amber-400/80 shadow-lg transform -rotate-2" />
        )}
        {!isBlinking && isHappy && (
          <div className="w-8 h-4 border-b-4 border-amber-300 rounded-full shadow-[0_2px_8px_rgba(245,158,11,0.6)]" />
        )}
        {!isBlinking && !isHappy && (
          <div
            className="w-3.5 h-3.5 rounded-full bg-white/90 shadow-[0_0_8px_#ffffff] transition-transform duration-100"
            style={{
              transform: `translate(${pupilX * 1.5}px, ${pupilY * 1.5}px)`,
            }}
          />
        )}
      </div>

      {/* Right Eye */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-75"
        style={{
          left: `${activeEyeRX}%`,
          top: `${activeEyeRY}%`,
          width: "40px",
          height: "40px",
        }}
      >
        {isBlinking && (
          <div className="w-10 h-3 bg-slate-950/90 rounded-full border-t-2 border-amber-400/80 shadow-lg transform rotate-2" />
        )}
        {!isBlinking && isHappy && (
          <div className="w-8 h-4 border-b-4 border-amber-300 rounded-full shadow-[0_2px_8px_rgba(245,158,11,0.6)]" />
        )}
        {!isBlinking && !isHappy && (
          <div
            className="w-3.5 h-3.5 rounded-full bg-white/90 shadow-[0_0_8px_#ffffff] transition-transform duration-100"
            style={{
              transform: `translate(${pupilX * 1.5}px, ${pupilY * 1.5}px)`,
            }}
          />
        )}
      </div>

      {/* 2. Articulated 2.5D Mouth / Jaw Layer */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-transform duration-75"
        style={{
          left: `${activeMouthX}%`,
          top: `${activeMouthY}%`,
          transform: `translate(-50%, -50%) scale(${activeMouthScale})`,
        }}
      >
        {/* BEAK RIG (Turpial, Guacharaca, Colibrí) */}
        {(activeMouthType === "bird_beak" || activeMouthType === "long_beak") && (
          <div className="relative flex flex-col items-center">
            {/* Upper Beak */}
            <div
              className={`rounded-t-full bg-gradient-to-b from-amber-400 via-orange-500 to-orange-600 border border-amber-200/60 shadow-md ${
                activeMouthType === "long_beak" ? "w-7 h-4" : "w-11 h-4"
              }`}
            />

            {/* Oral Cavity Opening when speaking */}
            {isSpeaking && (
              <div
                className="relative overflow-hidden bg-gradient-to-b from-rose-950 via-slate-950 to-red-950 border-x border-orange-700 shadow-inner flex items-center justify-center transition-all duration-75"
                style={{
                  width: isVisemeRound
                    ? `${activeMouthType === "long_beak" ? 8 : 14}px`
                    : isVisemeSmile
                    ? `${activeMouthType === "long_beak" ? 14 : 26}px`
                    : `${activeMouthType === "long_beak" ? 12 : 20}px`,
                  height: `${Math.max(4, openH * 0.7)}px`,
                  borderRadius: isVisemeRound ? "999px" : "4px",
                }}
              >
                {/* Moving Tongue */}
                <div
                  className="absolute bottom-0 w-3/4 rounded-t-full bg-gradient-to-t from-rose-600 to-pink-400 shadow-sm transition-all duration-75"
                  style={{
                    height: `${Math.max(2, openH * 0.4)}px`,
                  }}
                />
              </div>
            )}

            {/* Lower Beak (Drops with audio amplitude) */}
            <div
              className={`rounded-b-full bg-gradient-to-t from-orange-600 to-amber-500 border-b border-amber-300/60 shadow-lg transition-transform duration-75 ${
                activeMouthType === "long_beak" ? "w-6 h-5" : "w-10 h-4"
              }`}
              style={{
                transform: `translateY(${jawDrop * 0.6}px)`,
              }}
            />
          </div>
        )}

        {/* FELINE SNOUT & MOUTH RIG (Cunaguaro) */}
        {activeMouthType === "feline_snout" && (
          <div className="relative flex flex-col items-center">
            {/* Cute Pink Nose & Upper Whiskers Pad */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 rounded-full bg-gradient-to-b from-rose-400 to-rose-600 border border-rose-300 shadow-sm" />
            </div>

            {/* Speaking Mouth / Fangs / Tongue */}
            {isSpeaking ? (
              <div
                className="relative mt-0.5 overflow-hidden rounded-2xl bg-gradient-to-b from-rose-950 via-slate-950 to-red-950 border border-rose-900 shadow-inner flex flex-col items-center justify-between transition-all duration-75"
                style={{
                  width: isVisemeRound ? "18px" : isVisemeSmile ? "32px" : "24px",
                  height: `${Math.max(6, openH * 0.75)}px`,
                }}
              >
                {/* Tiny White Fangs */}
                <div className="flex justify-between w-full px-1 pt-0.5">
                  <div className="w-1.5 h-1.5 bg-white rounded-b-full shadow-xs" />
                  <div className="w-1.5 h-1.5 bg-white rounded-b-full shadow-xs" />
                </div>

                {/* Animated Pink Tongue */}
                <div
                  className="w-3/5 rounded-t-full bg-gradient-to-t from-rose-600 to-pink-400 shadow-sm transition-all duration-75"
                  style={{ height: `${Math.max(3, openH * 0.45)}px` }}
                />
              </div>
            ) : (
              /* Closed Happy Cat Smile */
              <div className="flex items-center -mt-0.5 text-slate-900">
                <span className="text-xs font-black tracking-tighter opacity-85">ω</span>
              </div>
            )}
          </div>
        )}

        {/* BEAR SNOUT & MOUTH RIG (Oso Frontino) */}
        {activeMouthType === "bear_snout" && (
          <div className="relative flex flex-col items-center">
            {/* Big Shiny Bear Nose */}
            <div className="w-7 h-5 rounded-2xl bg-gradient-to-b from-slate-900 to-black border border-slate-700 shadow-md flex items-center justify-center">
              <div className="w-2.5 h-1 rounded-full bg-white/40 -mt-1.5" />
            </div>

            {/* Speaking Jaw */}
            {isSpeaking ? (
              <div
                className="relative mt-0.5 overflow-hidden rounded-2xl bg-gradient-to-b from-red-950 via-black to-red-950 border border-slate-800 shadow-inner flex flex-col items-center justify-between transition-all duration-75"
                style={{
                  width: isVisemeRound ? "22px" : isVisemeSmile ? "36px" : "28px",
                  height: `${Math.max(8, openH * 0.8)}px`,
                }}
              >
                {/* Upper Teeth Row */}
                <div className="w-4/5 h-1 bg-white/90 rounded-b-sm shadow-xs" />

                {/* Animated Tongue */}
                <div
                  className="w-3/4 rounded-t-full bg-gradient-to-t from-rose-600 to-pink-400 shadow-sm transition-all duration-75"
                  style={{ height: `${Math.max(3, openH * 0.5)}px` }}
                />
              </div>
            ) : (
              <div className="w-5 h-1.5 bg-slate-950 rounded-full mt-0.5 opacity-80" />
            )}
          </div>
        )}

        {/* PRIMATE LIPS RIG (Monito Fresa, Mono Tech) */}
        {activeMouthType === "monkey_mouth" && (
          <div className="relative flex flex-col items-center">
            {isSpeaking ? (
              <div
                className="relative overflow-hidden rounded-full bg-gradient-to-b from-rose-950 via-slate-950 to-red-950 border-2 border-rose-900/80 shadow-lg flex flex-col items-center justify-between transition-all duration-75"
                style={{
                  width: isVisemeRound ? "18px" : isVisemeSmile ? "34px" : "26px",
                  height: `${Math.max(6, openH * 0.8)}px`,
                }}
              >
                <div className="w-3/4 h-1 bg-white rounded-b-sm shadow-xs" />
                <div
                  className="w-3/5 rounded-t-full bg-gradient-to-t from-rose-500 to-pink-300 shadow-sm transition-all duration-75"
                  style={{ height: `${Math.max(3, openH * 0.45)}px` }}
                />
              </div>
            ) : (
              <div className="w-8 h-2 rounded-full border-b-3 border-amber-950/70" />
            )}
          </div>
        )}

        {/* TAMANDUA / OSO MELERO SNOUT */}
        {activeMouthType === "tamandua_snout" && (
          <div className="relative flex flex-col items-center">
            <div className="w-5 h-4 rounded-full bg-slate-900 border border-slate-700 shadow-xs" />
            {isSpeaking && (
              <div
                className="w-2.5 bg-gradient-to-b from-rose-600 to-pink-400 rounded-full shadow-sm transition-all duration-75"
                style={{ height: `${Math.max(4, openH * 0.7)}px` }}
              />
            )}
          </div>
        )}

        {/* TURTLE / MORROCOY MOUTH */}
        {activeMouthType === "turtle_mouth" && (
          <div className="relative flex flex-col items-center">
            {isSpeaking ? (
              <div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-950 via-slate-950 to-red-950 border border-emerald-800 shadow-inner flex flex-col items-center justify-end transition-all duration-75"
                style={{
                  width: isVisemeRound ? "16px" : isVisemeSmile ? "28px" : "22px",
                  height: `${Math.max(5, openH * 0.7)}px`,
                }}
              >
                <div
                  className="w-3/4 rounded-t-full bg-gradient-to-t from-rose-500 to-pink-300 shadow-sm"
                  style={{ height: `${Math.max(2, openH * 0.4)}px` }}
                />
              </div>
            ) : (
              <div className="w-7 h-2 rounded-full border-b-2 border-emerald-900" />
            )}
          </div>
        )}

        {/* REPTILE / IGUANA MOUTH */}
        {activeMouthType === "reptile_mouth" && (
          <div className="relative flex flex-col items-center">
            {isSpeaking ? (
              <div
                className="relative overflow-hidden rounded-xl bg-gradient-to-b from-cyan-950 via-slate-950 to-red-950 border border-teal-800 shadow-inner flex flex-col items-center justify-end transition-all duration-75"
                style={{
                  width: isVisemeRound ? "16px" : isVisemeSmile ? "32px" : "24px",
                  height: `${Math.max(5, openH * 0.7)}px`,
                }}
              >
                <div
                  className="w-2.5 bg-gradient-to-t from-rose-600 to-pink-400 rounded-t-full shadow-sm"
                  style={{ height: `${Math.max(3, openH * 0.5)}px` }}
                />
              </div>
            ) : (
              <div className="w-9 h-1.5 rounded-full border-b-2 border-teal-950/80" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
