import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0f1e',
        card: '#1a1f2e',
        primary: '#3ecf8e',
        secondary: '#8b5cf6',
        text: '#e2e8f0',
        muted: '#64748b',
        border: '#2a2f3e',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        fira: ['Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
