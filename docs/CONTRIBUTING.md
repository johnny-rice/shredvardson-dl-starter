# Contributing to DL Starter

Thank you for contributing to DL Starter! This guide will help you understand our development workflow and quality standards.

## Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd dl-starter-new
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up git hooks**

   Git hooks are automatically installed via lefthook during `pnpm install`. These hooks ensure code quality before commits and pushes.

## Pre-commit Automation

We use [lefthook](https://github.com/evilmartians/lefthook) to run automated checks before commits and pushes. This catches issues early and prevents review cycles on preventable problems.

### Pre-commit Checks (Fast: <3s)

These run automatically when you commit:

1. **Biome** - Format and lint TypeScript/JavaScript/JSON files
   - Auto-fixes formatting issues
   - Enforces `noExplicitAny` rule (blocks commits with `any` types)
   - Stages fixed files automatically

2. **Markdown Linting** - Ensures consistent markdown formatting
   - Catches emphasis-as-heading issues (`**text:**` → `### text`)
   - Requires language identifiers in code blocks
   - Enforces proper link syntax (no bare URLs)
   - Auto-fixes and stages changes

3. **Config Validation** - Validates slash command references
   - Ensures JSON Pointer syntax is correct (`#/path/to/field`)
   - Verifies referenced files exist
   - Validates paths in JSON config files

4. **Micro-lessons Index** - Auto-updates learning documentation
   - Updates `docs/micro-lessons/INDEX.md` when lessons change
   - Stages updated index automatically

### Pre-push Checks (Target: 8-15s)

These run before pushing to ensure quality:

1. **Main branch protection** - Blocks direct pushes to `main`
2. **Lockfile sync** - Ensures `pnpm-lock.yaml` is in sync
3. **TypeScript & Lint** - Parallel type checking and linting
4. **CI scripts** - Validates CI/CD scripts
5. **Unit tests** - Runs full test suite

### Bypassing Hooks

If you need to bypass hooks (not recommended):

```bash
git commit --no-verify
git push --no-verify
```

## Code Quality Standards

### TypeScript

- **No `any` types** - Use proper typing with `unknown` or specific types
- **Strict mode enabled** - All TypeScript strict checks are enforced
- **Type imports** - Use `type` keyword for type-only imports

Example of proper error handling:

```typescript
import type { ExecException } from 'node:child_process';

try {
  // code
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error) {
    const execError = error as ExecException;
    console.error(`Command failed with code: ${execError.code}`);
  }
}
```

### Markdown

- Use `###` headings, not `**text:**`
- Always specify language in code blocks: ` ```typescript `
- Use proper markdown links: `[text](url)`, not bare URLs
- Ensure first line is a heading

### Slash Commands

When creating slash commands in `.claude/commands/`:

- Use valid JSON Pointer syntax in `riskPolicyRef`: `#/commandDefaults`
- Reference existing sections in `docs/llm/risk-policy.json`
- Include all required frontmatter fields

## Testing

### Running Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# E2E tests only
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Writing Tests

See [TESTING_GUIDE.md](testing/TESTING_GUIDE.md) for detailed testing guidelines.

## Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with meaningful commits

3. **Ensure all checks pass**

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   ```

4. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

6. **Address review feedback** and iterate

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new feature` - New feature
- `fix: resolve bug` - Bug fix
- `docs: update documentation` - Documentation only
- `refactor: restructure code` - Code refactoring
- `test: add tests` - Adding tests
- `chore: update tooling` - Maintenance tasks

## Getting Help

- Check the [documentation](INDEX.md)
- Review [micro-lessons](micro-lessons/INDEX.md) for specific topics
- Open an issue for questions or bugs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
