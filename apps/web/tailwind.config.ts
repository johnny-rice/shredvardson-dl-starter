import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(var(--bg))',
        surface: 'hsl(var(--surface))',
        overlay: 'hsl(var(--overlay))',
        text: 'hsl(var(--text))',
        'text-muted': 'hsl(var(--text-muted))',
        border: 'hsl(var(--border))',
        primary: 'hsl(var(--primary))',
        'primary-contrast': 'hsl(var(--primary-contrast))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        'radius-sm': 'var(--radius-sm)',
        'radius-md': 'var(--radius-md)', 
        'radius-lg': 'var(--radius-lg)',
      },
      transitionTimingFunction: {
        'ease-std': 'var(--ease-std)',
      },
      transitionDuration: {
        'dur-1': 'var(--dur-1)',
        'dur-2': 'var(--dur-2)',
      },
    },
  },
  plugins: [],
};

export default config;