# Planning Templates (Two Lanes)

Use these **inputs** and produce these **outputs** so planning is consistent and LLM-friendly.

---

## A) Simple Lane – Planning Template
**Use when:** Small, low-risk change; clear acceptance; minimal integration.

### Inputs (required)
- Issue link/ID + full text
- Relevant code paths (if known)
- Any constraints (perf, a11y, security)

### Output (must produce)
- **Checklist plan** (≤15 steps, each verifiable)
- Test intent (what will be tested)
- Risk notes (if any)
- Estimated effort (S/M/L)

**Example skeleton**
- [ ] Update <component/file> to support <X>
- [ ] Add unit test for <edge case>
- [ ] Update docs: <path>
- [ ] Run linters/tests

---

## B) Spec Lane – Planning Template
**Use when:** Ambiguous feature, cross-cutting impact, or multi-system integration.

### Inputs (required)
- Issue link/ID + full text
- PRD context: [PRD](./WIKI-PRD.md)
- Constraints & guardrails: [Quality Gates](./WIKI-Quality-Gates.md)
- Architecture sketch: [Architecture](./WIKI-Architecture.md)
- Any external API/doc references

### Output (must produce)
- **Structured spec** (Problem → Goals → Scope/Out-of-scope → UX notes → Data model deltas → API surface → Test plan → Rollout)
- **Traceability** (map plan steps to files/modules)
- **Risk & Mitigation**
- **Validation plan** (acceptance criteria, metrics)

---

## Template Selection Guide

**Choose Simple Lane when:**
- Bug fixes with clear reproduction steps
- UI tweaks or styling changes
- Adding props to existing components
- Documentation updates
- Single-file changes with minimal dependencies

**Choose Spec Lane when:**
- New features spanning multiple components
- Database schema changes
- API design or external integrations
- Complex business logic implementation
- Performance optimization projects
- Security-sensitive changes