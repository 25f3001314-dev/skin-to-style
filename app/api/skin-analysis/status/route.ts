import { NextResponse } from "next/server";

// --- Types ---
interface YouCamResults {
  redness?: { raw_score?: number; ui_score?: number };
  oiliness?: { raw_score?: number; ui_score?: number };
  skin_type?: string | { whole?: { label?: string; type?: string } };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId query param." }, { status: 400 });
    }

    const apiKey = process.env.YOUCAM_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "YouCam API key missing." }, { status: 500 });
    }

    const baseUrl = (process.env.YOUCAM_BASE_URL || "https://yce-api-01.makeupar.com").replace(/\/$/, "");
    const path = (process.env.YOUCAM_SKIN_PATH || "/s2s/v2.0/task/skin-analysis").trim();
    
    // सुरक्षित URL निर्माण
    const pollUrl = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}/${taskId}`;

    const resp = await fetch(pollUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "<unable to read body>");
      return NextResponse.json({ status: "error", error: text }, { status: 502 });
    }

    const json = await resp.json();
    console.log("🔍 YouCam Raw Response:", JSON.stringify(json, null, 2));
    const status = json?.data?.task_status;

    if (status === "success") {
      const rawResults: YouCamResults = json?.data?.results ?? {};
      const mapped = mapYoucamResultsToSkinAnalysis(rawResults);
      return NextResponse.json({ status: "success", result: mapped });
    }

    
    if (status === "failed" || status === "error") {
      const errorMsg = json?.data?.error || "YouCam AI failed to process this image.";
      return NextResponse.json({ status: "error", error: errorMsg }, { status: 400 });
    }

    return NextResponse.json({ status: "running" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}

// --- Helper Functions ---
function mapYoucamResultsToSkinAnalysis(results: any) {
  // YouCam का डेटा एक 'output' एरे (Array) में आता है
  const outputArray = results?.output || [];

  // Redness ढूँढें
  const rednessData = outputArray.find((item: any) => item.type === "redness");
  const redness = Number(rednessData?.ui_score ?? rednessData?.raw_score ?? 50);

  // Oiliness ढूँढें
  const oilinessData = outputArray.find((item: any) => item.type === "oiliness");
  const oiliness = Number(oilinessData?.ui_score ?? oilinessData?.raw_score ?? 50);

  // Skin Type (Whole Face) ढूँढें
  const skinTypeData = outputArray.find((item: any) => item.type === "skin_type" && item.region === "whole");
  const skinType = String(skinTypeData?.skin_type ?? "Combination");

  const undertone = estimateUndertone(redness, oiliness);
  
  return {
    source: "live",
    profile: { redness, undertone, skinType, confidence: 0.85 },
    colorRanking: {
      bestMatch: ["Camel", "Warm Beige", "Olive", "Terracotta", "Cream"],
      goodSafeMatch: ["Stone", "Mushroom", "Balanced Navy", "Soft White", "Denim Blue"],
      blocked: ["Neon Orange", "Scarlet", "Hot Pink", "Electric Lime", "High-Contrast Black/White"],
    },
  };
}

function estimateUndertone(redness: number, oiliness: number): "warm" | "cool" | "neutral" {
  // यह आपका अपना लॉजिक है कि Redness और Oiliness से Undertone कैसे निकालना है
  if (redness >= 60) return "warm";
  if (oiliness >= 60) return "cool";
  return "neutral";
}