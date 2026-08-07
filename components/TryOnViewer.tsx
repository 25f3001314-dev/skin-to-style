"use client";

import { useState } from "react";

type TryOnViewerProps = {
  resultUrl: string | null;
  loading: boolean;
  onTryOn: (input: { garmentFile: File | null; garmentUrl: string }) => Promise<void>;
};

// आपकी पसंद के सभी नए ऑप्शंस और रंग यहाँ जोड़ दिए गए हैं
const presetGarments = [
  { label: "Deep Teal Blazer", url: "https://images.unsplash.com/photo-1592878849122-d09fae1ee79c?auto=format&fit=crop&w=800&q=80" },
  { label: "Navy Knit", url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" },
  { label: "Cool Taupe Trench", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80" },
  { label: "Forest Green Jacket", url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80" },
  { label: "Camel Overcoat", url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80" },
  { label: "Olive Utility Shirt", url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80" },
  { label: "Ivory Silk Top", url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80" },
  { label: "Terracotta Cardigan", url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80" },
  { label: "Warm Beige Sweater", url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80" }
];

export function TryOnViewer({ resultUrl, loading, onTryOn }: TryOnViewerProps) {
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [garmentUrl, setGarmentUrl] = useState<string>(presetGarments[0].url);
  const [previewLocalUrl, setPreviewLocalUrl] = useState<string | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Choose Garment & Matching Colors</h3>
        
        {/* Presets Grid */}
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {presetGarments.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setGarmentUrl(item.url);
                setGarmentFile(null);
                setPreviewLocalUrl(null);
              }}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                garmentUrl === item.url && !garmentFile
                  ? "border-teal-600 bg-teal-50 text-teal-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs font-medium text-slate-500">or upload your own garment image</p>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setGarmentFile(file);
            if (file) {
              setGarmentUrl("");
              // लोकल फाइल का प्रीव्यू दिखाने के लिए URL बनाएँ ताकि एरर न आए
              setPreviewLocalUrl(URL.createObjectURL(file));
            } else {
              setPreviewLocalUrl(null);
            }
          }}
          className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => onTryOn({ garmentFile, garmentUrl })}
          className="mt-5 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60 shadow-md"
        >
          {loading ? "Rendering Try-On..." : "Generate Virtual Try-On"}
        </button>
      </div>

      <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Try-On Preview</h3>
        <div className="mt-4">
          {(() => {
            // सुरक्षित इमेज सलेक्शन (ताकि कभी भी खाली स्ट्रिंग या undefined न जाए)
            const displayImage = resultUrl || previewLocalUrl || garmentUrl || presetGarments[0].url;

            return (
              <div className="relative h-[520px] w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                <img src={displayImage} alt="Virtual try-on result" className="h-full w-full object-cover" />

                <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-semibold text-white shadow">
                  <div className={`h-3 w-3 rounded-full border-2 border-white ${loading ? "border-t-transparent animate-spin" : ""}`} />
                  <span>Virtual Overlay Active</span>
                </div>

                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
                      <p className="text-sm font-medium text-white">Rendering virtual overlay...</p>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}