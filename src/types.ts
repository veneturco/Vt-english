export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type TeachingMode =
  | "bilingual_coach" // Profesora Bilingüe (Español cálido + Práctica en Inglés)
  | "full_immersion" // 100% Inmersión en Inglés
  | "roleplay" // Simulación de situaciones del mundo real
  | "pronunciation_lab"; // Laboratorio de fonética y acento nativo

export interface LevelInfo {
  level: CEFRLevel;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  badge: string;
}

export type AvatarModelPreset =
  | "bet_turpial"
  | "mario_hero"
  | "luigi_hero"
  | "goomba_shroom"
  | "trex_friendly"
  | "raptor_dino"
  | "bet_frontino"
  | "bet_cunaguaro"
  | "bet_tucusito"
  | "bet_tech_monkey"
  | "bet_capuchino"
  | "bet_hormiguero"
  | "bet_morrocoy"
  | "bet_guacharaca"
  | "bet_tuqueque"
  | "teacher_female"
  | "professor_male"
  | "tutor_casual"
  | "mentor_cyber";

export type AvatarAccessory =
  | "none"
  | "headset"
  | "vt_badge"
  | "earrings"
  | "smart_watch"
  | "bet_medal"
  | "bet_bag"
  | "safari_hat"
  | "open_book"
  | "strawberry"
  | "graduation_cap"
  | "golden_crown"
  | "sunglasses_vip"
  | "scarf_explorer"
  | "mario_cap"
  | "luigi_cap"
  | "super_star"
  | "mario_mustache";

export interface AvatarConfig {
  preset: AvatarModelPreset;
  name: string;
  role: string;
  teachingStyleBio?: string;
  characterSpecies?: string;
  badgeText?: string;
  characterEmoji?: string;
  themeGradient?: string;
  skinTone: string; // Hex color
  hairStyle: "bun" | "short_parted" | "bob" | "curly" | "slick" | "ponytail" | "feathers" | "fur" | "ears";
  hairColor: string; // Hex color
  glasses: "none" | "corporate_black" | "metal_round" | "sleek_silver" | "cyber_gold" | "spectacled_mask";
  outfit: "corporate_suit" | "casual_blazer" | "tech_hoodie" | "turtleneck_smart" | "safari_vest" | "bet_cap" | "headphones_suit";
  outfitColor: string; // Hex color
  accentColor: string; // Detail color
  accessory: AvatarAccessory;
  avatarType?: "3d" | "2d" | "custom_glb";
  customImageUrl?: string;
  customGlbUrl?: string;
  customGlbName?: string;
  glbRotationY?: number; // Custom rotation offset in radians or degrees
  spriteCropIndex?: number; // 0 to 9 for collage auto-crop
  rigMouthX?: number; // percentage 0-100
  rigMouthY?: number; // percentage 0-100
  rigMouthScale?: number; // scale 0.5 - 2.0
  rigMouthType?:
    | "bird_beak"
    | "long_beak"
    | "feline_snout"
    | "bear_snout"
    | "monkey_mouth"
    | "tamandua_snout"
    | "turtle_mouth"
    | "reptile_mouth";
  rigEyeLX?: number;
  rigEyeLY?: number;
  rigEyeRX?: number;
  rigEyeRY?: number;
  voiceGender: "female" | "male";
  voiceRate: number; // 0.8 to 1.2
  voicePitch: number; // 0.8 to 1.2
  voiceAccent: "en-US" | "en-GB" | "en-AU";
  voiceEngine?: "elevenlabs" | "native" | "auto";
}

export interface GlbDiagnosticReport {
  fileName: string;
  fileSize?: string;
  meshCount: number;
  skinnedMeshCount: number;
  hasRig: boolean;
  boneCount: number;
  bonesList: string[];
  hasAnimations: boolean;
  animationClips: { name: string; duration: number; tracksCount: number }[];
  hasMorphTargets: boolean;
  morphTargetNames: string[];
  materialsCount: number;
  materialTypes: string[];
  texturesDetected: {
    hasAlbedoMap: boolean;
    hasNormalMap: boolean;
    hasRoughnessMap: boolean;
    hasAlphaMap: boolean;
    hasEmissiveMap: boolean;
  };
  embeddedLightsCount: number;
  embeddedCamerasCount: number;
  geometryStats: {
    totalVertices: number;
    totalTriangles: number;
    boundingBox: {
      width: number;
      height: number;
      depth: number;
    };
  };
  avianClassification: {
    isAvian: boolean;
    detectedHead: string | null;
    detectedBeak: string | null;
    detectedEyes: string[];
    detectedWings: string[];
  };
  assignedStrategy: {
    headMotion: string;
    blinking: string;
    speechBeakSync: string;
    idleBreathing: string;
    performanceRating: "Excelente (60 FPS)" | "Bueno" | "Pesado";
  };
  missingFeaturesSummary: string[];
  activeFeaturesSummary: string[];
  generatedAt: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  ipa?: string;
  phoneticSpanish?: string; // e.g. "kʊd aɪ ɡet -> kud-ai-get"
  meaning: string;
  example?: string;
  dateAdded: number;
  mastered?: boolean;
}

export interface GrammarCorrection {
  hasError: boolean;
  isPerfect?: boolean;
  praise?: string; // Validación positiva ("¡Gran intento!", "¡Te entendí perfecto!")
  originalSentence?: string;
  correctedSentence?: string;
  explanation?: string; // Explicación amigable en español del porqué
  nativeAlternative?: string; // Cómo lo diría un nativo de forma aún más natural
}

export interface LearningPathNode {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  icon: string;
  scenarioId?: string;
  status: "completed" | "current" | "locked";
  xpReward: number;
  gemsReward: number;
  type: "dialogue" | "pronunciation" | "speed" | "checkpoint";
}

export interface LearningUnit {
  id: string;
  unitNumber: number;
  title: string;
  theme: string;
  level: CEFRLevel;
  nodes: LearningPathNode[];
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  gemsReward: number;
  icon: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "tutor" | "user";
  text: string;
  timestamp: number;
  spanishTranslation?: string;
  
  // Enfoque pedagógico avanzado tipo Speak / Duolingo Max / Elsa
  targetEnglishPhrase?: string; // La frase en inglés que el alumno debe aprender o practicar
  phoneticGuide?: string; // Fonética amigable para hispanohablantes (ej. "ai-wud-laik-tu...")
  nativeLinkingTrick?: string; // Truco de pronunciación de enlace (ej. "Une 'did you' como 'did-ya'")
  teacherCommentary?: string; // Explicación en español cálido de la profesora
  correction?: GrammarCorrection;
  vocabularyNotes?: Array<{
    word: string;
    ipa?: string;
    phoneticSpanish?: string;
    meaning: string;
    example?: string;
  }>;
  pedagogicalTip?: string;
  quickChips?: string[];
  audioPlaying?: boolean;
  pronunciationScore?: number; // 0 to 100
}

export interface ScenarioGoal {
  id: string;
  description: string;
  targetKeywords: string[];
  completed: boolean;
}

export interface TopicScenario {
  id: string;
  title: string;
  subtitle: string;
  category: "Everyday" | "Professional" | "Travel" | "Academic" | "Free Talk" | "Kids & Adventure";
  iconName: string;
  initialPrompt: string;
  levelRecommendation: CEFRLevel;
  tags: string[];
  goals?: ScenarioGoal[];
}

export interface SRSFlashcard {
  id: string;
  frontWord: string;
  backMeaning: string;
  ipa?: string;
  phoneticSpanish?: string;
  exampleSentence?: string;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string;
}

export type AvatarAnimationState =
  | "idle"
  | "speaking"
  | "listening"
  | "encouraging"
  | "sorpresa"
  | "pensativo"
  | "alegre"
  | "loving"
  | "celebrating";

export interface UserStats {
  streakDays: number;
  lastPracticeDate: string;
  messagesExchanged: number;
  wordsLearned: number;
  minutesPracticed: number;
}

export interface WordAccuracy {
  word: string;
  score: number; // 0 a 100
  isTarget: boolean;
  ipa?: string;
}

export interface UserGamificationState {
  streakDays: number;
  lastPracticeDate: string;
  xpPoints: number;
  gems: number;
  completedChallenges: number;
  unlockedAchievements: string[];
  level: number;
  perfectPhrasesCount: number;
}

export type AppExperienceMode = "adults" | "kids";

export type KidsAgeGroup = "preschool" | "explorer" | "champion"; // 4-6 (Visual), 7-9 (Words), 10-12 (Sentences)
export type KidsGameMode = "map" | "dino_snack" | "voice_jump" | "block_bash" | "pipe_listening";

export interface KidsLessonCard {
  id: string;
  englishWord: string;
  spanishMeaning: string;
  phoneticSimple: string; // ej. "la-ion"
  emoji: string;
  category: "animals" | "colors_numbers" | "food" | "family_clothes" | "verbs_jump" | "questions_phrases" | "castle_boss";
  examplePhrase: string;
  exampleSpanish: string;
  options?: string[]; // for interactive quiz / block bash / feeding choices
  correctOptionIndex?: number;
  foodType?: "fruit" | "snack" | "drink" | "meat" | "vegetable";
}

export interface KidsWorld {
  id: string;
  title: string;
  spanishTitle: string;
  category: "dino_valley" | "adventure_kingdom" | "sky_castle";
  icon: string;
  themeColor: string;
  bgGradient: string;
  description: string;
  bossName?: string;
  cards: KidsLessonCard[];
}

export interface KidsProgressState {
  totalStars: number;
  fossilCoins: number;
  unlockedStickers: string[];
  completedCards: string[];
  levelScores: Record<string, number>; // cardId / levelId -> 1 to 3 stars
  unlockedWorlds: string[];
  currentWorldId: string;
  streakDays: number;
  dailyQuestsCompleted: number; // 0 to 5 for egg hatching
  dinoEggStage: number; // 0: rock, 1: cracked, 2: hatched baby, 3: golden raptor
  equippedHat?: string;
  equippedBackpack?: string;
  equippedAura?: string;
}

export type KidsProgress = KidsProgressState;

export interface BenchmarkAppAnalysis {
  id: string;
  name: string;
  category: "LLM Conversacional" | "EdTech Idiomas" | "IA Acompañante / Avatares" | "Productividad / Búsqueda" | "Generación de Voz / Audio" | "Herramientas de Código / Flow";
  company: string;
  coreHook: string;
  winningFeatures: string[];
  aiCapabilities: string[];
  uxDesignPatterns: string[];
  animationsAndKinematics: string[];
  retentionMechanics: string[];
  gamificationAndEconomy: string[];
  voiceAndAvatarTech: string[];
  keyTakeawaysForUs: string[];
  rating: number;
}

export interface Top100FeatureItem {
  id: number;
  category:
    | "1. Pedagogía & IA Adaptativa"
    | "2. Avatar 3D, Rigging & Cinemática"
    | "3. Motor de Voz, Fonética & Audio"
    | "4. Gamificación, Economía & Retención"
    | "5. Inmersión, Roleplay & Escenarios Reales"
    | "6. Memoria Cognitiva, Métricas & Comercial";
  name: string;
  description: string;
  userBenefit: string;
  complexity: "Baja" | "Media" | "Alta" | "Muy Alta";
  priority: "P0 - Esencial" | "P1 - Alta" | "P2 - Media" | "P3 - Diferencial";
  estimatedDevTime: string;
  techDependencies: string;
  statusInApp: "implemented" | "in_progress" | "roadmap";
}

export interface RoleplayScenarioItem {
  id: string;
  title: string;
  location: string;
  personaName: string;
  personaRole: string;
  avatarMood: AvatarAnimationState;
  difficulty: CEFRLevel;
  bgGradient: string;
  icon: string;
  objectives: { id: string; text: string; completed: boolean }[];
  initialTutorMessage: string;
  targetVocab: string[];
  contextPrompt: string;
}

export type SeasonalThemeId =
  | "winter_holiday"
  | "spring_bloom"
  | "summer_glow"
  | "autumn_harvest"
  | "default_dark"
  | "auto";

export type SeasonalParticleType = "snow" | "sakura" | "fireflies" | "leaves" | "sparkles";

export interface SeasonalThemeConfig {
  id: SeasonalThemeId;
  name: string;
  nameSpanish: string;
  seasonLabel: string;
  icon: string;
  holidayBadge?: string;
  description: string;
  dateRangeLabel?: string;
  colors: {
    bgRoot: string;
    bgGradient: string;
    auroraGlow: string;
    cardBg: string;
    cardBorder: string;
    cardBorderHover: string;
    accentText: string;
    accentBg: string;
    accentBorder: string;
    accentGlow: string;
    festiveTagBg: string;
    primaryButton: string;
    primaryButtonBorder: string;
    selection: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
  };
  cssVars: {
    primaryBtnGradient: string;
    primaryBtnText: string;
    primaryBtnBorder: string;
    primaryBtnShadow: string;
    accentColor: string;
    accentRgb: string;
    accentGlow: string;
    cardBorder: string;
    cardBg: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
  };
  particles: {
    type: SeasonalParticleType;
    count: number;
    speed: number;
    colors: string[];
    wind: number;
    glow: boolean;
  };
  decorativeHeaderIcon?: string;
}


