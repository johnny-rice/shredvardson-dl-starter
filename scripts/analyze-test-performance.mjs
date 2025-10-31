#!/usr/bin/env node

/**
 * Test Performance Analyzer
 *
 * Analyzes Vitest JSON output to identify slow tests and provide actionable insights.
 * Used by pre-push hooks and CI to track test execution time.
 *
 * Usage:
 *   node scripts/analyze-test-performance.mjs [path/to/results.json] [--top N]
 *   # Or: pnpm test:analyze-performance
 *   # Help: --help to print options
 *
 * Options:
 *   --top N     Show top N slowest tests (default: 10)
 *   --threshold MS  Warn about tests slower than MS milliseconds (default: 1000)
 *   --json      Output results as JSON
 *   --help      Show this help message
 */

import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

/**
 * Parses a flag argument from command line args
 * @param {string[]} args - Command line arguments
 * @param {string} flagName - Name of the flag (without --)
 * @param {string} defaultValue - Default value if flag not found
 * @returns {string} The flag value or default
 */
function parseFlagArg(args, flagName, defaultValue) {
  const flagArg = args.find((arg) => arg.startsWith(`--${flagName}`));
  if (!flagArg) return defaultValue;

  // Handle --flag=value format
  if (flagArg.includes('=')) {
    return flagArg.split('=')[1];
  }

  // Handle --flag value format
  const flagIndex = args.indexOf(flagArg);
  const nextArg = args[flagIndex + 1];
  return nextArg && !nextArg.startsWith('--') ? nextArg : defaultValue;
}

// Parse command line arguments
const args = process.argv.slice(2);

// Find the results path - first non-flag argument that isn't a flag value
const firstPositional = args.find((arg, index) => {
  if (arg.startsWith('--')) return false;
  // Skip if previous arg was a flag without '=' (meaning this is its value)
  if (index > 0) {
    const prevArg = args[index - 1];
    if (prevArg.startsWith('--') && !prevArg.includes('=')) {
      return false;
    }
  }
  return true;
});
const resultsPath = firstPositional || 'apps/web/test-results/results.json';

const topN = parseInt(parseFlagArg(args, 'top', '10'), 10);
const threshold = parseInt(parseFlagArg(args, 'threshold', '1000'), 10);
const jsonOutput = args.includes('--json');

// Handle help flag
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Test Performance Analyzer

Usage:
  node scripts/analyze-test-performance.mjs [path/to/results.json] [options]
  pnpm test:analyze-performance [options]

Options:
  --top N         Show top N slowest tests (default: 10)
  --threshold MS  Warn about tests slower than MS milliseconds (default: 1000)
  --json          Output results as JSON
  --help, -h      Show this help message

Examples:
  node scripts/analyze-test-performance.mjs
  node scripts/analyze-test-performance.mjs --top=5
  node scripts/analyze-test-performance.mjs custom.json --top 3 --threshold 500
  `);
  process.exit(0);
}

// Validate arguments
if (isNaN(topN) || topN <= 0) {
  console.error('❌ --top must be a positive number');
  process.exit(1);
}
if (isNaN(threshold) || threshold < 0) {
  console.error('❌ --threshold must be a non-negative number');
  process.exit(1);
}

/**
 * Analyzes test results and extracts performance metrics
 */
function analyzeTestPerformance(resultsPath) {
  try {
    const rawData = readFileSync(resolve(resultsPath), 'utf-8');
    const results = JSON.parse(rawData);

    // Validate JSON structure
    if (!results.testResults || !Array.isArray(results.testResults)) {
      console.error('❌ Invalid test results format: missing or invalid testResults array');
      console.error('💡 Ensure tests were run with JSON reporter: pnpm test:unit');
      process.exit(1);
    }

    const tests = [];
    let totalDuration = 0;
    let slowTestCount = 0;

    // Extract test durations from the results
    for (const file of results.testResults) {
      for (const result of file.assertionResults || []) {
        const duration = result.duration || 0;
        totalDuration += duration;

        if (duration > threshold) {
          slowTestCount++;
        }

        tests.push({
          file: relative(process.cwd(), file.name),
          name: result.title,
          fullName: result.ancestorTitles
            ? [...result.ancestorTitles, result.title].join(' > ')
            : result.title,
          duration,
          status: result.status,
        });
      }
    }

    // Sort tests by duration (slowest first)
    tests.sort((a, b) => b.duration - a.duration);

    const slowTests = tests.slice(0, topN);
    const avgDuration = tests.length > 0 ? totalDuration / tests.length : 0;

    // Calculate wall time if available
    const wallTimeMs =
      typeof results.startTime === 'number' && typeof results.endTime === 'number'
        ? Math.max(0, results.endTime - results.startTime)
        : undefined;

    return {
      totalTests: tests.length,
      totalDuration,
      wallTimeMs,
      avgDuration,
      slowTestCount,
      threshold,
      slowTests,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Test results file not found: ${resultsPath}`);
      console.error('💡 Run tests with JSON reporter first: pnpm test:unit');
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Formats duration in milliseconds to a human-readable string
 */
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Returns an appropriate icon for a test status
 */
function statusIcon(status) {
  switch (status) {
    case 'passed':
      return '✅';
    case 'failed':
      return '❌';
    case 'skipped':
    case 'pending':
      return '⏭️';
    case 'todo':
      return '📝';
    case 'flaky':
      return '⚠️';
    default:
      return '•';
  }
}

/**
 * Outputs the analysis results
 */
function outputResults(analysis) {
  if (jsonOutput) {
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  console.log('\n🔍 Test Performance Analysis\n');

  if (analysis.totalTests === 0) {
    console.log('ℹ️  No tests found in results. Did you run pnpm test:unit?\n');
    return;
  }

  console.log(`📊 Total Tests: ${analysis.totalTests}`);
  console.log(`⏱️  Total Test Time (sum): ${formatDuration(analysis.totalDuration)}`);
  if (analysis.wallTimeMs) {
    console.log(`🧱 Wall Time: ${formatDuration(analysis.wallTimeMs)}`);
  }
  console.log(`📈 Average Duration: ${formatDuration(analysis.avgDuration)}`);
  console.log(
    `⚠️  Slow Tests (>${formatDuration(analysis.threshold)}): ${analysis.slowTestCount}\n`
  );

  if (analysis.slowTests.length === 0) {
    console.log('✅ No slow tests detected! All tests ran quickly.\n');
    return;
  }

  console.log(`🐌 Top ${analysis.slowTests.length} Slowest Tests:\n`);

  for (let i = 0; i < analysis.slowTests.length; i++) {
    const test = analysis.slowTests[i];
    const rank = `${i + 1}.`.padEnd(4);
    const duration = formatDuration(test.duration).padStart(8);
    const status = statusIcon(test.status);

    console.log(`${rank}${duration}  ${status}  ${test.fullName}`);
    console.log(`     ${test.file}`);
    console.log('');
  }

  // Provide actionable recommendations
  if (analysis.slowTestCount > 0) {
    console.log('💡 Recommendations:\n');
    console.log('   • Review slow tests and look for opportunities to optimize');
    console.log('   • Consider mocking expensive operations (API calls, file I/O)');
    console.log('   • Use test.concurrent() for independent tests that can run in parallel');
    console.log('   • Move slow integration tests to E2E suite if appropriate\n');
  }

  // Warn if pre-push threshold is at risk
  const estimatedPushTime = analysis.totalDuration / 1000;
  if (estimatedPushTime > 15) {
    console.log('⚠️  WARNING: Total test time exceeds pre-push target (15s)\n');
    console.log(`   Current: ${formatDuration(analysis.totalDuration)}`);
    console.log('   Target: 8-15s\n');
    console.log('   Action needed to maintain fast pre-push hooks!\n');
  }
}

// Run the analysis
try {
  const analysis = analyzeTestPerformance(resultsPath);
  outputResults(analysis);

  // Exit with error code if tests are too slow
  const estimatedPushTime = analysis.totalDuration / 1000;
  if (estimatedPushTime > 20) {
    console.error('❌ Tests exceed critical threshold (20s) - immediate action required!\n');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error analyzing test performance:', error.message);
  process.exit(1);
}
