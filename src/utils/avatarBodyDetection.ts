/**
 * Utility to verify if a click, touch, or pointer target specifically hits
 * the mascot body component, preventing accidental bounce/squish triggers
 * when the user clicks the background of #avatar-stage.
 */
export const isMascotBodyElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof Element)) return false;

  // 1. Explicitly ignore UI chrome & stage background decorative layers
  if (
    target.closest(
      "button, header, footer, .avatar-stage-sheen, .avatar-stage-corner-glint, [data-stage-decor='true']"
    )
  ) {
    return false;
  }

  // 2. Direct hit or descendant of a marked mascot body component
  if (
    target.closest(
      '[data-avatar-body="true"], [data-mascot-body="true"], #avatar-body, .avatar-body-component'
    )
  ) {
    return true;
  }

  // 3. Direct hit on anatomical Turpial rig images (cuerpo, alas, cabeza, pico, medalla)
  if (target instanceof HTMLImageElement) {
    const alt = (target.alt || "").toLowerCase();
    const src = (target.src || "").toLowerCase();
    if (
      alt.includes("turpial") ||
      alt.includes("cuerpo") ||
      alt.includes("ala") ||
      alt.includes("cabeza") ||
      alt.includes("pico") ||
      alt.includes("medalla") ||
      alt.includes("cadena") ||
      src.includes("/assets/turpial/")
    ) {
      return true;
    }
  }

  // 4. Hit on mascot SVGs or WebGL canvases inside the mascot viewport
  if (target.closest("main svg:not([data-decor]), main canvas, main .mascot-viewport")) {
    return true;
  }

  return false;
};
