#!/usr/bin/env tsx

/**
 * Component Generator
 * Scaffolds new components following design system patterns
 * Phase 4: Full implementation with Handlebars templates
 */

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { execSync } from 'child_process';

// Register Handlebars helpers
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

Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
Handlebars.registerHelper('gt', (a: any, b: any) => a > b);

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
    testValue?: any;
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
  exampleProps?: Record<string, any>;
  usedTokens?: Array<{ token: string; description: string }>;
  patternFile?: string;
  argTypes?: any[];
  defaultArgs?: Record<string, any>;
  requiredProps?: Array<{ name: string; testValue: any }>;
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
}

// Load pattern configurations
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
      baseClasses: 'inline-flex items-center justify-center rounded-[var(--radius)] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      variants: [
        {
          name: 'variant',
          options: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
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
      accessibilityNotes: 'Ensures proper focus management and keyboard navigation. Uses semantic button element.',
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
      baseClasses: 'flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      componentDescription: 'A form input component with consistent styling',
      accessibilityNotes: 'Supports proper labeling and error states. Compatible with screen readers.',
      hasAriaLabel: true,
      needsContrastTest: true,
      patternFile: 'forms.md',
    },
    card: {
      elementTag: 'div',
      elementType: 'HTMLDiv',
      htmlElement: 'Div',
      isForwardRef: true,
      hasChildren: true,
      baseClasses: 'rounded-lg border bg-card text-card-foreground shadow-sm',
      componentDescription: 'A container component for grouping related content',
      accessibilityNotes: 'Use appropriate ARIA roles when card contains interactive elements.',
      patternFile: 'cards.md',
    },
    dialog: {
      elementTag: 'div',
      elementType: 'HTMLDiv',
      htmlElement: 'Div',
      hasChildren: true,
      baseClasses: 'fixed inset-0 z-50 flex items-center justify-center',
      componentDescription: 'A modal dialog component for overlays',
      accessibilityNotes: 'Manages focus trap and escape key handling. Announces to screen readers.',
      role: 'dialog',
      ariaLabel: 'Dialog',
      hasAriaLabel: true,
      needsTheme: true,
      patternFile: 'modals.md',
    },
  };

  return patterns[patternName] || {};
}

// Load templates
function loadTemplate(templateName: string): string {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }
  throw new Error(`Template not found: ${templateName}`);
}

// Generate component from template
function generateFromTemplate(config: ComponentConfig, templateName: string): string {
  const template = loadTemplate(templateName);
  const compiledTemplate = Handlebars.compile(template);
  return compiledTemplate(config);
}

// Validate generated component
async function validateComponent(componentPath: string): Promise<ValidationResult> {
  const content = fs.readFileSync(componentPath, 'utf-8');

  // Check for token usage
  const tokenCompliance = calculateTokenCompliance(content);

  // Pattern adherence (simplified check)
  const patternAdherence = content.includes('cn(') ? 90 : 60;

  // Accessibility check
  const accessibility = calculateAccessibilityScore(content);

  // Test coverage (check if test file exists)
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
    suggestions: generateSuggestions(tokenCompliance, patternAdherence, accessibility, testCoverage),
  };
}

function calculateTokenCompliance(content: string): number {
  let score = 100;

  // Check for hardcoded colors (should use tokens)
  if (/bg-(red|blue|green|yellow|purple|pink|indigo)-\d+/.test(content)) {
    score -= 20;
  }

  // Check for hardcoded spacing (should use tokens)
  if (/p[xy]?-\d+/.test(content) && !/var\(--spacing/.test(content)) {
    score -= 10;
  }

  // Check for using CSS variables
  if (/var\(--/.test(content)) {
    score = Math.min(100, score + 10);
  }

  return Math.max(0, score);
}

function calculateAccessibilityScore(content: string): number {
  let score = 70; // Base score

  // Check for aria attributes
  if (/aria-(label|describedby|labelledby)/.test(content)) {
    score += 10;
  }

  // Check for role attribute
  if (/role=/.test(content)) {
    score += 10;
  }

  // Check for semantic HTML
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
    suggestions.push('Replace hardcoded colors with design tokens (e.g., use var(--color-primary))');
  }

  if (patternAdherence < 90) {
    suggestions.push('Ensure component follows established patterns from docs/design/patterns/');
  }

  if (accessibility < 90) {
    suggestions.push('Add proper ARIA attributes and semantic HTML elements');
  }

  if (testCoverage < 70) {
    suggestions.push('Add comprehensive test coverage (target: 70%+)');
  }

  return suggestions;
}

// Main generation function
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

  console.error(`✨ Generating ${componentName}${variant ? ` (${variant})` : ''}...`);

  // Determine pattern from component name
  const pattern = componentName.toLowerCase().includes('button') ? 'button' :
                  componentName.toLowerCase().includes('input') ? 'input' :
                  componentName.toLowerCase().includes('card') ? 'card' :
                  componentName.toLowerCase().includes('dialog') ? 'dialog' : 'button';

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
    const componentDir = path.join(process.cwd(), 'packages/ui/src/components/ui');
    const kebabName = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
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

    // Generate test file
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

    // Generate story file (optional)
    if (args.includes('--with-story')) {
      const storyContent = generateFromTemplate(config, 'story');
      const storyPath = path.join(componentDir, `${kebabName}.stories.tsx`);

      fs.writeFileSync(storyPath, storyContent);
      files.push({
        path: storyPath,
        type: 'story',
        created: true,
        content: storyContent,
      });

      console.error(`  ✓ Created story: ${storyPath}`);
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
      validation.suggestions.forEach(s => console.error(`  - ${s}`));
    }

    // Run Sub-Agent validation if available
    if (fs.existsSync(path.join(__dirname, 'validate-tokens.ts'))) {
      console.error('\n🤖 Running Sub-Agent validation...');
      try {
        execSync(`pnpm tsx ${path.join(__dirname, 'validate-tokens.ts')} ${componentPath}`, {
          stdio: 'inherit',
        });
      } catch (e) {
        console.error('  ⚠️  Token validation failed');
      }
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
      nextSteps: validation.passed ?
        ['Component is production-ready'] :
        ['Apply suggested improvements', 'Run validation again'],
    };

  } catch (error: any) {
    console.error(`  ✗ Error: ${error.message}`);
    return {
      success: false,
      componentName,
      variant,
      files,
      summary: `Failed to generate component: ${error.message}`,
      nextSteps: ['Check error message', 'Ensure templates exist'],
    };
  }
}

// Execute and output JSON
const args = process.argv.slice(2);
generateComponent(args)
  .then(result => console.log(JSON.stringify(result, null, 2)))
  .catch(error => {
    console.error(JSON.stringify({
      success: false,
      componentName: 'Unknown',
      files: [],
      summary: 'Script execution failed',
      error: error.message
    }, null, 2));
    process.exit(1);
  });