# Design System Skill

**Version:** 1.0.0 (Phase 0)
**Category:** Design
**Discovery Command:** `/design`

Proactive UI generation and automated design system enforcement via progressive disclosure and Sub-Agent orchestration.

## Overview

The Design System Skill provides automated validation, generation, and enforcement of design system standards. It leverages:

- **Progressive disclosure** for token efficiency (80% savings)
- **Chrome DevTools Protocol (CDP)** for runtime validation
- **Sub-Agent orchestration** for comprehensive design review
- **LLM Judge** for subjective quality assessment
- **Visual regression testing** for detecting unintended changes

## Quick Start

```bash
# Open component viewer
/design viewer

# Run all validations (Phase 2+)
/design validate

# Check token compliance
/design validate-tokens

# Generate a new component
/design generate Button primary
```

## Architecture

### 3-Tier Token System

1. **Raw tokens**: Base values (colors, spacing scale, typography)
2. **Semantic tokens**: Purpose-based (background-primary, text-muted)
3. **Component tokens**: Component-specific overrides (button-padding)

### Sub-Agent Orchestration

When `/design validate` is called:

1. **Design Review Agent** validates token + spacing compliance
2. **A11y Review Agent** checks WCAG contrast ratios and axe-core violations
3. **Visual Regression Agent** compares screenshots against baselines
4. **Copy Review Agent** evaluates UX writing quality (clarity, empathy)
5. **Usability Review Agent** applies Nielsen heuristics

Results are aggregated by a **Manager Agent** and posted as a GitHub PR comment with:

- Overall score (0-100)
- Breakdown by category
- Top 5 issues (prioritized by severity)
- Auto-fix suggestions (if available)

### Playwright MCP Integration

Uses **Chrome DevTools Protocol (CDP)** via `@executeautomation/playwright-mcp-server` for:

- **Computed styles**: Get actual spacing, colors at runtime (not source code)
- **Contrast ratios**: Calculate WCAG compliance from rendered colors
- **Layout metrics**: Detect layout shifts, positioning changes
- **Performance profiling**: Measure FCP, LCP, paint timing

## Capabilities (Phase 0)

### ✅ Functional in Phase 0

- **viewer**: Opens the `/design` route for component browsing

### ⏭️ Stubs (Full implementation in later phases)

- **validate-tokens**: AST parsing for hardcoded colors/spacing (Phase 2)
- **validate-spacing**: CDP for layout density (Phase 2-3)
- **contrast-check**: CDP for WCAG contrast ratios (Phase 2-3)
- **visual-diff**: Playwright screenshot comparison (Phase 3)
- **copy-review**: LLM Judge for UX writing (Phase 3)
- **generate-component**: Handlebars-based scaffolding (Phase 4)
- **performance-check**: CDP for performance metrics (Phase 2-3)
- **figma-import**: Figma MCP integration (Phase 5, optional)

## Scripts

All scripts are in [scripts/](scripts/) and return structured JSON:

- [viewer.ts](scripts/viewer.ts) - Opens /design route
- [validate-tokens.ts](scripts/validate-tokens.ts) - Token compliance check
- [validate-spacing.ts](scripts/validate-spacing.ts) - Layout density via CDP
- [contrast-check.ts](scripts/contrast-check.ts) - WCAG contrast via CDP
- [visual-diff.ts](scripts/visual-diff.ts) - Screenshot comparison
- [copy-review.ts](scripts/copy-review.ts) - UX writing quality
- [generate-component.ts](scripts/generate-component.ts) - Component scaffolding
- [performance-check.ts](scripts/performance-check.ts) - Performance metrics via CDP
- [figma-import.ts](scripts/figma-import.ts) - Figma token import (Phase 5)

## Progressive Disclosure

**Level 1** (always loaded): [skill.json](skill.json) (~20 tokens)
**Level 2** (on trigger): [SKILL.md](SKILL.md) (~250 tokens)
**Level 3** (on-demand): Scripts executed, only output returned (~0 tokens)

Scripts are **never loaded into context** - they execute and return JSON.

## Token Efficiency

**Old system** (27 commands):

- Multiple design commands: ~400 tokens each
- Total: ~1,200+ tokens per workflow

**New Skill**:

- Metadata: 20 tokens
- SKILL.md: 250 tokens (progressive)
- Scripts: 0 tokens (executed, not loaded)
- **Total: 270 tokens** (only when full context needed)
- **Typical: 20 tokens** (metadata only for simple actions)

**Savings:** 80% average, 95% in common workflows

## CI/CD Integration (Phase 3)

### GitHub Actions

`.github/workflows/design-review.yml` triggers on PRs touching UI files.

**Pass/Fail Criteria:**

- Overall score ≥80/100
- WCAG AA violations = 0 (blocker)
- Token compliance ≥95%

**Outputs:**

- PR comment with aggregated score
- Visual diff artifacts
- Auto-fix suggestions

### Example PR Comment

```markdown
## Design System Review

**Overall Score: 72/100** ❌ Below threshold (80 required)

### Breakdown

- ✅ Design Review: 92/100 (token compliance, spacing)
- ❌ Accessibility: 68/100 (WCAG violations)
- ✅ Visual Regression: 95/100 (minor diffs within tolerance)
- ⚠️ Copy Quality: 78/100 (could be clearer)
- ✅ Usability: 82/100 (mostly follows heuristics)

### Blocking Issues (2)

1. **Contrast ratio violation** (Button.tsx:42)
   - Current: 3.8:1
   - Required: 4.5:1 (WCAG AA)
   - Fix: Use `var(--color-primary-darker)`

2. **Hardcoded color** (Card.tsx:18)
   - Found: `#3b82f6`
   - Expected: `var(--color-*)`
   - Auto-fix available: Run `/design validate --auto-fix`
```

## Development Phases

### Phase 0 (✅ Current)

- Directory structure
- skill.json + SKILL.md
- 9 script stubs (all return JSON)
- `/design` discovery command
- Bash wrapper
- Progressive disclosure validation

### Phase 1 (Pending)

- UX patterns documentation
- `/design` route implementation
- Component viewer UI
- Storybook integration

### Phase 2 (Pending)

- Token system implementation (raw → semantic → component)
- JSDoc annotations
- AST parsing for token validation
- CDP integration for spacing/contrast

### Phase 3 (Pending)

- 6 Sub-Agents (5 specialists + 1 manager)
- LLM Judge for Copy + Usability
- Visual regression testing
- CI/CD workflow
- Manager Agent PR comments

### Phase 4 (Pending)

- Component generation (Handlebars templates)
- Auto-fix for token violations
- Proactive UI generation

### Phase 5 (Optional)

- Figma MCP integration
- Token import/export
- Bidirectional sync (if available)

## References

- **Deep Planning:** [docs/scratch/design-system-deep-planning-opus.md](../../../docs/scratch/design-system-deep-planning-opus.md)
- **Assessment:** [docs/scratch/design-system-assessment-and-next-steps.md](../../../docs/scratch/design-system-assessment-and-next-steps.md)
- **Issue #187:** Phase 0 implementation
- **Issue #151:** Complete Design System Epic
- **ADR-002:** [Skills Architecture](../../../docs/adr/002-skills-architecture.md)

## Contributing

When adding new capabilities:

1. Create script in [scripts/](scripts/)
2. Return structured JSON (see existing scripts for schema)
3. Add to [skill.json](skill.json) `scripts` field
4. Update [SKILL.md](SKILL.md) with action documentation
5. Add to bash wrapper in [scripts/skills/design-system.sh](../../../scripts/skills/design-system.sh)
6. Update this README

## License

MIT
