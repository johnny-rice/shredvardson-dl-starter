#!/usr/bin/env tsx

/**
 * Generates task breakdown from spec
 *
 * Usage: tsx generate-tasks.ts <spec_file>
 * Example: tsx generate-tasks.ts docs/specs/user-auth.md
 */

import { existsSync, readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

const specFile = process.argv[2];

if (!specFile) {
  console.error('Error: Spec file path required');
  console.error('Usage: tsx generate-tasks.ts <spec_file>');
  process.exit(1);
}

if (!existsSync(specFile)) {
  console.error(`Error: Spec file not found: ${specFile}`);
  process.exit(1);
}

const content = readFileSync(specFile, 'utf-8');

// Extract frontmatter
const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
const match = content.match(frontmatterRegex);

if (!match) {
  console.error('Error: No YAML frontmatter found');
  process.exit(1);
}

let frontmatter: Record<string, unknown>;
try {
  frontmatter = parseYaml(match[1]);
} catch (_error) {
  console.error('Error: Invalid YAML syntax');
  process.exit(1);
}

// Extract acceptance criteria
const criteriaMatch = content.match(/## Acceptance Criteria\s*\n([\s\S]*?)(?=\n## |\n# |$)/);
const criteria: string[] = [];

if (criteriaMatch) {
  const criteriaSection = criteriaMatch[1];
  const checkboxRegex = /- \[ \] (.+)/g;
  let criterionMatch;

  while ((criterionMatch = checkboxRegex.exec(criteriaSection)) !== null) {
    criteria.push(criterionMatch[1].trim());
  }
}

// Validate required frontmatter fields
if (!frontmatter.type || typeof frontmatter.type !== 'string') {
  console.error(
    JSON.stringify({
      success: false,
      error: 'Missing or invalid "type" field in frontmatter',
      expected: 'type must be one of: feature, bugfix, refactor, docs',
      specFile,
    })
  );
  process.exit(1);
}

// Generate tasks based on type
const type = frontmatter.type as string;
const tasks: Array<{
  id: number;
  description: string;
  dependencies: number[];
  estimate: string;
  risk: 'low' | 'medium' | 'high';
}> = [];

let taskId = 1;

// Standard tasks for features
if (type === 'feature') {
  tasks.push({
    id: taskId++,
    description: 'Create spec and get approval',
    dependencies: [],
    estimate: '1 hour',
    risk: 'low',
  });

  tasks.push({
    id: taskId++,
    description: 'Design database schema and RLS policies',
    dependencies: [1],
    estimate: '2 hours',
    risk: 'medium',
  });

  tasks.push({
    id: taskId++,
    description: 'Scaffold RLS tests',
    dependencies: [2],
    estimate: '1 hour',
    risk: 'low',
  });

  tasks.push({
    id: taskId++,
    description: 'Implement API endpoints',
    dependencies: [2],
    estimate: '4 hours',
    risk: 'medium',
  });

  tasks.push({
    id: taskId++,
    description: 'Scaffold unit tests for API',
    dependencies: [4],
    estimate: '1 hour',
    risk: 'low',
  });

  tasks.push({
    id: taskId++,
    description: 'Implement UI components',
    dependencies: [4],
    estimate: '3 hours',
    risk: 'low',
  });

  tasks.push({
    id: taskId++,
    description: 'Scaffold E2E tests',
    dependencies: [6],
    estimate: '1 hour',
    risk: 'low',
  });

  tasks.push({
    id: taskId++,
    description: 'Validate coverage meets thresholds',
    dependencies: [3, 5, 7],
    estimate: '30 minutes',
    risk: 'low',
  });
}

// Add custom tasks from acceptance criteria
for (const criterion of criteria) {
  tasks.push({
    id: taskId++,
    description: `Implement: ${criterion}`,
    dependencies: type === 'feature' ? [6] : [],
    estimate: '2 hours',
    risk: 'medium',
  });
}

console.log(
  JSON.stringify(
    {
      success: true,
      specFile,
      type,
      tasks,
      summary: {
        totalTasks: tasks.length,
        estimatedHours: tasks.reduce((sum, task) => {
          // Parse time with units (handles "30 minutes", "2h", "90m", etc.)
          const match = task.estimate.match(
            /(\d+(?:\.\d+)?)\s*(h|hour|hours|m|min|minute|minutes)?/i
          );
          if (!match) return sum;

          const value = parseFloat(match[1]);
          const unit = (match[2] || 'h').toLowerCase();

          // Convert to hours
          const hours = unit.startsWith('m') ? value / 60 : value;
          return sum + (Number.isNaN(hours) ? 0 : hours);
        }, 0),
        highRiskTasks: tasks.filter((t) => t.risk === 'high').length,
      },
      nextSteps: [
        'Review task breakdown with stakeholders',
        'Start with task 1',
        'Use /spec specify to create detailed spec',
      ],
    },
    null,
    2
  )
);
