import { CEFRLevel, TeachingMode, AppExperienceMode, ChatMessage, UserStats, VocabularyItem } from "../types";

export interface ActiveLearningSessionSnapshot {
  timestamp: number;
  cefrLevel: CEFRLevel;
  topicId: string;
  topicTitle?: string;
  teachingMode: TeachingMode;
  experienceMode: AppExperienceMode;
  recentMessages: ChatMessage[];
  lastTargetPhrase?: string;
  lastPhoneticGuide?: string;
  lastPedagogicalTip?: string;
  vocabulary: VocabularyItem[];
  stats?: UserStats;
  activeLessonNodeId?: string;
  activeLessonTitle?: string;
}

const OFFLINE_SESSION_KEY = "vt_last_active_learning_session_v1";

/**
 * Register the Service Worker for asset caching and offline resilience
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[ServiceWorker] Registered with scope:", registration.scope);

        // Check for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  console.log("[ServiceWorker] New version available.");
                } else {
                  console.log("[ServiceWorker] Content is cached for offline use.");
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.warn("[ServiceWorker] Registration failed:", error);
      });
  });
}

/**
 * Save snapshot of the user's active learning session to both localStorage and Service Worker cache
 */
export function saveActiveLearningSessionSnapshot(
  partialSnapshot: Partial<ActiveLearningSessionSnapshot>
): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getLastActiveLearningSessionSnapshot();
    const merged: ActiveLearningSessionSnapshot = {
      timestamp: Date.now(),
      cefrLevel: partialSnapshot.cefrLevel || existing?.cefrLevel || "B1",
      topicId: partialSnapshot.topicId || existing?.topicId || "free_talk",
      topicTitle: partialSnapshot.topicTitle || existing?.topicTitle || "Conversación Libre",
      teachingMode: partialSnapshot.teachingMode || existing?.teachingMode || "bilingual_coach",
      experienceMode: partialSnapshot.experienceMode || existing?.experienceMode || "adults",
      recentMessages: partialSnapshot.recentMessages || existing?.recentMessages || [],
      lastTargetPhrase: partialSnapshot.lastTargetPhrase || existing?.lastTargetPhrase,
      lastPhoneticGuide: partialSnapshot.lastPhoneticGuide || existing?.lastPhoneticGuide,
      lastPedagogicalTip: partialSnapshot.lastPedagogicalTip || existing?.lastPedagogicalTip,
      vocabulary: partialSnapshot.vocabulary || existing?.vocabulary || [],
      stats: partialSnapshot.stats || existing?.stats,
      activeLessonNodeId: partialSnapshot.activeLessonNodeId || existing?.activeLessonNodeId,
      activeLessonTitle: partialSnapshot.activeLessonTitle || existing?.activeLessonTitle,
    };

    // Save to local storage for instant sync
    localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(merged));

    // Also notify active Service Worker to store in session cache
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CACHE_ACTIVE_SESSION",
        payload: merged,
      });
    }
  } catch (err) {
    console.warn("Failed to persist offline active session snapshot:", err);
  }
}

/**
 * Retrieve the last active learning session snapshot
 */
export function getLastActiveLearningSessionSnapshot(): ActiveLearningSessionSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(OFFLINE_SESSION_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Failed to read offline active session snapshot:", err);
  }
  return null;
}

/**
 * Generate intelligent offline conversational turn when internet is disconnected
 */
export function generateOfflineTutorTurn(
  userText: string,
  context: {
    level: CEFRLevel;
    topicId: string;
    teacherName?: string;
  }
): ChatMessage {
  const teacher = context.teacherName || "Prof. Sarah Miller";
  const cleaned = userText.trim();

  // Curated educational offline response bank based on user input & CEFR level
  let tutorSpeech = `That's a great effort! Even without an active internet connection, our learning session continues smoothly. Can you try describing your daily routine or asking me another question?`;
  let commentary = "¡Excelente práctica sin conexión! Tu pronunciación y fluidez se refuerzan cada vez que hablas en voz alta.";
  let targetPhrase = "I am practicing English even when I am offline.";
  let phonetic = "aɪ æm ˈpræk.tɪ.sɪŋ ˈɪŋ.ɡlɪʃ ˈiː.vən wen aɪ æm ˌɒfˈlaɪn";
  let linking = "Une 'I am' como 'aɪm' y pronuncia 'practicing English' sin cortar el flujo de aire.";
  let chips = [
    "I want to review my previous vocabulary.",
    "Could we practice pronunciation drills?",
    "Tell me a common everyday expression.",
  ];

  if (cleaned.length === 0) {
    tutorSpeech = "Hello! I am ready to practice English with you. What would you like to speak about today?";
    commentary = "¡Hola! Estoy lista para practicar contigo. Elige una de las respuestas rápidas o di lo que gustes.";
  } else if (cleaned.toLowerCase().includes("hello") || cleaned.toLowerCase().includes("hi")) {
    tutorSpeech = "Hello there! It is great to hear from you. How has your day been going so far?";
    commentary = "¡Saludo recibido con éxito! Intenta responder con una frase completa sobre cómo va tu día.";
    targetPhrase = "My day has been going very well, thank you.";
    chips = ["My day has been great!", "I've been quite busy today.", "Everything is going fine, thanks."];
  } else if (cleaned.toLowerCase().includes("how are you")) {
    tutorSpeech = "I am doing wonderful, thank you for asking! How about you? Are you ready for our speaking drill?";
    targetPhrase = "I am ready to improve my speaking skills.";
    chips = ["Yes, I'm ready!", "Let's start the speaking practice.", "I want to practice my accent."];
  }

  return {
    id: "offline-msg-" + Date.now(),
    sender: "tutor",
    text: tutorSpeech,
    timestamp: Date.now(),
    teacherCommentary: commentary,
    targetEnglishPhrase: targetPhrase,
    phoneticGuide: phonetic,
    nativeLinkingTrick: linking,
    spanishTranslation: "Respuesta en modo sin conexión guardada en tu dispositivo.",
    quickChips: chips,
    correction: {
      hasError: false,
      praise: "¡Excelente iniciativa de práctica sin conexión!",
    },
    pedagogicalTip: "La memoria vocal y la confianza al hablar se desarrollan con la repetición constante.",
  };
}
