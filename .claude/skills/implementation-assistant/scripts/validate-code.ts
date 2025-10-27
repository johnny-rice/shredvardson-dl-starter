#!/usr/bin/env tsx

/**
 * Validates file against coding standards
 *
 * Usage: tsx validate-code.ts <file_path>
 * Example: tsx validate-code.ts src/components/UserProfile.tsx
 */

import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Error: File path required');
  console.error('Usage: tsx validate-code.ts <file_path>');
  process.exit(1);
}

// Validate file path to prevent reading arbitrary files
const resolvedPath = resolve(filePath);
const relativePath = relative(process.cwd(), resolvedPath);

// Reject paths outside project directory or in node_modules
if (relativePath.startsWith('..') || relativePath.includes('node_modules')) {
  console.error('Error: File must be within the project directory');
  console.error(`Invalid path: ${filePath}`);
  process.exit(1);
}

if (!existsSync(resolvedPath)) {
  console.error(`Error: File not found: ${filePath}`);
  process.exit(1);
}

const content = readFileSync(resolvedPath, 'utf-8');
const violations: Array<{ rule: string; severity: 'error' | 'warning'; line?: number }> = [];

// Check for 'any' types
const anyMatches = content.matchAll(/:\s*any(\s|;|,|\))/g);
for (const match of anyMatches) {
  const line = content.substring(0, match.index).split('\n').length;
  violations.push({
    rule: 'No `any` types - use specific types or `unknown`',
    severity: 'error',
    line,
  });
}

// Check for console.log (should use proper logging)
const consoleLogMatches = content.matchAll(/console\.log\(/g);
for (const match of consoleLogMatches) {
  const line = content.substring(0, match.index).split('\n').length;
  violations.push({
    rule: 'Avoid console.log - use console.error for errors or remove debug logs',
    severity: 'warning',
    line,
  });
}

// Check for try-catch in async functions (heuristic check)
const asyncFunctions = Array.from(
  content.matchAll(
    /async\s+(?:function\s+\w+|(?:\w+)\s*=\s*async\s*(?:\(.*?\)\s*=>|\(.*?\)\s*\{))/g
  )
);
const tryCatches = Array.from(content.matchAll(/try\s*\{/g));

if (asyncFunctions.length > 0 && tryCatches.length === 0) {
  violations.push({
    rule: 'Async functions detected without try-catch blocks (heuristic check - may not catch all cases). Consider using ESLint with @typescript-eslint/no-floating-promises for comprehensive validation.',
    severity: 'warning',
  });
}

// Check for default exports (prefer named exports)
if (content.includes('export default')) {
  violations.push({
    rule: 'Prefer named exports over default exports',
    severity: 'warning',
  });
}

// Check for proper import organization
const lines = content.split('\n');
const imports = lines.filter((line) => line.trim().startsWith('import'));
if (imports.length > 1) {
  let lastReactImport = -1;
  let firstRelativeImport = Infinity;

  imports.forEach((imp, idx) => {
    if (imp.includes("from 'react'") || imp.includes('from "react"')) {
      lastReactImport = idx;
    }
    if (imp.includes("from './") || imp.includes('from "./')) {
      firstRelativeImport = Math.min(firstRelativeImport, idx);
    }
  });

  if (lastReactImport > 0 && firstRelativeImport < lastReactImport) {
    violations.push({
      rule: 'Import organization: React imports should be first',
      severity: 'warning',
    });
  }
}

// Check for component naming (if React component)
if (filePath.includes('.tsx')) {
  // Check function components
  const functionComponentMatch = content.match(/export function (\w+)/);
  if (functionComponentMatch) {
    const componentName = functionComponentMatch[1];
    if (componentName[0] !== componentName[0].toUpperCase()) {
      violations.push({
        rule: 'Component names should be PascalCase',
        severity: 'error',
      });
    }
  }

  // Check arrow function components
  const arrowComponentMatches = content.matchAll(
    /export\s+(?:const|let)\s+(\w+)\s*[=:][^=]*(?:React\.FC|React\.FunctionComponent|\(.*?\)\s*=>)/g
  );
  for (const match of arrowComponentMatches) {
    const componentName = match[1];
    if (componentName[0] !== componentName[0].toUpperCase()) {
      violations.push({
        rule: 'Component names should be PascalCase',
        severity: 'error',
      });
    }
  }
}

const hasErrors = violations.some((v) => v.severity === 'error');

console.log(
  JSON.stringify(
    {
      success: !hasErrors,
      filePath,
      violations,
      summary: {
        errors: violations.filter((v) => v.severity === 'error').length,
        warnings: violations.filter((v) => v.severity === 'warning').length,
      },
      nextSteps: hasErrors
        ? ['Fix errors before proceeding', 'Re-run validation after fixes']
        : violations.length > 0
          ? ['Address warnings to improve code quality', 'Consider running linter: pnpm lint']
          : ['Code meets standards ✓', 'Continue with implementation'],
    },
    null,
    2
  )
);

process.exit(hasErrors ? 1 : 0);
