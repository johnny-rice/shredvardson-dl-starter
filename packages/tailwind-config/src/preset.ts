/**
 * DL Starter Tailwind CSS preset
 *
 * Provides a shared Tailwind configuration with:
 * - CSS variable-based design tokens
 * - Dark mode via class strategy  
 * - shadcn/ui compatible color system
 * - Systematic spacing and typography scales
 * - Token-driven design system architecture
 *
 * This preset ensures consistent styling across all applications and packages
 * by mapping Tailwind utilities to semantic CSS variables defined in the
 * design token system.
 *
 * @see packages/ui/styles/tokens.css - Token definitions
 * @example
 * ```typescript
 * // In your tailwind.config.ts
 * import { dlStarterPreset } from '@dl-starter/tailwind-config'
 * 
 * export default {
 *   presets: [dlStarterPreset],
 *   content: ['./src/**\/*.{js,ts,jsx,tsx}']
 * }
 * ```
 */
import type { Config } from 'tailwindcss';

export const dlStarterPreset = {
  darkMode: 'class' as const,
  content: [],
  theme: {
    extend: {
      colors: {
        // shadcn/ui standard color tokens
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
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontSize: {
        xs: ['var(--font-size-xs)', { lineHeight: 'var(--line-height-normal)' }],
        sm: ['var(--font-size-sm)', { lineHeight: 'var(--line-height-normal)' }],
        base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
        lg: ['var(--font-size-lg)', { lineHeight: 'var(--line-height-normal)' }],
        xl: ['var(--font-size-xl)', { lineHeight: 'var(--line-height-tight)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-tight)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-tight)' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
