---
skill: design-system
version: 1.0.0
category: design
description: Proactive UI generation and automated design system enforcement
triggers:
  - validate
  - generate_component
  - visual_review
  - accessibility_check
---

# /design - Design System Management

**Purpose:** Automated design system enforcement and component generation

## Usage

```bash
/design viewer                   # Open /design route
/design validate                 # Run all design checks
/design validate-tokens          # Token compliance only
/design validate-spacing         # Layout density check
/design contrast-check           # WCAG contrast validation
/design visual-diff              # Screenshot comparison
/design copy-review              # UX writing quality
/design generate <name> [var]    # Scaffold component
/design performance-check [comp] # Performance metrics
/design figma-import [file_id]   # Import from Figma (Phase 5)
```

## Progressive Disclosure

- **Level 1**: skill.json (~20 tokens)
- **Level 2**: SKILL.md (~250 tokens)
- **Level 3**: Scripts execute, output only (~0 tokens)

**Token Savings:** 80% vs command-based system

## Sub-Agent Integration

When `/design validate` is called, the Skill orchestrates 5 specialized Sub-Agents:

- **Design Review Agent** - Token + spacing validation
- **A11y Review Agent** - WCAG compliance + axe-core
- **Visual Regression Agent** - Screenshot comparison
- **Copy Review Agent** - UX writing quality
- **Usability Review Agent** - Nielsen heuristics

Results are aggregated by a **Manager Agent** and posted as a PR comment.

## Playwright MCP Integration

Uses **Chrome DevTools Protocol (CDP)** via `@executeautomation/playwright-mcp-server` for:

- Computed styles (actual spacing, colors at runtime)
- Contrast ratio calculation
- Layout metrics (shifts, positioning)
- Performance profiling (FCP, LCP, paint timing)

## When to Use

- Before creating PRs with UI changes
- When adding new components
- To validate design token usage
- For WCAG compliance checks
- To open component viewer
- To scaffold components following design system patterns

## Phase 0 Status

- ✅ **viewer**: Functional (opens /design route)
- ⏭️ **validate-tokens**: Stub (Phase 2)
- ⏭️ **validate-spacing**: Stub (Phase 2-3, requires CDP)
- ⏭️ **contrast-check**: Stub (Phase 2-3, requires CDP)
- ⏭️ **visual-diff**: Stub (Phase 3)
- ⏭️ **copy-review**: Stub (Phase 3)
- ⏭️ **generate**: Stub (Phase 4)
- ⏭️ **performance-check**: Stub (Phase 2-3)
- ⏭️ **figma-import**: Stub (Phase 5, optional)

## Execution

```bash
bash scripts/skills/design-system.sh "$@"
```

## Token System Architecture

**3-tier structure:**

1. **Raw tokens**: Base values (colors, spacing scale, typography)
2. **Semantic tokens**: Purpose-based (background-primary, text-muted)
3. **Component tokens**: Component-specific overrides (button-padding)

**Location:** `packages/ui/src/tokens/` (Phase 1)
**Validation:** AST parsing + CDP runtime validation
**Auto-fix:** Available for color and spacing violations

## CI/CD Integration

**GitHub Actions:** `.github/workflows/design-review.yml` (Phase 3)

**Pass/Fail Criteria:**

- Overall score ≥80/100
- WCAG AA violations = 0 (blocker)
- Token compliance ≥95%

**Outputs:**

- PR comment with aggregated score
- Visual diff artifacts
- Auto-fix suggestions

## References

- **Deep Planning:** [docs/scratch/design-system-deep-planning-opus.md](docs/scratch/design-system-deep-planning-opus.md)
- **Assessment:** [docs/scratch/design-system-assessment-and-next-steps.md](docs/scratch/design-system-assessment-and-next-steps.md)
- **Skill Definition:** [.claude/skills/design-system/SKILL.md](.claude/skills/design-system/SKILL.md)
- **Scripts:** [.claude/skills/design-system/scripts/](.claude/skills/design-system/scripts/)