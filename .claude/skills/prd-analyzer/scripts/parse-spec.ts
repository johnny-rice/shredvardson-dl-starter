#!/usr/bin/env tsx

/**
 * Parses YAML frontmatter from spec file
 *
 * Usage: tsx parse-spec.ts <spec_file>
 * Example: tsx parse-spec.ts docs/specs/user-auth.md
 */

import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';

const specFile = process.argv[2];

if (!specFile) {
  console.error('Error: Spec file path required');
  console.error('Usage: tsx parse-spec.ts <spec_file>');
  process.exit(1);
}

// Validate spec file path to prevent path traversal
const resolvedPath = resolve(specFile);
const relativePath = relative(process.cwd(), resolvedPath);

// Reject paths outside project directory or in node_modules
if (relativePath.startsWith('..') || relativePath.includes('node_modules')) {
  console.error('Error: Spec file must be within the project directory');
  console.error(`Invalid path: ${specFile}`);
  process.exit(1);
}

if (!existsSync(resolvedPath)) {
  console.error(`Error: Spec file not found: ${specFile}`);
  process.exit(1);
}

const content = readFileSync(resolvedPath, 'utf-8');

// Extract frontmatter
const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
const match = content.match(frontmatterRegex);

if (!match) {
  console.error('Error: No YAML frontmatter found in spec file');
  console.error('Expected format:');
  console.error('---');
  console.error('title: Your Title');
  console.error('type: feature');
  console.error('priority: p0');
  console.error('status: draft');
  console.error('---');
  process.exit(1);
}

let frontmatter: Record<string, unknown>;
try {
  frontmatter = parseYaml(match[1]);
} catch (error) {
  console.error('Error: Invalid YAML syntax in frontmatter');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

// Extract body (content after frontmatter)
const body = content.substring(match[0].length).trim();

console.log(
  JSON.stringify(
    {
      success: true,
      specFile,
      frontmatter,
      metadata: {
        hasAcceptanceCriteria:
          body.includes('## Acceptance Criteria') || body.includes('# Acceptance Criteria'),
        hasTestPlan: body.includes('## Test Plan') || body.includes('# Test Plan'),
        hasTechnicalConstraints:
          body.includes('## Technical Constraints') || body.includes('# Technical Constraints'),
        wordCount: body.split(/\s+/).length,
      },
      body: body.substring(0, 500) + (body.length > 500 ? '...' : ''), // Truncate for output
    },
    null,
    2
  )
);
