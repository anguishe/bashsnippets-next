import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        border: 'var(--border)',
        green: 'var(--green)',
        'green-dim': 'var(--green-dim)',
        amber: 'var(--amber)',
        'amber-dim': '#3d2f0d',
        blue: 'var(--blue)',
        'blue-dim': 'var(--blue-dim)',
        muted: 'var(--muted)',
        text: 'var(--text)',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'monospace'],
        heading: ['var(--font-heading)', 'Syne', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
