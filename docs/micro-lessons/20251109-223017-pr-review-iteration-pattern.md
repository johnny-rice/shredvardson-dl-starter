---
UsedBy: 0
Severity: normal
---

# PR Review Iteration Pattern for Delegated Work

**Context.** When Claude Web completes work on issue #351, we verified the implementation, created a PR, then received multiple rounds of feedback from human reviewers and CodeRabbit bot. The challenge was organizing fixes into logical, reviewable commits.

**Rule.** **When addressing PR feedback on delegated work, group related improvements into separate focused commits (accessibility fixes, documentation completeness, functional enhancements) rather than one monolithic "address feedback" commit.**

**Example.**

```bash
# Bad: Single unclear commit
git commit -m "fix: address PR feedback"  # What changed? Hard to review

# Good: Focused commits showing intent
git commit -m "fix: address PR review nitpicks for UI component examples"
git commit -m "fix: add semantic label associations for checkboxes in card example"
git commit -m "fix: improve accessibility for helper text, errors, and disabled links"
git commit -m "feat: add form value capture to select example"
```

**Guardrails.**

- Validate comprehensively before creating initial PR (use research agents for acceptance criteria verification)
- Group related fixes: accessibility together, documentation together, functionality together
- Write descriptive commit messages that explain the "why" not just the "what"
- Comment on PR after pushing improvements to summarize changes for reviewers
- Accept some linter warnings in example files if they add noise without functional benefit

**Tags.** #pr-review #code-quality #git-workflow #issue-351 #claude-web #delegation
