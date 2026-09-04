import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Copy,
  Check,
} from "lucide-react";
import {
  STAR_QUESTIONS_DATA,
  StarInterviewQuestion,
} from "../data/starInterviewData";
import {
  evaluateStarAnswer,
  StarEvaluationResult,
} from "../utils/starEvaluator";
import { speakEnglish, stopSpeech, voiceRecognizer } from "../utils/speech";
import { playPopSound, playCoinSound, playSuccessFanfare } from "../utils/audioSynth";

interface StarInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScoreEarned?: (score: number, earnedGems: number) => void;
  onRewardXp?: (xp: number) => void;
}

export const StarInterviewModal: React.FC<StarInterviewModalProps> = ({
  isOpen,
  onClose,
  onScoreEarned,
  onRewardXp,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<StarInterviewQuestion>(
    STAR_QUESTIONS_DATA[0]
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<StarEvaluationResult | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [copiedModel, setCopiedModel] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, boolean>>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      stopSpeech();
      voiceRecognizer.stop();
    };
  }, []);

  if (!isOpen) return null;

  const handlePlayQuestion = () => {
    stopSpeech();
    playPopSound();
    speakEnglish(selectedQuestion.question, {
      lang: "en-US",
      gender: "male",
      rate: 0.95,
    });
  };

  const handleToggleMic = () => {
    if (isRecording) {
      voiceRecognizer.stop();
      setIsRecording(false);
      playPopSound();
    } else {
      stopSpeech();
      playPopSound();
      setIsRecording(true);
      voiceRecognizer.start(
        (transcript, isFinal) => {
          if (transcript) {
            setUserAnswer((prev) => {
              const base = prev.trim();
              return base ? `${base} ${transcript}` : transcript;
            });
          }
          if (isFinal) {
            setIsRecording(false);
          }
        },
        (error) => {
          console.warn("Speech recognition error:", error);
          setIsRecording(false);
        }
      );
    }
  };

  const handleEvaluate = () => {
    if (!userAnswer.trim()) return;
    stopSpeech();
    if (isRecording) {
      voiceRecognizer.stop();
      setIsRecording(false);
    }
    setIsEvaluating(true);
    playPopSound();

    setTimeout(() => {
      const result = evaluateStarAnswer(
        userAnswer,
        selectedQuestion.recommendedKeywords
      );
      setEvaluation(result);
      setIsEvaluating(false);

      if (result.passed) {
        if (!completedQuestions[selectedQuestion.id]) {
          playSuccessFanfare();
          setCompletedQuestions((prev) => ({ ...prev, [selectedQuestion.id]: true }));
          onRewardXp?.(40);
          onScoreEarned?.(result.overallScore, 10);
        } else {
          playCoinSound();
        }
      } else {
        playPopSound();
      }
    }, 400);
  };

  const handleSelectQuestion = (q: StarInterviewQuestion) => {
    stopSpeech();
    if (isRecording) {
      voiceRecognizer.stop();
      setIsRecording(false);
    }
    setSelectedQuestion(q);
    setUserAnswer("");
    setEvaluation(null);
    setShowModelAnswer(false);
    playPopSound();
  };

  const handleCopyModelAnswer = () => {
    navigator.clipboard.writeText(selectedQuestion.modelAnswer.fullText);
    setCopiedModel(true);
    playCoinSound();
    setTimeout(() => setCopiedModel(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors">
        {/* Header Corporativo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  Entrenador de Entrevistas: Método STAR
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-300 text-slate-900 uppercase">
                  FAANG Ready
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">
                Domina las preguntas conductuales de Recursos Humanos con impacto cuantificable
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              if (isRecording) voiceRecognizer.stop();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Preguntas */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {STAR_QUESTIONS_DATA.map((q, idx) => {
            const isSelected = q.id === selectedQuestion.id;
            const isDone = completedQuestions[q.id];
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestion(q)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>Pregunta {idx + 1}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />}
              </button>
            );
          })}
        </div>

        {/* Cuerpo Principal */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Tarjeta de Pregunta */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                {selectedQuestion.categorySpanish} • {selectedQuestion.interviewerRole}
              </span>
              <button
                type="button"
                onClick={handlePlayQuestion}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                title="Escuchar la pregunta en voz alta"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar</span>
              </button>
            </div>

            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
              "{selectedQuestion.question}"
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 italic">
              Traducción: {selectedQuestion.spanishTranslation}
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">💡 Estrategia:</span>
              <span>{selectedQuestion.contextHint}</span>
            </div>
          </div>

          {/* Área de Respuesta del Usuario */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="user-star-answer"
                className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
              >
                <span>Tu Respuesta (en inglés):</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {userAnswer.trim().split(/\s+/).filter(Boolean).length} palabras
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isRecording
                      ? "bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/20"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                  title={isRecording ? "Detener dictado" : "Hablar con el micrófono"}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{isRecording ? "Grabando..." : "Dictar por voz"}</span>
                </button>
              </div>
            </div>

            <textarea
              id="user-star-answer"
              ref={textareaRef}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Structure your story: 1. Situation (At my previous company...), 2. Task (We needed to...), 3. Action (I spearheaded/scheduled...), 4. Result (As a result, we boosted by 20%)..."
              rows={4}
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
            />

            {/* Botones de Evaluación y Modelo */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowModelAnswer((prev) => !prev)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{showModelAnswer ? "Ocultar Respuesta Modelo" : "Ver Ejemplo Modelo STAR"}</span>
              </button>

              <button
                type="button"
                onClick={handleEvaluate}
                disabled={!userAnswer.trim() || isEvaluating}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEvaluating ? "Analizando STAR..." : "Evaluar Mi Respuesta"}</span>
              </button>
            </div>
          </div>

          {/* Respuesta Modelo Desplegable */}
          {showModelAnswer && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-emerald-200 dark:border-emerald-900/60 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                  Estructura Modelo Ideal (Desglose STAR)
                </span>
                <button
                  type="button"
                  onClick={handleCopyModelAnswer}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition cursor-pointer"
                >
                  {copiedModel ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedModel ? "Copiado" : "Copiar texto"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-200">
                  <span className="font-extrabold text-blue-700 dark:text-blue-300 block mb-0.5">
                    [S] Situation:
                  </span>
                  {selectedQuestion.modelAnswer.situation}
                </div>
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-950 dark:text-purple-200">
                  <span className="font-extrabold text-purple-700 dark:text-purple-300 block mb-0.5">
                    [T] Task:
                  </span>
                  {selectedQuestion.modelAnswer.task}
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                    [A] Action:
                  </span>
                  {selectedQuestion.modelAnswer.action}
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-200">
                  <span className="font-extrabold text-amber-700 dark:text-amber-300 block mb-0.5">
                    [R] Result:
                  </span>
                  {selectedQuestion.modelAnswer.result}
                </div>
              </div>
            </div>
          )}

          {/* Reporte de Evaluación STAR */}
          {evaluation && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-4 shadow-sm animate-fadeIn">
              {/* Encabezado del Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      Puntaje STAR: {evaluation.overallScore}/100
                    </span>
                    {evaluation.passed ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
                        Aprobado (+40 XP)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 uppercase">
                        Requiere Ajustes
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Veredicto: {evaluation.toneVerdict}
                  </p>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span>Verbos de acción: {evaluation.actionVerbsFound.length}</span>
                  <span>•</span>
                  <span>Métricas: {evaluation.metricsFound.length}</span>
                </div>
              </div>

              {/* Los 4 Pilares STAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Situation */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      [S] Situation ({evaluation.components.situation.points}/25)
                    </span>
                    {evaluation.components.situation.found ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {evaluation.components.situation.feedback}
                  </p>
                </div>

                {/* Task */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      [T] Task ({evaluation.components.task.points}/25)
                    </span>
                    {evaluation.components.task.found ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {evaluation.components.task.feedback}
                  </p>
                </div>

                {/* Action */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      [A] Action ({evaluation.components.action.points}/25)
                    </span>
                    {evaluation.components.action.found ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {evaluation.components.action.feedback}
                  </p>
                </div>

                {/* Result */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      [R] Result ({evaluation.components.result.points}/25)
                    </span>
                    {evaluation.components.result.found ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {evaluation.components.result.feedback}
                  </p>
                </div>
              </div>

              {/* Consejos Pedagógicos Adicionales */}
              {evaluation.pedagogicalAdvice.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <span className="font-bold block">Recomendaciones para tu próxima entrevista:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    {evaluation.pedagogicalAdvice.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Preguntas superadas: {Object.keys(completedQuestions).length} de {STAR_QUESTIONS_DATA.length}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              if (isRecording) voiceRecognizer.stop();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
