import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AvatarAnimationState, AvatarAccessory } from '../../types';
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
  accessory?: AvatarAccessory;
  renderAccessoryOverlay?: (acc?: AvatarAccessory) => React.ReactNode;
  mouseOffset?: { x: number; y: number };
  previewMouthOpen?: boolean | number;
  showMouthGuide?: boolean;
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
  accessory,
  renderAccessoryOverlay,
  mouseOffset,
  previewMouthOpen,
  showMouthGuide = false,
}) => {
  // Live reactive offsets (supports external prop or internal sync from localStorage/events)
  const [internalOffsets, setInternalOffsets] = useState<TurpialRigOffsets>(loadTurpialRigOffsets);
  const [isTapJumping, setIsTapJumping] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Ciclo orgánico de parpadeo aviar (cada 3.5s - 6s)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const scheduleBlink = () => {
      const delay = Math.random() * 3200 + 3200;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 160);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimer);
  }, []);

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

  // Calibración anatómica de ojos (porcentaje 0..100 anclado al sprite de cabeza)
  const eyeLX = currentOffsets.eyeLeftX ?? 30.8;
  const eyeLY = currentOffsets.eyeLeftY ?? 25.4;
  const eyeRX = currentOffsets.eyeRightX ?? 70.8;
  const eyeRY = currentOffsets.eyeRightY ?? 25.4;
  const eyeScale = currentOffsets.eyeScale ?? 1.0;
  const eyeLookIntensity = currentOffsets.eyeLookIntensity ?? 1.0;
  const eyeTrackingEnabled = currentOffsets.eyeTrackingEnabled !== false;

  // Calibración y distancias de boca / pico
  const beakTop = currentOffsets.beakTop ?? 88;
  const beakLeft = currentOffsets.beakLeft ?? 58;
  const beakScale = currentOffsets.beakScale ?? 1.0;
  const beakWidth = (currentOffsets.beakWidth ?? 40) * beakScale;
  const beakHeightRatio = currentOffsets.beakHeightRatio ?? 0.72;
  const beakOpenDistance = currentOffsets.beakOpenDistance ?? 6;
  const isPreviewMouthActive = previewMouthOpen !== undefined && previewMouthOpen !== false;
  const previewMouthRatio = typeof previewMouthOpen === 'number' ? previewMouthOpen : 0.85;

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

  const springTransition = { type: 'spring' as const, stiffness: 280, damping: 18, mass: 0.75 };

  const handleMascotTap = () => {
    setIsTapJumping(true);
    setTimeout(() => setIsTapJumping(false), 450);
    onTap?.();
  };

  const getBodyAnimation = () => {
    if (isTapJumping) {
      return {
        y: [0, -18, 0],
        scale: [1, 1.05, 0.98, 1],
        transition: { duration: 0.42, ease: 'easeOut' as const },
      };
    }
    if (isCelebrating) {
      return {
        y: [0, -14, 0],
        scale: [1, 1.03, 1],
        transition: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' as const },
      };
    }
    if (isListeningEffective) {
      return { y: 3, scale: 1.02, transition: springTransition };
    }
    if (isThinking) {
      return { y: 2, rotate: -2, transition: springTransition };
    }
    // Idle orgánico respirando
    return {
      y: [0, -4, 0],
      transition: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' as const },
    };
  };

  const getWingAnimation = (side: 'left' | 'right') => {
    const baseRot = side === 'left' ? currentOffsets.wingLeftRotateBase : currentOffsets.wingRightRotateBase;

    if (isTapJumping) {
      return {
        rotate: side === 'left' ? [baseRot, baseRot - 22, baseRot] : [baseRot, baseRot + 22, baseRot],
        transition: { duration: 0.42, ease: 'easeOut' as const },
      };
    }
    if (isCelebrating) {
      return {
        rotate: side === 'left' ? [baseRot, baseRot - 32, baseRot + 4, baseRot] : [baseRot, baseRot + 32, baseRot - 4, baseRot],
        transition: { repeat: Infinity, duration: 0.35, ease: 'easeInOut' as const },
      };
    }
    if (isListeningEffective) {
      // Escucha atenta: alas recogidas con postura de concentración
      return {
        rotate: side === 'left' ? baseRot + 3 : baseRot - 3,
        scale: 0.98,
        transition: springTransition,
      };
    }
    if (isSpeakingEffective) {
      // Gesticulación conversacional rítmica con las alas
      return {
        rotate: side === 'left'
          ? [baseRot, baseRot - 7, baseRot - 2, baseRot - 8, baseRot]
          : [baseRot, baseRot + 7, baseRot + 2, baseRot + 8, baseRot],
        transition: { repeat: Infinity, duration: 1.1, ease: 'easeInOut' as const },
      };
    }
    return { rotate: baseRot, scale: 1, transition: springTransition };
  };

  const getHeadRotation = () => {
    const base = currentOffsets.headRotationBase;
    const cursorTilt = mouseOffset ? mouseOffset.x * 10 : 0;
    if (isTapJumping) return base - 3 + headTilt + cursorTilt;
    if (isListeningEffective) return base - 5 + headTilt + cursorTilt; // Gesto universal de escucha atenta
    if (isThinking) return base + 6 + headTilt + cursorTilt; // Mirada reflexiva hacia arriba
    if (isSurprised) return base - 2 + headTilt + cursorTilt;
    if (isCelebrating) return [base, base - 5, base + 5, base];
    return base + headTilt + cursorTilt;
  };

  const gpuLayer = { willChange: 'transform' } as const;

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
      className={`relative w-full h-full flex items-center justify-center overflow-visible select-none ${className}`}
    >
      <motion.div
        id="avatar-body"
        data-avatar-body="true"
        data-mascot-body="true"
        onClick={handleMascotTap}
        className="avatar-body-component relative origin-center scale-90 sm:scale-95 md:scale-100 cursor-pointer"
        style={{ width: 290, height: 310, position: 'relative', ...gpuLayer }}
        animate={getBodyAnimation()}
      >
        {/* 0. Sombra de Contacto y Profundidad en el Suelo (Anclaje espacial 3D) */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            bottom: currentOffsets.bodyBottom - 8,
            left: '50%',
            x: '-50%',
            width: currentOffsets.bodyWidth * 0.88,
            height: 22,
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0) 80%)',
            zIndex: 2,
            ...gpuLayer,
          }}
          animate={
            isCelebrating || isTapJumping
              ? { scale: [1, 0.72, 1], opacity: [0.6, 0.25, 0.6], transition: { repeat: isCelebrating ? Infinity : 0, duration: 0.45 } }
              : { scale: [1, 0.96, 1], opacity: [0.45, 0.38, 0.45], transition: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' } }
          }
        />

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
            filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.28))',
          }}
        />

        {/* 2. Ala Izquierda articulada (anclaje anatómico en el hombro con sombra de oclusión) */}
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
            filter: 'drop-shadow(0px 6px 12px rgba(0,0,0,0.24))',
            ...gpuLayer,
          }}
          animate={getWingAnimation('left')}
        />

        {/* 3. Ala Derecha articulada (anclaje anatómico en el hombro con sombra de oclusión) */}
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
            filter: 'drop-shadow(0px 6px 12px rgba(0,0,0,0.24))',
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
            x: mouseOffset ? mouseOffset.x * 14 : 0,
            y: mouseOffset ? mouseOffset.y * 10 : 0,
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
              filter: 'drop-shadow(0px 8px 14px rgba(0,0,0,0.38))',
            }}
          />

          {/* Dynamic Interactive Eye Tracking Layer (anatómicamente alineado con cabeza.png) */}
          {eyeTrackingEnabled && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 25 }}
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="turpialIrisLive" cx="40%" cy="38%" r="60%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="30%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#451a03" />
                </radialGradient>
              </defs>

              {/* Left Eye Interactive Pupil & Iris */}
              <g
                style={{
                  transformOrigin: `${eyeLX}% ${eyeLY}%`,
                  transform: `translate(${
                    (mouseOffset ? mouseOffset.x * 3.6 * eyeLookIntensity : 0) + (isThinking ? 1.4 : 0)
                  }px, ${
                    (mouseOffset ? mouseOffset.y * 2.8 * eyeLookIntensity : 0) + (isThinking ? -1.4 : 0)
                  }px) scaleY(${isBlinking ? 0.08 : 1})`,
                  transition: isBlinking ? 'transform 0.08s ease-in-out' : 'transform 0.04s ease-out',
                }}
              >
                {/* Iris exterior ámbar / dorado */}
                <ellipse
                  cx={eyeLX}
                  cy={eyeLY}
                  rx={5.4 * eyeScale}
                  ry={6.2 * eyeScale}
                  fill="url(#turpialIrisLive)"
                  opacity="0.96"
                />
                {/* Pupila profunda obsidiana */}
                <ellipse
                  cx={eyeLX}
                  cy={eyeLY}
                  rx={3.3 * eyeScale}
                  ry={4.2 * eyeScale}
                  fill="#09090b"
                />
                {/* Brillo especular principal */}
                <circle
                  cx={eyeLX - 1.5 * eyeScale}
                  cy={eyeLY - 1.8 * eyeScale}
                  r={1.5 * eyeScale}
                  fill="#ffffff"
                />
                {/* Brillo secundario de realismo */}
                <circle
                  cx={eyeLX + 1.6 * eyeScale}
                  cy={eyeLY + 1.8 * eyeScale}
                  r={0.8 * eyeScale}
                  fill="#ffffff"
                  opacity="0.92"
                />
              </g>

              {/* Right Eye Interactive Pupil & Iris */}
              <g
                style={{
                  transformOrigin: `${eyeRX}% ${eyeRY}%`,
                  transform: `translate(${
                    (mouseOffset ? mouseOffset.x * 3.6 * eyeLookIntensity : 0) + (isThinking ? 1.4 : 0)
                  }px, ${
                    (mouseOffset ? mouseOffset.y * 2.8 * eyeLookIntensity : 0) + (isThinking ? -1.4 : 0)
                  }px) scaleY(${isBlinking ? 0.08 : 1})`,
                  transition: isBlinking ? 'transform 0.08s ease-in-out' : 'transform 0.04s ease-out',
                }}
              >
                {/* Iris exterior ámbar / dorado */}
                <ellipse
                  cx={eyeRX}
                  cy={eyeRY}
                  rx={5.4 * eyeScale}
                  ry={6.2 * eyeScale}
                  fill="url(#turpialIrisLive)"
                  opacity="0.96"
                />
                {/* Pupila profunda obsidiana */}
                <ellipse
                  cx={eyeRX}
                  cy={eyeRY}
                  rx={3.3 * eyeScale}
                  ry={4.2 * eyeScale}
                  fill="#09090b"
                />
                {/* Brillo especular principal */}
                <circle
                  cx={eyeRX - 1.5 * eyeScale}
                  cy={eyeRY - 1.8 * eyeScale}
                  r={1.5 * eyeScale}
                  fill="#ffffff"
                />
                {/* Brillo secundario de realismo */}
                <circle
                  cx={eyeRX + 1.6 * eyeScale}
                  cy={eyeRY + 1.8 * eyeScale}
                  r={0.8 * eyeScale}
                  fill="#ffffff"
                  opacity="0.92"
                />
              </g>

              {/* Reflejos de cristal de gafas (movimiento óptico sutil inverso al cursor) */}
              <ellipse
                cx={eyeLX + (mouseOffset ? -mouseOffset.x * 2.2 : 0)}
                cy={eyeLY - 1.8 + (mouseOffset ? -mouseOffset.y * 1.8 : 0)}
                rx={7.2 * eyeScale}
                ry={3.6 * eyeScale}
                fill="#ffffff"
                opacity="0.16"
                transform={`rotate(-22 ${eyeLX} ${eyeLY})`}
              />
              <ellipse
                cx={eyeRX + (mouseOffset ? -mouseOffset.x * 2.2 : 0)}
                cy={eyeRY - 1.8 + (mouseOffset ? -mouseOffset.y * 1.8 : 0)}
                rx={7.2 * eyeScale}
                ry={3.6 * eyeScale}
                fill="#ffffff"
                opacity="0.16"
                transform={`rotate(-22 ${eyeRX} ${eyeRY})`}
              />
            </svg>
          )}

          {/* ======================================================== */}
          {/* SISTEMA DE BOCA / PICO Y LIP-SYNC INTELIGENTE (4 MODOS)   */}
          {/* ======================================================== */}

          {/* MODO A: SPRITE SWAP / BOCA FLUIDA SIN COSTURAS (Recomendado) */}
          {(currentOffsets.beakMode === 'sprite_swap' || !currentOffsets.beakMode) && (
            <motion.div
              style={{
                position: 'absolute',
                top: beakTop,
                left: beakLeft,
                width: beakWidth,
                height: beakWidth * beakHeightRatio,
                zIndex: 26,
                transformOrigin: '50% 15%',
                pointerEvents: 'none',
                ...gpuLayer,
              }}
              animate={
                isPreviewMouthActive
                  ? {
                      scaleY: Math.max(0.18, previewMouthRatio),
                      scaleX: 1.0,
                      opacity: 1,
                      transition: { duration: 0.06 },
                    }
                  : isSpeakingEffective
                  ? {
                      scaleY: mouthIntensity > 0 ? [0.2, 0.25 + mouthIntensity * 0.85, 0.3] : [0.15, 0.85, 0.25, 0.95, 0.2],
                      scaleX: [0.96, 1.04, 0.98],
                      opacity: [0.92, 1, 0.95],
                      transition: { repeat: Infinity, duration: 0.28, ease: 'easeInOut' },
                    }
                  : { scaleY: 0, opacity: 0, transition: { duration: 0.15 } }
              }
            >
              {/* Cavidad bucal limpia estilizada que casa con el pico del Turpial */}
              <svg viewBox="0 0 48 32" className="w-full h-full overflow-visible" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.45))">
                <defs>
                  <linearGradient id="beakMouthCavity" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2a0808" />
                    <stop offset="100%" stopColor="#450a0a" />
                  </linearGradient>
                </defs>
                {/* Cavidad interior */}
                <path
                  d="M 4 8 C 12 18, 36 18, 44 8 C 36 28, 12 28, 4 8 Z"
                  fill="url(#beakMouthCavity)"
                />
                {/* Lengua rosada expresiva */}
                <ellipse
                  cx="24"
                  cy="19"
                  rx="9"
                  ry="4.5"
                  fill="#f87171"
                />
                {/* Borde sutil del pico inferior para rematar */}
                <path
                  d="M 4 8 C 12 28, 36 28, 44 8"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          )}

          {/* MODO B: ANATÓMICO (Pico superior + inferior móvil) */}
          {currentOffsets.beakMode === 'anatomical' && (
            <>
              <img
                src={picoSupSrc}
                alt="Pico Superior"
                onError={() => handleImageError(picoSupSrc, setPicoSupSrc, 'pico_sup')}
                style={{
                  position: 'absolute',
                  top: currentOffsets.beakSupTop ?? 82,
                  left: currentOffsets.beakSupLeft ?? 58,
                  width: (currentOffsets.beakSupWidth ?? 42) * beakScale,
                  zIndex: 22,
                  pointerEvents: 'none',
                }}
              />
              <motion.img
                src={picoInfSrc}
                alt="Pico Inferior"
                onError={() => handleImageError(picoInfSrc, setPicoInfSrc, 'pico_inf')}
                style={{
                  position: 'absolute',
                  top: beakTop,
                  left: beakLeft,
                  width: beakWidth,
                  zIndex: 21,
                  transformOrigin: '50% 10%',
                  pointerEvents: 'none',
                  ...gpuLayer,
                }}
                animate={{
                  y: isPreviewMouthActive
                    ? previewMouthRatio * beakOpenDistance
                    : isSpeakingEffective
                    ? mouthIntensity > 0
                      ? [0, mouthIntensity * beakOpenDistance, 2]
                      : [0, beakOpenDistance * 0.85, 1, beakOpenDistance, 0]
                    : 0,
                  transition: isPreviewMouthActive
                    ? { duration: 0.06 }
                    : isSpeakingEffective
                    ? { repeat: Infinity, duration: 0.24, ease: 'easeInOut' as const }
                    : springTransition,
                }}
              />
            </>
          )}

          {/* MODO C: SOLO INFERIOR */}
          {currentOffsets.beakMode === 'lower_only' && (
            <motion.img
              src={picoInfSrc}
              alt="Pico Inferior"
              onError={() => handleImageError(picoInfSrc, setPicoInfSrc, 'pico_inf')}
              style={{
                position: 'absolute',
                top: beakTop,
                left: beakLeft,
                width: beakWidth,
                zIndex: 21,
                transformOrigin: '50% 10%',
                pointerEvents: 'none',
                ...gpuLayer,
              }}
              animate={{
                y: isPreviewMouthActive
                  ? previewMouthRatio * beakOpenDistance
                  : isSpeakingEffective
                  ? mouthIntensity > 0
                    ? [0, mouthIntensity * beakOpenDistance, 1]
                    : [0, beakOpenDistance * 0.85, 1, beakOpenDistance, 0]
                  : 0,
                transition: isPreviewMouthActive
                  ? { duration: 0.06 }
                  : isSpeakingEffective
                  ? { repeat: Infinity, duration: 0.24, ease: 'easeInOut' as const }
                  : springTransition,
              }}
            />
          )}

          {/* Guía Visual y Cuadrícula de Calibración de Boca / Pico */}
          {showMouthGuide && (
            <div
              style={{
                position: 'absolute',
                top: beakTop - 2,
                left: beakLeft - 2,
                width: beakWidth + 4,
                height: beakWidth * beakHeightRatio + 4,
                border: '1.5px dashed #f59e0b',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.16)',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.45)',
                zIndex: 30,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="text-[8px] font-mono font-bold text-amber-200 bg-slate-950/90 px-1 py-0.5 rounded shadow border border-amber-500/30">
                X:{Math.round(beakLeft)} Y:{Math.round(beakTop)}
              </span>
            </div>
          )}

          {/* MODO D: HIDDEN / ARTE PURO (No renderiza nada encima) */}
        </motion.div>

        {/* 5. Cadena y Medalla de Honor con física pendular e inercia retardada */}
        {currentOffsets.medalsCount > 0 && (
          <motion.div
            style={{
              position: 'absolute',
              top: currentOffsets.medalTop,
              left: currentOffsets.medalLeft,
              width: currentOffsets.medalWidth,
              zIndex: 25,
              transformOrigin: '50% 0%',
              pointerEvents: 'none',
              ...gpuLayer,
            }}
            animate={{
              rotate: isCelebrating || isTapJumping
                ? [-6, 6, -5, 5, 0]
                : isSpeakingEffective
                ? [-1.8, 1.8, -1.2, 1.2, 0]
                : isThinking
                ? -3.5
                : [0, 1.2, 0, -1.2, 0],
              y: isCelebrating || isTapJumping ? [0, -4, 2, 0] : isSpeakingEffective ? [0, 1, 0] : [0, 2, 0],
              transition: {
                rotate: {
                  repeat: isCelebrating || isSpeakingEffective ? Infinity : Infinity,
                  duration: isCelebrating ? 0.45 : isSpeakingEffective ? 1.4 : 3.2,
                  ease: 'easeInOut',
                },
                y: {
                  repeat: Infinity,
                  duration: isCelebrating ? 0.5 : 2.8,
                  ease: 'easeInOut',
                  delay: 0.12, // Inercia física retardada respecto a la respiración del pecho
                },
              },
            }}
          >
            {/* Cadena Dorada */}
            <img
              src={`${assetsBasePath}/cadena.png`}
              alt="Cadena de Honor"
              style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                width: currentOffsets.medalWidth * 1.05,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.35))',
              }}
            />

            {/* Medalla de Oro BET */}
            <img
              src={medallaSrc}
              alt="Medalla BET"
              onError={() => handleImageError(medallaSrc, setMedallaSrc, 'medalla')}
              style={{
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(0px 6px 12px rgba(0,0,0,0.42))',
              }}
            />

            {/* Destello de luz especular en el oro */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(254,240,138,0.4) 50%, rgba(255,255,255,0) 80%)',
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.6, 1.4, 0.6],
                transition: { repeat: Infinity, duration: 3.6, repeatDelay: 2 },
              }}
            />
          </motion.div>
        )}

        {/* 6. Capa opcional de accesorios externos (Sombreros, Coronas, etc.) */}
        {accessory && renderAccessoryOverlay && (
          <svg
            viewBox="0 0 280 340"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 35 }}
          >
            {renderAccessoryOverlay(accessory)}
          </svg>
        )}
      </motion.div>
    </div>
  );
};
