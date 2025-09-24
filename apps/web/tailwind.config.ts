import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn standard tokens
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        // legacy tokens (keep for existing components)
        bg: 'hsl(var(--bg))',
        surface: 'hsl(var(--surface))',
        overlay: 'hsl(var(--overlay))',
        text: 'hsl(var(--text))',
        'text-muted': 'hsl(var(--text-muted))',
        'primary-contrast': 'hsl(var(--primary-contrast))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // legacy
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