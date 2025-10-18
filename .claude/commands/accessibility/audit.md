---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/accessibility:audit'
version: '1.0.0'
lane: 'lightweight'
tags: ['accessibility', 'a11y', 'wcag', 'audit', 'compliance']
when_to_use: >
  Run accessibility audit using axe-core to validate WCAG 2.1 AA compliance.

arguments:
  - name: target
    type: string
    required: false
    example: '/dashboard | --component Button | full'
  - name: severity
    type: string
    required: false
    example: 'critical | serious | moderate | minor'

inputs: []
outputs:
  - type: 'report'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#commandDefaults'

allowed-tools:
  - 'Bash(*)'
  - 'Read(*)'
  - 'Write(*)'
  - 'Glob(*)'

preconditions:
  - 'Development server can be started'
  - '@axe-core/playwright is installed'

postconditions:
  - 'Accessibility report generated'
  - 'Violations categorized by severity'
  - 'Pass/fail status determined'

artifacts:
  produces:
    - { path: 'scratch/accessibility-audit-*.md', purpose: 'Accessibility audit report' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'process'
      ops: ['execute']

timeouts:
  softSeconds: 90
  hardSeconds: 180

idempotent: true
dryRun: false
estimatedRuntimeSec: 60
costHints: 'Requires dev server; uses Playwright for testing'

references:
  - 'https://www.w3.org/WAI/WCAG21/quickref/'
  - 'https://github.com/dequelabs/axe-core'
  - 'docs/testing/TESTING_GUIDE.md'
---

# /accessibility:audit

**Goal:**
Run comprehensive accessibility audit using axe-core to validate WCAG 2.1 AA compliance.

**Prompt:**

1. Parse target and severity arguments (defaults: target=full, severity=moderate).
2. Check if `@axe-core/playwright` is installed; install if missing.
3. Create or use existing accessibility test script.
4. Run axe-core audit on specified target:
   - `full`: Scan all routes in the application
   - `/path`: Scan specific route (e.g., `/dashboard`)
   - `--component Name`: Scan specific component in design system
5. Collect violations by severity (critical, serious, moderate, minor).
6. Generate human-readable report with:
   - Violations by severity
   - Affected elements (with selectors)
   - WCAG success criteria references
   - Remediation guidance
   - Compliance score
7. Save report to `scratch/accessibility-audit-YYYY-MM-DD.md`.
8. Suggest next steps based on findings.

**Examples:**

- `/accessibility:audit` → scans all routes for moderate+ severity issues
- `/accessibility:audit /dashboard` → scans dashboard route only
- `/accessibility:audit --component Button` → scans Button component in Storybook/design system
- `/accessibility:audit full critical` → scans all routes for critical issues only

**Audit Areas:**

1. **Color Contrast**
   - Text contrast ratios (4.5:1 minimum for AA)
   - UI element contrast (3:1 minimum)
   - Check all theme modes (light/dark)

2. **Keyboard Navigation**
   - All interactive elements accessible via keyboard
   - Visible focus indicators
   - Logical tab order

3. **Screen Reader Compatibility**
   - Semantic HTML usage
   - ARIA labels present and correct
   - Alt text for images
   - Form labels properly associated

4. **WCAG 2.1 AA Compliance**
   - Level A violations (critical)
   - Level AA violations (required for compliance)
   - Best practices

**Output Format:**

Present findings clearly:

```markdown
# Accessibility Audit Report

**Date:** YYYY-MM-DD
**Target:** Full/Route/Component
**Severity Threshold:** Critical/Serious/Moderate/Minor

## Summary

- **Total Violations:** 12
- **Critical:** 0
- **Serious:** 3
- **Moderate:** 7
- **Minor:** 2
- **Compliance Score:** 75% (9/12 WCAG criteria passed)

## Critical Issues

### 1. Missing form labels

**Severity:** Critical
**WCAG Criteria:** [1.3.1 Info and Relationships (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships)

**Impact:** Screen reader users cannot identify form fields.

**Affected Elements:**
- `input#email` in [Login.tsx:42](apps/web/src/components/Login.tsx#L42)
- `input#password` in [Login.tsx:48](apps/web/src/components/Login.tsx#L48)

**Evidence:**
```html
<input type="email" id="email" placeholder="Email" />
```

**Remediation:**
```tsx
<label htmlFor="email">Email</label>
<input type="email" id="email" placeholder="Email" />

// Or use visually hidden label:
<label htmlFor="email" className="sr-only">Email</label>
<input type="email" id="email" placeholder="Email" />
```

## Serious Issues

### 2. Insufficient color contrast

**Severity:** Serious
**WCAG Criteria:** [1.4.3 Contrast (Minimum) (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)

**Impact:** Users with low vision cannot read text.

**Affected Elements:**
- `.text-muted` in [Button.tsx:15](packages/ui/components/Button.tsx#L15) - Contrast ratio 3.2:1 (needs 4.5:1)

**Evidence:**
```css
.text-muted {
  color: #9ca3af; /* Gray-400 on white background */
}
```

**Remediation:**
```css
.text-muted {
  color: #6b7280; /* Gray-500 - contrast ratio 4.6:1 */
}
```

## Moderate Issues

...

## Minor Issues

...

## Recommendations

- Fix 0 critical issues immediately
- Address 3 serious issues in next sprint
- Consider implementing automated a11y testing in CI/CD
- Add accessibility linting (eslint-plugin-jsx-a11y)
- Review design system components for ARIA best practices

## Compliance Status

- **WCAG 2.1 Level A:** ✅ PASS (0 violations)
- **WCAG 2.1 Level AA:** ❌ FAIL (3 serious violations)
- **Best Practices:** ⚠️ PARTIAL (9 recommendations)

**Overall:** Not compliant with WCAG 2.1 AA
```

**Implementation:**

```typescript
// scripts/accessibility/run-axe.ts
import { chromium, Browser, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'fs';

async function runAccessibilityAudit(
  target: string = 'full',
  severityThreshold: string = 'moderate'
) {
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();

  // Define routes to scan
  const routes = target === 'full'
    ? ['/', '/dashboard', '/design', '/login']
    : [target];

  const allViolations: any[] = [];

  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`);

    // Run axe-core audit
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Filter by severity threshold
    const filteredViolations = results.violations.filter(v => {
      const severityLevels = ['minor', 'moderate', 'serious', 'critical'];
      const thresholdIndex = severityLevels.indexOf(severityThreshold);
      const violationIndex = severityLevels.indexOf(v.impact || 'minor');
      return violationIndex >= thresholdIndex;
    });

    allViolations.push(...filteredViolations.map(v => ({
      ...v,
      route
    })));
  }

  await browser.close();

  // Generate report
  const report = generateReport(allViolations, target, severityThreshold);
  const date = new Date().toISOString().split('T')[0];
  writeFileSync(`scratch/accessibility-audit-${date}.md`, report);

  console.log(report);

  // Exit with error if violations found
  process.exit(allViolations.length > 0 ? 1 : 0);
}

function generateReport(violations: any[], target: string, threshold: string): string {
  // Generate markdown report (implementation details)
  // ...
}

// CLI
const target = process.argv[2] || 'full';
const severity = process.argv[3] || 'moderate';
runAccessibilityAudit(target, severity);
```

**Failure & Recovery:**

- If dev server not running → Start it automatically or prompt user
- If @axe-core/playwright not installed → Install automatically
- If target route 404s → Skip and warn, continue with other routes
- If no violations found → Document clean accessibility status

**Integration:**

Add to CI workflow:

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Audit

on:
  pull_request:
  workflow_dispatch:

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: ./.github/actions/setup

      - name: Build app
        run: pnpm --filter=web build

      - name: Start dev server
        run: pnpm --filter=web dev &

      - name: Wait for dev server
        run: npx wait-on http://localhost:3000

      - name: Run accessibility audit
        run: pnpm a11y:audit
        continue-on-error: true

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-report
          path: scratch/accessibility-audit-*.md
```

Add to `package.json`:

```json
{
  "scripts": {
    "a11y:audit": "tsx scripts/accessibility/run-axe.ts",
    "a11y:audit:critical": "tsx scripts/accessibility/run-axe.ts full critical"
  }
}
```

**Important:**

- Results are deterministic and reproducible
- Uses industry-standard axe-core rules
- Provides specific, actionable remediation steps
- Can be integrated into CI/CD for continuous validation
- Supports incremental improvements (severity threshold filtering)