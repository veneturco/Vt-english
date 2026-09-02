import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AvatarAnimationState } from '../../types';
import { TurpialRigOffsets, loadTurpialRigOffsets, DEFAULT_TURPIAL_RIG_OFFSETS } from '../../types/turpialRig';

export type MascotGestureEmotion =
  | 'idle'
  | 'speaking'
  | 'listening'
  | 'talking'
  | 'alegre'
  | 'pensativo'
  | 'sorpresa'
  | 'encouraging'
  | 'celebrating'
  | 'loving';

export interface TurpialSpriteRig25DProps {
  animationState?: AvatarAnimationState | string;
  emotion?: MascotGestureEmotion | string;
  isSpeaking?: boolean;
  mouthIntensity?: number;
  isListening?: boolean;
  className?: string;
  onTap?: () => void;
  headTilt?: number;
  assetsBasePath?: string;
  offsets?: TurpialRigOffsets;
}

export const TurpialSpriteRig25D: React.FC<TurpialSpriteRig25DProps> = ({
  animationState = 'idle',
  emotion,
  isSpeaking = false,
  mouthIntensity = 0,
  isListening = false,
  className = '',
  onTap,
  headTilt = 0,
  assetsBasePath = '/assets/turpial',
  offsets: externalOffsets,
}) => {
  // Live reactive offsets (supports external prop or internal sync from localStorage/events)
  const [internalOffsets, setInternalOffsets] = useState<TurpialRigOffsets>(loadTurpialRigOffsets);

  useEffect(() => {
    const handleRigUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<TurpialRigOffsets>;
      if (customEvent.detail) {
        setInternalOffsets(customEvent.detail);
      } else {
        setInternalOffsets(loadTurpialRigOffsets());
      }
    };
    window.addEventListener('turpial-rig-updated', handleRigUpdated);
    return () => window.removeEventListener('turpial-rig-updated', handleRigUpdated);
  }, []);

  const currentOffsets = externalOffsets || internalOffsets || DEFAULT_TURPIAL_RIG_OFFSETS;

  // Estados para fallback dinámico si los PNG están corruptos o no disponibles
  const [cuerpoSrc, setCuerpoSrc] = useState(`${assetsBasePath}/cuerpo.png`);
  const [alaIzqSrc, setAlaIzqSrc] = useState(`${assetsBasePath}/ala_izq.png`);
  const [alaDerSrc, setAlaDerSrc] = useState(`${assetsBasePath}/ala_der.png`);
  const [cabezaSrc, setCabezaSrc] = useState(`${assetsBasePath}/cabeza.png`);
  const [picoInfSrc, setPicoInfSrc] = useState(`${assetsBasePath}/pico_inf.png`);
  const [picoSupSrc, setPicoSupSrc] = useState(`${assetsBasePath}/pico_sup.png`);
  const [medallaSrc, setMedallaSrc] = useState(`${assetsBasePath}/medalla.png`);

  // Normalizar estado de animación o emoción
  const activeState = emotion || (typeof animationState === 'string' ? animationState : 'idle');
  const isCelebrating = activeState === 'celebrating' || activeState === 'alegre' || activeState === 'encouraging';
  const isSpeakingEffective = isSpeaking || activeState === 'speaking' || activeState === 'talking';
  const isListeningEffective = isListening || activeState === 'listening';
  const isThinking = activeState === 'pensativo' || activeState === 'thinking';
  const isSurprised = activeState === 'sorpresa' || activeState === 'surprised';

  const springTransition = { type: 'spring', stiffness: 280, damping: 18, mass: 0.75 };

  const getBodyAnimation = () => {
    if (isCelebrating) {
      return { y: [0, -14, 0], scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' } };
    }
    if (isListeningEffective) return { y: 3, scale: 1.02, transition: springTransition };
    if (isThinking) return { y: 2, rotate: -2, transition: springTransition };
    return { y: [0, -4, 0], transition: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' } };
  };

  const getWingAnimation = (side: 'left' | 'right') => {
    const baseRot = side === 'left' ? currentOffsets.wingLeftRotateBase : currentOffsets.wingRightRotateBase;
    if (isCelebrating) {
      return {
        rotate: side === 'left' ? [baseRot, baseRot - 32, baseRot + 4, baseRot] : [baseRot, baseRot + 32, baseRot - 4, baseRot],
        transition: { repeat: Infinity, duration: 0.35, ease: 'easeInOut' },
      };
    }
    if (isSpeakingEffective) {
      return {
        rotate: side === 'left' ? [baseRot, baseRot - 8, baseRot] : [baseRot, baseRot + 8, baseRot],
        transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
      };
    }
    return { rotate: baseRot, transition: springTransition };
  };

  const getHeadRotation = () => {
    const base = currentOffsets.headRotationBase;
    if (isListeningEffective) return base - 4 + headTilt;
    if (isThinking) return base + 6 + headTilt;
    if (isSurprised) return base - 2 + headTilt;
    if (isCelebrating) return [base, base - 5, base + 5, base];
    return base + headTilt;
  };

  const gpuLayer = { willChange: 'transform', transform: 'translateZ(0)' };

  // Manejador seguro de error que pasa de PNG a SVG si el PNG falla
  const handleImageError = (
    currentSrc: string,
    setSrc: React.Dispatch<React.SetStateAction<string>>,
    baseName: string
  ) => {
    if (currentSrc.endsWith('.png')) {
      setSrc(`${assetsBasePath}/${baseName}.svg`);
    }
  };

  return (
    <div
      onClick={onTap}
      className={`relative w-full h-full flex items-center justify-center overflow-visible select-none cursor-pointer ${className}`}
    >
      <motion.div
        className="relative origin-center scale-90 sm:scale-95 md:scale-100"
        style={{ width: 290, height: 310, position: 'relative', ...gpuLayer }}
        animate={getBodyAnimation()}
      >
        {/* 1. Cuerpo / Torso Base con plumas realistas, patas y cuello */}
        <img
          src={cuerpoSrc}
          alt="Cuerpo Turpial"
          onError={() => handleImageError(cuerpoSrc, setCuerpoSrc, 'cuerpo')}
          style={{
            position: 'absolute',
            bottom: currentOffsets.bodyBottom,
            left: currentOffsets.bodyLeft,
            width: currentOffsets.bodyWidth,
            zIndex: 10,
          }}
        />

        {/* 2. Ala Izquierda articulada (anclaje anatómico en el hombro) */}
        <motion.img
          src={alaIzqSrc}
          alt="Ala Izquierda Turpial"
          onError={() => handleImageError(alaIzqSrc, setAlaIzqSrc, 'ala_izq')}
          style={{
            position: 'absolute',
            top: currentOffsets.wingLeftTop,
            left: currentOffsets.wingLeftLeft,
            width: currentOffsets.wingLeftWidth,
            zIndex: 6,
            transformOrigin: '90% 20%',
            ...gpuLayer,
          }}
          animate={getWingAnimation('left')}
        />

        {/* 3. Ala Derecha articulada (anclaje anatómico en el hombro) */}
        <motion.img
          src={alaDerSrc}
          alt="Ala Derecha Turpial"
          onError={() => handleImageError(alaDerSrc, setAlaDerSrc, 'ala_der')}
          style={{
            position: 'absolute',
            top: currentOffsets.wingRightTop,
            right: currentOffsets.wingRightRight,
            width: currentOffsets.wingRightWidth,
            zIndex: 6,
            transformOrigin: '10% 20%',
            ...gpuLayer,
          }}
          animate={getWingAnimation('right')}
        />

        {/* 4. Cabeza ensamblada con pico y gafas */}
        <motion.div
          style={{
            position: 'absolute',
            top: currentOffsets.headTop,
            left: currentOffsets.headLeft,
            width: currentOffsets.headWidth,
            height: currentOffsets.headHeight,
            zIndex: 20,
            transformOrigin: '50% 90%',
            ...gpuLayer,
          }}
          animate={{
            rotate: getHeadRotation(),
            scale: isSurprised ? 1.05 : 1,
            transition: isCelebrating ? { repeat: Infinity, duration: 0.8 } : springTransition,
          }}
        >
          {/* Base de la Cabeza con plumaje y lentes */}
          <img
            src={cabezaSrc}
            alt="Cabeza Turpial"
            onError={() => handleImageError(cabezaSrc, setCabezaSrc, 'cabeza')}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.35))',
            }}
          />

          {/* Sistema de Pico y Lip-Sync (Desactivado momentáneamente pico_inf) */}
          {/* Pico inferior desactivado temporalmente a solicitud del usuario */}

        </motion.div>

        {/* 5. Cadena y Medallas de Honor (Desactivado momentáneamente a solicitud del usuario) */}
        {/* Desactivado temporalmente */}
      </motion.div>
    </div>
  );
};

