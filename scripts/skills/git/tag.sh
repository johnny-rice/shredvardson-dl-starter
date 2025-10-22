#!/bin/bash
set -euo pipefail

# Git Tag Sub-Skill
# Creates release tags following semver
# Delegates to LLM for changelog generation

# Setup logging
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../utils/skill-logger.sh"
setup_skill_logging "git" "tag"

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
  jq -n '{
    error: "Version required",
    usage: "/git tag <version>",
    examples: [
      "/git tag v1.2.0",
      "/git tag 1.2.0"
    ]
  }'
  exit 1
fi

# Ensure version starts with v
if [[ ! "$VERSION" =~ ^v ]]; then
  VERSION="v$VERSION"
fi

# Validate semver format
if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  jq -n --arg version "$VERSION" '{
    error: "Invalid semver format",
    version: $version,
    expected: "vX.Y.Z (e.g., v1.2.0)"
  }'
  exit 1
fi

# Check if tag already exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
  jq -n --arg version "$VERSION" '{
    error: "Tag already exists",
    version: $version,
    suggestion: "Use different version or delete existing tag"
  }'
  exit 1
fi

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  jq -n --arg branch "$CURRENT_BRANCH" '{
    error: "Must be on main branch to create release",
    current_branch: $branch,
    suggestion: "Switch to main with: git switch main"
  }'
  exit 1
fi

# Get commits since last tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# Check if repo has any commits (handle empty repo case)
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  COMMITS="[]"
elif [[ -n "$LAST_TAG" ]]; then
  COMMITS=$(git log --oneline "$LAST_TAG..HEAD" 2>/dev/null | jq -R . | jq -s . || echo "[]")
else
  COMMITS=$(git log --oneline 2>/dev/null | jq -R . | jq -s . || echo "[]")
fi

# Signal LLM to generate changelog and create tag
jq -n \
  --arg version "$VERSION" \
  --arg last_tag "$LAST_TAG" \
  --argjson commits "$COMMITS" \
  '{
    status: "needs_changelog",
    message: "Please generate changelog and create tag",
    version: $version,
    last_tag: ($last_tag // "Initial release"),
    commits: $commits,
    instructions: "Create annotated tag with changelog",
    child_skills: [
      {
        name: "generate-changelog",
        description: "Generate changelog from conventional commits",
        requires_llm: true,
        steps: [
          "Analyze commits since " + ($last_tag // "start"),
          "Group by type (feat, fix, chore, etc.)",
          "Generate CHANGELOG.md section",
          "Create tag: git tag -a " + $version + " -m \"changelog\"",
          "Update package.json version"
        ]
      }
    ]
  }'
