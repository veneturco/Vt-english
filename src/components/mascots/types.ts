import React from "react";
import { AvatarAccessory } from "../../types";

export interface MascotRenderProps {
  isSpeaking: boolean;
  isBlinking: boolean;
  isHappy: boolean;
  isSurprised: boolean;
  isThinking: boolean;
  isLoving?: boolean;
  pupilX: number;
  pupilY: number;
  mouthOpenAmount: number;
  mouthH: number;
  isVisemeRound: boolean;
  accessory?: AvatarAccessory;
  renderAccessoryOverlay: (acc?: AvatarAccessory) => React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<any>) => void;
}
