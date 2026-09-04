import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GlbDiagnosticReport } from "../types";

/**
 * Deep diagnostic inspector for .GLB / .GLTF models.
 * Automatically analyzes rigs, bones, blendshapes, animations, materials,
 * textures, lights, cameras, and avian anatomical features.
 */
export function inspectGlbModel(gltf: GLTF, fileName = "owl_professor.glb"): GlbDiagnosticReport {
  let meshCount = 0;
  let skinnedMeshCount = 0;
  const bonesList: string[] = [];
  const morphTargetNamesSet = new Set<string>();
  const materialTypesSet = new Set<string>();
  let totalVertices = 0;
  let totalTriangles = 0;

  const texturesDetected = {
    hasAlbedoMap: false,
    hasNormalMap: false,
    hasRoughnessMap: false,
    hasAlphaMap: false,
    hasEmissiveMap: false,
  };

  let embeddedLightsCount = 0;
  let embeddedCamerasCount = 0;

  let detectedHead: string | null = null;
  let detectedBeak: string | null = null;
  const detectedEyes: string[] = [];
  const detectedWings: string[] = [];

  const seenMaterials = new Set<THREE.Material>();

  // Bounding box computation
  const bbox = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  gltf.scene.traverse((node: THREE.Object3D) => {
    const nameLower = (node.name || "").toLowerCase();

    // Node Classification for Avian Anatomy
    if (
      !detectedHead &&
      (nameLower.includes("head") ||
        nameLower.includes("cabeza") ||
        nameLower.includes("cranium") ||
        nameLower.includes("owl_head"))
    ) {
      detectedHead = node.name;
    }

    if (
      !detectedBeak &&
      (nameLower.includes("beak") ||
        nameLower.includes("pico") ||
        nameLower.includes("jaw") ||
        nameLower.includes("mandible") ||
        nameLower.includes("mouth") ||
        nameLower.includes("boca"))
    ) {
      detectedBeak = node.name;
    }

    if (
      nameLower.includes("eye") ||
      nameLower.includes("ojo") ||
      nameLower.includes("pupil") ||
      nameLower.includes("iris")
    ) {
      if (!detectedEyes.includes(node.name)) {
        detectedEyes.push(node.name);
      }
    }

    if (
      nameLower.includes("wing") ||
      nameLower.includes("ala") ||
      nameLower.includes("feather") ||
      nameLower.includes("arm")
    ) {
      if (!detectedWings.includes(node.name)) {
        detectedWings.push(node.name);
      }
    }

    // Bone Detection
    if (node instanceof THREE.Bone) {
      bonesList.push(node.name || `Bone_${bonesList.length}`);
    }

    // Light Detection
    if (node instanceof THREE.Light) {
      embeddedLightsCount++;
    }

    // Camera Detection
    if (node instanceof THREE.Camera) {
      embeddedCamerasCount++;
    }

    // Mesh Analysis
    if (node instanceof THREE.Mesh) {
      meshCount++;
      if (node instanceof THREE.SkinnedMesh) {
        skinnedMeshCount++;
      }

      // Geometry stats
      const geom = node.geometry;
      if (geom) {
        const posAttr = geom.getAttribute("position");
        if (posAttr) {
          totalVertices += posAttr.count;
          if (geom.index) {
            totalTriangles += geom.index.count / 3;
          } else {
            totalTriangles += posAttr.count / 3;
          }
        }

        // Morph Targets / Blendshapes
        if (geom.morphAttributes) {
          Object.keys(geom.morphAttributes).forEach((key) => {
            const attrArray = geom.morphAttributes[key];
            if (attrArray && attrArray.length > 0) {
              if (node.morphTargetDictionary) {
                Object.keys(node.morphTargetDictionary).forEach((mName) => {
                  morphTargetNamesSet.add(mName);
                });
              } else {
                attrArray.forEach((_, idx) => {
                  morphTargetNamesSet.add(`${key}_${idx}`);
                });
              }
            }
          });
        }
      }

      // Materials & Textures
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((mat) => {
        if (mat && !seenMaterials.has(mat)) {
          seenMaterials.add(mat);
          materialTypesSet.add(mat.type);

          const standardMat = mat as THREE.MeshStandardMaterial;
          if (standardMat.map) texturesDetected.hasAlbedoMap = true;
          if (standardMat.normalMap) texturesDetected.hasNormalMap = true;
          if (standardMat.roughnessMap) texturesDetected.hasRoughnessMap = true;
          if (standardMat.alphaMap || standardMat.transparent) texturesDetected.hasAlphaMap = true;
          if (standardMat.emissiveMap) texturesDetected.hasEmissiveMap = true;
        }
      });
    }
  });

  // Animations analysis
  const animationClips = (gltf.animations || []).map((clip) => ({
    name: clip.name || "Default_Clip",
    duration: parseFloat(clip.duration.toFixed(2)),
    tracksCount: clip.tracks.length,
  }));

  const hasRig = bonesList.length > 0 || skinnedMeshCount > 0;
  const hasAnimations = animationClips.length > 0;
  const morphTargetNames = Array.from(morphTargetNamesSet);
  const hasMorphTargets = morphTargetNames.length > 0;

  // Evaluate Missing Features
  const missingFeaturesSummary: string[] = [];
  const activeFeaturesSummary: string[] = [];

  if (hasRig) {
    activeFeaturesSummary.push(`Esqueleto con ${bonesList.length} huesos y ${skinnedMeshCount} skinned meshes`);
  } else {
    missingFeaturesSummary.push("Sin rig óseo nativo (No contiene esqueleto/huesos embebidos)");
  }

  if (hasMorphTargets) {
    activeFeaturesSummary.push(`Posee ${morphTargetNames.length} blendshapes / morph targets`);
  } else {
    missingFeaturesSummary.push("Sin blendshapes nativos de pico o párpados");
  }

  if (hasAnimations) {
    activeFeaturesSummary.push(`Posee ${animationClips.length} clips de animación embebidos`);
  } else {
    missingFeaturesSummary.push("Sin clips de animación embebidos precalculados");
  }

  if (texturesDetected.hasAlbedoMap || texturesDetected.hasNormalMap) {
    activeFeaturesSummary.push("Texturas PBR y materiales listos para WebGL");
  }

  // Assigned Kinematic Strategies
  const isAvian =
    Boolean(detectedBeak) ||
    detectedWings.length > 0 ||
    fileName.toLowerCase().includes("owl") ||
    fileName.toLowerCase().includes("buho") ||
    fileName.toLowerCase().includes("búho") ||
    fileName.toLowerCase().includes("bird") ||
    fileName.toLowerCase().includes("ave");

  const headMotionStrategy = hasRig
    ? "Rotación cinemática mediante hueso Head/Neck con amortiguación suave"
    : "Cinemática directa sobre el centro craneal superior con seguimiento de mirada (LookAt) y sacadas de búho";

  const blinkingStrategy = morphTargetNames.some((m) => /blink|eye/i.test(m))
    ? "Modulación de influencia en Morph Targets de párpados (0.0 → 1.0 → 0.0)"
    : detectedEyes.length > 0
    ? "Escalado vertical procedural de córnea/submalla ocular + membrana nictitante"
    : "Sincronización procedural de membrana palpebral aviar generada por el motor";

  const speechBeakStrategy = morphTargetNames.some((m) => /beak|mouth|jaw|talk|open/i.test(m))
    ? "Sincronización de apertura mediante Blendshapes de pico / visemas"
    : detectedBeak
    ? "Articulación por rotación del eje mandibular sobre el pivote del pico"
    : "Articulador y deformador procedural de mandíbula aviar acoplado con visemas de audio";

  const idleStrategy =
    "Respiración orgánica mediante Squash & Stretch de sacos aéreos, balanceo de percha y micro-inclinación de curiosidad";

  let performanceRating: "Excelente (60 FPS)" | "Bueno" | "Pesado" = "Excelente (60 FPS)";
  if (totalVertices > 150000 || meshCount > 60) {
    performanceRating = "Pesado";
  } else if (totalVertices > 60000) {
    performanceRating = "Bueno";
  }

  return {
    fileName,
    meshCount,
    skinnedMeshCount,
    hasRig,
    boneCount: bonesList.length,
    bonesList: bonesList.slice(0, 30),
    hasAnimations,
    animationClips,
    hasMorphTargets,
    morphTargetNames,
    materialsCount: seenMaterials.size,
    materialTypes: Array.from(materialTypesSet),
    texturesDetected,
    embeddedLightsCount,
    embeddedCamerasCount,
    geometryStats: {
      totalVertices,
      totalTriangles: Math.round(totalTriangles),
      boundingBox: {
        width: parseFloat(size.x.toFixed(2)),
        height: parseFloat(size.y.toFixed(2)),
        depth: parseFloat(size.z.toFixed(2)),
      },
    },
    avianClassification: {
      isAvian,
      detectedHead,
      detectedBeak,
      detectedEyes,
      detectedWings,
    },
    assignedStrategy: {
      headMotion: headMotionStrategy,
      blinking: blinkingStrategy,
      speechBeakSync: speechBeakStrategy,
      idleBreathing: idleStrategy,
      performanceRating,
    },
    missingFeaturesSummary,
    activeFeaturesSummary,
    generatedAt: new Date().toLocaleTimeString(),
  };
}

/**
 * Avian Rig Controller
 * Manages the procedural anatomy, kinematics, gaze tracking, eye blinking,
 * speech beak modulation, and idle life loops for an avian / owl 3D model.
 */
export class AvianRigController {
  public rootObject: THREE.Object3D;
  public report: GlbDiagnosticReport;

  // Anatomical References
  private headNode: THREE.Object3D | null = null;
  private beakNode: THREE.Object3D | null = null;
  private eyeNodes: THREE.Object3D[] = [];
  private wingLeftNode: THREE.Object3D | null = null;
  private wingRightNode: THREE.Object3D | null = null;

  // Procedural Avian Mandible & 3D Mouth for monolithic models
  private proceduralMandible: THREE.Mesh | null = null;
  private proceduralEyelids: THREE.Mesh[] = [];

  // 3D Mouth Calibration & Procedural Articulation
  public mouthOffsets = {
    x: 0,
    y: 0.94,
    z: 0.62,
    scale: 1.0,
    openDist: 0.08,
    type: "shiba_snout" as "shiba_snout" | "avian_beak" | "kinetic_bounce",
    enabled: true,
  };
  private proceduralMouthGroup: THREE.Group | null = null;
  private proceduralUpperLip: THREE.Mesh | null = null;
  private proceduralLowerLip: THREE.Mesh | null = null;
  private proceduralTongue: THREE.Mesh | null = null;

  // Morph Target References
  private mouthMorphMeshes: { mesh: THREE.Mesh; targetIndex: number }[] = [];
  private blinkMorphMeshes: { mesh: THREE.Mesh; targetIndex: number }[] = [];

  // State
  public baseScale = 1.0;
  private blinkTimer = 0;
  private nextBlinkInterval = 3.5;
  private isBlinking = false;
  private blinkProgress = 0;

  // Saccades (Owl quick gaze adjustments)
  private saccadeTimer = 0;
  private saccadeOffsetX = 0;
  private saccadeOffsetY = 0;

  // Speech Viseme Smoothing
  private smoothedMouthIntensity = 0;
  private initialHeadRot = new THREE.Euler();
  private initialBeakRot = new THREE.Euler();

  constructor(gltf: GLTF, fileName = "owl_professor.glb") {
    this.rootObject = gltf.scene;
    this.report = inspectGlbModel(gltf, fileName);
    this.setupAnatomy(gltf);
  }

  private setupAnatomy(gltf: GLTF) {
    // 1. Auto-Center and Standardize Model Scale & Shadows
    const targetHeight = 1.65;
    const initialBox = new THREE.Box3().setFromObject(this.rootObject);
    const initialSize = new THREE.Vector3();
    initialBox.getSize(initialSize);
    const maxDim = Math.max(0.1, initialSize.y, initialSize.x * 0.75, initialSize.z * 0.75);
    this.baseScale = targetHeight / maxDim;
    this.rootObject.scale.setScalar(this.baseScale);
    this.rootObject.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(this.rootObject);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    // Center model at bottom pivot on stage
    this.rootObject.position.x -= scaledCenter.x;
    this.rootObject.position.y -= scaledBox.min.y;
    this.rootObject.position.z -= scaledCenter.z;
    this.rootObject.updateMatrixWorld(true);

    // 2. Discover Nodes & Morph Targets
    this.rootObject.traverse((node) => {
      const nameLower = (node.name || "").toLowerCase();

      // Shadows & Materials
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        if (node.material) {
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach((m) => {
            if (m instanceof THREE.MeshStandardMaterial) {
              m.roughness = Math.min(0.85, Math.max(0.2, m.roughness));
              m.envMapIntensity = 1.2;
              m.needsUpdate = true;
            }
          });
        }

        // Check Morph Targets
        if (node.morphTargetDictionary && node.morphTargetInfluences) {
          Object.entries(node.morphTargetDictionary).forEach(([targetName, idx]) => {
            const tLower = targetName.toLowerCase();
            if (/mouth|beak|jaw|talk|viseme|open/i.test(tLower)) {
              this.mouthMorphMeshes.push({ mesh: node, targetIndex: idx });
            }
            if (/blink|eye|eyelid|close/i.test(tLower)) {
              this.blinkMorphMeshes.push({ mesh: node, targetIndex: idx });
            }
          });
        }
      }

      // Anatomical Bones / Meshes Identification
      if (!this.headNode && (/head|cabeza|cranium|owl_head/i.test(nameLower) || (node instanceof THREE.Bone && /head/i.test(nameLower)))) {
        this.headNode = node;
        this.initialHeadRot.copy(node.rotation);
      }

      if (!this.beakNode && (/beak|pico|jaw|mandible|mouth/i.test(nameLower) || (node instanceof THREE.Bone && /beak|jaw/i.test(nameLower)))) {
        this.beakNode = node;
        this.initialBeakRot.copy(node.rotation);
      }

      if (/eye_l|eye_r|eye|ojo/i.test(nameLower) && node instanceof THREE.Mesh) {
        this.eyeNodes.push(node);
      }

      if (/wing_l|ala_l|wingleft/i.test(nameLower)) {
        this.wingLeftNode = node;
      }
      if (/wing_r|ala_r|wingright/i.test(nameLower)) {
        this.wingRightNode = node;
      }
    });

    // Fallback: If no head node found, select the top-most mesh as head or default to root
    if (!this.headNode) {
      let topMesh: THREE.Object3D | null = null;
      let maxY = -Infinity;
      this.rootObject.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          const worldPos = new THREE.Vector3();
          node.getWorldPosition(worldPos);
          if (worldPos.y > maxY) {
            maxY = worldPos.y;
            topMesh = node;
          }
        }
      });
      this.headNode = topMesh || this.rootObject;
      this.initialHeadRot.copy(this.headNode.rotation);
    }

    // Fallback: If no beak node and no mouth morph targets, inject procedural 3D mouth articulator
    if (!this.beakNode && this.mouthMorphMeshes.length === 0) {
      this.buildProceduralMouth();
    }
  }

  /**
   * Builds an articulated 3D mouth or beak for monolithic models (like Shiba Inu or Owl)
   * that can be calibrated in position X/Y/Z, scale, and speech opening amplitude.
   */
  public buildProceduralMouth() {
    if (this.proceduralMouthGroup) {
      this.rootObject.remove(this.proceduralMouthGroup);
      this.proceduralMouthGroup = null;
      this.proceduralUpperLip = null;
      this.proceduralLowerLip = null;
      this.proceduralTongue = null;
    }

    const group = new THREE.Group();
    group.name = "Avian_Procedural_3D_Mouth_Group";

    if (this.mouthOffsets.type === "avian_beak") {
      // Procedural Avian Beak
      const beakMat = new THREE.MeshStandardMaterial({
        color: 0xdf8a1a,
        roughness: 0.35,
        metalness: 0.1,
      });

      // Upper Beak
      const upperGeom = new THREE.ConeGeometry(0.12, 0.22, 5);
      upperGeom.rotateX(Math.PI / 2);
      upperGeom.scale(1.0, 0.5, 1.0);
      const upperMesh = new THREE.Mesh(upperGeom, beakMat);
      upperMesh.castShadow = true;
      group.add(upperMesh);
      this.proceduralUpperLip = upperMesh;

      // Lower Beak (Articulated Mandible)
      const lowerGeom = new THREE.ConeGeometry(0.10, 0.18, 5);
      lowerGeom.rotateX(Math.PI / 2);
      lowerGeom.scale(0.95, 0.4, 0.95);
      const lowerMesh = new THREE.Mesh(lowerGeom, beakMat);
      lowerMesh.position.set(0, -0.04, 0.01);
      lowerMesh.castShadow = true;
      group.add(lowerMesh);
      this.proceduralLowerLip = lowerMesh;
    } else {
      // Canine / Animal Snout (Shiba Inu)
      // Dark leather muzzle & nose
      const noseMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b18,
        roughness: 0.5,
        metalness: 0.1,
      });

      // Upper Lip / Nose tip
      const upperGeom = new THREE.SphereGeometry(0.045, 12, 12);
      upperGeom.scale(1.2, 0.75, 1.0);
      const upperMesh = new THREE.Mesh(upperGeom, noseMat);
      upperMesh.position.set(0, 0.02, 0);
      upperMesh.castShadow = true;
      group.add(upperMesh);
      this.proceduralUpperLip = upperMesh;

      // Lower Jaw / Lip (drops when speaking)
      const lowerGeom = new THREE.SphereGeometry(0.038, 12, 10);
      lowerGeom.scale(1.1, 0.5, 0.9);
      const lowerMesh = new THREE.Mesh(lowerGeom, noseMat);
      lowerMesh.position.set(0, -0.03, -0.01);
      lowerMesh.castShadow = true;
      group.add(lowerMesh);
      this.proceduralLowerLip = lowerMesh;

      // Pink Tongue inside
      const tongueMat = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        roughness: 0.4,
        metalness: 0.05,
      });
      const tongueGeom = new THREE.SphereGeometry(0.026, 10, 8);
      tongueGeom.scale(1.0, 0.35, 1.2);
      const tongueMesh = new THREE.Mesh(tongueGeom, tongueMat);
      tongueMesh.position.set(0, -0.02, 0.01);
      group.add(tongueMesh);
      this.proceduralTongue = tongueMesh;
    }

    group.position.set(this.mouthOffsets.x, this.mouthOffsets.y, this.mouthOffsets.z);
    group.scale.setScalar(this.mouthOffsets.scale);
    group.visible = this.mouthOffsets.enabled && this.mouthOffsets.type !== "kinetic_bounce";

    this.rootObject.add(group);
    this.proceduralMouthGroup = group;
  }

  /**
   * Live calibration of 3D mouth position, distances, and scale
   */
  public setMouthOffsets(offsets: {
    x?: number;
    y?: number;
    z?: number;
    scale?: number;
    openDist?: number;
    type?: "shiba_snout" | "avian_beak" | "kinetic_bounce";
    enabled?: boolean;
  }) {
    let typeChanged = false;
    if (offsets.x !== undefined) this.mouthOffsets.x = offsets.x;
    if (offsets.y !== undefined) this.mouthOffsets.y = offsets.y;
    if (offsets.z !== undefined) this.mouthOffsets.z = offsets.z;
    if (offsets.scale !== undefined) this.mouthOffsets.scale = offsets.scale;
    if (offsets.openDist !== undefined) this.mouthOffsets.openDist = offsets.openDist;
    if (offsets.type !== undefined && offsets.type !== this.mouthOffsets.type) {
      this.mouthOffsets.type = offsets.type;
      typeChanged = true;
    }
    if (offsets.enabled !== undefined) this.mouthOffsets.enabled = offsets.enabled;

    if (typeChanged || !this.proceduralMouthGroup) {
      this.buildProceduralMouth();
    } else if (this.proceduralMouthGroup) {
      this.proceduralMouthGroup.position.set(
        this.mouthOffsets.x,
        this.mouthOffsets.y,
        this.mouthOffsets.z
      );
      this.proceduralMouthGroup.scale.setScalar(this.mouthOffsets.scale);
      this.proceduralMouthGroup.visible =
        this.mouthOffsets.enabled && this.mouthOffsets.type !== "kinetic_bounce";
    }
  }

  /**
   * Main Frame Update called every render loop (~60 FPS)
   */
  public update(
    delta: number,
    elapsedTime: number,
    mouseTarget: { x: number; y: number },
    mouthIntensity: number,
    animationState: string,
    isListening: boolean = false
  ) {
    // 1. Smooth Viseme Audio Interpolation (60 FPS smooth damp)
    this.smoothedMouthIntensity += (mouthIntensity - this.smoothedMouthIntensity) * Math.min(1.0, delta * 24);

    // 2. Avian Saccades (Owl quick gaze re-alignment every 2.5 - 4.5s)
    this.saccadeTimer += delta;
    if (this.saccadeTimer > 3.2) {
      this.saccadeTimer = 0;
      this.saccadeOffsetX = (Math.random() - 0.5) * 0.08;
      this.saccadeOffsetY = (Math.random() - 0.5) * 0.05;
    }

    // 3. Smooth Head Kinematics & Owl Gaze Tracking
    if (this.headNode) {
      // Owl head range: up to 45° horizontal tracking, 25° vertical
      let targetRotY = mouseTarget.x * 0.45 + this.saccadeOffsetX;
      let targetRotX = -mouseTarget.y * 0.28 + this.saccadeOffsetY;
      let targetRotZ = 0;

      // Attentive head tilt when student is talking
      if (isListening) {
        targetRotZ = 0.12 * Math.sin(elapsedTime * 2);
        targetRotX -= 0.05;
      }

      // Emotional head gestures
      if (animationState === "alegre") {
        targetRotX += Math.sin(elapsedTime * 5) * 0.04;
        targetRotZ += Math.cos(elapsedTime * 3) * 0.03;
      } else if (animationState === "pensativo") {
        targetRotZ += 0.14;
        targetRotX += 0.08;
      } else if (animationState === "sorpresa") {
        targetRotX -= 0.09;
      }

      // Rhythmic speech bounce (syllable bobbing)
      if (this.smoothedMouthIntensity > 0.08) {
        targetRotX += Math.sin(elapsedTime * 14) * 0.035 * this.smoothedMouthIntensity;
      }

      // Spring-damped smooth interpolation
      this.headNode.rotation.y += (this.initialHeadRot.y + targetRotY - this.headNode.rotation.y) * delta * 7;
      this.headNode.rotation.x += (this.initialHeadRot.x + targetRotX - this.headNode.rotation.x) * delta * 7;
      this.headNode.rotation.z += (this.initialHeadRot.z + targetRotZ - this.headNode.rotation.z) * delta * 7;
    }

    // 4. Avian Blinking (Natural 160ms cycle)
    this.blinkTimer += delta;
    if (!this.isBlinking && this.blinkTimer >= this.nextBlinkInterval) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.blinkTimer = 0;
      this.nextBlinkInterval = 2.8 + Math.random() * 3.5;
    }

    let blinkFactor = 0;
    if (this.isBlinking) {
      this.blinkProgress += delta * 7.5; // ~133ms blink
      if (this.blinkProgress >= 1.0) {
        this.isBlinking = false;
        blinkFactor = 0;
      } else {
        // Smooth sine arch: 0 -> 1 -> 0
        blinkFactor = Math.sin(this.blinkProgress * Math.PI);
      }
    }

    // Apply Blink to Morph Targets
    if (this.blinkMorphMeshes.length > 0) {
      this.blinkMorphMeshes.forEach(({ mesh, targetIndex }) => {
        if (mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[targetIndex] = blinkFactor;
        }
      });
    } else if (this.eyeNodes.length > 0) {
      // Procedural Cornea / Eye Mesh Squish on Blink
      this.eyeNodes.forEach((eye) => {
        eye.scale.y = 1.0 - blinkFactor * 0.88;
      });
    }

    // 5. Speech Beak Lip-Sync (Multi-Tier Hierarchy)
    // Tier 1: Morph Targets
    if (this.mouthMorphMeshes.length > 0) {
      this.mouthMorphMeshes.forEach(({ mesh, targetIndex }) => {
        if (mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[targetIndex] = this.smoothedMouthIntensity;
        }
      });
    }

    // Tier 2: Beak / Jaw Bone or Submesh Rotation
    if (this.beakNode) {
      const maxBeakAperture = 0.35; // radians (~20 degrees)
      const targetBeakX = this.initialBeakRot.x + this.smoothedMouthIntensity * maxBeakAperture;
      this.beakNode.rotation.x += (targetBeakX - this.beakNode.rotation.x) * delta * 20;
    }

    // Tier 3: Whole Head & Procedural 3D Mouth for Monolithic Models
    if (this.mouthMorphMeshes.length === 0 && !this.beakNode) {
      // Dynamic Speech Micro-Flap on the cranial front
      if (this.headNode && this.smoothedMouthIntensity > 0.05) {
        this.headNode.position.y = Math.sin(elapsedTime * 16) * 0.015 * this.smoothedMouthIntensity;
      }

      // Articulate 3D Procedural Mouth / Snout
      if (
        this.proceduralMouthGroup &&
        this.mouthOffsets.enabled &&
        this.mouthOffsets.type !== "kinetic_bounce"
      ) {
        const openAmount = this.smoothedMouthIntensity * (this.mouthOffsets.openDist || 0.08);

        if (this.proceduralLowerLip) {
          this.proceduralLowerLip.position.y = -0.03 - openAmount;
          this.proceduralLowerLip.rotation.x = this.smoothedMouthIntensity * 0.35;
        }
        if (this.proceduralTongue) {
          this.proceduralTongue.position.y = -0.02 - openAmount * 0.45;
          this.proceduralTongue.scale.z = 1.2 + this.smoothedMouthIntensity * 0.4;
        }
      }
    }

    // 6. Organic Breathing & Idle Physics (Squash & Stretch)
    const breathFreq = 1.6;
    const breathAmp = 0.018;
    const breath = Math.sin(elapsedTime * breathFreq) * breathAmp;

    // Volume-preserving squash & stretch: when Y expands, X and Z contract slightly
    this.rootObject.scale.y = this.baseScale * (1.0 + breath);
    this.rootObject.scale.x = this.baseScale * (1.0 - breath * 0.45);
    this.rootObject.scale.z = this.baseScale * (1.0 - breath * 0.45);

    // Perching sway
    this.rootObject.position.y += (Math.sin(elapsedTime * 0.8) * 0.008 - this.rootObject.position.y * 0.05) * delta;

    // Subtle wing micro-flutter when speaking passionately or happy
    if (this.wingLeftNode && this.wingRightNode) {
      const wingFlap = Math.sin(elapsedTime * 6) * 0.03 * (this.smoothedMouthIntensity + 0.1);
      this.wingLeftNode.rotation.z = wingFlap;
      this.wingRightNode.rotation.z = -wingFlap;
    }
  }

  public dispose() {
    if (this.proceduralMandible) {
      this.proceduralMandible.geometry.dispose();
      if (Array.isArray(this.proceduralMandible.material)) {
        this.proceduralMandible.material.forEach((m) => m.dispose());
      } else {
        this.proceduralMandible.material.dispose();
      }
    }
  }
}
