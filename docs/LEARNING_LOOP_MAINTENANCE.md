# Learning Loop Maintenance Checklist

**Pin this in your notes for systematic stewardship**

## 🗓️ Bi-weekly Ritual (Every Other Friday, 10 min)

**Timing**: 09:05 CET (after weekly cron runs)

### 1. Review Metrics (2 min)

- Check 4-week trendlets from latest CI job summaries
- Count `uses-micro-lesson` labeled PRs
- Note "Saved rework" checkbox frequency

### 2. Promote/Prune Decision (5 min)

- **Promote**: Lessons with ≥2 repeats OR severity=high → move to recipes/
- **Prune**: Run `pnpm learn:archive --older-than 90 --unused`
- **Keep**: Everything else stays in rotation

### 3. Guardrail Intake (3 min)

- **If violations trend up**: harvest 1 new guardrail for next sprint
- **If metrics flat**: perfect — do nothing, system is working
- **If usage dropping**: check if lessons are too abstract, adjust template

## 🛡️ Heat Formula Sanity Checks

**Monthly spot-check (2 min)**:

- Reuse contributions capped at ≤3×
- Severity values in {low: +0, normal: +1, high: +2}
- Adjust scoring only if you see systematic skew

## 📦 Template Version Management

**When you tweak templates**:

1. Bump `templates/learnings/VERSION` (semver)
2. Add 1-line entry to `templates/learnings/CHANGELOG.md`
3. Test portability with small satellite repo

## 🚨 System Health Signals

**Green**: Metrics stable, violations low, occasional lesson usage  
**Yellow**: Lesson usage dropping, need template tune-up  
**Red**: Violations trending up, harvest new guardrail immediately

## 📈 ROI Baseline (Week 0)

**Captured**: [Insert date when first implemented]

- **Lessons used (4w)**: X PRs
- **Rework saved (4w)**: X reports
- **Violations (4w)**: X

**Target (4-6 weeks)**: Uses ↑, Violations ↓, Saved rework > 0

---

_Learning Loop v1.0.0 • DLStarter Innovation_
