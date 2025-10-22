#!/usr/bin/env tsx

/**
 * Validates spec structure against standards
 *
 * Usage: tsx validate-spec.ts <spec_file>
 * Example: tsx validate-spec.ts docs/specs/user-auth.md
 */

import { readFileSync, existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';

const specFile = process.argv[2];

if (!specFile) {
  console.error('Error: Spec file path required');
  console.error('Usage: tsx validate-spec.ts <spec_file>');
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

const errors: string[] = [];
const warnings: string[] = [];

if (!match) {
  errors.push('No YAML frontmatter found');
} else {
  let frontmatter: Record<string, unknown> | undefined;
  try {
    frontmatter = parseYaml(match[1]);
  } catch (error) {
    errors.push(`Invalid YAML syntax: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Guard against undefined frontmatter from parse failure
  if (!frontmatter) {
    errors.push('Missing or invalid frontmatter');
  } else {
    // Validate required fields
    const requiredFields = ['title', 'type', 'priority', 'status'];
    for (const field of requiredFields) {
      if (!frontmatter[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate field values
    if (
      frontmatter.type &&
      !['feature', 'bugfix', 'refactor', 'docs'].includes(frontmatter.type as string)
    ) {
      errors.push(
        `Invalid type: ${frontmatter.type}. Must be one of: feature, bugfix, refactor, docs`
      );
    }

    if (frontmatter.priority && !['p0', 'p1', 'p2', 'p3'].includes(frontmatter.priority as string)) {
      errors.push(`Invalid priority: ${frontmatter.priority}. Must be one of: p0, p1, p2, p3`);
    }

    if (
      frontmatter.status &&
      !['draft', 'ready', 'in-progress', 'done'].includes(frontmatter.status as string)
    ) {
      errors.push(
        `Invalid status: ${frontmatter.status}. Must be one of: draft, ready, in-progress, done`
      );
    }
  }

  // Validate body content (only when match exists, ensuring safe offset calculation)
  const body = content.substring(match[0].length).trim();

  if (!body.includes('## Acceptance Criteria') && !body.includes('# Acceptance Criteria')) {
    warnings.push('No "Acceptance Criteria" section found');
  }

  if (!body.includes('## Test Plan') && !body.includes('# Test Plan')) {
    warnings.push('No "Test Plan" section found (recommended for features)');
  }

  const criteriaMatch = body.match(/## Acceptance Criteria\s*\n([\s\S]*?)(?=\n## |\n# |$)/);
  if (criteriaMatch) {
    const criteriaSection = criteriaMatch[1];
    const checkboxCount = (criteriaSection.match(/- \[ \]/g) || []).length;
    if (checkboxCount === 0) {
      warnings.push('Acceptance Criteria section has no checkboxes (use "- [ ]" format)');
    }
  }
}

const isValid = errors.length === 0;

console.log(
  JSON.stringify(
    {
      success: isValid,
      specFile,
      errors,
      warnings,
      summary: isValid
        ? `Spec is valid ${warnings.length > 0 ? 'with warnings' : ''}`
        : `Spec has ${errors.length} error(s)`,
      nextSteps: isValid
        ? warnings.length > 0
          ? ['Address warnings to improve spec quality']
          : ['Spec is ready for implementation']
        : ['Fix validation errors before proceeding'],
    },
    null,
    2
  )
);

process.exit(isValid ? 0 : 1);
