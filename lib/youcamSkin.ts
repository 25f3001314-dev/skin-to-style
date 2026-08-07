import { getYoucamBaseUrl } from "@/lib/youcamAuth";
import type { SkinAnalysisResponse, Undertone, SkinColorRanking } from "@/lib/types";

const YOUCAM_BASE = (process.env.YOUCAM_BASE_URL || process.env.YOUCAM_API_BASE_URL || "https://api.perfectcorp.com").replace(/\/$/, "");
const YOUCAM_API_KEY = process.env.YOUCAM_API_KEY || "";
const YOUCAM_AUTH_SCHEME = process.env.YOUCAM_AUTH_SCHEME || "Bearer";

export function normalizeUndertone(input: string | undefined): Undertone {
  if (input === "warm" || input === "cool" || input === "neutral") {
    return input;
  }
  return "neutral";
}

// YouCam response me "undertone" field har format me reliable nahi hoti, isliye
// redness/oiliness se heuristic estimate use kar rahe hain.
export function estimateUndertone(redness: number, oiliness: number): Undertone {
  if (redness >= 60) return "warm";
  if (oiliness >= 60) return "cool";
  return "neutral";
}

export function mapYoucamResultsToSkinAnalysis(results: any): SkinAnalysisResponse {
  const redness = Number(results?.redness?.raw_score ?? results?.redness?.ui_score ?? results?.redness_score ?? results?.metrics?.redness ?? 50);
  const oiliness = Number(results?.oiliness?.raw_score ?? results?.oiliness?.ui_score ?? results?.oiliness_score ?? results?.metrics?.oiliness ?? 50);
  const skinType = String(
    results?.skin_type?.whole?.label ??
    results?.skin_type?.whole?.type ??
    results?.skin_type ??
    results?.skinType ??
    results?.skin_type_inference ??
    "combination"
  );

  const undertone = normalizeUndertone(String(results?.undertone ?? results?.skin_undertone ?? results?.metrics?.undertone ?? estimateUndertone(redness, oiliness)));
  const confidence = Number(results?.confidence ?? results?.metrics?.confidence ?? 0.85);

  return {
    source: "live",
    profile: {
      redness,
      undertone,
      skinType,
      confidence
    },
    colorRanking: buildColorRanking({ redness, undertone, skinType })
  };
}

export function buildColorRanking(input: { redness: number; undertone: Undertone; skinType: string }): SkinColorRanking {
  const redness = input.redness;
  const undertone = input.undertone;
  const skinType = input.skinType.toLowerCase();

  const undertoneBestMatches: Record<Undertone, string[]> = {
    warm: ["Camel", "Warm Beige", "Olive", "Terracotta", "Cream"],
    cool: ["Soft White", "Dusty Rose", "Denim Blue", "Plum", "Silver Gray"],
    neutral: ["Balanced Navy", "Stone", "Mushroom", "Sage", "Denim Blue"]
  };

  const neutralSafeMatches = ["Stone", "Mushroom", "Balanced Navy", "Soft White", "Denim Blue"];
  const blocked = ["Neon Orange", "Scarlet", "Hot Pink", "Electric Lime", "High-Contrast Black/White"];

  const rednessModifiers = redness >= 70
    ? ["Dusty Rose", "Mushroom", "Sage", "Warm Beige"]
    : redness >= 40
      ? ["Camel", "Olive", "Stone"]
      : ["Dusty Rose", "Terracotta", "Denim Blue"];

  const skinTypeModifiers = skinType.includes("oily")
    ? ["Chambrey", "Lightweight Twill", "Soft White"]
    : skinType.includes("dry")
      ? ["Cotton", "Warm Beige", "Cream"]
      : skinType.includes("sensitive")
        ? ["Mushroom", "Sage", "Soft White"]
        : ["Cotton", "Stone", "Balanced Navy"];

  const bestMatch = Array.from(new Set([...undertoneBestMatches[undertone], ...rednessModifiers, ...skinTypeModifiers])).slice(0, 8);
  const goodSafeMatch = Array.from(new Set([...neutralSafeMatches, ...skinTypeModifiers.slice(0, 2)])).slice(0, 6);

  return {
    bestMatch,
    goodSafeMatch,
    blocked
  };
}

export function getYoucamStartUrl(): string {
  const normalizedPath = "/api/v1/skin-analysis";
  return `${YOUCAM_BASE}${normalizedPath}`;
}

export function getYoucamHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `${YOUCAM_AUTH_SCHEME} ${YOUCAM_API_KEY}`
  };
}

export async function readResponseJson(response: Response): Promise<any> {
  const json = await response.json();
  return json?.data ?? json;
}