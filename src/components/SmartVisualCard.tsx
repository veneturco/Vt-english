import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ImageOff, Check, Star, Zap, Crown } from "lucide-react";

export interface SmartVisualCardProps {
  imageUrl: string;
  fallbackImageUrl?: string;
  emojiFallback: string;
  title: string;
  spanishTranslation?: string;
  category: string;
  categoryEmoji: string;
  isWinner?: boolean;
  aspectRatio?: "square" | "video" | "wide";
  className?: string;
  showLabels?: boolean;
  effectTheme?: "emerald" | "golden" | "rainbow" | "cosmic";
}

export function SmartVisualCard({
  imageUrl,
  fallbackImageUrl,
  emojiFallback,
  title,
  spanishTranslation,
  category,
  categoryEmoji,
  isWinner = false,
  aspectRatio = "square",
  className = "",
  showLabels = true,
  effectTheme = "emerald",
}: SmartVisualCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(imageUrl);
  const [loadStatus, setLoadStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  // Reset states when target imageUrl changes
  useEffect(() => {
    setImgSrc(imageUrl);
    setLoadStatus("loading");
    setHasTriedFallback(false);
  }, [imageUrl]);

  const handleImageError = () => {
    if (!hasTriedFallback && fallbackImageUrl) {
      setHasTriedFallback(true);
      setImgSrc(fallbackImageUrl);
    } else {
      setLoadStatus("error");
    }
  };

  const handleImageLoaded = () => {
    setLoadStatus("loaded");
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
      ? "aspect-video"
      : "aspect-[4/3]";

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 bg-slate-800/90 shadow-2xl transition-all duration-300 ${aspectClass} ${
        isWinner
          ? "border-emerald-400 ring-4 ring-emerald-400/40 shadow-[0_0_45px_rgba(52,211,153,0.5)]"
          : "border-slate-700 hover:border-slate-600"
      } ${className}`}
    >
      {/* 1. SHIMMER SKELETON (while image is downloading) */}
      {loadStatus === "loading" && (
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-pulse flex flex-col items-center justify-center p-4">
          <div className="text-4xl sm:text-5xl animate-bounce mb-2 opacity-80">
            {emojiFallback || categoryEmoji}
          </div>
          <div className="h-3 w-28 bg-slate-600/80 rounded-full animate-pulse" />
        </div>
      )}

      {/* 2. REAL PHOTO (with referrerPolicy="no-referrer" and crossOrigin="anonymous") */}
      {loadStatus !== "error" ? (
        <motion.img
          key={imgSrc}
          src={imgSrc}
          alt={title}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onLoad={handleImageLoaded}
          onError={handleImageError}
          animate={
            isWinner
              ? {
                  scale: [1, 1.07, 1.03],
                  rotate: [0, -1, 1, 0],
                  transition: { duration: 0.6, ease: "easeOut" },
                }
              : { scale: 1 }
          }
          className={`w-full h-full object-cover transition-transform duration-500 ${
            loadStatus === "loaded" ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        /* 3. AESTHETIC ILLUSTRATED VECTOR FALLBACK CARD (Zero Blank Screen guarantee) */
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 text-center select-none">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-emerald-500/10 to-indigo-500/10 opacity-70" />

          {/* Giant Emoji Illustration */}
          <div className="relative z-10 text-6xl sm:text-7xl mb-2 drop-shadow-xl transform hover:scale-110 transition-transform">
            {emojiFallback}
          </div>

          <div className="relative z-10 font-black text-white text-sm sm:text-base drop-shadow-md">
            {title}
          </div>

          <div className="relative z-10 text-xs font-semibold text-amber-300 mt-0.5">
            {spanishTranslation}
          </div>
        </div>
      )}

      {/* TOP BADGE: Category */}
      {showLabels && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/75 backdrop-blur-md text-[11px] font-bold text-white border border-white/15 flex items-center gap-1.5 shadow-md">
          <span>{categoryEmoji}</span>
          <span className="uppercase tracking-wider">{category}</span>
        </div>
      )}

      {/* BOTTOM PILL: Spanish meaning */}
      {showLabels && spanishTranslation && (
        <div className="absolute bottom-3 inset-x-3 z-10 text-center px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-amber-300 shadow-lg truncate">
          🇪🇸 {spanishTranslation}
        </div>
      )}

      {/* --- VICTORY EFFECTS OVERLAY --- */}
      <AnimatePresence>
        {isWinner && (
          <>
            {/* 1. Laser Sheen Sweep */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "200%", opacity: [0, 0.7, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-20"
            />

            {/* 2. Floating Star Bursts */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 font-black"
            >
              <Crown className="w-4 h-4 text-slate-950 fill-slate-950" />
            </motion.div>

            {/* 3. Corner Sparkles Animation */}
            {[-1, 1].map((dir, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0, scale: 0 }}
                animate={{
                  y: [-10, -35],
                  x: dir * 25,
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.3, 0.8],
                }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
                className="absolute top-1/2 left-1/2 z-20 pointer-events-none text-xl sm:text-2xl"
              >
                {i % 2 === 0 ? "✨" : "⭐"}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
