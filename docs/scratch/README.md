# Scratch Directory

**Purpose:** Temporary analysis files, work-in-progress documentation, and ephemeral artifacts created during development.

## Usage

This directory is for:
- 🔍 **Analysis files** - Gap analyses, audit reports, investigation notes
- 📝 **Draft documentation** - Work-in-progress docs before finalization
- 🧪 **Experimental notes** - Ideas, brainstorming, technical spikes
- 🤖 **AI-generated artifacts** - Temporary files created by Claude during work

## Lifecycle

Files in this directory are **temporary** and should be:
1. **Used** during active work
2. **Converted** to permanent documentation (if valuable)
3. **Deleted** when no longer needed

## Git Policy

**Tracked by default** - So we can reference during work
**Should be cleaned up** - Before PR merge or periodically

## Naming Convention

Use descriptive, dated names:
- `analysis-{topic}-YYYY-MM-DD.md`
- `draft-{document-name}.md`
- `notes-{feature}-YYYY-MM-DD.md`

## Cleanup

Review and clean this directory:
- At the end of each major feature
- Before creating a release
- Monthly maintenance

Delete files that are:
- ✅ Already converted to permanent docs
- ✅ No longer relevant
- ✅ Outdated (>30 days and not actively referenced)

Keep files that are:
- 🔄 Actively being worked on
- 📋 Referenced in open issues/PRs
- 🎓 Valuable historical context (move to appropriate permanent location)