#!/usr/bin/env tsx

/**
 * Verification Completion Helper
 *
 * Generates verification checklist based on context and requirements.
 * Part of the verification Skill from obra/superpowers integration.
 *
 * Usage:
 *   tsx .claude/skills/verification/scripts/verify-completion.ts --context tests
 *   tsx .claude/skills/verification/scripts/verify-completion.ts --context pr --spec specs/feature-123.md
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

interface VerificationCommand {
  name: string;
  command: string;
  successIndicator: string;
  required: boolean;
}

interface VerificationContext {
  tests?: boolean;
  build?: boolean;
  lint?: boolean;
  typecheck?: boolean;
  coverage?: boolean;
  e2e?: boolean;
  rls?: boolean;
  migration?: boolean;
  all?: boolean;
}

const VERIFICATION_COMMANDS: Record<string, VerificationCommand> = {
  tests: {
    name: 'Unit Tests',
    command: 'pnpm test',
    successIndicator: 'X/X tests passed',
    required: true,
  },
  typecheck: {
    name: 'TypeScript Type Check',
    command: 'pnpm typecheck',
    successIndicator: 'No errors found',
    required: true,
  },
  lint: {
    name: 'Linting',
    command: 'pnpm lint',
    successIndicator: '0 errors, 0 warnings',
    required: true,
  },
  build: {
    name: 'Build',
    command: 'pnpm build',
    successIndicator: 'Build completed successfully',
    required: true,
  },
  coverage: {
    name: 'Test Coverage',
    command: 'pnpm test:coverage',
    successIndicator: 'Coverage >= 70%',
    required: false,
  },
  e2e: {
    name: 'E2E Tests',
    command: 'pnpm test:e2e',
    successIndicator: 'X specs passed',
    required: false,
  },
  rls: {
    name: 'RLS Security Tests',
    command: 'pnpm test:rls',
    successIndicator: 'X RLS policies verified',
    required: false,
  },
  migration: {
    name: 'Database Migration',
    command: 'pnpm db:migrate',
    successIndicator: 'Migration X applied',
    required: false,
  },
};

function parseArgs(): { context: VerificationContext; specFile?: string } {
  const args = process.argv.slice(2);
  const context: VerificationContext = {};
  let specFile: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--context' && args[i + 1]) {
      const ctx = args[i + 1];
      if (ctx === 'all') {
        context.all = true;
      } else {
        context[ctx as keyof VerificationContext] = true;
      }
      i++;
    } else if (arg === '--spec' && args[i + 1]) {
      specFile = args[i + 1];
      i++;
    }
  }

  // Default to all required checks if no context specified
  if (Object.keys(context).length === 0) {
    context.all = true;
  }

  return { context, specFile };
}

function getRequiredChecks(context: VerificationContext): VerificationCommand[] {
  const checks: VerificationCommand[] = [];

  if (context.all) {
    // Return all required checks
    return Object.values(VERIFICATION_COMMANDS).filter((cmd) => cmd.required);
  }

  // Return specific checks
  for (const [key, enabled] of Object.entries(context)) {
    if (enabled && VERIFICATION_COMMANDS[key]) {
      checks.push(VERIFICATION_COMMANDS[key]);
    }
  }

  return checks;
}

function parseSpecRequirements(specFile: string): string[] {
  try {
    const specPath = resolve(process.cwd(), specFile);
    const content = readFileSync(specPath, 'utf-8');

    // Extract acceptance criteria from spec
    const criteriaMatch = content.match(/## Success Criteria\s+([\s\S]*?)##/);
    if (!criteriaMatch) return [];

    // Extract checkbox items
    const items = criteriaMatch[1]
      .split('\n')
      .filter((line) => line.trim().startsWith('- [ ]'))
      .map((line) => line.replace(/^- \[ \]\s*/, '').trim());

    return items;
  } catch (error) {
    console.error(`Warning: Could not parse spec file: ${error}`);
    return [];
  }
}

function generateChecklist(checks: VerificationCommand[], requirements: string[] = []): string {
  let output = '# Verification Checklist\n\n';
  output += '**Before claiming completion, verify ALL items below:**\n\n';

  output += '## Automated Checks\n\n';
  output += '_Run each command and verify success indicators_\n\n';

  for (const check of checks) {
    output += `### ${check.name}\n\n`;
    output += `- [ ] **Command:** \`${check.command}\`\n`;
    output += `- [ ] **Success:** ${check.successIndicator}\n`;
    output += '- [ ] **Evidence:** [Paste output confirming success]\n\n';
  }

  if (requirements.length > 0) {
    output += '## Acceptance Criteria\n\n';
    output += '_Verify each requirement from spec_\n\n';

    for (const req of requirements) {
      output += `- [ ] ${req}\n`;
    }
    output += '\n';
  }

  output += '## Completion Gate\n\n';
  output += '**ALL items above must be checked before claiming:**\n\n';
  output += '- "Tests pass"\n';
  output += '- "Ready to commit"\n';
  output += '- "PR ready"\n';
  output += '- "Feature complete"\n\n';

  output += '---\n\n';
  output += '_Generated by verification Skill (obra/superpowers integration)_\n';

  return output;
}

function main() {
  const { context, specFile } = parseArgs();

  console.error('Verification Completion Helper');
  console.error('==============================\n');

  const checks = getRequiredChecks(context);
  console.error(
    `Context: ${Object.keys(context)
      .filter((k) => context[k as keyof VerificationContext])
      .join(', ')}`
  );
  console.error(`Checks: ${checks.length}\n`);

  const requirements = specFile ? parseSpecRequirements(specFile) : [];
  if (requirements.length > 0) {
    console.error(`Acceptance Criteria: ${requirements.length} items from ${specFile}\n`);
  }

  const checklist = generateChecklist(checks, requirements);
  console.log(checklist);
}

// Run if called directly
if (require.main === module) {
  main();
}

export { getRequiredChecks, parseSpecRequirements, generateChecklist };
