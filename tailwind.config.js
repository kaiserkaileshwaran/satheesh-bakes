/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bakery: {
          brown: '#6F4E37',
          'brown-dark': '#4A3324',
          'brown-light': '#8B654B',
          cream: '#FFF8F0',
          'cream-dark': '#F5E6D3',
          chocolate: '#3E2723',
          'chocolate-light': '#5D4037',
          gold: '#D4A017',
          'gold-light': '#F3C649',
          amber: '#F4A261',
          beige: '#F5E6D3',
          surface: '#FAF4ED',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        warm: '0 4px 20px -2px rgba(111, 78, 55, 0.12), 0 2px 6px -1px rgba(111, 78, 55, 0.08)',
        'warm-lg': '0 10px 30px -4px rgba(62, 39, 35, 0.18), 0 4px 10px -2px rgba(62, 39, 35, 0.1)',
        glow: '0 0 25px rgba(212, 160, 23, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
