/**
 * Design System Tokens
 *
 * Centralized token definitions for the design system.
 * These tokens provide a single source of truth for design values
 * and enable consistent theming across the application.
 *
 * @module tokens
 */

/**
 * Color tokens for the design system
 */
export const colors = {
  // Neutral colors (gray scale)
  neutral: {
    0: 'hsl(0 0% 100%)',
    50: 'hsl(210 20% 98%)',
    100: 'hsl(210 15% 95%)',
    200: 'hsl(210 15% 88%)',
    300: 'hsl(210 15% 75%)',
    400: 'hsl(210 15% 60%)',
    500: 'hsl(210 15% 45%)',
    600: 'hsl(210 15% 35%)',
    700: 'hsl(210 15% 25%)',
    800: 'hsl(210 15% 18%)',
    900: 'hsl(210 15% 12%)',
    950: 'hsl(210 15% 8%)',
  },

  // Brand colors
  brand: {
    50: 'hsl(222 100% 97%)',
    100: 'hsl(222 100% 94%)',
    200: 'hsl(222 100% 88%)',
    300: 'hsl(222 95% 78%)',
    400: 'hsl(222 90% 65%)',
    500: 'hsl(222 85% 55%)',
    600: 'hsl(222 75% 48%)',
    700: 'hsl(222 70% 40%)',
    800: 'hsl(222 65% 32%)',
    900: 'hsl(222 60% 25%)',
    950: 'hsl(222 55% 18%)',
  },

  // Semantic colors
  success: {
    50: 'hsl(120 60% 97%)',
    500: 'hsl(120 60% 45%)',
    600: 'hsl(120 60% 35%)',
    700: 'hsl(120 60% 25%)',
  },

  warning: {
    50: 'hsl(45 100% 97%)',
    500: 'hsl(45 100% 50%)',
    600: 'hsl(45 100% 40%)',
    700: 'hsl(45 100% 30%)',
  },

  error: {
    50: 'hsl(0 100% 97%)',
    500: 'hsl(0 84% 60%)',
    600: 'hsl(0 84% 50%)',
    700: 'hsl(0 84% 40%)',
  },

  info: {
    50: 'hsl(200 100% 97%)',
    500: 'hsl(200 100% 45%)',
    600: 'hsl(200 100% 35%)',
    700: 'hsl(200 100% 25%)',
  },
} as const;

/**
 * Spacing tokens following an 8px base grid
 */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const;

/**
 * Typography tokens
 */
export const typography = {
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

/**
 * Border radius tokens
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  default: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

/**
 * Shadow tokens
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

/**
 * Animation tokens
 */
export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },

  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

/**
 * Breakpoint tokens for responsive design
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Z-index tokens for layering
 */
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  // Semantic layers
  dropdown: '1000',
  sticky: '1100',
  overlay: '1200',
  modal: '1300',
  popover: '1400',
  tooltip: '1500',
} as const;

/**
 * Semantic token mapping for light theme
 */
export const lightTheme = {
  background: colors.neutral[50],
  foreground: colors.neutral[800],

  card: colors.neutral[0],
  cardForeground: colors.neutral[800],

  popover: colors.neutral[0],
  popoverForeground: colors.neutral[800],

  primary: colors.brand[600],
  primaryForeground: colors.neutral[0],

  secondary: colors.neutral[100],
  secondaryForeground: colors.neutral[800],

  muted: colors.neutral[100],
  mutedForeground: colors.neutral[600],

  accent: colors.neutral[100],
  accentForeground: colors.neutral[800],

  destructive: colors.error[500],
  destructiveForeground: colors.neutral[50],

  border: colors.neutral[200],
  input: colors.neutral[200],
  ring: colors.brand[500],
} as const;

/**
 * Semantic token mapping for dark theme
 */
export const darkTheme = {
  background: colors.neutral[950],
  foreground: colors.neutral[50],

  card: colors.neutral[900],
  cardForeground: colors.neutral[50],

  popover: colors.neutral[900],
  popoverForeground: colors.neutral[50],

  primary: colors.brand[500],
  primaryForeground: colors.brand[950],

  secondary: colors.neutral[800],
  secondaryForeground: colors.neutral[50],

  muted: colors.neutral[800],
  mutedForeground: colors.neutral[400],

  accent: colors.neutral[800],
  accentForeground: colors.neutral[50],

  destructive: colors.error[600],
  destructiveForeground: colors.neutral[50],

  border: colors.neutral[700],
  input: colors.neutral[700],
  ring: colors.brand[500],
} as const;

/**
 * Export all tokens as a single object
 */
export const tokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
} as const;

/**
 * Type definitions for token categories
 */
export type ColorToken =
  | keyof typeof colors.neutral
  | keyof typeof colors.brand
  | keyof typeof colors.success
  | keyof typeof colors.warning
  | keyof typeof colors.error
  | keyof typeof colors.info;
export type SpacingToken = keyof typeof spacing;
export type FontSizeToken = keyof typeof typography.fontSize;
export type FontWeightToken = keyof typeof typography.fontWeight;
export type LineHeightToken = keyof typeof typography.lineHeight;
export type LetterSpacingToken = keyof typeof typography.letterSpacing;
export type BorderRadiusToken = keyof typeof borderRadius;
export type ShadowToken = keyof typeof shadows;
export type AnimationDurationToken = keyof typeof animation.duration;
export type AnimationEasingToken = keyof typeof animation.easing;
export type BreakpointToken = keyof typeof breakpoints;
export type ZIndexToken = keyof typeof zIndex;

/**
 * Type for theme tokens
 */
export type ThemeTokens = typeof lightTheme | typeof darkTheme;

export default tokens;