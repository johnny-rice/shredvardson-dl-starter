---
id: PLAN-255-remove-wiki-infrastructure
title: Remove wiki infrastructure to reduce documentation debt - Implementation Plan
type: plan
parentId: SPEC-255-remove-wiki-infrastructure
spec: specs/remove-wiki-infrastructure.md
issue: 255
lane: simple
created: 2025-11-03
status: draft
---

# Remove wiki infrastructure to reduce documentation debt - Implementation Plan

## Overview

This plan outlines the removal of all wiki infrastructure from the project to reduce documentation debt by 1,672 lines, eliminate maintenance burden, and optimize token usage for LLM context ingestion. The implementation is straightforward deletion and cleanup work with verification to ensure no broken dependencies.

## Design Decisions

**Single-phase deletion approach**: Since this is cleanup work with no architectural complexity, we'll execute all deletions in a single phase with verification steps to ensure nothing breaks.

**Preservation strategy**: Before deletion, verify no unique content exists only in wiki files that should be preserved. Based on initial analysis, wiki content duplicates README.md and docs/ content.

**Reference cleanup**: Search and update all references to wiki files across the codebase, including:
- README.md
- Documentation files in docs/
- Slash commands (.claude/commands/)
- CI/CD workflows

## Implementation Phases

### Phase 1: Audit and Prepare

**Goal:** Verify current state and identify all wiki-related files and references

**Tasks:**
- Verify wiki files exist in `docs/wiki/` (10 files confirmed)
- Verify `scripts/generate-wiki.js` exists
- Verify `wiki-content/generated/` directory exists
- Search for all wiki references in codebase (53 files found)
- Review key references to determine update strategy

**Deliverables:**
- Complete inventory of files to delete
- List of files requiring updates to remove wiki references
- Confirmation that no unique content will be lost

### Phase 2: Delete Wiki Infrastructure

**Goal:** Remove all wiki-related files and directories

**Tasks:**
- Delete `docs/wiki/WIKI-*.md` (10 files):
  - WIKI-AI-Collaboration.md
  - WIKI-Architecture.md
  - WIKI-Commands.md
  - WIKI-Getting-Started.md
  - WIKI-Git-Workflow.md
  - WIKI-Home.md
  - WIKI-PRD.md
  - WIKI-Planning-Templates.md
  - WIKI-Quality-Gates.md
  - WIKI-Spec-System.md
- Delete `scripts/generate-wiki.js`
- Delete `wiki-content/generated/` directory
- Delete `wiki-content/` parent directory if empty

**Deliverables:**
- All wiki files removed from repository
- Wiki generation script removed

### Phase 3: Update Configuration Files

**Goal:** Remove wiki-related scripts and update gitignore

**Tasks:**
- Remove `"wiki:generate": "node scripts/generate-wiki.js"` from package.json line 78
- Add `wiki-content/` to `.gitignore`
- Verify no other package.json scripts reference wiki generation

**Deliverables:**
- Updated package.json without wiki scripts
- Updated .gitignore to prevent future wiki content

### Phase 4: Update Documentation References

**Goal:** Remove or update all references to wiki files in documentation

**Tasks:**
- Update README.md to remove wiki references
- Update `.claude/commands/ops/wiki-sync.md` (likely delete or repurpose)
- Update `.claude/commands/github/update-wiki.md` (likely delete)
- Update `.claude/commands/docs.md` if it references wiki
- Review and update other documentation files as needed:
  - docs/ai/CLAUDE.md
  - docs/PRD.md
  - CONTRIBUTING.md
  - docs/INDEX.md
  - etc.

**Deliverables:**
- All documentation files updated to remove wiki references
- No broken links remaining
- Obsolete wiki commands removed

### Phase 5: Verification and Cleanup

**Goal:** Ensure no broken references or dependencies remain

**Tasks:**
- Search codebase for remaining "wiki" references
- Verify no broken links in documentation
- Test that no scripts depend on wiki generation
- Run linting and type checking to ensure no errors
- Verify build succeeds

**Deliverables:**
- Clean codebase with no wiki references (except in historical docs/specs/plans)
- All tests passing
- Build succeeds

## Technical Specifications

### Files to Delete

**Wiki documentation (docs/wiki/):**
- WIKI-AI-Collaboration.md (5,257 bytes)
- WIKI-Architecture.md (8,136 bytes)
- WIKI-Commands.md (12,035 bytes)
- WIKI-Getting-Started.md (2,204 bytes)
- WIKI-Git-Workflow.md (4,599 bytes)
- WIKI-Home.md (1,970 bytes)
- WIKI-PRD.md (1,982 bytes)
- WIKI-Planning-Templates.md (1,870 bytes)
- WIKI-Quality-Gates.md (7,384 bytes)
- WIKI-Spec-System.md (5,799 bytes)

**Wiki generation script:**
- scripts/generate-wiki.js (6,177 bytes)

**Generated wiki content:**
- wiki-content/generated/ (entire directory)

**Total estimated deletion:** ~60KB, 1,672+ lines

### Configuration Changes

**package.json:**
```diff
- "wiki:generate": "node scripts/generate-wiki.js",
```

**.gitignore:**
```diff
+ wiki-content/
```

### Documentation Updates Required

**High priority (direct wiki links):**
- README.md - Remove wiki section/references
- .claude/commands/ops/wiki-sync.md - Delete or repurpose
- .claude/commands/github/update-wiki.md - Delete
- docs/ai/CLAUDE.md - Update if contains wiki references

**Medium priority (may reference wiki):**
- CONTRIBUTING.md
- docs/PRD.md
- docs/INDEX.md
- docs/ai/INDEX.md

**Low priority (historical references acceptable):**
- Plans, specs, and task files can retain historical references
- Micro-lessons can reference removed wiki for context

## Testing Strategy

**Manual verification:**
- Search for "wiki" and "WIKI" in codebase
- Click through documentation links to verify no 404s
- Review git diff to ensure only intended files removed

**Automated checks:**
- Run `pnpm typecheck` - ensure no broken imports
- Run `pnpm lint` - ensure no linting errors
- Run `pnpm build` - ensure build succeeds
- Run pre-push hooks - ensure all gates pass

## Deployment

**Deployment steps:**
1. Create feature branch: `feature/255-remove-wiki-infrastructure`
2. Implement changes following phases 1-5
3. Commit with message: "chore: remove wiki infrastructure to reduce documentation debt (Issue #255)"
4. Push branch and create PR
5. Review and merge to main
6. Verify GitHub Wiki pages (if any) are removed/disabled

**Rollback plan:**
- Git revert commit if issues discovered
- All deleted files available in git history if needed

**GitHub Wiki:**
- Check if GitHub Wiki feature is enabled for repository
- If yes, disable or delete wiki pages to match repository cleanup

## Risk Mitigation

**Risk:** Unique content exists only in wiki files
**Mitigation:** Audit phase will identify any unique content for migration to docs/

**Risk:** Critical documentation broken by wiki removal
**Mitigation:** Comprehensive search for wiki references and verification phase

**Risk:** Scripts or CI/CD depend on wiki generation
**Mitigation:** Search for wiki script references before deletion

**Risk:** External links point to wiki files
**Mitigation:** Check GitHub insights for external referrers (low priority - wiki was never published externally)

## Success Criteria

- ✅ All wiki files deleted from repository
- ✅ Wiki generation script removed
- ✅ wiki-content/ added to .gitignore
- ✅ No "wiki:generate" script in package.json
- ✅ No broken links in documentation
- ✅ All tests and builds passing
- ✅ Token count reduced by ~1,672 lines in LLM context
- ✅ GitHub Wiki disabled (if applicable)

## References

- Spec: [specs/remove-wiki-infrastructure.md](../specs/remove-wiki-infrastructure.md)
- Issue: [#255](https://github.com/dissonance-labs/dl-starter/issues/255)
- PR #61: Previously removed `wiki-content/generated/` as duplicate
- Token optimization governance: Focus on concise, focused context for LLMs
