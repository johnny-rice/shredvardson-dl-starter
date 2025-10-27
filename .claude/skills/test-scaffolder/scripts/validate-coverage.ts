#!/usr/bin/env tsx

/**
 * Validates current coverage against coverage contract
 *
 * Usage: tsx validate-coverage.ts
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const coverageFile = join(process.cwd(), 'apps/web/coverage/coverage-summary.json');
const contractFile = join(process.cwd(), 'docs/testing/coverage-contract.md');

/**
 * Parse thresholds from coverage contract file
 */
function parseContractThresholds(filePath: string) {
  if (!existsSync(filePath)) {
    console.warn(`Warning: Contract file not found at ${filePath}, using defaults`);
    return { lines: 70, functions: 70, branches: 65, statements: 70 };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');

    // Parse threshold percentages from contract (e.g., "- Lines: 70%")
    const lines = content.match(/[-*]\s*Lines:\s*(\d+)%/)?.[1];
    const functions = content.match(/[-*]\s*Functions:\s*(\d+)%/)?.[1];
    const branches = content.match(/[-*]\s*Branches:\s*(\d+)%/)?.[1];
    const statements = content.match(/[-*]\s*Statements:\s*(\d+)%/)?.[1];

    return {
      lines: lines ? parseInt(lines, 10) : 70,
      functions: functions ? parseInt(functions, 10) : 70,
      branches: branches ? parseInt(branches, 10) : 65,
      statements: statements ? parseInt(statements, 10) : 70,
    };
  } catch (_error) {
    console.warn('Warning: Failed to parse contract file, using defaults');
    return { lines: 70, functions: 70, branches: 65, statements: 70 };
  }
}

// Run coverage if not exists
if (!existsSync(coverageFile)) {
  console.error('No coverage data found. Running tests with coverage...\n');
  try {
    execSync('pnpm --filter=web test:coverage', { stdio: 'inherit' });
  } catch (_error) {
    console.error('Error running coverage tests');
    process.exit(1);
  }
}

// Check if coverage file now exists
if (!existsSync(coverageFile)) {
  console.error('Error: Coverage file not generated');
  process.exit(1);
}

// Parse coverage data
let coverage;
try {
  coverage = JSON.parse(readFileSync(coverageFile, 'utf-8'));
} catch (error) {
  console.error(
    `Error parsing coverage file at ${coverageFile}:`,
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}

const total = coverage.total;

// Validate coverage data structure
if (!total || typeof total !== 'object') {
  console.error('Error: Coverage data missing "total" object');
  process.exit(1);
}

// Read thresholds from contract file
const thresholds = parseContractThresholds(contractFile);

// Calculate gaps
const gaps: Array<{
  metric: string;
  current: number;
  threshold: number;
  gap: number;
  status: 'pass' | 'fail';
}> = [];

for (const [metric, threshold] of Object.entries(thresholds)) {
  // Validate metric exists in coverage data
  if (!total[metric] || typeof total[metric].pct !== 'number') {
    console.error(`Error: Coverage data missing or invalid for metric: ${metric}`);
    console.error(`Expected ${metric}.pct to be a number, got:`, total[metric]);
    process.exit(1);
  }

  const current = total[metric].pct;
  const gap = threshold - current;
  gaps.push({
    metric,
    current,
    threshold,
    gap,
    status: current >= threshold ? 'pass' : 'fail',
  });
}

const allPassing = gaps.every((g) => g.status === 'pass');

// Output structured result
const result = {
  success: allPassing,
  coverage: {
    lines: total.lines.pct,
    functions: total.functions.pct,
    branches: total.branches.pct,
    statements: total.statements.pct,
  },
  thresholds,
  gaps: gaps.filter((g) => g.status === 'fail'),
  recommendations: gaps
    .filter((g) => g.status === 'fail')
    .map(
      (g) =>
        `Increase ${g.metric} coverage by ${g.gap.toFixed(1)}% to meet ${g.threshold}% threshold`
    ),
  nextSteps: allPassing
    ? [
        'Coverage meets all thresholds! ✓',
        'Continue maintaining coverage on new code',
        'Consider increasing thresholds if consistently exceeding',
      ]
    : [
        'Add tests for uncovered files',
        'Focus on critical paths (auth, RLS, core workflows)',
        'Run: pnpm --filter=web test:coverage to see detailed report',
        'View HTML report: apps/web/coverage/index.html',
      ],
};

console.log(JSON.stringify(result, null, 2));

process.exit(allPassing ? 0 : 1);
