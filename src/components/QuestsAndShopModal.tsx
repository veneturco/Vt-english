import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Gift, Check, Flame, Gem, ShoppingBag, ShieldAlert, Sparkles, Award } from "lucide-react";
import { UserGamificationState, DailyQuest } from "../types";

interface QuestsAndShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamification: UserGamificationState;
  onClaimQuest: (questId: string, xp: number, gems: number) => void;
  onBuyItem: (cost: number) => void;
}

const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: "quest-1",
    title: "Habla 3 minutos",
    description: "Mantén una conversación en inglés con tu tutor BET.",
    target: 3,
    current: 2,
    xpReward: 30,
    gemsReward: 3,
    icon: "🎙️",
    completed: false,
  },
  {
    id: "quest-2",
    title: "Pronunciación Perfecta",
    description: "Alcanza más de 90 puntos en una frase de práctica.",
    target: 1,
    current: 1,
    xpReward: 40,
    gemsReward: 5,
    icon: "🎯",
    completed: true,
  },
  {
    id: "quest-3",
    title: "Repaso de Vocabulario",
    description: "Repasa 5 tarjetas en el sistema de repetición espaciada SRS.",
    target: 5,
    current: 5,
    xpReward: 35,
    gemsReward: 4,
    icon: "📚",
    completed: true,
  },
];

const SHOP_ITEMS = [
  {
    id: "streak_freeze",
    name: "Protector de Racha",
    desc: "Evita perder tu racha si olvidas practicar 1 día.",
    cost: 10,
    icon: "🧊",
  },
  {
    id: "double_xp",
    name: "Poción Doble XP (15 min)",
    desc: "Gana el doble de puntos de experiencia en tus llamadas.",
    cost: 15,
    icon: "⚡",
  },
  {
    id: "vip_badge",
    name: "Insignia Dorada 2.5D",
    desc: "Muestra un marco de oro en el avatar de tu tutor.",
    cost: 30,
    icon: "👑",
  },
];

export function QuestsAndShopModal({
  isOpen,
  onClose,
  gamification,
  onClaimQuest,
  onBuyItem,
}: QuestsAndShopModalProps) {
  const [activeTab, setActiveTab] = useState<"quests" | "shop">("quests");
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaim = (q: DailyQuest) => {
    if (claimedIds.includes(q.id)) return;
    setClaimedIds((prev) => [...prev, q.id]);
    onClaimQuest(q.id, q.xpReward, q.gemsReward);
  };

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (gamification.gems < item.cost) {
      setPurchaseMsg("¡No tienes suficientes gemas aún! Sigue practicando.");
      setTimeout(() => setPurchaseMsg(null), 3000);
      return;
    }
    onBuyItem(item.cost);
    setPurchaseMsg(`¡Compraste ${item.name} con éxito! 🎉`);
    setTimeout(() => setPurchaseMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 relative max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stats Header Bar */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black">
            <Flame className="w-4 h-4 fill-current" />
            <span>{gamification.streakDays} Días</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
            <Gem className="w-4 h-4 fill-current" />
            <span>{gamification.gems} Gemas</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black">
            <Award className="w-4 h-4" />
            <span>{gamification.xpPoints} XP (Nivel {gamification.level})</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("quests")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "quests"
                ? "bg-amber-500 text-slate-950 font-black shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Misiones de Hoy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shop")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "shop"
                ? "bg-amber-500 text-slate-950 font-black shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Tienda de Gemas</span>
          </button>
        </div>

        {/* Purchase Notification */}
        {purchaseMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold text-center">
            {purchaseMsg}
          </div>
        )}

        {/* Content Container */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {activeTab === "quests" ? (
            DEFAULT_QUESTS.map((quest) => {
              const isClaimed = claimedIds.includes(quest.id);
              return (
                <div
                  key={quest.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{quest.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{quest.title}</h4>
                      <p className="text-xs text-slate-400">{quest.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-amber-300">
                        <span>+{quest.xpReward} XP</span>
                        <span>•</span>
                        <span>+{quest.gemsReward} Gemas</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isClaimed ? (
                      <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 text-xs font-bold">
                        Reclamado
                      </span>
                    ) : quest.completed ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(quest)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs shadow hover:scale-105 transition"
                      >
                        Reclamar
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold">
                        {quest.current}/{quest.target}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            SHOP_ITEMS.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuy(item)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow hover:scale-105 transition flex items-center gap-1 shrink-0"
                >
                  <Gem className="w-3.5 h-3.5 fill-current" />
                  <span>{item.cost}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
