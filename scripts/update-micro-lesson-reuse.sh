#!/bin/bash
# Post-merge reuse bump (run weekly via CI cron)
# Greps merged PRs for "Used Micro-Lesson: <slug>" and bumps UsedBy in its front-matter.

set -euo pipefail

echo "🔍 Scanning merged PRs for micro-lesson usage..."

# Get merged PRs from last 200 that mention "Used Micro-Lesson"
MENTIONS=$(gh pr list --state merged --search "Used Micro-Lesson" --limit 200 --json body,number 2>/dev/null || echo "[]")

if [ "$MENTIONS" = "[]" ] || [ -z "$MENTIONS" ]; then
  echo "ℹ️ No merged PRs found with micro-lesson references"
  exit 0
fi

# Extract slugs from PR bodies
echo "$MENTIONS" | jq -r '.[].body // ""' | \
  grep -i "Used Micro-Lesson:" | \
  sed -E 's/.*Used Micro-Lesson:?\s*([a-zA-Z0-9_-]+).*/\1/' | \
  sort | uniq > /tmp/used_slugs.txt 2>/dev/null || touch /tmp/used_slugs.txt

if [ ! -s /tmp/used_slugs.txt ]; then
  echo "ℹ️ No valid micro-lesson slugs found in PR bodies"
  exit 0
fi

echo "📈 Found micro-lesson references:"
cat /tmp/used_slugs.txt | sed 's/^/  - /'

# Bump UsedBy count for each referenced micro-lesson
while read -r SLUG; do
  [ -z "$SLUG" ] && continue
  
  LESSON_FILE="docs/micro-lessons/$SLUG.md"
  
  if [ ! -f "$LESSON_FILE" ]; then
    echo "⚠️ Micro-lesson not found: $LESSON_FILE (skipping)"
    continue
  fi
  
  echo "📊 Updating usage count for: $SLUG"
  
  # Check if UsedBy already exists
  if grep -q "^UsedBy:" "$LESSON_FILE"; then
    # Increment existing count
    perl -0777 -pe 's/(UsedBy:\s*)(\d+)/sprintf("%s%d",$1,$2+1)/e' -i "$LESSON_FILE"
    NEW_COUNT=$(grep "^UsedBy:" "$LESSON_FILE" | sed 's/UsedBy:\s*//')
    echo "  ✅ Incremented to UsedBy: $NEW_COUNT"
  else
    # Add front-matter with UsedBy: 1
    # Create temp file with front-matter
    {
      echo "---"
      echo "UsedBy: 1"
      echo "---"
      echo ""
      cat "$LESSON_FILE"
    } > "$LESSON_FILE.tmp"
    mv "$LESSON_FILE.tmp" "$LESSON_FILE"
    echo "  ✅ Added UsedBy: 1"
  fi
done < /tmp/used_slugs.txt

# Clean up
rm -f /tmp/used_slugs.txt

echo "✅ Micro-lesson reuse tracking complete"