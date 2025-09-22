#!/bin/bash
# Setup git hooks for the project

echo "🔧 Setting up git hooks..."

# Create pre-commit hook for micro-lessons index
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit guard for micro-lessons index

# Check if any micro-lessons files are being committed
if git diff --cached --name-only | grep -q '^docs/micro-lessons/'; then
  echo "📚 Micro-lessons changed, updating index..."
  
  # Run the learnings index update
  if ! pnpm learn:index; then
    echo "❌ Failed to update micro-lessons index"
    exit 1
  fi
  
  # Stage the updated index if it changed
  if [[ -n $(git diff docs/micro-lessons/INDEX.md) ]]; then
    echo "📄 Staging updated INDEX.md"
    git add docs/micro-lessons/INDEX.md
  fi
fi

echo "✅ Pre-commit checks passed"
EOF

chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully"
echo "💡 Tip: Run this script again if you clone the repo fresh"