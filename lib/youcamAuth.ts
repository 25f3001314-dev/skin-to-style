const DEFAULT_YOUCAM_BASE_URL = "https://yce-api-01.makeupar.com";

export function getYoucamBaseUrl(): string {
  const configured = process.env.YOUCAM_API_BASE_URL?.trim();
  if (!configured) return DEFAULT_YOUCAM_BASE_URL;

  // Guard against users pasting the playground/docs URL instead of the API base.
  const lower = configured.toLowerCase();
  if (lower.includes("api-console") || lower.includes("api-playground") || lower.includes("/api-console/") || lower.includes("/api-playground/")) {
    console.warn("YOUCAM_API_BASE_URL appears to point to the documentation/playground URL. Using default API host instead. Set YOUCAM_API_BASE_URL to the API base if different.");
    return DEFAULT_YOUCAM_BASE_URL;
  }

  return configured;
}

export function getYoucamAuthorizationHeader(): string | null {
  const apiKey = process.env.YOUCAM_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  /*
    Official docs for AI Skin Analysis and AI Clothes v2 endpoints use
    BearerAuthenticationV2 with direct API key auth:
    Authorization: Bearer YOUR_API_KEY

    The secret key is intentionally not used here because these specific v2
    task endpoints do not require key+secret signing in the published spec.
  */
  return `Bearer ${apiKey}`;
}
