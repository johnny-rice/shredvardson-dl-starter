#!/usr/bin/env tsx

/**
 * Extracts acceptance criteria for implementation
 *
 * Usage: tsx extract-criteria.ts <spec_file>
 * Example: tsx extract-criteria.ts docs/specs/user-auth.md
 */

import { readFileSync, existsSync } from 'fs';

const specFile = process.argv[2];

if (!specFile) {
  console.error('Error: Spec file path required');
  console.error('Usage: tsx extract-criteria.ts <spec_file>');
  process.exit(1);
}

if (!existsSync(specFile)) {
  console.error(`Error: Spec file not found: ${specFile}`);
  process.exit(1);
}

const content = readFileSync(specFile, 'utf-8');

// Extract acceptance criteria section
const criteriaMatch = content.match(/## Acceptance Criteria\s*\n([\s\S]*?)(?=\n## |\n# |$)/);

if (!criteriaMatch) {
  console.error('Error: No "Acceptance Criteria" section found');
  console.error('Add a section with:');
  console.error('## Acceptance Criteria\n\n- [ ] Criterion 1\n- [ ] Criterion 2');
  process.exit(1);
}

const criteriaSection = criteriaMatch[1];

// Extract checkbox items (both checked and unchecked)
const checkboxRegex = /- \[[ xX]\] (.+)/g;
const criteria: string[] = [];
let match;

while ((match = checkboxRegex.exec(criteriaSection)) !== null) {
  criteria.push(match[1].trim());
}

if (criteria.length === 0) {
  console.error('Error: No checkbox items found in Acceptance Criteria');
  console.error('Use format: - [ ] Your criterion here');
  process.exit(1);
}

// Extract success metrics if present
const metricsMatch = content.match(/## Success Metrics\s*\n([\s\S]*?)(?=\n## |\n# |$)/);
const metrics: string[] = [];

if (metricsMatch) {
  const metricsSection = metricsMatch[1];
  const metricRegex = /- (.+)/g;
  let metricMatch;

  while ((metricMatch = metricRegex.exec(metricsSection)) !== null) {
    const line = metricMatch[1].trim();
    // Skip checkbox items (they're already in criteria)
    if (!line.startsWith('[')) {
      metrics.push(line);
    }
  }
}

// Extract technical constraints if present
const constraintsMatch = content.match(/## Technical Constraints\s*\n([\s\S]*?)(?=\n## |\n# |$)/);
const constraints: string[] = [];

if (constraintsMatch) {
  const constraintsSection = constraintsMatch[1];
  const constraintRegex = /- (.+)/g;
  let constraintMatch;

  while ((constraintMatch = constraintRegex.exec(constraintsSection)) !== null) {
    constraints.push(constraintMatch[1].trim());
  }
}

console.log(
  JSON.stringify(
    {
      success: true,
      specFile,
      acceptanceCriteria: criteria,
      successMetrics: metrics,
      technicalConstraints: constraints,
      summary: {
        totalCriteria: criteria.length,
        hasMetrics: metrics.length > 0,
        hasConstraints: constraints.length > 0,
      },
      nextSteps: [
        'Review acceptance criteria with stakeholders',
        'Create implementation tasks from criteria',
        'Scaffold tests: /test unit <component>',
      ],
    },
    null,
    2
  )
);
