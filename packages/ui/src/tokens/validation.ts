/**
 * Token Validation Utilities
 *
 * Utilities for validating and enforcing design token usage
 * in components and styles.
 *
 * @module tokens/validation
 */

import { tokens } from './index';

/**
 * Token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Check if a color value is a valid token
 */
export function isValidColorToken(value: string): boolean {
  // Check if it's a CSS variable reference
  if (value.startsWith('var(--')) {
    return true;
  }

  // Check if it's using hsl() with our token values
  const allColors = [
    ...Object.values(tokens.colors.neutral),
    ...Object.values(tokens.colors.brand),
    ...Object.values(tokens.colors.success),
    ...Object.values(tokens.colors.warning),
    ...Object.values(tokens.colors.error),
    ...Object.values(tokens.colors.info),
  ];

  return allColors.some((color) => color === value);
}

/**
 * Check if a spacing value is a valid token
 */
export function isValidSpacingToken(value: string): boolean {
  // Check if it's a CSS variable reference
  if (value.startsWith('var(--spacing-')) {
    return true;
  }

  return Object.values(tokens.spacing).some((spacing) => spacing === value);
}

/**
 * Check if a font size is a valid token
 */
export function isValidFontSizeToken(value: string): boolean {
  // Check if it's a CSS variable reference
  if (value.startsWith('var(--font-size-')) {
    return true;
  }

  return Object.values(tokens.typography.fontSize).some((fontSize) => fontSize === value);
}

/**
 * Check if a border radius is a valid token
 */
export function isValidBorderRadiusToken(value: string): boolean {
  // Check if it's a CSS variable reference
  if (value.startsWith('var(--radius')) {
    return true;
  }

  return Object.values(tokens.borderRadius).some((radius) => radius === value);
}

/**
 * Check if a shadow is a valid token
 */
export function isValidShadowToken(value: string): boolean {
  return Object.values(tokens.shadows).some((shadow) => shadow === value);
}

/**
 * Validate a className string for token compliance
 */
export function validateClassName(className: string): TokenValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Split className into individual classes
  const classes = className.split(/\s+/).filter(Boolean);

  for (const cls of classes) {
    // Check for hardcoded colors (hex, rgb, etc.)
    if (cls.match(/#[0-9a-f]{3,6}/i)) {
      errors.push(`Hardcoded hex color found: ${cls}. Use color tokens instead.`);
    }

    if (cls.match(/rgb\(/i)) {
      errors.push(`Hardcoded RGB color found: ${cls}. Use color tokens instead.`);
    }

    // Check for arbitrary Tailwind values
    if (cls.match(/\[[^\]]+\]/)) {
      const arbitraryValue = cls.match(/\[([^\]]+)\]/)?.[1];
      if (arbitraryValue) {
        // Check if it's a spacing value
        if (cls.match(/^(p|m|gap|space|top|right|bottom|left|inset)-\[/)) {
          if (!arbitraryValue.includes('var(--')) {
            warnings.push(`Arbitrary spacing value: ${cls}. Consider using spacing tokens.`);
          }
        }

        // Check if it's a color value
        if (cls.match(/^(text|bg|border|ring)-\[/)) {
          if (!arbitraryValue.includes('var(--')) {
            errors.push(`Arbitrary color value: ${cls}. Use color tokens instead.`);
          }
        }

        // Check if it's a font size
        if (cls.match(/^text-\[.*px\]/)) {
          warnings.push(`Arbitrary font size: ${cls}. Use typography tokens instead.`);
        }
      }
    }

    // Check for non-standard spacing values
    if (cls.match(/^(p|m|gap|space)-((?!0|px|0\.5|1|2|3|4|5|6|8|10|12|16|20|24).+)$/)) {
      const match = cls.match(/^(p|m|gap|space)-(.+)$/);
      if (match && !Object.keys(tokens.spacing).includes(match[2])) {
        warnings.push(`Non-standard spacing value: ${cls}. Use spacing tokens.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract non-compliant values from a style object
 */
export function extractNonCompliantStyles(styles: Record<string, string>): string[] {
  const nonCompliant: string[] = [];

  for (const [property, value] of Object.entries(styles)) {
    // Check color properties
    if (
      property.match(/color|background|border|outline/i) &&
      !value.startsWith('var(--') &&
      !value.startsWith('transparent') &&
      !value.startsWith('currentColor')
    ) {
      if (!isValidColorToken(value)) {
        nonCompliant.push(`${property}: ${value}`);
      }
    }

    // Check spacing properties
    if (
      property.match(/padding|margin|gap|width|height|top|right|bottom|left/i) &&
      !value.startsWith('var(--') &&
      !value.match(/^(auto|inherit|initial|unset|0)$/)
    ) {
      if (!isValidSpacingToken(value)) {
        nonCompliant.push(`${property}: ${value}`);
      }
    }

    // Check font size
    if (property === 'fontSize' && !value.startsWith('var(--')) {
      if (!isValidFontSizeToken(value)) {
        nonCompliant.push(`${property}: ${value}`);
      }
    }

    // Check border radius
    if (property.match(/radius/i) && !value.startsWith('var(--')) {
      if (!isValidBorderRadiusToken(value)) {
        nonCompliant.push(`${property}: ${value}`);
      }
    }

    // Check shadows
    if (property.match(/shadow/i) && value !== 'none' && !value.startsWith('var(--')) {
      if (!isValidShadowToken(value)) {
        nonCompliant.push(`${property}: ${value}`);
      }
    }
  }

  return nonCompliant;
}

/**
 * Get token suggestion for a non-compliant value
 */
export function getTokenSuggestion(property: string, value: string): string | undefined {
  // For colors
  if (property.match(/color|background|border/i)) {
    // Try to find a similar color
    if (value.match(/#|rgb|hsl/)) {
      return 'Use semantic color tokens like text-foreground, bg-background, border-border';
    }
  }

  // For spacing
  if (property.match(/padding|margin|gap|width|height/i)) {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      // Convert px to rem
      const remValue = numericValue / 16;
      const closestToken = Object.entries(tokens.spacing).find(
        ([, tokenValue]) => parseFloat(tokenValue) === remValue
      );
      if (closestToken) {
        return `Use spacing token: ${closestToken[0]} (${closestToken[1]})`;
      }
    }
  }

  // For font sizes
  if (property === 'fontSize') {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      const remValue = numericValue / 16;
      const closestToken = Object.entries(tokens.typography.fontSize).find(
        ([, tokenValue]) => parseFloat(tokenValue) === remValue
      );
      if (closestToken) {
        return `Use font size token: text-${closestToken[0]}`;
      }
    }
  }

  return undefined;
}

/**
 * Validate component props for token compliance
 */
export function validateComponentProps(
  componentName: string,
  props: Record<string, unknown>
): TokenValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check className prop
  if (props.className && typeof props.className === 'string') {
    const classNameValidation = validateClassName(props.className);
    errors.push(...classNameValidation.errors);
    warnings.push(...classNameValidation.warnings);
  }

  // Check style prop
  if (props.style && typeof props.style === 'object' && props.style !== null) {
    const nonCompliant = extractNonCompliantStyles(props.style as Record<string, string>);
    for (const style of nonCompliant) {
      const [property, value] = style.split(': ');
      const suggestion = getTokenSuggestion(property, value);
      errors.push(
        `Non-compliant style in ${componentName}: ${style}${suggestion ? `. ${suggestion}` : ''}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Token compliance report
 */
export interface TokenComplianceReport {
  totalComponents: number;
  compliantComponents: number;
  compliancePercentage: number;
  errors: Array<{
    component: string;
    errors: string[];
    warnings: string[];
  }>;
}

/**
 * Generate a token compliance report for multiple components
 */
export function generateComplianceReport(
  components: Array<{
    name: string;
    props: Record<string, unknown>;
  }>
): TokenComplianceReport {
  const report: TokenComplianceReport = {
    totalComponents: components.length,
    compliantComponents: 0,
    compliancePercentage: 0,
    errors: [],
  };

  for (const component of components) {
    const validation = validateComponentProps(component.name, component.props);

    if (validation.valid) {
      report.compliantComponents++;
    }

    if (!validation.valid || validation.warnings.length > 0) {
      report.errors.push({
        component: component.name,
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }
  }

  report.compliancePercentage = (report.compliantComponents / report.totalComponents) * 100;

  return report;
}

export default {
  isValidColorToken,
  isValidSpacingToken,
  isValidFontSizeToken,
  isValidBorderRadiusToken,
  isValidShadowToken,
  validateClassName,
  extractNonCompliantStyles,
  getTokenSuggestion,
  validateComponentProps,
  generateComplianceReport,
};
