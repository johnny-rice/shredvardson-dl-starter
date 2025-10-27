#!/usr/bin/env tsx

/**
 * Accessibility Audit Script using axe-core
 *
 * Runs automated accessibility testing using Playwright and axe-core
 * to validate WCAG 2.1 AA compliance.
 *
 * Usage:
 *   tsx scripts/accessibility/run-axe.ts [target] [severity]
 *
 * Examples:
 *   tsx scripts/accessibility/run-axe.ts              # Scan all routes, moderate+ severity
 *   tsx scripts/accessibility/run-axe.ts /dashboard   # Scan dashboard only
 *   tsx scripts/accessibility/run-axe.ts full critical # Scan all routes, critical only
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { type Browser, chromium, type Page } from '@playwright/test';

interface AxeViolation {
  id: string;
  impact?: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary?: string;
  }>;
  route?: string;
}

const SEVERITY_LEVELS = ['minor', 'moderate', 'serious', 'critical'] as const;
type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

// Default routes to scan
const DEFAULT_ROUTES = ['/', '/design'];

async function runAccessibilityAudit(
  target: string = 'full',
  severityThreshold: SeverityLevel = 'moderate'
): Promise<void> {
  console.log('🔍 Starting accessibility audit...\n');
  console.log(`Target: ${target}`);
  console.log(`Severity threshold: ${severityThreshold}\n`);

  const browser: Browser = await chromium.launch({ headless: true });

  const allViolations: AxeViolation[] = [];

  try {
    const page: Page = await browser.newPage();

    // Define routes to scan
    const routes = target === 'full' ? DEFAULT_ROUTES : target.startsWith('/') ? [target] : ['/'];

    for (const route of routes) {
      try {
        console.log(`📄 Scanning ${route}...`);
        await page.goto(`http://localhost:3000${route}`, {
          waitUntil: 'load',
          timeout: 30000,
        });

        // Run axe-core audit
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
          .analyze();

        // Filter by severity threshold
        const thresholdIndex = SEVERITY_LEVELS.indexOf(severityThreshold);
        const filteredViolations = results.violations.filter((v) => {
          const violationIndex = SEVERITY_LEVELS.indexOf(v.impact || 'minor');
          return violationIndex >= thresholdIndex;
        });

        console.log(`   Found ${filteredViolations.length} violations\n`);

        allViolations.push(
          ...filteredViolations.map((v) => ({
            ...v,
            route,
          }))
        );
      } catch (error) {
        console.error(`❌ Error scanning ${route}:`, error);
      }
    }
  } finally {
    await browser.close();
  }

  // Generate report
  const report = generateReport(allViolations, target, severityThreshold);
  const date = new Date().toISOString().split('T')[0];

  // Ensure scratch directory exists
  mkdirSync('scratch', { recursive: true });

  const reportPath = join('scratch', `accessibility-audit-${date}.md`);
  writeFileSync(reportPath, report);

  console.log('\n📊 Audit complete!');
  console.log(`📄 Report saved to: ${reportPath}\n`);
  console.log(report);

  // Exit with error if violations found
  const hasViolations = allViolations.length > 0;
  process.exit(hasViolations ? 1 : 0);
}

function generateReport(
  violations: AxeViolation[],
  target: string,
  threshold: SeverityLevel
): string {
  const date = new Date().toISOString().split('T')[0];

  // Count violations by severity
  const summary = {
    total: violations.length,
    critical: violations.filter((v) => v.impact === 'critical').length,
    serious: violations.filter((v) => v.impact === 'serious').length,
    moderate: violations.filter((v) => v.impact === 'moderate').length,
    minor: violations.filter((v) => v.impact === 'minor').length,
  };

  // Calculate WCAG compliance based on tags (more accurate than impact severity)
  const aViolations = violations.filter((v) => v.tags?.includes('wcag2a'));
  const aaViolations = violations.filter((v) => v.tags?.includes('wcag2aa'));

  let report = `# Accessibility Audit Report

**Date:** ${date}
**Target:** ${target}
**Severity Threshold:** ${threshold}

## Summary

- **Total Violations:** ${summary.total}
- **Critical:** ${summary.critical}
- **Serious:** ${summary.serious}
- **Moderate:** ${summary.moderate}
- **Minor:** ${summary.minor}
- **WCAG A Violations:** ${aViolations.length}
- **WCAG AA Violations:** ${aaViolations.length}

`;

  // Group violations by severity
  const criticalViolations = violations.filter((v) => v.impact === 'critical');
  const seriousViolations = violations.filter((v) => v.impact === 'serious');
  const moderateViolations = violations.filter((v) => v.impact === 'moderate');
  const minorViolations = violations.filter((v) => v.impact === 'minor');

  // Critical issues
  if (criticalViolations.length > 0) {
    report += '## Critical Issues\n\n';
    criticalViolations.forEach((v, i) => {
      report += formatViolation(v, i + 1);
    });
  }

  // Serious issues
  if (seriousViolations.length > 0) {
    report += '## Serious Issues\n\n';
    seriousViolations.forEach((v, i) => {
      report += formatViolation(v, i + 1);
    });
  }

  // Moderate issues
  if (moderateViolations.length > 0) {
    report += '## Moderate Issues\n\n';
    moderateViolations.forEach((v, i) => {
      report += formatViolation(v, i + 1);
    });
  }

  // Minor issues
  if (minorViolations.length > 0) {
    report += '## Minor Issues\n\n';
    minorViolations.forEach((v, i) => {
      report += formatViolation(v, i + 1);
    });
  }

  // Recommendations
  report += '## Recommendations\n\n';

  if (summary.critical > 0) {
    report += `- ⚠️ **URGENT:** Fix ${summary.critical} critical issue${summary.critical > 1 ? 's' : ''} immediately\n`;
  }
  if (summary.serious > 0) {
    report += `- 🔴 Address ${summary.serious} serious issue${summary.serious > 1 ? 's' : ''} in next sprint\n`;
  }
  if (summary.moderate > 0) {
    report += `- 🟡 Review ${summary.moderate} moderate issue${summary.moderate > 1 ? 's' : ''}\n`;
  }
  if (summary.minor > 0) {
    report += `- 🔵 Consider ${summary.minor} minor improvement${summary.minor > 1 ? 's' : ''}\n`;
  }

  report += '- Consider implementing automated a11y testing in CI/CD\n';
  report += '- Add accessibility linting (eslint-plugin-jsx-a11y)\n';
  report += '- Review design system components for ARIA best practices\n\n';

  // Compliance status
  report += '## Compliance Status\n\n';
  report += `- **WCAG 2.1 Level A:** ${summary.critical === 0 ? '✅ PASS' : '❌ FAIL'} (${summary.critical} violations)\n`;
  report += `- **WCAG 2.1 Level AA:** ${summary.critical === 0 && summary.serious === 0 ? '✅ PASS' : '❌ FAIL'} (${summary.critical + summary.serious} violations)\n`;
  report += `- **Best Practices:** ${summary.moderate === 0 ? '✅ PASS' : '⚠️ PARTIAL'} (${summary.moderate} recommendations)\n\n`;

  const isCompliant = summary.critical === 0 && summary.serious === 0;
  report += `**Overall:** ${isCompliant ? '✅ Compliant' : '❌ Not compliant'} with WCAG 2.1 AA\n`;

  return report;
}

function formatViolation(violation: AxeViolation, index: number): string {
  let output = `### ${index}. ${violation.help}\n\n`;
  output += `**Severity:** ${violation.impact || 'unknown'}\n`;
  output += `**WCAG Criteria:** [${violation.id}](${violation.helpUrl})\n`;
  output += `**Route:** ${violation.route || '/'}\n\n`;
  output += `**Impact:** ${violation.description}\n\n`;

  if (violation.nodes.length > 0) {
    output += '**Affected Elements:**\n';
    violation.nodes.slice(0, 3).forEach((node) => {
      output += `- \`${node.target.join(' ')}\`\n`;
    });
    if (violation.nodes.length > 3) {
      output += `- ... and ${violation.nodes.length - 3} more\n`;
    }
    output += '\n';

    output += `**Evidence:**\n\`\`\`html\n${violation.nodes[0].html}\n\`\`\`\n\n`;
  }

  output += `**Remediation:**\nSee [${violation.helpUrl}](${violation.helpUrl}) for detailed guidance.\n\n`;

  return output;
}

// CLI
const target = process.argv[2] || 'full';
const severity = (process.argv[3] || 'moderate') as SeverityLevel;

runAccessibilityAudit(target, severity).catch((error) => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
