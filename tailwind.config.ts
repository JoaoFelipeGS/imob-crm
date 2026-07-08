import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#080B14",
        panel: "#0F1526",
        panel2: "#141B31",
        border: "#22304F",
        cyan: {
          DEFAULT: "#00E5C7",
          soft: "#5FF5E0",
          dim: "#0B4A44",
        },
        violet: {
          DEFAULT: "#7C5CFF",
          soft: "#A594FF",
          dim: "#2A2159",
        },
        ink: {
          DEFAULT: "#E7ECFA",
          muted: "#8A93B3",
          faint: "#5B6485",
        },
        success: "#34D399",
        warn: "#FBBF24",
        danger: "#FB7185",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,229,199,0.15), 0 0 24px rgba(0,229,199,0.12)",
        glowViolet: "0 0 0 1px rgba(124,92,255,0.18), 0 0 24px rgba(124,92,255,0.14)",
        panel: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 30px rgba(0,0,0,0.35)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
