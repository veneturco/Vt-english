import { SRSFlashcard, VocabularyItem } from "../types";

const SRS_STORAGE_KEY = "vt_srs_flashcards";

const DEFAULT_FLASHCARDS: SRSFlashcard[] = [
  {
    id: "card_1",
    frontWord: "Would you mind...",
    backMeaning: "¿Te importaría... / Serías tan amable de...",
    ipa: "/wʊd jʊ maɪnd/",
    phoneticSpanish: "Wud-iu-maind",
    exampleSentence: "Would you mind turning down the music?",
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "card_2",
    frontWord: "I'd rather...",
    backMeaning: "Preferiría...",
    ipa: "/aɪd ˈræð.ər/",
    phoneticSpanish: "Aid-rad-er",
    exampleSentence: "I'd rather have an iced latte, please.",
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "card_3",
    frontWord: "Catch up with",
    backMeaning: "Ponerse al día con alguien",
    ipa: "/kætʃ ʌp wɪð/",
    phoneticSpanish: "Katch-ap-wid",
    exampleSentence: "Let's catch up over coffee this Friday!",
    intervalDays: 2,
    repetitions: 1,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "card_4",
    frontWord: "Look forward to",
    backMeaning: "Esperar con ansias / ilusión",
    ipa: "/lʊk ˈfɔːr.wɚd tuː/",
    phoneticSpanish: "Luk-for-ward-tu",
    exampleSentence: "I look forward to hearing from you soon.",
    intervalDays: 3,
    repetitions: 2,
    easeFactor: 2.6,
    nextReviewDate: new Date().toISOString().split("T")[0],
  },
];

export function getStoredFlashcards(): SRSFlashcard[] {
  try {
    const data = localStorage.getItem(SRS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load flashcards", e);
  }
  return DEFAULT_FLASHCARDS;
}

export function saveStoredFlashcards(cards: SRSFlashcard[]): void {
  try {
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error("Failed to save flashcards", e);
  }
}

// SM-2 Spaced Repetition Algorithm Implementation
export function reviewFlashcard(
  card: SRSFlashcard,
  grade: 0 | 1 | 2 | 3 // 0: Again (Fail), 1: Hard, 2: Good, 3: Easy
): SRSFlashcard {
  let { repetitions, intervalDays, easeFactor } = card;

  if (grade < 2) {
    // Reset if failed
    repetitions = 0;
    intervalDays = 1;
  } else {
    // Success
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 3;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  // Adjust ease factor
  const qualityFactor = grade === 3 ? 0.1 : grade === 2 ? 0 : grade === 1 ? -0.15 : -0.25;
  easeFactor = Math.max(1.3, easeFactor + qualityFactor);

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    ...card,
    repetitions,
    intervalDays,
    easeFactor,
    nextReviewDate: nextDate.toISOString().split("T")[0],
  };
}

export function importVocabularyToFlashcards(
  existingCards: SRSFlashcard[],
  vocabItems: VocabularyItem[]
): SRSFlashcard[] {
  const currentWords = new Set(existingCards.map((c) => c.frontWord.toLowerCase()));
  const newCards: SRSFlashcard[] = [];

  vocabItems.forEach((v) => {
    if (!currentWords.has(v.word.toLowerCase())) {
      newCards.push({
        id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        frontWord: v.word,
        backMeaning: v.meaning,
        ipa: v.ipa,
        phoneticSpanish: v.phoneticSpanish,
        exampleSentence: v.example,
        intervalDays: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date().toISOString().split("T")[0],
      });
      currentWords.add(v.word.toLowerCase());
    }
  });

  const updated = [...existingCards, ...newCards];
  saveStoredFlashcards(updated);
  return updated;
}
