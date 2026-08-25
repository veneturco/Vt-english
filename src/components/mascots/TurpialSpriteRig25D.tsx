import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AvatarAnimationState } from '../../types';

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
}) => {
  // Estados para fallback dinámico si los PNG están corruptos o no disponibles
  const [cuerpoSrc, setCuerpoSrc] = useState(`${assetsBasePath}/cuerpo.png`);
  const [alaIzqSrc, setAlaIzqSrc] = useState(`${assetsBasePath}/ala_izq.png`);
  const [alaDerSrc, setAlaDerSrc] = useState(`${assetsBasePath}/ala_der.png`);
  const [cabezaSrc, setCabezaSrc] = useState(`${assetsBasePath}/cabeza.png`);
  const [picoInfSrc, setPicoInfSrc] = useState(`${assetsBasePath}/pico_inf.png`);
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
    if (isCelebrating) {
      return {
        rotate: side === 'left' ? [0, -32, 4, 0] : [0, 32, -4, 0],
        transition: { repeat: Infinity, duration: 0.35, ease: 'easeInOut' },
      };
    }
    if (isSpeakingEffective) {
      return {
        rotate: side === 'left' ? [0, -8, 0] : [0, 8, 0],
        transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
      };
    }
    return { rotate: 0, transition: springTransition };
  };

  const getHeadRotation = () => {
    if (isListeningEffective) return -4 + headTilt;
    if (isThinking) return 6 + headTilt;
    if (isSurprised) return -2 + headTilt;
    if (isCelebrating) return [0, -5, 5, 0];
    return headTilt;
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
          style={{ position: 'absolute', bottom: 0, left: 45, width: 200, zIndex: 10 }}
        />

        {/* 2. Ala Izquierda articulada (anclaje anatómico en el hombro) */}
        <motion.img
          src={alaIzqSrc}
          alt="Ala Izquierda Turpial"
          onError={() => handleImageError(alaIzqSrc, setAlaIzqSrc, 'ala_izq')}
          style={{
            position: 'absolute',
            top: 120,
            left: 10,
            width: 108,
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
            top: 120,
            right: 10,
            width: 108,
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
            top: 10,
            left: 67,
            width: 156,
            height: 156,
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

          {/* Pico Inferior articulado para Lip-Sync reactivo */}
          <motion.img
            src={picoInfSrc}
            alt="Pico Inferior Turpial"
            onError={() => handleImageError(picoInfSrc, setPicoInfSrc, 'pico_inf')}
            style={{
              position: 'absolute',
              top: 92,
              left: 58,
              width: 40,
              zIndex: 21,
              transformOrigin: '50% 0%',
              ...gpuLayer,
            }}
            animate={{
              y: isSpeakingEffective ? Math.max(mouthIntensity * 12, 3) : 0,
              scaleY: isSpeakingEffective ? 1 + mouthIntensity * 0.25 : 1,
            }}
            transition={springTransition}
          />
        </motion.div>

        {/* 5. Trío de 3 Medallas Oficiales de Honor */}
        {/* Medalla 1 (Izquierda) */}
        <motion.img
          src={medallaSrc}
          alt="Medalla Izquierda Turpial"
          onError={() => handleImageError(medallaSrc, setMedallaSrc, 'medalla')}
          style={{
            position: 'absolute',
            top: 132,
            left: 58,
            width: 76,
            zIndex: 23,
            transformOrigin: '50% 0%',
            filter: 'drop-shadow(0px 5px 4px rgba(0,0,0,0.4)) hue-rotate(-15deg) brightness(0.95)',
            ...gpuLayer,
          }}
          animate={{
            rotate: isCelebrating
              ? [-12, 8, -12, 8, 0]
              : isSpeakingEffective
              ? [-6, 2, -6]
              : [-4, 1, -4],
            transition: isCelebrating
              ? { duration: 0.6, repeat: Infinity }
              : { repeat: Infinity, duration: 3.1, ease: 'easeInOut' },
          }}
        />

        {/* Medalla 2 (Derecha) */}
        <motion.img
          src={medallaSrc}
          alt="Medalla Derecha Turpial"
          onError={() => handleImageError(medallaSrc, setMedallaSrc, 'medalla')}
          style={{
            position: 'absolute',
            top: 132,
            right: 58,
            width: 76,
            zIndex: 23,
            transformOrigin: '50% 0%',
            filter: 'drop-shadow(0px 5px 4px rgba(0,0,0,0.4)) hue-rotate(15deg) brightness(0.95)',
            ...gpuLayer,
          }}
          animate={{
            rotate: isCelebrating
              ? [8, -12, 8, -12, 0]
              : isSpeakingEffective
              ? [-2, 6, -2]
              : [-1, 4, -1],
            transition: isCelebrating
              ? { duration: 0.6, repeat: Infinity, delay: 0.1 }
              : { repeat: Infinity, duration: 2.9, ease: 'easeInOut', delay: 0.15 },
          }}
        />

        {/* Medalla 3 (Central - Oro Principal Prominente) */}
        <motion.img
          src={medallaSrc}
          alt="Medalla Central Oro Turpial BET"
          onError={() => handleImageError(medallaSrc, setMedallaSrc, 'medalla')}
          style={{
            position: 'absolute',
            top: 122,
            left: 93,
            width: 104,
            zIndex: 25,
            transformOrigin: '50% 0%',
            filter: 'drop-shadow(0px 8px 7px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(245,158,11,0.35))',
            ...gpuLayer,
          }}
          animate={{
            rotate: isCelebrating
              ? [-10, 12, -10, 6, 0]
              : isSpeakingEffective
              ? [-4, 4, -4]
              : [-2.5, 2.5, -2.5],
            transition: isCelebrating
              ? { duration: 0.55, repeat: Infinity }
              : { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
          }}
        />
      </motion.div>
    </div>
  );
};
