"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const trendData = [
  { skinType: "oily", coolNeutrals: 74, earthyWarm: 41, jewelCool: 58 },
  { skinType: "dry", coolNeutrals: 55, earthyWarm: 69, jewelCool: 43 },
  { skinType: "combination", coolNeutrals: 68, earthyWarm: 63, jewelCool: 62 },
  { skinType: "sensitive", coolNeutrals: 81, earthyWarm: 47, jewelCool: 52 }
];

const colors = ["#0f766e", "#d97706", "#2563eb"];

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.28em] text-teal-700">Retailer Insight Mode</p>
        <h1 className="mt-2 font-[var(--font-fraunces)] text-4xl font-semibold text-slate-900">
          MirrorFit B2B Analytics
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
          Mock trend dashboard showing skin-type segments against deterministic recommended color families.
          Retail teams can optimize inventory by what the rule engine consistently approves.
        </p>
      </header>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Skin-Type vs Recommended Color Trends</h2>
        <div className="mt-6 h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey="skinType" tick={{ fill: "#334155", fontSize: 12 }} />
              <YAxis tick={{ fill: "#334155", fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="coolNeutrals" name="Cool Neutrals" radius={[6, 6, 0, 0]}>
                {trendData.map((entry, index) => (
                  <Cell key={`${entry.skinType}-cool`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
              <Bar dataKey="earthyWarm" name="Earthy Warm" fill="#d97706" radius={[6, 6, 0, 0]} />
              <Bar dataKey="jewelCool" name="Jewel Cool" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}
