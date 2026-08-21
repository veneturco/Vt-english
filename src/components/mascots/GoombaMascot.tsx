import React from "react";
import { MascotRenderProps } from "./types";

export const GoombaMascot: React.FC<MascotRenderProps> = ({
  isSpeaking,
  isBlinking,
  isHappy,
  isSurprised,
  pupilX,
  pupilY,
  accessory,
  renderAccessoryOverlay,
}) => {
  return (
    <svg
      viewBox="0 0 300 360"
      className="w-64 h-72 sm:w-72 sm:h-80 filter drop-shadow-[-2px_-2px_14px_rgba(217,119,6,0.3)] drop-shadow-[2px_2px_16px_rgba(180,83,9,0.3)] drop-shadow-[0_20px_32px_rgba(0,0,0,0.7)]"
    >
      <ellipse cx="150" cy="330" rx="84" ry="16" fill="#090d16" opacity="0.75" />

      {/* Waddling Boots */}
      <g
        style={{
          transform: isSpeaking ? `translateY(${Math.sin(Date.now() / 130) * 3}px)` : "none",
        }}
      >
        <ellipse cx="102" cy="308" rx="40" ry="24" fill="#451a03" stroke="#090d16" strokeWidth="3" />
        <ellipse cx="98" cy="302" rx="14" ry="7" fill="#78350f" opacity="0.5" />

        <ellipse cx="198" cy="308" rx="40" ry="24" fill="#451a03" stroke="#090d16" strokeWidth="3" />
        <ellipse cx="194" cy="302" rx="14" ry="7" fill="#78350f" opacity="0.5" />
      </g>

      {/* Cream Stem Body */}
      <path
        d="M 100 225 C 100 295 200 295 200 225 Z"
        fill="#fef3c7"
        stroke="#090d16"
        strokeWidth="3"
      />
      <path
        d="M 100 225 C 100 295 130 295 130 225 Z"
        fill="#fde68a"
      />

      {/* Chestnut Mushroom Cap */}
      <path
        d="M 62 205 C 46 115 94 36 150 36 C 206 36 254 115 238 205 C 216 234 84 234 62 205 Z"
        fill="#b45309"
        stroke="#090d16"
        strokeWidth="3.5"
      />
      <path
        d="M 62 205 C 84 234 216 234 238 205 C 228 175 220 150 200 170 C 160 210 100 210 62 205 Z"
        fill="#92400e"
      />

      {/* Eyes */}
      {isBlinking && !isSurprised ? (
        <g>
          <path d="M 108 160 Q 120 170 132 160" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 168 160 Q 180 170 192 160" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      ) : isHappy ? (
        <g>
          <path d="M 108 164 Q 120 146 132 164" stroke="#ffffff" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M 168 164 Q 180 146 192 164" stroke="#ffffff" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        <g>
          <ellipse cx="120" cy="158" rx="16" ry="25" fill="#ffffff" stroke="#090d16" strokeWidth="2.5" />
          <ellipse cx={120 + pupilX * 0.7} cy={158 + pupilY * 0.7} rx="8.5" ry="15" fill="#090d16" />
          <circle cx={117 + pupilX * 0.3} cy={150 + pupilY * 0.3} r="4.5" fill="#ffffff" />

          <ellipse cx="180" cy="158" rx="16" ry="25" fill="#ffffff" stroke="#090d16" strokeWidth="2.5" />
          <ellipse cx={180 + pupilX * 0.7} cy={158 + pupilY * 0.7} rx="8.5" ry="15" fill="#090d16" />
          <circle cx={177 + pupilX * 0.3} cy={150 + pupilY * 0.3} r="4.5" fill="#ffffff" />
        </g>
      )}

      {/* Eyebrows */}
      <g>
        <path
          d={
            isSurprised
              ? "M 96 122 L 140 134"
              : isHappy
              ? "M 96 134 Q 120 124 142 134"
              : "M 96 142 L 142 124"
          }
          stroke="#090d16"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d={
            isSurprised
              ? "M 204 134 L 160 122"
              : isHappy
              ? "M 204 134 Q 180 124 158 134"
              : "M 204 142 L 158 124"
          }
          stroke="#090d16"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>

      {/* Sharp Teeth Fangs */}
      <polygon points="126,238 134,220 142,238" fill="#ffffff" stroke="#090d16" strokeWidth="2" />
      <polygon points="158,238 166,220 174,238" fill="#ffffff" stroke="#090d16" strokeWidth="2" />

      {renderAccessoryOverlay(accessory)}
    </svg>
  );
};
