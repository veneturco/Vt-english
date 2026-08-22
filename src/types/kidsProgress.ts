export type EggStage = "intact" | "cracking_light" | "cracking_heavy" | "hatched";

export interface MysteryDinoSpecies {
  id: string;
  name: string;
  avatar: string;
  description: string;
  bonusCoins: number;
  bonusStars: number;
}

export const MYSTERY_DINO_SPECIES: MysteryDinoSpecies[] = [
  {
    id: "baby_rexy",
    name: "Rexy the Baby Raptor",
    avatar: "/images/raptor-avatar.png",
    description: "¡Un velociraptor super rápido y curioso!",
    bonusCoins: 100,
    bonusStars: 15,
  },
  {
    id: "spiky_tricera",
    name: "Spiky the Triceratops",
    avatar: "🦏",
    description: "¡Un triceratops tierno y protector!",
    bonusCoins: 120,
    bonusStars: 20,
  },
  {
    id: "flyer_ptero",
    name: "Pip the Pterodactyl",
    avatar: "🦅",
    description: "¡Un explorador de los cielos prehistóricos!",
    bonusCoins: 150,
    bonusStars: 25,
  },
  {
    id: "bronto_leaf",
    name: "Leafy the Brontosaurus",
    avatar: "🦕",
    description: "¡El gigante más noble comelón de hojas!",
    bonusCoins: 200,
    bonusStars: 30,
  },
];

export const REQUIRED_STREAK_TO_HATCH = 5;

/**
 * Calcula la etapa de incubación según los días de racha actuales
 */
export function getEggStageByStreak(streakDays: number): EggStage {
  if (streakDays >= REQUIRED_STREAK_TO_HATCH) return "hatched";
  if (streakDays >= 4) return "cracking_heavy";
  if (streakDays >= 2) return "cracking_light";
  return "intact";
}
