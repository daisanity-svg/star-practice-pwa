import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8EC',
        butter: '#FFD95A',
        mint: '#DFF8EF',
        skysoft: '#DCEEFF',
        grape: '#2387F7',
        ink: '#12304F'
      },
      boxShadow: {
        soft: '0 18px 45px rgba(35, 135, 247, 0.14)',
        card: '0 14px 34px rgba(18, 48, 79, 0.1)'
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-8px) scale(1.03)' }
        },
        'float-card': {
          '0%, 100%': { transform: 'translateY(0) rotate(-1deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' }
        }
      },
      animation: {
        'bounce-soft': 'bounce-soft 1.8s ease-in-out infinite',
        'float-card': 'float-card 2.8s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
