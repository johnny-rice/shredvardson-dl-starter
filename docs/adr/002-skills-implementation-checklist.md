# Skills Architecture Implementation Checklist

**Related ADR**: ADR-002: Skills Architecture for DL Starter (Pure Skills + 5 Discovery Commands)
**Start Date**: TBD
**Owner**: Solo Developer (Jonte)
**Total Estimated Hours**: 96 hours over 6 weeks at 16 hours/week
**Architecture**: Pure Skills with minimal discovery commands (no backward compatibility)

## Phase 1: Foundation Infrastructure (Weeks 1-2)

**Estimated Hours**: 20 hours over 2 weeks
**Priority**: P0 (CRITICAL)

### Setup Tasks (4 hours)

- [ ] Create `.claude/skills/` directory structure
- [ ] Create `.claude/skills/README.md` with Skills index
- [ ] Create `.claude/skills/common/` for shared utilities
- [ ] Set up `.claude/logs/` directory for execution logging
- [ ] Create `.gitignore` entries for logs and temporary files

### Supabase Integration Skill (8 hours)

- [ ] Create `.claude/skills/supabase-integration/` directory
- [ ] Write `SKILL.md` with progressive disclosure (50 lines max)
- [ ] Create `CHANGELOG.md` with version 1.0.0
- [ ] Implement `scripts/migrate.ts` for database migrations
- [ ] Implement `scripts/validate-rls.ts` for RLS validation
- [ ] Implement `scripts/generate-types.ts` for TypeScript generation
- [ ] Create `docs/RLS_PATTERNS.md` with common patterns
- [ ] Create `docs/MIGRATION_GUIDE.md` with best practices
- [ ] Create `templates/rls-policy-template.sql`

### Infrastructure Components (4 hours)

- [ ] Create `common/skill_logger.py` for execution logging
- [ ] Create `common/validate-skill.sh` for structural validation
- [ ] Create `common/ERROR_CODES.md` with error taxonomy
- [ ] Set up logging to `.claude/logs/skill-execution.jsonl`

### Discovery Command Creation (2 hours)

- [ ] Create `/db` discovery command (thin wrapper to supabase-integration Skill)
- [ ] Delete old `/db:migrate` command entirely
- [ ] Delete related database commands
- [ ] Update QUICK_REFERENCE.md to reference new Skill

### Testing & Validation (2 hours)

- [ ] Test supabase-integration with real migration
- [ ] Measure token consumption before/after
- [ ] Document savings in Phase 1 report
- [ ] Verify no functionality regression

## Phase 2: Core TDD Workflow (Weeks 3-4)

**Estimated Hours**: 24 hours over 2 weeks
**Priority**: P0 (CRITICAL)

### Test Scaffolder Skill (6 hours)

- [ ] Create `.claude/skills/test-scaffolder/` directory
- [ ] Write `SKILL.md` (40 lines, delegates to agent)
- [ ] Create `docs/TEST_PATTERNS.md`
- [ ] Create `docs/COVERAGE_STANDARDS.md`
- [ ] Create `scripts/validate-tests.ts`
- [ ] Create test templates (unit, integration, e2e)
- [ ] Create `/test` discovery command
- [ ] Delete old `/test:scaffold` command

### PRD Analyzer Skill (6 hours)

- [ ] Create `.claude/skills/prd-analyzer/` directory
- [ ] Write `SKILL.md` (30 lines)
- [ ] Create `docs/YAML_FRONTMATTER.md`
- [ ] Create `docs/EXAMPLES.md` with good/bad specs
- [ ] Create `scripts/validate-spec.ts`
- [ ] Create `scripts/extract-criteria.ts`
- [ ] Create `/spec` discovery command
- [ ] Delete old `/spec:specify`, `/spec:plan`, `/spec:tasks` commands

### Implementation Assistant Skill (6 hours)

- [ ] Create `.claude/skills/implementation-assistant/` directory
- [ ] Write `SKILL.md` (35 lines)
- [ ] Create `docs/CODING_STANDARDS.md`
- [ ] Create `docs/ERROR_HANDLING.md`
- [ ] Create `docs/COMPONENT_PATTERNS.md`
- [ ] Create `scripts/validate-implementation.ts`
- [ ] Create `/code` discovery command
- [ ] Delete old `/dev:implement`, `/dev:plan-feature` commands

### Workflow Integration (4 hours)

- [ ] Implement Skill chaining logic
- [ ] Test complete TDD workflow end-to-end
- [ ] Verify only 5 discovery commands remain
- [ ] Update `QUICK_REFERENCE.md` with Skills documentation
- [ ] Delete all remaining old workflow commands

### Validation (2 hours)

- [ ] Measure token savings for complete workflow
- [ ] Document workflow improvements
- [ ] Gather feedback on UX changes

## Phase 3: Git & Documentation (Week 5)

**Estimated Hours**: 20 hours over 1 week
**Priority**: P1 (HIGH)

### Git Workflow Skill (8 hours)

- [ ] Create `.claude/skills/git-workflow/` directory
- [ ] Write unified `SKILL.md` for all git operations
- [ ] Create `docs/COMMIT_CONVENTIONS.md`
- [ ] Create `docs/PR_TEMPLATE.md`
- [ ] Create `docs/BRANCH_NAMING.md`
- [ ] Create `scripts/validate-commit.sh`
- [ ] Create `scripts/generate-pr-body.ts`
- [ ] Create `scripts/check-pre-push.sh`
- [ ] Create `/git` discovery command
- [ ] Delete all old git commands (`/git:commit`, `/git:branch`, `/git:prepare-pr`, etc.)

### Code Reviewer Skill (6 hours)

- [ ] Create `.claude/skills/code-reviewer/` directory
- [ ] Write `SKILL.md` with review checklist
- [ ] Create `docs/REVIEW_CHECKLIST.md`
- [ ] Create `scripts/lint.sh`
- [ ] Create `scripts/security-scan.sh`
- [ ] Create `scripts/complexity-check.ts`
- [ ] Integrate with pre-commit hooks

### Documentation Sync Skill (4 hours)

- [ ] Create `.claude/skills/documentation-sync/` directory
- [ ] Write `SKILL.md` for doc maintenance
- [ ] Create scripts for mismatch detection
- [ ] Set up triggers for PR merges
- [ ] Create update suggestions logic

### CI/CD Integration (2 hours)

- [ ] Create `.github/workflows/skill-quality-gate.yml`
- [ ] Set up automated Skill validation
- [ ] Configure security scanning
- [ ] Test with sample PR

## Phase 4: Advanced Capabilities (Week 6)

**Estimated Hours**: 32 hours over 1 week
**Priority**: P2 (MEDIUM)

### Project Scaffolder Skill (8 hours)

- [ ] Create `.claude/skills/project-scaffolder/` directory
- [ ] Write `SKILL.md` for component generation
- [ ] Create templates for Next.js routes
- [ ] Create templates for React components
- [ ] Create templates for Supabase tables
- [ ] Create `scripts/scaffold.ts`
- [ ] Test with real components

### Skill Creator Meta-Skill (8 hours)

- [ ] Create `.claude/skills/skill-creator/` directory
- [ ] Write `SKILL.md` for Skill generation
- [ ] Create `templates/SKILL_TEMPLATE.md`
- [ ] Create `scripts/create-skill.ts`
- [ ] Implement interactive Skill creation
- [ ] Test by creating a new Skill

### Learning Capturer Skill (8 hours)

- [ ] Create `.claude/skills/learning-capturer/` directory
- [ ] Write `SKILL.md` for pattern detection
- [ ] Create micro-lesson template
- [ ] Create `scripts/capture-pattern.ts`
- [ ] Implement pattern recognition logic
- [ ] Set up trigger mechanisms

### Final Cleanup (4 hours)

- [ ] Delete all remaining old commands (only 5 discovery commands should remain)
- [ ] Verify `.claude/commands/` only has `/db`, `/test`, `/git`, `/spec`, `/code`
- [ ] Update all documentation to reference Skills
- [ ] Create final architecture diagram
- [ ] Update project README with Skills usage guide

### Dependency Manager Skill (8 hours)

- [ ] Create `.claude/skills/dependency-manager/` directory
- [ ] Write `SKILL.md` for security updates
- [ ] Create vulnerability scanning scripts
- [ ] Create update automation logic
- [ ] Set up weekly audit schedule
- [ ] Test with current dependencies

## Governance & Documentation Tasks

**Throughout all phases**

### Security Governance (Solo Dev Simplified)

- [ ] Create `SECURITY_CHECKLIST.md` for self-review
- [ ] Create `TRUSTED_SOURCES.md`
- [ ] Create `SECURITY_GUIDELINES.md`
- [ ] Implement permission validation
- [ ] Set up audit logging
- [ ] Configure automated security scanning in CI (no second reviewer needed)

### Testing Infrastructure

- [ ] Create test scenarios for each Skill
- [ ] Set up multi-model testing plan
- [ ] Document testing requirements
- [ ] Create CI validation pipeline

### Documentation

- [ ] Write Skill development guide
- [ ] Create contribution guidelines
- [ ] Document debugging workflows
- [ ] Create training materials
- [ ] Update project README

## Success Validation Checklist

### Week 2 Checkpoint (End of Phase 1)

- [ ] Token savings measured at >50%
- [ ] No functionality regression
- [ ] Logging infrastructure operational
- [ ] One Skill fully functional
- [ ] Old database commands deleted

### Week 4 Checkpoint (End of Phase 2)

- [ ] TDD workflow fully migrated
- [ ] Token savings >60% for workflow
- [ ] Skill chaining working
- [ ] Only 5 discovery commands remain
- [ ] All old workflow commands deleted

### Week 5 Checkpoint (End of Phase 3)

- [ ] Git commands deleted, Skill operational
- [ ] Code review automated
- [ ] Documentation staying fresh
- [ ] CI/CD integration complete

### Week 6 Checkpoint (End of Phase 4)

- [ ] New capabilities operational
- [ ] Self-improvement demonstrated
- [ ] Pattern capture working
- [ ] Full system documented
- [ ] Only 5 discovery commands in codebase

## Risk Mitigation Checkpoints

### Go/No-Go Decision Points

- [ ] End of Week 2: Abort if token savings <30%
- [ ] End of Week 4: Pause and reassess if workflow complexity increased significantly
- [ ] End of Week 6: Consider hybrid approach if error rate >10%

### Rollback Preparation (Simplified - No Backward Compat Burden)

- [ ] Commands are version controlled in git (can restore if needed)
- [ ] Document rollback procedure
- [ ] Create `experimental-skills` branch for failed approach
- [ ] No maintenance of old command backups needed (pre-1.0)

## Notes Section

**Use this space to track decisions, blockers, and learnings during implementation**

---

### Week 1 Notes

-

### Week 2 Notes

-

### Week 3 Notes

-

### Week 4 Notes

- ***

  **Last Updated**: 2025-10-21
  **Next Review**: After Week 1 completion
