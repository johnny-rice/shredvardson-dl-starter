# Command System Documentation

This directory contains command definitions for the Claude AI development workflow system.

## Command Structure

Each command is defined with YAML frontmatter containing metadata and a markdown prompt section.

### Frontmatter Fields

- **`dryRun`**: Boolean indicating if the command supports preview mode
- **`riskLevel`**: `LOW`, `MEDIUM`, or `HIGH` based on potential impact
- **`requiresHITL`**: Boolean for human-in-the-loop approval requirement
- **`lane`**: Execution context (`lightweight`, `dev`, or `spec`)

### Dry-Run Standard

Commands that support preview mode should:

1. **Set `dryRun: true`** in frontmatter metadata
2. **Include `--dry-run` examples** showing preview syntax
3. **Honor the `--dry-run` flag** to show planned actions without execution

**Example:**

```yaml
dryRun: true
```

```markdown
**Examples:**

- `/command` → executes the action
- `/command --dry-run` → shows planned action only
```

**When to use dry-run:**

- ✅ Commands that create/modify files
- ✅ Commands that make external API calls
- ✅ Commands with side effects (git operations, deployments)
- ❌ Read-only commands or simple queries

### Command Categories

- **dev/**: Development workflow commands (implement, plan-feature, etc.)
- **spec/**: Specification-driven development (specify, plan, tasks)
- **git/**: Git operations (commit, tag-release, workflow)
- **github/**: GitHub integration (create-issue, capture-learning)
- **docs/**: Documentation generation
- **quality/**: Code quality and linting
- **review/**: Code review and self-critique
- **test/**: Test scaffolding and TDD workflow

### References

- Command index: `docs/commands/index.json`
- Risk policies: `docs/llm/risk-policy.json`
- Constitution: `docs/constitution.md`
