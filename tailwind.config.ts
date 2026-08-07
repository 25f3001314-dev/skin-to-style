import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        surf: "#f4f8f7",
        accent: "#0f766e",
        accentSoft: "#ccfbf1",
        warm: "#f59e0b"
      },
      boxShadow: {
        glow: "0 10px 50px -25px rgba(15, 118, 110, 0.45)"
      },
      backgroundImage: {
        halo: "radial-gradient(circle at 20% 20%, rgba(20,184,166,0.2), transparent 40%), radial-gradient(circle at 80% 0%, rgba(245,158,11,0.18), transparent 45%)"
      }
    }
  },
  plugins: []
};

export default config;
