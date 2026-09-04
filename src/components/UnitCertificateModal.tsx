import React, { useRef } from "react";
import { Award, CheckCircle2, Download, Share2, Sparkles, X, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { playSuccessFanfare, playCoinSound } from "../utils/audioSynth";
import { haptics } from "../utils/haptics";

export interface UnitCertificateData {
  studentName: string;
  unitTitle: string;
  cefrLevel: string;
  completedDate: string;
  accuracy: number;
  xpEarned: number;
}

export interface UnitCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UnitCertificateData;
}

export const UnitCertificateModal: React.FC<UnitCertificateModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleShareOrDownload = () => {
    playCoinSound();
    haptics.medium();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
    });

    // Native sharing or print fallback
    if (navigator.share) {
      navigator
        .share({
          title: `Certificado de Inglés - Nivel ${data.cefrLevel}`,
          text: `¡Acabo de completar la ${data.unitTitle} en LinguaPro con un ${data.accuracy}% de precisión!`,
          url: window.location.href,
        })
        .catch(() => {
          window.print();
        });
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col">
        
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-100 animate-spin" />
            <span className="text-xs font-black tracking-widest uppercase">
              Certificado Oficial de Logro
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Frame Content */}
        <div
          ref={certificateRef}
          className="p-6 sm:p-8 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 text-center flex flex-col items-center relative"
        >
          {/* Ornamental Inner Border */}
          <div className="w-full border-2 border-dashed border-amber-300 rounded-2xl p-6 relative">
            
            {/* Top Badge Seal */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 mb-3">
              <Award className="w-8 h-8" />
            </div>

            <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700">
              LinguaPro Business English Academy
            </p>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
              Certificado de Competencia
            </h3>

            <p className="text-xs text-slate-500 mt-1">Este documento certifica formalmente que</p>

            {/* Student Name */}
            <h4 className="text-lg sm:text-xl font-extrabold text-indigo-900 mt-2 border-b-2 border-amber-300 pb-1 inline-block px-4">
              {data.studentName}
            </h4>

            <p className="text-xs text-slate-600 mt-3 max-w-sm mx-auto leading-relaxed">
              Ha superado satisfactoriamente los desafíos conversacionales y el examen de unidad
              correspondiente a:
            </p>

            {/* Unit Title & CEFR Pill */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-950 font-bold text-xs">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold">
                {data.cefrLevel}
              </span>
              <span>{data.unitTitle}</span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-amber-200/80">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Precisión</span>
                <span className="text-sm font-black text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {data.accuracy}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">XP Obtenido</span>
                <span className="text-sm font-black text-amber-600 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  +{data.xpEarned}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fecha</span>
                <span className="text-xs font-extrabold text-slate-700">{data.completedDate}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between px-2 text-[10px] text-slate-400 italic">
              <span>Firma: Sarah (Tutor AI Pro)</span>
              <span>ID: {Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleShareOrDownload}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Guardar / Compartir</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Continuar mi Aprendizaje</span>
          </button>
        </div>
      </div>
    </div>
  );
};
