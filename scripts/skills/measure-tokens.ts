#!/usr/bin/env tsx
/**
 * Token Measurement Tool for Skills Validation
 *
 * Compares token consumption between old commands and new Skills
 * to validate the progressive disclosure hypothesis.
 *
 * Usage: pnpm skill:measure <skill-name> [--iterations=3]
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { countWorkflowTokens, extractFrontmatter, type WorkflowTokens } from './token-counter.js';

interface ComparisonResult {
  skillName: string;
  oldCommand: {
    name: string;
    tokens: WorkflowTokens;
  };
  newSkill: {
    name: string;
    tokens: WorkflowTokens;
  };
  savings: number;
  savingsPercent: number;
  threshold: number;
  pass: boolean;
  timestamp: string;
}

/**
 * Measure tokens for old command workflow
 */
function measureCommandWorkflow(commandName: string): WorkflowTokens {
  const commandPath = join('.claude/commands', `${commandName}.md`);

  if (!existsSync(commandPath)) {
    throw new Error(`Command not found: ${commandPath}`);
  }

  const { frontmatter, body } = extractFrontmatter(commandPath);

  // Count actual tokens, not characters
  const frontmatterTokens = frontmatter.length > 0 ? countTokens(frontmatter) : 0;
  const bodyTokens = countTokens(body);

  return {
    metadata: frontmatterTokens,
    prompts: bodyTokens,
    scripts: 0, // Old commands don't use separate scripts
    docs: 0, // Docs are inline in commands
    total: frontmatterTokens + bodyTokens,
  };
}

/**
 * Measure tokens for new Skill workflow
 */
function measureSkillWorkflow(skillName: string): WorkflowTokens {
  const skillPath = join('.claude/skills', skillName);

  if (!existsSync(skillPath)) {
    throw new Error(`Skill not found: ${skillPath}`);
  }

  const skillJsonPath = join(skillPath, 'skill.json');
  const skillMdPath = join(skillPath, 'SKILL.md');

  if (!existsSync(skillJsonPath)) {
    throw new Error(`skill.json not found: ${skillJsonPath}`);
  }

  if (!existsSync(skillMdPath)) {
    throw new Error(`SKILL.md not found: ${skillMdPath}`);
  }

  return countWorkflowTokens({
    metadata: [skillJsonPath],
    prompts: [skillMdPath],
    scripts: [], // Scripts are never in context
    docs: [], // Only count initially loaded docs (progressive disclosure)
  });
}

/**
 * Generate comparison report
 */
function generateReport(result: ComparisonResult): string {
  const passEmoji = result.pass ? '✅' : '❌';
  const recommendation = getRecommendation(result.savingsPercent);

  return `# Token Measurement Report

**Date**: ${result.timestamp}
**Skill**: ${result.skillName}
**Comparison**: ${result.oldCommand.name} vs ${result.newSkill.name}

## Results

### Old Command: \`${result.oldCommand.name}\`
- Metadata: ${result.oldCommand.tokens.metadata} tokens
- Prompts: ${result.oldCommand.tokens.prompts} tokens
- Scripts: ${result.oldCommand.tokens.scripts} tokens
- Docs: ${result.oldCommand.tokens.docs} tokens
- **Total: ${result.oldCommand.tokens.total} tokens**

### New Skill: \`${result.newSkill.name}\`
- Metadata (skill.json): ${result.newSkill.tokens.metadata} tokens
- SKILL.md: ${result.newSkill.tokens.prompts} tokens
- Scripts: ${result.newSkill.tokens.scripts} tokens (executed, not loaded)
- Docs (initial): ${result.newSkill.tokens.docs} tokens
- **Total: ${result.newSkill.tokens.total} tokens**

## Analysis

- **Savings**: ${result.savings} tokens (${result.savingsPercent.toFixed(1)}%)
- **Threshold**: ${result.threshold}%
- **Result**: ${passEmoji} ${result.pass ? 'PASS' : 'FAIL'}

## Recommendation

${recommendation}

## Raw Data

\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\`

---

🤖 Generated with token measurement tool (Issue #177)
`;
}

/**
 * Get recommendation based on savings tier
 */
function getRecommendation(savingsPercent: number): string {
  if (savingsPercent >= 50) {
    return `✅ **Excellent!** Savings exceed 50%. Proceed confidently with Phase 2.

**Next Steps**:
1. Use this tool for each new Skill
2. Document success in ADR addendum
3. Proceed with Phase 2 implementation`;
  }

  if (savingsPercent >= 30) {
    return `⚠️ **Proceed with caution**. Savings are above minimum threshold but below target.

**Next Steps**:
1. Re-evaluate ROI for remaining Skills
2. Consider consolidating Phases 2-4
3. Proceed cautiously with tighter monitoring`;
  }

  return `❌ **DO NOT PROCEED**. Savings below 30% threshold.

**Next Steps**:
1. Analyze why progressive disclosure didn't deliver expected savings
2. Document findings in ADR addendum
3. Consider hybrid approach or abort migration
4. **Do NOT proceed to Phase 2**`;
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Token Measurement Tool

Usage: pnpm skill:measure <skill-name> [options]

Arguments:
  skill-name              Name of the Skill to measure

Options:
  --old-command <name>    Old command name (default: derived from Skill)
  --iterations <n>        Run n times and average (default: 1)
  --output <path>         Custom report path
  --verbose               Show detailed breakdown

Examples:
  pnpm skill:measure supabase-integration
  pnpm skill:measure supabase-integration --old-command migrate
  pnpm skill:measure supabase-integration --iterations 3 --verbose
`);
    process.exit(0);
  }

  const skillName = args[0];
  const oldCommandName =
    args.find((arg) => arg.startsWith('--old-command='))?.split('=')[1] || 'migrate';

  console.log('\n📊 Measuring token consumption...\n');
  console.log(`Skill: ${skillName}`);
  console.log(`Old command: ${oldCommandName}\n`);

  try {
    // Measure old command
    console.log('📝 Measuring old command workflow...');
    const oldTokens = measureCommandWorkflow(oldCommandName);
    console.log(`✅ Old command: ${oldTokens.total} tokens\n`);

    // Measure new Skill
    console.log('📝 Measuring new Skill workflow...');
    const newTokens = measureSkillWorkflow(skillName);
    console.log(`✅ New Skill: ${newTokens.total} tokens\n`);

    // Calculate savings
    const savings = oldTokens.total - newTokens.total;
    const savingsPercent = (savings / oldTokens.total) * 100;
    const threshold = 30;
    const pass = savingsPercent >= threshold;

    const result: ComparisonResult = {
      skillName,
      oldCommand: {
        name: oldCommandName,
        tokens: oldTokens,
      },
      newSkill: {
        name: skillName,
        tokens: newTokens,
      },
      savings,
      savingsPercent,
      threshold,
      pass,
      timestamp: new Date().toISOString(),
    };

    // Display results
    console.log(`\n💰 **Savings**: ${savings} tokens (${savingsPercent.toFixed(1)}%)`);
    console.log(`🎯 **Threshold**: ${threshold}%`);
    console.log(`${pass ? '✅' : '❌'} **Result**: ${pass ? 'PASS' : 'FAIL'}\n`);

    // Generate report
    const date = new Date().toISOString().split('T')[0];
    const reportDir = 'scratch';
    const reportPath = join(reportDir, `token-measurement-${date}.md`);

    mkdirSync(reportDir, { recursive: true });
    const report = generateReport(result);
    writeFileSync(reportPath, report);

    console.log(`📄 Report saved to: ${reportPath}\n`);

    // Exit with appropriate code
    process.exit(pass ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
