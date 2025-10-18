# Token Optimization Implementation Plan

## Context

Current token drains:

- 20% workflow failure rate (4/20 runs)
- ~50KB YAML reading per failure
- 724KB docs (including 260KB micro-lessons, 64KB wiki for external LLMs)
- 14,195 LOC, 408 files
- Recent PRs: 10-21 file changes each

## Immediate Wins (Completed)

- ✅ Created .claudeignore (saves ~15K tokens/session)
  - Excludes: wiki (64KB), micro-lessons (260KB), scratch, heavy workflows
  - Estimated savings: ~8.64M tokens/year (48 sessions/month × 12 months)

## Implementation Phases

### Phase 1: Workflow Simplification (Week 1-2)

**Target:** Reduce workflow complexity 50% (106KB → 50KB YAML)

#### 1.1 Extract Inline Bash to Scripts

- [ ] Create `scripts/ci/validate-specs.sh` (from spec-guard.yml lines 52-214)
- [ ] Create `scripts/ci/check-spec-lane.sh` (from spec-guard.yml lines 326-368)
- [ ] Create `scripts/ci/scrape-ai-reviews.sh` (from ci.yml lines 88-147)
- [ ] Update spec-guard.yml to call scripts (369 lines → ~80 lines)
- [ ] Add `pnpm run specs:validate` script for local debugging

**Benefits:**

- Local debugging without CI
- Clear error messages (not YAML parsing)
- Token cost per failure: ~13KB → ~3KB

#### 1.2 Make Heavy Workflows Optional

- [ ] Convert telemetry-weekly.yml to `workflow_dispatch` only
- [ ] Convert wiki-publish.yml to `workflow_dispatch` only
- [ ] Update README with manual trigger instructions

**Benefits:**

- Removes 34KB from regular CI context
- Only load when actually debugging these workflows

#### 1.3 Add Workflow Failure Summaries

- [ ] Add `::error::` annotations with clear next steps
- [ ] Create `.github/DEBUGGING.md` with common failure patterns
- [ ] Update all workflow error paths to reference debugging guide

**Example:**

```yaml
- name: Validate specs
  run: |
    if ! pnpm run specs:validate; then
      echo "::error::Spec validation failed. See .github/DEBUGGING.md#spec-validation"
      exit 1
    fi
```

### Phase 2: CI Job Consolidation (Week 3)

**Target:** Reduce setup overhead and failure surface area

#### 2.1 Create Composite Setup Action

- [ ] Create `.github/actions/setup/action.yml`
  - Checkout, pnpm setup, Node setup, install deps
- [ ] Replace repeated setup in ci.yml, spec-guard.yml, etc.

#### 2.2 Consolidate CI Jobs

**Before:** 6 jobs (doctor, docs-link-check, spec-gate, ci, e2e, promote-gate)
**After:** 3 jobs

- [ ] Combine into `preflight` job (doctor + docs + spec-gate)
- [ ] Keep `build-test` (current ci job)
- [ ] Keep `e2e` (for caching benefits)

**Benefits:**

- Fewer job boundaries
- Single failure point = clearer debugging
- Reduced YAML complexity

### Phase 3: Command Optimization (Week 4)

**Target:** Reduce Claude command complexity

#### 3.1 Git Command Consolidation

Current git commands: 475 lines (branch.md: 245, fix-pr.md: 230)

- [ ] Analyze overlap between `/git:branch` and `/git:fix-pr`
- [ ] Extract common patterns to shared templates
- [ ] Consider combining if workflow is similar
- [ ] Target: 475 lines → ~300 lines

#### 3.2 Add Command Quick Reference

- [ ] Create `.claude/commands/QUICK_REFERENCE.md`
- [ ] 1-line summary of each command
- [ ] Use cases and when to use each
- [ ] Reduces need to read full command files

### Phase 4: Documentation Cleanup (Week 5)

**Target:** Reduce essential docs to ~400KB (from 724KB)

#### 4.1 Audit and Archive

- [ ] Review docs/llm/ (44KB) - move stale content to archive
- [ ] Review docs/recipes/ (36KB) - consolidate duplicates
- [ ] Review docs/decisions/ (36KB) - archive implemented ADRs
- [ ] Target: Keep active docs, archive historical

#### 4.2 External References

- [ ] Identify docs that can live in GitHub Wiki
- [ ] Update main README with Wiki links
- [ ] Keep only essential onboarding docs in repo

### Phase 5: Structural Improvements (Week 6)

**Target:** Reduce file count per PR (currently 10-21 files)

#### 5.1 Modularity Audit

- [ ] Analyze recent PRs for coupling patterns
- [ ] Identify files that always change together
- [ ] Consider module boundaries and interfaces

#### 5.2 Generated File Management

- [ ] Add `*.generated.*` to .gitignore where appropriate
- [ ] Ensure generated files aren't in PR diffs
- [ ] Document which files are generated vs. manual

## Success Metrics

### Token Savings (Estimated Annual)

| Phase                   | Tokens Saved/Incident | Frequency        | Annual Savings         |
| ----------------------- | --------------------- | ---------------- | ---------------------- |
| .claudeignore           | 15K                   | 48/month         | 8.64M                  |
| Workflow simplification | 35K                   | 8 failures/month | 3.4M                   |
| Failure summaries       | 20K                   | 5 failures/month | 1.2M                   |
| Command consolidation   | 5K                    | 10 uses/month    | 600K                   |
| **TOTAL**               |                       |                  | **~13.84M tokens/year** |

### Quality Metrics

- **Workflow failure rate:** 20% → <10%
- **Workflow YAML size:** 106KB → ~50KB
- **Time to debug CI failure:** ~15min → ~5min
- **Local debuggability:** All validations runnable via `pnpm run`

## Implementation Priority

**Do First:**

1. Phase 1.1 - Extract bash scripts (biggest token saver)
2. Phase 1.2 - Make heavy workflows optional
3. Phase 1.3 - Add failure summaries

**Do Second:** 4. Phase 2.1 - Composite actions 5. Phase 2.2 - Consolidate jobs

**Do Later:** 6. Phase 3 - Command optimization 7. Phase 4 - Docs cleanup 8. Phase 5 - Structural improvements

## Notes

- All temp files go in `scratch/` folder
- Wiki docs (docs/wiki/) are for external LLMs - don't reference them
- Test each phase independently before moving to next
- Measure token usage before/after each phase
