import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  CheckCircle2,
  Trash2,
  Plane,
  HardDrive,
  Sparkles,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock,
  FileCheck,
} from "lucide-react";
import {
  OFFLINE_PACKS_CATALOG,
  OfflinePack,
  getStoredOfflinePacks,
  downloadOfflinePack,
  removeOfflinePack,
  getTotalOfflineStorageMB,
  isAirplaneModeActive,
  setAirplaneMode,
  StoredPackStatus,
} from "../utils/offlineCommuteManager";
import { playPopSound, playCoinSound } from "../utils/audioSynth";

interface OfflineCommuteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAirplaneModeChange?: (active: boolean) => void;
}

export const OfflineCommuteModal: React.FC<OfflineCommuteModalProps> = ({
  isOpen,
  onClose,
  onAirplaneModeChange,
}) => {
  const [packsStatus, setPacksStatus] = useState<Record<string, StoredPackStatus>>({});
  const [downloadingPackId, setDownloadingPackId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isAirplaneMode, setIsAirplaneMode] = useState<boolean>(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPacksStatus(getStoredOfflinePacks());
      setIsAirplaneMode(isAirplaneModeActive());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadPack = async (packId: string) => {
    setDownloadingPackId(packId);
    setDownloadProgress(0);
    playPopSound();

    try {
      await downloadOfflinePack(packId, (p) => setDownloadProgress(p));
      setPacksStatus(getStoredOfflinePacks());
      playCoinSound();
    } catch (err) {
      console.warn("Failed to download pack:", err);
    } finally {
      setDownloadingPackId(null);
    }
  };

  const handleRemovePack = async (packId: string) => {
    playPopSound();
    await removeOfflinePack(packId);
    setPacksStatus(getStoredOfflinePacks());
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    playPopSound();

    for (const pack of OFFLINE_PACKS_CATALOG) {
      if (!packsStatus[pack.id]?.downloaded) {
        setDownloadingPackId(pack.id);
        setDownloadProgress(0);
        await downloadOfflinePack(pack.id, (p) => setDownloadProgress(p));
        setPacksStatus(getStoredOfflinePacks());
      }
    }

    setDownloadingPackId(null);
    setIsDownloadingAll(false);
    playCoinSound();
  };

  const handleToggleAirplaneMode = () => {
    const next = !isAirplaneMode;
    setIsAirplaneMode(next);
    setAirplaneMode(next);
    playPopSound();
    onAirplaneModeChange?.(next);
  };

  const totalUsedMB = getTotalOfflineStorageMB();
  const downloadedCount = (Object.values(packsStatus) as StoredPackStatus[]).filter(
    (p) => p?.downloaded
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors">
        {/* Header con gradiente */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xl shadow-inner">
              <Plane className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  Paquetes Offline para Metro / Avión
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white uppercase">
                  Zero Data
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Descarga lecciones y audio en la memoria local para estudiar sin internet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Modo Avión y Almacenamiento */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
          {/* Fila de switch Modo Avión Simulado */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isAirplaneMode
                    ? "bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                }`}
              >
                {isAirplaneMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Modo Avión / Desconectado</span>
                  {isAirplaneMode && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-amber-500 text-white font-black">
                      ACTIVO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Simula la experiencia de vuelo para verificar que la app funcione 100% sin internet
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAirplaneMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                isAirplaneMode
                  ? "bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-400 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200"
              }`}
            >
              {isAirplaneMode ? "Desactivar" : "Activar"}
            </button>
          </div>

          {/* Resumen de Almacenamiento y Botón Descargar Todo */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <HardDrive className="w-4 h-4 text-indigo-500" />
              <span>
                Almacenamiento ocupado: <strong>{totalUsedMB.toFixed(1)} MB</strong> ({downloadedCount} de {OFFLINE_PACKS_CATALOG.length} paquetes)
              </span>
            </div>

            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={isDownloadingAll || downloadedCount === OFFLINE_PACKS_CATALOG.length}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingAll ? "Descargando..." : "Descargar Todo"}</span>
            </button>
          </div>
        </div>

        {/* Lista de Paquetes */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {OFFLINE_PACKS_CATALOG.map((pack) => {
            const status = packsStatus[pack.id];
            const isDownloaded = status?.downloaded;
            const isDownloading = downloadingPackId === pack.id;

            return (
              <div
                key={pack.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{pack.icon}</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                          {pack.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold">
                          {pack.sizeMB} MB
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {pack.subtitle}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                        {pack.description}
                      </p>
                    </div>
                  </div>

                  {/* Acciones por Paquete */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isDownloaded ? (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Listo</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePack(pack.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          title="Eliminar paquete para liberar espacio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDownloadPack(pack.id)}
                        disabled={isDownloading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloading ? `${downloadProgress}%` : "Descargar"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Barra de Progreso si está descargando */}
                {isDownloading && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden animate-pulse">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-150"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-indigo-500" />
            <span>Los paquetes se guardan en el IndexedDB local de tu navegador</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
