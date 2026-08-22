import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RotateCw, RotateCcw, RefreshCw, MoveHorizontal, FileCode2, Feather } from "lucide-react";
import { AvatarAnimationState, AvatarConfig, GlbDiagnosticReport } from "../types";
import { AvianRigController } from "../utils/avianGlbEngine";
import { GlbDiagnosticModal } from "./GlbDiagnosticModal";

interface AvatarCanvasProps {
  config: AvatarConfig;
  animationState: AvatarAnimationState;
  mouthIntensity?: number; // 0 a 1
  isListening?: boolean;
  onMascotClick?: () => void;
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  config,
  animationState,
  mouthIntensity = 0,
  isListening = false,
  onMascotClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [glbReport, setGlbReport] = useState<GlbDiagnosticReport | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);
  const [rotationY, setRotationY] = useState<number>(() => {
    if (config.glbRotationY !== undefined) return config.glbRotationY;
    return config.customGlbUrl ? Math.PI : 0;
  });

  const stateRef = useRef({
    animationState,
    mouthIntensity,
    isListening,
    config,
    mouseTarget: { x: 0, y: 0 },
    userRotY: config.glbRotationY !== undefined ? config.glbRotationY : (config.customGlbUrl ? Math.PI : 0),
    isDragging: false,
    dragStartX: 0,
    dragStartRotY: 0,
  });

  useEffect(() => {
    stateRef.current.animationState = animationState;
    stateRef.current.mouthIntensity = mouthIntensity;
    stateRef.current.isListening = isListening;
    stateRef.current.config = config;
  }, [animationState, mouthIntensity, isListening, config]);

  useEffect(() => {
    stateRef.current.userRotY = rotationY;
  }, [rotationY]);

  const handleRotateBy = (deltaRad: number) => {
    setRotationY((prev) => {
      const next = (prev + deltaRad) % (Math.PI * 2);
      stateRef.current.userRotY = next;
      return next;
    });
  };

  const handleResetFront = () => {
    const defaultFront = config.customGlbUrl ? Math.PI : 0;
    setRotationY(defaultFront);
    stateRef.current.userRotY = defaultFront;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 420;

    // 1. Escena, Cámara y Niebla de Ambiente
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d1117, 0.1);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.42, 2.7);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Grupo Principal del Personaje
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // 3. Plataforma Tecnológica Base
    const platformGeometry = new THREE.CylinderGeometry(1.0, 1.15, 0.06, 36);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x161b22,
      roughness: 0.3,
      metalness: 0.8,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.03;
    characterGroup.add(platform);

    // Anillo Neón Holográfico
    const ringGeometry = new THREE.TorusGeometry(1.05, 0.02, 16, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.07;
    characterGroup.add(ring);

    // 4. Iluminación de Estudio Profesional
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.6);
    keyLight.position.set(2.5, 3.5, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    fillLight.position.set(-2.5, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x8b5cf6, 2.2, 6);
    rimLight.position.set(0, 2.5, -1.5);
    scene.add(rimLight);

    // Elementos animados dinámicos
    let headGroup: THREE.Group = new THREE.Group();
    let mouthMesh: THREE.Mesh | null = null;
    let mouthCavity: THREE.Mesh | null = null;
    let mouthBaseY: number = -0.115;
    let beakLower: THREE.Mesh | null = null;
    let wingsGroup: THREE.Group | null = null;
    let dinoJawMesh: THREE.Group | THREE.Mesh | null = null;
    let dinoArmsGroup: THREE.Group | null = null;
    let goombaFeetGroup: THREE.Group | null = null;
    let marioMustacheGroup: THREE.Group | null = null;

    // Variables de Control Procedural para Modelos 3D .GLB
    let customGlbScene: THREE.Group | null = null;
    let customGlbMixer: THREE.AnimationMixer | null = null;
    let customGlbBaseScale = 1.0;
    let customGlbBasePos = new THREE.Vector3(0, 0, 0);
    const customMorphMeshes: { mesh: THREE.Mesh; targetIndices: number[] }[] = [];
    let avianRigController: AvianRigController | null = null;
    let celebrationUntil = 0;

    // Helper: Crear Ojo Pixar 3D
    const createCartoonEye = (irisHex: number = 0x2563eb, scale: number = 1) => {
      const eyeGroup = new THREE.Group();
      
      const eyeball = new THREE.Mesh(
        new THREE.SphereGeometry(0.046 * scale, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
      );
      eyeball.scale.set(1, 1.15, 0.75);
      eyeGroup.add(eyeball);

      const iris = new THREE.Mesh(
        new THREE.CylinderGeometry(0.023 * scale, 0.023 * scale, 0.008 * scale, 20),
        new THREE.MeshStandardMaterial({ color: irisHex, roughness: 0.2 })
      );
      iris.rotation.x = Math.PI / 2;
      iris.position.set(0, 0, 0.034 * scale);

      const pupil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012 * scale, 0.012 * scale, 0.01 * scale, 20),
        new THREE.MeshBasicMaterial({ color: 0x09090b })
      );
      pupil.rotation.x = Math.PI / 2;
      pupil.position.set(0, 0, 0.038 * scale);
      iris.add(pupil);

      const sparkle = new THREE.Mesh(
        new THREE.SphereGeometry(0.006 * scale, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      sparkle.position.set(0.009 * scale, 0.009 * scale, 0.042 * scale);
      iris.add(sparkle);

      eyeGroup.add(iris);
      return eyeGroup;
    };

    // ==========================================
    // CONSTRUCCIÓN DEL AVATAR SEGÚN EL PRESET
    // ==========================================
    const buildAvatarModel = () => {
      headGroup = new THREE.Group();
      headGroup.position.set(0, 1.36, 0);
      characterGroup.add(headGroup);

      const buildProceduralAvatar = () => {
        const preset = config.preset;

        // ----------------------------------------------------
        // CASO 1: TURPIAL VENEZOLANO BET (Ave con Medalla BET)
        // ----------------------------------------------------
        if (preset === "bet_turpial" || preset === "bet_guacharaca") {
        const isTurpial = preset === "bet_turpial";
        const bodyColor = isTurpial ? 0xf59e0b : 0xa8a29e; // Golden orange / earthy brown
        const headColor = isTurpial ? 0x18181b : 0x78716c; // Black hood / brown
        
        const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.5 });
        const blackMat = new THREE.MeshStandardMaterial({ color: headColor, roughness: 0.4 });
        const beakMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.3 });

        // Cuerpo / Pecho
        const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), bodyMat);
        chest.scale.set(0.9, 1.1, 0.95);
        chest.position.set(0, -0.08, 0);
        headGroup.add(chest);

        // Cabeza con capucha negra/marrón
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), blackMat);
        headMesh.position.set(0, 0.12, 0.04);
        headGroup.add(headMesh);

        // Antifaz azul celeste característico del Turpial
        if (isTurpial) {
          const eyePatchGeo = new THREE.SphereGeometry(0.065, 16, 16);
          const eyePatchMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
          const leftPatch = new THREE.Mesh(eyePatchGeo, eyePatchMat);
          leftPatch.position.set(-0.08, 0.14, 0.18);
          leftPatch.scale.set(1.1, 0.8, 0.3);
          headGroup.add(leftPatch);

          const rightPatch = leftPatch.clone();
          rightPatch.position.x = 0.08;
          headGroup.add(rightPatch);
        }

        // Ojos
        const leftEye = createCartoonEye(isTurpial ? 0x0284c7 : 0x78350f, 0.9);
        leftEye.position.set(-0.075, 0.14, 0.19);
        headGroup.add(leftEye);

        const rightEye = createCartoonEye(isTurpial ? 0x0284c7 : 0x78350f, 0.9);
        rightEye.position.set(0.075, 0.14, 0.19);
        headGroup.add(rightEye);

        // Pico Superior
        const beakUpper = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 16), beakMat);
        beakUpper.rotation.x = Math.PI / 2.1;
        beakUpper.position.set(0, 0.09, 0.28);
        headGroup.add(beakUpper);

        // Pico Inferior (Articulado para Lip-Sync)
        beakLower = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 16), beakMat);
        beakLower.rotation.x = Math.PI / 1.95;
        beakLower.position.set(0, 0.06, 0.26);
        headGroup.add(beakLower);

        // Medalla BET Dorada con Cinta Tricolor / Azul
        const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
        const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.012, 12, 32), ribbonMat);
        ribbon.position.set(0, -0.04, 0.1);
        ribbon.rotation.x = Math.PI / 2.8;
        headGroup.add(ribbon);

        const medalMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
        const medal = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.01, 24), medalMat);
        medal.rotation.x = Math.PI / 2;
        medal.position.set(0, -0.16, 0.22);
        headGroup.add(medal);

        // Libro para Guacharaca
        if (!isTurpial) {
          const bookMat = new THREE.MeshStandardMaterial({ color: 0x991b1b });
          const book = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.04), bookMat);
          book.position.set(0, -0.28, 0.22);
          book.rotation.x = -Math.PI / 4;
          headGroup.add(book);
        }
      }

      // ----------------------------------------------------
      // CASO 2: OSO FRONTINO BET (Oso Andino con Chaleco)
      // ----------------------------------------------------
      else if (preset === "bet_frontino") {
        const furMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.6 });
        const creamMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 }); // Mascara anteojos
        const vestMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }); // Chaleco safari

        // Cabeza
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32), furMat);
        headMesh.scale.set(1.05, 1.0, 0.95);
        headGroup.add(headMesh);

        // Orejas redondas de oso
        const earLeft = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), furMat);
        earLeft.position.set(-0.19, 0.2, 0.02);
        headGroup.add(earLeft);

        const earRight = earLeft.clone();
        earRight.position.x = 0.19;
        headGroup.add(earRight);

        // "Anteojos" claros característicos alrededor de los ojos
        const spectacledLeft = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), creamMat);
        spectacledLeft.position.set(-0.08, 0.05, 0.18);
        spectacledLeft.scale.set(1.0, 0.9, 0.4);
        headGroup.add(spectacledLeft);

        const spectacledRight = spectacledLeft.clone();
        spectacledRight.position.x = 0.08;
        headGroup.add(spectacledRight);

        // Hocico
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), creamMat);
        snout.position.set(0, -0.04, 0.22);
        snout.scale.set(1.0, 0.8, 0.9);
        headGroup.add(snout);

        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), new THREE.MeshBasicMaterial({ color: 0x09090b }));
        nose.position.set(0, 0.01, 0.31);
        headGroup.add(nose);

        // Ojos
        const leftEye = createCartoonEye(0x451a03, 0.85);
        leftEye.position.set(-0.075, 0.05, 0.22);
        headGroup.add(leftEye);

        const rightEye = createCartoonEye(0x451a03, 0.85);
        rightEye.position.set(0.075, 0.05, 0.22);
        headGroup.add(rightEye);

        // Boca para Lip-Sync
        mouthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.02), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
        mouthMesh.position.set(0, -0.07, 0.28);
        headGroup.add(mouthMesh);

        mouthCavity = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.01, 0.015), new THREE.MeshBasicMaterial({ color: 0x1c1917 }));
        mouthCavity.position.set(0, -0.07, 0.27);
        headGroup.add(mouthCavity);

        // Torso & Chaleco Safari BET
        const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.36, 24), vestMat);
        shoulders.position.set(0, -0.42, 0);
        headGroup.add(shoulders);

        // Pin BET en el chaleco
        const pin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.02), new THREE.MeshStandardMaterial({ color: 0x2563eb }));
        pin.position.set(0.12, -0.32, 0.25);
        headGroup.add(pin);
      }

      // ----------------------------------------------------
      // CASO 3: CUNAGUARO / OCELOTE BET (Gorra Azul BET)
      // ----------------------------------------------------
      else if (preset === "bet_cunaguaro") {
        const furMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
        const snoutMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
        const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 }); // Gorra azul

        // Cabeza felina
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), furMat);
        headMesh.scale.set(1.05, 0.98, 0.95);
        headGroup.add(headMesh);

        // Orejas puntiagudas de gato/ocelote
        const earGeo = new THREE.ConeGeometry(0.08, 0.14, 16);
        const earLeft = new THREE.Mesh(earGeo, furMat);
        earLeft.position.set(-0.16, 0.22, 0);
        earLeft.rotation.z = -0.35;
        headGroup.add(earLeft);

        const earRight = new THREE.Mesh(earGeo, furMat);
        earRight.position.set(0.16, 0.22, 0);
        earRight.rotation.z = 0.35;
        headGroup.add(earRight);

        // Gorra Azul BET
        const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
        capDome.position.set(0, 0.12, -0.02);
        capDome.scale.set(1.05, 0.9, 1.05);
        headGroup.add(capDome);

        // Visera de la gorra BET
        const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.015, 24, 1, false, 0, Math.PI), capMat);
        visor.rotation.x = Math.PI / 2.3;
        visor.position.set(0, 0.16, 0.18);
        headGroup.add(visor);

        // Hocico claro y nariz
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), snoutMat);
        snout.position.set(0, -0.04, 0.19);
        snout.scale.set(1.1, 0.7, 0.8);
        headGroup.add(snout);

        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.02, 3), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, -0.01, 0.27);
        headGroup.add(nose);

        // Ojos
        const leftEye = createCartoonEye(0xd97706, 0.9);
        leftEye.position.set(-0.075, 0.04, 0.2);
        headGroup.add(leftEye);

        const rightEye = createCartoonEye(0xd97706, 0.9);
        rightEye.position.set(0.075, 0.04, 0.2);
        headGroup.add(rightEye);

        // Boca para Lip-Sync
        mouthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.02), new THREE.MeshStandardMaterial({ color: 0x991b1b }));
        mouthMesh.position.set(0, -0.07, 0.25);
        headGroup.add(mouthMesh);

        mouthCavity = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.01, 0.015), new THREE.MeshBasicMaterial({ color: 0x450a0a }));
        mouthCavity.position.set(0, -0.07, 0.24);
        headGroup.add(mouthCavity);

        // Torso
        const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.34, 24), furMat);
        shoulders.position.set(0, -0.4, 0);
        headGroup.add(shoulders);
      }

      // ----------------------------------------------------
      // CASO 4: COLIBRÍ / TUCUSITO BET (Esmeralda Veloz)
      // ----------------------------------------------------
      else if (preset === "bet_tucusito") {
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.3 }); // Esmeralda iridiscente
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 });
        const beakMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2 });

        // Cuerpo estilizado
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), bodyMat);
        body.scale.set(0.85, 1.2, 0.85);
        headGroup.add(body);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), bellyMat);
        belly.position.set(0, -0.04, 0.1);
        belly.scale.set(0.9, 1.1, 0.5);
        headGroup.add(belly);

        // Ojos
        const leftEye = createCartoonEye(0x0284c7, 0.8);
        leftEye.position.set(-0.065, 0.06, 0.15);
        headGroup.add(leftEye);

        const rightEye = createCartoonEye(0x0284c7, 0.8);
        rightEye.position.set(0.065, 0.06, 0.15);
        headGroup.add(rightEye);

        // Pico largo y estilizado
        const beakUpper = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.22, 16), beakMat);
        beakUpper.rotation.x = Math.PI / 2.05;
        beakUpper.position.set(0, 0.03, 0.28);
        headGroup.add(beakUpper);

        beakLower = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.18, 16), beakMat);
        beakLower.rotation.x = Math.PI / 1.95;
        beakLower.position.set(0, 0.01, 0.26);
        headGroup.add(beakLower);

        // Alas
        wingsGroup = new THREE.Group();
        const wingGeo = new THREE.BoxGeometry(0.35, 0.01, 0.12);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.3 });
        
        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-0.25, 0, -0.05);
        leftWing.rotation.z = -0.3;
        wingsGroup.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(0.25, 0, -0.05);
        rightWing.rotation.z = 0.3;
        wingsGroup.add(rightWing);

        headGroup.add(wingsGroup);
      }

      // ----------------------------------------------------
      // CASO 5: MONOS (Tech Monkey & Monito Capuchino)
      // ----------------------------------------------------
      else if (preset === "bet_tech_monkey" || preset === "bet_capuchino") {
        const isTech = preset === "bet_tech_monkey";
        const furMat = new THREE.MeshStandardMaterial({ color: isTech ? 0x78350f : 0x9a3412, roughness: 0.6 });
        const faceMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 });

        // Cabeza
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), furMat);
        headGroup.add(headMesh);

        // Orejas grandes de mono
        const earLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 20), faceMat);
        earLeft.rotation.z = Math.PI / 2;
        earLeft.position.set(-0.22, 0.04, 0);
        headGroup.add(earLeft);

        const earRight = earLeft.clone();
        earRight.position.x = 0.22;
        headGroup.add(earRight);

        // Cara / Antifaz
        const face = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), faceMat);
        face.position.set(0, -0.02, 0.12);
        face.scale.set(1.0, 0.9, 0.5);
        headGroup.add(face);

        // Ojos
        const leftEye = createCartoonEye(0x451a03, 0.9);
        leftEye.position.set(-0.065, 0.04, 0.19);
        headGroup.add(leftEye);

        const rightEye = createCartoonEye(0x451a03, 0.9);
        rightEye.position.set(0.065, 0.04, 0.19);
        headGroup.add(rightEye);

        // Boca para Lip-Sync
        mouthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.015, 0.02), new THREE.MeshStandardMaterial({ color: 0x881337 }));
        mouthMesh.position.set(0, -0.07, 0.22);
        headGroup.add(mouthMesh);

        mouthCavity = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 0.015), new THREE.MeshBasicMaterial({ color: 0x4c0519 }));
        mouthCavity.position.set(0, -0.07, 0.21);
        headGroup.add(mouthCavity);

        // Auriculares Tech Headphones para Tech Monkey
        if (isTech) {
          const band = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 12, 32, Math.PI), new THREE.MeshStandardMaterial({ color: 0x475569 }));
          band.position.set(0, 0.08, 0);
          headGroup.add(band);

          const earpieceLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
          earpieceLeft.rotation.z = Math.PI / 2;
          earpieceLeft.position.set(-0.25, 0.04, 0);
          headGroup.add(earpieceLeft);

          const earpieceRight = earpieceLeft.clone();
          earpieceRight.position.x = 0.25;
          headGroup.add(earpieceRight);
        }

        // Torso
        const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.44, 0.35, 24), furMat);
        shoulders.position.set(0, -0.4, 0);
        headGroup.add(shoulders);
      }

      // ----------------------------------------------------
      // CASO 6: MORROCOY / TORTUGA BET (Sombrero Safari)
      // ----------------------------------------------------
      else if (preset === "bet_morrocoy") {
        const skinMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5 });
        const hatMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.4 });
        const shellMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.5 });

        // Cabeza tortuga
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), skinMat);
        headMesh.scale.set(1.0, 0.95, 1.1);
        headGroup.add(headMesh);

        // Sombrero Safari
        const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.02, 32), hatMat);
        hatBrim.position.set(0, 0.16, 0.02);
        hatBrim.rotation.x = -0.15;
        headGroup.add(hatBrim);

        const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.1, 24), hatMat);
        hatCrown.position.set(0, 0.22, 0.01);
        hatCrown.rotation.x = -0.15;
        headGroup.add(hatCrown);

        // Ojos
        const leftEye = createCartoonEye(0x15803d, 0.9);
        leftEye.position.set(-0.08, 0.03, 0.18);
        headGroup.add(leftEye);

        const rightEye = createCartoonEye(0x15803d, 0.9);
        rightEye.position.set(0.08, 0.03, 0.18);
        headGroup.add(rightEye);

        // Boca para Lip-Sync
        mouthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 0.02), new THREE.MeshStandardMaterial({ color: 0x166534 }));
        mouthMesh.position.set(0, -0.07, 0.23);
        headGroup.add(mouthMesh);

        mouthCavity = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 0.015), new THREE.MeshBasicMaterial({ color: 0x052e16 }));
        mouthCavity.position.set(0, -0.07, 0.22);
        headGroup.add(mouthCavity);

        // Caparazón dorsal BET
        const shell = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), shellMat);
        shell.scale.set(1.0, 1.2, 0.8);
        shell.position.set(0, -0.4, -0.1);
        headGroup.add(shell);
      }

      // ----------------------------------------------------
      // CASO 7: OSO HORMIGUERO / TAMANDÚA BET (Snout Largo)
      // ----------------------------------------------------
      else if (preset === "bet_hormiguero") {
        const furMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.5 });
        const darkFurMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.5 });

        // Cabeza
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), furMat);
        headGroup.add(headMesh);

        // Snout tubular largo
        const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, 0.25, 20), furMat);
        snout.rotation.x = Math.PI / 2.3;
        snout.position.set(0, -0.06, 0.22);
        headGroup.add(snout);

        // Ojos
        const leftEye = createCartoonEye(0x1c1917, 0.75);
        leftEye.position.set(-0.07, 0.05, 0.14);
        headGroup.add(leftEye);

        const rightEye = createCartoonEye(0x1c1917, 0.75);
        rightEye.position.set(0.07, 0.05, 0.14);
        headGroup.add(rightEye);

        // Boca en la punta del hocico
        mouthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.015, 0.02), new THREE.MeshBasicMaterial({ color: 0x09090b }));
        mouthMesh.position.set(0, -0.14, 0.33);
        headGroup.add(mouthMesh);

        // Torso
        const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.44, 0.36, 24), darkFurMat);
        shoulders.position.set(0, -0.42, 0);
        headGroup.add(shoulders);
      }

      // ----------------------------------------------------
      // CASO 8: MARIO & LUIGI HEROES (Super Mario Bros 3D)
      // ----------------------------------------------------
      else if (preset === "mario_hero" || preset === "luigi_hero") {
        const isLuigi = preset === "luigi_hero";
        const capColorHex = isLuigi ? 0x16a34a : 0xdc2626; // Green for Luigi, Red for Mario
        const hairColorHex = 0x3d1c06; // Dark brown
        const overallColorHex = 0x1d4ed8; // Classic Blue Overalls
        const buttonColorHex = 0xfacc15; // Yellow buttons

        const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbd2a4, roughness: 0.35 });
        const capMat = new THREE.MeshStandardMaterial({ color: capColorHex, roughness: 0.45 });
        const hairMat = new THREE.MeshStandardMaterial({ color: hairColorHex, roughness: 0.6 });
        const mustacheMat = new THREE.MeshStandardMaterial({ color: hairColorHex, roughness: 0.45 });
        const overallMat = new THREE.MeshStandardMaterial({ color: overallColorHex, roughness: 0.5 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: capColorHex, roughness: 0.45 });

        // 1. Cabeza
        const headGeo = new THREE.SphereGeometry(0.24, 32, 32);
        headGeo.scale(1.04, isLuigi ? 1.15 : 1.06, 0.98);
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        headGroup.add(headMesh);

        // Mejillas sonrosadas
        const cheekMat = new THREE.MeshStandardMaterial({ color: 0xfca5a5, roughness: 0.6, transparent: true, opacity: 0.5 });
        const cheekLeft = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), cheekMat);
        cheekLeft.scale.set(1.2, 0.8, 0.5);
        cheekLeft.position.set(-0.13, 0.0, 0.19);
        headGroup.add(cheekLeft);

        const cheekRight = cheekLeft.clone();
        cheekRight.position.x = 0.13;
        headGroup.add(cheekRight);

        // 2. Nariz grande y redonda icónica
        const noseGeo = new THREE.SphereGeometry(0.082, 24, 24);
        const noseMesh = new THREE.Mesh(noseGeo, skinMat);
        noseMesh.scale.set(1.15, 0.95, 1.08);
        noseMesh.position.set(0, 0.02, 0.24);
        headGroup.add(noseMesh);

        // 3. Grupo de Bigote Dinámico (se mueve con el habla)
        marioMustacheGroup = new THREE.Group();
        marioMustacheGroup.position.set(0, -0.04, 0.22);
        headGroup.add(marioMustacheGroup);

        // Base central del bigote
        const mustacheCenter = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), mustacheMat);
        mustacheCenter.scale.set(1.4, 0.7, 0.9);
        marioMustacheGroup.add(mustacheCenter);

        // Lóbulos curvos laterales (3 a cada lado, estilo clásico Mario/Luigi)
        for (let i = 1; i <= 3; i++) {
          const lobeL = new THREE.Mesh(new THREE.SphereGeometry(0.038 - i * 0.005, 14, 14), mustacheMat);
          lobeL.position.set(-0.045 * i, -0.01 * i, -0.008 * i);
          lobeL.scale.set(1.1, 0.85, 0.9);
          marioMustacheGroup.add(lobeL);

          const lobeR = lobeL.clone();
          lobeR.position.x = 0.045 * i;
          marioMustacheGroup.add(lobeR);
        }

        // 4. Ojos Azules Brillantes Nintendo / Pixar
        const leftEye = createCartoonEye(0x0284c7, 0.95);
        leftEye.position.set(-0.078, 0.08, 0.19);
        headGroup.add(leftEye);

        const rightEye = createCartoonEye(0x0284c7, 0.95);
        rightEye.position.set(0.078, 0.08, 0.19);
        headGroup.add(rightEye);

        // Cejas expresivas
        const browMat = mustacheMat;
        const browLeft = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.028, 0.03), browMat);
        browLeft.position.set(-0.08, 0.16, 0.2);
        browLeft.rotation.z = -0.15;
        headGroup.add(browLeft);

        const browRight = browLeft.clone();
        browRight.position.x = 0.08;
        browRight.rotation.z = 0.15;
        headGroup.add(browRight);

        // 5. Gorra Roja / Verde con Visera y Emblema Circular
        const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.7), capMat);
        capDome.position.set(0, isLuigi ? 0.17 : 0.14, -0.02);
        capDome.scale.set(1.06, 0.95, 1.12);
        headGroup.add(capDome);

        // Visera curvada hacia adelante
        const capBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.028, 32, 1, false, 0, Math.PI), capMat);
        capBrim.rotation.x = Math.PI / 2.2;
        capBrim.position.set(0, isLuigi ? 0.2 : 0.18, 0.18);
        headGroup.add(capBrim);

        // Emblema Blanco Circular en la Gorra
        const emblemBadge = new THREE.Mesh(
          new THREE.CylinderGeometry(0.068, 0.068, 0.015, 24),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
        );
        emblemBadge.rotation.x = Math.PI / 2.2;
        emblemBadge.position.set(0, isLuigi ? 0.28 : 0.26, 0.16);
        headGroup.add(emblemBadge);

        // Letra 'M' o 'L' en el emblema
        const letterMat = new THREE.MeshStandardMaterial({ color: capColorHex, roughness: 0.3 });
        const letterMesh = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.012), letterMat);
        letterMesh.position.set(0, isLuigi ? 0.28 : 0.26, 0.175);
        letterMesh.rotation.x = Math.PI / 2.2;
        headGroup.add(letterMesh);

        // 6. Patillas y Pelo Trasero
        const sideburnLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.06), hairMat);
        sideburnLeft.position.set(-0.22, 0.02, 0.08);
        headGroup.add(sideburnLeft);

        const sideburnRight = sideburnLeft.clone();
        sideburnRight.position.x = 0.22;
        headGroup.add(sideburnRight);

        // Pelo trasero en bucle
        const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), hairMat);
        hairBack.scale.set(1.8, 0.9, 1.0);
        hairBack.position.set(0, -0.06, -0.16);
        headGroup.add(hairBack);

        // 7. Boca Expresiva para Lip-Sync (Apertura sincronizada con la voz)
        mouthBaseY = -0.095;
        mouthMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.085, 0.022, 0.025),
          new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.3 })
        );
        mouthMesh.position.set(0, mouthBaseY, 0.21);
        headGroup.add(mouthMesh);

        mouthCavity = new THREE.Mesh(
          new THREE.BoxGeometry(0.068, 0.016, 0.02),
          new THREE.MeshBasicMaterial({ color: 0x450a0a })
        );
        mouthCavity.position.set(0, mouthBaseY, 0.205);
        headGroup.add(mouthCavity);

        // Dientes y lengua visibles al hablar
        const tongueMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0xf43f5e })
        );
        tongueMesh.position.set(0, mouthBaseY - 0.005, 0.21);
        tongueMesh.scale.set(1.2, 0.6, 0.8);
        headGroup.add(tongueMesh);

        // 8. Torso: Camisa Roja/Verde + Peto Overol Azul
        const shirtTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 0.36, 24), shirtMat);
        shirtTorso.position.set(0, -0.42, 0);
        headGroup.add(shirtTorso);

        // Tirantes del peto azul
        const strapLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.03), overallMat);
        strapLeft.position.set(-0.14, -0.38, 0.22);
        strapLeft.rotation.z = -0.1;
        headGroup.add(strapLeft);

        const strapRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.03), overallMat);
        strapRight.position.set(0.14, -0.38, 0.22);
        strapRight.rotation.z = 0.1;
        headGroup.add(strapRight);

        // Botones amarillos dorados
        const btnGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.015, 16);
        const btnMat = new THREE.MeshStandardMaterial({ color: buttonColorHex, metalness: 0.4, roughness: 0.2 });

        const btnLeft = new THREE.Mesh(btnGeo, btnMat);
        btnLeft.rotation.x = Math.PI / 2;
        btnLeft.position.set(-0.14, -0.32, 0.24);
        headGroup.add(btnLeft);

        const btnRight = btnLeft.clone();
        btnRight.position.x = 0.14;
        headGroup.add(btnRight);

        // Guantes blancos icónicos
        const gloveMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const gloveL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), gloveMat);
        gloveL.position.set(-0.32, -0.45, 0.12);
        headGroup.add(gloveL);

        const gloveR = gloveL.clone();
        gloveR.position.x = 0.32;
        headGroup.add(gloveR);
      }

      // ----------------------------------------------------
      // CASO 9: GOOMBA (Super Mario Bros 3D con Boca Animada)
      // ----------------------------------------------------
      else if (preset === "goomba_shroom") {
        const capMat = new THREE.MeshStandardMaterial({ color: 0x853818, roughness: 0.45 });
        const stemMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
        const browMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
        const fangMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
        const footMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });

        // 1. Cabeza / Domo Champiñón Marrón (Forma clásica Goomba ancha abajo)
        const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), capMat);
        capDome.scale.set(1.25, 0.92, 1.15);
        capDome.position.set(0, 0.08, 0);
        headGroup.add(capDome);

        // Borde inferior ensanchado del champiñón
        const capBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.33, 0.08, 32), capMat);
        capBrim.position.set(0, -0.06, 0);
        headGroup.add(capBrim);

        // 2. Tallo / Cuerpo Crema
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.26, 24), stemMat);
        stem.position.set(0, -0.22, 0);
        headGroup.add(stem);

        // 3. Ojos grandes ovales blancos con pupilas negras
        const eyeGeo = new THREE.SphereGeometry(0.065, 20, 20);
        
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.scale.set(0.85, 1.35, 0.6);
        leftEye.position.set(-0.09, 0.06, 0.32);
        headGroup.add(leftEye);

        const leftPupil = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 16), pupilMat);
        leftPupil.rotation.x = Math.PI / 2;
        leftPupil.position.set(-0.085, 0.06, 0.36);
        headGroup.add(leftPupil);

        const rightEye = leftEye.clone();
        rightEye.position.x = 0.09;
        headGroup.add(rightEye);

        const rightPupil = leftPupil.clone();
        rightPupil.position.x = 0.085;
        headGroup.add(rightPupil);

        // 4. Cejas Negras Gruesas Inclinadas (Expresión clásica Goomba)
        const browGeo = new THREE.BoxGeometry(0.12, 0.038, 0.04);
        
        const browLeft = new THREE.Mesh(browGeo, browMat);
        browLeft.position.set(-0.09, 0.17, 0.32);
        browLeft.rotation.z = -0.36; // Inclinada hacia el centro
        headGroup.add(browLeft);

        const browRight = new THREE.Mesh(browGeo, browMat);
        browRight.position.set(0.09, 0.17, 0.32);
        browRight.rotation.z = 0.36; // Inclinada hacia el centro
        headGroup.add(browRight);

        // 5. Boca y Colmillos Blancos hacia Arriba para Lip-Sync
        mouthBaseY = -0.09;
        mouthMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.03, 0.03),
          new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.3 })
        );
        mouthMesh.position.set(0, mouthBaseY, 0.31);
        headGroup.add(mouthMesh);

        mouthCavity = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, 0.022, 0.025),
          new THREE.MeshBasicMaterial({ color: 0x3f0713 })
        );
        mouthCavity.position.set(0, mouthBaseY, 0.3);
        headGroup.add(mouthCavity);

        // Dos colmillos puntiagudos que apuntan hacia ARRIBA desde la mandíbula inferior
        const fangGeo = new THREE.ConeGeometry(0.02, 0.045, 12);
        fangGeo.rotateX(Math.PI); // Punta hacia arriba

        const fangLeft = new THREE.Mesh(fangGeo, fangMat);
        fangLeft.position.set(-0.045, mouthBaseY + 0.015, 0.32);
        headGroup.add(fangLeft);

        const fangRight = new THREE.Mesh(fangGeo, fangMat);
        fangRight.position.set(0.045, mouthBaseY + 0.015, 0.32);
        headGroup.add(fangRight);

        // 6. Pies Ovalados Oscuros que caminan (Goomba Waddle)
        goombaFeetGroup = new THREE.Group();
        goombaFeetGroup.position.set(0, -0.36, 0.05);
        headGroup.add(goombaFeetGroup);

        const footGeo = new THREE.SphereGeometry(0.11, 16, 16);
        
        const footL = new THREE.Mesh(footGeo, footMat);
        footL.scale.set(1.2, 0.6, 1.4);
        footL.position.set(-0.16, 0, 0);
        goombaFeetGroup.add(footL);

        const footR = footL.clone();
        footR.position.x = 0.16;
        goombaFeetGroup.add(footR);
      }

      // ----------------------------------------------------
      // CASO 10: REXY EL T-REX AMIGABLE (Dinosaurio 3D para Niños)
      // ----------------------------------------------------
      else if (preset === "trex_friendly") {
        const dinoSkinMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 });
        const dinoBellyMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 });
        const spikeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
        const toothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

        // 1. Cabeza y Hocico de T-Rex
        const headMain = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 24), dinoSkinMat);
        headMain.scale.set(1.0, 1.15, 1.1);
        headMain.position.set(0, 0.05, 0);
        headGroup.add(headMain);

        // Hocico Superior Redondo y Amigable
        const snoutTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.28), dinoSkinMat);
        snoutTop.position.set(0, 0.04, 0.22);
        headGroup.add(snoutTop);

        // Orificios nasales del dinosaurio
        const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x14532d });
        const nostrilL = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), nostrilMat);
        nostrilL.position.set(-0.06, 0.08, 0.36);
        headGroup.add(nostrilL);

        const nostrilR = nostrilL.clone();
        nostrilR.position.x = 0.06;
        headGroup.add(nostrilR);

        // 2. Ojos Grandes y Cálidos Tipo Pixar (Ámbar / Dorado)
        const eyeL = createCartoonEye(0xf59e0b, 1.05);
        eyeL.position.set(-0.11, 0.14, 0.16);
        headGroup.add(eyeL);

        const eyeR = createCartoonEye(0xf59e0b, 1.05);
        eyeR.position.set(0.11, 0.14, 0.16);
        headGroup.add(eyeR);

        // Cresta y Espinas Naranjas en la Espalda
        for (let i = 0; i < 4; i++) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 8), spikeMat);
          spike.position.set(0, 0.26 - i * 0.08, -0.06 - i * 0.08);
          spike.rotation.x = -0.4;
          headGroup.add(spike);
        }

        // 3. Mandíbula Inferior Articulada para Lip-Sync y Rugidos
        const jawGroup = new THREE.Group();
        jawGroup.position.set(0, -0.04, 0.12);
        headGroup.add(jawGroup);
        dinoJawMesh = jawGroup;

        const jawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.25), dinoBellyMat);
        jawMesh.position.set(0, -0.04, 0.1);
        jawGroup.add(jawMesh);

        // Dientitos de caricatura amigables
        for (let i = -2; i <= 2; i++) {
          const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.03, 8), toothMat);
          tooth.position.set(i * 0.042, 0.015, 0.2);
          jawGroup.add(tooth);
        }

        mouthBaseY = -0.03;
        mouthMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.025, 0.03),
          new THREE.MeshStandardMaterial({ color: 0x991b1b })
        );
        mouthMesh.position.set(0, mouthBaseY, 0.25);
        headGroup.add(mouthMesh);

        mouthCavity = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.02, 0.025),
          new THREE.MeshBasicMaterial({ color: 0x450a0a })
        );
        mouthCavity.position.set(0, mouthBaseY, 0.24);
        headGroup.add(mouthCavity);

        // 4. Brazitos Cortos T-Rex que saludan
        dinoArmsGroup = new THREE.Group();
        dinoArmsGroup.position.set(0, -0.28, 0.18);
        headGroup.add(dinoArmsGroup);

        const armMat = dinoSkinMat;
        const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.12, 12), armMat);
        armL.rotation.z = -0.6;
        armL.position.set(-0.16, 0, 0);
        dinoArmsGroup.add(armL);

        const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.12, 12), armMat);
        armR.rotation.z = 0.6;
        armR.position.set(0.16, 0, 0);
        dinoArmsGroup.add(armR);

        // Torso verde con pecho crema
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.35, 24), dinoSkinMat);
        torso.position.set(0, -0.38, 0);
        headGroup.add(torso);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), dinoBellyMat);
        belly.scale.set(0.8, 1.2, 0.6);
        belly.position.set(0, -0.36, 0.14);
        headGroup.add(belly);
      }

      // ----------------------------------------------------
      // CASO 11: PIP EL VELOCIRAPTOR (Explorador Veloz 3D)
      // ----------------------------------------------------
      else if (preset === "raptor_dino") {
        const raptorSkinMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.4 });
        const crestMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.45 });
        const toothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

        // 1. Cabeza estilizada de Raptor
        const raptorHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), raptorSkinMat);
        raptorHead.scale.set(0.9, 1.0, 1.25);
        raptorHead.position.set(0, 0.05, 0);
        headGroup.add(raptorHead);

        // Hocico alargado y simpático
        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 16), raptorSkinMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, 0.02, 0.22);
        headGroup.add(snout);

        // 2. Cresta de Plumas Amarillas Brillantes en la Cabeza
        for (let i = 0; i < 3; i++) {
          const feather = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 8), crestMat);
          feather.rotation.x = -0.6 - i * 0.15;
          feather.position.set(0, 0.22 - i * 0.04, -0.04 - i * 0.06);
          headGroup.add(feather);
        }

        // 3. Ojos Brillantes de Explorador
        const eyeL = createCartoonEye(0x0284c7, 0.95);
        eyeL.position.set(-0.1, 0.12, 0.14);
        headGroup.add(eyeL);

        const eyeR = createCartoonEye(0x0284c7, 0.95);
        eyeR.position.set(0.1, 0.12, 0.14);
        headGroup.add(eyeR);

        // 4. Mandíbula Articulada para Lip-Sync
        const raptorJaw = new THREE.Group();
        raptorJaw.position.set(0, -0.03, 0.12);
        headGroup.add(raptorJaw);
        dinoJawMesh = raptorJaw;

        const jawLower = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.22), bellyMat);
        jawLower.position.set(0, -0.03, 0.08);
        raptorJaw.add(jawLower);

        mouthBaseY = -0.04;
        mouthMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.022, 0.025),
          new THREE.MeshStandardMaterial({ color: 0x991b1b })
        );
        mouthMesh.position.set(0, mouthBaseY, 0.26);
        headGroup.add(mouthMesh);

        mouthCavity = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.018, 0.02),
          new THREE.MeshBasicMaterial({ color: 0x450a0a })
        );
        mouthCavity.position.set(0, mouthBaseY, 0.25);
        headGroup.add(mouthCavity);

        // 5. Brazos y Torso
        dinoArmsGroup = new THREE.Group();
        dinoArmsGroup.position.set(0, -0.28, 0.14);
        headGroup.add(dinoArmsGroup);

        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), raptorSkinMat);
        armL.rotation.z = -0.4;
        armL.position.set(-0.16, 0, 0);
        dinoArmsGroup.add(armL);

        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), raptorSkinMat);
        armR.rotation.z = 0.4;
        armR.position.set(0.16, 0, 0);
        dinoArmsGroup.add(armR);

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.35, 24), raptorSkinMat);
        torso.position.set(0, -0.38, 0);
        headGroup.add(torso);
      }

      // ----------------------------------------------------
      // CASO 12: MODELOS HUMANOS (Sarah, David, Alex, Maya)
      // ----------------------------------------------------
      else {
        const skinColor = config.skinTone || "#f5d0b5";
        const skinMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(skinColor),
          roughness: 0.4,
          metalness: 0.05,
        });

        // Cabeza
        const headGeo = new THREE.SphereGeometry(0.24, 32, 32);
        headGeo.scale(1, 1.15, 0.95);
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        headGroup.add(headMesh);

        // Mejillas y Mentón
        const cheekGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const cheekMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(skinColor), roughness: 0.4 });
        
        const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
        leftCheek.position.set(-0.09, -0.06, 0.16);
        leftCheek.scale.set(0.8, 0.7, 0.8);
        headGroup.add(leftCheek);

        const rightCheek = leftCheek.clone();
        rightCheek.position.x = 0.09;
        headGroup.add(rightCheek);

        const chinMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), skinMat);
        chinMesh.position.set(0, -0.13, 0.17);
        chinMesh.scale.set(0.9, 0.6, 0.8);
        headGroup.add(chinMesh);

        // Nariz
        const noseGeo = new THREE.ConeGeometry(0.028, 0.065, 16);
        const noseMesh = new THREE.Mesh(noseGeo, skinMat);
        noseMesh.rotation.x = Math.PI / 2.2;
        noseMesh.position.set(0, -0.01, 0.235);
        headGroup.add(noseMesh);

        // Ojos
        const irisHex = config.preset === "mentor_cyber" ? 0x7c3aed : 0x2563eb;
        const leftEye = createCartoonEye(irisHex, 1.0);
        leftEye.position.set(-0.078, 0.045, 0.2);
        headGroup.add(leftEye);

        const rightEye = createCartoonEye(irisHex, 1.0);
        rightEye.position.set(0.078, 0.045, 0.2);
        headGroup.add(rightEye);

        // Cabello
        const hairColorHex = config.hairColor || "#3b2219";
        const hairMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(hairColorHex),
          roughness: 0.5,
          metalness: 0.1,
        });

        if (config.hairStyle === "bun") {
          const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 24), hairMat);
          hairBase.position.set(0, 0.05, -0.01);
          headGroup.add(hairBase);
          const bunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), hairMat);
          bunMesh.position.set(0, 0.27, -0.08);
          headGroup.add(bunMesh);
        } else {
          const hairFull = new THREE.Mesh(new THREE.SphereGeometry(0.255, 24, 24), hairMat);
          hairFull.scale.set(1.02, 1.05, 1.02);
          hairFull.position.set(0, 0.04, -0.01);
          headGroup.add(hairFull);
        }

        // Boca y Labios para Lip-Sync
        const mouthGeo = new THREE.BoxGeometry(0.075, 0.02, 0.02);
        const lipMat = new THREE.MeshStandardMaterial({ color: 0x9e4742, roughness: 0.4 });
        mouthMesh = new THREE.Mesh(mouthGeo, lipMat);
        mouthMesh.position.set(0, -0.115, 0.215);
        headGroup.add(mouthMesh);

        const cavityGeo = new THREE.BoxGeometry(0.055, 0.012, 0.015);
        mouthCavity = new THREE.Mesh(cavityGeo, new THREE.MeshBasicMaterial({ color: 0x2b0d0d }));
        mouthCavity.position.set(0, -0.115, 0.205);
        headGroup.add(mouthCavity);

        // Cuello y Hombros
        const outfitColorHex = config.outfitColor || "#1e293b";
        const outfitMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(outfitColorHex),
          roughness: 0.4,
        });

        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.115, 0.16, 20), skinMat);
        neck.position.set(0, -0.22, 0);
        headGroup.add(neck);

        const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 0.38, 24), outfitMat);
        shoulders.position.set(0, -0.44, 0);
        headGroup.add(shoulders);
      }
    };

    // CASO 0: MODELO 3D .GLB PERSONALIZADO
    if (config.customGlbUrl) {
      const loader = new GLTFLoader();
      loader.load(
        config.customGlbUrl,
        (gltf) => {
          const model = gltf.scene;
          customGlbScene = model;

          // 1. Inicializar Controlador de Rig y Cinemática Aviar / Búho
          avianRigController = new AvianRigController(gltf, config.customGlbName || "profesor_buho.glb");
          setGlbReport(avianRigController.report);

          // 2. Si el GLB ya incluye clips de animación precalculados, activarlos
          if (gltf.animations && gltf.animations.length > 0) {
            customGlbMixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
              const action = customGlbMixer!.clipAction(clip);
              action.play();
            });
          }

          headGroup.add(model);
        },
        undefined,
        (err) => {
          console.warn("No se pudo cargar el modelo GLB personalizado (URL no accesible o expirada), recurriendo al modelo 3D procedimental:", err);
          buildProceduralAvatar();
        }
      );
      return;
    }

    // Si no hay GLB personalizado o no está activo, construir procedimental
    buildProceduralAvatar();
  };

    buildAvatarModel();

    // 5. Arrastre Táctil / Mouse para Giro 360°, Clic Interactivo y Seguimiento
    let pointerStartX = 0;
    let pointerStartY = 0;

    const onPointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.dragStartX = e.clientX;
      stateRef.current.dragStartRotY = stateRef.current.userRotY;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      try {
        container.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.mouseTarget = { x, y };

      if (stateRef.current.isDragging) {
        const deltaX = e.clientX - stateRef.current.dragStartX;
        const newRot = (stateRef.current.dragStartRotY + deltaX * 0.018) % (Math.PI * 2);
        stateRef.current.userRotY = newRot;
        setRotationY(newRot);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (stateRef.current.isDragging) {
        stateRef.current.isDragging = false;
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {}

        // Si fue un toque/clic rápido (sin arrastrar), activar animación de celebración
        const dist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
        if (dist < 8) {
          celebrationUntil = clock.getElapsedTime() + 1.8;
          onMascotClick?.();
        }
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);

    // 6. Bucle de Animación y Renderizado
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const { animationState: animState, mouthIntensity: mouthInt, isListening: listening, mouseTarget, userRotY } =
        stateRef.current;

      // Actualizar AnimationMixer si el GLB vino con clips pre-grabados
      if (customGlbMixer) {
        customGlbMixer.update(delta);
      }

      // Respiración de escenario y rotación interactiva 360°
      characterGroup.position.y = Math.sin(elapsed * 2.0) * 0.012;
      characterGroup.rotation.y = userRotY;

      // Movimiento suave de la cabeza hacia el puntero
      if (headGroup) {
        headGroup.rotation.y += (mouseTarget.x * 0.22 - headGroup.rotation.y) * 0.08;
        headGroup.rotation.x += (-mouseTarget.y * 0.15 - headGroup.rotation.x) * 0.08;
      }

      // ==========================================================
      // ANIMACIÓN PROCEDURAL KINEMÁTICA PARA MODELOS 3D .GLB (BÚHO / AVE)
      // ==========================================================
      if (avianRigController) {
        avianRigController.update(
          delta,
          elapsed,
          mouseTarget,
          mouthInt,
          animState,
          listening
        );
      }

      // Animación de alas para el colibrí procedimental
      if (wingsGroup) {
        wingsGroup.children[0].rotation.y = Math.sin(elapsed * 25) * 0.4;
        wingsGroup.children[1].rotation.y = -Math.sin(elapsed * 25) * 0.4;
      }

      // Animación de habla / Lip-Sync para Avatares Procedurales Nativos
      if (mouthMesh && mouthCavity) {
        let openAmount = 0;
        if (animState === "speaking") {
          const syllablePulse = (Math.sin(elapsed * 24) + 1) * 0.5;
          openAmount = Math.max(0.15, Math.min(1.0, mouthInt * 1.35 + syllablePulse * 0.5));
        } else if (listening) {
          openAmount = 0.08;
        }
        mouthMesh.scale.y = 1 + openAmount * 2.8;
        mouthMesh.position.y = mouthBaseY - openAmount * 0.022;
        mouthCavity.scale.y = 0.1 + openAmount * 2.5;
      }

      // Animación del Bigote de Mario / Luigi con el habla
      if (marioMustacheGroup) {
        const mPulse = animState === "speaking" ? Math.sin(elapsed * 20) * 0.04 : 0;
        marioMustacheGroup.rotation.x = mPulse;
        marioMustacheGroup.position.y = -0.04 + (animState === "speaking" ? Math.sin(elapsed * 16) * 0.006 : 0);
      }

      // Mandíbula y Rugido de Dinosaurios (T-Rex / Velociraptor)
      if (dinoJawMesh) {
        let openJaw = 0;
        if (animState === "speaking") {
          openJaw = (Math.sin(elapsed * 20) + 1) * 0.3 * (mouthInt || 0.85);
        } else if (listening) {
          openJaw = 0.06;
        }
        dinoJawMesh.rotation.x = openJaw * 0.45;
      }

      // Brazitos de Dinosaurio que gesticulan
      if (dinoArmsGroup && dinoArmsGroup.children.length >= 2) {
        const isTalking = animState === "speaking";
        dinoArmsGroup.children[0].rotation.z = -0.3 + (isTalking ? Math.sin(elapsed * 16) * 0.25 : Math.sin(elapsed * 3) * 0.05);
        dinoArmsGroup.children[1].rotation.z = 0.3 - (isTalking ? Math.sin(elapsed * 16 + 1) * 0.25 : Math.sin(elapsed * 3 + 1) * 0.05);
      }

      // Pies de Goomba que caminan (Waddle clásico)
      if (goombaFeetGroup && goombaFeetGroup.children.length >= 2) {
        const isTalking = animState === "speaking";
        const waddle = isTalking ? Math.sin(elapsed * 16) * 0.18 : Math.sin(elapsed * 2.5) * 0.05;
        goombaFeetGroup.children[0].rotation.z = waddle;
        goombaFeetGroup.children[1].rotation.z = -waddle;
      }

      // Articulación de Pico para Pájaros (Turpial / Colibrí)
      if (beakLower) {
        let openBeak = 0;
        if (animState === "speaking") {
          openBeak = (Math.sin(elapsed * 20) + 1) * 0.35 * (mouthInt || 0.8);
        } else if (listening) {
          openBeak = 0.05;
        }
        beakLower.rotation.x = Math.PI / 1.95 + openBeak * 0.4;
      }

      // Color dinámico del Anillo Holográfico
      if (ring) {
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (listening) {
          mat.color.setHex(0x38bdf8); // Sky blue
        } else if (animState === "speaking") {
          mat.color.setHex(0xa855f7); // Purple
        } else {
          mat.color.setHex(0x3b82f6); // Default Blue
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      
      if (avianRigController) {
        avianRigController.dispose();
      }

      scene.traverse((node: any) => {
        if (node.isMesh) {
          if (node.geometry) node.geometry.dispose();
          if (node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach((mat: any) => mat.dispose());
            } else {
              node.material.dispose();
            }
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [config]);

  const emoji = config.characterEmoji || "✨";

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center overflow-hidden select-none group">
      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
        title="Arrastra con el dedo o mouse para girar el personaje en 360°"
      />
      
      {/* Badge de Estado del Tutor */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 border-2 border-slate-700 text-xs text-slate-300 pointer-events-none shadow-sm">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            animationState === "speaking"
              ? "bg-purple-400 animate-pulse"
              : isListening
              ? "bg-sky-400 animate-pulse"
              : "bg-emerald-400"
          }`}
        />
        <span className="font-bold text-slate-200">
          {animationState === "speaking"
            ? `${config.name} hablando...`
            : isListening
            ? "Escuchándote..."
            : "En línea"}
        </span>
      </div>

      {/* Botón de Diagnóstico 3D GLB si se cargó un modelo o preset */}
      {glbReport && (
        <button
          type="button"
          onClick={() => setShowDiagnosticModal(true)}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-2 border-b-4 border-amber-500/60 active:border-b-2 active:translate-y-0.5 text-xs font-bold shadow-sm transition"
          title="Ver informe diagnóstico 3D completo del archivo .GLB"
        >
          <Feather className="w-3.5 h-3.5 text-amber-400" />
          <span>Diagnóstico 3D</span>
        </button>
      )}

      {/* Badge de Especie / Identidad BET */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900 border-2 border-slate-700 text-xs font-bold text-amber-300 shadow-sm pointer-events-none">
        <span className="text-sm">{emoji}</span>
        <span className="text-slate-100">{config.name}</span>
        {config.badgeText && (
          <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
            {config.badgeText}
          </span>
        )}
      </div>

      {/* Barra de Controles Rápidos de Rotación 3D (Giro 180°, Paso 45°, Reset) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 px-2 rounded-2xl bg-slate-900 border-2 border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => handleRotateBy(Math.PI)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-b-4 border-amber-500/50 active:border-b-2 active:translate-y-0.5 text-amber-300 text-xs font-bold transition shadow-sm"
          title="Girar 180° para ver de frente o espalda"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Girar 180°</span>
        </button>

        <button
          type="button"
          onClick={() => handleRotateBy(-Math.PI / 4)}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-b-4 border-slate-700 active:border-b-2 active:translate-y-0.5 text-xs transition"
          title="Rotar -45° a la izquierda"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleRotateBy(Math.PI / 4)}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-b-4 border-slate-700 active:border-b-2 active:translate-y-0.5 text-xs transition"
          title="Rotar +45° a la derecha"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetFront}
          className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border-2 border-b-4 border-slate-700 active:border-b-2 active:translate-y-0.5 text-[11px] font-bold transition"
          title="Restablecer orientación de frente"
        >
          Frente
        </button>

        <div className="hidden sm:flex items-center gap-1 pl-1 pr-1 text-[10px] text-slate-400 border-l border-slate-700">
          <MoveHorizontal className="w-3 h-3 text-slate-400" />
          <span>360°</span>
        </div>
      </div>

      {/* Modal de Diagnóstico Técnico GLB */}
      {showDiagnosticModal && (
        <GlbDiagnosticModal
          report={glbReport}
          onClose={() => setShowDiagnosticModal(false)}
        />
      )}
    </div>
  );
};
