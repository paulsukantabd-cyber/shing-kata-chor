/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        bengali: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      colors: {
        night: {
          900: '#0B120F',
          800: '#101B17',
          700: '#17251C',
          600: '#1E3227',
          500: '#27402F',
        },
        gold: {
          DEFAULT: '#E8B85C',
          soft: '#F3D79B',
          deep: '#B98A34',
        },
        clay: '#9B6545',
        olive: '#687A52',
        cream: '#F3E8CF',
        danger: '#C95745',
        moss: '#4C7A3A',
        ink: '#2A1A10',
      },
      boxShadow: {
        ember: '0 0 35px rgba(232, 184, 92, 0.35)',
        village: '0 22px 60px rgba(9, 15, 12, 0.5)',
        'ember-sm': '0 0 18px rgba(232, 184, 92, 0.28)',
        plank: '0 10px 26px rgba(10, 8, 4, 0.45)',
      },
      backgroundImage: {
        moonlight:
          'radial-gradient(circle at 50% 12%, rgba(250, 240, 220, 0.16), transparent 42%)',
        'wood-grain':
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 2px, transparent 2px 7px), linear-gradient(180deg, #6B4A2E 0%, #4C3520 100%)',
        parchment:
          'radial-gradient(120% 90% at 50% 0%, rgba(243, 232, 207, 0.10), transparent 60%), linear-gradient(180deg, rgba(23, 37, 28, 0.96), rgba(12, 20, 16, 0.98))',
        vignette: 'radial-gradient(120% 80% at 50% 40%, transparent 40%, rgba(4, 9, 7, 0.75) 100%)',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translate3d(0, 0, 0)', opacity: '0.3' },
          '50%': { transform: 'translate3d(14px, -10px, 0)', opacity: '0.65' },
          '100%': { transform: 'translate3d(-8px, 12px, 0)', opacity: '0.3' },
        },
        flicker: {
          '0%, 100%': { opacity: '0.82', transform: 'scale(1)' },
          '45%': { opacity: '1', transform: 'scale(1.035)' },
          '70%': { opacity: '0.9', transform: 'scale(0.99)' },
        },
        firefly: {
          '0%': { transform: 'translate(0, 0)', opacity: '0' },
          '20%': { opacity: '0.9' },
          '80%': { opacity: '0.5' },
          '100%': { transform: 'translate(14px, -26px)', opacity: '0' },
        },
        floatUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(-6px)', opacity: '1' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-1.6deg)' },
          '50%': { transform: 'rotate(1.6deg)' },
        },
        steam: {
          '0%': { transform: 'translateY(6px) scaleX(0.9)', opacity: '0' },
          '40%': { opacity: '0.55' },
          '100%': { transform: 'translateY(-26px) scaleX(1.25)', opacity: '0' },
        },
        popIn: {
          '0%': { transform: 'scale(0.86)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        drift: 'drift 12s ease-in-out infinite alternate',
        flicker: 'flicker 2.8s ease-in-out infinite',
        firefly: 'firefly 7s linear infinite',
        floatUp: 'floatUp 320ms ease-out both',
        sway: 'sway 6s ease-in-out infinite',
        steam: 'steam 4.5s ease-out infinite',
        popIn: 'popIn 240ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
    },
  },
  plugins: [],
}
