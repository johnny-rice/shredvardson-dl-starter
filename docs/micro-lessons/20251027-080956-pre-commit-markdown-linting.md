---
UsedBy: 0
Severity: high
---

# Pre-Commit Markdown Linting Prevents Bulk Review Comments

**Context.** PR #213 received 12 CodeRabbit markdown lint issues (emphasis-as-heading, missing language identifiers, bare URLs) that could have been caught pre-commit. These issues consumed review cycles and required 3 additional commits to fix.

**Rule.** **Run `markdownlint-cli2 "**/*.md" --fix` before committing documentation changes to catch style issues locally.**

**Example.**

```bash
# ❌ BAD: Commit without linting
git add docs/specs/my-spec.md
git commit -m "feat: add spec"
# → CodeRabbit flags 8 issues in review

# ✅ GOOD: Lint before committing
npx markdownlint-cli2 "**/*.md" --fix
git add docs/specs/my-spec.md
git commit -m "feat: add spec"
# → Clean review, no style issues
```

**Common Auto-Fixable Issues:**

- MD036: Emphasis-as-heading (`**text:**` → `### text`)
- MD040: Missing language identifiers (` ``` ` → ` ```bash `)
- MD034: Bare URLs (`https://...` → `[text](https://...)`)
- MD041: First line must be top-level heading

**Guardrails:**

- Add markdown linting to lefthook pre-commit hooks
- Configure markdownlint to check `.claude/`, `docs/`, `specs/` directories
- Use `--fix` flag to auto-correct most issues
- Review remaining warnings before committing

**Integration:**

```yaml
# .lefthook/pre-commit/markdown-lint.yml
run: npx markdownlint-cli2 "{docs,specs,.claude}/**/*.md" --fix
```

**Tags.** markdown,linting,pre-commit,code-review,automation,pr-quality,coderabbit,documentation
