---
id: PLAN-20251014-documentation-audit
type: plan
parentId: SPEC-20251014-documentation-audit
issue: 137
---

# Implementation Plan: Documentation Audit and Update

## Lane Confirmation

✅ **Simple Workflow** (Documentation updates)

**Decision Criteria:**
1. **Risk**: Could this break authentication, payments, or data? ❌ No - pure documentation
2. **Scope**: Will this touch 3+ files or take more than 2 hours? ✅ Yes - multiple docs, ~4-6 hours
3. **Clarity**: Do I fully understand what needs to be built? ✅ Yes - audit and update docs
4. **Dependencies**: Am I adding new packages or external services? ❌ No

**Result**: 1/4 criteria = Simple Workflow (documentation is explicitly listed as Simple Lane work in CLAUDE.md line 21)

## Scope

Update project documentation to reflect features implemented in PRs #106-#135. This is a **documentation-only** change - no code modifications except potentially updating code comments if they're inaccurate.

## Files to Update

### Critical Priority (Must Update)

1. **docs/IMPLEMENTATION_ROADMAP.md**
   - Mark Issue #1 (Design System Token Integration) as ✅ COMPLETED (PR #106)
   - Mark Issue #2 (Testing Infrastructure) as ✅ COMPLETED (PR #109)
   - Mark Issue #124 (Database Migration Workflow) as ✅ COMPLETED (PR #129)
   - Update completion checkboxes for all related sub-tasks
   - Add notes about what was implemented vs planned

2. **docs/wiki/WIKI-Git-Workflow.md**
   - ✅ Already updated with squash-merge detection (from PR #122)
   - Verify all git helper scripts are documented
   - Confirm `pnpm git:finish` workflow is accurate

3. **docs/wiki/WIKI-Quality-Gates.md**
   - Add documentation sync check (from PR #135)
   - Describe how the doc sync tool works
   - Add it to the CI Jobs section
   - Update the advisory/non-blocking gate list

4. **docs/wiki/WIKI-Commands.md**
   - Audit all slash commands in `.claude/commands/`
   - Ensure all commands have descriptions
   - Add any new commands from recent PRs
   - Verify command categories are current

5. **docs/testing/TESTING_GUIDE.md**
   - ✅ Already comprehensive from PR #109
   - Verify coverage targets match coverage-contract.md
   - Add any missing test patterns discovered since #109

6. **Create: docs/database/MIGRATION_GUIDE.md** (NEW FILE)
   - Document the migration workflow from PR #129
   - Include validation and seed data procedures
   - Reference the ADR and spec from feature-005
   - Migration safety checklist
   - RLS policy patterns

### Medium Priority (Should Update)

7. **docs/wiki/WIKI-Architecture.md**
   - Verify design system integration is documented
   - Confirm testing infrastructure is mentioned
   - Update database section with migration workflow

8. **docs/wiki/WIKI-Home.md**
   - Update quick links if any docs moved
   - Ensure navigation reflects #120 improvements
   - Add link to new MIGRATION_GUIDE.md

9. **docs/wiki/WIKI-Getting-Started.md**
   - Verify setup instructions are current
   - Add database migration setup if missing
   - Confirm testing setup instructions match TESTING_GUIDE

10. **README.md** (root)
    - Verify all documentation links are current
    - Update testing section to reference TESTING_GUIDE
    - Add database migration reference

### Low Priority (Nice to Have)

11. **docs/wiki/WIKI-AI-Collaboration.md**
    - Verify workflows match current CLAUDE.md
    - Update examples if stale

12. **.claude/commands/README.md**
    - Verify command descriptions are current
    - Add any missing command documentation

## Implementation Steps

### Phase 1: Analysis (30 minutes)

1. **Review each merged PR (#106-#135)**
   - Read PR descriptions
   - Note what features were added
   - Identify documentation promises in PR bodies
   - Check if promised docs exist

2. **Create gap analysis document**
   - List what docs should exist
   - List what docs are missing
   - List what docs are outdated
   - Prioritize by impact

### Phase 2: Roadmap Updates (30 minutes)

3. **Update IMPLEMENTATION_ROADMAP.md**
   - Mark completed issues with ✅
   - Update checkboxes for sub-tasks
   - Add implementation notes
   - Fix any broken references

### Phase 3: Core Documentation (2 hours)

4. **Create MIGRATION_GUIDE.md**
   - Extract content from PR #129
   - Reference ADR-005 and spec-005
   - Document validation workflow
   - Add safety checklist
   - Include seed data patterns

5. **Update WIKI-Quality-Gates.md**
   - Add doc sync check description
   - Update CI jobs list
   - Add to advisory checks section

6. **Update WIKI-Commands.md**
   - Audit all commands in `.claude/commands/`
   - Add missing descriptions
   - Organize by category
   - Verify examples are current

### Phase 4: Supporting Documentation (1.5 hours)

7. **Update Wiki pages**
   - WIKI-Architecture.md (design system, testing, DB)
   - WIKI-Home.md (navigation and links)
   - WIKI-Getting-Started.md (setup instructions)

8. **Update root README.md**
   - Fix any broken links
   - Add new documentation references
   - Verify badges and statuses

### Phase 5: Validation (1 hour)

9. **Cross-check documentation**
   - Verify all cross-references work
   - Test documented commands/procedures
   - Check for consistency
   - Ensure terminology matches

10. **Validate against code**
    - Spot-check key procedures against actual code
    - Verify slash commands match `.claude/commands/`
    - Confirm quality gates match CI config

11. **Run documentation checks**
    - `pnpm doctor` - verify no broken links
    - Manual review of navigation structure
    - Check Wiki TOC consistency

## Risks and Mitigations

### Risk: Documentation contradicts implementation

**Likelihood**: Medium
**Impact**: High - confusing for users
**Mitigation**:
- Cross-check docs against actual code
- Test documented procedures
- When in doubt, check code as source of truth
- Note discrepancies for follow-up issues

### Risk: Missing context from PRs

**Likelihood**: Low
**Impact**: Medium
**Mitigation**:
- Review full PR descriptions and comments
- Check related issues for context
- Review commit messages for implementation details
- Ask user for clarification if critical info missing

### Risk: Scope creep into code changes

**Likelihood**: Medium
**Impact**: Low - delays PR
**Mitigation**:
- Strict documentation-only changes
- Create follow-up issues for code discrepancies
- Don't fix code bugs discovered during audit

## No Code Changes

This is a **documentation-only** update. The only code files that may be touched are:
- None (pure documentation)

If documentation reveals bugs or inconsistencies in code, **create follow-up issues** rather than fixing them in this PR.

## No New Dependencies

No packages will be added or modified.

## Test Plan

Since this is documentation-only, testing involves:

1. **Link validation**
   ```bash
   pnpm doctor  # Should pass with no broken links
   ```

2. **Manual verification**
   - Read through each updated doc
   - Check cross-references work
   - Verify code examples are accurate
   - Test documented commands

3. **Consistency check**
   - Terminology is consistent across docs
   - No contradicting information
   - Navigation structure is logical

## Acceptance Criteria

### Must Have

- [ ] IMPLEMENTATION_ROADMAP.md completion status is accurate
- [ ] All features from PRs #106-#135 are documented
- [ ] Database migration workflow is documented (new MIGRATION_GUIDE.md)
- [ ] Quality gates include doc sync check (WIKI-Quality-Gates.md)
- [ ] All slash commands are documented (WIKI-Commands.md)
- [ ] No broken cross-references in documentation
- [ ] `pnpm doctor` passes with no link errors
- [ ] Testing guide reflects PR #109 implementation
- [ ] Git workflow reflects PR #122 improvements

### Should Have

- [ ] Documentation follows navigation structure from #120
- [ ] Consistent terminology across all docs
- [ ] Clear getting-started path for new contributors
- [ ] All Wiki pages have accurate TOCs

### Won't Have (Out of Scope)

- ❌ Code changes or bug fixes
- ❌ New documentation systems
- ❌ Documenting unimplemented features
- ❌ External/marketing documentation

## Success Metrics

1. **Zero broken links** - `pnpm doctor` passes
2. **Complete feature coverage** - All PRs #106-#135 documented
3. **Accurate status** - Roadmap reflects reality
4. **Improved navigation** - Docs are easy to find and follow

## Next Steps After This PR

1. Monitor for documentation drift in future PRs
2. Use doc sync tool (PR #135) to catch gaps early
3. Consider adding more examples/tutorials
4. Potentially create Issue #140 (Epic system) for better project organization

## Related Work

- PR #135: Documentation sync check tool
- PR #129: Database migration workflow implementation
- PR #122: Git workflow improvements
- PR #120: LLM documentation navigation improvements
- PR #109: Testing infrastructure
- PR #106: Design system token integration
- Issue #140: Epic system proposal (future work)

## Definition of Done

- [ ] All critical priority docs updated
- [ ] Medium priority docs updated
- [ ] Cross-references validated
- [ ] `pnpm doctor` passes
- [ ] Manual review complete
- [ ] PR description filled with summary of changes
- [ ] No code changes (documentation only)
- [ ] Git workflow followed (feature branch, conventional commit)