import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "china-red": "#C41E3A",
        "china-red-600": "#9E1629",
        "china-red-100": "#FDEDEF",
        gold: "#D4AF37",
        "gold-100": "#F8EFCB",
        jade: "#1B4D3E",
        "jade-100": "#D4E4DD",
        "sky-blue": "#4A90D9",
        "sky-blue-100": "#DEEBF7",
        cream: "#F5F0EB",
        "paper-50": "#FBF8F4",
        "paper-100": "#F5F0EB",
        "paper-200": "#EFE8DF",
        "paper-300": "#E8E0D4",
        "paper-400": "#D4CFC9",
        "ink-900": "#1A1A2E",
        "ink-700": "#3A3A48",
        "ink-500": "#6B6B78",
        "ink-display": "#2B1810",
        brown: "#6B3410",
        "brown-dark": "#4A2309",
        "brown-light": "#8B4513",
        "brown-mute": "#8C7B6A",
        "near-black": "#1A1A2E",
        coral: "#E8735A",
        "coral-100": "#FBE3DC",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        xl: "20px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        ticket:
          "0 10px 28px rgba(26, 26, 46, 0.10), 0 2px 6px rgba(26, 26, 46, 0.05)",
        warm: "0 2px 6px rgba(26, 26, 46, 0.06), 0 1px 2px rgba(26, 26, 46, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
