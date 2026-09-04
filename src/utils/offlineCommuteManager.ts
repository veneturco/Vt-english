import { saveLargeAsset, getLargeAsset } from "./idbStorage";

export interface OfflinePack {
  id: string;
  title: string;
  subtitle: string;
  sizeMB: number;
  itemsCount: number;
  icon: string;
  description: string;
  category: "Metro" | "Avión" | "Audio" | "Entrevistas";
}

export const OFFLINE_PACKS_CATALOG: OfflinePack[] = [
  {
    id: "pack_metro_a1a2",
    title: "Pack Metro: A1/A2 Esencial",
    subtitle: "Vocabulario clave y diálogos para trayectos cortos",
    sizeMB: 3.2,
    itemsCount: 120,
    icon: "🚇",
    category: "Metro",
    description: "120 flashcards prioritarias, gramática rápida y 10 diálogos cotidianos para practicar en el subterráneo sin cobertura.",
  },
  {
    id: "pack_flight_b1b2",
    title: "Pack Avión: B1/B2 Negocios",
    subtitle: "Plantillas ejecutivas y casos de rol corporativos",
    sizeMB: 4.8,
    itemsCount: 85,
    icon: "✈️",
    category: "Avión",
    description: "Escenarios de negociación, plantillas de correo para cerrar acuerdos y 4 roleplays de alta fidelidad para vuelos largos.",
  },
  {
    id: "pack_audio_podcast",
    title: "Pack Audio Inmersión",
    subtitle: "4 episodios de podcast corporativo con transcripciones",
    sizeMB: 5.5,
    itemsCount: 4,
    icon: "🎧",
    category: "Audio",
    description: "Episodios de audio con modo shadowing y reproductor continuo para escuchar con la pantalla apagada o caminando.",
  },
  {
    id: "pack_star_accents",
    title: "Pack STAR & Acentos Globales",
    subtitle: "Simulador de entrevistas y los 5 acentos internacionales",
    sizeMB: 2.9,
    itemsCount: 50,
    icon: "🌐",
    category: "Entrevistas",
    description: "Preguntas conductuales de FAANG y ejercicios auditivos de comprensión de acento (US, UK, IN, AU, EU) sin conexión.",
  },
];

const OFFLINE_PACKS_STORAGE_KEY = "vt_offline_packs_status_v1";
const AIRPLANE_SIMULATION_KEY = "vt_simulated_airplane_mode_v1";

export interface StoredPackStatus {
  packId: string;
  downloaded: boolean;
  downloadedAt?: number;
  sizeMB: number;
}

export function getStoredOfflinePacks(): Record<string, StoredPackStatus> {
  try {
    if (typeof localStorage !== "undefined") {
      const data = localStorage.getItem(OFFLINE_PACKS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    }
  } catch (err) {
    console.warn("Error reading offline packs status:", err);
  }
  return {};
}

export function saveStoredOfflinePacks(status: Record<string, StoredPackStatus>): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(OFFLINE_PACKS_STORAGE_KEY, JSON.stringify(status));
    }
  } catch (err) {
    console.warn("Error saving offline packs status:", err);
  }
}

export async function downloadOfflinePack(
  packId: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const pack = OFFLINE_PACKS_CATALOG.find((p) => p.id === packId);
  if (!pack) return;

  // Generate pack bundle payload in memory
  const simulatedBundle = {
    packId: pack.id,
    version: 1,
    title: pack.title,
    content: `OFFLINE_DATA_PAYLOAD_FOR_${pack.id}`,
    timestamp: Date.now(),
    cachedItemsCount: pack.itemsCount,
  };

  // Simulate chunked streaming download to provide smooth UX
  for (let i = 10; i <= 100; i += 20) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    onProgress?.(i);
  }

  // Persist bundle in IndexedDB for reliable offline access
  await saveLargeAsset(`offline_pack_${packId}`, JSON.stringify(simulatedBundle));

  // Update status in localStorage
  const current = getStoredOfflinePacks();
  current[packId] = {
    packId,
    downloaded: true,
    downloadedAt: Date.now(),
    sizeMB: pack.sizeMB,
  };
  saveStoredOfflinePacks(current);
}

export async function removeOfflinePack(packId: string): Promise<void> {
  const current = getStoredOfflinePacks();
  delete current[packId];
  saveStoredOfflinePacks(current);

  // Clear from IndexedDB
  await saveLargeAsset(`offline_pack_${packId}`, "");
}

export function getTotalOfflineStorageMB(): number {
  const packs = getStoredOfflinePacks();
  return Object.values(packs).reduce((sum, p) => (p.downloaded ? sum + p.sizeMB : sum), 0);
}

export function isAirplaneModeActive(): boolean {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(AIRPLANE_SIMULATION_KEY) === "true";
    }
  } catch {}
  return false;
}

export function setAirplaneMode(active: boolean): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(AIRPLANE_SIMULATION_KEY, active ? "true" : "false");
    }
  } catch {}
}
