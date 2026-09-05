import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  HelpCircle,
  Flame,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { AvatarConfig } from "../types";
import { speakText } from "../utils/speech";
import { evaluatePhrasePronunciation } from "../utils/pronunciationMatcher";

interface PhoneticCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarConfig: AvatarConfig;
  initialTab?: "articulation" | "stress" | "minimal_pairs" | "linking";
}

// 1. ARTICULATORY PHONEMES DATA
interface ArticulatoryPhoneme {
  id: string;
  symbol: string;
  name: string;
  difficulty: "High" | "Medium" | "Essential";
  soundType: "Voiced (Con vibración)" | "Unvoiced (Puro aire)";
  targetWords: { word: string; sentence: string; phonetic: string }[];
  tonguePosition: "interdental" | "alveolar" | "retroflex" | "low_open" | "labiodental" | "velar";
  lipShape: "open" | "spread_wide" | "round" | "labiodental";
  airflowDirection: "forward_teeth" | "lip_friction" | "roof_curl" | "nasal";
  spanishGuide: string;
  secretTrick: string;
}

const ARTICULATORY_PHONEMES: ArticulatoryPhoneme[] = [
  {
    id: "th_unvoiced",
    symbol: "/θ/",
    name: "TH Sorda (Think, Thought, Birthday)",
    difficulty: "High",
    soundType: "Unvoiced (Puro aire)",
    targetWords: [
      { word: "Think", sentence: "I think this is great.", phonetic: "θɪŋk" },
      { word: "Thought", sentence: "She had a deep thought.", phonetic: "θɔːt" },
      { word: "Birthday", sentence: "Happy birthday to you!", phonetic: "ˈbɜːrθ.deɪ" },
      { word: "Health", sentence: "Good health is everything.", phonetic: "helθ" },
    ],
    tonguePosition: "interdental",
    lipShape: "open",
    airflowDirection: "forward_teeth",
    spanishGuide:
      "Coloca la punta de la lengua suavemente entre los dientes superiores e inferiores. Expulsa aire continuo sin hacer vibrar las cuerdas vocales (como la 'Z' de España, pero mucho más suave).",
    secretTrick: "¡No muerdas la lengua! Solo asoma 2 milímetros y deja escapar un soplido continuo.",
  },
  {
    id: "th_voiced",
    symbol: "/ð/",
    name: "TH Sonora (This, That, Brother, Together)",
    difficulty: "High",
    soundType: "Voiced (Con vibración)",
    targetWords: [
      { word: "This", sentence: "This is my favorite song.", phonetic: "ðɪs" },
      { word: "That", sentence: "Look at that sunset.", phonetic: "ðæt" },
      { word: "Brother", sentence: "My brother lives here.", phonetic: "ˈbrʌð.ər" },
      { word: "Together", sentence: "We are practicing together.", phonetic: "təˈɡeð.ər" },
    ],
    tonguePosition: "interdental",
    lipShape: "open",
    airflowDirection: "forward_teeth",
    spanishGuide:
      "Misma posición de la lengua entre los dientes que /θ/, pero esta vez debes hacer vibrar la garganta y las cuerdas vocales, produciendo un zumbido eléctrico en la lengua.",
    secretTrick: "Toca tu cuello: debes sentir una vibración de abeja mientras la lengua roza tus dientes.",
  },
  {
    id: "v_labiodental",
    symbol: "/v/",
    name: "V Labiodental (Very, Voice, Travel)",
    difficulty: "Medium",
    soundType: "Voiced (Con vibración)",
    targetWords: [
      { word: "Very", sentence: "I am very happy today.", phonetic: "ˈver.i" },
      { word: "Voice", sentence: "Your voice is very clear.", phonetic: "vɔɪs" },
      { word: "Travel", sentence: "I love to travel the world.", phonetic: "ˈtræv.əl" },
      { word: "Level", sentence: "Next level unlocked!", phonetic: "ˈlev.əl" },
    ],
    tonguePosition: "labiodental",
    lipShape: "labiodental",
    airflowDirection: "lip_friction",
    spanishGuide:
      "En español la 'B' y la 'V' suenan igual (bilabiales). En inglés, la /v/ es labiodental: los dientes superiores tocan el labio inferior mientras el aire vibra.",
    secretTrick: "Muerde levemente tu labio inferior por dentro y haz vibrar como un motor: 'vvvvv'.",
  },
  {
    id: "r_retroflex",
    symbol: "/r/",
    name: "R Retrofleja Americana (Red, Ready, Right)",
    difficulty: "High",
    soundType: "Voiced (Con vibración)",
    targetWords: [
      { word: "Red", sentence: "The red apple is sweet.", phonetic: "red" },
      { word: "Ready", sentence: "Are you ready to practice?", phonetic: "ˈred.i" },
      { word: "Right", sentence: "You are absolutely right.", phonetic: "raɪt" },
      { word: "World", sentence: "Welcome to the real world.", phonetic: "wɜːrld" },
    ],
    tonguePosition: "retroflex",
    lipShape: "round",
    airflowDirection: "roof_curl",
    spanishGuide:
      "¡La lengua NUNCA toca el paladar ni vibra como en español! La punta de la lengua se curva hacia atrás en el centro de la boca flotando en el aire.",
    secretTrick: "Redondea los labios como si fueras a decir 'W' y curva la lengua hacia tu garganta.",
  },
  {
    id: "ae_short_ash",
    symbol: "/æ/",
    name: "Vocal 'Ash' Abierta (Cat, Apple, Bad, Plan)",
    difficulty: "Medium",
    soundType: "Voiced (Con vibración)",
    targetWords: [
      { word: "Cat", sentence: "The cat is sleeping.", phonetic: "kæt" },
      { word: "Apple", sentence: "I eat an apple daily.", phonetic: "ˈæp.əl" },
      { word: "Plan", sentence: "Let's make a great plan.", phonetic: "plæn" },
      { word: "Understand", sentence: "I understand the concept.", phonetic: "ˌʌn.dɚˈstænd" },
    ],
    tonguePosition: "low_open",
    lipShape: "spread_wide",
    airflowDirection: "forward_teeth",
    spanishGuide:
      "Sonido híbrido entre 'A' y 'E'. Abre la mandíbula ampliamente como para decir 'A', pero estira las comisuras de los labios hacia los lados como sonriendo para 'E'.",
    secretTrick: "Baja la mandíbula al máximo y di 'E' con la boca bien abierta.",
  },
];

// 2. STRESS & PITCH DATA
interface StressWord {
  word: string;
  ipa: string;
  syllables: { text: string; isStressed: boolean; pitch: "high" | "med" | "low" }[];
  translation: string;
  ruleExplanation: string;
}

const STRESS_WORDS: StressWord[] = [
  {
    word: "Photograph",
    ipa: "/ˈfoʊ.tə.ɡræf/",
    syllables: [
      { text: "PHO", isStressed: true, pitch: "high" },
      { text: "to", isStressed: false, pitch: "low" },
      { text: "graph", isStressed: false, pitch: "med" },
    ],
    translation: "Fotografía (Sustantivo)",
    ruleExplanation: "Acento fuerte en la PRIMERA sílaba ('PHO-to-graph'). Las demás sílabas caen en Schwa.",
  },
  {
    word: "Photographer",
    ipa: "/fəˈtɑː.ɡrə.fər/",
    syllables: [
      { text: "pho", isStressed: false, pitch: "low" },
      { text: "TO", isStressed: true, pitch: "high" },
      { text: "gra", isStressed: false, pitch: "low" },
      { text: "pher", isStressed: false, pitch: "low" },
    ],
    translation: "Fotógrafo/a (Profesión)",
    ruleExplanation: "¡El acento salta a la SEGUNDA sílaba! Se pronuncia 'fa-TAH-gra-fer'.",
  },
  {
    word: "Comfortable",
    ipa: "/ˈkʌm.fər.tə.bəl/",
    syllables: [
      { text: "COM", isStressed: true, pitch: "high" },
      { text: "for", isStressed: false, pitch: "low" },
      { text: "ta", isStressed: false, pitch: "low" },
      { text: "ble", isStressed: false, pitch: "low" },
    ],
    translation: "Cómodo/a",
    ruleExplanation: "No digas 'com-for-TA-ble'. Suena en 3 golpes rápidos: 'KUMF-ter-bul'.",
  },
  {
    word: "Interesting",
    ipa: "/ˈɪn.trɪ.stɪŋ/",
    syllables: [
      { text: "IN", isStressed: true, pitch: "high" },
      { text: "tre", isStressed: false, pitch: "low" },
      { text: "sting", isStressed: false, pitch: "low" },
    ],
    translation: "Interesante",
    ruleExplanation: "La primera 'e' no se pronuncia: se dice en 3 sílabas ('IN-tris-ting').",
  },
];

// 3. MINIMAL PAIRS DATA
interface MinimalPair {
  id: string;
  pairName: string;
  focusSound: string;
  wordA: { word: string; ipa: string; meaning: string; trick: string };
  wordB: { word: string; ipa: string; meaning: string; trick: string };
  comparisonTip: string;
}

const MINIMAL_PAIRS: MinimalPair[] = [
  {
    id: "ship_sheep",
    pairName: "Ship vs Sheep (/ɪ/ vs /iː/)",
    focusSound: "Vocal Corta Laxa vs Vocal Larga Tensa",
    wordA: {
      word: "Ship",
      ipa: "/ʃɪp/",
      meaning: "Barco grande",
      trick: "Vocal relajada, rápida y casi como una 'E' corta.",
    },
    wordB: {
      word: "Sheep",
      ipa: "/ʃiːp/",
      meaning: "Oveja",
      trick: "Sonrisa amplia, labios tensos y sonido 'i' alargado.",
    },
    comparisonTip:
      "En 'Ship', la mandíbula está suelta. En 'Sheep', sonríes con tensión muscular en las mejillas.",
  },
  {
    id: "live_leave",
    pairName: "Live vs Leave (/ɪ/ vs /iː/)",
    focusSound: "Vocal Laxa vs Tensa",
    wordA: {
      word: "Live",
      ipa: "/lɪv/",
      meaning: "Vivir / Habitar",
      trick: "Sonido rápido y suave: 'liv'.",
    },
    wordB: {
      word: "Leave",
      ipa: "/liːv/",
      meaning: "Irse / Salir / Dejar",
      trick: "Alarga la 'i' con fuerza: 'liii-v'.",
    },
    comparisonTip:
      "'I live in Caracas' (corto) vs 'I leave at 5 PM' (largo). ¡Confundirlos cambia el significado!",
  },
  {
    id: "beach_bitch",
    pairName: "Beach vs Bitch (/iː/ vs /ɪ/)",
    focusSound: "Evita situaciones incómodas",
    wordA: {
      word: "Beach",
      ipa: "/biːtʃ/",
      meaning: "Playa",
      trick: "Sonrisa amplia y alargada: 'Biiii-ch'.",
    },
    wordB: {
      word: "Bitch",
      ipa: "/bɪtʃ/",
      meaning: "Palabra soez / Perra",
      trick: "Vocal rápida y seca: 'bich'.",
    },
    comparisonTip:
      "Para decir 'Vamos a la playa', asegúrate de alargar la 'ee' ('Let's go to the beeeach').",
  },
  {
    id: "very_berry",
    pairName: "Very vs Berry (/v/ vs /b/)",
    focusSound: "Labiodental vs Bilabial",
    wordA: {
      word: "Very",
      ipa: "/ˈver.i/",
      meaning: "Muy / Mucho",
      trick: "Dientes superiores sobre labio inferior.",
    },
    wordB: {
      word: "Berry",
      ipa: "/ˈber.i/",
      meaning: "Baya / Fruto del bosque",
      trick: "Ambos labios se tocan y explotan ('B').",
    },
    comparisonTip:
      "En 'Very' el aire roza los dientes. En 'Berry' los dos labios se juntan por completo.",
  },
  {
    id: "think_sink",
    pairName: "Think vs Sink (/θ/ vs /s/)",
    focusSound: "Interdental vs Alveolar",
    wordA: {
      word: "Think",
      ipa: "/θɪŋk/",
      meaning: "Pensar",
      trick: "Lengua entre los dientes.",
    },
    wordB: {
      word: "Sink",
      ipa: "/sɪŋk/",
      meaning: "Fregadero / Hundirse",
      trick: "Dientes cerrados con siseo de serpiente.",
    },
    comparisonTip:
      "Si no asomas la lengua en 'Think', estarás diciendo 'Sink' (hundirse).",
  },
];

// 4. LINKING & CONNECTED SPEECH DATA
interface LinkingBridge {
  phrase: string;
  connectedPhonetics: string;
  spanishEquiv: string;
  ruleType: "Consonant-to-Vowel" | "Flap T (Water)" | "Elision / Blending" | "Intrusion (W/Y)";
  roboticText: string;
  nativeText: string;
  exampleSentence: string;
  bridgeSteps: string[];
}

const LINKING_BRIDGES: LinkingBridge[] = [
  {
    phrase: "Pick it up",
    connectedPhonetics: "/pɪ.kɪ.tʌp/",
    spanishEquiv: "Pi - ki - tap",
    ruleType: "Consonant-to-Vowel",
    roboticText: "Pick . it . up",
    nativeText: "Pikitup",
    exampleSentence: "If you drop your phone, please pick it up.",
    bridgeSteps: [
      "La 'k' final de 'Pick' se une a la 'i' de 'it' -> 'pi-ki'.",
      "La 't' de 'it' se une a la 'u' de 'up' -> 'pi-ki-tup'.",
      "¡Suena como una sola palabra fluida en lugar de 3 palabras cortadas!",
    ],
  },
  {
    phrase: "Not at all",
    connectedPhonetics: "/nɑː.tə.tɔːl/",
    spanishEquiv: "Na - ta - tool",
    ruleType: "Consonant-to-Vowel",
    roboticText: "Not . at . all",
    nativeText: "Natatall",
    exampleSentence: "Do you mind if I sit here? — Not at all!",
    bridgeSteps: [
      "La 't' de 'Not' se enlaza con 'at' y se convierte en Flap T suave ('na-da').",
      "La 't' de 'at' se enlaza con 'all' -> 'na-da-toll'.",
    ],
  },
  {
    phrase: "What are you doing?",
    connectedPhonetics: "/wɑː.də.jə ˈduː.ɪŋ/",
    spanishEquiv: "Wha - d'ya - du - ing",
    ruleType: "Flap T (Water)",
    roboticText: "What . are . you . do . ing",
    nativeText: "Whaddya doing?",
    exampleSentence: "Hey, what are you doing tonight?",
    bridgeSteps: [
      "'What are' se funde en 'Whada'.",
      "'you' se reduce al sonido schwa 'ya'.",
      "Resultado: 'Whaddya doing?'",
    ],
  },
  {
    phrase: "Hold on",
    connectedPhonetics: "/hoʊl.dɑːn/",
    spanishEquiv: "Jol - don",
    ruleType: "Consonant-to-Vowel",
    roboticText: "Hold . on",
    nativeText: "Holdon",
    exampleSentence: "Hold on a second, I will check that for you.",
    bridgeSteps: [
      "La 'd' de 'Hold' salta directamente a la vocal 'o' de 'on'.",
      "Suena exactamente como 'Hol-don'.",
    ],
  },
];

export const PhoneticCoachModal: React.FC<PhoneticCoachModalProps> = ({
  isOpen,
  onClose,
  avatarConfig,
  initialTab = "articulation",
}) => {
  const [activeTab, setActiveTab] = useState<"articulation" | "stress" | "minimal_pairs" | "linking">(
    initialTab
  );

  // Articulation Lab State
  const [selectedPhoneme, setSelectedPhoneme] = useState<ArticulatoryPhoneme>(ARTICULATORY_PHONEMES[0]);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [feedbackFeedback, setFeedbackFeedback] = useState<string | null>(null);

  // Stress Visualizer State
  const [selectedStressWord, setSelectedStressWord] = useState<StressWord>(STRESS_WORDS[0]);

  // Minimal Pairs State
  const [selectedPair, setSelectedPair] = useState<MinimalPair>(MINIMAL_PAIRS[0]);
  const [testedPairChoice, setTestedPairChoice] = useState<"A" | "B" | null>(null);

  // Linking State
  const [selectedBridge, setSelectedBridge] = useState<LinkingBridge>(LINKING_BRIDGES[0]);
  const [isPlayingBridge, setIsPlayingBridge] = useState(false);

  if (!isOpen) return null;

  // Speak target word/sentence
  const handlePlayAudio = (text: string, slow = false) => {
    speakText(text, avatarConfig, undefined, undefined, undefined, {
      forceLang: "en-US",
      rateMultiplier: slow ? 0.65 : 1.0,
    });
  };

  // Test User Voice with Web Speech Recognition
  const handleStartSpeechTest = (targetWord: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setPronunciationScore(null);
    setFeedbackFeedback(null);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript || "";
      setIsListening(false);

      const evalResult = evaluatePhrasePronunciation(transcript, targetWord, 75);
      setPronunciationScore(evalResult.overallScore);
      setFeedbackFeedback(evalResult.feedback);

      if (evalResult.overallScore >= 80) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setFeedbackFeedback("No pudimos captar el audio. Por favor intenta de nuevo.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-4xl bg-[#161b22] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              🔬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  Laboratorio Fonético 2.5D
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/30">
                  DUO & ELSA GRADE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guía visual de articulación, entonación, mínimos pares y ritmo nativo con {avatarConfig.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0d1117]/80 px-4 pt-2 gap-2 overflow-x-auto">
          {[
            { id: "articulation", label: "🔍 Zoom Articulatorio (Boca & Lengua)", icon: "👅" },
            { id: "stress", label: "🎚️ Espectro de Entonación", icon: "🎵" },
            { id: "minimal_pairs", label: "⚖️ Mínimos Pares (Ship vs Sheep)", icon: "⚔️" },
            { id: "linking", label: "🤫 Connected Speech (Linking Bridge)", icon: "🌉" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? "bg-slate-800 text-amber-300 border-amber-400 shadow-md"
                  : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: ZOOM ARTICULATORIO 2.5D */}
          {/* ======================================================== */}
          {activeTab === "articulation" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Selector List */}
              <div className="lg:col-span-4 space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Selecciona Fonema Desafiante:
                </label>
                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {ARTICULATORY_PHONEMES.map((ph) => (
                    <button
                      key={ph.id}
                      onClick={() => {
                        setSelectedPhoneme(ph);
                        setPronunciationScore(null);
                        setFeedbackFeedback(null);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                        selectedPhoneme.id === ph.id
                          ? "bg-amber-500/15 border-amber-400 text-amber-300 ring-2 ring-amber-500/20"
                          : "bg-[#0d1117] border-slate-800 text-slate-300 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-extrabold font-mono px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-amber-400">
                          {ph.symbol}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">{ph.name.split("(")[0]}</p>
                          <p className="text-[10px] text-slate-400">{ph.soundType.split("(")[0]}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                          ph.difficulty === "High"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {ph.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: 2.5D Articulatory Anatomical View & Training */}
              <div className="lg:col-span-8 space-y-4">
                {/* 2.5D Anatomical Cross-Section Rig */}
                <div className="p-4 rounded-3xl bg-[#0d1117] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                  {/* SVG Anatomical Mouth Rig */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center bg-slate-900/80 rounded-2xl border border-slate-700/60 p-2">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Throat Cavity */}
                      <path
                        d="M 30 180 C 30 110 50 60 110 50 C 150 45 180 80 180 140"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />

                      {/* Hard Palate & Alveolar Ridge */}
                      <path
                        d="M 110 50 C 135 48 160 55 170 85"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <text x="110" y="42" fill="#94a3b8" fontSize="8" fontWeight="bold">
                        Paladar duro
                      </text>

                      {/* Upper Teeth */}
                      <rect x="165" y="85" width="12" height="18" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                      <text x="155" y="80" fill="#e2e8f0" fontSize="8" fontWeight="bold">
                        Dientes sup.
                      </text>

                      {/* Lower Teeth */}
                      <rect x="155" y="145" width="12" height="18" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />

                      {/* Animated Tongue Rig based on position */}
                      <g className="transition-all duration-500">
                        {selectedPhoneme.tonguePosition === "interdental" && (
                          // Tongue protruding through teeth
                          <path
                            d="M 50 160 Q 110 160 140 135 Q 165 110 182 108 Q 170 125 140 148 Q 90 170 50 160 Z"
                            fill="#f43f5e"
                            stroke="#be123c"
                            strokeWidth="2.5"
                          />
                        )}

                        {selectedPhoneme.tonguePosition === "retroflex" && (
                          // Curled backwards into palatal vault
                          <path
                            d="M 50 160 Q 110 160 135 130 Q 150 90 128 78 Q 140 100 120 140 Q 90 170 50 160 Z"
                            fill="#f43f5e"
                            stroke="#be123c"
                            strokeWidth="2.5"
                          />
                        )}

                        {selectedPhoneme.tonguePosition === "labiodental" && (
                          // Tongue low, lower lip against upper teeth
                          <path
                            d="M 50 160 Q 110 160 130 145 Q 150 145 150 155 Q 110 170 50 160 Z"
                            fill="#f43f5e"
                            stroke="#be123c"
                            strokeWidth="2.5"
                          />
                        )}

                        {selectedPhoneme.tonguePosition === "low_open" && (
                          // Flat and low in mouth
                          <path
                            d="M 50 160 Q 100 165 145 158 Q 155 165 135 172 Q 80 175 50 160 Z"
                            fill="#f43f5e"
                            stroke="#be123c"
                            strokeWidth="2.5"
                          />
                        )}
                      </g>

                      {/* Airflow Wave Vector Animation */}
                      <path
                        d="M 70 130 Q 120 110 175 102"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3.5"
                        strokeDasharray="6,4"
                        className="animate-pulse"
                      />
                      <polygon points="182,102 172,98 172,106" fill="#38bdf8" />
                    </svg>

                    {/* Voicing Vibration Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[10px] flex items-center gap-1 font-bold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedPhoneme.soundType.includes("Voiced")
                            ? "bg-emerald-400 animate-ping"
                            : "bg-sky-400"
                        }`}
                      />
                      <span className="text-slate-300">
                        {selectedPhoneme.soundType.includes("Voiced")
                          ? "Cuerdas Vocales: Vibrando"
                          : "Puro Aire (Sin vibrar)"}
                      </span>
                    </div>
                  </div>

                  {/* Anatomical Explanation & Pedagogical Secret */}
                  <div className="flex-1 space-y-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-amber-400 font-mono">
                        {selectedPhoneme.symbol}
                      </span>
                      <span className="text-xs font-bold text-slate-300">{selectedPhoneme.name}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {selectedPhoneme.spanishGuide}
                    </p>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>Truco de Oro: </strong>
                        {selectedPhoneme.secretTrick}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Practice Words & Mic Testing */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Palabras para Practicar en Voz Alta:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedPhoneme.targetWords.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-[#0d1117] border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-white text-sm">{item.word}</span>
                            <span className="text-xs text-amber-400 font-mono ml-2">
                              /{item.phonetic}/
                            </span>
                          </div>
                          <button
                            onClick={() => handlePlayAudio(item.word, isSlowMo)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 transition"
                            title="Escuchar pronunciación"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-400 italic">"{item.sentence}"</p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <button
                            onClick={() => handleStartSpeechTest(item.word)}
                            disabled={isListening}
                            className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-md"
                          >
                            <Mic className={`w-3.5 h-3.5 ${isListening ? "animate-pulse text-red-300" : ""}`} />
                            <span>{isListening ? "Escuchando..." : "Evaluar Mi Voz"}</span>
                          </button>

                          <button
                            onClick={() => handlePlayAudio(item.sentence, true)}
                            className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            <span>🐢 0.65x Frase</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score & Feedback Card */}
                {feedbackFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      (pronunciationScore || 0) >= 85
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                        : "bg-amber-950/40 border-amber-500/40 text-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Award className="w-5 h-5 text-amber-400 shrink-0" />
                      <p className="text-xs font-medium">{feedbackFeedback}</p>
                    </div>
                    {pronunciationScore && (
                      <span className="text-base font-black px-2.5 py-1 rounded-xl bg-slate-900 border border-current">
                        {pronunciationScore}%
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ESPECTRO DE ENTONACIÓN & STRESS */}
          {/* ======================================================== */}
          {activeTab === "stress" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-white text-sm mb-1 flex items-center gap-2">
                    <span>🎵</span>
                    <span>El Secreto del Ritmo Acentual Inglés (Stress-Timed Rhythm)</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    En inglés, las sílabas no duran lo mismo: la sílaba acentuada es **más alta, más larga y más clara**, mientras que las demás se reducen rápidamente.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {STRESS_WORDS.map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedStressWord(w)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        selectedStressWord.word === w.word
                          ? "bg-amber-500/20 border-amber-400 text-amber-300"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {w.word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spectral Waveform Graphic */}
              <div className="p-6 rounded-3xl bg-[#0d1117] border border-slate-800 flex flex-col items-center justify-center gap-6">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="text-2xl font-black text-white">{selectedStressWord.word}</span>
                    <span className="text-sm font-mono text-amber-400 ml-3">
                      {selectedStressWord.ipa}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePlayAudio(selectedStressWord.word)}
                    className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Escuchar Entonación Nativa</span>
                  </button>
                </div>

                {/* Syllable Stress Visualizer Bars */}
                <div className="flex items-end justify-center gap-4 sm:gap-8 w-full py-6">
                  {selectedStressWord.syllables.map((syl, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      {/* Bar Height representing Pitch / Amplitude */}
                      <motion.div
                        initial={{ height: 20 }}
                        animate={{
                          height: syl.isStressed ? 120 : syl.pitch === "med" ? 60 : 35,
                        }}
                        transition={{ duration: 0.5 }}
                        className={`w-14 sm:w-20 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm shadow-xl transition ${
                          syl.isStressed
                            ? "bg-gradient-to-t from-amber-600 to-amber-400 text-slate-950 ring-4 ring-amber-400/40 shadow-amber-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {syl.isStressed ? "STRESS 🔥" : "Lax"}
                      </motion.div>
                      <span
                        className={`font-black text-sm sm:text-base ${
                          syl.isStressed ? "text-amber-300" : "text-slate-400"
                        }`}
                      >
                        {syl.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className="w-full p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    Regla de Acentuación:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200">
                    {selectedStressWord.ruleExplanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: MÍNIMOS PARES (SHIP VS SHEEP) */}
          {/* ======================================================== */}
          {activeTab === "minimal_pairs" && (
            <div className="space-y-6">
              {/* Pair Selector */}
              <div className="flex flex-wrap gap-2">
                {MINIMAL_PAIRS.map((pair) => (
                  <button
                    key={pair.id}
                    onClick={() => {
                      setSelectedPair(pair);
                      setTestedPairChoice(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      selectedPair.id === pair.id
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-[#0d1117] border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {pair.pairName}
                  </button>
                ))}
              </div>

              {/* Minimal Pair Showdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card A */}
                <div className="p-5 rounded-3xl bg-[#0d1117] border-2 border-blue-500/40 shadow-xl flex flex-col justify-between gap-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Opción A
                    </span>
                    <span className="text-xs font-mono text-slate-400">{selectedPair.wordA.ipa}</span>
                  </div>

                  <div>
                    <h3 className="text-3xl font-black text-white">{selectedPair.wordA.word}</h3>
                    <p className="text-sm font-semibold text-slate-300 mt-1">
                      {selectedPair.wordA.meaning}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    💡 {selectedPair.wordA.trick}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handlePlayAudio(selectedPair.wordA.word)}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Escuchar "A"</span>
                    </button>
                  </div>
                </div>

                {/* Card B */}
                <div className="p-5 rounded-3xl bg-[#0d1117] border-2 border-purple-500/40 shadow-xl flex flex-col justify-between gap-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                      Opción B
                    </span>
                    <span className="text-xs font-mono text-slate-400">{selectedPair.wordB.ipa}</span>
                  </div>

                  <div>
                    <h3 className="text-3xl font-black text-white">{selectedPair.wordB.word}</h3>
                    <p className="text-sm font-semibold text-slate-300 mt-1">
                      {selectedPair.wordB.meaning}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    💡 {selectedPair.wordB.trick}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handlePlayAudio(selectedPair.wordB.word)}
                      className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Escuchar "B"</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comparison Hint */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm text-left flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Diferencia Clave:</span>
                  <p>{selectedPair.comparisonTip}</p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: CONNECTED SPEECH (LINKING BRIDGE) */}
          {/* ======================================================== */}
          {activeTab === "linking" && (
            <div className="space-y-6">
              {/* Bridge Selector */}
              <div className="flex flex-wrap gap-2">
                {LINKING_BRIDGES.map((bridge, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedBridge(bridge)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      selectedBridge.phrase === bridge.phrase
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-[#0d1117] border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {bridge.phrase}
                  </button>
                ))}
              </div>

              {/* Luminous Waveform Bridge Visualizer */}
              <div className="p-6 rounded-3xl bg-[#0d1117] border border-slate-800 flex flex-col items-center justify-center gap-6">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h3 className="text-2xl font-black text-white">{selectedBridge.phrase}</h3>
                    <p className="text-xs font-mono text-amber-400 mt-0.5">
                      Suena: <strong>{selectedBridge.spanishEquiv}</strong> ({selectedBridge.connectedPhonetics})
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                    {selectedBridge.ruleType}
                  </span>
                </div>

                {/* Animated Linking Ribbon Graphic */}
                <div className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-around gap-2 relative overflow-hidden">
                  <div className="text-center">
                    <span className="text-[10px] text-rose-400 font-bold block">Robot Cortado 🤖</span>
                    <span className="text-sm font-mono text-slate-300 line-through opacity-60">
                      {selectedBridge.roboticText}
                    </span>
                  </div>

                  {/* Luminous Waveform Connector */}
                  <div className="flex items-center gap-1 text-amber-400 animate-pulse">
                    <ArrowRight className="w-6 h-6" />
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] text-emerald-400 font-bold block">Nativo Conectado 🌟</span>
                    <span className="text-base font-black text-amber-300 font-mono">
                      "{selectedBridge.nativeText}"
                    </span>
                  </div>
                </div>

                {/* Bridge Steps */}
                <div className="w-full space-y-2 text-left">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    ¿Cómo ocurre la unión?
                  </span>
                  <div className="space-y-1.5">
                    {selectedBridge.bridgeSteps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audio Comparison Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 w-full pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayAudio(selectedBridge.phrase, false)}
                      className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Escuchar Frase Conectada</span>
                    </button>
                    <button
                      onClick={() => handlePlayAudio(selectedBridge.phrase, true)}
                      className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    >
                      <span>🐢 Lento 0.65x</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handlePlayAudio(selectedBridge.exampleSentence)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Escuchar en oración completa →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
