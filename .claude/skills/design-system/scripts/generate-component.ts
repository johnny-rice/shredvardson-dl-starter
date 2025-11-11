#!/usr/bin/env tsx

/**
 * Component Generator with Guardrails
 * Phase 4: Enhanced with component existence checking
 * Prevents unnecessary duplication of existing shadcn components
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import { checkComponentExists } from './check-component-exists';
import { createSafeComponentPath } from './utils.js';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register Handlebars helpers (same as before)
Handlebars.registerHelper('pascalCase', (str: string) => {
  return str.replace(/(-|_|^)(\w)/g, (_, __, c) => c.toUpperCase());
});

Handlebars.registerHelper('camelCase', (str: string) => {
  const pascal = str.replace(/(-|_|^)(\w)/g, (_, __, c) => c.toUpperCase());
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
});

Handlebars.registerHelper('kebabCase', (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
});

Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper('gt', (a: unknown, b: unknown) => {
  if (typeof a === 'number' && typeof b === 'number') return a > b;
  return false;
});
Handlebars.registerHelper('typeof', (v: unknown) => typeof v);
Handlebars.registerHelper('json', (v: unknown) => JSON.stringify(v, null, 2));

// Type definitions for component registry
interface ComponentRegistryEntry {
  createdAt?: string;
  reason?: string;
  source?: string;
  dependencies?: string[];
  viewerExamples?: number;
  path?: string;
  variants?: string[];
  sizes?: string[];
  features?: string[];
  useCases?: string[];
  [key: string]: unknown;
}

interface ComponentRegistry {
  shadcnComponents: Record<string, ComponentRegistryEntry>;
  customComponents: Record<string, ComponentRegistryEntry>;
  aliases: Record<string, string>;
  [key: string]: unknown;
}

// Interfaces (keeping existing ones)
interface GeneratedFile {
  path: string;
  type: 'component' | 'test' | 'story';
  created: boolean;
  content?: string;
}

interface ValidationResult {
  passed: boolean;
  score: number;
  details: {
    tokenCompliance: number;
    patternAdherence: number;
    accessibility: number;
    testCoverage: number;
  };
  suggestions: string[];
}

interface ComponentConfig {
  name: string;
  variant?: string;
  pattern?: string;
  elementTag?: string;
  elementType?: string;
  htmlElement?: string;
  isForwardRef?: boolean;
  hasChildren?: boolean;
  variants?: Array<{
    name: string;
    options: Record<string, string>;
    default: string;
  }>;
  customProps?: Array<{
    name: string;
    type: string;
    description: string;
    required?: boolean;
    testValue?: unknown;
  }>;
  baseClasses?: string;
  componentDescription?: string;
  accessibilityNotes?: string;
  ariaLabel?: string;
  role?: string;
  hasInteractions?: boolean;
  hasDisabledState?: boolean;
  hasLoadingState?: boolean;
  needsTheme?: boolean;
  needsContrastTest?: boolean;
  hasAriaLabel?: boolean;
  exampleContent?: string;
  exampleProps?: Record<string, unknown>;
  usedTokens?: Array<{ token: string; description: string }>;
  patternFile?: string;
  argTypes?: unknown[];
  defaultArgs?: Record<string, unknown>;
  requiredProps?: Array<{ name: string; testValue: unknown }>;
}

interface ComponentGenerationOutput {
  success: boolean;
  componentName: string;
  variant?: string;
  files: GeneratedFile[];
  validation?: ValidationResult;
  summary: string;
  nextSteps?: string[];
  firstPassAccuracy?: number;
  guardCheck?: {
    blocked: boolean;
    reason?: string;
    suggestion?: string;
    alternatives?: string[];
  };
}

/**
 * Provide default component configuration values for a given pattern name.
 *
 * @param patternName - Identifier of the pattern (for example: `"button"`, `"input"`, `"card"`)
 * @returns A partial ComponentConfig containing pattern-specific defaults; if the pattern is unknown, returns a generic fallback configuration
 */
function loadPatternConfig(patternName: string): Partial<ComponentConfig> {
  const patterns: Record<string, Partial<ComponentConfig>> = {
    button: {
      elementTag: 'button',
      elementType: 'Button',
      htmlElement: 'Button',
      isForwardRef: true,
      hasChildren: true,
      hasInteractions: true,
      hasDisabledState: true,
      baseClasses:
        'inline-flex items-center justify-center rounded-[var(--radius)] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      variants: [
        {
          name: 'variant',
          options: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            outline:
              'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: 'text-primary underline-offset-4 hover:underline',
          },
          default: 'default',
        },
        {
          name: 'size',
          options: {
            default: 'h-10 px-4 py-2',
            sm: 'h-9 rounded-md px-3',
            lg: 'h-11 rounded-md px-8',
            icon: 'h-10 w-10',
          },
          default: 'default',
        },
      ],
      componentDescription: 'A flexible button component with multiple variants and sizes',
      accessibilityNotes:
        'Ensures proper focus management and keyboard navigation. Uses semantic button element.',
      role: 'button',
      needsContrastTest: true,
      patternFile: 'buttons.md',
    },
    input: {
      elementTag: 'input',
      elementType: 'Input',
      htmlElement: 'Input',
      isForwardRef: true,
      hasChildren: false,
      hasDisabledState: true,
      baseClasses:
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      componentDescription: 'A styled input component for forms',
      accessibilityNotes:
        'Should be paired with a Label component. Supports all standard input attributes.',
      patternFile: 'forms.md',
    },
    card: {
      elementTag: 'div',
      elementType: 'Div',
      htmlElement: 'Div',
      isForwardRef: true,
      hasChildren: true,
      baseClasses: 'rounded-lg border bg-card text-card-foreground shadow-sm',
      componentDescription: 'A card container component',
      accessibilityNotes:
        'Consider adding role="article" or role="region" with aria-label for semantic grouping.',
      patternFile: 'layout.md',
    },
  };

  // Generic safe fallback for unknown patterns
  const fallback: Partial<ComponentConfig> = {
    elementTag: 'div',
    elementType: 'Div',
    htmlElement: 'Div',
    isForwardRef: true,
    hasChildren: true,
    baseClasses: '',
    componentDescription: 'Generic container component',
    accessibilityNotes: 'Uses a semantic element; ensure appropriate roles/ARIA as needed.',
  };

  return patterns[patternName] || fallback;
}

// Template loading and generation functions (keeping existing)
function loadTemplate(templateName: string): string {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }
  throw new Error(`Template not found: ${templateName}`);
}

function generateFromTemplate(config: ComponentConfig, templateName: string): string {
  const template = loadTemplate(templateName);
  const compiledTemplate = Handlebars.compile(template);
  return compiledTemplate(config);
}

/**
 * Evaluates a component file and produces validation scores and actionable suggestions.
 *
 * @param componentPath - Filesystem path to the component `.tsx` file to validate.
 * @returns ValidationResult containing:
 *  - `passed`: whether the overall score meets the pass threshold,
 *  - `score`: the aggregated numeric score,
 *  - `details`: per-category numeric scores (`tokenCompliance`, `patternAdherence`, `accessibility`, `testCoverage`),
 *  - `suggestions`: an array of guidance strings to improve the component.
 */
async function validateComponent(componentPath: string): Promise<ValidationResult> {
  const content = fs.readFileSync(componentPath, 'utf-8');

  const tokenCompliance = calculateTokenCompliance(content);
  const patternAdherence = content.includes('cn(') ? 90 : 60;
  const accessibility = calculateAccessibilityScore(content);
  const testPath = componentPath.replace('.tsx', '.test.tsx');
  const testCoverage = fs.existsSync(testPath) ? 80 : 0;

  const avgScore = (tokenCompliance + patternAdherence + accessibility + testCoverage) / 4;

  return {
    passed: avgScore >= 80,
    score: avgScore,
    details: {
      tokenCompliance,
      patternAdherence,
      accessibility,
      testCoverage,
    },
    suggestions: generateSuggestions(
      tokenCompliance,
      patternAdherence,
      accessibility,
      testCoverage
    ),
  };
}

function calculateTokenCompliance(content: string): number {
  let score = 100;
  if (/bg-(red|blue|green|yellow|purple|pink|indigo)-\d+/.test(content)) {
    score -= 20;
  }
  if (/p[xy]?-\d+/.test(content) && !/var\(--spacing/.test(content)) {
    score -= 10;
  }
  if (/var\(--/.test(content)) {
    score = Math.min(100, score + 10);
  }
  return Math.max(0, score);
}

function calculateAccessibilityScore(content: string): number {
  let score = 70;
  if (/aria-(label|describedby|labelledby)/.test(content)) {
    score += 10;
  }
  if (/role=/.test(content)) {
    score += 10;
  }
  if (/<(button|nav|main|header|footer|article|section)/.test(content)) {
    score += 10;
  }
  return Math.min(100, score);
}

function generateSuggestions(
  tokenCompliance: number,
  patternAdherence: number,
  accessibility: number,
  testCoverage: number
): string[] {
  const suggestions: string[] = [];

  if (tokenCompliance < 100) {
    suggestions.push('Replace hardcoded colors with design tokens');
  }
  if (patternAdherence < 90) {
    suggestions.push('Ensure component follows established patterns');
  }
  if (accessibility < 90) {
    suggestions.push('Add proper ARIA attributes');
  }
  if (testCoverage < 70) {
    suggestions.push('Add comprehensive test coverage');
  }

  return suggestions;
}

/**
 * Generate a component and associated files from CLI-style arguments, enforcing guardrails and running validation.
 *
 * This function interprets CLI arguments (component name, optional variant, and flags such as
 * `--force-new`, `--extend-from=...`, `--reason=...`), determines an appropriate pattern, applies
 * existence/similarity guardrails, renders templates to produce component and test files, updates the
 * component registry when applicable, and validates the generated output.
 *
 * @param args - Array of CLI-style arguments: [componentName, variant?, ...flags]. Flags supported include `--force-new`, `--extend-from=<name>`, and `--reason=<text>`.
 * @returns A ComponentGenerationOutput describing success, generated files, validation results, guard check details, and recommended next steps.
 */
async function generateComponent(args: string[]): Promise<ComponentGenerationOutput> {
  const componentName = args[0];
  const variant = args[1];

  if (!componentName) {
    return {
      success: false,
      componentName: 'Unknown',
      files: [],
      summary: 'Component name is required',
      nextSteps: ['Provide a component name: /design generate <name> [variant]'],
    };
  }

  // ========== NEW GUARDRAIL LOGIC ==========

  // Check if forcing new component creation
  const forceNew = args.includes('--force-new');
  const extendFrom = args.find((arg) => arg.startsWith('--extend-from='))?.split('=')[1];
  const reason = args.find((arg) => arg.startsWith('--reason='))?.split('=')[1];

  // Check if component exists
  const checkResult = checkComponentExists(componentName);

  // Block if exact match found (unless forced)
  if (checkResult.exists && !forceNew) {
    console.error(`\n⚠️  Component "${componentName}" already exists!`);
    console.error(`📦 Type: ${checkResult.type}`);

    if (checkResult.importPath) {
      console.error(`📍 Import: ${checkResult.importPath}`);
    }

    if (checkResult.variants) {
      console.error(`🎨 Variants: ${checkResult.variants.join(', ')}`);
    }

    console.error(`\n💡 ${checkResult.suggestion}`);

    return {
      success: false,
      componentName,
      files: [],
      summary: `Component already exists in ${checkResult.type === 'shadcn' ? 'shadcn/ui' : 'custom components'}`,
      guardCheck: {
        blocked: true,
        reason: checkResult.suggestion,
        alternatives: [
          'Import and use the existing component',
          'Extend with a variant if needed',
          `Use --force-new --reason="..." if truly necessary`,
        ],
      },
      nextSteps: [
        ...(checkResult.importPath
          ? [`import { ${componentName} } from "${checkResult.importPath}"`]
          : ['Use the existing custom component (no import path available)']),
        'Or extend the existing component with new variants',
      ],
    };
  }

  // Warn about similar components (unless forced or domain-specific)
  if (
    !checkResult.exists &&
    checkResult.similarComponents &&
    checkResult.similarComponents.length > 0 &&
    !forceNew &&
    !checkResult.isDomainSpecific
  ) {
    console.error('\n🤔 Similar components found:');
    checkResult.similarComponents.forEach((similar) => {
      console.error(`  - ${similar.name} (${similar.similarity}% similar - ${similar.reason})`);
    });

    console.error('\n💡 Consider:');
    console.error(
      `  1. Use existing: import { ${checkResult.similarComponents[0].name} } from "@ui/components/ui/${checkResult.similarComponents[0].name}"`
    );
    console.error(
      `  2. Extend existing: /design generate ${componentName} --extend-from=${checkResult.similarComponents[0].name}`
    );
    console.error(`  3. Force new: /design generate ${componentName} --force-new --reason="..."`);

    // If not forced, require confirmation
    if (!extendFrom) {
      return {
        success: false,
        componentName,
        files: [],
        summary: 'Similar components exist. Please confirm your intention.',
        guardCheck: {
          blocked: true,
          reason: `Similar to existing: ${checkResult.similarComponents[0].name}`,
          suggestion: checkResult.suggestion,
          alternatives: checkResult.similarComponents.map(
            (s) => `Use or extend ${s.name} (${s.reason})`
          ),
        },
        nextSteps: [
          'Review similar components',
          'Add --extend-from=<component> to extend',
          'Add --force-new --reason="..." to create new',
        ],
      };
    }
  }

  // If forcing new, require a reason
  if (forceNew && !reason) {
    console.error('\n⚠️  Creating new component requires justification');
    console.error(`📝 Please explain why existing components won't work`);
    console.error(`\nUsage: /design generate ${componentName} --force-new --reason="..."`);

    return {
      success: false,
      componentName,
      files: [],
      summary: 'Justification required for new component',
      guardCheck: {
        blocked: true,
        reason: 'Missing justification for new component',
      },
      nextSteps: ['Add --reason="..." to explain why this component is needed'],
    };
  }

  // Log the decision
  if (forceNew) {
    console.error(`\n✅ Creating new component with justification: "${reason}"`);
  } else if (extendFrom) {
    console.error(`\n✅ Extending ${extendFrom} to create ${componentName}`);
  } else if (checkResult.isDomainSpecific) {
    console.error(`\n✅ Creating domain-specific component: ${componentName}`);
  }

  // ========== END GUARDRAIL LOGIC ==========

  console.error(`\n✨ Generating ${componentName}${variant ? ` (${variant})` : ''}...`);

  // Determine pattern using registry for intelligent fallback
  let pattern = extendFrom;
  if (!pattern) {
    try {
      const registryPath = path.join(__dirname, '..', 'component-registry.json');
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      const normalized = componentName.toLowerCase();

      // Check aliases first
      const aliased = registry.aliases?.[normalized];
      // Then check known shadcn components
      const known = registry.shadcnComponents?.[normalized] ? normalized : undefined;

      pattern = aliased || known || 'button'; // Fallback to button pattern
    } catch (_e) {
      // Fallback to substring matching if registry unavailable
      pattern = componentName.toLowerCase().includes('button')
        ? 'button'
        : componentName.toLowerCase().includes('input')
          ? 'input'
          : componentName.toLowerCase().includes('card')
            ? 'card'
            : componentName.toLowerCase().includes('dialog')
              ? 'dialog'
              : 'button';
    }
  }

  // Load pattern configuration
  const patternConfig = loadPatternConfig(pattern);

  // Build component configuration
  const config: ComponentConfig = {
    name: componentName,
    variant,
    pattern,
    ...patternConfig,
    exampleContent: patternConfig.hasChildren ? `Example ${componentName}` : undefined,
    exampleProps: variant ? { variant } : {},
    usedTokens: [
      { token: '--radius', description: 'Border radius for rounded corners' },
      { token: '--spacing-4', description: 'Standard padding/margin' },
      { token: '--color-primary', description: 'Primary brand color' },
    ],
  };

  const files: GeneratedFile[] = [];

  try {
    // Generate component file
    const componentContent = generateFromTemplate(config, 'component');

    // Use shared utility for safe path creation
    const { kebabName, basePath: componentDir } = createSafeComponentPath(componentName);
    const componentPath = path.join(componentDir, `${kebabName}.tsx`);

    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    fs.writeFileSync(componentPath, componentContent);
    files.push({
      path: componentPath,
      type: 'component',
      created: true,
      content: componentContent,
    });

    console.error(`  ✓ Created component: ${componentPath}`);

    // Generate test file (only if template exists)
    try {
      const testContent = generateFromTemplate(config, 'test');
      const testPath = path.join(componentDir, `${kebabName}.test.tsx`);
      fs.writeFileSync(testPath, testContent);
      files.push({
        path: testPath,
        type: 'test',
        created: true,
        content: testContent,
      });
      console.error(`  ✓ Created test: ${testPath}`);
    } catch (_e) {
      console.error('  ⚠️  Test template not found, skipping test generation');
    }

    // Note: Storybook removed in favor of /design viewer
    // For visual examples, see .claude/skills/design-system/viewer/examples/

    // Update component registry if new component
    if (forceNew || checkResult.isDomainSpecific) {
      updateComponentRegistry(componentName, reason || 'Domain-specific component', extendFrom);
    }

    // Validate generated component
    const validation = await validateComponent(componentPath);

    console.error('\n📊 Validation Results:');
    console.error(`  Token compliance: ${validation.details.tokenCompliance}%`);
    console.error(`  Pattern adherence: ${validation.details.patternAdherence}%`);
    console.error(`  Accessibility: ${validation.details.accessibility}%`);
    console.error(`  Test coverage: ${validation.details.testCoverage}%`);
    console.error(`  Overall score: ${validation.score}%`);

    if (validation.suggestions.length > 0) {
      console.error('\n💡 Suggestions:');
      validation.suggestions.forEach((s) => console.error(`  - ${s}`));
    }

    const firstPassAccuracy = validation.score;

    return {
      success: validation.passed,
      componentName,
      variant,
      files,
      validation,
      firstPassAccuracy,
      summary: `Generated ${componentName} component with ${Math.round(firstPassAccuracy)}% first-pass accuracy`,
      guardCheck: {
        blocked: false,
        reason: forceNew ? `Created with justification: ${reason}` : undefined,
      },
      nextSteps: validation.passed
        ? ['Component is production-ready']
        : ['Apply suggested improvements', 'Run validation again'],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ✗ Error: ${errorMessage}`);
    return {
      success: false,
      componentName,
      variant,
      files,
      summary: `Failed to generate component: ${errorMessage}`,
      nextSteps: ['Check error message', 'Ensure templates exist'],
    };
  }
}

/**
 * Adds a new entry for a custom component to the repository's component-registry.json if one does not already exist.
 *
 * Writes the updated registry to disk (atomic write) and records the creation date, reason, and optional `extendsFrom` metadata.
 *
 * @param componentName - The component name to register (case-insensitive key)
 * @param reason - A brief justification for why the component is being added
 * @param extendsFrom - Optional name of an existing component this one extends or is derived from
 */
function updateComponentRegistry(componentName: string, reason: string, extendsFrom?: string) {
  try {
    const registryPath = path.join(__dirname, '..', 'component-registry.json');

    // Initialize registry if file doesn't exist
    let registry: ComponentRegistry = { shadcnComponents: {}, customComponents: {}, aliases: {} };
    if (fs.existsSync(registryPath)) {
      registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8')) as ComponentRegistry;
    }

    // Ensure customComponents exists
    if (!registry.customComponents) {
      registry.customComponents = {};
    }

    const normalized = componentName.toLowerCase();

    // Only add if not already present
    if (!registry.customComponents[normalized]) {
      registry.customComponents[normalized] = {
        createdAt: new Date().toISOString().split('T')[0],
        reason,
        extendsFrom,
      };

      // Atomic write: write to temp file, then rename
      const tmp = registryPath + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(registry, null, 2));
      fs.renameSync(tmp, registryPath);
    }
    console.error('  ✓ Updated component registry');
  } catch (_e) {
    console.error('  ⚠️  Failed to update component registry');
  }
}

// Execute and output JSON
const args = process.argv.slice(2);
generateComponent(args)
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(
      JSON.stringify(
        {
          success: false,
          componentName: 'Unknown',
          files: [],
          summary: 'Script execution failed',
          error: error.message,
        },
        null,
        2
      )
    );
    process.exit(1);
  });
