export interface KidsOptionCard {
  id: string;
  word: string;
  emoji: string;
  labelEs: string;
}

export interface KidsMission {
  id: string;
  title: string;
  characterName: string;
  characterAvatar: string; // Puede ser ruta de imagen ("/images/raptor-avatar.png") o emoji ("🦖")
  targetWord: string;
  visualHintEmoji: string;
  initialDialogue: string;
  optionsFallback: KidsOptionCard[];
}

export const KIDS_MISSIONS: KidsMission[] = [
  {
    id: "mission_dino_snack",
    title: "Dino Snack Time! 🍎",
    characterName: "Rexy the Raptor",
    characterAvatar: "/images/raptor-avatar.png",
    targetWord: "apple",
    visualHintEmoji: "🍎",
    initialDialogue: "I am super hungry! Can you feed me a red APPLE?",
    optionsFallback: [
      { id: "opt-1", word: "apple", emoji: "🍎", labelEs: "Manzana" },
      { id: "opt-2", word: "banana", emoji: "🍌", labelEs: "Plátano" },
      { id: "opt-3", word: "cookie", emoji: "🍪", labelEs: "Galleta" },
    ],
  },
  {
    id: "mission_color_quest",
    title: "Magic Color Quest! 🎨",
    characterName: "Leo the Explorer",
    characterAvatar: "🦁",
    targetWord: "blue",
    visualHintEmoji: "🌊",
    initialDialogue: "Look at the big ocean! What color is it? Say BLUE!",
    optionsFallback: [
      { id: "opt-1", word: "blue", emoji: "🔵", labelEs: "Azul" },
      { id: "opt-2", word: "yellow", emoji: "🟡", labelEs: "Amarillo" },
      { id: "opt-3", word: "green", emoji: "🟢", labelEs: "Verde" },
    ],
  },
  {
    id: "mission_animal_sounds",
    title: "Safari Animal Friends! 🦁",
    characterName: "Pip the Bird",
    characterAvatar: "🦜",
    targetWord: "lion",
    visualHintEmoji: "👑",
    initialDialogue: "I hear a loud ROAR in the jungle! Is that a LION?",
    optionsFallback: [
      { id: "opt-1", word: "lion", emoji: "🦁", labelEs: "León" },
      { id: "opt-2", word: "monkey", emoji: "🐵", labelEs: "Mono" },
      { id: "opt-3", word: "elephant", emoji: "🐘", labelEs: "Elefante" },
    ],
  },
];
