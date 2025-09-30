# Copy-Paste Prompt for Claude

**Use this prompt to port the Learning Loop to any repository**

---

**Goal**: Adopt the DLStarter "Learnings Loop" in THIS repository with minimal changes.

**Tasks**:

1. Discover existing docs/scripts/CI. Do NOT rename files or add heavy deps.
2. Copy in the portable package from our source repo's `templates/learnings/`:
   - scripts: index generator, display-suite guard, doctor hooks
   - workflows: reuse weekly cron, positive reinforcement comment, doctor run
   - docs: micro-lesson template + Top-10 index scaffold
   - CLAUDE.md guard: size cap + Top-10 link only (adjust if CLAUDE.md exists)
3. Wire the doctor into CI (PRs) and add the 6-item PR checklist.
4. Add Issue template hint: "Planned Micro-Lessons to consult (optional)".
5. Keep permissions least-privileged; avoid `pull_request_target`; handle forks gracefully.
6. Validation in PR body:
   - `pnpm doctor` output including `LEARNINGS_STATS=…`
   - Confirm Top-10 index generated and CLAUDE.md points only to it
   - Show workflows and their permission blocks
   - Run the display guard once; report 0 violations or list found files

**Branch**: `chore/adopt-learnings-loop`  
**PR title**: `chore: adopt DLStarter learnings loop (Top-10, doctor metrics, guardrails)`  
**Constraints**: ≤200 LoC total diff, no new dependencies. Keep edits ≤10 lines per doc.

Proceed.

---

**Source package**: Available at https://github.com/Shredvardson/dl-starter/tree/main/templates/learnings
