# /git:ensure-branch

Ensures you're working on a feature branch, not main. Creates a feature branch if needed.

## Usage
```
/git:ensure-branch [feature-name]
```

## What it does
1. Checks if you're currently on main branch
2. If on main, creates and switches to a feature branch
3. Suggests appropriate branch naming conventions
4. Provides guidance on branch protection workflow

## Branch Naming Conventions
- `feature/description` - New features
- `fix/description` - Bug fixes  
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `chore/description` - Maintenance tasks

## Implementation
```bash
#!/bin/bash

current_branch=$(git branch --show-current)

if [ "$current_branch" = "main" ]; then
    echo "⚠️  You are on the main branch!"
    echo ""
    echo "🔒 Direct changes to main are not allowed."
    echo "   Creating a feature branch for you..."
    echo ""
    
    if [ -z "$1" ]; then
        echo "💡 Branch name suggestions:"
        echo "   feature/your-feature-name"
        echo "   fix/bug-description"
        echo "   refactor/component-name"
        echo ""
        read -p "Enter branch name: " branch_name
    else
        branch_name="$1"
    fi
    
    if [ -n "$branch_name" ]; then
        git checkout -b "$branch_name"
        echo "✅ Created and switched to branch: $branch_name"
        echo ""
        echo "📋 Next steps:"
        echo "   1. Make your changes"
        echo "   2. git add . && git commit -m 'your message'"
        echo "   3. git push origin $branch_name"
        echo "   4. Create Pull Request on GitHub"
    else
        echo "❌ No branch name provided. Staying on main."
        echo "   Remember: No commits allowed on main!"
    fi
else
    echo "✅ You're on branch: $current_branch"
    echo "   Safe to make changes and commit."
fi
```

## Related Commands
- `npm run git:start` - Start new feature workflow
- `npm run hooks:install` - Install branch protection hooks
- `npm run pr:create` - Create pull request

## Safety Features
- Prevents accidental commits to main
- Guides proper branch naming
- Integrates with git hook protection
- Provides clear next-step guidance