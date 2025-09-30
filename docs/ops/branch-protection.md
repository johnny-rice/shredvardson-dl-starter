# Branch Protection Admin Setup Checklist

This document provides the GitHub admin settings needed to enforce branch protection for the `main` branch.

## Overview

This repository implements multi-layered branch protection:

- **CI Workflow**: Automatically fails direct pushes to `main`
- **Local Git Hooks**: Blocks pushes to `main` before they reach GitHub
- **GitHub Branch Protection**: Admin-enforced rules requiring PRs

## GitHub Admin Configuration

### Step 1: Access Branch Protection Rules

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Branches**
3. Click **Add rule** or edit existing rule for `main`

### Step 2: Branch Protection Rule Settings

Configure the following settings for the `main` branch:

#### Basic Protection

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1` (minimum)
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (if CODEOWNERS exists)

#### Status Checks

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Select required status checks (if any CI workflows exist):
    - `build` (if you have a build workflow)
    - `test` (if you have a test workflow)
    - `lint` (if you have a lint workflow)

#### Rules applied to everyone including administrators

- ✅ **Allow force pushes**: `❌ Disabled` _(Leave unchecked for maximum safety)_
- ✅ **Allow deletions**: `❌ Disabled` _(Leave unchecked for maximum safety)_

#### Critical Settings (Most Important)

- ✅ **Require a pull request before merging** _(Primary protection)_
- ✅ **Include administrators** _(Ensures admins follow PR workflow)_
- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- ⚠️ **Restrict who can push to matching branches**
  - _Note: On personal repositories, this setting may not be visible_
  - _This is OK - the "Require PR" setting provides the same protection_
- ✅ **Require linear history** _(Optional but recommended)_

### Step 3: Verify Configuration

After saving the rule, verify the protection is active:

```bash
# This should be blocked by GitHub
git checkout main
git commit --allow-empty -m "test: direct push"
git push origin main
```

Expected result: GitHub should reject the push with a protection error.

## Emergency Procedures

### Disabling Protection (Emergency Only)

1. Go to **Settings** → **Branches**
2. Click **Edit** on the main branch rule
3. Temporarily disable **Restrict who can push to matching branches**
4. Make your emergency fix
5. **Immediately re-enable the restriction**
6. Create a follow-up PR for review

### Bypass Approval (Admin Emergency)

As an admin, you can:

1. Create a PR normally
2. Approve your own PR (if you're a code owner)
3. Merge immediately if absolutely necessary
4. Document the emergency reason in the PR description

## Testing the Setup

### 1. Test Local Hook Protection

```bash
# Should be blocked by pre-push hook
git checkout main
echo "test" >> test.txt
git add test.txt
git commit -m "test: direct commit"
git push origin main
```

### 2. Test CI Protection

If the local hook fails, the CI workflow should also block the push:

- Check **Actions** tab for the "Block Direct Main Pushes" workflow
- It should fail with an error message

### 3. Test PR Flow

```bash
# Should work normally
git checkout -b feature/test-protection
echo "test" >> test.txt
git add test.txt
git commit -m "feat: test protection via PR"
git push origin feature/test-protection
gh pr create --title "test: verify protection works" --body "Testing branch protection"
```

## Troubleshooting

### "Push declined due to repository rule violations"

✅ **Success!** Protection is working correctly.

### Direct pushes still work

❌ Check these settings:

1. Ensure **Restrict who can push to matching branches** is enabled
2. Verify **Include administrators** is checked
3. Check the branch name pattern matches exactly (`main`)

### CI workflow not triggering

Check:

1. Workflow file exists at `.github/workflows/block-direct-main.yml`
2. Actions are enabled in repository settings
3. Workflow has proper permissions

### Local hooks not working

Run:

```bash
npm run hooks:install
```

Check that `.git/hooks/pre-push` exists and is executable.

## Security Notes

- **Never disable branch protection permanently**
- **Always use feature branches for development**
- **Code review is required for all changes**
- **Emergency procedures should be documented and rare**

## Validation Commands

```bash
# Install protection locally
npm run hooks:install

# Check current branch (should warn if on main)
npm run doctor

# Start proper workflow
npm run git:start

# Create PR after changes
npm run pr:create
```

## Support

If you encounter issues with branch protection:

1. Check this documentation first
2. Verify your GitHub permissions (you need admin access)
3. Test the individual components (hooks, CI, GitHub rules)
4. Review the emergency procedures if urgent

Remember: Branch protection exists to maintain code quality and prevent accidents. The slight friction is worth the safety it provides.
