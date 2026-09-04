import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Headphones,
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  Sparkles,
  Gauge,
  Mic,
  Award,
  CheckCircle2,
} from "lucide-react";
import { speakEnglish, stopSpeech } from "../utils/speech";
import { playPopSound, playCoinSound } from "../utils/audioSynth";
import { haptics } from "../utils/haptics";

export interface PodcastEpisode {
  id: string;
  title: string;
  series: string;
  duration: string;
  difficulty: "A2" | "B1" | "B2";
  host: string;
  description: string;
  sentences: { english: string; spanish: string; speaker: string }[];
}

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: "ep-1",
    title: "The Silicon Valley Angel Pitch",
    series: "Venture Capital & Startups",
    duration: "2 min",
    difficulty: "B2",
    host: "Sarah (Tech Investor)",
    description: "Cómo presentar tracción, retención y economía unitaria ante inversores de riesgo.",
    sentences: [
      {
        speaker: "Founder",
        english: "Good morning Sarah. Today, we are raising two million dollars in seed capital.",
        spanish: "Buenos días Sarah. Hoy estamos levantando dos millones de dólares en capital semilla.",
      },
      {
        speaker: "Sarah",
        english: "Welcome! Tell me about your customer acquisition cost and monthly churn.",
        spanish: "¡Bienvenidos! Cuéntame sobre su costo de adquisición de clientes y tasa de cancelación mensual.",
      },
      {
        speaker: "Founder",
        english: "Our CAC is sixty dollars, and our net revenue retention is one hundred and twenty percent.",
        spanish: "Nuestro CAC es de sesenta dólares, y nuestra retención neta de ingresos es del 120%.",
      },
      {
        speaker: "Sarah",
        english: "Impressive numbers. How do you plan to scale your go-to-market strategy?",
        spanish: "Números impresionantes. ¿Cómo planean escalar su estrategia de lanzamiento al mercado?",
      },
      {
        speaker: "Founder",
        english: "We are partnering with enterprise software distributors across North America.",
        spanish: "Nos estamos asociando con distribuidores de software empresarial en toda Norteamérica.",
      },
      {
        speaker: "Sarah",
        english: "That makes a lot of sense. Let's schedule a deep-dive session next Tuesday.",
        spanish: "Eso tiene mucho sentido. Programemos una sesión a fondo el próximo martes.",
      },
    ],
  },
  {
    id: "ep-2",
    title: "Morning Standup & Sprint Planning",
    series: "Agile Software Teams",
    duration: "2 min",
    difficulty: "B1",
    host: "Alex (Scrum Master)",
    description: "Sincronización diaria rápida, reporte de impedimentos y priorización de backlog.",
    sentences: [
      {
        speaker: "Alex",
        english: "Good morning team, let's keep our daily standup brief and focused.",
        spanish: "Buenos días equipo, mantengamos nuestra reunión diaria breve y enfocada.",
      },
      {
        speaker: "Engineer",
        english: "Yesterday I completed the authentication API and updated our unit tests.",
        spanish: "Ayer completé la API de autenticación y actualicé nuestras pruebas unitarias.",
      },
      {
        speaker: "Alex",
        english: "Great work! Any blockers preventing you from deploying to staging?",
        spanish: "¡Gran trabajo! ¿Algún impedimento que te impida desplegar a entorno de pruebas?",
      },
      {
        speaker: "Engineer",
        english: "I am waiting on the cloud credentials from DevOps, but no critical blocker.",
        spanish: "Estoy esperando las credenciales en la nube de DevOps, pero ningún bloqueo crítico.",
      },
      {
        speaker: "Alex",
        english: "Understood. I will ping the DevOps lead right after this call.",
        spanish: "Entendido. Le enviaré un mensaje al líder de DevOps justo después de esta llamada.",
      },
    ],
  },
  {
    id: "ep-3",
    title: "Closing the Deal: Enterprise Negotiation",
    series: "High-Stakes Sales",
    duration: "2 min",
    difficulty: "B2",
    host: "Elena (VP of Procurement)",
    description: "Defensa de términos comerciales, descuentos por volumen y acuerdos ganar-ganar.",
    sentences: [
      {
        speaker: "Account Exec",
        english: "Thank you for joining Elena. Have you had a chance to review our proposed terms?",
        spanish: "Gracias por unirte Elena. ¿Has tenido oportunidad de revisar nuestros términos propuestos?",
      },
      {
        speaker: "Elena",
        english: "We love the product, but your pricing is fifteen percent above our allocated budget.",
        spanish: "Nos encanta el producto, pero su precio está un quince por ciento por encima de nuestro presupuesto asignado.",
      },
      {
        speaker: "Account Exec",
        english: "If you commit to a two-year contract, we can include premium support at no extra cost.",
        spanish: "Si se comprometen a un contrato de dos años, podemos incluir soporte premium sin costo extra.",
      },
      {
        speaker: "Elena",
        english: "That sounds like a fair compromise. Send over the revised master agreement.",
        spanish: "Eso suena como un acuerdo justo. Envía el acuerdo marco revisado.",
      },
    ],
  },
  {
    id: "ep-4",
    title: "International Business Dinner Etiquette",
    series: "Executive Socializing",
    duration: "2 min",
    difficulty: "A2",
    host: "David (Senior Partner)",
    description: "Cómo romper el hielo, brindar cordialmente y conversar sobre proyectos sin ser invasivo.",
    sentences: [
      {
        speaker: "Host",
        english: "Welcome to New York! How was your flight from Madrid?",
        spanish: "¡Bienvenido a Nueva York! ¿Cómo estuvo su vuelo desde Madrid?",
      },
      {
        speaker: "Guest",
        english: "It was very smooth, thank you. I really appreciate your warm hospitality.",
        spanish: "Fue muy tranquilo, gracias. Realmente aprecio su cálida hospitalidad.",
      },
      {
        speaker: "Host",
        english: "Shall we start with some sparkling water and local appetizers?",
        spanish: "¿Comenzamos con un poco de agua con gas y aperitivos locales?",
      },
      {
        speaker: "Guest",
        english: "That sounds wonderful. Let's make a toast to our new international partnership.",
        spanish: "Eso suena maravilloso. Hagamos un brindis por nuestra nueva alianza internacional.",
      },
    ],
  },
];

interface AudioImmersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXp?: (xp: number) => void;
}

export const AudioImmersionModal: React.FC<AudioImmersionModalProps> = ({
  isOpen,
  onClose,
  onRewardXp,
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode>(PODCAST_EPISODES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [pauseForShadowing, setPauseForShadowing] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<"none" | "cafe" | "lofi">("none");
  const [completedEpisodes, setCompletedEpisodes] = useState<string[]>([]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopSpeech();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const currentSentence = selectedEpisode.sentences[currentSentenceIndex];

  const handlePlaySentence = (index: number) => {
    if (index >= selectedEpisode.sentences.length) {
      setIsPlaying(false);
      setCurrentSentenceIndex(0);
      playCoinSound();
      haptics.success();
      if (!completedEpisodes.includes(selectedEpisode.id)) {
        setCompletedEpisodes((prev) => [...prev, selectedEpisode.id]);
        onRewardXp?.(30);
      }
      return;
    }

    setCurrentSentenceIndex(index);
    const target = selectedEpisode.sentences[index];

    stopSpeech();
    speakEnglish(target.english, {
      rate: playbackSpeed,
      onEnd: () => {
        if (isPlaying) {
          const pauseDelay = pauseForShadowing ? 2500 : 900;
          timeoutRef.current = setTimeout(() => {
            handlePlaySentence(index + 1);
          }, pauseDelay);
        }
      },
    });
  };

  const togglePlayPause = () => {
    playPopSound();
    haptics.medium();

    if (isPlaying) {
      setIsPlaying(false);
      stopSpeech();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      setIsPlaying(true);
      handlePlaySentence(currentSentenceIndex);
    }
  };

  const handleNextSentence = () => {
    playPopSound();
    if (currentSentenceIndex < selectedEpisode.sentences.length - 1) {
      const nextIdx = currentSentenceIndex + 1;
      setCurrentSentenceIndex(nextIdx);
      if (isPlaying) handlePlaySentence(nextIdx);
    }
  };

  const handlePrevSentence = () => {
    playPopSound();
    if (currentSentenceIndex > 0) {
      const prevIdx = currentSentenceIndex - 1;
      setCurrentSentenceIndex(prevIdx);
      if (isPlaying) handlePlaySentence(prevIdx);
    }
  };

  const handleSelectEpisode = (ep: PodcastEpisode) => {
    playPopSound();
    haptics.selection();
    stopSpeech();
    setIsPlaying(false);
    setSelectedEpisode(ep);
    setCurrentSentenceIndex(0);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Audio Inmersión & Podcast Ejecutivo
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Práctica de escucha en segundo plano para trayectos y tiempos muertos
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Episode Selector Pills */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/60 overflow-x-auto no-scrollbar flex items-center gap-2.5 shrink-0">
            {PODCAST_EPISODES.map((ep) => {
              const isSelected = ep.id === selectedEpisode.id;
              const isDone = completedEpisodes.includes(ep.id);

              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEpisode(ep)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/20"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/60"
                  }`}
                >
                  <span>{ep.title}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Player Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Active Episode Banner & Audio Visualizer Ring */}
            <div className="p-5 rounded-3xl bg-linear-to-b from-slate-950 to-slate-900 border border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
              {/* Subtle animated sound wave bars */}
              <div className="flex items-center justify-center gap-1 mb-4 h-12">
                {[16, 32, 48, 24, 40, 20, 36, 12, 44, 28].map((h, idx) => (
                  <motion.div
                    key={idx}
                    animate={
                      isPlaying
                        ? { height: [8, h, 8] }
                        : { height: 8 }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 0.8 + (idx % 3) * 0.2,
                      ease: "easeInOut",
                    }}
                    className={`w-1.5 rounded-full ${
                      isPlaying ? "bg-amber-400" : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider mb-1.5 border border-amber-500/30">
                {selectedEpisode.series} • CEFR {selectedEpisode.difficulty}
              </span>
              <h4 className="text-lg font-black text-white mb-1">
                {selectedEpisode.title}
              </h4>
              <p className="text-xs text-slate-400 max-w-md">
                {selectedEpisode.description}
              </p>
            </div>

            {/* Synchronized Transcript Sentence Card */}
            <div className="p-5 rounded-3xl bg-slate-950/90 border-2 border-slate-800/80 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                  Locutor: {currentSentence?.speaker || "Speaker"}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentSentenceIndex + 1} / {selectedEpisode.sentences.length}
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-base sm:text-lg font-extrabold text-white leading-snug">
                  "{currentSentence?.english}"
                </p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium italic">
                  {currentSentence?.spanish}
                </p>
              </div>
            </div>

            {/* Smart Shadowing & Speed Controls */}
            <div className="grid grid-cols-2 gap-3">
              {/* Shadowing toggle */}
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setPauseForShadowing((p) => !p);
                }}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                  pauseForShadowing
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-400"
                }`}
              >
                <div>
                  <span className="text-xs font-black block">Modo Repetición (Shadowing)</span>
                  <span className="text-[10px] text-slate-400 block">Pausa para repetir en voz alta</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border ${
                    pauseForShadowing ? "bg-amber-400 border-amber-300" : "border-slate-600"
                  }`}
                />
              </button>

              {/* Speed selector */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-300 block">Velocidad</span>
                  <span className="text-[10px] text-slate-400 block">Ritmo de habla nativa</span>
                </div>
                <div className="flex items-center gap-1">
                  {[0.8, 1.0, 1.2].map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setPlaybackSpeed(sp);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        playbackSpeed === sp
                          ? "bg-amber-400 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {sp}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Player Controller Toolbar */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-4 shrink-0">
            <button
              type="button"
              onClick={handlePrevSentence}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Frase anterior"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-slate-950" />
                  <span>Pausar Escucha</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Reproducir Episodio (+30 XP)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNextSentence}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Siguiente frase"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
