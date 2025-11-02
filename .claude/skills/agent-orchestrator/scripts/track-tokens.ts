#!/usr/bin/env tsx

/**
 * Token Tracking Harness for Sub-Agent Workflow Testing
 *
 * Measures token usage, cost, and execution time for workflows using sub-agent delegation.
 * Compares actual results to baseline projections and generates detailed reports.
 *
 * Usage:
 *   pnpm tsx track-tokens.ts --workflow=/spec:plan --baseline=120000 --haiku=45000 --sonnet=5000 --time=28500
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Token usage report structure
 */
interface TokenUsageReport {
  workflow: string;
  timestamp: string;
  sub_agent_tokens: {
    research?: number;
    security?: number;
    test?: number;
  };
  sonnet_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  execution_time_ms: number;
  baseline_comparison: {
    baseline_tokens: number;
    baseline_cost_usd: number;
    token_savings_pct: number;
    cost_savings_pct: number;
  };
  quality_metrics?: {
    task_success: boolean;
    findings_used_pct?: number;
    false_positive_pct?: number;
    developer_rating?: number;
  };
}

/**
 * Test configuration for each workflow
 */
interface WorkflowTestConfig {
  workflow: string;
  baseline_tokens: number;
  baseline_cost_usd: number;
  description: string;
}

// Haiku pricing: ~$0.55/1M average (input $0.25, output $1.25)
const HAIKU_COST_PER_TOKEN = 0.55 / 1_000_000;

// Sonnet pricing: ~$9/1M average (input $3, output $15)
const SONNET_COST_PER_TOKEN = 9 / 1_000_000;

/**
 * Workflow baseline configurations
 */
const WORKFLOW_BASELINES: Record<string, WorkflowTestConfig> = {
  '/spec:plan': {
    workflow: '/spec:plan',
    baseline_tokens: 120_000,
    baseline_cost_usd: 2.16,
    description: 'Spec-driven planning with design discovery',
  },
  '/spec:specify': {
    workflow: '/spec:specify',
    baseline_tokens: 30_000,
    baseline_cost_usd: 0.54,
    description: 'Spec creation with template generation',
  },
  '/spec:tasks': {
    workflow: '/spec:tasks',
    baseline_tokens: 25_000,
    baseline_cost_usd: 0.45,
    description: 'Task breakdown from spec',
  },
  '/code': {
    workflow: '/code',
    baseline_tokens: 50_000,
    baseline_cost_usd: 0.9,
    description: 'Feature implementation with code generation',
  },
};

/**
 * Calculate cost from token counts
 */
function calculateCost(haikuTokens: number, sonnetTokens: number): number {
  return haikuTokens * HAIKU_COST_PER_TOKEN + sonnetTokens * SONNET_COST_PER_TOKEN;
}

/**
 * Calculate savings percentage
 */
function calculateSavings(actual: number, baseline: number): number {
  return ((baseline - actual) / baseline) * 100;
}

/**
 * Generate detailed report
 */
function generateReport(data: TokenUsageReport): void {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║          Token Usage Report - Sub-Agent Integration         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`Workflow:  ${data.workflow}`);
  console.log(`Timestamp: ${data.timestamp}`);
  console.log(`Duration:  ${(data.execution_time_ms / 1000).toFixed(2)}s`);

  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('  Token Usage Breakdown');
  console.log('─────────────────────────────────────────────────────────────');

  const subAgentTotal =
    (data.sub_agent_tokens.research || 0) +
    (data.sub_agent_tokens.security || 0) +
    (data.sub_agent_tokens.test || 0);

  if (data.sub_agent_tokens.research) {
    console.log(`  Research Agent: ${data.sub_agent_tokens.research.toLocaleString()} tokens`);
  }
  if (data.sub_agent_tokens.security) {
    console.log(`  Security Agent: ${data.sub_agent_tokens.security.toLocaleString()} tokens`);
  }
  if (data.sub_agent_tokens.test) {
    console.log(`  Test Agent:     ${data.sub_agent_tokens.test.toLocaleString()} tokens`);
  }

  console.log(`  Sub-Agent Total: ${subAgentTotal.toLocaleString()} tokens (Haiku)`);
  console.log(`  Sonnet Main:     ${data.sonnet_tokens.toLocaleString()} tokens`);
  console.log('  ────────────────────────────────────────────────────────────');
  console.log(`  TOTAL:           ${data.total_tokens.toLocaleString()} tokens`);

  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('  Cost Analysis');
  console.log('─────────────────────────────────────────────────────────────');

  const haikuCost = subAgentTotal * HAIKU_COST_PER_TOKEN;
  const sonnetCost = data.sonnet_tokens * SONNET_COST_PER_TOKEN;

  console.log(`  Haiku Cost:   $${haikuCost.toFixed(4)}`);
  console.log(`  Sonnet Cost:  $${sonnetCost.toFixed(4)}`);
  console.log('  ────────────────────────────────────────────────────────────');
  console.log(`  TOTAL COST:   $${data.total_cost_usd.toFixed(4)}`);

  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('  Baseline Comparison');
  console.log('─────────────────────────────────────────────────────────────');

  console.log(`  Baseline Tokens: ${data.baseline_comparison.baseline_tokens.toLocaleString()}`);
  console.log(`  Baseline Cost:   $${data.baseline_comparison.baseline_cost_usd.toFixed(4)}`);
  console.log('  ────────────────────────────────────────────────────────────');
  console.log(
    `  Token Savings:   ${data.baseline_comparison.token_savings_pct.toFixed(1)}% (${(data.baseline_comparison.baseline_tokens - data.total_tokens).toLocaleString()} tokens)`
  );
  console.log(
    `  Cost Savings:    ${data.baseline_comparison.cost_savings_pct.toFixed(1)}% ($${(data.baseline_comparison.baseline_cost_usd - data.total_cost_usd).toFixed(4)})`
  );

  // Pass/Fail based on projections (≥50% savings target)
  const passTokens = data.baseline_comparison.token_savings_pct >= 50;
  const passCost = data.baseline_comparison.cost_savings_pct >= 50;

  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('  Test Results');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`  Token Savings (≥50%):  ${passTokens ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Cost Savings (≥50%):   ${passCost ? '✅ PASS' : '❌ FAIL'}`);

  if (data.quality_metrics) {
    console.log(
      `  Task Success:          ${data.quality_metrics.task_success ? '✅ PASS' : '❌ FAIL'}`
    );
    if (data.quality_metrics.findings_used_pct !== undefined) {
      console.log(
        `  Findings Used (≥60%):  ${data.quality_metrics.findings_used_pct >= 60 ? '✅ PASS' : '❌ FAIL'} (${data.quality_metrics.findings_used_pct.toFixed(1)}%)`
      );
    }
    if (data.quality_metrics.false_positive_pct !== undefined) {
      console.log(
        `  False Positives (≤10%): ${data.quality_metrics.false_positive_pct <= 10 ? '✅ PASS' : '❌ FAIL'} (${data.quality_metrics.false_positive_pct.toFixed(1)}%)`
      );
    }
    if (data.quality_metrics.developer_rating !== undefined) {
      console.log(
        `  Developer Rating (≥4): ${data.quality_metrics.developer_rating >= 4 ? '✅ PASS' : '❌ FAIL'} (${data.quality_metrics.developer_rating}/5)`
      );
    }
  }

  console.log('\n');
}

/**
 * Save report to file
 */
function saveReport(data: TokenUsageReport, outputPath: string): void {
  const reportDir = path.dirname(outputPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`📄 Report saved to: ${outputPath}`);
}

/**
 * Create token usage report
 */
function createReport(
  workflow: string,
  subAgentTokens: { research?: number; security?: number; test?: number },
  sonnetTokens: number,
  executionTimeMs: number,
  qualityMetrics?: TokenUsageReport['quality_metrics']
): TokenUsageReport {
  const config = WORKFLOW_BASELINES[workflow];
  if (!config) {
    throw new Error(`Unknown workflow: ${workflow}`);
  }

  const totalSubAgentTokens =
    (subAgentTokens.research || 0) + (subAgentTokens.security || 0) + (subAgentTokens.test || 0);

  const totalTokens = totalSubAgentTokens + sonnetTokens;
  const totalCost = calculateCost(totalSubAgentTokens, sonnetTokens);

  const tokenSavings = calculateSavings(totalTokens, config.baseline_tokens);
  const costSavings = calculateSavings(totalCost, config.baseline_cost_usd);

  return {
    workflow,
    timestamp: new Date().toISOString(),
    sub_agent_tokens: subAgentTokens,
    sonnet_tokens: sonnetTokens,
    total_tokens: totalTokens,
    total_cost_usd: totalCost,
    execution_time_ms: executionTimeMs,
    baseline_comparison: {
      baseline_tokens: config.baseline_tokens,
      baseline_cost_usd: config.baseline_cost_usd,
      token_savings_pct: tokenSavings,
      cost_savings_pct: costSavings,
    },
    quality_metrics: qualityMetrics,
  };
}

/**
 * Aggregate multiple reports
 */
function aggregateReports(reports: TokenUsageReport[]): void {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                   Aggregated Test Results                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const totalBaseline = reports.reduce((sum, r) => sum + r.baseline_comparison.baseline_tokens, 0);
  const totalActual = reports.reduce((sum, r) => sum + r.total_tokens, 0);
  const totalBaselineCost = reports.reduce(
    (sum, r) => sum + r.baseline_comparison.baseline_cost_usd,
    0
  );
  const totalActualCost = reports.reduce((sum, r) => sum + r.total_cost_usd, 0);

  const avgTokenSavings = calculateSavings(totalActual, totalBaseline);
  const avgCostSavings = calculateSavings(totalActualCost, totalBaselineCost);

  console.log(`Tests Run:       ${reports.length}`);
  console.log(
    `Total Baseline:  ${totalBaseline.toLocaleString()} tokens ($${totalBaselineCost.toFixed(2)})`
  );
  console.log(
    `Total Actual:    ${totalActual.toLocaleString()} tokens ($${totalActualCost.toFixed(2)})`
  );
  console.log(`Avg Token Savings: ${avgTokenSavings.toFixed(1)}%`);
  console.log(`Avg Cost Savings:  ${avgCostSavings.toFixed(1)}%`);

  const passCount = reports.filter(
    (r) =>
      r.baseline_comparison.token_savings_pct >= 50 && r.baseline_comparison.cost_savings_pct >= 50
  ).length;

  console.log(`\n✅ Passed: ${passCount}/${reports.length}`);
  console.log(`❌ Failed: ${reports.length - passCount}/${reports.length}\n`);
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse CLI arguments
  const getArg = (name: string): string | undefined => {
    const arg = args.find((a) => a.startsWith(`--${name}=`));
    return arg?.split('=')[1];
  };

  const workflow = getArg('workflow');
  const baseline = getArg('baseline');
  const research = getArg('research');
  const security = getArg('security');
  const test = getArg('test');
  const haiku = getArg('haiku'); // shorthand for total sub-agent tokens
  const sonnet = getArg('sonnet');
  const time = getArg('time');
  const output = getArg('output');

  if (!workflow || !sonnet || !time) {
    console.error(
      'Usage: pnpm tsx track-tokens.ts --workflow=<name> --sonnet=<tokens> --time=<ms>'
    );
    console.error('Optional: --research=<tokens> --security=<tokens> --test=<tokens>');
    console.error('Optional: --haiku=<tokens> (total sub-agent tokens)');
    console.error('Optional: --output=<path> (save report to file)');
    console.error('\nExample:');
    console.error(
      '  pnpm tsx track-tokens.ts --workflow=/spec:plan --haiku=45000 --sonnet=5000 --time=28500'
    );
    process.exit(1);
  }

  const subAgentTokens: { research?: number; security?: number; test?: number } = {};

  if (haiku) {
    // If haiku provided, distribute evenly (or user can specify individual agents)
    const totalHaiku = parseInt(haiku, 10);
    if (research) subAgentTokens.research = parseInt(research, 10);
    if (security) subAgentTokens.security = parseInt(security, 10);
    if (test) subAgentTokens.test = parseInt(test, 10);

    // If no individual breakdown, assume haiku is total
    if (!research && !security && !test) {
      subAgentTokens.research = totalHaiku;
    }
  } else {
    if (research) subAgentTokens.research = parseInt(research, 10);
    if (security) subAgentTokens.security = parseInt(security, 10);
    if (test) subAgentTokens.test = parseInt(test, 10);
  }

  const report = createReport(workflow, subAgentTokens, parseInt(sonnet, 10), parseInt(time, 10));

  generateReport(report);

  if (output) {
    saveReport(report, output);
  }
}

// Run main if this is the entry point
if (require.main === module || process.argv[1]?.endsWith('track-tokens.ts')) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for programmatic use
export { createReport, generateReport, aggregateReports, type TokenUsageReport };
