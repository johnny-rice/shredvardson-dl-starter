# Token Optimization Governance Summary

**Created:** 2025-10-15
**Purpose:** Ensure future development maintains token efficiency

---

## What Was Created

### 1. Guidelines Document
**File:** [docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md](../docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md)

**Contains:**
- 8 core principles for token optimization
- Enforcement mechanisms
- Review processes
- Examples for common scenarios (design systems, CI workflows)
- Migration path for existing code

**Key Principles:**
1. Extract, Don't Embed
2. Reference, Don't Duplicate
3. Exclude External Docs
4. Archive Stale Content
5. Consolidate Workflows
6. Error Messages with Context
7. Local-First Testing
8. Command Consolidation

---

### 2. CI Enforcement Workflow
**File:** [.github/workflows/token-optimization-guard.yml](../.github/workflows/token-optimization-guard.yml)

**Checks on Every PR:**
- ✅ Workflow file sizes (<200 lines)
- ⚠️  Inline script length (<20 lines)
- ⚠️  Setup duplication (use composite actions)
- ✅ Error messages reference debugging guide
- ⚠️  Local script availability (package.json commands)
- ⚠️  Documentation file sizes (<500 lines)
- ✅ .claudeignore patterns (required exclusions)
- ℹ️  Command file overlap (informational)

**Output:** Automated report in PR with metrics and recommendations

---

### 3. Constitutional Amendment
**File:** [docs/constitution.md](../docs/constitution.md)

**Added Article IX: Token Efficiency**

**Section 9.1: Context Minimization**
- Extract inline scripts
- Reference instead of duplicate
- Exclude external docs
- Archive stale content

**Section 9.2: Workflow Efficiency**
- Consolidate with composite actions
- Error messages with debugging references
- Local-first testing

**Section 9.3: Command Optimization**
- Consolidate overlapping commands
- Document all commands
- Size limits (300 lines)

**Section 9.4: Enforcement**
- Automated guards
- Quarterly audits
- Metrics tracking

**Version:** 1.0.0 → 1.1.0
**Ratified:** 2025-09-18
**Amended:** 2025-10-15

---

### 4. Pre-commit Hook
**File:** [scripts/git-hooks/token-optimization.sh](../scripts/git-hooks/token-optimization.sh)

**Checks Before Commit:**
- Workflow modifications (prompts to extract scripts)
- Documentation additions (warns about size)
- External docs (prompts .claudeignore update)
- Command file changes (warns about size)
- New CI scripts (prompts package.json entry)

**Behavior:** Informational warnings, not blockers (user can override)

---

## How It Works

### For New Features

**Example: Adding Design System Guidelines**

1. **Developer creates documentation:**
   ```
   docs/design-system/
   ├── README.md (index + quick reference)
   ├── colors.md (50 lines)
   ├── typography.md (50 lines)
   └── components.md (100 lines)
   ```

2. **Pre-commit hook checks:**
   - ✅ Files <500 lines each
   - ✅ Not duplicated elsewhere
   - ✅ Properly structured

3. **CI validation on PR:**
   - ✅ No violations detected
   - ✅ Documentation metrics acceptable
   - ✅ PR approved

**If guidelines violated:**
- Pre-commit hook warns developer
- Developer can fix or override
- CI provides detailed report
- Reviewer sees recommendations

---

### For Workflow Changes

**Example: Adding New CI Validation**

1. **Developer extracts script first:**
   ```bash
   # Create script
   scripts/ci/validate-design-system.sh

   # Add package.json command
   "design:validate": "bash scripts/ci/validate-design-system.sh"
   ```

2. **Developer creates thin workflow:**
   ```yaml
   # .github/workflows/design-system-check.yml
   jobs:
     validate:
       steps:
         - uses: ./.github/actions/setup
         - run: pnpm run design:validate
   ```

3. **Pre-commit hook checks:**
   - ✅ Script has package.json command
   - ✅ Workflow uses composite action
   - ✅ No long inline scripts

4. **CI validation on PR:**
   - ✅ Workflow <200 lines
   - ✅ Error messages reference debugging guide
   - ✅ All checks pass

---

## Enforcement Levels

### Blocking (❌)
- Workflow >200 lines
- Error message without debugging reference
- Missing .claudeignore patterns
- CI check failures

### Warning (⚠️)
- Inline script >20 lines
- Setup duplication
- Documentation >500 lines
- CI script without package.json command

### Informational (ℹ️)
- Command file overlap
- Optimization opportunities
- Best practice suggestions

---

## Quarterly Audit Process

**Frequency:** Every 3 months
**Next Audit:** 2026-01-15

**Steps:**
1. Run `pnpm run token:audit` (to be implemented in Phase 4)
2. Review metrics vs. baseline
3. Identify high-impact optimizations
4. Create issues for improvements
5. Update guidelines based on learnings

**Metrics Tracked:**
- Total workflow YAML size
- Average inline script length
- Documentation duplication percentage
- Command file overlap percentage
- Local validation coverage

---

## Examples by Scenario

### Scenario 1: Adding Comprehensive Feature Docs

**❌ Token-Inefficient:**
```
README.md (500 lines)
  - All feature documentation embedded
  - Duplicates content from Wiki
  - No references, everything inline
```

**✅ Token-Optimized:**
```
docs/features/
  ├── README.md (50 lines - index)
  ├── authentication.md (100 lines)
  ├── authorization.md (100 lines)
  └── data-access.md (100 lines)

docs/wiki/features/ (excluded via .claudeignore)
  └── External user-facing docs
```

---

### Scenario 2: Adding Complex CI Workflow

**❌ Token-Inefficient:**
```yaml
# 300-line workflow with:
- 50 lines of inline bash scripts
- Duplicated setup steps
- No local testing option
- Opaque error messages
```

**✅ Token-Optimized:**
```yaml
# 50-line workflow with:
jobs:
  validate:
    steps:
      - uses: ./.github/actions/setup
      - run: pnpm run feature:validate

# Plus:
scripts/ci/validate-feature.sh (extracted)
package.json: "feature:validate" (local)
.github/DEBUGGING.md (error guidance)
```

---

### Scenario 3: Creating New Slash Commands

**❌ Token-Inefficient:**
```
.claude/commands/
  ├── feature-a.md (400 lines)
  ├── feature-b.md (400 lines)
  └── (60% overlapping content)
```

**✅ Token-Optimized:**
```
.claude/commands/
  ├── feature-a.md (150 lines)
  ├── feature-b.md (150 lines)
  └── shared/
      └── common-workflow.md (100 lines)

# Each feature references shared/common-workflow.md
```

---

## Metrics and Success Criteria

### Target Metrics (from Issue #142)

| Metric | Baseline | Target | Status |
|--------|----------|--------|--------|
| Token consumption | 2.4M/month | 1.6M/month | ⏳ Pending Phase 1 |
| Workflow YAML size | 106KB | 50KB | ⏳ Pending Phase 1 |
| CI jobs count | 6 | 3 | ⏳ Pending Phase 1 |
| Local validation | 0% | 100% | ⏳ Pending Phase 1 |
| CI failure rate | 20% | <10% | ⏳ Pending Phase 1 |

### Governance Metrics (New)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Workflow compliance | 100% | CI check pass rate |
| Pre-commit warnings | <5 per week | Hook logs |
| Quarterly violations | 0 | Audit reports |
| Command overlap | <30% | Similarity analysis |
| Doc duplication | <5% | Duplicate detection |

---

## Integration with Existing Workflows

### How Governance Fits with Issue #142

**Issue #142 Phases:**
1. ✅ Phase 0: `.claudeignore` created
2. ⏳ Phase 1: Workflow simplification (governance ready)
3. ⏳ Phase 2: CI job consolidation (governance ready)
4. ⏳ Phase 3: Command optimization (governance ready)
5. ⏳ Phase 4: Documentation cleanup (governance ready)
6. ⏳ Phase 5: Structural improvements (governance ready)

**Governance ensures:**
- Phase 1+ changes follow best practices
- Future work doesn't regress optimizations
- Patterns are reusable for new features
- Team has clear guidelines and automation

---

## Developer Experience

### Before Governance

Developer adds new CI workflow:
1. Copies existing workflow
2. Adds 100 lines of inline bash
3. No idea if this is optimal
4. CI gets more complex over time
5. Token costs increase

### With Governance

Developer adds new CI workflow:
1. Pre-commit hook prompts: "Extract scripts?"
2. Developer creates `scripts/ci/new-check.sh`
3. Adds package.json command
4. Creates thin workflow using composite action
5. CI check validates compliance
6. PR has metrics and recommendations
7. Reviewer sees token optimization status

**Result:** Token-efficient patterns by default, not as afterthought

---

## Getting Started

### For Developers

**Install pre-commit hook:**
```bash
# Hook is installed automatically via pnpm hooks:install
pnpm run hooks:install
```

**Review guidelines:**
```bash
# Read guidelines before making changes
cat docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md
```

**Test locally:**
```bash
# Make changes
git add .

# Hook runs automatically on commit
git commit -m "your message"

# Or run manually
bash scripts/git-hooks/token-optimization.sh
```

### For Reviewers

**Check PR for compliance:**
1. Review CI check results
2. Check for token optimization warnings
3. Verify recommendations addressed
4. Approve if guidelines followed

**Metrics visible in PR:**
- Workflow file sizes
- Inline script counts
- Documentation metrics
- Compliance status

---

## Future Enhancements

### Phase 4 (Documentation Cleanup) Will Add:

**Token Audit Script:**
```bash
pnpm run token:audit          # Generate report
pnpm run token:audit --baseline  # Set baseline
pnpm run token:audit --compare   # Compare to baseline
```

**Features:**
- Automated duplication detection
- Command overlap analysis
- Stale content identification
- Optimization recommendations
- Baseline comparisons

### Potential Future Additions:

1. **AI-Powered Optimization Suggestions**
   - Analyze commits for token impact
   - Suggest refactorings
   - Predict token savings

2. **Token Budget System**
   - Set token budgets per feature
   - Track consumption over time
   - Alert on budget overruns

3. **Integration with Issue Tracking**
   - Auto-create issues for violations
   - Track remediation progress
   - Report on token debt

---

## Questions and Answers

**Q: Will this slow down development?**
A: No. Pre-commit hook is informational (can override). CI check runs in parallel with other checks (~30s).

**Q: What if I need to violate guidelines?**
A: Override pre-commit hook with explanation. Document why in PR. Reviewer can approve with justification.

**Q: How often will rules change?**
A: Constitutional process required (7-day review, maintainer consensus). Expect updates quarterly, not weekly.

**Q: Can I disable checks?**
A: Yes, per constitution Article VIII, Section 8.2 (Human Oversight). Maintainers can override in emergencies.

**Q: What about existing code?**
A: Gradual migration. New code must comply. Existing code improved opportunistically via Issue #142 phases.

---

## Related Documents

- [TOKEN_OPTIMIZATION_GUIDELINES.md](../docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md) - Detailed guidelines
- [constitution.md](../docs/constitution.md) - Article IX: Token Efficiency
- [Issue #142](https://github.com/Shredvardson/dl-starter/issues/142) - Implementation plan
- [TASK-20251015-llm-context-optimization.md](../tasks/TASK-20251015-llm-context-optimization.md) - Task breakdown

---

**Status:** Governance framework complete ✅
**Next Steps:** Begin Phase 1 implementation with governance active
**Maintained By:** Maintainers (quarterly review cycle)