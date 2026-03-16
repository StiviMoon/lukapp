import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        display: ["var(--font-syne)", "sans-serif"],
        nums: ["var(--font-space-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        lime: {
          DEFAULT: "#C8D400",
          dark: "#A8B200",
          light: "#DCE930",
        },
        purple: {
          brand: "#6600CC",
          bright: "#7A00F5",
          muted: "#B18AF7",
        },
        n: {
          0: "#FFFFFF",
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
          950: "#030712",
        },
        bg: {
          DEFAULT: "var(--bg)",
          card: "var(--bg-card)",
          elevated: "var(--bg-elevated)",
        },
        fg: {
          DEFAULT: "var(--text)",
          muted: "var(--muted)",
        },
        border: {
          DEFAULT: "var(--border)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          border: "var(--accent-border)",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        float2: "float 3.5s ease-in-out infinite 0.9s",
        pulse2: "pulse2 2s ease-in-out infinite",
        shimmer: "shimmer 4.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse2: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-250% center" },
          "100%": { backgroundPosition: "250% center" },
        },
      },
      boxShadow: {
        lime: "0 12px 28px rgba(200,212,0,0.25)",
        purple: "0 12px 28px rgba(102,0,204,0.3)",
        nav: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset",
        "card-hover": "0 20px 48px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
