/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        black:  '#060505',
        gold:   '#c9933a',
        'gold-light': '#f5d485',
        'gold-dim':   '#5a3f15',
        'gold-border':'rgba(201,147,58,0.25)',
        cream:  '#f0e6c8',
        dim:    '#4a4030',
        dim2:   '#6b5c3a',
      },
      fontFamily: {
        pixel:  ['"Press Start 2P"', 'monospace'],
        cinzel: ['"Cinzel Decorative"', 'cursive'],
        mono:   ['"Share Tech Mono"', 'monospace'],
        serif:  ['"EB Garamond"', 'serif'],
      },
      animation: {
        'glow':      'glow 2.5s ease-in-out infinite',
        'coinflip':  'coinFlip 3.5s ease-in-out infinite',
        'spin-slow': 'spin 6s linear infinite',
        'float':     'float 3s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'blink':     'blink 1s step-end infinite',
        'ticker':    'ticker 25s linear infinite',
      },
      keyframes: {
        glow: {
          '0%,100%': { textShadow: '4px 4px 0 #5a3f15, 0 0 30px rgba(201,147,58,0.4)' },
          '50%':     { textShadow: '4px 4px 0 #5a3f15, 0 0 60px rgba(201,147,58,0.7)' },
        },
        coinFlip: {
          '0%,100%': { transform: 'rotateY(0deg)' },
          '45%':     { transform: 'rotateY(90deg) scale(0.9)' },
          '50%':     { transform: 'rotateY(180deg)' },
          '95%':     { transform: 'rotateY(270deg) scale(0.9)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.4' },
        },
        blink: { '50%': { opacity: '0' } },
        ticker: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
