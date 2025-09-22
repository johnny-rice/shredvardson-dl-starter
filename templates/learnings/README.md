# Learning Loop Template

**Portable Learning System for any repository**

Drop this Learning Loop system into any new app to get immediate benefit from previous learnings. Takes ~5 minutes to set up.

## What you get

✅ **Micro-lessons**: ≤90s notes that prevent repeat issues  
✅ **Top-10 Index**: Auto-generated, heat-ranked when you have enough data  
✅ **CI Integration**: Metrics in PR summaries, auto-comments for encouragement  
✅ **Retention Rules**: Automatic archiving of unused lessons  
✅ **Issue Templates**: Upstream reuse nudging  

## Quick Setup (5 minutes)

### 1. Copy files to your repo

```bash
# From your new repo root:
cp -r path/to/dl-starter/templates/learnings/* .
```

This copies:
- `docs/micro-lessons/template.md` - standard lesson template
- `scripts/generate-learnings-index.js` - heat ranking + index generation  
- `scripts/starter-doctor.ts` - doctor checks (extract the learnings functions)
- `.github/workflows/` - CI workflows for automation
- `.github/ISSUE_TEMPLATE/` - updated templates with micro-lesson fields

### 2. Add package.json scripts

```json
{
  "scripts": {
    "learn:index": "node scripts/generate-learnings-index.js",
    "learn:update-reuse": "bash scripts/update-micro-lesson-reuse.sh",
    "doctor": "tsx scripts/starter-doctor.ts"
  }
}
```

### 3. Create your first micro-lesson

```bash
pnpm learn:index  # Creates directory structure
cp docs/micro-lessons/template.md docs/micro-lessons/my-first-lesson.md
# Edit the lesson file
pnpm learn:index  # Regenerates index
```

### 4. Enable CI automation (optional)

- The workflows will auto-post encouragement comments
- Add learnings metrics to job summaries  
- Run weekly reuse tracking

## Usage Patterns

### When to create a micro-lesson

- You debug something tricky (>30min)
- You find a pattern that could bite others
- You create a reusable snippet or technique
- You document a "gotcha" or limitation

### The 90-second rule

Write lessons that take ≤90 seconds to read:
- **Problem:** What breaks and why
- **Solution:** Specific fix (code examples)  
- **Context:** When to apply this pattern

### Heat ranking activation

Once you have 8+ "Used Micro-Lesson" references in PRs, the index automatically switches from recency-based to heat-based ranking:

**Heat Score = Recency + (Usage × 5) + (Severity boost)**

- **Recency**: Decay over 30 days
- **Usage**: Each PR reference = +5 points
- **Severity**: Low=+2, Medium=+4, High=+6

### Micro-retro cadence

Every 2 weeks, spend 10 minutes:

1. Review learnings metrics from CI job summaries
2. Check `uses-micro-lesson` labeled PRs
3. **Decide**: promote (≥2 repeats or high severity), prune (90+ days unused), or keep
4. Capture one concrete "next guardrail" if new failure patterns emerge

## Files included

```
templates/learnings/
├── README.md                           # This setup guide
├── docs/micro-lessons/
│   └── template.md                     # Standard lesson template  
├── scripts/
│   ├── generate-learnings-index.js     # Heat ranking + index generation
│   └── doctor-learnings-checks.ts      # Doctor functions (extract these)
├── .github/workflows/
│   ├── learning-encouragement.yml      # Auto-comment on PR lesson usage
│   ├── pr-auto-label.yml              # Label PRs that use lessons
│   └── learnings-reuse-weekly.yml     # Weekly usage tracking cron
└── .github/ISSUE_TEMPLATE/
    ├── bug_report.yml                  # With micro-lesson field
    └── feature_request.yml             # With micro-lesson field
```

## Selling points

- **Zero ceremony**: No meetings, no process documents
- **Immediate value**: First lesson helps the next developer  
- **Self-improving**: Gets smarter as usage data accumulates
- **Portable**: Drop into any repo and start benefiting

## Customization

- **Change heat formula**: Edit `generate-learnings-index.js` scoring weights
- **Adjust retention period**: Modify 90-day threshold in doctor checks
- **Add custom fields**: Extend template.md with project-specific categories
- **Integrate with tools**: Export metrics to dashboards, Slack, etc.

## Learning Loop Steward

**Current steward**: Repository owner (replace with team member name when delegating)

**Succession plan**: 
1. Nominate someone who regularly reviews PRs
2. Share access to this README + `docs/micro-lessons/INDEX.md`  
3. Calendar: bi-weekly Friday 10-min micro-retro
4. Authority: promote (≥2 repeats or high severity), prune (90+ days unused), capture new guardrails

---

**This is a DLStarter innovation** • [📖 Full documentation](../../docs/micro-lessons/INDEX.md)