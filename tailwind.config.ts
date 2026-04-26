import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic surface tokens
        surface: "#ffffff",
        canvas: "#FAF9F7",
        // Ink / text
        ink: {
          DEFAULT: "#1C1917",
          soft: "#57534E",
          muted: "#A8A29E",
        },
        // Borders
        line: "#E7E5E4",
        // Accent — Anthropic coral
        accent: {
          DEFAULT: "#C96442",
          hover: "#B85A3A",
          soft: "#FEF3EE",
          border: "rgba(201,100,66,0.25)",
        },
        // Alert states (kept as Tailwind built-ins but included for reference)
      },
      fontFamily: {
        sans: [
          "Söhne",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.08em" }],
      },
      boxShadow: {
        card: "0 1px 3px rgba(28,25,23,.05), 0 1px 2px rgba(28,25,23,.07)",
        "card-lg": "0 4px 12px rgba(28,25,23,.06), 0 1px 3px rgba(28,25,23,.08)",
        btn: "0 1px 2px rgba(28,25,23,.12)",
      },
      borderRadius: {
        card: "16px",
        metric: "12px",
      },
      maxWidth: {
        page: "1024px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 250ms ease-out",
        "slide-in-right": "slide-in-right 300ms ease-out",
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
  safelist: [
    // Dynamic colors used in charts and bars
    "bg-accent",
    "bg-red-400",
    "bg-orange-400",
    "bg-accent/70",
  ],
};

export default config;
