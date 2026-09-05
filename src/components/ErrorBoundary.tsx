import React, { Component, ErrorInfo, ReactNode } from "react";
import { RotateCcw, AlertTriangle, Sparkles } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[VT English IA] Error capturado por ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Intento de recuperación suave sin borrar el progreso persistido
    try {
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-b-8 border-slate-800 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-3xl">
              🐦
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">¡No te preocupes! Tu progreso está a salvo</h2>
              <p className="text-xs text-slate-400">
                Ocurrió un pequeño contratiempo gráfico o de conexión, pero tus rachas, gemas y lecciones están guardadas en tu dispositivo.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono text-left max-h-24 overflow-y-auto">
                {this.state.error.message || "Error desconocido en tiempo de ejecución"}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm border-2 border-b-4 border-amber-700 active:border-b-2 active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Continuar Aprendiendo</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
