/**
 * Web Vibration API Engine for Global Tactile & Haptic Feedback
 * Provides platform-native vibration feedback patterns for all interactive elements,
 * button presses, avatar stage impacts, and mission/quest/lesson completions.
 */

export type HapticType =
  | "selection"
  | "light"
  | "medium"
  | "heavy"
  | "punch"
  | "success"
  | "lessonComplete"
  | "questComplete"
  | "error"
  | "warning"
  | "celebrate";

class HapticEngine {
  private isEnabled: boolean = true;
  private isGlobalListenerAttached: boolean = false;
  private lastTriggerTime: number = 0;
  private readonly THROTTLE_MS: number = 40;

  constructor() {
    // Check localStorage preference if stored
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vt_haptics_enabled");
        if (stored !== null) {
          this.isEnabled = stored === "true";
        }
      } catch {}

      // Automatically initialize global listener on startup
      this.initGlobalHaptics();
    }
  }

  /**
   * Check if the device and browser support the Web Vibration API
   */
  public isSupported(): boolean {
    if (typeof window === "undefined" || typeof navigator === "undefined") return false;
    return "vibrate" in navigator && typeof navigator.vibrate === "function";
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vt_haptics_enabled", enabled ? "true" : "false");
      } catch {}
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Safely trigger a vibration pattern using the Web Vibration API
   */
  public vibrate(pattern: number | number[]): boolean {
    if (!this.isEnabled) return false;
    if (!this.isSupported()) return false;

    try {
      return navigator.vibrate(pattern);
    } catch {
      // User gesture restrictions or unsupported environment
      return false;
    }
  }

  /**
   * 1. Light selection tap (Subtle 12-14ms pulse for buttons, tabs, chips, toggles)
   */
  public selection(): void {
    this.vibrate(12);
  }

  public light(): void {
    this.vibrate(14);
  }

  /**
   * 2. Medium tactile response (Action buttons, primary submit, option picks) - 24ms
   */
  public medium(): void {
    this.vibrate(24);
  }

  /**
   * 3. 3D Physical Punch / Stage Tap Impact - [35ms, 25ms, 20ms]
   */
  public punch(): void {
    this.vibrate([35, 25, 20]);
  }

  /**
   * 4. Heavy impact / Checkpoint hit - 48ms
   */
  public heavy(): void {
    this.vibrate(48);
  }

  /**
   * 5. Success chime / Correct Answer - Crisp double pulse [22ms, 45ms, 32ms]
   */
  public success(): void {
    this.vibrate([22, 45, 32]);
  }

  /**
   * 6. Lesson Completed / Fanfare Milestone - Celebratory multi-pulse cadence
   */
  public lessonComplete(): void {
    this.vibrate([35, 60, 45, 75, 70, 90, 110]);
  }

  /**
   * 7. Mission / Quest or Level-Up Reward Claimed - [30ms, 40ms, 50ms, 60ms, 75ms]
   */
  public questComplete(): void {
    this.vibrate([30, 40, 50, 60, 75]);
  }

  /**
   * 8. Error / Misstep Feedback - Double buzz [45ms, 60ms, 45ms]
   */
  public error(): void {
    this.vibrate([45, 60, 45]);
  }

  /**
   * 9. Warning / Soft Alert - [25ms, 40ms, 20ms]
   */
  public warning(): void {
    this.vibrate([25, 40, 20]);
  }

  /**
   * 10. Grand Celebration (Level up, Trophy unlock, Confetti)
   */
  public celebrate(): void {
    this.vibrate([40, 50, 40, 50, 60, 80, 120]);
  }

  /**
   * Generic trigger helper
   */
  public trigger(type: HapticType): void {
    switch (type) {
      case "selection":
      case "light":
        this.light();
        break;
      case "medium":
        this.medium();
        break;
      case "heavy":
        this.heavy();
        break;
      case "punch":
        this.punch();
        break;
      case "success":
        this.success();
        break;
      case "lessonComplete":
        this.lessonComplete();
        break;
      case "questComplete":
        this.questComplete();
        break;
      case "error":
        this.error();
        break;
      case "warning":
        this.warning();
        break;
      case "celebrate":
        this.celebrate();
        break;
    }
  }

  /**
   * Global event listener to automatically attach subtle haptics to all interactive elements
   * (buttons, clickable cards, tabs, inputs, selects, links).
   */
  public initGlobalHaptics(): void {
    if (typeof window === "undefined" || this.isGlobalListenerAttached) return;

    const handleGlobalInteraction = (event: Event) => {
      const now = performance.now();
      if (now - this.lastTriggerTime < this.THROTTLE_MS) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Find the closest interactive element
      const interactiveEl = target.closest<HTMLElement>(
        'button, [role="button"], [role="tab"], [role="switch"], a, input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], select, summary, [data-interactive="true"], .clickable-card'
      );

      if (!interactiveEl) return;

      // Check if explicitly disabled with data-haptic="none"
      const customHaptic = interactiveEl.getAttribute("data-haptic");
      if (customHaptic === "none" || interactiveEl.classList.contains("no-haptic")) {
        return;
      }

      this.lastTriggerTime = now;

      if (customHaptic) {
        this.trigger(customHaptic as HapticType);
      } else if (
        interactiveEl.tagName === "BUTTON" ||
        interactiveEl.getAttribute("role") === "button"
      ) {
        // Subtle crisp tap for standard buttons
        this.light();
      } else {
        this.selection();
      }
    };

    // Use pointerdown with passive listener for immediate, zero-lag tactile feedback on touch/click
    window.addEventListener("pointerdown", handleGlobalInteraction, {
      passive: true,
      capture: true,
    });

    this.isGlobalListenerAttached = true;
  }
}

export const haptics = new HapticEngine();
