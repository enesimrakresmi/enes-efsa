/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "sans-serif"],
        handwriting: ["var(--font-handwriting)", "cursive"]
      },
      colors: {
        espresso: {
          950: "#090807",
          900: "#0f0d0c",
          800: "#161312",
          700: "#1e1a18",
          600: "#2a2421",
          500: "#3d3430"
        },
        amberGold: {
          light: "#f7d7aa",
          DEFAULT: "#e0a96d",
          hover: "#ebb77d",
          deep: "#b8824a",
          dark: "#7c542b"
        },
        dustyRose: {
          light: "#f0b6c1",
          DEFAULT: "#d47a88",
          hover: "#df8a97",
          deep: "#a84e5d",
          dark: "#692b35"
        },
        parchment: {
          50: "#fbf8f5",
          100: "#f5f0eb",
          200: "#ece3d8",
          300: "#ded4c7",
          400: "#b8aea5",
          500: "#8c8279"
        }
      },
      boxShadow: {
        glowAmber: "0 0 35px rgba(224, 169, 109, 0.18)",
        glowRose: "0 0 35px rgba(212, 122, 136, 0.18)",
        polaroid: "0 14px 40px -10px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)",
        warmCard: "0 10px 30px -5px rgba(10, 8, 7, 0.6), inset 0 1px 0 rgba(245, 240, 235, 0.05)"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        floatSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.8", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        floatSoft: "floatSoft 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

