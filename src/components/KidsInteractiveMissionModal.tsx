import React, { useState, useEffect, useRef } from "react";
import { X, Mic, Volume2, Sparkles, ChevronRight, Coins, Star, Trophy } from "lucide-react";
import { KIDS_MISSIONS } from "../data/kidsMissionsData";
import { validateKidsPronunciation } from "../utils/pronunciationMatcher";
import { useKidsProgress } from "../hooks/useKidsProgress";
import {
  playPopSound,
  playCoinSound,
  playJumpSound,
  playSuccessFanfare,
  playTryAgainSoft,
} from "../utils/audioSynth";
import { fireSuccessConfetti } from "../utils/confettiHelper";
import { haptics } from "../utils/haptics";
import { KidsVictoryModal } from "./KidsVictoryModal";

export interface KidsInteractiveMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardEarned?: (xp: number) => void;
}

export const KidsInteractiveMissionModal: React.FC<KidsInteractiveMissionModalProps> = ({
  isOpen,
  onClose,
  onRewardEarned,
}) => {
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [successScore, setSuccessScore] = useState<number | null>(null);
  const [useTouchFallback, setUseTouchFallback] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  const { addRewards } = useKidsProgress();
  const mission = KIDS_MISSIONS[currentMissionIndex] || KIDS_MISSIONS[0];
  const recognitionRef = useRef<any>(null);

  // Reproducir voz TTS infantil
  const speakDialogue = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1.25;
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Samantha") ||
            v.name.includes("Victoria") ||
            v.name.includes("Google") ||
            v.name.includes("Natural"))
      ) || voices.find((v) => v.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isOpen) {
      setSpokenText("");
      setSuccessScore(null);
      setIsFinished(false);
      setRewardClaimed(false);
      setIsVictoryModalOpen(false);

      const timer = setTimeout(() => {
        speakDialogue(mission.initialDialogue);
      }, 350);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setUseTouchFallback(true);
      } else {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const result = event.results[0][0].transcript;
          setSpokenText(result);
          handleAnswerSubmitted(result);
        };
        recognition.onerror = (err: any) => {
          console.warn("Speech error:", err);
          setIsListening(false);
          setUseTouchFallback(true);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }

      return () => {
        clearTimeout(timer);
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [isOpen, currentMissionIndex]);

  const handleAnswerSubmitted = (answer: string) => {
    const evalResult = validateKidsPronunciation(answer, mission.targetWord);
    setSuccessScore(evalResult.overallScore);

    if (evalResult.isApproved) {
      // Otorgar recompensas en localStorage
      playJumpSound();
      haptics.success();
      if (!rewardClaimed) {
        addRewards(10, 3, mission.id);
        setRewardClaimed(true);
      }

      if (onRewardEarned) {
        onRewardEarned(25);
      }

      // Abrir modal de victoria tras breve pausa
      setTimeout(() => {
        setIsVictoryModalOpen(true);
      }, 700);
    } else {
      playTryAgainSoft();
      haptics.error();
      speakDialogue(`Good try! Let's say ${mission.targetWord}!`);
    }
  };

  const handleMicClick = () => {
    playPopSound();
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch {
        setUseTouchFallback(true);
      }
    }
  };

  const handleNextMission = () => {
    playCoinSound();
    setIsVictoryModalOpen(false);
    if (currentMissionIndex < KIDS_MISSIONS.length - 1) {
      setCurrentMissionIndex((prev) => prev + 1);
      setSuccessScore(null);
      setSpokenText("");
      setRewardClaimed(false);
    } else {
      setIsFinished(true);
      playSuccessFanfare();
      fireSuccessConfetti();
    }
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-amber-50 rounded-3xl border-4 border-amber-300 shadow-2xl p-6 flex flex-col items-center gap-5 relative text-slate-900">
        
        {/* Botón Salir */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-amber-200 text-amber-900 hover:bg-amber-300 transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Personaje Infantil */}
        <div className="flex flex-col items-center gap-2 text-center mt-1">
          <div className="w-24 h-24 rounded-3xl bg-amber-200 border-4 border-amber-400 flex items-center justify-center overflow-hidden shadow-md">
            {mission.characterAvatar.startsWith("/") || mission.characterAvatar.startsWith("http") ? (
              <img
                src={mission.characterAvatar}
                alt={mission.characterName}
                className="w-full h-full object-contain p-2 hover:scale-110 transition-transform"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-5xl">{mission.characterAvatar}</span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-950">{mission.characterName}</h2>
            <span className="text-xs font-extrabold text-amber-700 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
              Misión {currentMissionIndex + 1} de {KIDS_MISSIONS.length}
            </span>
          </div>
        </div>

        {/* Diálogo */}
        <div className="w-full p-4 rounded-2xl bg-white border-2 border-amber-200 text-slate-800 text-center font-bold text-base sm:text-lg shadow-sm flex items-center justify-between gap-2">
          <p className="flex-1 text-amber-950 font-black">{mission.initialDialogue}</p>
          <button
            type="button"
            onClick={() => speakDialogue(mission.initialDialogue)}
            className={`p-2.5 rounded-xl text-amber-900 transition cursor-pointer ${
              isSpeaking ? "bg-amber-300 scale-105" : "bg-amber-100 hover:bg-amber-200"
            }`}
          >
            <Volume2 className={`w-5 h-5 ${isSpeaking ? "animate-pulse" : ""}`} />
          </button>
        </div>

        {/* Feedback de Acierto + Recompensas Ganadas */}
        {successScore !== null && (
          <div className="flex flex-col items-center gap-2 w-full animate-in zoom-in-95">
            <div
              className={`px-4 py-2 rounded-full font-black text-sm flex items-center gap-2 ${
                successScore >= 70
                  ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-400"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {successScore >= 70
                  ? `¡Genial! Acierto: ${successScore}%`
                  : "¡Buen intento! Prueba diciendo: " + mission.targetWord}
              </span>
            </div>

            {/* Badges de Recompensa Ganada */}
            {successScore >= 70 && (
              <div className="flex items-center gap-3 bg-amber-200/70 border border-amber-400/60 px-4 py-1.5 rounded-2xl animate-bounce">
                <div className="flex items-center gap-1 font-black text-amber-900 text-xs">
                  <Coins className="w-4 h-4 text-amber-600 fill-amber-400" />
                  <span>+10 Monedas</span>
                </div>
                <span className="text-amber-400 font-bold">•</span>
                <div className="flex items-center gap-1 font-black text-amber-900 text-xs">
                  <Star className="w-4 h-4 text-amber-600 fill-yellow-400" />
                  <span>+3 Estrellas</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controles: Micrófono o Fallback Táctil */}
        {!useTouchFallback ? (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleMicClick}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse ring-8 ring-rose-300 scale-110"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105"
              }`}
            >
              <Mic className="w-10 h-10" />
            </button>
            <p className="text-xs font-black text-amber-900">
              {isListening ? "¡Te escucho! Habla ahora..." : "Toca el micrófono y dilo en voz alta"}
            </p>
            <button
              type="button"
              onClick={() => setUseTouchFallback(true)}
              className="text-xs text-indigo-700 underline font-bold mt-1 cursor-pointer"
            >
              ¿Prefieres jugar tocando la pantalla?
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-2 animate-in fade-in">
            <p className="text-xs font-black text-amber-900 mb-1">¡Toca la opción correcta!</p>
            <div className="w-full grid grid-cols-3 gap-3">
              {mission.optionsFallback.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleAnswerSubmitted(card.word)}
                  className="p-4 rounded-2xl bg-white hover:bg-amber-100 border-2 border-amber-300 flex flex-col items-center gap-1 shadow-md active:scale-95 transition cursor-pointer"
                >
                  <span className="text-4xl">{card.emoji}</span>
                  <span className="text-xs font-black text-slate-800">{card.word}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{card.labelEs}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón Siguiente Misión */}
        {successScore !== null && successScore >= 70 && (
          <button
            type="button"
            onClick={handleNextMission}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <span>{currentMissionIndex < KIDS_MISSIONS.length - 1 ? "Siguiente Misión" : "¡Misiones Completadas!"}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

      </div>

      {/* MODAL DE VICTORIA AVANZADO ("Juiciness") */}
      <KidsVictoryModal
        isOpen={isVictoryModalOpen}
        score={successScore || 100}
        earnedCoins={10}
        earnedStars={3}
        characterAvatar={mission.characterAvatar}
        characterName={mission.characterName}
        missionTitle={mission.title}
        hasNextMission={currentMissionIndex < KIDS_MISSIONS.length - 1}
        onNextMission={handleNextMission}
        onClose={() => {
          setIsVictoryModalOpen(false);
          onClose();
        }}
      />
    </div>
  );
};
export default KidsInteractiveMissionModal;
