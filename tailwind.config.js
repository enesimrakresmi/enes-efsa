/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        night: "#0d0e12",
        smoke: "#13151a",
        ash: "#1b1e25",
        roseSoft: "#93b7ff",
        roseDeep: "#6f8cff"
      },
      boxShadow: {
        glow: "0 0 36px rgba(147, 183, 255, 0.24)"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseRing: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)", opacity: "0.9" },
          "50%": { transform: "translate(-50%, -50%) scale(1.16)", opacity: "0.55" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.7s ease both",
        pulseRing: "pulseRing 1.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
