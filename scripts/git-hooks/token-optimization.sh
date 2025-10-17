#!/bin/bash
# Pre-commit hook for token optimization validation
# Prompts developer to follow token optimization guidelines

set -euo pipefail

# Color codes
readonly RED='\033[0;31m'
readonly YELLOW='\033[1;33m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Flags for warnings
warned=false

echo -e "${BLUE}🔍 Token Optimization Check${NC}"
echo ""

# Check 1: Workflow file modifications
if echo "$STAGED_FILES" | grep -q "^.github/workflows/.*\.yml$"; then
  echo -e "${YELLOW}⚠️  Workflow files modified${NC}"

  for workflow in $(echo "$STAGED_FILES" | grep "^.github/workflows/.*\.yml$"); do
    # Check file size
    lines=$(git diff --cached "$workflow" | grep -c "^+" || echo "0")

    if [ "$lines" -gt 50 ]; then
      echo ""
      echo -e "${YELLOW}📏 Large workflow change detected: $workflow (+$lines lines)${NC}"
      echo ""
      echo "Token optimization guidelines suggest:"
      echo "  1. Extract inline scripts to scripts/ci/"
      echo "  2. Use composite actions for repeated setup"
      echo "  3. Keep workflows <200 lines total"
      echo ""
      echo "See: docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md#1-extract-dont-embed"
      echo ""
      warned=true
    fi

    # Check for long inline scripts
    if git diff --cached "$workflow" | grep -A20 "run: |" | grep -c "^+" | grep -q "[2-9][0-9]"; then
      echo ""
      echo -e "${YELLOW}📜 Long inline script detected in: $workflow${NC}"
      echo ""
      echo "Consider extracting to scripts/ci/ for:"
      echo "  • Local testing capability"
      echo "  • Reduced context size"
      echo "  • Better maintainability"
      echo ""
      echo "See: docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md#1-extract-dont-embed"
      echo ""
      warned=true
    fi
  done
fi

# Check 2: Documentation additions
if echo "$STAGED_FILES" | grep -q "^docs/.*\.md$"; then
  echo -e "${BLUE}📚 Documentation files modified${NC}"

  for doc in $(echo "$STAGED_FILES" | grep "^docs/.*\.md$"); do
    if [ -f "$doc" ]; then
      lines=$(wc -l < "$doc" 2>/dev/null || echo "0")

      if [ "$lines" -gt 500 ]; then
        echo ""
        echo -e "${YELLOW}📄 Large documentation file: $doc ($lines lines)${NC}"
        echo ""
        echo "Token optimization guidelines suggest:"
        echo "  • Split files >500 lines into smaller files"
        echo "  • Consider archiving old content to docs/archive/"
        echo "  • Use references instead of duplication"
        echo ""
        echo "See: docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md#2-reference-dont-duplicate"
        echo ""
        warned=true
      fi
    fi

    # Check if adding external docs without updating .claudeignore
    if echo "$doc" | grep -q "^docs/wiki/\|^docs/micro-lessons/"; then
      if ! grep -q "$(dirname "$doc")/" .claudeignore 2>/dev/null; then
        echo ""
        echo -e "${YELLOW}🚫 External documentation without .claudeignore exclusion${NC}"
        echo ""
        echo "File: $doc"
        echo "This appears to be external documentation."
        echo ""
        echo "Add to .claudeignore to exclude from AI context:"
        echo "  echo '$(dirname "$doc")/' >> .claudeignore"
        echo ""
        echo "See: docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md#3-exclude-external-docs"
        echo ""
        warned=true
      fi
    fi
  done
fi

# Check 3: Command file modifications
if echo "$STAGED_FILES" | grep -q "^.claude/commands/.*\.md$"; then
  echo -e "${BLUE}⚡ Slash command files modified${NC}"

  for cmd in $(echo "$STAGED_FILES" | grep "^.claude/commands/.*\.md$"); do
    if [ -f "$cmd" ]; then
      lines=$(wc -l < "$cmd" 2>/dev/null || echo "0")

      if [ "$lines" -gt 300 ]; then
        echo ""
        echo -e "${YELLOW}📝 Large command file: $cmd ($lines lines)${NC}"
        echo ""
        echo "Token optimization guidelines suggest:"
        echo "  • Extract shared patterns to reusable modules"
        echo "  • Keep commands <300 lines"
        echo "  • Reference documentation instead of duplicating"
        echo ""
        echo "See: docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md#8-command-consolidation"
        echo ""
        warned=true
      fi
    fi
  done
fi

# Check 4: New scripts without package.json entry
if echo "$STAGED_FILES" | grep -q "^scripts/ci/.*\.sh$"; then
  echo -e "${BLUE}🔧 CI scripts modified${NC}"

  for script in $(echo "$STAGED_FILES" | grep "^scripts/ci/.*\.sh$"); do
    script_name=$(basename "$script" .sh)

    # Check if package.json has corresponding command
    if ! grep -q "\".*$script_name.*\":" package.json 2>/dev/null; then
      echo ""
      echo -e "${YELLOW}📦 CI script without package.json command: $script${NC}"
      echo ""
      echo "Add a local test command to package.json:"
      echo "  \"ci:$script_name\": \"bash $script\""
      echo ""
      echo "This enables local testing without CI."
      echo ""
      echo "See: docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md#7-local-first-testing"
      echo ""
      warned=true
    fi
  done
fi

# Summary
echo ""
if [ "$warned" = true ]; then
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}⚠️  Token Optimization Warnings${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "These are informational warnings, not blockers."
  echo "Review suggestions above to optimize token efficiency."
  echo ""
  echo "Guidelines: docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md"
  echo "CI Check: .github/workflows/token-optimization-guard.yml"
  echo ""
  echo -e "${YELLOW}Continue with commit? (y/n)${NC} "
  read -r response

  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${RED}❌ Commit cancelled${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✅ Token optimization check complete${NC}"
echo ""

exit 0