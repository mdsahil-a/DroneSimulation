/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Government Surveillance Canvas Palette
        canvas: '#F4F6FA',
        card: '#FFFFFF',
        sidebar: '#FFFFFF',
        heading: '#0F172A',
        body: '#334155',

        // Backward compatibility single aliases
        ink: '#F4F6FA',
        panel: '#FFFFFF',
        line: '#E2E8F0',
        sand: '#0F172A',
        dim: '#64748B',
        ok: '#10B981',
        alert: '#EF4444',
        info: '#2563EB',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        panel: '0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -2px rgba(0, 0, 0, 0.03)',
        dropdown: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}