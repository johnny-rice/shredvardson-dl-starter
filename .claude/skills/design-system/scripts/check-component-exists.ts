#!/usr/bin/env tsx

/**
 * Component Existence Checker
 * Prevents unnecessary component creation by checking shadcn library first
 * Part of Phase 4 guardrails
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComponentRegistry {
  shadcnComponents: Record<string, any>;
  customComponents: Record<string, any>;
  aliases: Record<string, string>;
  similarityGroups: Record<string, string[]>;
  domainSpecific: {
    patterns: string[];
  };
}

interface CheckResult {
  exists: boolean;
  type: 'shadcn' | 'custom' | 'none';
  componentName?: string;
  importPath?: string;
  variants?: string[];
  suggestion?: string;
  similarComponents?: Array<{
    name: string;
    similarity: number;
    reason: string;
  }>;
  isDomainSpecific?: boolean;
}

// Load component registry
function loadRegistry(): ComponentRegistry {
  const registryPath = path.join(__dirname, '..', 'component-registry.json');
  if (!fs.existsSync(registryPath)) {
    throw new Error('Component registry not found');
  }
  return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
}

// Normalize component name (handle different cases and formats)
function normalizeComponentName(name: string): string {
  // Remove common prefixes/suffixes
  name = name.replace(/^(My|Custom|App|New)/i, '');
  name = name.replace(/(Component|Widget)$/i, '');

  // Convert to lowercase for comparison
  return name.toLowerCase();
}

// Calculate string similarity (Levenshtein distance)
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 100;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 100;

  const editDistance = levenshteinDistance(s1, s2);
  return Math.round(((maxLen - editDistance) / maxLen) * 100);
}

function levenshteinDistance(s1: string, s2: string): number {
  const dp: number[][] = Array(s1.length + 1)
    .fill(null)
    .map(() => Array(s2.length + 1).fill(0));

  for (let i = 0; i <= s1.length; i++) dp[i][0] = i;
  for (let j = 0; j <= s2.length; j++) dp[0][j] = j;

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }

  return dp[s1.length][s2.length];
}

// Check if component name suggests a specific use case
function detectUseCase(name: string): string[] {
  const useCases: Record<string, string[]> = {
    form: ['form', 'input', 'field', 'submit', 'validation'],
    navigation: ['nav', 'menu', 'link', 'breadcrumb', 'tabs'],
    display: ['card', 'list', 'table', 'grid', 'gallery'],
    feedback: ['alert', 'toast', 'notification', 'error', 'success'],
    modal: ['modal', 'dialog', 'popup', 'overlay'],
    profile: ['user', 'avatar', 'profile', 'account'],
    settings: ['settings', 'preferences', 'config', 'options'],
  };

  const normalized = name.toLowerCase();
  const detectedCases: string[] = [];

  for (const [useCase, keywords] of Object.entries(useCases)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      detectedCases.push(useCase);
    }
  }

  return detectedCases;
}

// Find similar components
function findSimilarComponents(
  componentName: string,
  registry: ComponentRegistry
): CheckResult['similarComponents'] {
  const normalized = normalizeComponentName(componentName);
  const similar: CheckResult['similarComponents'] = [];

  // Check direct name similarity
  for (const [name, config] of Object.entries(registry.shadcnComponents)) {
    const similarity = stringSimilarity(normalized, name);
    if (similarity > 60 && similarity < 100) {
      similar.push({
        name,
        similarity,
        reason: 'Name similarity'
      });
    }
  }

  // Check use case overlap
  const useCases = detectUseCase(componentName);
  if (useCases.length > 0) {
    for (const [name, config] of Object.entries(registry.shadcnComponents)) {
      if (config.useCases) {
        const overlap = useCases.filter(uc =>
          config.useCases.includes(uc)
        );
        if (overlap.length > 0 && !similar.find(s => s.name === name)) {
          similar.push({
            name,
            similarity: 70,
            reason: `Similar use case: ${overlap.join(', ')}`
          });
        }
      }
    }
  }

  // Check similarity groups
  for (const [group, components] of Object.entries(registry.similarityGroups)) {
    const inGroup = components.some(c =>
      stringSimilarity(normalized, c) > 70
    );
    if (inGroup) {
      components.forEach(comp => {
        if (!similar.find(s => s.name === comp) &&
            registry.shadcnComponents[comp]) {
          similar.push({
            name: comp,
            similarity: 60,
            reason: `Same category: ${group}`
          });
        }
      });
    }
  }

  // Sort by similarity
  return similar
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3); // Return top 3
}

// Check if component is domain-specific
function isDomainSpecific(componentName: string, registry: ComponentRegistry): boolean {
  const normalized = normalizeComponentName(componentName);

  return registry.domainSpecific.patterns.some(pattern =>
    normalized.includes(pattern.toLowerCase())
  );
}

// Main check function
export function checkComponentExists(componentName: string): CheckResult {
  const registry = loadRegistry();
  const normalized = normalizeComponentName(componentName);

  // Check aliases first
  const aliasedTo = registry.aliases[normalized];
  if (aliasedTo) {
    const component = registry.shadcnComponents[aliasedTo];
    return {
      exists: true,
      type: 'shadcn',
      componentName: aliasedTo,
      importPath: component.path,
      variants: component.variants,
      suggestion: `"${componentName}" is an alias for "${aliasedTo}". Use: import { ${pascalCase(aliasedTo)} } from "${component.path}"`
    };
  }

  // Check exact match in shadcn
  const exactMatch = registry.shadcnComponents[normalized];
  if (exactMatch) {
    return {
      exists: true,
      type: 'shadcn',
      componentName: normalized,
      importPath: exactMatch.path,
      variants: exactMatch.variants,
      suggestion: `Component already exists in shadcn/ui. Use: import { ${pascalCase(normalized)} } from "${exactMatch.path}"`
    };
  }

  // Check custom components
  const customMatch = registry.customComponents[normalized];
  if (customMatch) {
    return {
      exists: true,
      type: 'custom',
      componentName: normalized,
      suggestion: `Custom component already exists (created: ${customMatch.createdAt}). Reason: ${customMatch.reason}`
    };
  }

  // Check if domain-specific
  const domainSpecific = isDomainSpecific(componentName, registry);

  // Find similar components
  const similarComponents = findSimilarComponents(componentName, registry);

  // No exact match
  return {
    exists: false,
    type: 'none',
    similarComponents: similarComponents.length > 0 ? similarComponents : undefined,
    isDomainSpecific: domainSpecific,
    suggestion: similarComponents.length > 0
      ? `Consider using or extending: ${similarComponents[0].name} (${similarComponents[0].similarity}% similar - ${similarComponents[0].reason})`
      : domainSpecific
      ? `"${componentName}" appears to be domain-specific. Proceed with creation.`
      : `No existing component found. Consider if this functionality could be achieved by composing existing shadcn components.`
  };
}

// Helper to convert to PascalCase
function pascalCase(str: string): string {
  return str.replace(/(-|^)(\w)/g, (_, __, c) => c.toUpperCase());
}

// Export for use in other scripts
export default checkComponentExists;

// CLI execution
if (require.main === module) {
  const componentName = process.argv[2];

  if (!componentName) {
    console.error('Usage: check-component-exists <component-name>');
    process.exit(1);
  }

  try {
    const result = checkComponentExists(componentName);
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(JSON.stringify({
      error: error.message
    }, null, 2));
    process.exit(1);
  }
}