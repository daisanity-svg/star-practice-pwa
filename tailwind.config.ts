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
        butter: '#FFE9A8',
        mint: '#CFF7DF',
        skysoft: '#DDEBFF',
        grape: '#7257FF',
        ink: '#1F2937'
      },
      boxShadow: {
        soft: '0 18px 45px rgba(62, 58, 89, 0.12)'
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-8px) scale(1.03)' }
        }
      },
      animation: {
        'bounce-soft': 'bounce-soft 1.8s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
