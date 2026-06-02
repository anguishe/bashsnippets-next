import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        bg2: '#161b22',
        bg3: '#1c2128',
        border: '#30363d',
        green: '#39d353',
        'green-dim': '#1a4a2e',
        amber: '#e3b341',
        'amber-dim': '#3d2f0d',
        blue: '#58a6ff',
        'blue-dim': '#0d2a4a',
        muted: '#8b949e',
        text: '#e6edf3',
      },
      fontFamily: {
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
        heading: ['var(--font-syne)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
