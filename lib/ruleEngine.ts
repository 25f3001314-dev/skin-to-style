import type { PaletteResult, SkinProfile } from "@/lib/types";

/*
MirrorFit Deterministic Styling Rule Table
-----------------------------------------
This engine is intentionally fixed and non-AI. It never calls a model and never
changes behavior based on generative output. AI is only used upstream for raw
skin signals (redness, undertone, skin type), then this table gates styling.

Rule A: Redness gate
- High redness (>= 70): block saturated warm hues (bright red, coral, orange,
  hot pink) that visually amplify facial redness. Prefer cooling tones.
- Medium redness (40-69): reduce aggressive warm tones; allow muted warm shades.
- Low redness (< 40): no redness-based color restrictions.

Rule B: Undertone mapping
- Warm undertone: favor earthy warm colors and warm neutrals.
- Cool undertone: favor cool jewel tones and cool neutrals.
- Neutral undertone: allow balanced neutral + medium-saturation shades.

Rule C: Skin type to fabric mapping
- Oily: breathable matte fabrics (cotton, linen, chambray).
- Dry: soft comfort-focused fabrics (cotton-silk blends, modal, jersey).
- Sensitive/reactive: hypoallergenic low-friction fabrics (bamboo, lyocell,
  soft cotton).
- Combination/other: versatile fabrics with breathable structure.
*/
export function getRecommendedPalette(skinProfile: SkinProfile): PaletteResult {
  const { redness, undertone, skinType } = skinProfile;
  const normalizedSkinType = skinType.trim().toLowerCase();

  const blockedColors = new Set<string>();
  const allowedColors = new Set<string>();
  const allowedFabrics = new Set<string>();
  const reasons: string[] = [];

  if (redness >= 70) {
    ["bright red", "coral", "tangerine", "hot pink"].forEach((color) => blockedColors.add(color));
    ["deep teal", "navy", "slate", "cool taupe", "forest green"].forEach((color) =>
      allowedColors.add(color)
    );
    reasons.push(
      "High redness detected, so saturated warm shades are blocked to avoid amplifying visible flush."
    );
  } else if (redness >= 40) {
    ["neon orange", "scarlet"].forEach((color) => blockedColors.add(color));
    ["dusty rose", "muted olive", "denim blue", "stone"].forEach((color) =>
      allowedColors.add(color)
    );
    reasons.push("Moderate redness favors muted palettes over high-saturation warm extremes.");
  } else {
    reasons.push("Low redness allows broader color flexibility.");
  }

  if (undertone === "warm") {
    ["camel", "olive", "ivory", "terracotta", "warm beige"].forEach((color) =>
      allowedColors.add(color)
    );
    reasons.push("Warm undertone maps to earthy, golden, and warm-neutral shades.");
  }

  if (undertone === "cool") {
    ["cobalt", "emerald", "charcoal", "icy blue", "plum"].forEach((color) =>
      allowedColors.add(color)
    );
    reasons.push("Cool undertone maps to cool jewel tones and crisp cool neutrals.");
  }

  if (undertone === "neutral") {
    ["sage", "mushroom", "balanced navy", "soft white", "graphite"].forEach((color) =>
      allowedColors.add(color)
    );
    reasons.push("Neutral undertone supports balanced palettes from both warm and cool families.");
  }

  if (normalizedSkinType.includes("oily")) {
    ["cotton", "linen", "chambray", "lightweight twill"].forEach((fabric) =>
      allowedFabrics.add(fabric)
    );
    reasons.push("Oily skin type favors breathable, matte fabrics that stay comfortable under heat.");
  } else if (normalizedSkinType.includes("dry")) {
    ["modal", "jersey", "brushed cotton", "cotton-silk blend"].forEach((fabric) =>
      allowedFabrics.add(fabric)
    );
    reasons.push("Dry skin type benefits from soft, lower-friction fabrics with gentle hand feel.");
  } else if (
    normalizedSkinType.includes("sensitive") ||
    normalizedSkinType.includes("reactive")
  ) {
    ["bamboo", "lyocell", "organic cotton", "fine knit"].forEach((fabric) =>
      allowedFabrics.add(fabric)
    );
    reasons.push("Sensitive skin type prioritizes hypoallergenic, low-irritation textile choices.");
  } else {
    ["cotton", "tencel", "soft denim", "viscose blend"].forEach((fabric) =>
      allowedFabrics.add(fabric)
    );
    reasons.push("Combination or unspecified skin type uses balanced, breathable fabric defaults.");
  }

  return {
    allowedColors: Array.from(allowedColors),
    blockedColors: Array.from(blockedColors),
    allowedFabrics: Array.from(allowedFabrics),
    reason: reasons.join(" ")
  };
}
