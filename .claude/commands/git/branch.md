---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/git:branch'
version: '1.0.0'
lane: 'lightweight'
tags: ['git', 'branch-management', 'workflow']
when_to_use: >
  Create a new git branch following standardized naming conventions.

arguments:
  - name: type
    type: string
    required: true
    example: 'feature'
  - name: issue_number
    type: string
    required: true
    example: '103'
  - name: slug
    type: string
    required: true
    example: 'git-branch-command'

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#gitOperations'

allowed-tools:
  - 'Bash(git branch:*)'
  - 'Bash(git switch:*)'
  - 'Bash(git show-ref:*)'
  - 'Bash(git diff-index:*)'
  - 'Bash(git rev-parse:*)'
  - 'Bash(git ls-files:*)'

preconditions:
  - 'Git repository is initialized'
  - 'Valid branch type provided'
postconditions:
  - 'New branch created with standardized name'
  - 'Switched to new branch'

artifacts:
  produces:
    - { path: 'git-branch-name.txt', purpose: 'Generated branch name' }
  updates: []

permissions:
  tools:
    - name: 'git'
      ops: ['branch', 'switch', 'show-ref', 'diff-index', 'rev-parse', 'ls-files']

timeouts:
  softSeconds: 30
  hardSeconds: 60

idempotent: false
dryRun: true
estimatedRuntimeSec: 10
costHints: 'Low I/O; git operations'

references:
  - 'docs/constitution.md#git-workflow'
  - 'docs/ai/CLAUDE.md'
---

**Slash Command:** `/git:branch`

**Goal:**
Create a new git branch following standardized naming conventions.

**Prompt:**

1. Confirm lane (**lightweight**) against `CLAUDE.md` decision rules.
2. Validate branch type (feature, fix, chore, docs).
3. Validate issue number format (numeric).
4. Validate slug format (kebab-case, lowercase, alphanumeric + hyphens).
5. Generate branch name: `<type>/<issue#>-<slug>`
6. Create and switch to the new branch.
7. Emit **Result**: branch created, name used, and next suggested command.

**Branch Naming Structure:**

```text
feature/<issue#>-<slug>       # new features
fix/<issue#>-<slug>           # bug fixes
chore/<issue#>-<slug>         # maintenance
docs/<issue#>-<slug>          # documentation-only
```

**Examples:**

- `/git:branch feature 103 git-branch-command` → creates `feature/103-git-branch-command`
- `/git:branch fix 42 login-bug` → creates `fix/42-login-bug`
- `/git:branch chore 99 update-deps` → creates `chore/99-update-deps`
- `/git:branch docs 12 api-reference` → creates `docs/12-api-reference`
- `/git:branch --dry-run feature 103 test` → show planned branch name only

**Validation Rules:**

1. **Type**: Must be one of: feature, fix, chore, docs
2. **Issue Number**: Must be numeric (e.g., "103", "42")
3. **Slug**: Must be kebab-case, lowercase, alphanumeric + hyphens only

**Failure & Recovery:**

- If invalid type → show valid types and example usage
- If invalid issue number → request numeric value
- If invalid slug → suggest kebab-case format
- If branch already exists → suggest different name or switch to existing
- If uncommitted changes → warn and suggest stashing or committing first

**Implementation:**

```bash
# Usage help
usage() {
  echo "Usage: /git:branch [--dry-run|-n] <feature|fix|chore|docs> <issue#> <slug>"
  echo "Example: /git:branch feature 103 git-branch-command"
  echo "Example: /git:branch --dry-run fix 42 login-bug"
}

# Parse args and flags
DRY_RUN=false
SWITCH_IF_EXISTS=false
ARGS=()
for arg in "$@"; do
  case "$arg" in
    --dry-run|-n) DRY_RUN=true ;;
    --switch-if-exists) SWITCH_IF_EXISTS=true ;;
    *) ARGS+=("$arg") ;;
  esac
done

TYPE="${ARGS[0]}"
ISSUE="${ARGS[1]}"
SLUG="${ARGS[2]}"

# Validate arg count
if [[ -z "$TYPE" || -z "$ISSUE" || -z "$SLUG" ]]; then
  echo "❌ Missing arguments."
  usage
  exit 1
fi

# Validate type
if [[ ! "$TYPE" =~ ^(feature|fix|chore|docs)$ ]]; then
  echo "❌ Invalid branch type: $TYPE"
  echo "Valid types: feature, fix, chore, docs"
  echo ""
  usage
  exit 1
fi

# Validate issue number
if [[ ! "$ISSUE" =~ ^[0-9]+$ ]]; then
  echo "❌ Invalid issue number: $ISSUE"
  echo "Issue number must be numeric (e.g., 103)"
  echo ""
  usage
  exit 1
fi

# Validate slug format (kebab-case, no leading/trailing hyphens)
if [[ ! "$SLUG" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "❌ Invalid slug: $SLUG"
  echo "Slug must be lowercase, alphanumeric, kebab-case"
  echo "No leading or trailing hyphens allowed"
  echo "Example: git-branch-command"
  echo ""
  usage
  exit 1
fi

# Generate branch name
BRANCH_NAME="$TYPE/$ISSUE-$SLUG"

# Dry-run mode
if [[ "$DRY_RUN" == true ]]; then
  echo "$BRANCH_NAME" > git-branch-name.txt
  echo "🔍 Dry-run mode: Would create branch: $BRANCH_NAME"
  exit 0
fi

# Check if branch already exists
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "⚠️  Branch already exists: $BRANCH_NAME"

  # Auto-switch if flag provided or in TTY with user consent
  if [[ "$SWITCH_IF_EXISTS" == true ]]; then
    git switch "$BRANCH_NAME"
    echo "$BRANCH_NAME" > git-branch-name.txt
    echo "✅ Switched to existing branch: $BRANCH_NAME"
    exit 0
  elif [[ -t 0 ]]; then
    read -p "Switch to existing branch? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git switch "$BRANCH_NAME"
      echo "$BRANCH_NAME" > git-branch-name.txt
      echo "✅ Switched to existing branch: $BRANCH_NAME"
      exit 0
    else
      echo "❌ Branch exists and user declined switch. Choose a different name."
      exit 2
    fi
  else
    echo "❌ Branch exists. Use --switch-if-exists to auto-switch or choose a different name."
    exit 2
  fi
fi

# Check for uncommitted changes (handles repos without initial commit)
if git rev-parse --verify --quiet HEAD >/dev/null 2>&1; then
  if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes."
    echo "Please commit or stash them before creating a new branch."
    exit 1
  fi
else
  # No commits yet (no HEAD) - check for any tracked/modified files
  if [[ -n "$(git ls-files -m -o --exclude-standard)" ]]; then
    echo "⚠️  You have uncommitted changes."
    echo "Please commit or stash them before creating a new branch."
    exit 1
  fi
fi

# Create and switch to branch
git switch -c "$BRANCH_NAME"

# Write artifact
echo "$BRANCH_NAME" > git-branch-name.txt

echo "✅ Created and switched to branch: $BRANCH_NAME"
echo ""
echo "📋 Next steps:"
echo "   1. /dev:implement - Start implementing your changes"
echo "   2. /git:commit - Commit your changes"
echo "   3. /git:prepare-pr - Create pull request"
```
