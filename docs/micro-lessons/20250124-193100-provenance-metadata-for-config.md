---
title: Add Provenance Metadata for Drift-Prone Configuration Facts
created: 2025-01-24T19:31:00Z
severity: normal
usedBy: 0
---

## Context

Component registry contained drift-prone facts like `bundleImpact: "15kb"` and `compatibility: "perfect"` without source or review dates. These facts can become stale as libraries update.

## Rule

**Always add `lastReviewed` date and `source` URL to configuration entries containing external facts that change over time.**

## Example

```json
// ❌ Before: No provenance
{
  "tremor": {
    "bundleImpact": "15kb (gzipped)",
    "compatibility": "perfect"
  }
}

// ✅ After: With provenance
{
  "tremor": {
    "bundleImpact": "~15kb (gzipped, approximate - defer to per-template dependencies)",
    "compatibility": "perfect",
    "lastReviewed": "2025-10-24",
    "source": "https://tremor.so/docs"
  }
}
```

## Guardrails

- Add provenance to: bundle sizes, compatibility claims, version requirements, API surfaces
- Annotate approximate values explicitly (e.g., "~15kb", "approximate")
- Include source URL pointing to official docs where facts can be verified
- Set up quarterly reviews of `lastReviewed` dates to catch stale data
- Consider adding `reviewedBy` for critical facts

**Tags.** #data-integrity #configuration #metadata #documentation #provenance #phase-4
