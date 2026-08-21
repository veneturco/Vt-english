import React, { useMemo } from "react";
import { AvatarConfig } from "../types";
import { MascotGestureEmotion } from "./Avatar2DCanvas";

interface Live2DHDMascotRigProps {
  config: AvatarConfig;
  emotion: MascotGestureEmotion;
  mouthOpenAmount: number; // 0 to 1
  isBlinking: boolean;
  isListening: boolean;
  mousePos: { x: number; y: number };
  visemeIndex: number;
}

interface AnatomicalAnchor {
  mouthX: number; // % (0-100)
  mouthY: number; // % (0-100)
  mouthWidth: number; // px
  mouthHeight: number; // px
  mouthType: "beak" | "feline" | "bear" | "primate" | "turtle" | "tamandua" | "reptile";
  leftEyeX: number; // %
  leftEyeY: number; // %
  rightEyeX: number; // %
  rightEyeY: number; // %
  eyeRadius: number; // px
  skinTone: string;
  snoutColor: string;
}

const CROP_ANCHORS: Record<number, AnatomicalAnchor> = {
  // 0: Colibrí Esmeralda
  0: {
    mouthX: 52,
    mouthY: 54,
    mouthWidth: 32,
    mouthHeight: 28,
    mouthType: "beak",
    leftEyeX: 38,
    leftEyeY: 37,
    rightEyeX: 62,
    rightEyeY: 37,
    eyeRadius: 9,
    skinTone: "#059669",
    snoutColor: "#0f172a",
  },
  // 1: Oso Frontino
  1: {
    mouthX: 50,
    mouthY: 58,
    mouthWidth: 46,
    mouthHeight: 34,
    mouthType: "bear",
    leftEyeX: 36,
    leftEyeY: 36,
    rightEyeX: 64,
    rightEyeY: 36,
    eyeRadius: 11,
    skinTone: "#292524",
    snoutColor: "#fef3c7",
  },
  // 2: Monito Fresa
  2: {
    mouthX: 50,
    mouthY: 56,
    mouthWidth: 42,
    mouthHeight: 32,
    mouthType: "primate",
    leftEyeX: 37,
    leftEyeY: 36,
    rightEyeX: 63,
    rightEyeY: 36,
    eyeRadius: 10,
    skinTone: "#7c2d12",
    snoutColor: "#fed7aa",
  },
  // 3: Turpial BET
  3: {
    mouthX: 50,
    mouthY: 56,
    mouthWidth: 38,
    mouthHeight: 32,
    mouthType: "beak",
    leftEyeX: 36,
    leftEyeY: 36,
    rightEyeX: 64,
    rightEyeY: 36,
    eyeRadius: 10,
    skinTone: "#18181b",
    snoutColor: "#f97316",
  },
  // 4: Cunaguaro BET
  4: {
    mouthX: 50,
    mouthY: 57,
    mouthWidth: 44,
    mouthHeight: 32,
    mouthType: "feline",
    leftEyeX: 36,
    leftEyeY: 37,
    rightEyeX: 64,
    rightEyeY: 37,
    eyeRadius: 11,
    skinTone: "#f59e0b",
    snoutColor: "#fffbeb",
  },
  // 5: Oso Melero
  5: {
    mouthX: 51,
    mouthY: 58,
    mouthWidth: 36,
    mouthHeight: 28,
    mouthType: "tamandua",
    leftEyeX: 37,
    leftEyeY: 36,
    rightEyeX: 63,
    rightEyeY: 36,
    eyeRadius: 9,
    skinTone: "#d6d3d1",
    snoutColor: "#57534e",
  },
  // 6: Morrocoy BET
  6: {
    mouthX: 50,
    mouthY: 57,
    mouthWidth: 40,
    mouthHeight: 30,
    mouthType: "turtle",
    leftEyeX: 36,
    leftEyeY: 36,
    rightEyeX: 64,
    rightEyeY: 36,
    eyeRadius: 10,
    skinTone: "#4ade80",
    snoutColor: "#15803d",
  },
  // 7: Guacharaca / Pajarito Lector
  7: {
    mouthX: 50,
    mouthY: 55,
    mouthWidth: 36,
    mouthHeight: 30,
    mouthType: "beak",
    leftEyeX: 36,
    leftEyeY: 35,
    rightEyeX: 64,
    rightEyeY: 35,
    eyeRadius: 10,
    skinTone: "#78350f",
    snoutColor: "#f59e0b",
  },
  // 8: Mono Tech
  8: {
    mouthX: 50,
    mouthY: 56,
    mouthWidth: 42,
    mouthHeight: 32,
    mouthType: "primate",
    leftEyeX: 36,
    leftEyeY: 36,
    rightEyeX: 64,
    rightEyeY: 36,
    eyeRadius: 10,
    skinTone: "#451a03",
    snoutColor: "#ffedd5",
  },
  // 9: Iguana Bandera
  9: {
    mouthX: 50,
    mouthY: 57,
    mouthWidth: 42,
    mouthHeight: 30,
    mouthType: "reptile",
    leftEyeX: 36,
    leftEyeY: 36,
    rightEyeX: 64,
    rightEyeY: 36,
    eyeRadius: 10,
    skinTone: "#0d9488",
    snoutColor: "#0284c7",
  },
};

export const Live2DHDMascotRig: React.FC<Live2DHDMascotRigProps> = ({
  config,
  emotion,
  mouthOpenAmount,
  isBlinking,
  isListening,
  mousePos,
  visemeIndex,
}) => {
  const isHappy = emotion === "alegre" || emotion === "celebrating" || emotion === "encouraging";
  const isThinking = emotion === "pensativo";
  const isSurprised = emotion === "sorpresa";
  const isSpeaking = emotion === "speaking" || mouthOpenAmount > 0.04;

  // Selected crop index or default to 3 (Turpial)
  const cropIdx = config.spriteCropIndex !== undefined ? config.spriteCropIndex : 3;
  const anchor = CROP_ANCHORS[cropIdx] || CROP_ANCHORS[3];

  // Dynamic calculations for jaw drop and mouth modulation
  const dynamicDrop = mouthOpenAmount * 20; // Jaw drops down to 20px
  const dynamicWidth = anchor.mouthWidth * (1 + (visemeIndex === 1 ? 0.2 : -0.1 * mouthOpenAmount));
  const dynamicHeight = Math.max(4, anchor.mouthHeight * mouthOpenAmount * 1.3);

  // Subtle 3D perspective rotation based on mouse and speech bounce
  const headRotateX = -mousePos.y * 10 + (isSpeaking ? Math.sin(Date.now() / 150) * 3 : 0);
  const headRotateY = mousePos.x * 12;
  const headTiltZ = isThinking ? 4 : isHappy ? -3 : 0;

  return (
    <div
      className="relative w-full h-full pointer-events-none select-none"
      style={{
        transform: `perspective(700px) rotateX(${headRotateX}deg) rotateY(${headRotateY}deg) rotateZ(${headTiltZ}deg)`,
        transformOrigin: "center center",
        transition: "transform 0.1s ease-out",
      }}
    >
      {/* 1. LAYER: 3D SHADOW & AMBIENT OCCLUSION BENEATH JAW */}
      {isSpeaking && (
        <div
          className="absolute rounded-full pointer-events-none blur-md bg-black/60 transition-all duration-75"
          style={{
            left: `${anchor.mouthX}%`,
            top: `${anchor.mouthY + 6}%`,
            transform: "translate(-50%, -50%)",
            width: `${dynamicWidth * 1.3}px`,
            height: `${dynamicHeight * 0.9 + 8}px`,
          }}
        />
      )}

      {/* 2. LAYER: ARTICULATED ORAL CAVITY & INNER MOUTH */}
      {isSpeaking && (
        <div
          className="absolute rounded-full overflow-hidden transition-all duration-75 border border-red-950/80 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]"
          style={{
            left: `${anchor.mouthX}%`,
            top: `${anchor.mouthY}%`,
            transform: `translate(-50%, -50%) translateY(${dynamicDrop * 0.3}px)`,
            width: `${dynamicWidth}px`,
            height: `${dynamicHeight}px`,
            background: "radial-gradient(ellipse at center, #831843 0%, #4c0519 50%, #1f0408 100%)",
          }}
        >
          {/* Upper Teeth / Beak Ridge */}
          {anchor.mouthType !== "beak" ? (
            <div className="absolute top-0 inset-x-2 h-2 rounded-b-md bg-gradient-to-b from-white via-slate-100 to-slate-300 shadow-sm flex justify-center gap-0.5 opacity-95">
              {anchor.mouthType === "feline" && (
                <>
                  <span className="w-1.5 h-3 bg-white rounded-b-full shadow-sm -mt-0.5" />
                  <span className="flex-1" />
                  <span className="w-1.5 h-3 bg-white rounded-b-full shadow-sm -mt-0.5" />
                </>
              )}
            </div>
          ) : (
            /* Bird Upper Beak Tomium Ridge */
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-b from-amber-400 to-orange-600 shadow-sm" />
          )}

          {/* Articulated Bouncing Tongue */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full bg-gradient-to-t from-rose-600 via-rose-500 to-pink-400 shadow-[0_-2px_6px_rgba(244,63,94,0.6)] transition-all duration-75"
            style={{
              width: `${dynamicWidth * 0.65}px`,
              height: `${Math.max(4, dynamicHeight * 0.65)}px`,
              transform: `translateX(-50%) translateY(${Math.sin(Date.now() / 90) * 2}px)`,
            }}
          >
            {/* Tongue midline furrow */}
            <div className="w-0.5 h-full bg-rose-700/50 mx-auto rounded-full" />
          </div>

          {/* Lower Teeth */}
          {anchor.mouthType !== "beak" && dynamicHeight > 16 && (
            <div className="absolute bottom-0 inset-x-3 h-1.5 rounded-t-md bg-white/90 shadow-sm" />
          )}
        </div>
      )}

      {/* 3. LAYER: ARTICULATED LOWER JAW / SNOUT / BEAK OVERLAY */}
      {anchor.mouthType === "beak" ? (
        /* Beak Lower Mandible Morph */
        <div
          className="absolute transition-transform duration-75 origin-top"
          style={{
            left: `${anchor.mouthX}%`,
            top: `${anchor.mouthY}%`,
            transform: `translate(-50%, -10%) translateY(${isSpeaking ? dynamicDrop : 0}px) ${
              isHappy ? "scaleY(0.9)" : ""
            }`,
          }}
        >
          <svg width={anchor.mouthWidth + 10} height={anchor.mouthHeight + 10} viewBox="0 0 60 40">
            <path
              d="M 10 5 Q 30 35 50 5 Q 30 18 10 5 Z"
              fill={anchor.snoutColor}
              stroke="#9a3412"
              strokeWidth="2"
            />
            {/* Beak highlight specular */}
            <path d="M 18 8 Q 30 22 42 8" stroke="#fed7aa" strokeWidth="1.5" fill="none" opacity="0.7" />
          </svg>
        </div>
      ) : (
        /* Mammal / Reptile Lower Lip & Chin Drop */
        isSpeaking && (
          <div
            className="absolute rounded-full transition-transform duration-75 shadow-md border-t border-black/20"
            style={{
              left: `${anchor.mouthX}%`,
              top: `${anchor.mouthY + 2}%`,
              transform: `translate(-50%, 0%) translateY(${dynamicDrop}px)`,
              width: `${anchor.mouthWidth * 0.85}px`,
              height: `${Math.max(6, 8 + dynamicDrop * 0.4)}px`,
              background: `linear-gradient(to bottom, ${anchor.snoutColor}, ${anchor.skinTone})`,
            }}
          />
        )
      )}

      {/* 4. LAYER: 3D PHOTOREALISTIC EYELIDS / BLINK & EMOTIONS */}
      {/* Left Eye Eyelid */}
      <div
        className="absolute transition-all duration-100 overflow-hidden pointer-events-none"
        style={{
          left: `${anchor.leftEyeX}%`,
          top: `${anchor.leftEyeY}%`,
          transform: "translate(-50%, -50%)",
          width: `${anchor.eyeRadius * 2.4}px`,
          height: isBlinking ? `${anchor.eyeRadius * 2.4}px` : isHappy ? `${anchor.eyeRadius * 1.3}px` : "0px",
          maxHeight: `${anchor.eyeRadius * 2.4}px`,
        }}
      >
        <div
          className="w-full h-full rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.6)] border-b border-black/30"
          style={{
            background: `linear-gradient(to bottom, ${anchor.skinTone} 0%, ${anchor.snoutColor} 100%)`,
          }}
        />
      </div>

      {/* Right Eye Eyelid */}
      <div
        className="absolute transition-all duration-100 overflow-hidden pointer-events-none"
        style={{
          left: `${anchor.rightEyeX}%`,
          top: `${anchor.rightEyeY}%`,
          transform: "translate(-50%, -50%)",
          width: `${anchor.eyeRadius * 2.4}px`,
          height: isBlinking ? `${anchor.eyeRadius * 2.4}px` : isHappy ? `${anchor.eyeRadius * 1.3}px` : "0px",
          maxHeight: `${anchor.eyeRadius * 2.4}px`,
        }}
      >
        <div
          className="w-full h-full rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.6)] border-b border-black/30"
          style={{
            background: `linear-gradient(to bottom, ${anchor.skinTone} 0%, ${anchor.snoutColor} 100%)`,
          }}
        />
      </div>

      {/* 5. LAYER: SPECULAR EYE CATCHLIGHT REFLECTIONS */}
      <div
        className="absolute w-2 h-2 rounded-full bg-white/90 shadow-[0_0_6px_#fff] pointer-events-none transition-transform duration-100"
        style={{
          left: `${anchor.leftEyeX - 2}%`,
          top: `${anchor.leftEyeY - 2}%`,
          transform: `translate(${mousePos.x * 3}px, ${mousePos.y * 3}px)`,
        }}
      />
      <div
        className="absolute w-2 h-2 rounded-full bg-white/90 shadow-[0_0_6px_#fff] pointer-events-none transition-transform duration-100"
        style={{
          left: `${anchor.rightEyeX - 2}%`,
          top: `${anchor.rightEyeY - 2}%`,
          transform: `translate(${mousePos.x * 3}px, ${mousePos.y * 3}px)`,
        }}
      />
    </div>
  );
};
