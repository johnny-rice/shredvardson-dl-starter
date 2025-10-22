#!/usr/bin/env tsx

/**
 * Guides implementation with step-by-step checklist
 *
 * Usage: tsx implementation-guide.ts <feature_type>
 * Example: tsx implementation-guide.ts feature
 */

const featureType = process.argv[2] || 'feature';

const guides: Record<string, unknown> = {
  feature: {
    title: 'Feature Implementation Guide',
    description: 'TDD workflow for new features',
    steps: [
      {
        phase: 'Planning',
        tasks: [
          'Review spec and acceptance criteria (/spec extract)',
          'Identify database changes needed',
          'Review technical constraints',
          'Estimate complexity and time',
        ],
      },
      {
        phase: 'Database',
        tasks: [
          'Design schema with RLS policies',
          'Create migration (/db create)',
          'Validate migration (/db validate)',
          'Apply to local DB (/db apply)',
          'Generate types (/db types)',
        ],
      },
      {
        phase: 'Tests (TDD)',
        tasks: [
          'Scaffold RLS tests (/test rls table_name)',
          'Scaffold unit tests (/test unit component)',
          'Scaffold E2E tests (/test e2e user_flow)',
          'Verify tests fail (red phase)',
        ],
      },
      {
        phase: 'Implementation',
        tasks: [
          'Implement API endpoints',
          'Add error handling',
          'Implement UI components',
          'Add loading states',
          'Verify tests pass (green phase)',
        ],
      },
      {
        phase: 'Validation',
        tasks: [
          'Run all tests (pnpm test)',
          'Check coverage (/test coverage)',
          'Run linter (pnpm lint)',
          'Run type check (pnpm typecheck)',
          'Manual QA testing',
        ],
      },
      {
        phase: 'Documentation',
        tasks: [
          'Update README if needed',
          'Add code comments',
          'Capture micro-lesson if applicable',
          'Update API documentation',
        ],
      },
    ],
    qualityGates: [
      'All tests passing',
      'Coverage meets thresholds (70%)',
      'No TypeScript errors',
      'Linter passing',
      'RLS policies validated',
    ],
  },
  bugfix: {
    title: 'Bug Fix Implementation Guide',
    description: 'Systematic approach to fixing bugs',
    steps: [
      {
        phase: 'Investigation',
        tasks: [
          'Reproduce the bug locally',
          'Identify root cause',
          'Review related code',
          'Check for similar issues',
        ],
      },
      {
        phase: 'Test Creation',
        tasks: [
          'Create failing test that reproduces bug',
          'Verify test fails (red phase)',
          'Add edge case tests if needed',
        ],
      },
      {
        phase: 'Fix',
        tasks: [
          'Implement minimal fix',
          'Verify tests pass (green phase)',
          'Check for regressions',
        ],
      },
      {
        phase: 'Validation',
        tasks: [
          'Run full test suite',
          'Manual testing',
          'Check coverage maintained',
          'Review fix with stakeholders',
        ],
      },
    ],
    qualityGates: [
      'Bug reproduced in test',
      'Fix verified with test',
      'No regressions introduced',
      'Root cause documented',
    ],
  },
  refactor: {
    title: 'Refactoring Implementation Guide',
    description: 'Safe refactoring with characterization tests',
    steps: [
      {
        phase: 'Preparation',
        tasks: [
          'Identify code to refactor',
          'Document current behavior',
          'Review existing tests',
          'Plan refactoring approach',
        ],
      },
      {
        phase: 'Safety Net',
        tasks: [
          'Add characterization tests if needed',
          'Ensure all tests pass',
          'Check coverage baseline',
        ],
      },
      {
        phase: 'Refactor',
        tasks: [
          'Make small, incremental changes',
          'Run tests after each change',
          'Keep tests green throughout',
          'Commit frequently',
        ],
      },
      {
        phase: 'Validation',
        tasks: [
          'Verify all tests still pass',
          'Check coverage maintained/improved',
          'Review code quality improvement',
          'Manual testing',
        ],
      },
    ],
    qualityGates: [
      'All tests passing before refactor',
      'All tests passing after refactor',
      'Coverage maintained or improved',
      'Code quality metrics improved',
    ],
  },
};

if (!(featureType in guides)) {
  console.error(`Error: Unknown feature type "${featureType}"`);
  console.error('Available types: feature, bugfix, refactor');
  process.exit(1);
}

console.log(JSON.stringify({
  success: true,
  featureType,
  guide: guides[featureType],
  nextSteps: [
    'Follow steps in order',
    'Check off each task as completed',
    'Verify quality gates before moving on',
  ],
}, null, 2));
