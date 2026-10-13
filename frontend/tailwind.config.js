/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#080d1a',
          navy: '#0b1329',
          card: '#0f172a',
          surface: '#131e36',
          border: '#1e293b',
          borderHighlight: '#334155',
          cyan: '#06b6d4',
          cyanBright: '#22d3ee',
          teal: '#14b8a6',
          fraud: '#ef4444',
          fraudBg: 'rgba(239, 68, 68, 0.12)',
          legit: '#10b981',
          legitBg: 'rgba(16, 185, 129, 0.12)',
          warning: '#f59e0b',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
