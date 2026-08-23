import React from "react";
import { MascotRenderProps } from "./types";

export const TurpialMasterMascot: React.FC<MascotRenderProps> = ({
  isSpeaking,
  isBlinking,
  isHappy,
  isSurprised,
  isThinking,
  pupilX,
  pupilY,
  mouthOpenAmount,
  accessory,
  renderAccessoryOverlay,
  className = "w-64 h-72 sm:w-72 sm:h-80",
  onClick,
}) => {
  return (
    <svg
      viewBox="0 0 280 340"
      className={`${className} filter drop-shadow-[-4px_-4px_18px_rgba(245,158,11,0.55)] drop-shadow-[4px_4px_22px_rgba(56,189,248,0.55)] drop-shadow-[0_26px_40px_rgba(0,0,0,0.9)] cursor-pointer select-none`}
      onClick={onClick}
    >
      <defs>
        {/* Pixar 3D Volumetric Orange Belly with Subsurface Scattering */}
        <radialGradient id="turpialBellyMaster3D" cx="42%" cy="36%" r="65%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="12%" stopColor="#fef08a" />
          <stop offset="28%" stopColor="#fbbf24" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="82%" stopColor="#ea580c" />
          <stop offset="96%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </radialGradient>

        {/* Pixar Velvet Obsidian Black Head Hood & Wing Plumage */}
        <radialGradient id="turpialObsidianFeather3D" cx="38%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#52525b" />
          <stop offset="18%" stopColor="#3f3f46" />
          <stop offset="48%" stopColor="#27272a" />
          <stop offset="78%" stopColor="#18181b" />
          <stop offset="92%" stopColor="#09090b" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        {/* Wing Feather Texture Gradient */}
        <linearGradient id="turpialWingGradient3D" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="35%" stopColor="#18181b" />
          <stop offset="80%" stopColor="#09090b" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        {/* Beak Glossy Horn Material with Top-Down Specular */}
        <linearGradient id="turpialBeakMaster3D" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#71717a" />
          <stop offset="20%" stopColor="#52525b" />
          <stop offset="50%" stopColor="#27272a" />
          <stop offset="85%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>

        {/* Turpial Orbital Cyan/Blue Mask Gradient */}
        <radialGradient id="turpialEyeMaskMaster3D" cx="45%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="30%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>

        {/* Deep Glass Amber/Obsidian Pixar Iris */}
        <radialGradient id="turpialPixarIris3D" cx="38%" cy="34%" r="62%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="18%" stopColor="#f59e0b" />
          <stop offset="42%" stopColor="#b45309" />
          <stop offset="72%" stopColor="#451a03" />
          <stop offset="94%" stopColor="#1c0a01" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        {/* Golden Medal 3D Polished Brass Material */}
        <linearGradient id="goldMedalMaster3D" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="15%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#eab308" />
          <stop offset="75%" stopColor="#ca8a04" />
          <stop offset="92%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#713f12" />
        </linearGradient>

        {/* Blue Medal Ribbon Material */}
        <linearGradient id="medalRibbonMaster3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="25%" stopColor="#2563eb" />
          <stop offset="70%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      {/* Volumetric Shadow on branch */}
      <ellipse cx="140" cy="305" rx="72" ry="16" fill="#000000" opacity="0.6" />

      {/* Tail Feathers */}
      <path
        d="M 125 240 Q 115 310 125 325 Q 140 320 145 240 Z"
        fill="url(#turpialObsidianFeather3D)"
      />
      <path
        d="M 135 240 Q 145 318 155 330 Q 165 315 155 240 Z"
        fill="url(#turpialObsidianFeather3D)"
      />

      {/* Main Body (Golden Turpial Amber with rich shading) */}
      <path
        d="M 90 140 C 75 220, 95 285, 140 290 C 185 285, 205 220, 190 140 C 185 110, 95 110, 90 140 Z"
        fill="url(#turpialBellyMaster3D)"
        stroke="#9a3412"
        strokeWidth="2.5"
      />

      {/* Left Wing with signature white wingbar */}
      <g>
        <path
          d="M 92 135 C 55 160, 48 235, 88 265 C 98 245, 108 190, 106 148 Z"
          fill="url(#turpialWingGradient3D)"
          stroke="#09090b"
          strokeWidth="2"
        />
        {/* Crisp White Wing Patch */}
        <path
          d="M 68 175 C 75 195, 88 215, 100 220 C 98 200, 84 180, 68 175 Z"
          fill="#FFFFFF"
          opacity="0.95"
        />
      </g>

      {/* Right Wing with signature white wingbar */}
      <g>
        <path
          d="M 188 135 C 225 160, 232 235, 192 265 C 182 245, 172 190, 174 148 Z"
          fill="url(#turpialWingGradient3D)"
          stroke="#09090b"
          strokeWidth="2"
        />
        {/* Crisp White Wing Patch */}
        <path
          d="M 212 175 C 205 195, 192 215, 180 220 C 182 200, 196 180, 212 175 Z"
          fill="#FFFFFF"
          opacity="0.95"
        />
      </g>

      {/* Head with characteristic Black Hood */}
      <path
        d="M 100 95 C 100 48, 180 48, 180 95 C 180 130, 160 152, 140 160 C 120 152, 100 130, 100 95 Z"
        fill="url(#turpialObsidianFeather3D)"
        stroke="#020617"
        strokeWidth="2"
      />

      {/* Crest Top Feathers */}
      <path d="M 135 52 C 138 38, 145 40, 143 52 Z" fill="url(#turpialObsidianFeather3D)" />
      <path d="M 142 50 C 146 35, 154 38, 150 50 Z" fill="url(#turpialObsidianFeather3D)" />

      {/* Characteristic Turquoise / Blue Eye Patches */}
      <ellipse cx="120" cy="88" rx="14" ry="12" fill="url(#turpialEyeMaskMaster3D)" />
      <ellipse cx="160" cy="88" rx="14" ry="12" fill="url(#turpialEyeMaskMaster3D)" />

      {/* Eyes and Pupils with Gaze Direction and Blink */}
      {!isBlinking ? (
        <>
          {/* Left Eye */}
          <ellipse cx="120" cy="88" rx="7.5" ry="7.5" fill="url(#turpialPixarIris3D)" />
          <ellipse cx={120 + pupilX} cy={88 + pupilY} rx="4" ry="4" fill="#000000" />
          <circle cx={118 + pupilX * 0.5} cy={85 + pupilY * 0.5} r="2" fill="#ffffff" />

          {/* Right Eye */}
          <ellipse cx="160" cy="88" rx="7.5" ry="7.5" fill="url(#turpialPixarIris3D)" />
          <ellipse cx={160 + pupilX} cy={88 + pupilY} rx="4" ry="4" fill="#000000" />
          <circle cx={158 + pupilX * 0.5} cy={85 + pupilY * 0.5} r="2" fill="#ffffff" />
        </>
      ) : (
        <>
          {/* Blink Arcs */}
          <path d="M 112 88 Q 120 94 128 88" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 152 88 Q 160 94 168 88" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Turpial Beak with Articulated Lip Sync */}
      <g transform={`translate(0, ${isSpeaking ? mouthOpenAmount * 2 : 0})`}>
        {/* Upper Beak */}
        <path
          d="M 130 96 Q 140 85 150 96 Q 140 116 130 96 Z"
          fill="url(#turpialBeakMaster3D)"
          stroke="#09090b"
          strokeWidth="1.5"
        />
        {/* Lower Beak Silver Base */}
        <path
          d="M 132 98 Q 140 106 148 98 Q 140 112 132 98 Z"
          fill="#cbd5e1"
        />
      </g>

      {/* BET Golden Medal & Ribbon */}
      <g transform="translate(140, 168)">
        {/* Ribbon */}
        <path d="M -16 0 L -6 22 L 0 10 L 6 22 L 16 0 Z" fill="url(#medalRibbonMaster3D)" />
        {/* Golden Medallion */}
        <circle cx="0" cy="26" r="16" fill="url(#goldMedalMaster3D)" stroke="#a16207" strokeWidth="2" />
        <circle cx="0" cy="26" r="12" fill="#fbbf24" opacity="0.6" />
        <text
          x="0"
          y="30"
          textAnchor="middle"
          fontSize="9"
          fontWeight="900"
          fill="#78350f"
          fontFamily="system-ui, sans-serif"
        >
          BET
        </text>
      </g>

      {/* Accessory Overlay */}
      {renderAccessoryOverlay && renderAccessoryOverlay(accessory)}
    </svg>
  );
};
