---
id: 170-phase-3
title: 'Phase 3: Git Workflow Consolidation'
created: 2025-01-21
status: active
phase: 3
parent_issue: 170
---

# Phase 3: Git Workflow Consolidation

## Context

Phase 2 achieved **92.2% token savings** (74% realized vs 60% target), validating the Skills architecture. Phase 3 consolidates our git workflow commands into a unified `/git` Skill and adds essential development workflow Skills.

## Success Criteria

- [ ] Consolidate 5+ git commands into single `/git` Skill
- [ ] Implement `code-reviewer` Skill for automated code review
- [ ] Implement `documentation-sync` Skill for wiki/docs synchronization
- [ ] Achieve **80% token savings** vs traditional approach
- [ ] Zero context pollution (progressive disclosure)
- [ ] All Skills follow established patterns from Phase 1-2

## Git Commands to Consolidate

Current separate commands to merge into `/git`:

1. `/git:branch` - Branch management
2. `/git:commit` - Smart commits with conventional format
3. `/git:prepare-pr` - PR preparation
4. `/git:fix-pr` - PR fixes and updates
5. `/git:workflow` - Full git workflow automation
6. `/git:tag-release` - Release tagging

New unified interface:

```bash
/git <action> [context]

# Examples:
/git branch Issue #123: Add feature
/git commit "feat: add new component"
/git pr prepare
/git pr fix 141
/git workflow
/git tag v1.2.0
```

## New Skills to Implement

### 1. code-reviewer Skill

**Purpose:** Automated code review with best practices

**Script:** `scripts/skills/code-reviewer.sh`

**Triggers:**

- After completing significant code changes
- Before PR creation
- On explicit request: `/code review`

**Checks:**

- TypeScript errors
- ESLint violations
- Test coverage
- Security vulnerabilities (via advisors)
- Best practices compliance
- Performance implications

**Output:** JSON report with:

```json
{
  "status": "success|warning|error",
  "checks": [
    {
      "name": "TypeScript",
      "status": "pass|fail",
      "issues": [],
      "files_affected": []
    }
  ],
  "recommendations": [],
  "blocking_issues": []
}
```

### 2. documentation-sync Skill

**Purpose:** Sync documentation between repo and GitHub wiki

**Script:** `scripts/skills/documentation-sync.sh`

**Actions:**

- Detect documentation changes
- Sync to GitHub wiki
- Update cross-references
- Validate links
- Generate ToC

**Output:** JSON report with sync status

## Architecture Patterns

### Command Consolidation Pattern

````markdown
# /git Skill

**Purpose:** Unified git workflow automation

**Usage:**

```bash
/git <action> [args]
```
````

**Actions:**

- `branch <issue>` - Create feature branch
- `commit <message>` - Smart commit
- `pr prepare` - Prepare PR
- `pr fix <number>` - Fix PR issues
- `workflow` - Full workflow
- `tag <version>` - Tag release

**Script Routing:**

```bash
#!/bin/bash
ACTION=$1
shift

case $ACTION in
  branch) exec scripts/skills/git-branch.sh "$@" ;;
  commit) exec scripts/skills/git-commit.sh "$@" ;;
  pr) exec scripts/skills/git-pr.sh "$@" ;;
  workflow) exec scripts/skills/git-workflow.sh "$@" ;;
  tag) exec scripts/skills/git-tag.sh "$@" ;;
  *) echo "Unknown action: $ACTION" >&2; exit 1 ;;
esac
```

### Progressive Disclosure Pattern

Each sub-action script:

1. Validates inputs (fast, no token cost)
2. Returns minimal JSON on success
3. Returns detailed JSON only on errors
4. Exposes child skills via `"child_skills": []`

### Token Optimization Strategy

**Current State:**

- 5+ separate slash commands
- Each loads full prompt template
- Estimated: 5,000+ tokens per workflow

**Target State:**

- Single `/git` entry point (500 tokens)
- Script routes to specific action
- Action script returns minimal JSON
- Estimated: 1,000 tokens per workflow
- **80% savings**

## Implementation Phases

### Phase 3.1: Git Consolidation

1. Create `/git.md` master Skill
2. Create routing script `scripts/skills/git.sh`
3. Refactor existing git commands into sub-scripts
4. Test all git workflows
5. Update documentation

### Phase 3.2: Code Reviewer Skill

1. Create `/code.md` Skill specification
2. Implement `scripts/skills/code-reviewer.sh`
3. Integrate with existing quality checks
4. Add to pre-PR workflow
5. Test with sample PRs

### Phase 3.3: Documentation Sync Skill

1. Create `/docs.md` Skill specification
2. Implement `scripts/skills/documentation-sync.sh`
3. Add wiki sync automation
4. Integrate with `/git workflow`
5. Test sync operations

### Phase 3.4: Validation & Documentation

1. Run token measurement across all workflows
2. Validate 80% savings target
3. Update SKILLS.md with new patterns
4. Update roadmap to Phase 4
5. Document lessons learned

## Token Savings Validation

Measure before/after for:

- Branch creation workflow
- Commit workflow
- PR preparation workflow
- Full release workflow
- Code review workflow
- Documentation sync workflow

**Target:** 80% average savings across all workflows

## Success Metrics

- ✅ All git commands consolidated under `/git`
- ✅ Code review automation functional
- ✅ Documentation sync automation functional
- ✅ 80% token savings achieved
- ✅ Zero context pollution maintained
- ✅ All tests passing
- ✅ Documentation updated

## Risks & Mitigations

**Risk:** Complex routing logic in scripts
**Mitigation:** Keep routing simple, use clear case statements

**Risk:** Loss of granular control
**Mitigation:** Maintain all sub-actions, just route through parent

**Risk:** Breaking existing workflows
**Mitigation:** Keep old commands as aliases during transition

## Next Steps After Phase 3

Phase 4 options:

- Advanced Skills (testing, deployment, monitoring)
- Cross-skill orchestration
- Custom Skill generator
- Skills marketplace/sharing

## References

- [Phase 1 Spec](./phase-1-skills-architecture-foundation.md)
- [Phase 2 Plan](../plans/phase-2-core-workflow-implementation.md)
- [SKILLS.md](../../SKILLS.md)
- [Token Measurement Tool](../../scripts/tools/measure-tokens.ts)
