import { AvatarConfig, CEFRLevel, ChatMessage, UserStats, VocabularyItem, UserGamificationState, AppTheme } from "../types";
import { AVATAR_PRESETS } from "../data/presets";
import { saveLargeAsset, getLargeAsset, deleteLargeAsset } from "./idbStorage";

const STORAGE_KEYS = {
  AVATAR_CONFIG: "vt_avatar_config_v1",
  CEFR_LEVEL: "vt_cefr_level_v1",
  CHAT_HISTORY: "vt_chat_history_v1",
  VOCABULARY: "vt_vocabulary_v1",
  USER_STATS: "vt_user_stats_v1",
  ACTIVE_TOPIC: "vt_active_topic_v1",
  APP_THEME: "vt_app_theme_v1",
};

export function getStoredAvatarConfig(): AvatarConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AVATAR_CONFIG);
    if (data) {
      const parsed: AvatarConfig = JSON.parse(data);
      // Clean up temporary blob: URLs that expire after page reload to avoid 404s
      if (parsed.customGlbUrl && typeof parsed.customGlbUrl === "string" && parsed.customGlbUrl.startsWith("blob:")) {
        delete parsed.customGlbUrl;
        delete parsed.customGlbName;
        if (parsed.avatarType === "custom_glb") {
          parsed.avatarType = "3d";
        }
      }
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to parse avatar config from storage:", e);
  }
  return AVATAR_PRESETS.bet_turpial || AVATAR_PRESETS.teacher_female;
}

// Asynchronously restores large assets (3D GLB or high-res images) from IndexedDB
export async function restoreLargeAvatarAssets(config: AvatarConfig): Promise<AvatarConfig> {
  const updated = { ...config };
  try {
    // If avatar was custom GLB but URL was stripped from localStorage to save quota
    if (config.avatarType === "custom_glb" && !config.customGlbUrl) {
      const storedGlb = await getLargeAsset("vt_avatar_custom_glb");
      if (storedGlb) {
        if (typeof storedGlb === "string") {
          updated.customGlbUrl = storedGlb;
        } else if (storedGlb instanceof Blob || storedGlb instanceof ArrayBuffer) {
          const blob = storedGlb instanceof Blob ? storedGlb : new Blob([storedGlb], { type: "model/gltf-binary" });
          updated.customGlbUrl = URL.createObjectURL(blob);
        }
      }
    }

    // If avatar was 2D custom image
    if (config.avatarType === "2d" && !config.customImageUrl) {
      const storedImg = await getLargeAsset("vt_avatar_custom_image");
      if (storedImg) {
        if (typeof storedImg === "string") {
          updated.customImageUrl = storedImg;
        } else if (storedImg instanceof Blob) {
          updated.customImageUrl = URL.createObjectURL(storedImg);
        }
      }
    }
  } catch (err) {
    console.warn("Could not restore large avatar assets from IndexedDB:", err);
  }
  return updated;
}

export function saveAvatarConfig(config: AvatarConfig): void {
  try {
    // Create a lightweight sanitized copy for localStorage
    const sanitized: AvatarConfig = { ...config };

    // If customGlbUrl is large (e.g. data: URI > 20KB), offload to IndexedDB
    if (config.customGlbUrl && typeof config.customGlbUrl === "string") {
      if (config.customGlbUrl.startsWith("data:") || config.customGlbUrl.length > 20000) {
        saveLargeAsset("vt_avatar_custom_glb", config.customGlbUrl);
        // Do NOT store bulky base64 data URIs in localStorage to avoid QuotaExceededError
        delete sanitized.customGlbUrl;
      } else if (config.customGlbUrl.startsWith("blob:")) {
        // Blob URLs don't survive reload; omit from localStorage
        delete sanitized.customGlbUrl;
      }
    } else {
      deleteLargeAsset("vt_avatar_custom_glb");
    }

    // If customImageUrl is a large data: URI, offload to IndexedDB
    if (config.customImageUrl && typeof config.customImageUrl === "string") {
      if (config.customImageUrl.startsWith("data:") || config.customImageUrl.length > 20000) {
        saveLargeAsset("vt_avatar_custom_image", config.customImageUrl);
        delete sanitized.customImageUrl;
      }
    } else {
      deleteLargeAsset("vt_avatar_custom_image");
    }

    localStorage.setItem(STORAGE_KEYS.AVATAR_CONFIG, JSON.stringify(sanitized));
  } catch (e: any) {
    // If localStorage quota is exceeded, strip non-essential properties and retry safely
    try {
      const minimalConfig: AvatarConfig = {
        preset: config.preset || "bet_turpial",
        name: config.name || "Bet Turpial",
        role: config.role || "Tutor",
        skinTone: config.skinTone || "#f59e0b",
        hairStyle: config.hairStyle || "bun",
        hairColor: config.hairColor || "#0f172a",
        glasses: config.glasses || "none",
        outfit: config.outfit || "corporate_suit",
        outfitColor: config.outfitColor || "#ea580c",
        accentColor: config.accentColor || "#facc15",
        accessory: config.accessory || "none",
        avatarType: config.avatarType || "3d",
        voiceGender: config.voiceGender || "female",
        voiceRate: config.voiceRate || 1.0,
        voicePitch: config.voicePitch || 1.0,
        voiceAccent: config.voiceAccent || "en-US",
      };
      localStorage.setItem(STORAGE_KEYS.AVATAR_CONFIG, JSON.stringify(minimalConfig));
    } catch (innerError) {
      console.warn("Storage quota full: Unable to write to localStorage for avatar config", innerError);
    }
  }
}

export function getStoredLevel(): CEFRLevel {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CEFR_LEVEL);
    if (data && ["A1", "A2", "B1", "B2", "C1"].includes(data)) {
      return data as CEFRLevel;
    }
  } catch (e) {
    console.error("Failed to get level from storage:", e);
  }
  return "B1";
}

export function saveStoredLevel(level: CEFRLevel): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CEFR_LEVEL, level);
  } catch (e) {
    console.error("Failed to save level:", e);
  }
}

export function getStoredHistory(): ChatMessage[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load chat history:", e);
  }
  return [];
}

export function saveStoredHistory(history: ChatMessage[]): void {
  try {
    // Keep max 40 messages in local storage
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history.slice(-40)));
  } catch (e) {
    console.error("Failed to save chat history:", e);
  }
}

export function getStoredVocabulary(): VocabularyItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to get vocabulary:", e);
  }
  return [
    {
      id: "v-1",
      word: "fluency",
      ipa: "/ˈfluː.ən.si/",
      meaning: "Fluidez o soltura para hablar un idioma",
      example: "Practicing every day is the key to natural fluency.",
      dateAdded: Date.now() - 86400000 * 2,
      mastered: true,
    },
    {
      id: "v-2",
      word: "insightful",
      ipa: "/ˈɪn.saɪt.fəl/",
      meaning: "Perspicaz, revelador o profundo",
      example: "That was an insightful question about English phonetics.",
      dateAdded: Date.now() - 86400000,
      mastered: false,
    },
    {
      id: "v-3",
      word: "perseverance",
      ipa: "/ˌpɜː.sɪˈvɪə.rəns/",
      meaning: "Perseverancia y constancia",
      example: "Language learning requires daily perseverance.",
      dateAdded: Date.now(),
      mastered: false,
    },
  ];
}

export function saveStoredVocabulary(items: VocabularyItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save vocabulary:", e);
  }
}

export function getStoredStats(): UserStats {
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultStats: UserStats = {
    streakDays: 3,
    lastPracticeDate: todayStr,
    messagesExchanged: 18,
    wordsLearned: 12,
    minutesPracticed: 25,
  };

  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (data) {
      const stats: UserStats = JSON.parse(data);
      // Streak validation
      const lastDate = stats.lastPracticeDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (lastDate === todayStr) {
        // already practiced today
        return stats;
      } else if (lastDate === yesterday) {
        // Streak intact
        return stats;
      } else {
        // Streak reset if skipped more than 1 day
        stats.streakDays = 1;
        stats.lastPracticeDate = todayStr;
        return stats;
      }
    }
  } catch (e) {
    console.error("Failed to get stats:", e);
  }
  return defaultStats;
}

export function saveStoredStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save user stats:", e);
  }
}

export function getStoredTopic(): string {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_TOPIC) || "free_talk";
}

export function saveStoredTopic(topicId: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TOPIC, topicId);
}

const DEFAULT_GAMIFICATION: UserGamificationState = {
  streakDays: 3,
  lastPracticeDate: new Date().toISOString().split("T")[0],
  xpPoints: 120,
  gems: 45,
  completedChallenges: 2,
  unlockedAchievements: ["first_word", "streak_3"],
  level: 2,
  perfectPhrasesCount: 5,
};

export function getStoredGamification(): UserGamificationState {
  try {
    const saved = localStorage.getItem("vt_gamification_state");
    if (saved) {
      const parsed: UserGamificationState = JSON.parse(saved);
      return { ...DEFAULT_GAMIFICATION, ...parsed };
    }
  } catch (err) {
    console.error("Error loading gamification from localStorage:", err);
  }
  return DEFAULT_GAMIFICATION;
}

export function saveStoredGamification(state: UserGamificationState): void {
  try {
    localStorage.setItem("vt_gamification_state", JSON.stringify(state));
  } catch (err) {
    console.error("Error saving gamification to localStorage:", err);
  }
}

import { calculateSimilarity } from "./pronunciationMatcher";
export { calculateSimilarity };

export function getStoredAppTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.APP_THEME);
    if (saved === "high-contrast-light" || saved === "dark") {
      return saved;
    }
  } catch (err) {
    console.error("Error reading theme from storage:", err);
  }
  return "dark";
}

export function saveStoredAppTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_THEME, theme);
  } catch (err) {
    console.error("Error saving theme to storage:", err);
  }
}
