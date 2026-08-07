import type { PaletteResult, SkinProfile } from "@/lib/types";

type HarmonyScoreProps = {
  profile: SkinProfile;
  palette: PaletteResult;
};

export function HarmonyScore({ profile, palette }: HarmonyScoreProps) {
  const score = calculateHarmonyScore(profile, palette);

  return (
    <div className="card pb-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Harmony Score</p>
      <p className="mt-2 font-[var(--font-fraunces)] text-5xl font-semibold text-slate-900">{score}/100</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        This score is deterministic and rule-based. {palette.reason}
      </p>
    </div>
  );
}

function calculateHarmonyScore(profile: SkinProfile, palette: PaletteResult): number {
  let score = 60;

  score += Math.min(20, palette.allowedColors.length * 2);
  score -= Math.min(15, palette.blockedColors.length * 2);

  if (profile.redness >= 70) {
    score -= 5;
  } else if (profile.redness <= 35) {
    score += 5;
  }

  score += profile.undertone === "neutral" ? 4 : 7;
  score += Math.min(8, palette.allowedFabrics.length);

  if (profile.confidence) {
    score += Math.round(profile.confidence * 3);
  }

  return Math.max(0, Math.min(100, score));
}
