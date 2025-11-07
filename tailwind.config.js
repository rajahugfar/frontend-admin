/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sacasino.tech Theme Colors
        primary: {
          50: '#fef7e7',
          100: '#fdebc4',
          200: '#fbd89d',
          300: '#f9c576',
          400: '#f7b659',
          500: '#f5a73c', // Main orange/gold
          600: '#f39c30',
          700: '#e88e24',
          800: '#de8018',
          900: '#cf6600',
        },
        // Dark green theme from sacasino
        dark: {
          50: '#f0f4f1',
          100: '#d9e5db',
          200: '#b3ccb7',
          300: '#8db393',
          400: '#679a6f',
          500: '#0a1810', // Main dark green background
          600: '#0d1f14', // Slightly lighter
          700: '#0f2318', // Medium green
          800: '#112719', // Darker green
          900: '#0a1810', // Darkest
        },
        // Green accent colors
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Main green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Yellow/Gold for highlights
        yellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308', // Main yellow
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Keep existing colors for compatibility
        gold: {
          50: '#fefaf3',
          100: '#fdf4e1',
          200: '#fae8c3',
          300: '#f6dba5',
          400: '#f3cf87',
          500: '#C4A962',
          600: '#b89a56',
          700: '#9d8349',
          800: '#826c3c',
          900: '#67552f',
        },
        brown: {
          50: '#f5f1ed',
          100: '#e6ded5',
          200: '#cec0b0',
          300: '#b5a28b',
          400: '#9d8466',
          500: '#8B7355',
          600: '#7d674d',
          700: '#6a5741',
          800: '#574735',
          900: '#443729',
        },
        admin: {
          bg: '#1a1410',
          card: '#2a2219',
          border: '#3a3129',
          hover: '#3a3129',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        display: ['Kanit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(245, 167, 60, 0.5)',
        'glow-lg': '0 0 40px rgba(245, 167, 60, 0.6)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse': 'spin-reverse 6s linear infinite',
        'loading-bar': 'loading-bar 2s ease-in-out infinite',
        'shimmer-fast': 'shimmer-fast 1.5s infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'scale-hover': 'scale-hover 0.3s ease-out',
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 167, 60, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 167, 60, 0.8)' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'loading-bar': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
        'shimmer-fast': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%': { boxShadow: '0 0 20px rgba(234, 179, 8, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(234, 179, 8, 0.8)' },
        },
        'scale-hover': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
