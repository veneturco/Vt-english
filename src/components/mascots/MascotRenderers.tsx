import React from 'react';
import { MascotRenderProps } from './types';
import { TurpialSpriteRig25D } from './TurpialSpriteRig25D';
import { AvatarAnimationState } from '../../types';

// Re-export Mascot types
export * from './types';

// Mascotas secundarias
export { SuperMarioMascot } from './MarioMascot';
export { LuigiMascot } from './LuigiMascot';
export { RexyMascot } from './RexyMascot';
export { PipRaptorMascot } from './PipRaptorMascot';
export { GoombaMascot } from './GoombaMascot';

/**
 * renderMascot helper router:
 * Enruta 'bet_turpial' obligatoriamente al nuevo Sprite Rig 2.5D de 6 capas PNG
 */
export function renderMascot(
  preset: string,
  animationState: AvatarAnimationState | string = 'idle',
  mouthIntensity: number = 0,
  isListening: boolean = false
) {
  if (preset === 'bet_turpial') {
    return (
      <TurpialSpriteRig25D
        animationState={animationState}
        mouthIntensity={mouthIntensity}
        isListening={isListening}
      />
    );
  }
  return null;
}

/**
 * TurpialMasterMascot:
 * Oficial Turpial BET - Renderizado exclusivamente a través del Sprite Rig 2.5D de 6 piezas PNG.
 */
export const TurpialMasterMascot: React.FC<MascotRenderProps> = ({
  isSpeaking,
  isHappy,
  isSurprised,
  isThinking,
  mouthOpenAmount,
  className = 'w-64 h-72 sm:w-72 sm:h-80',
  onClick,
}) => {
  const animationState: AvatarAnimationState = isHappy
    ? 'celebrating'
    : isSurprised
    ? 'sorpresa'
    : isThinking
    ? 'pensativo'
    : isSpeaking
    ? 'speaking'
    : 'idle';

  return (
    <TurpialSpriteRig25D
      animationState={animationState}
      mouthIntensity={mouthOpenAmount}
      className={className}
      onTap={onClick ? () => onClick({} as React.MouseEvent<SVGSVGElement>) : undefined}
    />
  );
};

export { TurpialSpriteRig25D };
export { TurpialSpriteRig25D as TurpialSpriteRig };
