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

- [x] Create `.claude/skills/` directory structure
- [x] Create `.claude/skills/README.md` with Skills index
- [x] Create `.claude/skills/common/` for shared utilities
- [ ] Set up `.claude/logs/` directory for execution logging
- [ ] Create `.gitignore` entries for logs and temporary files

### Supabase Integration Skill (8 hours)

- [x] Create `.claude/skills/supabase-integration/` directory
- [x] Write `SKILL.md` with progressive disclosure (50 lines max)
- [x] Create `skill.json` with metadata
- [x] Create `README.md` with documentation
- [x] Implement `scripts/create-migration.ts` wrapper
- [x] Implement `scripts/validate-migration.ts` wrapper
- [x] Implement `scripts/apply-migration.ts` wrapper
- [x] Implement `scripts/rollback-migration.ts` wrapper
- [x] Implement `scripts/generate-types.ts` wrapper
- [ ] Create `docs/RLS_PATTERNS.md` with common patterns (if needed)
- [ ] Create `docs/MIGRATION_GUIDE.md` with best practices (if needed)

### Infrastructure Components (4 hours)

- [ ] Create `common/skill_logger.py` for execution logging
- [ ] Create `common/validate-skill.sh` for structural validation
- [ ] Create `common/ERROR_CODES.md` with error taxonomy
- [ ] Set up logging to `.claude/logs/skill-execution.jsonl`

### Discovery Command Creation (2 hours)

- [x] Create `/db` discovery command (thin wrapper to supabase-integration Skill)
- [ ] Delete old `/db:migrate` command entirely (after validation)
- [ ] Delete related database commands (after validation)
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

- [x] Create `.claude/skills/test-scaffolder/` directory
- [x] Write `SKILL.md` (40 lines, delegates to agent)
- [x] Create `scripts/scaffold-e2e.ts`
- [x] Create `scripts/scaffold-rls.ts`
- [x] Create `scripts/validate-coverage.ts`
- [x] Create `/test` discovery command
- [x] Create `README.md` with documentation
- [x] Delete old `/test:scaffold` command

### PRD Analyzer Skill (6 hours)

- [x] Create `.claude/skills/prd-analyzer/` directory
- [x] Write `SKILL.md` (30 lines)
- [x] Create `scripts/parse-spec.ts`
- [x] Create `scripts/validate-spec.ts`
- [x] Create `scripts/extract-criteria.ts`
- [x] Create `scripts/generate-tasks.ts`
- [x] Create `/spec` discovery command
- [x] Create `README.md` with documentation
- [x] Delete old `/spec:specify`, `/spec:plan`, `/spec:tasks` commands

### Implementation Assistant Skill (6 hours)

- [x] Create `.claude/skills/implementation-assistant/` directory
- [x] Write `SKILL.md` (35 lines)
- [x] Create `scripts/show-standards.ts`
- [x] Create `scripts/show-patterns.ts`
- [x] Create `scripts/validate-code.ts`
- [x] Create `scripts/implementation-guide.ts`
- [x] Create `/code` discovery command
- [x] Create `README.md` with documentation
- [x] Delete old `/dev:implement`, `/dev:plan-feature` commands

### Workflow Integration (4 hours)

- [x] Test complete TDD workflow end-to-end
- [x] Verify discovery commands created
- [x] Update `.claude/skills/README.md` with all Skills
- [x] Delete all old workflow commands from Phase 2

### Validation (2 hours)

- [x] Measure token savings for complete workflow (74% savings achieved)
- [x] Document workflow improvements in phase-2-token-measurement.md
- [x] Validate progressive disclosure (90% metadata-only invocations)

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

## Phase 4: Advanced Capabilities & Refinement

**Status**: In Progress
**Priority**: P1-P2 (based on sub-phase)

### Phase 4A: Skills Observability (COMPLETED - 3 hours)

- [x] Lightweight CSV-based usage logging
- [x] Skills observability scripts (skill-logger.sh)
- [x] Analytics engine (analyze-skill-usage.ts)
- [x] `/ops:skills-stats` command
- [x] Integration with all 7 Skill scripts
- [x] ADR-003 documenting architecture decisions

**Completed**: 2025-10-22
**PR**: #181

### Phase 4B: Learning Capture Enhancement (COMPLETED - 4 hours)

**Priority**: P1 (HIGH)
**Goal**: Reduce friction in learning capture workflow

- [x] Enhanced `/ops:learning-capture` v2.0 with auto-context detection
- [x] Auto-extract context from git (branch, commits, changed files)
- [x] Suggest tags from existing corpus and session data
- [x] Auto-regenerate INDEX.md after lesson creation
- [x] Created `/learn <query>` search command
- [x] Phase 4B spec document
- [x] Tested search functionality (4 merge-related lessons found)

**Completed**: 2025-10-22
**Deliverables**:

- [docs/specs/phase-4b-learning-capture-enhancement.md](../specs/phase-4b-learning-capture-enhancement.md)
- [.claude/commands/ops/learning-capture.md](../../.claude/commands/ops/learning-capture.md) (v2.0)
- [.claude/commands/ops/learn-search.md](../../.claude/commands/ops/learn-search.md) (new)

### Phase 4C-D: Data-Driven Skills (PLANNED)

**Priority**: P2 (MEDIUM)
**Status**: Waiting for 2-week observability data collection (started 2025-10-22)
**Data Review Date**: ~2025-11-05

**Decision Criteria (defined now for rapid execution):**

- **Proceed if:** `/learn` search used >5 times/week OR `/ops:learning-capture` shows >50% tag suggestion acceptance
- **Prioritize:** Commands/workflows with >10 manual invocations in 2-week window
- **Success threshold:** New Skills reduce manual steps by >60%
- **Quality gate:** Error rate <5% in production usage

**Phase 4C: High-Confidence Skills** (TBD based on data)

- [ ] `/github` - Issue/PR management expansion
  - Create issues from conversation
  - Link PRs to issues automatically
  - Update project boards
- [ ] `/docs` - Advanced documentation sync
  - Auto-detect documentation drift
  - Suggest updates based on code changes

**Validation Criteria for Phase 4C:**

- [ ] Observability shows >10 GitHub CLI invocations/week
- [ ] Documentation drift detected in >3 PRs
- [ ] Token savings >60% vs manual workflow
- [ ] Error rate <5% in production

**Phase 4D: Behavioral-Driven Skills** (TBD based on data)

- [ ] Identify high-frequency manual workflows from skill-usage.csv
- [ ] Build Skills for top 3 pain points (sorted by invocation count)
- [ ] Validate with usage metrics (before/after comparison)

**Validation Criteria for Phase 4D:**

- [ ] Top 3 workflows have >15 invocations each in 2-week window
- [ ] New Skills reduce invocations by >50%
- [ ] User feedback positive (friction reduced)

### Phase 4E: Advanced Skills (DEFERRED)

**Priority**: P3 (LOW)
**Status**: Deferred pending observability insights

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

- [x] TDD workflow fully migrated (3 Skills: test-scaffolder, prd-analyzer, implementation-assistant)
- [x] Token savings >60% for workflow (74% achieved, exceeded target)
- [x] Skill delegation working (Test Generator sub-agent integration)
- [x] Discovery commands created (/test, /spec, /code)
- [x] All old workflow commands deleted (6 commands consolidated)

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
