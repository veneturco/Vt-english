import { useState, useEffect, useCallback, useMemo } from "react";
import { SeasonalThemeConfig, SeasonalThemeId } from "../types";
import {
  resolveSeasonalTheme,
  getStoredSeasonalTheme,
  setStoredSeasonalTheme,
  getStoredParticlesEnabled,
  setStoredParticlesEnabled,
  getStoredParticleDensity,
  setStoredParticleDensity,
  applySeasonalThemeToDOM,
  getSeasonFromDate,
  ParticleDensity,
  SEASONAL_THEMES,
} from "../utils/seasonalTheme";

export interface SeasonalThemeEngineResult {
  themeId: SeasonalThemeId;
  themeConfig: SeasonalThemeConfig;
  isAuto: boolean;
  activeCalendarSeason: Exclude<SeasonalThemeId, "auto">;
  particlesEnabled: boolean;
  particleDensity: ParticleDensity;
  selectTheme: (themeId: SeasonalThemeId) => void;
  toggleParticles: (enabled: boolean) => void;
  changeParticleDensity: (density: ParticleDensity) => void;
}

export function useSeasonalThemeEngine(): SeasonalThemeEngineResult {
  const [themeId, setThemeId] = useState<SeasonalThemeId>(getStoredSeasonalTheme);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(getStoredParticlesEnabled);
  const [particleDensity, setParticleDensity] = useState<ParticleDensity>(getStoredParticleDensity);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Check date periodically (every 10 minutes) for seamless seasonal and midnight transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const activeCalendarSeason = useMemo(() => {
    return getSeasonFromDate(currentDate);
  }, [currentDate]);

  const isAuto = themeId === "auto";

  const themeConfig = useMemo(() => {
    if (isAuto) {
      const base = SEASONAL_THEMES[activeCalendarSeason] || SEASONAL_THEMES.summer_glow;
      return {
        ...base,
        holidayBadge: `📅 Auto (${base.seasonLabel})`,
      };
    }
    return SEASONAL_THEMES[themeId] || SEASONAL_THEMES.summer_glow;
  }, [themeId, isAuto, activeCalendarSeason]);

  // Synchronize CSS custom properties on document.documentElement whenever themeConfig updates
  useEffect(() => {
    applySeasonalThemeToDOM(themeConfig);
  }, [themeConfig]);

  const selectTheme = useCallback((newThemeId: SeasonalThemeId) => {
    setThemeId(newThemeId);
    setStoredSeasonalTheme(newThemeId);
  }, []);

  const toggleParticles = useCallback((enabled: boolean) => {
    setParticlesEnabled(enabled);
    setStoredParticlesEnabled(enabled);
  }, []);

  const changeParticleDensity = useCallback((density: ParticleDensity) => {
    setParticleDensity(density);
    setStoredParticleDensity(density);
  }, []);

  return {
    themeId,
    themeConfig,
    isAuto,
    activeCalendarSeason,
    particlesEnabled,
    particleDensity,
    selectTheme,
    toggleParticles,
    changeParticleDensity,
  };
}
