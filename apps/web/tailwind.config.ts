/**
 * Tailwind CSS configuration for the DLStarter web application.
 *
 * This configuration uses the shared @dl-starter/tailwind-config preset
 * with app-specific content paths and font configuration.
 *
 * @see @dl-starter/tailwind-config - Shared design system preset
 * @see packages/ui/styles/tokens.css - Design token definitions
 */
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import { dlStarterPreset } from '@dl-starter/tailwind-config';

/**
 * Tailwind CSS configuration object extending the shared preset.
 *
 * Inherits from dlStarterPreset:
 * - Dark mode via 'class' strategy
 * - CSS variable-based design tokens
 * - shadcn/ui compatible color system
 * - Systematic spacing and typography scales
 *
 * App-specific additions:
 * - Geist font family integration
 * - Content paths for this app and shared packages
 */
const config: Config = {
  presets: [dlStarterPreset],

  /** Content paths for Tailwind to scan for class usage */
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', '../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}'],

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
    },
  },
  plugins: [],
};

export default config;
