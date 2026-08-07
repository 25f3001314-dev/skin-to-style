export type Undertone = "warm" | "cool" | "neutral";

export type SkinProfile = {
  redness: number;
  undertone: Undertone;
  skinType: string;
  confidence?: number;
};

export type SkinColorRanking = {
  bestMatch: string[];
  goodSafeMatch: string[];
  blocked: string[];
};

export type PaletteResult = {
  allowedColors: string[];
  blockedColors: string[];
  allowedFabrics: string[];
  reason: string;
};

export type SkinAnalysisResponse = {
  source: "live" | "mock";
  profile: SkinProfile;
  colorRanking?: SkinColorRanking;
};

export type VtoResponse = {
  source: "live" | "mock";
  tryOnImageUrl: string;
};
