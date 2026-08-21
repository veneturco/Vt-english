import React from "react";
import { MascotRenderProps } from "./types";

export const LuigiMascot: React.FC<MascotRenderProps> = ({
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
      className="w-72 h-84 sm:w-80 sm:h-96 filter drop-shadow-[-2px_-2px_14px_rgba(34,197,94,0.25)] drop-shadow-[2px_2px_16px_rgba(59,130,246,0.25)] drop-shadow-[0_20px_32px_rgba(0,0,0,0.7)]"
    >
      {/* Ground Contact Shadow */}
      <ellipse cx="170" cy="376" rx="95" ry="12" fill="#090d16" opacity="0.7" />
      <ellipse cx="116" cy="368" rx="34" ry="7" fill="#090d16" opacity="0.4" />

      {/* 1. Heavy Explorer Boots (Warm Brown with Black Rubber Lug Sole) */}
      <g>
        {/* Left Boot */}
        <g id="luigiLeftBoot">
          <path
            d="M 138 354 C 138 368 178 368 178 354 L 174 348 L 142 348 Z"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="148" y1="360" x2="148" y2="366" stroke="#27272a" strokeWidth="2" />
          <line x1="158" y1="362" x2="158" y2="367" stroke="#27272a" strokeWidth="2" />
          <line x1="168" y1="360" x2="168" y2="366" stroke="#27272a" strokeWidth="2" />

          <ellipse
            cx="156"
            cy="342"
            rx="20"
            ry="14"
            fill="#92400e"
            stroke="#18181b"
            strokeWidth="2.5"
          />
          <path
            d="M 138 344 C 142 354 170 354 176 344 C 174 350 162 355 156 355 C 150 355 140 350 138 344 Z"
            fill="#713f12"
          />
          <path
            d="M 148 334 Q 156 331 164 334"
            stroke="#d97706"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </g>

        {/* Right Boot */}
        <g id="luigiRightBoot">
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

          <ellipse
            cx="202"
            cy="346"
            rx="22"
            ry="15"
            fill="#92400e"
            stroke="#18181b"
            strokeWidth="2.5"
          />
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

      {/* 2. Luigi Leaner Body & Green Shirt */}
      <g id="luigiBodyAndLegs">
        {/* Left Pant Leg */}
        <path
          d="M 148 266 L 140 342 L 172 342 L 178 280 Z"
          fill="#1d4ed8"
          stroke="#0f172a"
          strokeWidth="2.5"
        />
        <path d="M 166 272 L 172 342 L 178 280 Z" fill="#1e3a8a" />
        <rect
          x="138"
          y="336"
          width="36"
          height="8"
          rx="4"
          fill="#2563eb"
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* Right Pant Leg */}
        <path
          d="M 176 266 L 178 280 L 182 344 L 216 344 L 214 266 Z"
          fill="#1d4ed8"
          stroke="#0f172a"
          strokeWidth="2.5"
        />
        <path d="M 176 266 L 178 280 L 188 344 L 182 344 Z" fill="#1e3a8a" />
        <rect
          x="180"
          y="338"
          width="38"
          height="8"
          rx="4"
          fill="#2563eb"
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* Emerald Green Shirt Sleeves */}
        <path
          d="M 132 174 Q 112 182 122 206 Q 138 210 146 191 Z"
          fill="#22c55e"
          stroke="#14532d"
          strokeWidth="2.5"
        />
        <path d="M 116 190 Q 128 208 144 200 Q 136 210 122 206 Z" fill="#16a34a" />

        <path
          d="M 200 174 Q 232 186 224 224 Q 212 228 204 208 Z"
          fill="#22c55e"
          stroke="#14532d"
          strokeWidth="2.5"
        />
        <path d="M 216 192 Q 228 214 220 224 Q 228 206 224 192 Z" fill="#16a34a" />

        {/* Overalls Main Bib (Luigi's is slightly taller & slimmer) */}
        <path
          d="M 148 192 C 142 216 140 256 144 282 C 158 288 202 288 216 282 C 222 256 220 216 212 192 Z"
          fill="#1d4ed8"
          stroke="#0f172a"
          strokeWidth="2.8"
        />
        <path d="M 148 192 C 142 216 140 256 144 282 L 152 282 C 148 256 148 216 154 192 Z" fill="#1e3a8a" />
        <path d="M 212 192 C 218 216 220 256 216 282 L 208 282 C 212 256 212 216 206 192 Z" fill="#1e3a8a" />

        {/* Green Collar */}
        <path d="M 166 178 Q 180 192 194 178 Z" fill="#22c55e" stroke="#14532d" strokeWidth="2" />

        {/* Overalls Straps */}
        <g>
          <path d="M 156 180 L 152 230 L 166 230 L 168 180 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
          <path d="M 156 184 L 154 226 M 164 184 L 164 226" stroke="#facc15" strokeWidth="1" strokeDasharray="2 1.5" fill="none" opacity="0.85" />
        </g>
        <g>
          <path d="M 204 180 L 208 230 L 194 230 L 192 180 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
          <path d="M 204 184 L 206 226 M 196 184 L 196 226" stroke="#facc15" strokeWidth="1" strokeDasharray="2 1.5" fill="none" opacity="0.85" />
        </g>

        {/* Yellow Buttons */}
        <g>
          <circle cx="158" cy="222" r="7.5" fill="#facc15" stroke="#713f12" strokeWidth="2" />
          <circle cx="158" cy="222" r="4.5" fill="#eab308" />
          <circle cx="156" cy="220" r="1.8" fill="#ffffff" />
          <circle cx="157" cy="222" r="0.8" fill="#713f12" />
          <circle cx="160" cy="222" r="0.8" fill="#713f12" />

          <circle cx="202" cy="222" r="7.5" fill="#facc15" stroke="#713f12" strokeWidth="2" />
          <circle cx="202" cy="222" r="4.5" fill="#eab308" />
          <circle cx="200" cy="220" r="1.8" fill="#ffffff" />
          <circle cx="201" cy="222" r="0.8" fill="#713f12" />
          <circle cx="204" cy="222" r="0.8" fill="#713f12" />
        </g>

        <path d="M 148 244 Q 180 248 212 244" stroke="#0f172a" strokeWidth="2" fill="none" />
        <path d="M 148 247 Q 180 251 212 247" stroke="#facc15" strokeWidth="0.9" strokeDasharray="2 1.5" fill="none" opacity="0.8" />
        <path d="M 180 248 L 180 282" stroke="#0f172a" strokeWidth="2" fill="none" />
      </g>

      {/* 3. Left Hand on Hip */}
      <g id="luigiLeftGlove">
        <ellipse cx="214" cy="224" rx="8.5" ry="5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
        <path
          d="M 206 226 C 220 224 234 232 232 246 C 230 256 216 256 208 244 C 204 238 204 230 206 226 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        <line x1="216" y1="232" x2="218" y2="242" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="221" y1="232" x2="224" y2="243" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="226" y1="233" x2="229" y2="242" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* 4. Canvas Explorer Backpack Held by Luigi */}
      <g
        id="luigiBackpack"
        style={{
          transform: isSpeaking ? `rotate(${Math.sin(Date.now() / 150) * 2}deg)` : "none",
          transformOrigin: "128px 162px",
        }}
      >
        <path
          d="M 124 191 Q 116 168 128 154"
          stroke="#22c55e"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 124 191 Q 116 168 128 154"
          stroke="#14532d"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />

        <g id="luigiGrippingGlove">
          <ellipse cx="128" cy="156" rx="8" ry="4" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          <ellipse cx="128" cy="149" rx="14" ry="11" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
          <circle cx="119" cy="150" r="4.2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.4" />
          <circle cx="125" cy="152" r="4.2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.4" />
          <circle cx="131" cy="152" r="4.2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.4" />
          <circle cx="137" cy="150" r="4.2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.4" />
        </g>

        <path
          d="M 115 162 C 113 144 141 144 139 162"
          fill="none"
          stroke="#78350f"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Left Side Gear Pouch */}
        <g>
          <rect x="78" y="214" width="18" height="44" rx="6" fill="#d2a969" stroke="#78350f" strokeWidth="2.2" />
          <path d="M 77 216 Q 87 222 97 216 L 97 223 Q 87 228 77 223 Z" fill="#9a713b" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="87" cy="231" r="2.2" fill="#facc15" stroke="#78350f" strokeWidth="1" />
        </g>

        {/* Right Side Gear Pouch */}
        <g>
          <rect x="136" y="214" width="18" height="44" rx="6" fill="#d2a969" stroke="#78350f" strokeWidth="2.2" />
          <path d="M 135 216 Q 145 222 155 216 L 155 223 Q 145 228 135 223 Z" fill="#9a713b" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="145" cy="231" r="2.2" fill="#facc15" stroke="#78350f" strokeWidth="1" />
        </g>

        {/* Main Body */}
        <rect x="86" y="160" width="58" height="100" rx="16" fill="#e2ba7d" stroke="#78350f" strokeWidth="2.8" />
        <path
          d="M 130 160 C 138 160 144 166 144 176 L 144 244 C 144 252 138 260 130 260 L 98 260 C 114 260 144 256 144 234 L 144 174 Z"
          fill="#c59b63"
        />

        {/* Flap */}
        <path
          d="M 86 168 C 86 160 144 160 144 168 L 144 214 C 144 219 86 219 86 214 Z"
          fill="#e2ba7d"
          stroke="#78350f"
          strokeWidth="2.4"
        />
        <path d="M 86 214 Q 115 220 144 214" stroke="#9a713b" strokeWidth="2.5" fill="none" />

        {/* Red 5-Point Star */}
        <g id="luigiBackpackRedStar">
          <polygon
            points="115,174 118.5,184 128.5,184 120.5,190 123.5,200 115,194 106.5,200 109.5,190 101.5,184 111.5,184"
            fill="#ef4444"
            stroke="#7f1d1d"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon
            points="115,174 118.5,184 115,194 106.5,200 109.5,190 101.5,184"
            fill="#f87171"
            opacity="0.6"
          />
          <circle cx="115" cy="188" r="1.5" fill="#ffffff" />
        </g>

        {/* Straps */}
        <g>
          <rect x="92" y="190" width="9" height="36" rx="2" fill="#ea580c" stroke="#78350f" strokeWidth="1.4" />
          <polygon points="92,194 96.5,198 92,202" fill="#0d9488" />
          <polygon points="101,194 96.5,198 101,202" fill="#0d9488" />
          <polygon points="92,206 96.5,210 92,214" fill="#facc15" />
          <polygon points="101,206 96.5,210 101,214" fill="#facc15" />
          <rect x="90" y="220" width="13" height="7" rx="1.5" fill="#fde047" stroke="#78350f" strokeWidth="1.2" />
          <rect x="93" y="222" width="7" height="3" fill="#78350f" />
        </g>
        <g>
          <rect x="129" y="190" width="9" height="36" rx="2" fill="#ea580c" stroke="#78350f" strokeWidth="1.4" />
          <polygon points="129,194 133.5,198 129,202" fill="#0d9488" />
          <polygon points="138,194 133.5,198 138,202" fill="#0d9488" />
          <polygon points="129,206 133.5,210 129,214" fill="#facc15" />
          <polygon points="138,206 133.5,210 138,214" fill="#facc15" />
          <rect x="127" y="220" width="13" height="7" rx="1.5" fill="#fde047" stroke="#78350f" strokeWidth="1.2" />
          <rect x="130" y="222" width="7" height="3" fill="#78350f" />
        </g>

        {/* Lower Pocket */}
        <rect x="90" y="226" width="50" height="30" rx="8" fill="#d2a969" stroke="#78350f" strokeWidth="2.2" />
        <circle cx="102" cy="236" r="2.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
        <circle cx="128" cy="236" r="2.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
      </g>

      {/* 5. Luigi Head, Face, Mustache, Eyes & Cap */}
      <g id="luigiHead">
        {/* Hair */}
        <path
          d="M 144 136 C 134 152 140 172 154 164 C 158 152 154 141 144 136 Z"
          fill="#451a03"
          stroke="#18181b"
          strokeWidth="2.2"
        />
        <path
          d="M 212 136 C 222 152 216 172 202 164 C 198 152 202 141 212 136 Z"
          fill="#451a03"
          stroke="#18181b"
          strokeWidth="2.2"
        />

        {/* Right Ear */}
        <g id="luigiRightEar">
          <circle cx="218" cy="140" r="14" fill="#fed7aa" stroke="#18181b" strokeWidth="2.5" />
          <path d="M 218 134 Q 212 140 218 146" stroke="#ea580c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>

        {/* Face Oval (Luigi is leaner) */}
        <ellipse
          cx="180"
          cy="138"
          rx="34"
          ry="34"
          fill="#fed7aa"
          stroke="#18181b"
          strokeWidth="2.8"
        />

        {/* Rosy Blush */}
        <ellipse cx="156" cy="142" rx="9" ry="6" fill="#f43f5e" opacity="0.35" />
        <ellipse cx="206" cy="142" rx="9" ry="6" fill="#f43f5e" opacity="0.35" />

        {/* Eyes */}
        {isBlinking && !isSurprised ? (
          <g>
            <path d="M 160 122 Q 170 130 178 122" stroke="#18181b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 186 122 Q 196 130 204 122" stroke="#18181b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </g>
        ) : isHappy ? (
          <g>
            <path d="M 159 124 Q 169 111 179 124" stroke="#18181b" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 185 124 Q 195 111 205 124" stroke="#18181b" strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g>
            {/* Left Eye */}
            <ellipse cx="168" cy="119" rx="9" ry="12.5" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
            <ellipse
              cx={168 + (isThinking ? 2.5 : pupilX * 0.7)}
              cy={119 + (isThinking ? -2.5 : pupilY * 0.7)}
              rx="7"
              ry="9.5"
              fill="#0284c7"
            />
            <circle
              cx={168 + (isThinking ? 2.5 : pupilX * 0.7)}
              cy={119 + (isThinking ? -2.5 : pupilY * 0.7)}
              r="4.2"
              fill="#090d16"
            />
            <circle
              cx={166 + (isThinking ? 2.5 : pupilX * 0.3)}
              cy={115 + (isThinking ? -2.5 : pupilY * 0.3)}
              r="2.6"
              fill="#ffffff"
            />

            {/* Right Eye */}
            <ellipse cx="194" cy="119" rx="9" ry="12.5" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
            <ellipse
              cx={194 + (isThinking ? 2.5 : pupilX * 0.7)}
              cy={119 + (isThinking ? -2.5 : pupilY * 0.7)}
              rx="7"
              ry="9.5"
              fill="#0284c7"
            />
            <circle
              cx={194 + (isThinking ? 2.5 : pupilX * 0.7)}
              cy={119 + (isThinking ? -2.5 : pupilY * 0.7)}
              r="4.2"
              fill="#090d16"
            />
            <circle
              cx={192 + (isThinking ? 2.5 : pupilX * 0.3)}
              cy={115 + (isThinking ? -2.5 : pupilY * 0.3)}
              r="2.6"
              fill="#ffffff"
            />
          </g>
        )}

        {/* Eyebrows */}
        <path
          d={isSurprised ? "M 156 101 Q 168 93 178 101" : "M 158 106 Q 168 100 178 107"}
          stroke="#451a03"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={isSurprised ? "M 186 101 Q 196 93 208 101" : "M 186 107 Q 196 100 206 106"}
          stroke="#451a03"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Mouth */}
        <g id="luigiMouth">
          <path
            d={`M 166 153 Q 182 ${154 + (isHappy ? 12 : mouthH * 0.6)} 198 153`}
            stroke="#18181b"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill={mouthOpenAmount > 0.12 || isHappy || isSurprised ? "#450a0a" : "none"}
          />
          {(mouthOpenAmount > 0.12 || isHappy || isSurprised) && (
            <g>
              <ellipse
                cx="182"
                cy={155 + mouthH * 0.35}
                rx={isVisemeRound ? 6 : 10}
                ry={mouthH * 0.3}
                fill="#450a0a"
              />
              <path
                d="M 172 153 Q 182 156 192 153"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse
                cx="182"
                cy={157 + mouthH * 0.4}
                rx={isVisemeRound ? 5 : 8}
                ry={mouthH * 0.25}
                fill="#f43f5e"
              />
            </g>
          )}
        </g>

        {/* Luigi Oval Nose */}
        <g id="luigiNose">
          <ellipse
            cx="178"
            cy="135"
            rx="14.5"
            ry="13"
            fill="#fed7aa"
            stroke="#18181b"
            strokeWidth="2.5"
          />
          <path
            d="M 166 138 C 170 146 186 146 190 138 C 186 143 170 143 166 138 Z"
            fill="#fb923c"
            opacity="0.6"
          />
          <ellipse cx="174" cy="130" rx="5" ry="3.2" fill="#ffffff" opacity="0.75" />
        </g>

        {/* Luigi Smooth 2-Wing Mustache */}
        <g
          id="luigiMustache"
          style={{
            transform: isSpeaking ? `translateY(${Math.sin(Date.now() / 110) * 1.5}px)` : "none",
          }}
        >
          <path
            d="M 154 146 C 158 136 172 136 182 144 C 184 144 198 136 210 136 C 213 146 200 156 182 150 C 164 156 154 146 154 146 Z"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="2.5"
          />
          <path d="M 160 141 Q 172 137 180 143" stroke="#52525b" strokeWidth="1.5" fill="none" />
          <path d="M 186 143 Q 196 137 206 141" stroke="#52525b" strokeWidth="1.5" fill="none" />
        </g>

        {/* Luigi High-Crown Emerald Green Cap & 'L' Badge */}
        <g id="luigiCap">
          {/* Taller Cap Dome */}
          <path
            d="M 138 106 C 138 46 164 28 192 28 C 220 28 244 46 244 106 C 232 112 216 106 192 106 C 164 106 150 112 138 106 Z"
            fill="#22c55e"
            stroke="#18181b"
            strokeWidth="2.8"
          />
          <path
            d="M 220 38 C 238 54 244 80 244 106 C 232 112 216 106 192 106 C 216 102 234 82 220 38 Z"
            fill="#16a34a"
          />

          {/* Visor Brim */}
          <path
            d="M 134 106 C 150 92 230 92 246 106 C 250 120 226 126 192 126 C 154 126 130 120 134 106 Z"
            fill="#16a34a"
            stroke="#18181b"
            strokeWidth="2.6"
          />
          <path d="M 146 107 Q 190 116 236 107" stroke="#bbf7d0" strokeWidth="2.2" fill="none" opacity="0.85" />

          {/* 'L' Badge */}
          <g id="luigiBadge">
            <circle cx="190" cy="66" r="17" fill="#ffffff" stroke="#18181b" strokeWidth="2.4" />
            <text
              x="190"
              y="73"
              textAnchor="middle"
              fill="#16a34a"
              fontSize="18"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              stroke="#15803d"
              strokeWidth="0.5"
            >
              L
            </text>
          </g>
        </g>
      </g>

      {renderAccessoryOverlay(accessory)}
    </svg>
  );
};
