import { SeasonalThemeConfig, SeasonalThemeId } from "../types";

export const SEASONAL_THEMES: Record<Exclude<SeasonalThemeId, "auto">, SeasonalThemeConfig> = {
  summer_glow: {
    id: "summer_glow",
    name: "Summer Sunshine & Fireflies",
    nameSpanish: "Verano Radiante & Luciérnagas",
    seasonLabel: "Verano",
    dateRangeLabel: "21 de Junio - 21 de Septiembre",
    icon: "☀️",
    holidayBadge: "🌴 Energía Solar",
    description:
      "Colores dorados y ámbar cálidos con destellos solares, luciérnagas luminiscentes y vibrantes botones oro.",
    colors: {
      bgRoot: "bg-[#110e06]",
      bgGradient: "from-[#110e06] via-[#211a0c] to-[#0c0a04]",
      auroraGlow: "from-amber-500/20 via-orange-400/15 to-yellow-500/20",
      cardBg: "bg-[#211909]/85 backdrop-blur-md",
      cardBorder: "border-amber-500/30",
      cardBorderHover: "hover:border-amber-400/60",
      accentText: "text-amber-300",
      accentBg: "bg-amber-500/20",
      accentBorder: "border-amber-400/40",
      accentGlow: "shadow-[0_0_22px_rgba(251,191,36,0.22)]",
      festiveTagBg: "bg-gradient-to-r from-amber-600/30 to-yellow-600/30 border-amber-400/40 text-amber-200",
      primaryButton: "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950",
      primaryButtonBorder: "border-amber-700",
      selection: "selection:bg-amber-400 selection:text-slate-950",
      badgeBg: "bg-amber-500/20",
      badgeBorder: "border-amber-500/40",
      badgeText: "text-amber-300",
    },
    cssVars: {
      primaryBtnGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #eab308 100%)",
      primaryBtnText: "#020617",
      primaryBtnBorder: "#b45309",
      primaryBtnShadow: "0 4px 0 #92400e, 0 8px 18px rgba(245, 158, 11, 0.35)",
      accentColor: "#fbbf24",
      accentRgb: "251, 191, 36",
      accentGlow: "rgba(251, 191, 36, 0.25)",
      cardBorder: "rgba(251, 191, 36, 0.35)",
      cardBg: "rgba(33, 25, 9, 0.85)",
      badgeBg: "rgba(251, 191, 36, 0.18)",
      badgeBorder: "rgba(251, 191, 36, 0.45)",
      badgeText: "#fef08a",
    },
    particles: {
      type: "fireflies",
      count: 36,
      speed: 0.85,
      colors: ["#fef08a", "#fde047", "#f59e0b", "#fb923c", "#ffffff"],
      wind: 0.12,
      glow: true,
    },
    decorativeHeaderIcon: "☀️",
  },
  autumn_harvest: {
    id: "autumn_harvest",
    name: "Autumn Harvest & Foliage",
    nameSpanish: "Otoño Cosecha & Halloween",
    seasonLabel: "Otoño",
    dateRangeLabel: "22 de Septiembre - 20 de Diciembre",
    icon: "🍂",
    holidayBadge: "🎃 Viento Otoñal",
    description:
      "Tonos calabaza, canela y hojas de arce doradas con calidez acogedora de fogata.",
    colors: {
      bgRoot: "bg-[#140b07]",
      bgGradient: "from-[#140b07] via-[#24130a] to-[#0e0704]",
      auroraGlow: "from-orange-500/20 via-rose-500/15 to-amber-600/20",
      cardBg: "bg-[#25130b]/85 backdrop-blur-md",
      cardBorder: "border-orange-500/30",
      cardBorderHover: "hover:border-orange-400/60",
      accentText: "text-orange-300",
      accentBg: "bg-orange-500/20",
      accentBorder: "border-orange-400/40",
      accentGlow: "shadow-[0_0_22px_rgba(249,115,22,0.22)]",
      festiveTagBg: "bg-gradient-to-r from-orange-600/30 to-purple-600/30 border-orange-400/40 text-orange-200",
      primaryButton: "bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 hover:from-orange-300 hover:to-amber-400 text-slate-950",
      primaryButtonBorder: "border-orange-700",
      selection: "selection:bg-orange-400 selection:text-slate-950",
      badgeBg: "bg-orange-500/20",
      badgeBorder: "border-orange-500/40",
      badgeText: "text-orange-300",
    },
    cssVars: {
      primaryBtnGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #d97706 100%)",
      primaryBtnText: "#020617",
      primaryBtnBorder: "#c2410c",
      primaryBtnShadow: "0 4px 0 #9a3412, 0 8px 18px rgba(234, 88, 12, 0.35)",
      accentColor: "#f97316",
      accentRgb: "249, 115, 22",
      accentGlow: "rgba(249, 115, 22, 0.25)",
      cardBorder: "rgba(249, 115, 22, 0.35)",
      cardBg: "rgba(37, 19, 11, 0.85)",
      badgeBg: "rgba(249, 115, 22, 0.18)",
      badgeBorder: "rgba(249, 115, 22, 0.45)",
      badgeText: "#fed7aa",
    },
    particles: {
      type: "leaves",
      count: 35,
      speed: 1.2,
      colors: ["#ea580c", "#f97316", "#d97706", "#dc2626", "#ca8a04"],
      wind: 0.5,
      glow: false,
    },
    decorativeHeaderIcon: "🍂",
  },
  winter_holiday: {
    id: "winter_holiday",
    name: "Winter Frost & Holiday",
    nameSpanish: "Invierno Festivo & Nieve",
    seasonLabel: "Invierno & Fiestas",
    dateRangeLabel: "21 de Diciembre - 19 de Marzo",
    icon: "❄️",
    holidayBadge: "🎄 Fiestas & Nieve",
    description:
      "Atmósfera ártica con suaves copos de nieve, destellos escarchados en cian polar y bordes de cristal.",
    colors: {
      bgRoot: "bg-[#050b17]",
      bgGradient: "from-[#050b17] via-[#09152b] to-[#040913]",
      auroraGlow: "from-sky-500/20 via-cyan-400/15 to-indigo-600/20",
      cardBg: "bg-[#0a1730]/85 backdrop-blur-md",
      cardBorder: "border-sky-500/30",
      cardBorderHover: "hover:border-sky-400/60",
      accentText: "text-sky-300",
      accentBg: "bg-sky-500/20",
      accentBorder: "border-sky-400/40",
      accentGlow: "shadow-[0_0_22px_rgba(56,189,248,0.22)]",
      festiveTagBg: "bg-gradient-to-r from-rose-600/30 via-sky-600/30 to-amber-500/30 border-sky-400/50 text-sky-200",
      primaryButton: "bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950",
      primaryButtonBorder: "border-sky-700",
      selection: "selection:bg-cyan-400 selection:text-slate-950",
      badgeBg: "bg-sky-500/20",
      badgeBorder: "border-sky-500/40",
      badgeText: "text-sky-300",
    },
    cssVars: {
      primaryBtnGradient: "linear-gradient(135deg, #38bdf8 0%, #06b6d4 50%, #2dd4bf 100%)",
      primaryBtnText: "#020617",
      primaryBtnBorder: "#0284c7",
      primaryBtnShadow: "0 4px 0 #0369a1, 0 8px 18px rgba(6, 182, 212, 0.35)",
      accentColor: "#38bdf8",
      accentRgb: "56, 189, 248",
      accentGlow: "rgba(56, 189, 248, 0.25)",
      cardBorder: "rgba(56, 189, 248, 0.35)",
      cardBg: "rgba(10, 23, 48, 0.85)",
      badgeBg: "rgba(56, 189, 248, 0.18)",
      badgeBorder: "rgba(56, 189, 248, 0.45)",
      badgeText: "#bae6fd",
    },
    particles: {
      type: "snow",
      count: 42,
      speed: 1.1,
      colors: ["#ffffff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#fbcfe8", "#fde047"],
      wind: 0.35,
      glow: true,
    },
    decorativeHeaderIcon: "❄️",
  },
  spring_bloom: {
    id: "spring_bloom",
    name: "Spring Blossom & Renewal",
    nameSpanish: "Primavera Floreciente",
    seasonLabel: "Primavera",
    dateRangeLabel: "20 de Marzo - 20 de Junio",
    icon: "🌸",
    holidayBadge: "🌷 Brisa Floral",
    description:
      "Acentos en verde esmeralda fresco y rosa cerezo con pétalos flotantes de sakura.",
    colors: {
      bgRoot: "bg-[#07130f]",
      bgGradient: "from-[#07130f] via-[#0d221a] to-[#050e0b]",
      auroraGlow: "from-emerald-500/20 via-pink-400/15 to-teal-500/20",
      cardBg: "bg-[#0b2118]/85 backdrop-blur-md",
      cardBorder: "border-emerald-500/30",
      cardBorderHover: "hover:border-emerald-400/60",
      accentText: "text-emerald-300",
      accentBg: "bg-emerald-500/20",
      accentBorder: "border-emerald-400/40",
      accentGlow: "shadow-[0_0_22px_rgba(52,211,153,0.22)]",
      festiveTagBg: "bg-gradient-to-r from-pink-600/30 to-emerald-600/30 border-pink-400/40 text-pink-200",
      primaryButton: "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950",
      primaryButtonBorder: "border-emerald-700",
      selection: "selection:bg-emerald-400 selection:text-slate-950",
      badgeBg: "bg-emerald-500/20",
      badgeBorder: "border-emerald-500/40",
      badgeText: "text-emerald-300",
    },
    cssVars: {
      primaryBtnGradient: "linear-gradient(135deg, #34d399 0%, #14b8a6 50%, #06b6d4 100%)",
      primaryBtnText: "#020617",
      primaryBtnBorder: "#059669",
      primaryBtnShadow: "0 4px 0 #047857, 0 8px 18px rgba(16, 185, 129, 0.35)",
      accentColor: "#34d399",
      accentRgb: "52, 211, 153",
      accentGlow: "rgba(52, 211, 153, 0.25)",
      cardBorder: "rgba(52, 211, 153, 0.35)",
      cardBg: "rgba(11, 33, 24, 0.85)",
      badgeBg: "rgba(52, 211, 153, 0.18)",
      badgeBorder: "rgba(52, 211, 153, 0.45)",
      badgeText: "#a7f3d0",
    },
    particles: {
      type: "sakura",
      count: 36,
      speed: 1.0,
      colors: ["#fbcfe8", "#f472b6", "#fda4af", "#ffffff", "#a7f3d0"],
      wind: 0.45,
      glow: false,
    },
    decorativeHeaderIcon: "🌸",
  },
  default_dark: {
    id: "default_dark",
    name: "Classic Slate Night",
    nameSpanish: "Clásico Minimalista",
    seasonLabel: "Estándar",
    dateRangeLabel: "Todo el año",
    icon: "🌙",
    holidayBadge: "🌌 Modo Noche",
    description:
      "Diseño sobrio de alto contraste en slate oscuro y acentos esmeralda minimalistas.",
    colors: {
      bgRoot: "bg-slate-950",
      bgGradient: "from-slate-950 via-slate-900 to-slate-950",
      auroraGlow: "from-emerald-500/10 via-sky-500/5 to-purple-500/10",
      cardBg: "bg-slate-900/85 backdrop-blur-md",
      cardBorder: "border-slate-800",
      cardBorderHover: "hover:border-slate-700",
      accentText: "text-emerald-400",
      accentBg: "bg-emerald-500/20",
      accentBorder: "border-emerald-500/40",
      accentGlow: "shadow-[0_0_20px_rgba(16,185,129,0.18)]",
      festiveTagBg: "bg-slate-800 border-slate-700 text-slate-300",
      primaryButton: "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
      primaryButtonBorder: "border-emerald-700",
      selection: "selection:bg-emerald-500 selection:text-slate-950",
      badgeBg: "bg-emerald-500/20",
      badgeBorder: "border-emerald-500/40",
      badgeText: "text-emerald-400",
    },
    cssVars: {
      primaryBtnGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      primaryBtnText: "#020617",
      primaryBtnBorder: "#047857",
      primaryBtnShadow: "0 4px 0 #065f46, 0 8px 18px rgba(16, 185, 129, 0.25)",
      accentColor: "#10b981",
      accentRgb: "16, 185, 129",
      accentGlow: "rgba(16, 185, 129, 0.2)",
      cardBorder: "rgba(51, 65, 85, 0.6)",
      cardBg: "rgba(15, 23, 42, 0.85)",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeBorder: "rgba(16, 185, 129, 0.4)",
      badgeText: "#6ee7b7",
    },
    particles: {
      type: "sparkles",
      count: 24,
      speed: 0.7,
      colors: ["#34d399", "#38bdf8", "#a78bfa", "#ffffff"],
      wind: 0.05,
      glow: true,
    },
    decorativeHeaderIcon: "✨",
  },
};

/**
 * Calculates current season or holiday based on exact local calendar date
 */
export function getSeasonFromDate(date: Date = new Date()): Exclude<SeasonalThemeId, "auto"> {
  const month = date.getMonth(); // 0 = Jan, 11 = Dec
  const day = date.getDate();

  // Winter: Dec 21 to Mar 19
  if (
    (month === 11 && day >= 21) ||
    month === 0 || // Jan
    month === 1 || // Feb
    (month === 2 && day < 20) // Mar 1-19
  ) {
    return "winter_holiday";
  }

  // Spring: Mar 20 to Jun 20
  if (
    (month === 2 && day >= 20) || // Mar 20-31
    month === 3 || // Apr
    month === 4 || // May
    (month === 5 && day < 21) // Jun 1-20
  ) {
    return "spring_bloom";
  }

  // Summer: Jun 21 to Sep 21 (August falls here!)
  if (
    (month === 5 && day >= 21) || // Jun 21-30
    month === 6 || // Jul
    month === 7 || // Aug
    (month === 8 && day < 22) // Sep 1-21
  ) {
    return "summer_glow";
  }

  // Autumn: Sep 22 to Dec 20 (including Halloween in Oct)
  if (
    (month === 8 && day >= 22) || // Sep 22-30
    month === 9 || // Oct
    month === 10 || // Nov
    (month === 11 && day < 21) // Dec 1-20
  ) {
    return "autumn_harvest";
  }

  return "summer_glow";
}

const STORAGE_THEME_KEY = "vt_seasonal_theme_id";
const STORAGE_PARTICLES_KEY = "vt_seasonal_particles_enabled";
const STORAGE_DENSITY_KEY = "vt_seasonal_particles_density";

export function getStoredSeasonalTheme(): SeasonalThemeId {
  if (typeof window === "undefined") return "auto";
  try {
    const stored = localStorage.getItem(STORAGE_THEME_KEY);
    if (
      stored === "winter_holiday" ||
      stored === "spring_bloom" ||
      stored === "summer_glow" ||
      stored === "autumn_harvest" ||
      stored === "default_dark" ||
      stored === "auto"
    ) {
      return stored as SeasonalThemeId;
    }
  } catch {}
  // Default to automatic calendar-based season detection
  return "auto";
}

export function setStoredSeasonalTheme(themeId: SeasonalThemeId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_THEME_KEY, themeId);
  } catch {}
}

export function getStoredParticlesEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(STORAGE_PARTICLES_KEY);
    if (stored !== null) return stored === "true";
  } catch {}
  return true; // Enabled by default for rich atmosphere
}

export function setStoredParticlesEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PARTICLES_KEY, String(enabled));
  } catch {}
}

export type ParticleDensity = "subtle" | "normal" | "festive";

export function getStoredParticleDensity(): ParticleDensity {
  if (typeof window === "undefined") return "normal";
  try {
    const stored = localStorage.getItem(STORAGE_DENSITY_KEY);
    if (stored === "subtle" || stored === "normal" || stored === "festive") {
      return stored;
    }
  } catch {}
  return "normal";
}

export function setStoredParticleDensity(density: ParticleDensity): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_DENSITY_KEY, density);
  } catch {}
}

/**
 * Resolves active theme config whether it's 'auto' or explicit
 */
export function resolveSeasonalTheme(themeId: SeasonalThemeId): SeasonalThemeConfig {
  if (themeId === "auto") {
    const resolvedId = getSeasonFromDate();
    const config = SEASONAL_THEMES[resolvedId] || SEASONAL_THEMES.summer_glow;
    return {
      ...config,
      holidayBadge: `📅 Auto (${config.seasonLabel})`,
    };
  }
  return SEASONAL_THEMES[themeId] || SEASONAL_THEMES.summer_glow;
}

/**
 * Injects CSS Custom Properties into :root / document.documentElement
 * so that any CSS or element can dynamically reference the active season's palette.
 */
export function applySeasonalThemeToDOM(config: SeasonalThemeConfig): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.style.setProperty("--season-primary-btn-gradient", config.cssVars.primaryBtnGradient);
  root.style.setProperty("--season-primary-btn-text", config.cssVars.primaryBtnText);
  root.style.setProperty("--season-primary-btn-border", config.cssVars.primaryBtnBorder);
  root.style.setProperty("--season-primary-btn-shadow", config.cssVars.primaryBtnShadow);
  root.style.setProperty("--season-accent-color", config.cssVars.accentColor);
  root.style.setProperty("--season-accent-rgb", config.cssVars.accentRgb);
  root.style.setProperty("--season-accent-glow", config.cssVars.accentGlow);
  root.style.setProperty("--season-card-border", config.cssVars.cardBorder);
  root.style.setProperty("--season-card-bg", config.cssVars.cardBg);
  root.style.setProperty("--season-badge-bg", config.cssVars.badgeBg);
  root.style.setProperty("--season-badge-border", config.cssVars.badgeBorder);
  root.style.setProperty("--season-badge-text", config.cssVars.badgeText);
  root.setAttribute("data-seasonal-theme", config.id);
}

