import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Surfaces ───────────────────────────────────────────
        canvas:  "#F6F3EC",   // --paper  (parchment)
        surface: "#FBFAF6",   // --surface (slightly lifted)
        bone:    "#ECE5D5",   // --bone

        // ─── Ink / text ─────────────────────────────────────────
        ink: {
          DEFAULT: "#1A1714", // near-black warm
          soft:    "#4A413A", // secondary
          muted:   "#8B7F73", // muted
          faint:   "#B8AC9D", // placeholder / hairline
        },

        // ─── Borders ────────────────────────────────────────────
        line: {
          DEFAULT: "#DAD2C2",
          soft:    "#E8E1D2",
        },

        // ─── Accent — deep terracotta ────────────────────────────
        accent: {
          DEFAULT: "#B8472A",
          hover:   "#8E3416",
          soft:    "#F7F1ED",   // very light, clean neutral
          border:  "#DCC8BD",   // softer border
        },

        // ─── Functional palette ──────────────────────────────────
        ochre: {
          DEFAULT: "#B8893A",
          soft:    "#F9F5E8",   // very light, clean neutral
          border:  "#E5D9C0",   // softer border
          ink:     "#7A5C28",   // warm amber-brown
        },
        moss: {
          DEFAULT: "#5C6E3F",
          soft:    "#F3F4ED",   // very light, barely tinted
          border:  "#D0D5C5",   // softer border
          ink:     "#3D4A29",
        },
        rust: {
          DEFAULT: "#8E3416",
          soft:    "#F9F2ED",   // very light, clean neutral
          border:  "#E5D0C8",   // softer border
          ink:     "#7D4535",   // warm brown, not bright red
        },
      },

      fontFamily: {
        serif: ["var(--font-serif)", "Instrument Serif", "Georgia", "serif"],
        sans:  ["var(--font-sans)",  "Inter",            "system-ui",   "sans-serif"],
        mono:  ["var(--font-mono)",  "JetBrains Mono",   "ui-monospace", "monospace"],
      },

      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.08em" }],
      },

      boxShadow: {
        card:      "0 1px 2px rgba(26,23,20,.04), 0 6px 20px -8px rgba(26,23,20,.08)",
        "card-lg": "0 1px 2px rgba(26,23,20,.04), 0 12px 32px -10px rgba(26,23,20,.14)",
        btn:       "0 1px 2px rgba(26,23,20,.12)",
      },

      borderRadius: {
        card:   "16px",
        metric: "10px",
      },

      maxWidth: {
        page:  "1024px",
        shell: "1280px",
      },

      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.7" },
          "50%":       { opacity: "1" },
        },
        "draw-bar": {
          from: { transform: "scaleX(0)" },
          to:   { transform: "scaleX(1)" },
        },
      },

      animation: {
        "fade-in":        "fade-in 250ms ease-out",
        "fade-in-up":     "fade-in-up 500ms cubic-bezier(.2,.8,.2,1) both",
        "slide-in-right": "slide-in-right 300ms ease-out",
        "pulse-soft":     "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "draw-bar":       "draw-bar 700ms cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-accent", "bg-accent/70", "bg-accent/10",
    "bg-rust",   "bg-moss",      "bg-ochre",
    "bg-rust-soft", "bg-moss-soft", "bg-ochre-soft",
    "bg-red-400", "bg-orange-400",
    "text-rust", "text-moss",   "text-accent",
    "text-rust-ink", "text-moss-ink", "text-ochre-ink",
    "border-rust", "border-moss",
    "border-rust-border", "border-moss-border", "border-ochre-border",
  ],
};

export default config;
