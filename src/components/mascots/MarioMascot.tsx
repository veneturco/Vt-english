import React from "react";
import { MascotRenderProps } from "./types";

export const SuperMarioMascot: React.FC<MascotRenderProps> = ({
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
}) => {
  return (
    <svg
      viewBox="0 0 340 400"
      className="w-72 h-84 sm:w-80 sm:h-96 filter drop-shadow-[-2px_-2px_14px_rgba(239,68,68,0.25)] drop-shadow-[2px_2px_16px_rgba(59,130,246,0.25)] drop-shadow-[0_20px_32px_rgba(0,0,0,0.7)]"
    >
      <defs>
        {/* Cel-shading Gradients & Clip Paths */}
        <clipPath id="marioCapClip">
          <path d="M 136 112 C 136 54 164 36 192 36 C 224 36 248 54 248 112 C 234 118 218 112 192 112 C 164 112 148 118 136 112 Z" />
        </clipPath>
        <clipPath id="marioVisorClip">
          <path d="M 132 112 C 148 98 234 98 250 112 C 254 126 230 132 192 132 C 150 132 128 126 132 112 Z" />
        </clipPath>
        <clipPath id="marioOverallsClip">
          <path d="M 148 196 C 142 220 140 260 144 286 C 158 292 202 292 216 286 C 222 260 220 220 212 196 Z" />
        </clipPath>
        <clipPath id="marioBackpackClip">
          <rect x="86" y="164" width="58" height="100" rx="16" />
        </clipPath>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="170" cy="376" rx="95" ry="12" fill="#090d16" opacity="0.7" />
      <ellipse cx="116" cy="368" rx="34" ry="7" fill="#090d16" opacity="0.4" />

      {/* 1. Heavy Explorer Boots (Warm Brown with Black Rubber Lug Sole) */}
      <g>
        {/* Left Boot (Background) */}
        <g id="marioLeftBoot">
          {/* Black Rubber Sole Contour */}
          <path
            d="M 138 354 C 138 368 178 368 178 354 L 174 348 L 142 348 Z"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Tread notches */}
          <line x1="148" y1="360" x2="148" y2="366" stroke="#27272a" strokeWidth="2" />
          <line x1="158" y1="362" x2="158" y2="367" stroke="#27272a" strokeWidth="2" />
          <line x1="168" y1="360" x2="168" y2="366" stroke="#27272a" strokeWidth="2" />

          {/* Upper Leather Shoe Body */}
          <ellipse
            cx="156"
            cy="342"
            rx="20"
            ry="14"
            fill="#92400e"
            stroke="#18181b"
            strokeWidth="2.5"
          />
          {/* Cel-Shading Shadow on bottom half */}
          <path
            d="M 138 344 C 142 354 170 354 176 344 C 174 350 162 355 156 355 C 150 355 140 350 138 344 Z"
            fill="#713f12"
          />
          {/* Subtle Top Leather Specular Arc */}
          <path
            d="M 148 334 Q 156 331 164 334"
            stroke="#d97706"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </g>

        {/* Right Boot (Foreground) */}
        <g id="marioRightBoot">
          {/* Black Rubber Sole */}
          <path
            d="M 182 358 C 182 374 226 374 226 358 L 222 352 L 186 352 Z"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="194" y1="365" x2="194" y2="372" stroke="#27272a" strokeWidth="2" />
          <line x1="204" y1="367" x2="204" y2="373" stroke="#27272a" strokeWidth="2" />
          <line x1="214" y1="365" x2="214" y2="372" stroke="#27272a" strokeWidth="2" />

          {/* Upper Shoe */}
          <ellipse
            cx="202"
            cy="346"
            rx="22"
            ry="15"
            fill="#92400e"
            stroke="#18181b"
            strokeWidth="2.5"
          />
          {/* Cel-Shading Shadow */}
          <path
            d="M 183 348 C 188 360 218 360 224 348 C 220 356 208 360 202 360 C 196 360 185 356 183 348 Z"
            fill="#713f12"
          />
          <path
            d="M 194 337 Q 203 334 212 337"
            stroke="#d97706"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </g>
      </g>

      {/* 2. Denim Overalls Legs & Red Sleeves */}
      <g id="marioBodyAndLegs">
        {/* Left Pant Leg */}
        <path
          d="M 148 270 L 140 342 L 172 342 L 178 284 Z"
          fill="#2563eb"
          stroke="#0f172a"
          strokeWidth="2.5"
        />
        {/* Shadow on inner leg */}
        <path d="M 166 276 L 172 342 L 178 284 Z" fill="#1d4ed8" />
        {/* Left Cuff Roll */}
        <rect
          x="138"
          y="336"
          width="36"
          height="8"
          rx="4"
          fill="#3b82f6"
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* Right Pant Leg */}
        <path
          d="M 176 270 L 178 284 L 182 344 L 216 344 L 214 270 Z"
          fill="#2563eb"
          stroke="#0f172a"
          strokeWidth="2.5"
        />
        {/* Shadow on crotch & inner leg */}
        <path d="M 176 270 L 178 284 L 188 344 L 182 344 Z" fill="#1d4ed8" />
        {/* Right Cuff Roll */}
        <rect
          x="180"
          y="338"
          width="38"
          height="8"
          rx="4"
          fill="#3b82f6"
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* Red Shirt Sleeves */}
        {/* Right Arm Sleeve (Reaching left to backpack) */}
        <path
          d="M 132 178 Q 112 186 122 210 Q 138 214 146 195 Z"
          fill="#ef4444"
          stroke="#7f1d1d"
          strokeWidth="2.5"
        />
        {/* Sleeve Cel Shadow */}
        <path d="M 116 194 Q 128 212 144 204 Q 136 214 122 210 Z" fill="#b91c1c" />

        {/* Left Arm Sleeve (Resting hand on hip) */}
        <path
          d="M 200 178 Q 232 190 224 228 Q 212 232 204 212 Z"
          fill="#ef4444"
          stroke="#7f1d1d"
          strokeWidth="2.5"
        />
        {/* Sleeve Cel Shadow */}
        <path d="M 216 196 Q 228 218 220 228 Q 228 210 224 196 Z" fill="#b91c1c" />

        {/* Overalls Main Bib & Torso */}
        <path
          d="M 148 196 C 142 220 140 260 144 286 C 158 292 202 292 216 286 C 222 260 220 220 212 196 Z"
          fill="#2563eb"
          stroke="#0f172a"
          strokeWidth="2.8"
        />
        {/* Side shadows on torso */}
        <path d="M 148 196 C 142 220 140 260 144 286 L 152 286 C 148 260 148 220 154 196 Z" fill="#1d4ed8" />
        <path d="M 212 196 C 218 220 220 260 216 286 L 208 286 C 212 260 212 220 206 196 Z" fill="#1d4ed8" />

        {/* Red Shirt Collar / Chest Peek */}
        <path d="M 166 182 Q 180 196 194 182 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" />

        {/* Denim Shoulder Straps */}
        {/* Left Strap */}
        <g>
          <path d="M 156 184 L 152 234 L 166 234 L 168 184 Z" fill="#1d4ed8" stroke="#0f172a" strokeWidth="2" />
          {/* Yellow Stitching */}
          <path d="M 156 188 L 154 230 M 164 188 L 164 230" stroke="#facc15" strokeWidth="1" strokeDasharray="2 1.5" fill="none" opacity="0.85" />
        </g>
        {/* Right Strap */}
        <g>
          <path d="M 204 184 L 208 234 L 194 234 L 192 184 Z" fill="#1d4ed8" stroke="#0f172a" strokeWidth="2" />
          {/* Yellow Stitching */}
          <path d="M 204 188 L 206 230 M 196 188 L 196 230" stroke="#facc15" strokeWidth="1" strokeDasharray="2 1.5" fill="none" opacity="0.85" />
        </g>

        {/* Bright Golden Yellow Buttons */}
        <g>
          {/* Left Button */}
          <circle cx="158" cy="226" r="7.5" fill="#facc15" stroke="#713f12" strokeWidth="2" />
          <circle cx="158" cy="226" r="4.5" fill="#eab308" />
          <circle cx="156" cy="224" r="1.8" fill="#ffffff" />
          {/* Thread holes */}
          <circle cx="157" cy="226" r="0.8" fill="#713f12" />
          <circle cx="160" cy="226" r="0.8" fill="#713f12" />

          {/* Right Button */}
          <circle cx="202" cy="226" r="7.5" fill="#facc15" stroke="#713f12" strokeWidth="2" />
          <circle cx="202" cy="226" r="4.5" fill="#eab308" />
          <circle cx="200" cy="224" r="1.8" fill="#ffffff" />
          <circle cx="201" cy="226" r="0.8" fill="#713f12" />
          <circle cx="204" cy="226" r="0.8" fill="#713f12" />
        </g>

        {/* Waist Seam & Pocket Stitching */}
        <path d="M 148 248 Q 180 252 212 248" stroke="#0f172a" strokeWidth="2" fill="none" />
        <path d="M 148 251 Q 180 255 212 251" stroke="#facc15" strokeWidth="0.9" strokeDasharray="2 1.5" fill="none" opacity="0.8" />
        <path d="M 180 252 L 180 286" stroke="#0f172a" strokeWidth="2" fill="none" />
      </g>

      {/* 3. Left Hand Resting on Hip (Classic 2D White Cartoon Glove) */}
      <g id="marioLeftGlove">
        {/* Glove Cuff Band */}
        <ellipse cx="214" cy="228" rx="8.5" ry="5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
        {/* Puffy Glove Hand Body */}
        <path
          d="M 206 230 C 220 228 234 236 232 250 C 230 260 216 260 208 248 C 204 242 204 234 206 230 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        {/* 3 Characteristic Black Dart Stitches on Back of Glove */}
        <line x1="216" y1="236" x2="218" y2="246" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="221" y1="236" x2="224" y2="247" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="226" y1="237" x2="229" y2="246" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* 4. Canvas Explorer Backpack Held by Mario's Right Hand */}
      <g
        id="marioBackpack"
        style={{
          transform: isSpeaking ? `rotate(${Math.sin(Date.now() / 150) * 2}deg)` : "none",
          transformOrigin: "128px 166px",
        }}
      >
        {/* Right Arm Reaching to Handle */}
        <path
          d="M 124 195 Q 116 172 128 158"
          stroke="#ef4444"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 124 195 Q 116 172 128 158"
          stroke="#7f1d1d"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />

        {/* White Glove Holding Top Handle */}
        <g id="marioGrippingGlove">
          {/* Cuff */}
          <ellipse cx="128" cy="160" rx="8" ry="4" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          {/* Main Hand */}
          <ellipse cx="128" cy="153" rx="14" ry="11" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
          {/* 4 Gripping Fingers */}
          <circle cx="119" cy="154" r="4.2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.4" />
          <circle cx="125" cy="156" r="4.2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.4" />
          <circle cx="131" cy="156" r="4.2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.4" />
          <circle cx="137" cy="154" r="4.2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.4" />
        </g>

        {/* Leather Loop Handle */}
        <path
          d="M 115 166 C 113 148 141 148 139 166"
          fill="none"
          stroke="#78350f"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Left Side Gear Pouch */}
        <g>
          <rect
            x="78"
            y="218"
            width="18"
            height="44"
            rx="6"
            fill="#d2a969"
            stroke="#78350f"
            strokeWidth="2.2"
          />
          {/* Pouch Flap */}
          <path d="M 77 220 Q 87 226 97 220 L 97 227 Q 87 232 77 227 Z" fill="#9a713b" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="87" cy="235" r="2.2" fill="#facc15" stroke="#78350f" strokeWidth="1" />
        </g>

        {/* Right Side Gear Pouch */}
        <g>
          <rect
            x="136"
            y="218"
            width="18"
            height="44"
            rx="6"
            fill="#d2a969"
            stroke="#78350f"
            strokeWidth="2.2"
          />
          <path d="M 135 220 Q 145 226 155 220 L 155 227 Q 145 232 135 227 Z" fill="#9a713b" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="145" cy="235" r="2.2" fill="#facc15" stroke="#78350f" strokeWidth="1" />
        </g>

        {/* Main Canvas Backpack Body (Tan / Khaki) */}
        <rect
          x="86"
          y="164"
          width="58"
          height="100"
          rx="16"
          fill="#e2ba7d"
          stroke="#78350f"
          strokeWidth="2.8"
        />
        {/* Right & Bottom Cel Shadow */}
        <path
          d="M 130 164 C 138 164 144 170 144 180 L 144 248 C 144 256 138 264 130 264 L 98 264 C 114 264 144 260 144 238 L 144 178 Z"
          fill="#c59b63"
        />

        {/* Top Canvas Flap */}
        <path
          d="M 86 172 C 86 164 144 164 144 172 L 144 218 C 144 223 86 223 86 218 Z"
          fill="#e2ba7d"
          stroke="#78350f"
          strokeWidth="2.4"
        />
        {/* Flap Edge Trim */}
        <path d="M 86 218 Q 115 224 144 218" stroke="#9a713b" strokeWidth="2.5" fill="none" />

        {/* Bold 2D Red 5-Pointed Star Emblem on Flap */}
        <g id="backpackRedStar">
          <polygon
            points="115,178 118.5,188 128.5,188 120.5,194 123.5,204 115,198 106.5,204 109.5,194 101.5,188 111.5,188"
            fill="#ef4444"
            stroke="#7f1d1d"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Star Highlight Facet */}
          <polygon
            points="115,178 118.5,188 115,198 106.5,204 109.5,194 101.5,188"
            fill="#f87171"
            opacity="0.6"
          />
          <circle cx="115" cy="192" r="1.5" fill="#ffffff" />
        </g>

        {/* Patterned Ethnic Webbing Closure Straps */}
        {/* Left Strap */}
        <g id="leftWebbingStrap">
          <rect x="92" y="194" width="9" height="36" rx="2" fill="#ea580c" stroke="#78350f" strokeWidth="1.4" />
          {/* Teal & Yellow Diamonds */}
          <polygon points="92,198 96.5,202 92,206" fill="#0d9488" />
          <polygon points="101,198 96.5,202 101,206" fill="#0d9488" />
          <polygon points="92,210 96.5,214 92,218" fill="#facc15" />
          <polygon points="101,210 96.5,214 101,218" fill="#facc15" />
          {/* Brass Metal Buckle */}
          <rect x="90" y="224" width="13" height="7" rx="1.5" fill="#fde047" stroke="#78350f" strokeWidth="1.2" />
          <rect x="93" y="226" width="7" height="3" fill="#78350f" />
        </g>

        {/* Right Strap */}
        <g id="rightWebbingStrap">
          <rect x="129" y="194" width="9" height="36" rx="2" fill="#ea580c" stroke="#78350f" strokeWidth="1.4" />
          <polygon points="129,198 133.5,202 129,206" fill="#0d9488" />
          <polygon points="138,198 133.5,202 138,206" fill="#0d9488" />
          <polygon points="129,210 133.5,214 129,218" fill="#facc15" />
          <polygon points="138,210 133.5,214 138,218" fill="#facc15" />
          <rect x="127" y="224" width="13" height="7" rx="1.5" fill="#fde047" stroke="#78350f" strokeWidth="1.2" />
          <rect x="130" y="226" width="7" height="3" fill="#78350f" />
        </g>

        {/* Lower Front Utility Pocket */}
        <rect
          x="90"
          y="230"
          width="50"
          height="30"
          rx="8"
          fill="#d2a969"
          stroke="#78350f"
          strokeWidth="2.2"
        />
        {/* Pocket Snap Rivets */}
        <circle cx="102" cy="240" r="2.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
        <circle cx="128" cy="240" r="2.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
        {/* Stitching */}
        <path d="M 94 252 Q 115 255 136 252" stroke="#78350f" strokeWidth="1.2" strokeDasharray="2 1.5" fill="none" opacity="0.7" />
      </g>

      {/* 5. Mario Head, Face, Mustache, Eyes & Cap */}
      <g id="marioHead">
        {/* Brown Hair Curls behind Ears / Neck */}
        <path
          d="M 144 140 C 134 156 140 176 154 168 C 158 156 154 145 144 140 Z"
          fill="#451a03"
          stroke="#18181b"
          strokeWidth="2.2"
        />
        <path
          d="M 212 140 C 222 156 216 176 202 168 C 198 156 202 145 212 140 Z"
          fill="#451a03"
          stroke="#18181b"
          strokeWidth="2.2"
        />

        {/* Right Big Ear */}
        <g id="marioRightEar">
          <circle cx="218" cy="144" r="14" fill="#fed7aa" stroke="#18181b" strokeWidth="2.5" />
          {/* Inner Ear Cartilage Crease */}
          <path d="M 218 138 Q 212 144 218 150" stroke="#ea580c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>

        {/* Face Base Head Silhouette */}
        <ellipse
          cx="180"
          cy="142"
          rx="36"
          ry="34"
          fill="#fed7aa"
          stroke="#18181b"
          strokeWidth="2.8"
        />

        {/* Rosy Peach Blush Cheeks */}
        <ellipse cx="156" cy="146" rx="9" ry="6" fill="#f43f5e" opacity="0.35" />
        <ellipse cx="206" cy="146" rx="9" ry="6" fill="#f43f5e" opacity="0.35" />

        {/* Expressive Cartoon Eyes (Vivid Blue with Pure White Catchlights) */}
        {isBlinking && !isSurprised ? (
          <g id="marioBlinkEyes">
            <path d="M 160 125 Q 170 133 178 125" stroke="#18181b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 186 125 Q 196 133 204 125" stroke="#18181b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </g>
        ) : isHappy ? (
          <g id="marioHappyEyes">
            <path d="M 159 127 Q 169 114 179 127" stroke="#18181b" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 185 127 Q 195 114 205 127" stroke="#18181b" strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g id="marioOpenEyes">
            {/* Left Eye */}
            <ellipse cx="168" cy="122" rx="9.5" ry="12.5" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
            {/* Sapphire Blue Iris */}
            <ellipse
              cx={168 + (isThinking ? 2.5 : pupilX * 0.7)}
              cy={122 + (isThinking ? -2.5 : pupilY * 0.7)}
              rx="7.5"
              ry="9.5"
              fill="#0284c7"
            />
            {/* Dark Pupil */}
            <circle
              cx={168 + (isThinking ? 2.5 : pupilX * 0.7)}
              cy={122 + (isThinking ? -2.5 : pupilY * 0.7)}
              r="4.5"
              fill="#090d16"
            />
            {/* Bright Catchlight */}
            <circle
              cx={166 + (isThinking ? 2.5 : pupilX * 0.3)}
              cy={118 + (isThinking ? -2.5 : pupilY * 0.3)}
              r="2.8"
              fill="#ffffff"
            />

            {/* Right Eye */}
            <ellipse cx="194" cy="122" rx="9.5" ry="12.5" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
            <ellipse
              cx={194 + (isThinking ? 2.5 : pupilX * 0.7)}
              cy={122 + (isThinking ? -2.5 : pupilY * 0.7)}
              rx="7.5"
              ry="9.5"
              fill="#0284c7"
            />
            <circle
              cx={194 + (isThinking ? 2.5 : pupilX * 0.7)}
              cy={122 + (isThinking ? -2.5 : pupilY * 0.7)}
              r="4.5"
              fill="#090d16"
            />
            <circle
              cx={192 + (isThinking ? 2.5 : pupilX * 0.3)}
              cy={118 + (isThinking ? -2.5 : pupilY * 0.3)}
              r="2.8"
              fill="#ffffff"
            />
          </g>
        )}

        {/* Thick Dark Brown Eyebrows */}
        <path
          d={isSurprised ? "M 156 104 Q 168 96 178 104" : "M 158 109 Q 168 103 178 110"}
          stroke="#451a03"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={isSurprised ? "M 186 104 Q 196 96 208 104" : "M 186 110 Q 196 103 206 109"}
          stroke="#451a03"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Mouth Cavity for Speaking / Lip-sync */}
        <g id="marioMouth">
          <path
            d={`M 166 156 Q 182 ${157 + (isHappy ? 12 : mouthH * 0.6)} 198 156`}
            stroke="#18181b"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill={mouthOpenAmount > 0.12 || isHappy || isSurprised ? "#450a0a" : "none"}
          />
          {(mouthOpenAmount > 0.12 || isHappy || isSurprised) && (
            <g>
              <ellipse
                cx="182"
                cy={158 + mouthH * 0.35}
                rx={isVisemeRound ? 6 : 10}
                ry={mouthH * 0.3}
                fill="#450a0a"
              />
              {/* White Upper Teeth */}
              <path
                d="M 172 156 Q 182 159 192 156"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Pink Tongue */}
              <ellipse
                cx="182"
                cy={160 + mouthH * 0.4}
                rx={isVisemeRound ? 5 : 8}
                ry={mouthH * 0.25}
                fill="#f43f5e"
              />
            </g>
          )}
        </g>

        {/* Big Spherical Mario Nose */}
        <g id="marioNose">
          <ellipse
            cx="178"
            cy="139"
            rx="16"
            ry="13"
            fill="#fed7aa"
            stroke="#18181b"
            strokeWidth="2.5"
          />
          {/* Nose Under-Shadow */}
          <path
            d="M 164 142 C 168 151 188 151 192 142 C 188 147 168 147 164 142 Z"
            fill="#fb923c"
            opacity="0.6"
          />
          {/* Nose Specular Highlight */}
          <ellipse cx="174" cy="134" rx="5.5" ry="3.5" fill="#ffffff" opacity="0.75" />
        </g>

        {/* Iconic Bushy 6-Lobe Mustache in Crisp 2D Solid Silhouette */}
        <g
          id="marioMustache"
          style={{
            transform: isSpeaking ? `translateY(${Math.sin(Date.now() / 110) * 1.5}px)` : "none",
          }}
        >
          <path
            d="M 152 148 C 153 138 165 138 170 144 C 174 138 182 138 182 144 C 182 138 190 138 194 144 C 199 138 211 138 212 148 C 210 157 198 158 190 151 C 184 156 176 156 170 151 C 162 158 154 157 152 148 Z"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="2.5"
          />
          {/* Subtle Top Highlights on Mustache Curves */}
          <path d="M 156 142 Q 164 139 170 143" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 194 143 Q 200 139 208 142" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>

        {/* Red Cap & Curved Visor */}
        <g id="marioCap">
          {/* Cap Puffy Crown / Dome */}
          <path
            d="M 136 112 C 136 54 164 36 192 36 C 224 36 248 54 248 112 C 234 118 218 112 192 112 C 164 112 148 118 136 112 Z"
            fill="#ef4444"
            stroke="#18181b"
            strokeWidth="2.8"
          />
          {/* Cap Crown Cel Shadow */}
          <path
            d="M 224 46 C 242 62 248 88 248 112 C 234 118 218 112 192 112 C 218 108 238 88 224 46 Z"
            fill="#dc2626"
          />

          {/* Visor Brim extending forward */}
          <path
            d="M 132 112 C 148 98 234 98 250 112 C 254 126 230 132 192 132 C 150 132 128 126 132 112 Z"
            fill="#dc2626"
            stroke="#18181b"
            strokeWidth="2.6"
          />
          {/* Visor Top Highlight */}
          <path d="M 144 113 Q 190 122 238 113" stroke="#fca5a5" strokeWidth="2.2" fill="none" opacity="0.85" />

          {/* White Circular Emblem Badge with Bold Red 'M' */}
          <g id="marioBadge">
            <circle cx="190" cy="74" r="17" fill="#ffffff" stroke="#18181b" strokeWidth="2.4" />
            <text
              x="190"
              y="81"
              textAnchor="middle"
              fill="#dc2626"
              fontSize="18"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              stroke="#b91c1c"
              strokeWidth="0.5"
            >
              M
            </text>
          </g>
        </g>
      </g>

      {renderAccessoryOverlay(accessory)}
    </svg>
  );
};
