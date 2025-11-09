# Commit Message Conventions

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This enables automated changelog generation, semantic versioning, and better git history readability.

## Summary

Conventional commits provide a standardized format for commit messages that clearly communicates the intent and impact of changes. All commits are automatically validated using [commitlint](https://commitlint.js.org/) via a git commit-msg hook.

## When to Use

Use this guide:

- When writing any commit message for this repository
- Before committing changes (validation runs automatically)
- When reviewing PR commits for conventional format compliance
- When troubleshooting commit message validation failures

## Conventional Commit Format

### Structure

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Components

#### Type (Required)

The type must be one of the following:

- **feat**: A new feature for the user
- **fix**: A bug fix for the user
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, whitespace, no logic changes)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or external dependency changes
- **ci**: CI/CD configuration changes
- **chore**: Maintenance tasks (dependencies, config, etc.)
- **revert**: Reverts a previous commit

#### Scope (Optional)

The scope specifies the area of the codebase affected by the change:

- `(auth)`: Authentication/authorization
- `(ui)`: UI components or styling
- `(api)`: API endpoints or logic
- `(db)`: Database changes
- `(ci)`: CI/CD pipeline
- `(docs)`: Documentation
- `(test)`: Test infrastructure

Examples: `feat(auth): add OAuth support`, `fix(ui): button alignment`

#### Subject (Required)

- Use imperative mood: "add feature" not "added feature"
- Start with lowercase letter
- No period at the end
- Maximum 100 characters for entire header (type + scope + subject)
- Focus on what changed from a user perspective

#### Body (Optional)

- Explain the "why" not the "what"
- Use bullet points for complex changes
- Wrap at 72 characters per line
- Separate from subject with a blank line

#### Footer (Optional, but encouraged for this project)

Include issue references or breaking changes:

```
Fixes #123
Closes #456

BREAKING CHANGE: API endpoint renamed from /v1/auth to /v2/auth
```

For this project, the Claude Code attribution footer is encouraged:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Examples

### Simple Feature

```
feat: add dark mode toggle
```

### Feature with Scope

```
feat(auth): add OAuth provider support
```

### Feature with Body

```
feat(auth): add OAuth provider support

- Implement OAuth2 flow for Google and GitHub
- Add provider selection UI
- Store provider tokens securely

Closes #123
```

### Bug Fix

```
fix(ui): correct button alignment on mobile

Button was overflowing container on screens < 768px.
Adjusted flex properties to prevent overflow.

Fixes #234
```

### Documentation Update

```
docs: add API authentication examples
```

### Dependency Update

```
chore(deps): update dependencies to latest versions
```

### Breaking Change

```
feat(api)!: redesign authentication API

BREAKING CHANGE: Auth endpoints now require API version header.
Migrate by adding 'X-API-Version: 2' header to all requests.
```

Note: The `!` after the type/scope indicates a breaking change.

## Validation Rules

Commits are automatically validated with these rules:

1. **Type**: Must be one of the allowed types (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
2. **Format**: Must follow `type(scope): subject` or `type: subject` pattern
3. **Header length**: Maximum 100 characters
4. **Subject case**: Must not be in start-case, pascal-case, or upper-case

Invalid commit messages will be rejected with helpful error messages.

## Bypass Instructions (Emergency Only)

### Skip Commit Message Validation

If you need to bypass commit message validation (not recommended):

```bash
git commit --no-verify -m "your message"
```

Or use the LEFTHOOK environment variable:

```bash
LEFTHOOK=0 git commit -m "your message"
```

### When to Bypass

Only bypass validation for:

- Emergency hotfixes where time is critical
- Merges from external repositories with non-conventional commits
- Temporary WIP commits (should be squashed before PR)

**Important**: PRs should still follow conventional commit format regardless of bypass usage during development.

## Multi-line Commit Messages

For complex commits with body and footer:

```bash
git commit -m "$(cat <<'EOF'
feat(auth): add OAuth provider support

- Implement OAuth2 flow for Google and GitHub
- Add provider selection UI
- Store provider tokens securely

Closes #123

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

Or use your editor:

```bash
git commit
# Editor opens - write multi-line message there
```

## Best Practices

### Do's ✅

- Focus on user-visible impact
- Use imperative mood ("add" not "added")
- Keep header under 100 characters
- Explain "why" in body, not "what"
- Reference issue numbers with `Fixes #123` or `Closes #123`
- Use consistent formatting
- Group related changes in a single commit

### Don'ts ❌

- Don't list file changes (git log shows this)
- Don't use past tense ("added feature")
- Don't write vague messages ("update stuff")
- Don't exceed 100 characters in header
- Don't mix multiple unrelated changes
- Don't commit without running tests first

## Integration with Existing Workflows

### Git Hooks

The commit-msg hook runs automatically when you commit:

```bash
git commit -m "feat: add new feature"
# 🔍 Validating commit message...
# ✅ Commit message valid
```

### Pre-commit Hooks

The following still run before commit-msg validation:

- Biome format & lint
- Markdown linting
- Config reference validation
- Micro-lessons index updates

### Pre-push Hooks

After local commit, pre-push hooks verify:

- Main branch protection
- Lockfile sync
- TypeScript type checking
- Linting
- CI script tests
- Unit tests (skip with `SKIP_TESTS=1`)

## Troubleshooting

### "Subject must not be sentence-case"

**Error**: Your subject line starts with an uppercase letter.

**Fix**: Use lowercase for the first word:

```bash
# Wrong
git commit -m "feat: Add new feature"

# Correct
git commit -m "feat: add new feature"
```

### "Header too long"

**Error**: Your header exceeds 100 characters.

**Fix**: Shorten the subject or move details to the body:

```bash
# Wrong
git commit -m "feat: add a comprehensive OAuth authentication system with Google and GitHub support"

# Correct
git commit -m "feat: add OAuth authentication system

Supports Google and GitHub providers with secure token storage."
```

### "Type must be one of [feat, fix, ...]"

**Error**: You used an invalid commit type.

**Fix**: Use one of the allowed types:

```bash
# Wrong
git commit -m "update: change config"

# Correct
git commit -m "chore: update config"
```

### "Subject may not be empty"

**Error**: You provided a type but no description.

**Fix**: Add a meaningful subject:

```bash
# Wrong
git commit -m "feat:"

# Correct
git commit -m "feat: add user profile page"
```

## Benefits

1. **Automated Changelogs**: Tools can parse commits to generate CHANGELOG.md
2. **Semantic Versioning**: Automate version bumps based on commit types
3. **Clear Intent**: Consistent format improves git log readability
4. **Better Reviews**: PR reviewers can quickly understand change scope
5. **AI Context**: LLMs can better understand project history from structured commits

## References

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [commitlint Documentation](https://commitlint.js.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- Internal: `.claude/commands/git/shared/commit-formatting.md`

## Related Documentation

- [Git Workflow](./WORKFLOW.md) - Overall git workflow for this project
- [Pull Request Template](../../.github/pull_request_template.md) - PR requirements
- [Contributing Guide](../CONTRIBUTING.md) - General contribution guidelines
