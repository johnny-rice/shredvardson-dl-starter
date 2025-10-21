---
name: _shared/commit-formatting
when: Creating conventional commits in /git:commit, /git:branch, and /git:fix-pr
purpose: Shared commit message formatting standards and conventional commit patterns
riskLevel: LOW
---

# Commit Message Formatting

This template contains commit message formatting standards used across git commands.

## Conventional Commits Format

### Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Components

#### Type (Required)

Must be one of:

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **chore**: Maintenance tasks (deps, config, etc.)
- **docs**: Documentation only changes
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **test**: Adding or updating tests
- **ci**: CI/CD configuration changes
- **build**: Build system or external dependencies
- **perf**: Performance improvements
- **style**: Code style changes (formatting, whitespace)
- **revert**: Reverts a previous commit

#### Scope (Optional)

The scope specifies the area of the codebase:

- `(api)`: API changes
- `(ui)`: UI components
- `(db)`: Database changes
- `(auth)`: Authentication
- `(ci)`: CI/CD pipeline

Examples: `feat(auth): add OAuth support`, `fix(ui): button alignment`

#### Subject (Required)

- Use imperative mood: "add feature" not "added feature"
- No capitalization of first letter
- No period at the end
- Maximum 72 characters
- Focus on user-visible impact

#### Body (Optional)

- Use imperative mood
- Explain the "why" not the "what"
- 2-4 bullet points for complex changes
- Wrap at 72 characters per line

#### Footer (Required for DL Starter)

Always include:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Examples

### Simple Feature

```
feat: add dark mode toggle

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Feature with Body

```
feat(auth): add OAuth provider support

- Implement OAuth2 flow for Google and GitHub
- Add provider selection UI
- Store provider tokens securely

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Bug Fix

```
fix(ui): correct button alignment on mobile

Button was overflowing container on screens < 768px.
Adjusted flex properties to prevent overflow.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Chore

```
chore: update dependencies to latest versions

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Documentation

```
docs: add API authentication examples

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Breaking Change

```
feat(api)!: redesign authentication API

BREAKING CHANGE: Auth endpoints now require API version header.
Migrate by adding 'X-API-Version: 2' header to all requests.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Issue Number Integration

### In Subject Line

```
feat: add user profile page (Issue #123)
```

### In Body

```
feat: add user profile page

Implements user profile functionality as specified in Issue #123.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### GitHub Auto-Linking

Use GitHub keywords to auto-close issues:

```
fix: resolve login redirect bug

Fixes #123

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Keywords: `Fixes`, `Closes`, `Resolves` (case-insensitive)

## Multi-Line Message with HEREDOC

For complex commits in bash:

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

## Commit Message Validation

### Subject Line Rules

```bash
# Max 72 characters
if [ ${#SUBJECT} -gt 72 ]; then
  echo "❌ Subject line too long (max 72 chars): $SUBJECT"
  exit 1
fi

# Must match conventional commit pattern
if [[ ! "$SUBJECT" =~ ^(feat|fix|chore|docs|refactor|test|ci|build|perf|style|revert)(\([a-z]+\))?!?:\ .+ ]]; then
  echo "❌ Subject must follow Conventional Commits format"
  echo "Example: feat: add feature description"
  exit 1
fi

# Must use imperative mood (approximate check)
if [[ "$SUBJECT" =~ (added|updated|fixed|removed|changed)\ ]]; then
  echo "⚠️  Use imperative mood: 'add' not 'added'"
fi
```

### Footer Validation

```bash
# Check for required footer
if ! echo "$MESSAGE" | grep -q "Generated with \[Claude Code\]"; then
  echo "⚠️  Missing Claude Code attribution footer"
  echo "Add: 🤖 Generated with [Claude Code](https://claude.com/claude-code)"
fi

if ! echo "$MESSAGE" | grep -q "Co-Authored-By: Claude"; then
  echo "⚠️  Missing Co-Authored-By footer"
  echo "Add: Co-Authored-By: Claude <noreply@anthropic.com>"
fi
```

## Best Practices

### Do's

- ✅ Focus on user-visible impact
- ✅ Use imperative mood ("add" not "added")
- ✅ Keep subject line under 72 characters
- ✅ Explain "why" in body, not "what"
- ✅ Reference issue numbers
- ✅ Include Claude Code attribution
- ✅ Use consistent formatting

### Don'ts

- ❌ List file changes (git log shows this)
- ❌ Use past tense ("added feature")
- ❌ Write vague messages ("update stuff")
- ❌ Exceed 72 characters in subject
- ❌ Forget attribution footer
- ❌ Mix multiple unrelated changes

## Integration with Git Commands

This template is referenced by:

- `/git:commit` - Generates commit messages
- `/git:fix-pr` - Creates fix commits
- `/git:prepare-pr` - Validates commit messages in branch

## Commit Message Templates

### Feature Template

```
feat(<scope>): <what user can now do>

<optional: why this change was needed>

<optional: Closes #123>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Fix Template

```
fix(<scope>): <what is now working correctly>

<optional: what was broken and why>

<optional: Fixes #123>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Chore Template

```
chore: <maintenance task completed>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- Project-specific: `docs/constitution.md#commit-standards`
