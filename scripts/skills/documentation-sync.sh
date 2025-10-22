#!/bin/bash
set -euo pipefail

# Documentation Sync Skill
# Syncs documentation between repo and GitHub wiki

ACTION="${1:-sync}"
DRY_RUN=false

# Parse flags
shift || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

case "$ACTION" in
  sync)
    # Detect changed docs
    CHANGED_DOCS=$(git diff --name-only HEAD | grep -E '\.(md|mdx)$' || echo "")

    if [[ -z "$CHANGED_DOCS" ]]; then
      jq -n '{
        status: "success",
        message: "No documentation changes detected",
        files_checked: 0,
        files_synced: 0
      }'
      exit 0
    fi

    FILES_COUNT=$(echo "$CHANGED_DOCS" | wc -l | tr -d ' ')
    FILES_ARRAY=$(echo "$CHANGED_DOCS" | jq -R . | jq -s .)

    if [[ "$DRY_RUN" == "true" ]]; then
      jq -n \
        --argjson count "$FILES_COUNT" \
        --argjson files "$FILES_ARRAY" \
        '{
          status: "success",
          message: "Dry run - would sync files",
          files_checked: $count,
          files_to_sync: $files,
          next_steps: [
            "Remove --dry-run flag to actually sync",
            "Or commit changes to proceed"
          ]
        }'
      exit 0
    fi

    # Actual sync logic would go here
    # For now, placeholder that checks if wiki exists

    if gh repo view --json hasWikiEnabled -q .hasWikiEnabled 2>/dev/null | grep -q "true"; then
      jq -n \
        --argjson count "$FILES_COUNT" \
        --argjson files "$FILES_ARRAY" \
        '{
          status: "success",
          message: "Documentation sync available (wiki enabled)",
          files_checked: $count,
          files_to_sync: $files,
          wiki_enabled: true,
          note: "Full wiki sync implementation pending",
          child_skills: [
            {
              name: "wiki-push",
              description: "Push documentation to GitHub wiki",
              command: "pnpm wiki:generate"
            }
          ]
        }'
    else
      jq -n \
        --argjson count "$FILES_COUNT" \
        '{
          status: "warning",
          message: "Wiki not enabled for this repository",
          files_checked: $count,
          suggestion: "Enable wiki in repository settings"
        }'
    fi
    ;;

  validate)
    # Validate documentation
    echo "Validating documentation..." >&2

    # Find all markdown files
    MD_FILES=$(find . -name "*.md" -o -name "*.mdx" | grep -v node_modules | grep -v .next || echo "")

    if [[ -z "$MD_FILES" ]]; then
      jq -n '{
        status: "success",
        message: "No documentation files found"
      }'
      exit 0
    fi

    FILES_COUNT=$(echo "$MD_FILES" | wc -l | tr -d ' ')
    BROKEN_LINKS=0
    WARNINGS=[]

    # Check for common issues
    # 1. Check for broken internal links (basic check)
    while IFS= read -r file; do
      # Check for markdown links
      if grep -q '\[.*\](.*\.md)' "$file" 2>/dev/null; then
        LINKS=$(grep -oP '\[.*?\]\(\K[^)]+\.md' "$file" || true)
        while IFS= read -r link; do
          if [[ -n "$link" ]]; then
            # Resolve relative to file directory
            DIR=$(dirname "$file")
            FULL_PATH="$DIR/$link"
            if [[ ! -f "$FULL_PATH" ]]; then
              BROKEN_LINKS=$((BROKEN_LINKS + 1))
              WARNINGS=$(echo "$WARNINGS" | jq --arg file "$file" --arg link "$link" '. += ["Broken link in " + $file + ": " + $link]')
            fi
          fi
        done <<< "$LINKS"
      fi
    done <<< "$MD_FILES"

    if [[ "$BROKEN_LINKS" -eq 0 ]]; then
      jq -n --argjson count "$FILES_COUNT" '{
        status: "success",
        message: "Documentation validation passed",
        files_checked: $count,
        broken_links: 0
      }'
    else
      jq -n \
        --argjson count "$FILES_COUNT" \
        --argjson broken "$BROKEN_LINKS" \
        --argjson warnings "$WARNINGS" \
        '{
          status: "warning",
          message: "Documentation issues found",
          files_checked: $count,
          broken_links: $broken,
          warnings: $warnings,
          suggestion: "Fix broken links before syncing"
        }'
    fi
    ;;

  *)
    jq -n --arg action "$ACTION" '{
      error: "Unknown action",
      action: $action,
      available_actions: ["sync", "validate"],
      usage: "/docs <sync|validate> [--dry-run]"
    }'
    exit 1
    ;;
esac
