import React, { useEffect } from "react";
import { MascotRenderProps } from "./types";
import { useSpringAnimation } from "../../utils/useSpringAnimation";
import { fireParticles } from "../../utils/particleHelper";

export const RexyMascot: React.FC<MascotRenderProps> = ({
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
  // Motor de físicas de resorte para Rexy (con mayor masa por ser un T-Rex gigante)
  const { ref: svgRef, triggerBounce } = useSpringAnimation<SVGSVGElement>({
    tension: 160,
    friction: 14,
    mass: 1.3,
  });

  useEffect(() => {
    if (isHappy) {
      triggerBounce(0.85, 1.25);
    } else if (isSurprised) {
      triggerBounce(0.9, 1.15);
    }
  }, [isHappy, isSurprised, triggerBounce]);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    triggerBounce(1.3, 0.7);
    fireParticles(e.clientX, e.clientY, "confetti", 40);
    if (onClick) onClick(e);
  };

  return (
    <svg
      ref={svgRef}
      onClick={handleClick}
      viewBox="0 0 340 380"
      className={`w-56 h-64 sm:w-64 sm:h-72 max-w-full max-h-full will-change-transform origin-bottom cursor-pointer drop-shadow-2xl filter drop-shadow-[-2px_-2px_14px_rgba(34,197,94,0.25)] drop-shadow-[2px_2px_16px_rgba(234,179,8,0.25)] ${className}`}
    >
      {/* 1. Luminous Base Pedestal Ring & Contact Shadow */}
      <g id="rexyBaseShadow">
        <ellipse cx="160" cy="340" rx="86" ry="16" fill="#090d16" opacity="0.65" />
        <ellipse cx="160" cy="338" rx="74" ry="14" fill="#fef08a" opacity="0.15" />
        <ellipse
          cx="160"
          cy="338"
          rx="74"
          ry="14"
          fill="none"
          stroke="#fde047"
          strokeWidth="3"
          opacity="0.9"
        />
      </g>

      {/* 2. Curving Tail & Green Dorsal Spikes */}
      <g id="rexyTail">
        {/* Dorsal Spikes */}
        <polygon points="218,206 236,198 226,216" fill="#15803d" stroke="#0f172a" strokeWidth="1.5" />
        <polygon points="230,220 248,214 236,232" fill="#15803d" stroke="#0f172a" strokeWidth="1.5" />
        <polygon points="238,238 256,234 242,250" fill="#15803d" stroke="#0f172a" strokeWidth="1.5" />
        <polygon points="242,256 258,254 244,266" fill="#15803d" stroke="#0f172a" strokeWidth="1.5" />

        {/* Curving Dino Tail */}
        <path
          d="M 206 250 C 235 250 256 230 252 200 C 248 190 236 195 230 210 C 224 225 210 240 190 248 Z"
          fill="#22c55e"
          stroke="#0f172a"
          strokeWidth="2.8"
        />
        {/* Tail Shadow */}
        <path
          d="M 206 250 C 220 250 240 240 248 220 C 240 232 220 244 190 248 Z"
          fill="#16a34a"
        />
        {/* Tail Spot */}
        <circle cx="232" cy="225" r="4.5" fill="#15803d" opacity="0.65" />
      </g>

      {/* 3. Sturdy Dino Legs & Claws */}
      <g id="rexyLegs">
        {/* Left Hind Leg */}
        <ellipse cx="130" cy="298" rx="20" ry="24" fill="#16a34a" stroke="#0f172a" strokeWidth="2.5" />
        <g>
          <ellipse cx="118" cy="316" rx="5" ry="4" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.2" />
          <ellipse cx="128" cy="320" rx="5.5" ry="4" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.2" />
          <ellipse cx="138" cy="317" rx="5" ry="4" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.2" />
        </g>

        {/* Right Hind Leg */}
        <ellipse cx="184" cy="302" rx="22" ry="26" fill="#22c55e" stroke="#0f172a" strokeWidth="2.8" />
        <path
          d="M 166 304 C 166 322 196 324 204 308 C 200 318 180 324 170 314 Z"
          fill="#16a34a"
        />
        <g>
          <ellipse cx="174" cy="322" rx="5.5" ry="4.5" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.4" />
          <ellipse cx="186" cy="326" rx="6" ry="4.5" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.4" />
          <ellipse cx="198" cy="323" rx="5.5" ry="4.5" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.4" />
        </g>
      </g>

      {/* 4. Chubby Pear Body & Cream Segmented Belly */}
      <g id="rexyBody">
        {/* Main Torso */}
        <path
          d="M 124 195 C 100 230 110 290 156 295 C 206 300 226 260 216 205 C 200 185 140 185 124 195 Z"
          fill="#22c55e"
          stroke="#0f172a"
          strokeWidth="3"
        />
        {/* Body Side Shadows */}
        <path d="M 112 240 C 114 278 140 292 156 295 C 132 290 120 268 116 240 Z" fill="#16a34a" />
        <path d="M 216 205 C 220 238 214 274 196 292 C 210 274 218 240 216 205 Z" fill="#16a34a" />

        {/* Spots */}
        <circle cx="198" cy="226" r="6" fill="#15803d" opacity="0.6" />
        <circle cx="206" cy="242" r="4.5" fill="#15803d" opacity="0.6" />
        <circle cx="192" cy="254" r="5" fill="#15803d" opacity="0.6" />

        {/* Cream Belly with Segment Dividers */}
        <path
          d="M 132 205 C 120 235 126 280 155 284 C 182 284 190 255 186 215 C 168 202 145 202 132 205 Z"
          fill="#fef3c7"
          stroke="#0f172a"
          strokeWidth="2.2"
        />
        {/* Belly Horizontal Curves */}
        <path d="M 130 228 Q 155 238 180 230" stroke="#d97706" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M 132 248 Q 156 258 178 250" stroke="#d97706" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M 138 266 Q 156 274 172 268" stroke="#d97706" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>

      {/* 5. Tiny T-Rex Arms */}
      <g id="rexyArms">
        {/* Left Arm */}
        <path d="M 118 214 Q 106 226 114 234 Q 124 230 124 218 Z" fill="#16a34a" stroke="#0f172a" strokeWidth="2" />
        <circle cx="108" cy="228" r="2.2" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />
        <circle cx="112" cy="233" r="2.2" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />

        {/* Right Arm (Waving) */}
        <g
          style={{
            transform: isSpeaking ? `rotate(${Math.sin(Date.now() / 150) * 4}deg)` : "none",
            transformOrigin: "172px 218px",
          }}
        >
          <path d="M 168 215 Q 160 234 172 240 Q 182 232 178 218 Z" fill="#22c55e" stroke="#0f172a" strokeWidth="2.2" />
          <circle cx="162" cy="235" r="2.2" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />
          <circle cx="167" cy="240" r="2.2" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />
        </g>
      </g>

      {/* 6. Sky-Blue Neckerchief / Bandana */}
      <g id="rexyBandana">
        <path
          d="M 126 182 C 140 196 180 196 194 182 C 196 190 186 200 160 202 C 134 200 124 190 126 182 Z"
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="2.5"
        />
        {/* Knot */}
        <circle cx="154" cy="198" r="7" fill="#60a5fa" stroke="#0284c7" strokeWidth="2" />
        <path d="M 149 202 Q 140 216 146 226 Q 152 216 153 204 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.8" />
        <path d="M 158 202 Q 166 216 160 226 Q 155 216 154 204 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.8" />
      </g>

      {/* 7. Cute Dino Head & Big Round Snout */}
      <g id="rexyHead">
        <path
          d="M 104 148 C 88 100 120 62 168 62 C 210 62 230 100 226 148 C 220 182 186 186 150 186 C 114 186 108 172 104 148 Z"
          fill="#22c55e"
          stroke="#0f172a"
          strokeWidth="3"
        />
        {/* Head Shadow */}
        <path
          d="M 104 148 C 108 172 114 186 150 186 C 186 186 220 182 226 148 C 218 172 178 180 148 180 C 118 180 108 165 104 148 Z"
          fill="#16a34a"
        />

        {/* Head Spots */}
        <circle cx="130" cy="88" r="5" fill="#15803d" opacity="0.55" />
        <circle cx="144" cy="80" r="3.5" fill="#15803d" opacity="0.55" />
        <circle cx="120" cy="102" r="4" fill="#15803d" opacity="0.55" />
        <circle cx="212" cy="120" r="4.5" fill="#15803d" opacity="0.55" />

        {/* Snout Nostrils */}
        <ellipse cx="110" cy="140" rx="4" ry="5.5" fill="#0f172a" />
        <ellipse cx="126" cy="145" rx="3.8" ry="5" fill="#0f172a" />

        {/* Rosy Blush Cheek */}
        <ellipse cx="198" cy="148" rx="16" ry="12" fill="#f43f5e" opacity="0.4" />
      </g>

      {/* 8. Expressive Glossy Cartoon Eyes */}
      {isBlinking && !isSurprised ? (
        <g id="rexyBlinkEye">
          <path d="M 172 118 Q 186 130 200 118" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      ) : isHappy ? (
        <g id="rexyHappyEye">
          <path d="M 170 122 Q 186 100 202 122" stroke="#0f172a" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        <g id="rexyEye">
          <ellipse cx="186" cy="116" rx="17" ry="20" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          {/* Amber / Chocolate Iris */}
          <circle
            cx={186 + (isThinking ? 3 : pupilX)}
            cy={116 + (isThinking ? -3 : pupilY)}
            r="13"
            fill="#78350f"
          />
          {/* Black Pupil */}
          <circle
            cx={186 + (isThinking ? 3 : pupilX)}
            cy={116 + (isThinking ? -3 : pupilY)}
            r="7.5"
            fill="#090d16"
          />
          {/* Catchlight Stars */}
          <circle
            cx={181 + (isThinking ? 3 : pupilX * 0.4)}
            cy={109 + (isThinking ? -3 : pupilY * 0.4)}
            r="4.5"
            fill="#ffffff"
          />
          <circle
            cx={192 + (isThinking ? 3 : pupilX * 0.4)}
            cy={122 + (isThinking ? -3 : pupilY * 0.4)}
            r="2.2"
            fill="#fde047"
          />
        </g>
      )}

      {/* 9. Smiling Mouth with Teeth & Tongue */}
      <g id="rexyMouth">
        <path
          d={`M 108 154 Q 150 ${156 + (isHappy ? 16 : mouthH * 0.8)} 190 154`}
          stroke="#0f172a"
          strokeWidth="3.8"
          strokeLinecap="round"
          fill="none"
        />
        {(mouthOpenAmount > 0.12 || isHappy || isSurprised) && (
          <g>
            <path
              d={`M 112 154 Q 150 ${156 + mouthH * 0.9} 186 154 C 182 ${174 + mouthH} 118 ${174 + mouthH} 112 154 Z`}
              fill="#450a0a"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            <ellipse
              cx="148"
              cy={162 + mouthH * 0.45}
              rx={isVisemeRound ? 8 : 14}
              ry={mouthH * 0.35}
              fill="#f43f5e"
            />
          </g>
        )}
        {/* White Triangular Teeth */}
        <path
          d="M 120 155 L 124 163 L 128 155 L 132 163 L 136 155 L 140 163 L 144 155 L 148 163 L 152 155 L 156 163 L 160 155 L 164 163 L 168 155 L 172 163 L 176 155"
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth="1.2"
        />
      </g>

      {/* 10. Terracotta / Coral Orange Graduation Cap (Birrete Académico) */}
      <g id="rexyGraduationCap">
        {/* Skullcap Band */}
        <ellipse cx="164" cy="74" rx="28" ry="14" fill="#c2410c" stroke="#0f172a" strokeWidth="2.4" />

        {/* Diamond Mortarboard Plate */}
        <polygon
          points="164,30 226,52 164,74 102,52"
          fill="#ea580c"
          stroke="#0f172a"
          strokeWidth="2.8"
        />
        {/* Edge Thickness */}
        <polygon points="102,52 164,74 164,78 102,56" fill="#9a3412" stroke="#0f172a" strokeWidth="1.5" />
        <polygon points="164,74 226,52 226,56 164,78" fill="#7c2d12" stroke="#0f172a" strokeWidth="1.5" />

        {/* Center Button */}
        <ellipse cx="164" cy="52" rx="5.5" ry="3.5" fill="#fde047" stroke="#0f172a" strokeWidth="1.5" />

        {/* Golden Tassel */}
        <path
          d="M 164 52 Q 192 56 206 76 Q 212 90 210 108"
          stroke="#facc15"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="210" cy="98" r="4" fill="#ca8a04" stroke="#0f172a" strokeWidth="1.2" />
        <polygon points="207,102 204,122 216,122 213,102" fill="#facc15" stroke="#0f172a" strokeWidth="1.4" />
      </g>

      {renderAccessoryOverlay(accessory)}
    </svg>
  );
};
