import React from "react";
import { TurpialSpriteRig25D, MascotGestureEmotion } from "./TurpialSpriteRig25D";

export type { MascotGestureEmotion };

export interface TurpialSpriteRigProps {
  emotion?: MascotGestureEmotion;
  isSpeaking?: boolean;
  mouthIntensity?: number; // 0.0 a 1.0 para lip-sync reactivo
  assetsBasePath?: string;
  className?: string;
  onTap?: () => void;
  headTilt?: number;
}

/**
 * TurpialSpriteRig:
 * 2.5D Layered Sprite Assembly Rig for Turpial.
 * Delegates to TurpialSpriteRig25D for the requested 6-piece assembly.
 */
export const TurpialSpriteRig: React.FC<TurpialSpriteRigProps> = (props) => {
  return <TurpialSpriteRig25D {...props} />;
};
