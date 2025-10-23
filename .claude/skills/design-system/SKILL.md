# Design System Skill

Automated design system enforcement and UI generation.

## Actions

### viewer
Opens component viewer at /design route.
**Script**: `viewer.ts`

### validate-tokens
Validates token compliance.
**Checks**: Hardcoded colors/spacing, invalid CSS vars
**Output**: JSON violations, score, auto-fix suggestions

### validate-spacing
Measures layout density via CDP.
**Method**: Playwright MCP computed styles
**Output**: JSON density score, violations

### contrast-check
Verifies WCAG AA contrast (4.5:1 normal, 3:1 large).
**Method**: CDP colors → contrast calc
**Output**: JSON ratios, pass/fail

### visual-diff
Compares against baselines (5% tolerance).
**Method**: Playwright screenshots + pixelmatch
**Output**: JSON diff %, images, breaking changes

### copy-review
Evaluates UX writing (LLM Judge).
**Rubrics**: Clarity, Empathy (0-5 scale)
**Output**: JSON scores, suggestions

### generate-component <name> [variant]
Scaffolds component with tokens.
**Template**: Handlebars
**Output**: Component, test, story files

### performance-check [component]
Measures FCP, LCP via CDP.
**Phase**: 2-3 (stub in Phase 0)

### figma-import [file_id]
Imports tokens from Figma.
**Phase**: 5 (stub only)

## Token System

3-tier architecture: raw → semantic → component
**Location**: `packages/ui/src/tokens/`
**Validation**: AST + CDP
**Auto-fix**: Colors, spacing

## Sub-Agents (Phase 3)

5 agents orchestrated by Manager:
- Design Review (tokens, spacing)
- A11y Review (WCAG, axe-core)
- Visual Regression (screenshots)
- Copy Review (UX writing)
- Usability Review (Nielsen)

## Playwright MCP

CDP for computed styles, contrast, performance (FCP, LCP).

## CI/CD (Phase 3)

**Pass criteria**: Score ≥80%, WCAG AA = 0 violations, tokens ≥95%
**Output**: PR comment with scores, diffs, auto-fixes

## Token Efficiency

**Old**: ~1,200 tokens per workflow
**New**: 20-270 tokens (80-95% savings)

## Version

1.0.0 - Phase 1 (viewer + patterns)
