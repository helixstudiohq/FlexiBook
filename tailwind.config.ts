import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 50px -12px rgba(129, 140, 248, 0.55)",
        "glow-sm": "0 0 30px -8px rgba(129, 140, 248, 0.45)",
        "glow-emerald": "0 0 40px -10px rgba(52, 211, 153, 0.45)",
        card: "0 8px 30px rgba(2, 6, 23, 0.55)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "gradient-x": {
          to: { backgroundPosition: "200% center" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out 1.2s infinite",
        "gradient-x": "gradient-x 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
