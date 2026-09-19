/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderWidth: {
        '3': '3px',
      },
      colors: {
        claude: {
          amber: "#D97706",
          orange: "#EA580C",
          rust: "#C2410C",
          cream: "#FAF6F0",
          card: "#FFFDF9",
          dark: "#181512",
          surface: "#231E1A",
          muted: "#8C7E72",
        },
        mc: {
          border: "#1E1915",
          redstone: "#DC2626",
          emerald: "#059669",
          lapis: "#2563EB",
          gold: "#EAB308",
          amethyst: "#7C3AED",
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px #1E1915',
        'pixel-lg': '6px 6px 0px 0px #1E1915',
        'pixel-sm': '2px 2px 0px 0px #1E1915',
        'pixel-orange': '4px 4px 0px 0px #EA580C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      animation: {
        'bounce-slow': 'bounce 2.5s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
};
