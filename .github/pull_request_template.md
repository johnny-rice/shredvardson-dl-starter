# Pull Request

> **⚠️ Direct Push Protection Notice**  
> Direct pushes to `main` are blocked. If you see the 'Block Direct Main Pushes' workflow fail, you attempted a direct push—create or continue a PR instead.

## Summary

_What changed and why in 1–3 sentences._

## Traceability

- **GitHub Issue:** #\_\_\_ (required for spec-driven PRs)
- **Spec ID:** `SPEC-YYYYMMDD-feature-name` (if applicable)
- **Plan ID:** `PLAN-YYYYMMDD-feature-name` (if applicable)
- **Task ID:** `TASK-YYYYMMDD-feature-name` (if applicable)

### ADR

ADR: ADR-### | N/A

_**Note:** Changes to packages/ai/prompts/**, scripts/**, .github/workflows/**, docs/wiki/** require ADR documentation. Use `override:adr` label for emergencies only._

## Scope

- [ ] Single task type (feature/refactor/test/docs)
- [ ] Only touched files listed in docs/llm/context-map.json

## AI Review Status

- [ ] **AI Review:** ⚠️ Not requested / ✅ Requested (`@claude /review`)
- [ ] **Security Scan:** ⚠️ Not applicable / ✅ Completed automatically

_If AI review completed, paste advisory feedback summary from doctor report below:_

```
[Paste "🤖 AI Review (Advisory)" or "🛡️ AI Security Review (Advisory)" sections from artifacts/doctor-report.md]
```

## Verification

Paste real outputs or "OK":

- [ ] `pnpm run doctor:report` (attach artifacts/doctor-report.md)
- [ ] `pnpm -w turbo run lint`
- [ ] `pnpm -w turbo run typecheck`
- [ ] `pnpm -w turbo run build`
- [ ] `pnpm -w turbo run test:e2e` (or N/A)
- [ ] `pnpm audit:traceability` (if using specs/plans/tasks)
- [ ] `pnpm tsx scripts/docs-check.ts` (docs-link-check)
- [ ] `pnpm learn:index` (if micro-lessons changed)

_💡 **Tip**: If doctor checks fail due to timing issues, comment `/doctor recheck` to manually re-run (maintainers/write access only)._

## Doctor & Quality Checks

- [ ] I ran `pnpm doctor` locally (no fails)
- [ ] All referenced scripts/paths in my changed docs exist
- [ ] New `.claude/commands/*` files are linked in `docs/ai/CLAUDE.md`
- [ ] If I intentionally left placeholders, I added them to `.doctor-allowlist.json` (with comment why)
- [ ] Prompt files have required headers (Intent, Inputs, Expected Output, Risks/Guardrails)
- [ ] Doc files have H1, summary, and "When to use" sections
- [ ] No tracked files in artifacts/ directory

## Learning Loop

- [ ] **Learning reference:** Checked docs/micro-lessons/INDEX.md for relevant patterns
- [ ] **Pattern application:** Applied relevant micro-lessons to avoid known issues
- [ ] **New learning:** Created/updated micro-lesson if new pattern emerged
- [ ] **Saved rework:** Micro-lesson prevented significant debugging/refactoring time

Common patterns to check (as applicable):

- [ ] Isolation hooks checked (no hidden state coupling)
- [ ] Mock at the **boundary** (env/config or network), not deep internals
- [ ] Stable React keys (no array indices)
- [ ] Dead code removed (no unreachable branches after early returns)
- [ ] Async assertions use Testing Library's `waitFor*` (no flake‑prone timeouts)
- [ ] Memoize expensive values/objects in render paths

Refs:

- Top‑10 Index: docs/micro-lessons/INDEX.md
- Template: docs/micro-lessons/template.md

## LLM Guardrails

- [ ] Used adapters (no vendor SDKs in UI)
- [ ] No hardcoded hex colors (tokenized Tailwind only)
- [ ] Updated docs and `llm/context-map.json` if scripts/paths changed

## Used Micro-Lesson

_Optional: reference any micro-lesson that helped avoid an issue (e.g., test-isolation-hooks)_

## Breaking changes / Migration

_None_ (or describe + steps)
