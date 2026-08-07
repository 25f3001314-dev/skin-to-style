import type { PaletteResult, SkinProfile } from "@/lib/types";

type SkinResultCardProps = {
  profile: SkinProfile;
  palette: PaletteResult;
  source: "live" | "mock";
};

export function SkinResultCard({ profile, palette, source }: SkinResultCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-fraunces)] text-2xl font-semibold text-slate-900">
          Skin Analysis Summary
        </h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            source === "live" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {source === "live" ? "Live API" : "Mock Fallback"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Redness" value={`${profile.redness}/100`} />
        <Metric label="Undertone" value={profile.undertone} />
        <Metric label="Skin Type" value={profile.skinType} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ListBlock title="Allowed Colors" items={palette.allowedColors} chipClass="bg-teal-50 text-teal-800" />
        <ListBlock title="Blocked Colors" items={palette.blockedColors} chipClass="bg-rose-50 text-rose-700" />
        <ListBlock
          title="Recommended Fabrics"
          items={palette.allowedFabrics}
          chipClass="bg-sky-50 text-sky-800"
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{value}</p>
    </div>
  );
}

function ListBlock({
  title,
  items,
  chipClass
}: {
  title: string;
  items: string[];
  chipClass: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${chipClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
