import React, { useState, useEffect } from "react";
import { X, Lock, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { playPopSound, playTryAgainSoft } from "../utils/audioSynth";

export interface ParentGateProps {
  isOpen: boolean;
  onUnlock?: () => void;
  onSuccess?: () => void;
  onClose: () => void;
}

interface MathChallenge {
  num1: number;
  num2: number;
  operation: "x" | "+";
  answer: number;
}

function generateMathChallenge(): MathChallenge {
  const operations: ("x" | "+")[] = ["x", "+"];
  const op = operations[Math.floor(Math.random() * operations.length)];

  if (op === "x") {
    const num1 = Math.floor(Math.random() * 8) + 3; // 3 to 10
    const num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    return { num1, num2, operation: "x", answer: num1 * num2 };
  } else {
    const num1 = Math.floor(Math.random() * 40) + 15;
    const num2 = Math.floor(Math.random() * 40) + 15;
    return { num1, num2, operation: "+", answer: num1 + num2 };
  }
}

export const ParentGate: React.FC<ParentGateProps> = ({
  isOpen,
  onUnlock,
  onSuccess,
  onClose,
}) => {
  const [challenge, setChallenge] = useState<MathChallenge>(generateMathChallenge);
  const [userInput, setUserInput] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setChallenge(generateMathChallenge());
      setUserInput("");
      setHasError(false);
    }
  }, [isOpen]);

  const handleRefreshChallenge = () => {
    playPopSound();
    setChallenge(generateMathChallenge());
    setUserInput("");
    setHasError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(userInput.trim(), 10);
    if (parsed === challenge.answer) {
      playPopSound();
      if (onUnlock) {
        onUnlock();
      } else if (onSuccess) {
        onSuccess();
      }
    } else {
      playTryAgainSoft();
      setHasError(true);
      setUserInput("");
      setChallenge(generateMathChallenge());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col items-center gap-5">
        
        {/* BOTÓN SALIR */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ÍCONO DE SEGURIDAD */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mt-2">
          <ShieldCheck className="w-7 h-7 stroke-[2]" />
        </div>

        {/* TÍTULO Y EXPLICACIÓN */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-white tracking-tight">Control Parental</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Solo para adultos. Resuelve la siguiente operación para ingresar al panel de métricas:
          </p>
        </div>

        {/* PREGUNTA MATEMÁTICA */}
        <div className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-xl font-mono font-bold text-indigo-300 tracking-wider">
            ¿Cuánto es {challenge.num1} {challenge.operation === "x" ? "×" : "+"} {challenge.num2}?
          </span>
          <button
            type="button"
            onClick={handleRefreshChallenge}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Cambiar operación"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="number"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              setHasError(false);
            }}
            placeholder="Escribe el resultado..."
            autoFocus
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />

          {hasError && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Respuesta incorrecta. Intenta con la nueva operación.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!userInput.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 active:scale-95 transition cursor-pointer"
          >
            Verificar y Entrar
          </button>
        </form>

      </div>
    </div>
  );
};
export default ParentGate;
