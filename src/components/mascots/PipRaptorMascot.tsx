import React, { useEffect } from "react";
import { MascotRenderProps } from "./types";
import { useSpringAnimation } from "../../utils/useSpringAnimation";
import { fireParticles } from "../../utils/particleHelper";
import { playJumpSound } from "../../utils/audioSynth";

export const PipRaptorMascot: React.FC<MascotRenderProps> = ({
  isSpeaking,
  isBlinking,
  isHappy,
  isSurprised,
  isThinking,
  pupilX,
  pupilY,
  mouthOpenAmount,
  mouthH,
  isVisemeRound,
  accessory,
  renderAccessoryOverlay,
  className = "",
  onClick,
}) => {
  // Motor de físicas de resorte (Hooke's Law) con aceleración por GPU
  const { ref: svgRef, triggerBounce } = useSpringAnimation<SVGSVGElement>({
    tension: 190, // Rigidez del resorte
    friction: 11, // Amortiguamiento
    mass: 0.9,    // Inercia liviana para Pip
  });

  // Reacción procedural de resorte al celebrar o sorprenderse
  useEffect(() => {
    if (isHappy) {
      // Squash previo al salto y estiramiento vertical (Squash & Stretch)
      triggerBounce(0.88, 1.22);
    } else if (isSurprised) {
      // Estiramiento vertical instantáneo por sobresalto
      triggerBounce(0.92, 1.18);
    }
  }, [isHappy, isSurprised, triggerBounce]);

  // Manejador de interacción total: Físicas de Resorte + Partículas + Audio Procedural
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // 1. Físicas de Resorte: Squash (1.25) & Stretch (0.72)
    triggerBounce(1.25, 0.72);

    // 2. Motor de Partículas: Ráfaga de estrellas en el punto de contacto
    fireParticles(e.clientX, e.clientY, "stars", 35);

    // 3. Audio Procedural: Sonido de salto retro elástico
    playJumpSound();

    if (onClick) onClick(e);
  };

  return (
    <svg
      ref={svgRef}
      onClick={handleClick}
      viewBox="0 0 340 380"
      className={`w-56 h-64 sm:w-64 sm:h-72 max-w-full max-h-full will-change-transform origin-bottom cursor-pointer drop-shadow-2xl filter drop-shadow-[-2px_-2px_14px_rgba(74,222,128,0.25)] drop-shadow-[2px_2px_16px_rgba(168,85,247,0.25)] ${className}`}
    >
      {/* Ground Contact Shadow */}
      <ellipse cx="170" cy="342" rx="90" ry="15" fill="#090d16" opacity="0.65" />

      {/* 1. Curving Upward Raptor Tail */}
      <g id="raptorTail">
        <path
          d="M 125 250 C 95 240 70 185 75 140 C 80 130 90 135 90 150 C 90 185 105 235 145 255 Z"
          fill="#4ade80"
          stroke="#0f172a"
          strokeWidth="2.8"
        />
        {/* Tail Cream Underside */}
        <path
          d="M 125 252 C 100 244 82 205 85 160 C 88 150 92 155 92 165 C 92 195 105 238 135 254 Z"
          fill="#fef3c7"
          stroke="#0f172a"
          strokeWidth="1.8"
        />
        {/* Tail Spots */}
        <circle cx="88" cy="180" r="3.5" fill="#15803d" opacity="0.6" />
        <circle cx="96" cy="205" r="4.2" fill="#15803d" opacity="0.6" />
        <circle cx="108" cy="230" r="4.5" fill="#15803d" opacity="0.6" />
      </g>

      {/* 2. Hind Legs & Raptor Talons */}
      <g id="raptorLegs">
        {/* Left Leg */}
        <ellipse cx="135" cy="292" rx="18" ry="22" fill="#22c55e" stroke="#0f172a" strokeWidth="2.5" />
        <g>
          <path d="M 124 306 Q 118 318 124 322 Q 130 318 130 308 Z" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.2" />
          <path d="M 132 308 Q 130 322 136 325 Q 140 320 138 310 Z" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.2" />
          <path d="M 140 306 Q 142 320 148 322 Q 148 316 144 308 Z" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.2" />
        </g>

        {/* Right Leg */}
        <ellipse cx="180" cy="296" rx="20" ry="24" fill="#4ade80" stroke="#0f172a" strokeWidth="2.8" />
        <path d="M 166 298 C 166 318 194 320 198 304 Z" fill="#22c55e" />
        <g>
          <path d="M 166 312 Q 160 324 168 328 Q 174 324 174 314 Z" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.4" />
          <path d="M 176 314 Q 175 330 182 333 Q 188 326 184 316 Z" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.4" />
          <path d="M 186 312 Q 190 326 198 328 Q 198 320 192 314 Z" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.4" />
        </g>
      </g>

      {/* 3. Colorful School Backpack (held on right) */}
      <g
        id="raptorBackpack"
        style={{
          transform: isSpeaking ? `rotate(${Math.sin(Date.now() / 140) * 3}deg)` : "none",
          transformOrigin: "216px 198px",
        }}
      >
        <ellipse cx="236" cy="310" rx="24" ry="8" fill="#090d16" opacity="0.35" />

        {/* Red Handle Loop */}
        <path
          d="M 216 195 C 214 172 236 172 238 195"
          fill="none"
          stroke="#ef4444"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Purple Side Pouch */}
        <rect x="206" y="200" width="18" height="74" rx="9" fill="#9333ea" stroke="#0f172a" strokeWidth="2.2" />
        <polygon
          points="215,248 217,253 222,253 218,256 220,261 215,258 210,261 212,256 208,253 213,253"
          fill="#4ade80"
          stroke="#0f172a"
          strokeWidth="0.8"
        />

        {/* Blue Main Body */}
        <path
          d="M 216 196 C 220 184 256 184 260 196 L 262 268 C 262 276 216 276 216 268 Z"
          fill="#0284c7"
          stroke="#0f172a"
          strokeWidth="2.6"
        />

        {/* Yellow Star Emblem */}
        <polygon
          points="239,206 242,216 252,216 244,222 247,232 239,226 231,232 234,222 226,216 236,216"
          fill="#facc15"
          stroke="#0f172a"
          strokeWidth="1.8"
        />

        {/* Yellow Top Zipper Band */}
        <path
          d="M 224 238 C 224 230 256 230 256 238 L 258 248 L 222 248 Z"
          fill="#facc15"
          stroke="#0f172a"
          strokeWidth="1.8"
        />

        {/* Red Front Pocket */}
        <rect x="222" y="246" width="36" height="28" rx="6" fill="#ef4444" stroke="#0f172a" strokeWidth="2.2" />
        {/* Cyan Stitched Patch */}
        <rect x="240" y="254" width="14" height="14" rx="3" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="239" y="253" width="16" height="16" rx="3.5" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="2 1.5" />
      </g>

      {/* 4. Raptor Torso & Segmented Cream Belly */}
      <g id="raptorTorso">
        <path
          d="M 126 195 C 105 230 114 286 156 290 C 196 294 212 255 204 204 C 188 185 140 185 126 195 Z"
          fill="#4ade80"
          stroke="#0f172a"
          strokeWidth="3"
        />
        {/* Scales on flank */}
        <circle cx="130" cy="235" r="4.5" fill="#15803d" opacity="0.6" />
        <circle cx="136" cy="248" r="5" fill="#15803d" opacity="0.6" />
        <circle cx="140" cy="262" r="4" fill="#15803d" opacity="0.6" />

        {/* Cream Belly */}
        <path
          d="M 145 204 C 138 232 144 276 166 278 C 188 278 196 250 192 215 C 178 202 155 202 145 204 Z"
          fill="#fef3c7"
          stroke="#0f172a"
          strokeWidth="2.2"
        />
        <path d="M 148 226 Q 168 234 188 228" stroke="#d97706" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M 150 244 Q 168 252 186 246" stroke="#d97706" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M 154 262 Q 168 268 180 264" stroke="#d97706" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>

      {/* 5. Raptor Arms */}
      <g id="raptorArms">
        {/* Left Arm on Belly */}
        <path d="M 152 212 Q 146 226 156 232 Q 164 228 162 216 Z" fill="#4ade80" stroke="#0f172a" strokeWidth="2" />
        <circle cx="148" cy="226" r="2" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />
        <circle cx="152" cy="231" r="2" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />
        <circle cx="157" cy="232" r="2" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />

        {/* Right Arm Holding Backpack Strap */}
        <path d="M 188 208 Q 206 200 220 192 Q 224 200 216 208 Q 200 216 188 214 Z" fill="#4ade80" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="216" cy="188" r="2.5" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />
        <circle cx="221" cy="190" r="2.5" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />
        <circle cx="222" cy="195" r="2.5" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />
      </g>

      {/* 6. Purple Bandana with White Star Prints */}
      <g id="raptorBandana">
        <path
          d="M 132 178 C 146 192 188 192 198 180 C 196 208 170 236 152 238 C 140 218 130 195 132 178 Z"
          fill="#9333ea"
          stroke="#0f172a"
          strokeWidth="2.6"
        />
        {/* Side Knot */}
        <circle cx="132" cy="184" r="6" fill="#a855f7" stroke="#0f172a" strokeWidth="2" />
        <path d="M 128 186 Q 118 178 122 172 Q 130 178 130 184 Z" fill="#9333ea" stroke="#0f172a" strokeWidth="1.8" />
        <path d="M 128 188 Q 116 195 120 202 Q 128 195 130 188 Z" fill="#9333ea" stroke="#0f172a" strokeWidth="1.8" />

        {/* White Star Prints */}
        <polygon points="152,192 153.5,196.5 158,196.5 154.5,199.5 156,204 152,201 148,204 149.5,199.5 146,196.5 150.5,196.5" fill="#ffffff" />
        <polygon points="168,202 169.5,206 174,206 170.5,208.5 172,213 168,210 164,213 165.5,208.5 162,206 166.5,206" fill="#ffffff" />
        <polygon points="158,216 159.2,219.5 163,219.5 160,221.5 161.5,225 158,223 154.5,225 156,221.5 153,219.5 156.8,219.5" fill="#ffffff" />
      </g>

      {/* 7. Rounded Raptor Head & Scale Clusters */}
      <g id="raptorHead">
        <path
          d="M 142 86 C 114 74 130 115 132 142 C 132 165 150 178 180 178 C 218 178 238 152 236 118 C 234 82 185 70 160 74 C 150 76 144 82 142 86 Z"
          fill="#4ade80"
          stroke="#0f172a"
          strokeWidth="3"
        />

        {/* Scale Clusters */}
        <g opacity="0.7">
          <circle cx="188" cy="85" r="4" fill="#15803d" />
          <circle cx="198" cy="88" r="5" fill="#15803d" />
          <circle cx="208" cy="94" r="4.2" fill="#15803d" />
          <circle cx="218" cy="102" r="3.8" fill="#15803d" />
          <circle cx="192" cy="95" r="3.5" fill="#15803d" />
          <circle cx="202" cy="99" r="3.8" fill="#15803d" />
          <circle cx="212" cy="108" r="3.5" fill="#15803d" />
          <circle cx="180" cy="92" r="3" fill="#15803d" />
        </g>

        <ellipse cx="224" cy="116" rx="3.5" ry="5" fill="#0f172a" />
        <ellipse cx="152" cy="148" rx="14" ry="10" fill="#f43f5e" opacity="0.35" />
      </g>

      {/* 8. Big Sparkling Golden Amber Eye */}
      {isBlinking && !isSurprised ? (
        <g id="raptorBlinkEye">
          <path d="M 152 108 Q 170 120 188 108" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      ) : isHappy ? (
        <g id="raptorHappyEye">
          <path d="M 150 112 Q 170 90 190 112" stroke="#0f172a" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        <g id="raptorEye">
          <ellipse cx="172" cy="106" rx="18" ry="21" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          {/* Golden Amber Iris */}
          <circle
            cx={172 + (isThinking ? 3 : pupilX)}
            cy={106 + (isThinking ? -3 : pupilY)}
            r="14"
            fill="#eab308"
          />
          <circle
            cx={172 + (isThinking ? 3 : pupilX)}
            cy={106 + (isThinking ? -3 : pupilY)}
            r="8.5"
            fill="#090d16"
          />
          {/* Catchlights */}
          <circle
            cx={167 + (isThinking ? 3 : pupilX * 0.4)}
            cy={100 + (isThinking ? -3 : pupilY * 0.4)}
            r="5"
            fill="#ffffff"
          />
          <circle
            cx={177 + (isThinking ? 3 : pupilX * 0.4)}
            cy={113 + (isThinking ? -3 : pupilY * 0.4)}
            r="2.5"
            fill="#fef08a"
          />
        </g>
      )}

      {/* 9. Joyful Open Mouth with Teeth & Tongue */}
      <g id="raptorMouth">
        <path
          d={`M 148 142 Q 185 ${144 + (isHappy ? 18 : mouthH * 0.8)} 228 142`}
          stroke="#0f172a"
          strokeWidth="3.8"
          strokeLinecap="round"
          fill="none"
        />
        {(mouthOpenAmount > 0.12 || isHappy || isSurprised) && (
          <g>
            <path
              d={`M 150 142 Q 185 ${144 + mouthH * 0.9} 226 142 C 220 ${166 + mouthH} 154 ${166 + mouthH} 150 142 Z`}
              fill="#450a0a"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            <ellipse
              cx="184"
              cy={152 + mouthH * 0.45}
              rx={isVisemeRound ? 8 : 15}
              ry={mouthH * 0.35}
              fill="#f43f5e"
            />
          </g>
        )}
        {/* Teeth along Jaw */}
        <path
          d="M 158 143 L 162 150 L 166 143 L 170 150 L 174 143 L 178 150 L 182 143 L 186 150 L 190 143 L 194 150 L 198 143 L 202 150 L 206 143 L 210 150 L 214 143 L 218 150 L 222 143"
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth="1.2"
        />
      </g>

      {renderAccessoryOverlay(accessory)}
    </svg>
  );
};
