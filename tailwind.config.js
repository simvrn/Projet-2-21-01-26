/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark palette - Luxe silencieux
        noir: {
          50: '#f7f7f6',
          100: '#e3e3e0',
          200: '#c7c7c1',
          300: '#a3a39a',
          400: '#818177',
          500: '#67675e',
          600: '#51514a',
          700: '#43433d',
          800: '#383834',
          900: '#1a1a18',
          950: '#0d0d0c',
        },
        // Gold accent - Or mat discret
        gold: {
          50: '#faf8f3',
          100: '#f3efe3',
          200: '#e6ddc5',
          300: '#d5c69e',
          400: '#c4ac78',
          500: '#b8995d',
          600: '#a78347',
          700: '#8b6a3c',
          800: '#725636',
          900: '#5e472f',
          950: '#352618',
        },
        // Warm ivory - Ivoire chaud
        ivory: {
          50: '#fdfcfa',
          100: '#f9f7f3',
          200: '#f3efe7',
          300: '#e9e3d7',
          400: '#dcd3c2',
          500: '#cfc2ad',
          600: '#b5a48a',
          700: '#968571',
          800: '#7a6d5d',
          900: '#655a4d',
          950: '#352f28',
        },
        // Surfaces - Noir profond à anthracite
        surface: {
          DEFAULT: '#0a0a09',
          light: '#121211',
          lighter: '#1a1a18',
          card: '#141413',
          elevated: '#1e1e1c',
        },
        // Text colors
        text: {
          primary: '#f3efe7',
          secondary: '#a3a39a',
          muted: '#67675e',
          accent: '#c4ac78',
        },
      },
      fontFamily: {
        // Elegant serif for titles
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        // Refined sans-serif for content
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // Keep mono for specific uses (numbers, code)
        mono: ['SF Mono', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #0a0a09 0%, #141413 50%, #0a0a09 100%)',
        'gradient-subtle': 'linear-gradient(180deg, rgba(196, 172, 120, 0.03) 0%, transparent 100%)',
        'glow-warm': 'radial-gradient(ellipse at center, rgba(196, 172, 120, 0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(196, 172, 120, 0.15)',
        'glow-sm': '0 0 20px rgba(196, 172, 120, 0.1)',
        'glow-lg': '0 0 60px rgba(196, 172, 120, 0.2)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'soft-lg': '0 8px 40px rgba(0, 0, 0, 0.5)',
        'inner-soft': 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.05)',
        'elevated': '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 1px rgba(196, 172, 120, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      letterSpacing: {
        'premium': '0.05em',
        'wide': '0.1em',
        'wider': '0.15em',
      },
    },
  },
  plugins: [],
}
