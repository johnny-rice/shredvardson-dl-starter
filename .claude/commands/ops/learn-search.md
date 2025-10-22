---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/learn'
version: '1.0.0'
lane: 'operational'
tags: ['learning', 'search', 'knowledge-management', 'micro-lessons']
when_to_use: >
  Search micro-lessons by tags, keywords, or patterns to find relevant learnings.

arguments:
  - name: query
    type: string
    required: true
    example: 'git merge'
    description: 'Search query (keywords, tags, or patterns)'
  - name: tag
    type: string
    required: false
    example: 'bash'
    description: 'Filter by specific tag'
  - name: recent
    type: string
    required: false
    example: '7d'
    description: 'Filter by recency (7d, 30d, 90d)'

inputs:
  - type: 'query'
    description: 'Search keywords or tag filters'
outputs:
  - type: 'search-results'
    description: 'Ranked list of matching micro-lessons'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#readOnly'

allowed-tools:
  - 'Read(*)'
  - 'Glob(*)'
  - 'Grep(*)'

preconditions:
  - 'Micro-lessons exist in docs/micro-lessons/'
postconditions:
  - 'Relevant lessons displayed with snippets'

artifacts:
  produces: []
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read']

timeouts:
  softSeconds: 60
  hardSeconds: 120

idempotent: true
dryRun: false
estimatedRuntimeSec: 30
costHints: 'Low I/O; file system search'

references:
  - 'docs/micro-lessons/INDEX.md'
  - 'docs/specs/phase-4b-learning-capture-enhancement.md'
---

**Slash Command:** `/learn <query>`

**Goal:**
Search micro-lessons to find relevant learnings quickly without browsing INDEX.md manually.

**Prompt:**

### Search Strategy

1. **Parse query and filters:**
   - Extract main query keywords
   - Check for `--tag` filter
   - Check for `--recent` filter (7d, 30d, 90d)
   - Check for `--high-usage` filter

2. **Search micro-lessons:**
   ```bash
   # Search by tags (exact or partial match)
   grep -l "Tags.*<query>" docs/micro-lessons/*.md

   # Search by title
   grep "^# .*<query>" docs/micro-lessons/*.md

   # Search by content keywords
   grep -i "<query>" docs/micro-lessons/*.md
   ```

3. **Rank results:**
   - Exact tag match: +10 points
   - Title match: +5 points
   - Content match: +2 points
   - Recency (if --recent): Boost based on age
   - UsedBy count (if --high-usage): Boost by usage

4. **Filter results:**
   - Apply `--tag` filter (only lessons with specific tag)
   - Apply `--recent` filter (only lessons within time range)
   - Apply `--high-usage` filter (UsedBy > 0)

5. **Display top 10 results:**
   ```text
   🔍 Found 8 lessons matching "git merge":

   1. **pnpm-lock.yaml Merge Conflicts** (git, merge, lockfile) [3×]
      Always accept main branch version for pnpm-lock.yaml conflicts

   2. **Constitution Checksum After Merge** (git, merge, ci)
      Re-run pnpm wiki:generate after merging main to update checksums

   3. **Git Rebase vs Merge** (git, workflow)
      Prefer rebase for feature branches, merge for main branch
   ```

### Examples

```bash
# Search by keywords
/learn git merge

# Search by tag
/learn --tag bash

# Recent lessons only
/learn --recent 7d

# Combine filters
/learn git --tag merge --recent 30d

# High-usage lessons
/learn --high-usage --tag typescript
```

### Output Format

**Standard Output:**
```
🔍 Found N lessons matching "<query>":

1. **[Title]** (tag1, tag2, tag3) [usage×]
   One-line snippet from Context or Rule

2. **[Title]** (tags)
   One-line snippet
```

**No Results:**
```
❌ No lessons found matching "<query>"

💡 Try:
- Broader keywords
- Check common tags: git, bash, typescript, testing, skills
- Browse all lessons: docs/micro-lessons/INDEX.md
```

### Implementation Notes

**Ranking Algorithm:**
```typescript
score = 0
if (exactTagMatch) score += 10
if (titleMatch) score += 5
if (contentMatch) score += 2
if (recentFilter && withinRange) score += (30 - daysSince)
if (usedBy > 0) score += Math.min(usedBy, 3) * 2
```

**Performance:**
- ~74 micro-lessons: < 1 second
- Simple grep-based search (no dependencies)
- Cache parsed tags in memory (single run)

### Failure & Recovery

- If no lessons exist → "No micro-lessons yet. Create your first with /ops:learning-capture"
- If query too broad → Show top 10 + suggestion to narrow search
- If filters too restrictive → "No lessons match all filters. Try broader criteria."

### Integration

**Used by:**
- `/ops:learning-capture` (suggest similar lessons before creating)
- Development workflow (quick reference lookup)
- Onboarding (find relevant patterns)

**Complements:**
- `docs/micro-lessons/INDEX.md` (Top-10 by heat score)
- `/learn` command (this - search by query)
- `pnpm learn:index` (regenerate INDEX.md)