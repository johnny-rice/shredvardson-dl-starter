---
title: Fix Theme Toggle Animation Flicker
type: bugfix
priority: p2
status: draft
lane: simple
issue: TEST-002
created: 2025-11-02
test_scenario: TC1.2
test_purpose: Simple lane feature (no sub-agent delegation)
---

# Fix Theme Toggle Animation Flicker

## Summary

The theme toggle button flickers briefly when switching between light and dark modes, causing a poor user experience.

## Problem Statement

When users click the theme toggle button, there's a visible flicker where:
1. The old theme appears for 50-100ms
2. The transition animation stutters
3. Some components render with the wrong theme momentarily

**User Impact:**
- Jarring visual experience
- Appears buggy and unpolished
- Users report motion sickness from flicker

## Proposed Solution

Fix the flicker by:
1. Apply theme class synchronously before any paint
2. Use CSS `color-scheme` meta tag to prevent flash
3. Ensure `ThemeProvider` updates before component re-renders
4. Add transition timing to smooth the switch

**Technical approach:**
- Move theme application to `document.documentElement` immediately
- Add `<meta name="color-scheme" content="dark light">` to layout
- Use CSS containment to prevent layout shifts
- Add 150ms transition for smooth color changes

## Acceptance Criteria

- [ ] No visible flicker when toggling theme
- [ ] Theme applies within 16ms (1 frame at 60fps)
- [ ] Smooth 150ms color transition
- [ ] Works consistently across all pages
- [ ] No console errors or warnings
- [ ] Lighthouse score maintains 100 for Performance

## Technical Constraints

**Performance:**
- Must apply theme within one frame (16ms)
- No layout shifts (CLS = 0)

**Browser Support:**
- Chrome 90+, Firefox 88+, Safari 14+ (existing support targets)

**Dependencies:**
- Existing `ThemeProvider` component
- Next.js app router layout

## Success Metrics

- **User feedback:** 0 reports of flicker after fix
- **Performance:** Theme application <16ms
- **Visual:** Smooth transition passes visual regression test

## Out of Scope

- Redesigning the theme toggle UI
- Adding more theme options (e.g., high contrast)
- System theme auto-detection improvements

## References

- Theme toggle component: `packages/ui/components/theme-toggle.tsx`
- ThemeProvider: `apps/web/components/theme-provider.tsx`
- Next.js dark mode guide: https://nextjs.org/docs/app/building-your-application/styling/css#dark-mode

## Expected Behavior (Simple Lane)

This test spec should:
- **NOT** trigger Research Agent (simple lane)
- **NOT** trigger Security Scanner (simple lane)
- Create basic plan without design discovery
- Generate straightforward task list
