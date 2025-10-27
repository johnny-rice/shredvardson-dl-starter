---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/ops:learning-capture'
version: '2.0.0'
lane: 'operational'
tags: ['learning', 'automation', 'micro-lessons', 'knowledge-management']
when_to_use: >
  Capture development insights, patterns, or decisions as micro-lessons with intelligent
  context detection and automatic indexing.

arguments:
  - name: type
    type: string
    required: false
    example: 'pattern|bug|decision|insight'
    description: 'Type of learning to capture (auto-detected if omitted)'

inputs:
  - type: 'session-context'
    description: 'Automatically extracted from git, files, and recent work'
outputs:
  - type: 'learning-artifact'
    description: 'Micro-lesson with auto-generated context and tags'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#learningCapture'

allowed-tools:
  - 'Read(*)'
  - 'Write(*)'
  - 'Glob(*)'
  - 'Bash(git log:*)'
  - 'Bash(git status:*)'
  - 'Bash(git branch:*)'
  - 'Bash(git diff:*)'
  - 'Bash(git symbolic-ref:*)'
  - 'Bash(pnpm learn:index:*)'

preconditions:
  - 'Development session with learnings to capture'
postconditions:
  - 'Learning captured with auto-detected context'
  - 'INDEX.md automatically regenerated'
  - 'Tags suggested and applied'

artifacts:
  produces:
    - { path: 'docs/micro-lessons/[timestamp]-[slug].md', purpose: 'Micro-lesson with context' }
  updates:
    - { path: 'docs/micro-lessons/INDEX.md', purpose: 'Auto-regenerated index' }

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'git'
      ops: ['read']

timeouts:
  softSeconds: 180
  hardSeconds: 360

idempotent: true
dryRun: false
estimatedRuntimeSec: 120
costHints: 'Medium I/O; git analysis + tag extraction'

references:
  - 'docs/micro-lessons/template.md'
  - 'docs/specs/phase-4b-learning-capture-enhancement.md'
---

**Slash Command:** `/ops:learning-capture`

**Goal:**
Capture development insights as micro-lessons with intelligent automation:

- Auto-detect session context from git and files
- Suggest relevant tags from existing corpus
- Auto-regenerate INDEX.md after creation

**Prompt:**

### Phase 1: Auto-Context Detection (New in v2.0)

1. **Extract session context automatically:**

   ```bash
   # Get current branch and detect issue/feature
   git branch --show-current

   # Get last 3 commits for context
   git log -3 --oneline --no-decorate

   # Detect default branch (handles main/master/custom)
   BASE="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@' || echo main)"

   # Get changed files vs default branch
   git diff --name-only "$BASE"...HEAD

   # Parse branch name for issue numbers (e.g., feature/170-phase-4b-*)
   ```

2. **Present detected context to user:**
   - Branch: `feature/170-phase-4b-learning-capture`
   - Related Issue: `#170`
   - Recent Work: "Enhanced learning capture with auto-context"
   - Changed Files: `.claude/commands/ops/learning-capture.md`, `docs/specs/...`
   - Allow user to refine/override if needed

### Phase 2: Tag Suggestion (New in v2.0)

3. **Suggest tags based on context:**
   - **From file paths:** Extract patterns (e.g., `scripts/` → bash, `.claude/skills/` → skills)
   - **From commit messages:** Extract keywords (sanitized - see privacy guardrails below)
   - **From existing corpus:** Read all `docs/micro-lessons/*.md`, parse `**Tags.**` lines, build frequency map
   - **Smart suggestions:** Rank by relevance to current context

   **Privacy Guardrails for Commit-Derived Tags:**
   - Strip emails, IDs, and ticket URLs from commit messages
   - Drop high-entropy strings (tokens, keys, hashes)
   - Drop numeric-only tokens unless whitelisted (e.g., issue numbers like `#170`)
   - Keep only generic technical keywords (languages, tools, concepts)

4. **Present suggestions:**

   ```text
   Suggested tags (from session): #learning #automation #phase-4b #170
   Common tags (from corpus): #git #bash #typescript #testing #skills

   Select tags: [suggested + any additions]
   ```

### Phase 3: Create Micro-Lesson

5. **Create micro-lesson using template:**
   - Use `docs/micro-lessons/template.md` structure
   - Filename: `YYYYMMDD-HHMMSS-[slug].md` (ISO timestamp for sorting)
   - Pre-populate with detected context
   - Include selected tags
   - Set Severity: low|normal|high (user decides)
   - Set UsedBy: 0 (initial value)

6. **Write the lesson:**
   - **Context:** Auto-generated from Phase 1 + user refinement
   - **Rule:** User-provided key insight (1 bold sentence)
   - **Example:** Code snippet or before/after
   - **Guardrails:** Bullet points to prevent regressions
   - **Tags:** Selected tags from Phase 2

### Phase 4: Auto-Update INDEX (New in v2.0)

7. **Regenerate INDEX.md automatically:**

   ```bash
   pnpm learn:index
   ```

8. **Show updated ranking:**
   - Display where new lesson appears in Top-10
   - Note heat score (recency + reuse + severity)

### Phase 5: Completion

9. **Emit Result:**
   - ✅ Learning captured: `docs/micro-lessons/[filename].md`
   - ✅ INDEX.md updated (new lesson ranked #X)
   - ✅ Tags applied: [list of tags]
   - 💡 Next: Ready to commit or capture more learnings

**Examples:**

```bash
# Auto-detect everything (recommended)
/ops:learning-capture

# Specify type if auto-detection unclear
/ops:learning-capture bug

# Dry-run to preview context detection
/ops:learning-capture --dry-run
```

**Workflow:**

```text
User: /ops:learning-capture

Claude:
1. Detects: Branch feature/170-phase-4b, Issue #170, changed .claude/commands/
2. Suggests tags: #learning #automation #phase-4b #170 #commands
3. User refines: Adds #context-detection, removes #170
4. Creates: 20251022-120000-auto-context-learning-capture.md
5. Runs: pnpm learn:index
6. Shows: New lesson ranked #1 in INDEX.md (recency boost)
```

**Failure & Recovery:**

- If git not available → Fall back to manual context entry (user will be prompted to describe the context)
- If no changed files → Use conversation context instead
- If INDEX.md update fails → Warn user to run `pnpm learn:index` manually (lesson is still persisted; INDEX can be regenerated without data loss)
- If tag corpus empty → Use generic tags (git, typescript, bash)

**Migration Notes (v1.0 → v2.0):**

- Old `/ops:learning-capture pattern|process` still works (backward compatible)
- New version auto-detects type from context
- ADR creation moved to `/spec:adr-draft` (specialized command)
- Focus: Micro-lessons only (faster, friction-free)
