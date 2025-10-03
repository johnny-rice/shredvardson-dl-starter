---
id: SPEC-20251002-ds-token-integration
type: spec
issue: 105
links: [feature-002-design-system-core-v2]
source: https://github.com/Shredvardson/dl-starter/issues/105
---

# Design System Token Integration — Feature Specification

## Problem & Goal

### User Need

**As a** product designer and solo founder building UI features,
**I need** visual consistency across all UI components without manual coordination,
**So that** the application maintains a professional, cohesive brand identity as I rapidly iterate on features.

### Current Pain Points

Users (developers/designers working on the codebase) currently experience:

1. **Design Drift**: Components use arbitrary color values instead of brand-approved tokens, creating visual inconsistency
2. **Manual Token Lookups**: Must reference token files separately when writing component styles, slowing down development
3. **No Token Enforcement**: Can accidentally break brand guidelines with hardcoded values, with no automated prevention
4. **Rebuild Friction**: Changing design tokens requires manual rebuilds and doesn't propagate automatically to affected components
5. **Lack of Visual Safety Net**: No way to catch unintended visual changes when tokens are modified

### Goal

Enable developers to write component styles using semantic token names that automatically resolve to brand-approved design values, with visual regression detection for token changes.

## Functional Requirements

### FR1: Semantic Token Access in Component Styles

**What**: Developers must be able to reference design tokens by semantic name (e.g., "primary color", "background color") when styling components, without knowing the underlying color values.

**Why**: Reduces cognitive load, prevents hardcoded values, ensures brand consistency by default.

**Acceptance Criteria**:
- Token names are available as utility classes (e.g., `bg-primary`, `text-foreground`)
- Token names work in both light and dark themes without code changes
- All shadcn/ui components automatically inherit token-based styles
- [NEEDS_CLARIFICATION]: Should tokens be available as Tailwind classes only, or also as CSS variables for custom components?

### FR2: Automatic Token Propagation

**What**: When a designer updates a design token value (e.g., changes primary color from blue to purple), all components using that token must reflect the change without manual updates.

**Why**: Enables rapid design iteration, prevents stale styles, reduces maintenance burden.

**Acceptance Criteria**:
- Changing token value in source triggers automatic rebuild of affected components
- No manual find-replace or component updates required
- All instances of token usage update consistently
- [NEEDS_CLARIFICATION]: What is the acceptable rebuild time for token changes? (Target: <5 seconds?)

### FR3: Visual Change Detection

**What**: The system must alert developers when token changes result in unexpected visual differences in UI components.

**Why**: Prevents accidental breaking of layouts, catches unintended design regressions, provides confidence for refactoring.

**Acceptance Criteria**:
- Visual snapshots captured for key UI states
- Token changes trigger visual comparison against baseline
- Clear reporting of visual differences (what changed, where)
- [NEEDS_CLARIFICATION]: Which components/pages require visual regression coverage initially? (Critical paths only vs. comprehensive coverage)

### FR4: Token Documentation Discovery

**What**: Developers must be able to quickly discover what tokens exist, their semantic meaning, and how to use them in components.

**Why**: Reduces onboarding friction, prevents token misuse, encourages correct usage patterns.

**Acceptance Criteria**:
- Single documentation source listing all available tokens
- Each token includes: semantic name, usage context, example usage
- Documentation explains how to add new tokens
- JSDoc comments include machine-readable design rationale (@usageGuidelines, @accessibilityConsiderations)
- [NEEDS_CLARIFICATION]: Should documentation be inline (code comments), external (README), or interactive (Storybook-style)?

### FR5: Component Update Workflow

**What**: Developers must have a documented, reliable process for incorporating upstream shadcn/ui updates without losing custom modifications.

**Why**: shadcn/ui components are copied into the codebase ("own your code"), so standard npm update doesn't work. Without a process, critical bug fixes and accessibility improvements are missed.

**Acceptance Criteria**:
- Documented workflow for checking upstream updates
- Process for comparing upstream changes with customized components (diff-and-merge)
- Clear guidelines on when to merge upstream vs. keep custom behavior
- No loss of custom modifications when applying updates

### FR6: Fluid Typography System

**What**: Text must scale smoothly across all viewport sizes without breakpoint-based jumps, maintaining readability and visual hierarchy.

**Why**: Modern responsive design requires fluid scaling for professional appearance on all devices, from mobile to ultra-wide displays.

**Acceptance Criteria**:
- Typography scales using CSS `clamp()` function
- Fluid scale defined for all type sizes (sm, base, lg, xl, 2xl, etc.)
- Text remains readable at minimum and maximum viewport widths
- No jarring size jumps when resizing browser

### FR7: Systematic Spacing Scale

**What**: All spacing (padding, margin, gap) must follow a proportional scale to create visual rhythm and consistency.

**Why**: Consistent spacing creates professional, harmonious layouts and simplifies design decisions.

**Acceptance Criteria**:
- 4pt or 8pt grid system enforced
- All spacing values are multiples of base unit (4px or 8px)
- Scale defined in shared Tailwind config
- Documentation explains spacing scale usage

### FR8: Motion Design System

**What**: Components must support purposeful, performant animations that enhance UX and provide feedback.

**Why**: Modern products require motion design for user delight, state feedback, and perceived performance. Well-executed micro-interactions significantly improve quality perception.

**Acceptance Criteria**:
- Animation library integrated (Framer Motion recommended)
- Reusable animation variants defined for common patterns
- `prefers-reduced-motion` accessibility support
- Animations use GPU-accelerated properties (transform, opacity)
- Clear guidelines on when and how to animate

## User Experience Requirements

### UX1: Developer Workflow - Adding New Component

**Scenario**: Developer adds a new shadcn/ui component to the project

**Expected Experience**:
1. Developer installs component via shadcn CLI
2. Component automatically uses semantic tokens (no manual configuration)
3. Component renders correctly in both light/dark themes immediately
4. Developer can customize component by changing token values, not hardcoded colors

**Success Criteria**:
- Zero-config token usage after component installation
- No need to manually wire up theme providers or token imports per component

### UX2: Designer Workflow - Updating Brand Colors

**Scenario**: Designer wants to experiment with different primary color values

**Expected Experience**:
1. Designer updates primary color token in single source file
2. Dev server automatically rebuilds (hot reload if possible)
3. All components using primary color update immediately in browser
4. Visual regression tests run automatically (or on-demand)
5. Designer can compare before/after screenshots to confirm changes

**Success Criteria**:
- Single source of truth for token values (one file to edit)
- Fast feedback loop (<10 seconds from edit to visual update)
- Clear visual diff for review before committing

### UX3: Developer Workflow - Token Change Review

**Scenario**: Developer reviewing PR that changes design token values

**Expected Experience**:
1. PR shows token value changes in code diff
2. PR includes visual regression report showing affected components
3. Reviewer can see before/after screenshots inline in PR
4. Reviewer can approve token changes with confidence

**Success Criteria**:
- Automated visual regression report attached to PR
- Clear labeling of intentional vs. accidental visual changes

## Success Criteria

### Business Outcomes

1. **Design Consistency**: 0 hardcoded color values in production component code (100% token usage)
2. **Development Speed**: Reduced time to add new components by 30% (no manual token wiring)
3. **Design Iteration Speed**: Designer can test brand color changes in <5 minutes (edit → preview → decide)
4. **Quality Assurance**: 0 visual regressions shipped to production from token changes (caught by automated tests)

### User Satisfaction Metrics

1. **Developer Confidence**: Developers feel confident making token changes without breaking UI (measured via team survey)
2. **Cognitive Load**: Developers don't need to remember hex codes or look up token files (zero hardcoded values in code reviews)
3. **Onboarding Time**: New developers can add themed components within 30 minutes of onboarding (measured via new contributor experience)

### Technical Quality Gates

1. **Token Coverage**: All shadcn/ui components use semantic tokens (no `bg-slate-900` style hardcoding)
2. **Build Pipeline**: Token changes trigger automatic rebuild of consuming packages
3. **Visual Regression**: Baseline screenshots exist for all critical UI components
4. **Documentation Completeness**: All tokens documented with usage examples

## Scope & Non-Goals

### In Scope

- Connecting existing Style Dictionary output to Tailwind configuration
- Converting existing shadcn/ui components to use semantic tokens
- Setting up build pipeline to rebuild Tailwind when tokens change
- Creating token usage documentation with examples (inline + README)
- Establishing visual regression testing infrastructure (basic setup)
- **Fluid typography system** using CSS `clamp()`
- **Systematic spacing scale** (4pt/8pt grid)
- **Motion design system** with Framer Motion and accessibility support
- **Component update workflow** documentation (diff-and-merge for shadcn)
- **JSDoc design rationale** for LLM-parsable component guidelines

### Explicitly Out of Scope

- Creating new design tokens (tokens already exist via Style Dictionary)
- Refactoring Design System package architecture (use existing `@dl-starter/ds`)
- Comprehensive visual regression coverage (start with critical components only)
- Brand guidelines or design system governance processes

### Deferred to Future Phases (Note for Discovery)

> **Note**: These were identified as valuable in Gemini Deep Research but are intentionally deferred to reduce Phase 1 complexity:

- **Storybook documentation site** (apps/docs/) - Deferred to Phase 4+ (automation/governance)
  - Rationale: High maintenance overhead for solopreneur; inline docs + README sufficient for Phase 1
  - Reconsider when: Team grows or component library reaches 30+ components

- **Design-to-code automation** (Figma → CSS variable sync via Supernova/Specify)
  - Rationale: Premature optimization; manual token editing sufficient for starter template
  - Reconsider when: High-frequency design iteration or multi-designer workflows emerge

## Risks & Dependencies

### User-Facing Risks

1. **Breaking Visual Changes**: Token integration could accidentally change existing component appearance
   - **Mitigation**: Visual regression baseline before integration, review all diffs

2. **Performance Impact**: Additional build steps could slow down development workflow
   - **Mitigation**: [NEEDS_CLARIFICATION] What is acceptable hot reload time? (Target: <3 seconds)

3. **Learning Curve**: Developers unfamiliar with token-based design might resist adoption
   - **Mitigation**: Clear documentation, examples, and migration guide

### Dependencies

- **Existing Design System**: `@dl-starter/ds` package must be functional and generating tokens
- **Existing Components**: shadcn/ui components already installed in `apps/web`
- **Build Tooling**: Turborepo must support cross-package build dependencies
- **Testing Infrastructure**: Playwright or similar for visual regression (may need setup)

### Open Questions

1. **Token Naming Convention**: Should we keep Style Dictionary output names or align with Tailwind/shadcn conventions?
   - *Impact*: Affects developer ergonomics and documentation clarity

2. **Hot Reload Scope**: Should token changes trigger full rebuild or incremental update?
   - *Impact*: Affects development workflow speed

3. **Visual Regression Tool**: Playwright + Chromatic, Percy, or open-source alternative?
   - *Impact*: Affects CI/CD cost and integration complexity

4. **Token Validation**: Should we validate token usage at build time (lint rule) or runtime?
   - *Impact*: Affects developer feedback loop and enforcement strictness

5. **Backward Compatibility**: How do we handle existing pages/components that don't use tokens yet?
   - *Impact*: Affects migration strategy and rollout timeline

## Clarifications Needed

Before moving to `/plan` phase, we need clarity on:

1. **Performance Expectations**: What is the acceptable rebuild time after token changes?
2. **Visual Testing Scope**: Which components/pages are critical for initial visual regression coverage?
3. **Documentation Format**: Inline code comments, separate README, or interactive tool?
4. **Migration Strategy**: Big-bang conversion of all components, or gradual rollout?
5. **Token Naming**: Keep Style Dictionary output or normalize to Tailwind conventions?

---

## ✅ Research-Backed Recommendations (Approved 2025-10-02)

Based on research of 2025 best practices for solopreneur, LLM-friendly, scalable starter templates:

### 1. Performance Expectations: **<3 seconds with Turborepo watch mode**

**Recommendation**: Target <3 seconds for incremental rebuilds using Turborepo 2.4+ watch mode with caching.

**Rationale**:
- Turborepo 2.4 introduced experimental caching in watch mode (`--experimental-write-cache`)
- Watch mode is dependency-aware and follows task graph order
- For token changes affecting multiple packages, use `interruptible: true` in turbo.json to restart tasks on changes
- <3 seconds keeps developer flow state intact (research shows >5s causes context switching)

**Implementation**:
- Use `turbo watch --experimental-write-cache` for dev workflow
- Configure turbo.json with proper dependencies: `@dl-starter/ds` → Tailwind build → component hot reload
- Mark token build tasks as interruptible for instant restarts

---

### 2. Visual Testing Scope: **Critical path only (20% coverage, 80% risk reduction)**

**Recommendation**: Start with thin E2E layer covering critical paths (auth, key CRUD flows, design system showcase page).

**Rationale**:
- Industry consensus for solopreneurs: "critical path testing with risk-based prioritization"
- Partial regression testing focuses on high-risk areas based on user/business criticality, traffic, and revenue impact
- Comprehensive testing is prohibitively resource-intensive for solo developers
- Use timebox approach: run critical tests first, then "next best" if time remains

**Initial Coverage Targets**:
- ✅ Design system showcase page (all primitives in light/dark themes)
- ✅ Authentication flow (login, signup pages)
- ✅ Dashboard/landing pages (primary user entry points)
- ❌ Skip: Admin pages, edge case UI states, low-traffic pages (add later as needed)

**Tools**: Playwright (already in stack) for visual snapshots, no additional SaaS cost

---

### 3. Documentation Format: **Inline code comments + README (single source of truth)**

**Recommendation**: Hybrid approach with inline token documentation + comprehensive `packages/ds/README.md`.

**Rationale**:
- Single source of truth requirement from 2025 best practices
- Inline comments help LLMs understand token usage in context
- README serves as onboarding tool and quick reference
- Avoid over-complication: keep it simple and maintainable for solo developer
- No need for Storybook/interactive tools until Phase 2+ (reduces maintenance burden)

**Structure**:
```
packages/ds/README.md
  - Token naming conventions (shadcn standard)
  - Fluid typography scale with clamp() examples
  - Spacing scale (4pt/8pt grid)
  - Motion design guidelines (Framer Motion patterns)
  - Usage examples with code snippets
  - How to add new tokens
  - Contrast ratios and accessibility notes
  - Component update workflow (diff-and-merge)

Inline JSDoc comments with machine-readable design rationale:
  /**
   * @token primary
   * @usage Main brand color for CTAs, links, active states
   * @contrast 4.5:1 on background (WCAG AA)
   * @usageGuidelines Only one primary CTA visible per screen to avoid confusion
   * @accessibilityConsiderations Focus styles use 2px outline with 2px offset
   */
```

---

### 4. Migration Strategy: **Gradual rollout (de-risk, lower overhead)**

**Recommendation**: Gradual/trickle migration starting with critical components, not big-bang.

**Rationale**:
- Lower risk with smaller, manageable changes
- Allows continuous testing and adjustments based on real-time feedback
- Old and new approaches can coexist during transition (graceful migration)
- 2025 trend: hybrid approaches combining best of both strategies
- Solo developer can iterate without fear of breaking entire system

**Phased Approach**:
1. **Phase 1**: Design system showcase page + core shadcn primitives (Button, Card, Input)
2. **Phase 2**: Auth pages (high visibility, medium complexity)
3. **Phase 3**: Dashboard/landing pages
4. **Phase 4**: Remaining pages as needed (long tail)

**Success Metrics**: Track token usage coverage via ESLint rule (warn on hardcoded colors)

---

### 5. Token Naming: **shadcn/Tailwind conventions (ecosystem alignment)**

**Recommendation**: Adopt shadcn/ui's background/foreground convention with Tailwind v4 OKLCH colors.

**Rationale**:
- shadcn uses semantic naming: `--primary`, `--primary-foreground`, `--background`, `--muted`, etc.
- Tailwind v4 (2025) converts HSL → OKLCH for better color accuracy
- Aligns with existing ecosystem (80% of React community uses shadcn/Tailwind)
- LLM-friendly: models trained on shadcn patterns, reducing prompt engineering
- Avoids custom naming that requires documentation overhead

**Token Structure** (following shadcn):
```css
@theme {
  --background: oklch(98% 0 0);
  --foreground: oklch(18% 0 0);
  --primary: oklch(55% 0.22 260);
  --primary-foreground: oklch(98% 0 0);
  --radius-lg: 0.75rem;
}
```

**Component Usage**:
```tsx
// LLM understands this immediately
<Button className="bg-primary text-primary-foreground" />
```

---

## Impact Summary

| Decision | Solopreneur Benefit | LLM-Friendly | Scalability |
|----------|-------------------|--------------|-------------|
| <3s rebuilds | ✅ Fast iteration | ✅ Quick feedback | ✅ Scales to 10+ packages |
| Critical path testing | ✅ Low maintenance | ⚠️ Manual test writing | ✅ Expand incrementally |
| Inline + README docs | ✅ Easy to maintain | ✅ Context for AI | ✅ No external deps |
| Gradual migration | ✅ Low risk | ✅ Iterative prompting | ✅ No big bang failure |
| shadcn naming | ✅ Zero learning curve | ✅ Pre-trained patterns | ✅ Ecosystem compatibility |

---

**Next Steps**:
- ✅ Clarifications resolved with research-backed recommendations
- Proceed to `/plan` to create technical implementation plan
