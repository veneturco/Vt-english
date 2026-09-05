import React from "react";
import { MascotRenderProps } from "./types";
import { TurpialSpriteRig25D } from "./TurpialSpriteRig25D";

export const TurpialMasterMascot: React.FC<MascotRenderProps> = ({
  isSpeaking,
  isHappy,
  isSurprised,
  isThinking,
  mouthOpenAmount,
  accessory,
  renderAccessoryOverlay,
  className = "w-64 h-72 sm:w-72 sm:h-80",
  onClick,
}) => {
  const emotion = isHappy
    ? "alegre"
    : isSurprised
    ? "sorpresa"
    : isThinking
    ? "pensativo"
    : isSpeaking
    ? "speaking"
    : "idle";

  return (
    <div
      className={`relative flex items-center justify-center filter drop-shadow-[-4px_-4px_18px_rgba(245,158,11,0.55)] drop-shadow-[4px_4px_22px_rgba(56,189,248,0.55)] drop-shadow-[0_26px_40px_rgba(0,0,0,0.9)] cursor-pointer select-none ${className}`}
      onClick={(e) => onClick?.(e)}
    >
      <TurpialSpriteRig25D
        emotion={emotion}
        isSpeaking={isSpeaking}
        mouthIntensity={mouthOpenAmount}
        onTap={() => onClick?.({} as any)}
      />
      {/* Optional Accessory Overlay if provided */}
      {accessory && renderAccessoryOverlay && (
        <svg
          viewBox="0 0 280 340"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 40 }}
        >
          {renderAccessoryOverlay(accessory)}
        </svg>
      )}
    </div>
  );
};
