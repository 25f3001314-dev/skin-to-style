import type { SkinAnalysisResponse, VtoResponse } from "@/lib/types";

const mockSkinProfiles: SkinAnalysisResponse[] = [
  {
    source: "mock",
    profile: {
      redness: 74,
      undertone: "cool",
      skinType: "sensitive-combination",
      confidence: 0.91
    }
  },
  {
    source: "mock",
    profile: {
      redness: 42,
      undertone: "warm",
      skinType: "oily",
      confidence: 0.88
    }
  },
  {
    source: "mock",
    profile: {
      redness: 29,
      undertone: "neutral",
      skinType: "dry",
      confidence: 0.9
    }
  }
];

const mockTryOnResponses: VtoResponse[] = [
  {
    source: "mock",
    tryOnImageUrl: "https://placehold.co/900x1200/png?text=MirrorFit+Try-On+Preview+A"
  },
  {
    source: "mock",
    tryOnImageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90"
  },
  {
    source: "mock",
    tryOnImageUrl: "https://placehold.co/900x1200/png?text=MirrorFit+Try-On+Preview+C"
  }
];

export function getMockSkinAnalysis(): SkinAnalysisResponse {
  return mockSkinProfiles[Math.floor(Math.random() * mockSkinProfiles.length)];
}

export function getMockVtoResponse(): VtoResponse {
  return mockTryOnResponses[Math.floor(Math.random() * mockTryOnResponses.length)];
}
