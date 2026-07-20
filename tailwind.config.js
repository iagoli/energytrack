/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Tema claro aplicado via classe .light no <html> (escuro é o padrão :root).
  darkMode: ['class', ':root:not(.light)'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Tokens de tema via CSS variables (RGB channels) para suportar alpha.
        space: {
          DEFAULT: 'rgb(var(--space) / <alpha-value>)',
          deep: 'rgb(var(--space-deep) / <alpha-value>)',
          panel: 'rgb(var(--space-panel) / <alpha-value>)',
          raised: 'rgb(var(--space-raised) / <alpha-value>)',
          line: 'rgb(var(--space-line) / <alpha-value>)',
        },
        cloud: {
          DEFAULT: 'rgb(var(--cloud) / <alpha-value>)',
          soft: 'rgb(var(--cloud-soft) / <alpha-value>)',
          muted: 'rgb(var(--cloud-muted) / <alpha-value>)',
        },
        apple: {
          50: '#e8f1fd',
          100: '#d2e6fc',
          200: '#a6ccf9',
          300: '#6fa8f4',
          400: '#2f8be8',
          500: '#0071e3',
          600: '#0066cc',
          700: '#0058b0',
          800: '#004e9e',
          900: '#003f80',
          DEFAULT: '#0071e3',
        },
        galaxy: {
          DEFAULT: '#0071e3',
          50: '#e8f1fd',
          100: '#d2e6fc',
          200: '#a6ccf9',
          300: '#6fa8f4',
          400: '#2f8be8',
          500: '#0071e3',
          600: '#0066cc',
        },
        violet: { galaxy: '#af52de' },
        // Surface translúcido — definido como variável para mudar com o tema.
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          soft: 'rgb(var(--surface-soft) / <alpha-value>)',
          line: 'rgb(var(--surface-line) / <alpha-value>)',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.18), 0 8px 30px rgba(0,0,0,0.14)',
        'card-lg': '0 2px 6px rgba(0,0,0,0.16), 0 24px 60px rgba(0,0,0,0.18)',
        nav: '0 0.5px 0 rgba(0,0,0,0.06), 0 8px 30px rgba(0,0,0,0.10)',
        glow: '0 0 0 1px rgba(0,113,227,0.4), 0 0 40px rgba(0,113,227,0.25)',
      },
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        '4xl': '0',
        full: '0',
      },
      backgroundImage: {
        galaxy: 'linear-gradient(120deg, #0071e3 0%, #0a84ff 100%)',
        'galaxy-soft': 'linear-gradient(120deg, #e8f1fd 0%, #f0f7ff 100%)',
        'text-apple': 'linear-gradient(100deg, #6fa8f4 0%, #0071e3 45%, #0a84ff 100%)',
      },
      keyframes: {
        sheen: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'float-slow': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
      },
      animation: {
        sheen: 'sheen 8s ease infinite',
        'fade-in': 'fade-in 0.8s ease both',
        'float-slow': 'float-slow 7s ease-in-out infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
