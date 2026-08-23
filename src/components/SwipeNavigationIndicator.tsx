import React from "react";
import { motion } from "motion/react";
import { MessageSquare, Map, Grid } from "lucide-react";
import { MainAppTab } from "./BottomNavBar";
import { haptics } from "../utils/haptics";

interface SwipeNavigationIndicatorProps {
  activeTab: MainAppTab;
  onSelectTab: (tab: MainAppTab) => void;
}

const TABS: { id: MainAppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "chat", label: "Conversar", icon: MessageSquare },
  { id: "path", label: "Camino", icon: Map },
  { id: "tools", label: "Práctica", icon: Grid },
];

export const SwipeNavigationIndicator: React.FC<SwipeNavigationIndicatorProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const activeIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-2 pb-1 flex flex-col items-center select-none z-20">
      {/* Segmented Glass Bar */}
      <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-1 flex items-center justify-between relative shadow-sm">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              id={`swipe-indicator-tab-${tab.id}`}
              onClick={() => {
                haptics.light();
                onSelectTab(tab.id);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-colors relative z-10 ${
                isActive
                  ? "text-emerald-400 font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-swipe-pill"
                  className="absolute inset-0 bg-slate-800 border border-emerald-500/30 rounded-xl shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtle Swipe Dots Indicator */}
      <div className="flex items-center gap-1.5 mt-1.5" aria-hidden="true">
        {TABS.map((tab, idx) => (
          <motion.div
            key={`dot-${tab.id}`}
            animate={{
              width: idx === activeIndex ? 18 : 5,
              backgroundColor: idx === activeIndex ? "rgba(52, 211, 153, 0.9)" : "rgba(100, 116, 139, 0.4)",
            }}
            transition={{ duration: 0.25 }}
            className="h-1 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};
