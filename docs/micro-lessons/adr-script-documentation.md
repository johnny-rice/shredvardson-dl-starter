---
UsedBy: 1
Severity: normal
---

# ADR for Script-Heavy Features Must Document Runtime Context

**Context.** PR #129 initially failed doctor checks because 7 script files (`scripts/*.ts`) were modified without an ADR reference, even though the PR had extensive spec/plan/task documentation. The doctor check requires ADR references when modifying files in certain directories.

**Rule.** **When adding or modifying scripts that implement architectural decisions (validators, migration tools, seed generators), create an ADR that documents the why, not just the what.**

**Example.**

❌ **Before**: PR has spec/plan/task docs but no ADR
```
Modified files:
- scripts/validate-migration.ts
- scripts/validators/index.ts
- scripts/seed-dev.ts
- scripts/seed-test.ts

Documentation:
✅ specs/feature-005-database-migration-workflow.md
✅ plans/plan-005-database-migration-workflow.md
✅ tasks/task-005-database-migration-workflow.md
❌ docs/decisions/ADR-XXX.md (missing)

Result: Doctor check fails with ADR compliance error
```

✅ **After**: Add ADR documenting architectural decisions
```
Added:
✅ docs/decisions/ADR-005-database-migration-workflow.md

ADR includes:
- Context: Why was this needed? (security gaps, manual review burden)
- Decision: What approach was chosen? (validators, seed scripts, CI integration)
- Consequences: Benefits and tradeoffs
- Alternatives: What else was considered?
- References: Links to spec, plan, tasks, and related issues

Result: Doctor check passes, future maintainers understand rationale
```

**Guardrails.**
- **Doctor enforcement**: Run `pnpm doctor:report` locally before pushing script changes
- **ADR naming**: Use sequential numbering (ADR-001, ADR-002, etc.) and descriptive titles
- **Link in PR**: Always reference the ADR in the PR description under an "ADR" section
- **Template adherence**: Use `docs/decisions/0001-template.md` structure for consistency
- **Cross-reference**: Link ADR to related specs/plans/tasks for full traceability

**Why Scripts Need ADRs More Than Regular Code:**
- Scripts often encode critical business logic (validation rules, safety checks)
- They run in CI/CD pipelines affecting deployment safety
- They may bypass application-level safeguards (service role keys, admin access)
- Future maintainers need context to modify them safely
- They represent architectural choices (tooling, workflow patterns)

**Tags.** adr,documentation,scripts,governance,ci-cd,traceability

> **Related:** This complements the existing micro-lesson on ADR reference patterns. The doctor check exists to ensure architectural decisions are documented before they become implicit tribal knowledge.
