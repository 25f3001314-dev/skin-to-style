"use client";
import { useState } from "react";

type AnalysisState =
  | { phase: "idle" }
  | { phase: "uploading" }
  | { phase: "analyzing" }
  | { phase: "success"; result: any }
  | { phase: "error"; message: string };

export function useSkinAnalysis() {
  const [state, setState] = useState<AnalysisState>({ phase: "idle" });

  async function runAnalysis(file: File | null, imageUrl?: string) {
    setState({ phase: "uploading" });

    const formData = new FormData();
    if (imageUrl) formData.append("imageUrl", imageUrl);
    if (file) formData.append("image", file);

    let taskId: string;
    try {
      const startRes = await fetch("/api/skin-analysis", { method: "POST", body: formData });
      const startJson = await startRes.json();

      if (!startRes.ok || !startJson.taskId) {
        setState({ phase: "error", message: startJson.error ?? "Analysis start failed" });
        return;
      }
      taskId = startJson.taskId;
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error ? err.message : "Network error" });
      return;
    }

    setState({ phase: "analyzing" });

    const maxAttempts = 60; // 60 * 3s ≈ 3 minute ceiling
    const intervalMs = 3000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, intervalMs));

      try {
        const pollRes = await fetch(`/api/skin-analysis/status?taskId=${encodeURIComponent(taskId)}`);
        const pollJson = await pollRes.json();

        if (pollJson.status === "success") {
          setState({ phase: "success", result: pollJson.result });
          return;
        }
        if (pollJson.status === "failed" || pollJson.status === "error") {
          setState({ phase: "error", message: pollJson.error ?? "Analysis failed" });
          return;
        }
        // "running" -> loop continues
      } catch (err) {
        console.warn("Poll attempt failed, retrying", err); // ek glitch pe turant mat rukna
      }
    }

    setState({ phase: "error", message: "Analysis timed out after 3 minutes." });
  }

  return { state, runAnalysis };
}