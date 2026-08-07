"use client";

import { useMemo, useState } from "react";
import { HarmonyScore } from "@/components/HarmonyScore";
import { PhotoUpload } from "@/components/PhotoUpload";
import { SkinResultCard } from "@/components/SkinResultCard";
import { StepIndicator } from "@/components/StepIndicator";
import { TryOnViewer } from "@/components/TryOnViewer";
import { getRecommendedPalette } from "@/lib/ruleEngine";
import type { SkinAnalysisResponse, VtoResponse } from "@/lib/types";

const steps = ["Upload Photo", "Skin Analysis Results", "Virtual Try-On"];

export default function HomePage() {
  const [step, setStep] = useState<number>(1);
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<SkinAnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [tryOnLoading, setTryOnLoading] = useState<boolean>(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");

  const palette = useMemo(() => {
    if (!analysis) {
      return null;
    }
    return getRecommendedPalette(analysis.profile);
  }, [analysis]);

 
  async function analyzeSkin() {
    if (!userPhoto) {
      setNotice("Please upload a user photo first.");
      return;
    }

    setNotice("");
    setAnalyzing(true);

    try {
      const body = new FormData();
      body.append("image", userPhoto);

      const startResponse = await fetch("/api/skin-analysis", {
        method: "POST",
        body
      });

      const startPayload = await startResponse.json();

      if (!startResponse.ok || !startPayload.taskId) {
        throw new Error(startPayload.error ?? "Skin analysis request failed.");
      }

      const taskId = startPayload.taskId as string;
      setNotice("Analyzing your skin… this can take up to a couple of minutes.");

      const maxAttempts = 60;
      const intervalMs = 3000;
      let result: SkinAnalysisResponse | null = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));

        const pollResponse = await fetch(`/api/skin-analysis/status?taskId=${encodeURIComponent(taskId)}`, {
          cache: "no-store"
        });
        const pollPayload = await pollResponse.json();

        if (pollPayload.status === "success") {
          result = pollPayload.result as SkinAnalysisResponse;
          break;
        }

        if (pollPayload.status === "failed" || pollPayload.status === "error") {
          throw new Error(pollPayload.error ?? "Skin analysis failed.");
        }
      }

      if (!result) {
        throw new Error("Analysis timed out. Please try again.");
      }

      setNotice("");
      setAnalysis(result);
      setStep(2);
    } catch (error) {
      setAnalysis(null);
      setNotice(
        error instanceof Error
          ? error.message
          : "Analysis service unreachable. Live YouCam skin data is required to continue."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleTryOn(input: { garmentFile: File | null; garmentUrl: string }) {
    if (!userPhoto) {
      setNotice("Upload a user photo before virtual try-on.");
      return;
    }

    setTryOnLoading(true);
    setNotice("");

    try {
      const body = new FormData();
      body.append("userImage", userPhoto);

      if (input.garmentFile) {
        body.append("garmentImage", input.garmentFile);
      } else {
        body.append("garmentUrl", input.garmentUrl);
      }

      const response = await fetch("/api/apparel-vto", {
        method: "POST",
        body
      });

      if (!response.ok) {
        throw new Error("Try-on request failed.");
      }

      const payload = (await response.json()) as VtoResponse;
      setTryOnResult(payload.tryOnImageUrl);

      if (payload.source === "mock") {
        setNotice("Demo Mode: Operating on verified fallback dataset to ensure uninterrupted testing.");
      }
    } catch {
      setTryOnResult("https://placehold.co/900x1200/png?text=MirrorFit+Fallback+Preview");
      setNotice("VTO service unreachable, showing cached mock preview.");
    } finally {
      setTryOnLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 pb-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-teal-700">YouCam Skin AI + Apparel VTO</p>
        <h1 className="mt-2 font-[var(--font-fraunces)] text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
          MirrorFit
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
          Skin metrics come from AI, but final styling decisions are made by a deterministic TypeScript
          rule engine for transparent, repeatable wardrobe recommendations.
        </p>
      </header>

      <StepIndicator currentStep={step} labels={steps} />

      {notice ? (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          {notice}
        </p>
      ) : null}

      <section className="mt-6 space-y-6">
        {step === 1 ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <PhotoUpload file={userPhoto} onFileSelect={setUserPhoto} label="Upload User Photo" />
            <div className="card flex flex-col justify-between">
              <div>
                <h2 className="font-[var(--font-fraunces)] text-2xl font-semibold text-slate-900">
                  Step 1: Analyze Skin
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  We send only the photo to the server route, which calls YouCam Skin AI. Raw outputs then
                  flow into our fixed rule table for styling recommendations.
                </p>
              </div>
              <button
                type="button"
                onClick={analyzeSkin}
                disabled={analyzing}
                className="mt-5 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
              >
                {analyzing ? "Analyzing..." : "Run Skin Analysis"}
              </button>
            </div>
          </div>
        ) : null}

        {step >= 2 && analysis && palette ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <SkinResultCard profile={analysis.profile} palette={palette} source={analysis.source} />
              <HarmonyScore profile={analysis.profile} palette={palette} />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Continue to Virtual Try-On
              </button>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <TryOnViewer resultUrl={tryOnResult} loading={tryOnLoading} onTryOn={handleTryOn} />
        ) : null}
      </section>
    </main>
  );
}
