---
UsedBy: 0
Severity: high
---

# GitHub Actions PR Body Must Be Escaped in Bash Conditionals

**Context.** PR #141's spec-guard workflow failed with `syntax error near unexpected token '('` when the PR body contained markdown with parentheses. The workflow attempted to parse `${{ github.event.pull_request.body }}` directly in a bash conditional without proper escaping.

**Rule.** **Always quote and escape GitHub context variables when used in bash conditionals, or store them in environment variables first.**

**Example.**

❌ **Failing:**

```yaml
- name: Check PR body
  run: |
    if [ -z "${{ github.event.pull_request.body }}" ] || ! echo "${{ github.event.pull_request.body }}" | grep -i "closes"; then
      echo "Warning: PR should reference an issue"
    fi
```

✅ **Passing:**

```yaml
- name: Check PR body
  env:
    PR_BODY: ${{ github.event.pull_request.body }}
  run: |
    if [ -z "$PR_BODY" ] || ! echo "$PR_BODY" | grep -Ei "closes|fixes|resolves"; then
      echo "Warning: PR should reference an issue"
    fi
```

**Guardrails.**

- Store GitHub context variables (`${{ }}`) in `env:` block before using in bash scripts
- Always quote bash variables: `"$VAR"` not `$VAR`
- Test workflows with PR bodies containing special characters: `()`, `[]`, `$`, `` ` ``, `\`
- Use `grep -E` for extended regex instead of `\|` escaping in basic grep

**Tags.** github-actions,bash,escaping,pr-body,workflow,syntax-error,shell-injection
