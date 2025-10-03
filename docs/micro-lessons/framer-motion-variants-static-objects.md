---
UsedBy: 1
Severity: high
---

# Framer Motion Variants Are Static - Document Adaptation Requirements

**Context.** Self-critique caught misleading JSDoc on animation variants claiming they "respect prefers-reduced-motion" when they're static objects that require manual adaptation via hooks/utilities.

**Rule.** **When creating animation variant objects, explicitly document that they are static and require useReducedMotion hook or adaptation utilities - variants cannot auto-adapt to user preferences.**

**Example.**
```typescript
// ❌ BAD: Misleading documentation suggests automatic adaptation
/**
 * Fade in animation variant.
 * @accessibilityConsiderations Respects prefers-reduced-motion
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// Result: Developers assume it auto-adapts (it doesn't)
<motion.div variants={fadeIn}>Content</motion.div>

// ✅ GOOD: Clear documentation with usage pattern
/**
 * Fade in animation variant.
 * IMPORTANT: Use with useReducedMotion hook:
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * <motion.div variants={prefersReducedMotion ? getReducedMotionVariants(fadeIn) : fadeIn}>
 * ```
 * @accessibilityConsiderations Does NOT automatically respect prefers-reduced-motion.
 * Must use useReducedMotion hook or getReducedMotionVariants utility.
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// Result: Developers know they must adapt manually
const prefersReducedMotion = useReducedMotion();
<motion.div variants={prefersReducedMotion ? getReducedMotionVariants(fadeIn) : fadeIn}>
  Content
</motion.div>
```

**Guardrails.**
- Include code examples showing correct usage with adaptation utilities
- Use "IMPORTANT:" or "NOTE:" to highlight non-obvious requirements
- Provide companion utilities (useReducedMotion, getReducedMotionVariants)
- Test that showcase/demo pages demonstrate proper accessibility patterns

**Tags.** framer-motion,animations,accessibility,prefers-reduced-motion,documentation,jsdoc,wcag,motion-sensitivity
