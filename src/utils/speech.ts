import { AvatarConfig } from "../types";

// --- REFERENCIAS DE AUDIO GLOBALES Y CACHÉ OFFLINE ---
let currentAudioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let animationFrameId: number | null = null;
const audioBufferCache = new Map<string, AudioBuffer>();

// Pre-calienta el AudioContext en el primer toque de pantalla para evitar retraso de 300ms
export function prewarmAudioContext(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!currentAudioCtx && AudioContextClass) {
      currentAudioCtx = new AudioContextClass();
    }
    if (currentAudioCtx && currentAudioCtx.state === "suspended") {
      currentAudioCtx.resume();
    }
  } catch {}
}

let currentUtterance: SpeechSynthesisUtterance | null = null;
let lipSyncTimeout: number | null = null;
let isSpeakingSequence = false;
let speechSequenceQueue: Array<{
  text: string;
  lang: string;
  rateMultiplier: number;
}> = [];

// --- CONTROLES GENERALES ---
export function stopSpeaking(): void {
  isSpeakingSequence = false;
  speechSequenceQueue = [];

  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch {}
    currentSource = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  if (lipSyncTimeout) {
    window.clearTimeout(lipSyncTimeout);
    lipSyncTimeout = null;
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return (
    isSpeakingSequence ||
    currentSource !== null ||
    (typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      window.speechSynthesis.speaking)
  );
}

// Limpia asteriscos, corchetes y comillas para que el motor lea fluido
export function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_{1,3}(.*?)_{1,3}/g, "$1")
    .replace(/`{1,3}(.*?)(?:`{1,3}|$)/g, "$1")
    .replace(/\[\s*(?:ipa|fon[eé]tica|phonetic|note|tip|ayuda)?:?\s*([^\]]+)\]/gi, "")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^[-* ]\s+/gm, "")
    .replace(/["]/g, "") // Quitar comillas para evitar pausas antinaturales
    .replace(/\s+/g, " ")
    .trim();
}

// Helper para encontrar la mejor voz según idioma y género
export function findBestVoice(
  lang: string,
  genero: "male" | "female" = "female"
): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voces = window.speechSynthesis.getVoices();
  if (!voces || voces.length === 0) return null;

  const isFemale = genero === "female";
  const langPrefix = lang.slice(0, 2).toLowerCase();

  const femalePattern = /female|woman|girl|samantha|victoria|karen|zira|jenny|aria|monica|helena|paulina|laura|elena|rosa|catherine|susan|fiona|veena|hazel|ava|serena|stephanie|sarah/i;
  const malePattern = /male|man|boy|david|mark|guy|george|christopher|alex|daniel|fred|oliver|arthur|steven|richard|tom|bruce|junior|ralph|vicente|enrique|carlos|alvaro|jorge|pablo|raul|diego|miguel|ryan|matthew|brian|reed/i;

  // Filtrar voces del idioma correspondiente
  const langVoices = voces.filter((v) =>
    v.lang.toLowerCase().startsWith(langPrefix)
  );

  const candidatePool = langVoices.length > 0 ? langVoices : voces;

  // 1. Voz Neural / Premium / Natural con coincidencia estricta de género
  const bestNeural = candidatePool.find((v) => {
    const isNeural =
      v.name.includes("Natural") ||
      v.name.includes("Neural") ||
      v.name.includes("Online") ||
      v.name.includes("Premium");
    if (!isNeural) return false;
    return isFemale ? femalePattern.test(v.name) : malePattern.test(v.name) && !femalePattern.test(v.name);
  });
  if (bestNeural) return bestNeural;

  // 2. Voz que coincide explícitamente con el patrón de género en el idioma
  const explicitGenderVoice = candidatePool.find((v) => {
    if (isFemale) {
      return femalePattern.test(v.name);
    } else {
      return malePattern.test(v.name) && !femalePattern.test(v.name);
    }
  });
  if (explicitGenderVoice) return explicitGenderVoice;

  // 3. Si se pidió voz masculina, evitar voces femeninas conocidas
  if (!isFemale) {
    const nonFemaleVoice = candidatePool.find(
      (v) => !femalePattern.test(v.name) && (v.name.toLowerCase().includes("male") || !v.name.toLowerCase().includes("female"))
    );
    if (nonFemaleVoice) return nonFemaleVoice;
  }

  // 4. Coincidencia por dialecto exacto (ej. en-US o es-ES)
  const exactDialect = candidatePool.find((v) =>
    v.lang.toLowerCase().startsWith(lang.toLowerCase())
  );
  if (exactDialect) return exactDialect;

  // 5. Coincidencia general
  return candidatePool[0] || voces[0] || null;
}

// --- MOTOR NATIVO CON COLA SECUENCIAL FLUIDA ---
export const hablarSegmentoNativo = (
  texto: string,
  genero: "male" | "female" = "female",
  targetLang: string = "en-US",
  rateMultiplier: number = 1.0,
  onLipSync?: (apertura: number) => void,
  onSegmentEnd?: () => void
): void => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onSegmentEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = targetLang;

  const baseRate = targetLang.startsWith("es") ? 0.98 : 0.94;
  utterance.rate = baseRate * rateMultiplier;
  utterance.pitch = genero === "female" ? 1.04 : 0.96;

  const voz = findBestVoice(targetLang, genero);
  if (voz) {
    utterance.voice = voz;
  }

  let speakingTimer: number | null = null;

  utterance.onstart = () => {
    if (onLipSync) {
      onLipSync(0.7);
      // Bucle continuo de modulación fonética / sílabas durante el habla
      let startTime = Date.now();
      const runModulation = () => {
        if (!window.speechSynthesis.speaking) return;
        const elapsedSec = (Date.now() - startTime) / 1000;
        // Cadencia rítmica de sílabas y apertura de pico
        const syllableCycle = Math.sin(elapsedSec * 16) * Math.cos(elapsedSec * 8);
        const dynamicOpening = Math.max(0.15, Math.min(1.0, 0.5 + syllableCycle * 0.45));
        onLipSync(dynamicOpening);
        speakingTimer = window.requestAnimationFrame(runModulation);
      };
      speakingTimer = window.requestAnimationFrame(runModulation);
    }
  };

  utterance.onboundary = (event: SpeechSynthesisEvent) => {
    if (event.name === "word" && onLipSync) {
      onLipSync(0.95);
      if (lipSyncTimeout) window.clearTimeout(lipSyncTimeout);
      lipSyncTimeout = window.setTimeout(() => {
        onLipSync(0.35);
      }, 100);
    }
  };

  const handleFinish = () => {
    if (speakingTimer) cancelAnimationFrame(speakingTimer);
    if (lipSyncTimeout) window.clearTimeout(lipSyncTimeout);
    if (onLipSync) onLipSync(0);
    onSegmentEnd?.();
  };

  utterance.onend = handleFinish;
  utterance.onerror = handleFinish;

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
};

// --- SÍNTESIS BILINGÜE INTELIGENTE (Code-Switching Automático) ---
export async function speakBilingualSpeech(
  segments: Array<{ text: string; lang: "es-ES" | "en-US" | "en-GB" | "en-AU" }>,
  avatarConfig: AvatarConfig,
  onStart?: () => void,
  onEnd?: () => void,
  onLipSync?: (phonemeIntensity: number) => void,
  options?: { rateMultiplier?: number }
): Promise<void> {
  stopSpeaking();

  const validSegments = segments
    .map((s) => ({
      text: cleanTextForSpeech(s.text),
      lang: s.lang,
    }))
    .filter((s) => s.text.length > 0);

  if (validSegments.length === 0) {
    onEnd?.();
    return;
  }

  isSpeakingSequence = true;
  onStart?.();

  let currentIndex = 0;

  const playNextSegment = () => {
    if (!isSpeakingSequence || currentIndex >= validSegments.length) {
      isSpeakingSequence = false;
      if (onLipSync) onLipSync(0);
      onEnd?.();
      return;
    }

    const current = validSegments[currentIndex];
    currentIndex++;

    hablarSegmentoNativo(
      current.text,
      avatarConfig.voiceGender,
      current.lang,
      options?.rateMultiplier || 1.0,
      onLipSync,
      () => {
        // Breve micro-pausa natural entre idiomas (120ms)
        setTimeout(() => {
          if (isSpeakingSequence) {
            playNextSegment();
          }
        }, 120);
      }
    );
  };

  playNextSegment();
}

// --- FUNCIÓN PRINCIPAL DE ENRUTAMIENTO DE VOZ ---
export async function speakText(
  text: string,
  avatarConfig: AvatarConfig,
  onStart?: () => void,
  onEnd?: () => void,
  onLipSync?: (phonemeIntensity: number) => void,
  options?: {
    forceLang?: string;
    rateMultiplier?: number;
    bilingualContext?: {
      teacherCommentary?: string;
      targetEnglishPhrase?: string;
    };
  }
): Promise<void> {
  stopSpeaking();

  // Si se proporciona contexto bilingüe (Español cálido + Inglés nativo), ejecutar síntesis bilingüe inteligente
  if (
    options?.bilingualContext &&
    (options.bilingualContext.teacherCommentary ||
      options.bilingualContext.targetEnglishPhrase)
  ) {
    const segments: Array<{ text: string; lang: "es-ES" | "en-US" | "en-GB" | "en-AU" }> = [];

    if (options.bilingualContext.teacherCommentary) {
      segments.push({
        text: options.bilingualContext.teacherCommentary,
        lang: "es-ES",
      });
    }

    const englishText =
      options.bilingualContext.targetEnglishPhrase || text;
    if (englishText) {
      segments.push({
        text: englishText,
        lang: (avatarConfig.voiceAccent as any) || "en-US",
      });
    }

    if (segments.length > 0) {
      return speakBilingualSpeech(
        segments,
        avatarConfig,
        onStart,
        onEnd,
        onLipSync,
        { rateMultiplier: options.rateMultiplier }
      );
    }
  }

  const cleanedText = cleanTextForSpeech(text);
  if (!cleanedText) {
    onEnd?.();
    return;
  }

  // Detección automática del idioma si no se especificó forceLang
  let targetLang = options?.forceLang || avatarConfig.voiceAccent || "en-US";
  if (!options?.forceLang) {
    // Si contiene caracteres o patrones típicos del español
    const isSpanishText =
      /[áéíóúñ¿¡]/i.test(cleanedText) ||
      /\b(hola|bueno|muy|bien|vamos|practicar|inglés|dime|puedes|profesora|excelente|consejo|recuerda|escucha)\b/i.test(
        cleanedText
      );
    if (isSpanishText) {
      targetLang = "es-ES";
    }
  }

  // 1. SI EL USUARIO ELIGIÓ ELEVENLABS, PEDIR AL BACKEND SEGURO
  if (avatarConfig.voiceEngine === "elevenlabs") {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanedText,
          gender: avatarConfig.voiceGender,
          speakingRate: options?.rateMultiplier
            ? (avatarConfig.voiceRate || 1.0) * options.rateMultiplier
            : avatarConfig.voiceRate || 1.0,
        }),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        currentAudioCtx = new AudioContextClass();
        if (currentAudioCtx.state === "suspended") await currentAudioCtx.resume();

        const audioBuffer = await currentAudioCtx.decodeAudioData(arrayBuffer);
        currentSource = currentAudioCtx.createBufferSource();
        currentSource.buffer = audioBuffer;

        const analyser = currentAudioCtx.createAnalyser();
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        currentSource.connect(analyser);
        analyser.connect(currentAudioCtx.destination);

        currentSource.onended = () => {
          stopSpeaking();
          if (onLipSync) onLipSync(0);
          onEnd?.();
        };

        const updateLipSync = () => {
          if (!isSpeaking() || !onLipSync) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          onLipSync(Math.min(1, avg / 80));
          animationFrameId = requestAnimationFrame(updateLipSync);
        };

        onStart?.();
        currentSource.start(0);
        updateLipSync();
        return;
      }
    } catch (e) {
      console.warn("Fallo el servicio PRO, utilizando motor nativo gratuito.");
    }
  }

  // 2. MOTOR NATIVO (GRATUITO E ILIMITADO)
  hablarSegmentoNativo(
    cleanedText,
    avatarConfig.voiceGender,
    targetLang,
    options?.rateMultiplier || 1.0,
    onLipSync,
    onEnd
  );

  onStart?.();
}

// --- SERVICIO DE RECONOCIMIENTO DE VOZ (STT) ---
export interface SpeechRecognitionListener {
  onTranscript: (text: string, isFinal: boolean) => void;
  onStart: () => void;
  onEnd: () => void;
  onError: (error: string) => void;
}

export class VoiceRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private listeners: SpeechRecognitionListener[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";

        this.recognition.onstart = () => {
          this.isListening = true;
          this.listeners.forEach((l) => l.onStart());
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          const text = finalTranscript || interimTranscript;
          const isFinal = Boolean(finalTranscript);
          this.listeners.forEach((l) => l.onTranscript(text, isFinal));
        };

        this.recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          this.isListening = false;
          this.listeners.forEach((l) => l.onError(event.error));
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.listeners.forEach((l) => l.onEnd());
        };
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public subscribe(listener: SpeechRecognitionListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public startListening(): boolean {
    if (!this.recognition) return false;
    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn("Could not start recognition:", e);
      return false;
    }
  }

  public stopListening(): void {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn("Could not stop recognition:", e);
    }
    this.isListening = false;
  }
}

export const voiceRecognizer = new VoiceRecognitionService();
