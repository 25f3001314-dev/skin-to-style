"use client";

import { useState, useEffect } from "react";

// लोडिंग के दौरान दिखने वाले प्रोफेशनल स्टेप्स
const loadingSteps = [
  "Uploading high-resolution facial image...",
  "Scanning facial geometry and skin zones...",
  "Analyzing oiliness, pores, and texture...",
  "Calculating skin age and tone match...",
  "Almost ready! Generating your custom color profile..."
];

export function LoadingProgress({ loading }: { loading: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentStep(0);
      return;
    }

    // हर 3 सेकंड में अगला मैसेज दिखाएं
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 bg-teal-50/80 rounded-xl border border-teal-100 my-4">
      {/* एनिमेटेड स्पिनर */}
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent" />
      
      {/* डायनामिक टेक्स्ट जो बदलता रहेगा */}
      <p className="text-sm font-semibold text-teal-900 transition-all duration-300 text-center">
        {loadingSteps[currentStep]}
      </p>

      {/* छोटा प्रोग्रेस बार या नोट */}
      <span className="text-xs text-slate-500 text-center">
        Please wait, AI is processing your deep skin analysis (approx. 10-15s)...
      </span>
    </div>
  );
}