#!/bin/bash
set -euo pipefail

# Source shared libraries
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# Help text
show_help() {
  cat <<EOF
Usage: scrape-ai-reviews.sh PR_NUMBER PR_HEAD_SHA OUTPUT_FILE

Scrape structured AI review comments from PR and append to doctor report.

Arguments:
  PR_NUMBER     The pull request number
  PR_HEAD_SHA   The PR head commit SHA for validation
  OUTPUT_FILE   Path to doctor report file to append to

Options:
  -h, --help   Show this help message

Environment Variables:
  GH_TOKEN      GitHub token for API access (required)

Exit codes:
  0  Success (reviews scraped or none found)
  1  Error occurred

Examples:
  ./scrape-ai-reviews.sh 123 abc123def artifacts/doctor-report.md

EOF
}

# Parse arguments
if [ $# -lt 3 ]; then
  show_help
  exit 1
fi

PR_NUMBER="$1"
PR_HEAD_SHA="$2"
OUTPUT_FILE="$3"

if [ "$PR_NUMBER" = "-h" ] || [ "$PR_NUMBER" = "--help" ]; then
  show_help
  exit 0
fi

log_info "Scraping AI review comments from PR #$PR_NUMBER..."
log_info "PR head SHA: $PR_HEAD_SHA"

# Get AI review comment content with anti-poisoning validation
AI_REVIEW_CONTENT=$(gh api repos/${GITHUB_REPOSITORY}/issues/$PR_NUMBER/comments 2>/dev/null \
  | jq -r --arg sha "$PR_HEAD_SHA" '.[]
    | select(.user.login=="github-actions[bot]")
    | select(.body|contains("<!-- ai-review:v1") and contains($sha))
    | .body' || true)

# Get AI security review comment content with anti-poisoning validation
AI_SEC_CONTENT=$(gh api repos/${GITHUB_REPOSITORY}/issues/$PR_NUMBER/comments 2>/dev/null \
  | jq -r --arg sha "$PR_HEAD_SHA" '.[]
    | select(.user.login=="github-actions[bot]")
    | select(.body|contains("<!-- ai-sec-review:v1") and contains($sha))
    | .body' || true)

# Extract and append AI review content
if [ -n "$AI_REVIEW_CONTENT" ]; then
  log_info "Found AI review comment, extracting content..."
  echo "$AI_REVIEW_CONTENT" | sed -n '/<!-- ai-review:v1.*-->/,/<!-- \/ai-review:v1 -->/p' | \
    sed '1d;$d' >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
fi

# Extract and append AI security review content
if [ -n "$AI_SEC_CONTENT" ]; then
  log_info "Found AI security review comment, extracting content..."
  echo "$AI_SEC_CONTENT" | sed -n '/<!-- ai-sec-review:v1.*-->/,/<!-- \/ai-sec-review:v1 -->/p' | \
    sed '1d;$d' >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
fi

# Add separator if any AI content was found; otherwise append a literal fallback block
if [ -n "$AI_REVIEW_CONTENT" ] || [ -n "$AI_SEC_CONTENT" ]; then
  {
    echo "---"
    echo "*AI reviews aggregated by comment-scrape pipeline*"
    echo ""
  } >> "$OUTPUT_FILE"
else
  # Graceful fallback - AI review not available but don't block CI
  {
    echo "## ℹ️ AI Review Status"
    echo ""
    echo "AI review not available for this PR (no matching comments found for the current head SHA)."
    echo ""
    echo "> Advisory AI reviews are optional and don't affect CI status. Trigger with \`@claude /review\` in a PR comment."
    echo ""
  } >> "$OUTPUT_FILE"
fi

log_info "AI review scraping completed"
