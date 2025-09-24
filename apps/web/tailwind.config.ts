/**
 * Tailwind CSS configuration for the DLStarter web application.
 * 
 * This configuration extends the default Tailwind theme with:
 * - Custom design tokens from packages/ui/styles/tokens.css
 * - Geist font family integration
 * - Comprehensive typography scale
 * - Systematic spacing scale
 * - shadcn/ui compatible color system
 * - Dark mode support via class strategy
 * 
 * @see https://tailwindcss.com/docs/configuration
 * @see packages/ui/styles/tokens.css - Design token definitions
 */
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * Tailwind CSS configuration object with design system extensions.
 * 
 * Key features:
 * - Dark mode via 'class' strategy (add .dark to html element)
 * - Content scanning for web app and shared UI components
 * - Extended theme with custom design tokens
 * - Font family integration with Geist fonts
 * - Typography scale from 12px to 48px
 * - Line height system for text rhythm
 * - Spacing scale from 4px to 80px
 * - shadcn/ui standard color tokens
 * - Legacy token compatibility
 */
const config: Config = {
  /** Enable dark mode via class strategy */
  darkMode: 'class',
  
  /** Content paths for Tailwind to scan for class usage */
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  theme: {
    extend: {
      /**
       * Font family configuration using Geist fonts.
       * 
       * - sans: Geist Sans for body text and UI
       * - mono: Geist Mono for code blocks and technical content
       * 
       * Falls back to system defaults if fonts fail to load.
       */
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
      },
      
      /**
       * Typography scale using design tokens.
       * 
       * Scale progression: 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px
       * Based on 1.25 modular scale for harmonious typography hierarchy.
       */
      fontSize: {
        xs: 'var(--font-size-xs)',     // 12px
        sm: 'var(--font-size-sm)',     // 14px  
        base: 'var(--font-size-base)', // 16px
        lg: 'var(--font-size-lg)',     // 18px
        xl: 'var(--font-size-xl)',     // 20px
        '2xl': 'var(--font-size-2xl)', // 24px
        '3xl': 'var(--font-size-3xl)', // 30px
        '4xl': 'var(--font-size-4xl)', // 36px
        '5xl': 'var(--font-size-5xl)', // 48px
      },
      
      /**
       * Line height system for optimal text rhythm.
       * 
       * - tight: 1.25 - for large headings
       * - normal: 1.5 - for body text  
       * - relaxed: 1.75 - for comfortable reading
       */
      lineHeight: {
        tight: 'var(--line-height-tight)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
      },
      
      /**
       * Systematic spacing scale using design tokens.
       * 
       * Scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 80px
       * Provides consistent spacing for margins, padding, and gaps.
       */
      spacing: {
        xs: 'var(--space-xs)',     // 4px
        sm: 'var(--space-sm)',     // 8px
        md: 'var(--space-md)',     // 16px
        lg: 'var(--space-lg)',     // 24px
        xl: 'var(--space-xl)',     // 32px
        '2xl': 'var(--space-2xl)', // 48px
        '3xl': 'var(--space-3xl)', // 64px
        '4xl': 'var(--space-4xl)', // 80px
      },
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