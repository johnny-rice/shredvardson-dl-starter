#!/bin/bash
# Design System Skill - Bash wrapper for TypeScript scripts

set -e

SKILL_DIR=".claude/skills/design-system"
ACTION="${1:-help}"
shift || true

case "$ACTION" in
  viewer)
    pnpm tsx "$SKILL_DIR/scripts/viewer.ts" "$@"
    ;;

  validate)
    # Run all validations
    echo "Running all design system validations..."
    pnpm tsx "$SKILL_DIR/scripts/validate-tokens.ts" "$@"
    pnpm tsx "$SKILL_DIR/scripts/validate-spacing.ts" "$@"
    pnpm tsx "$SKILL_DIR/scripts/contrast-check.ts" "$@"
    ;;

  validate-tokens)
    pnpm tsx "$SKILL_DIR/scripts/validate-tokens.ts" "$@"
    ;;

  validate-spacing)
    pnpm tsx "$SKILL_DIR/scripts/validate-spacing.ts" "$@"
    ;;

  contrast-check)
    pnpm tsx "$SKILL_DIR/scripts/contrast-check.ts" "$@"
    ;;

  visual-diff)
    pnpm tsx "$SKILL_DIR/scripts/visual-diff.ts" "$@"
    ;;

  copy-review)
    pnpm tsx "$SKILL_DIR/scripts/copy-review.ts" "$@"
    ;;

  generate)
    pnpm tsx "$SKILL_DIR/scripts/generate-component.ts" "$@"
    ;;

  import)
    pnpm tsx "$SKILL_DIR/scripts/import-external.ts" "$@"
    ;;

  scaffold)
    pnpm tsx "$SKILL_DIR/scripts/scaffold-layout.ts" "$@"
    ;;

  implement)
    # Implement from spec file (integration with prd-analyzer)
    spec_file="$1"
    if [ -z "$spec_file" ]; then
      echo "Error: Spec file required"
      echo "Usage: /design implement <spec-file>"
      exit 1
    fi
    # Extract UI requirements and generate components
    echo "Extracting UI requirements from $spec_file..."
    pnpm tsx "$SKILL_DIR/scripts/implement-from-spec.ts" "$spec_file"
    ;;

  performance-check|performance)
    pnpm tsx "$SKILL_DIR/scripts/performance-check.ts" "$@"
    ;;

  figma-import|figma)
    pnpm tsx "$SKILL_DIR/scripts/figma-import.ts" "$@"
    ;;

  help|*)
    echo "Design System Skill (Phase 4 - Proactive Generation)"
    echo ""
    echo "Usage:"
    echo "  /design viewer                   - Open component browser at /design route"
    echo "  /design validate                 - Run all design checks"
    echo "  /design validate-tokens          - Token compliance check"
    echo "  /design validate-spacing         - Layout density check"
    echo "  /design contrast-check           - WCAG contrast validation"
    echo "  /design visual-diff              - Screenshot comparison"
    echo "  /design copy-review              - UX writing quality"
    echo ""
    echo "Phase 4 - Proactive Generation:"
    echo "  /design generate <name> [var]    - Scaffold new component with templates"
    echo "  /design import <source> <comp>   - Import from external library (tremor/tanstack/dnd-kit)"
    echo "  /design scaffold <type> [name]   - Scaffold page layout (dashboard/landing/form/settings)"
    echo "  /design implement <spec-file>    - Generate from spec (prd-analyzer integration)"
    echo ""
    echo "Other:"
    echo "  /design performance-check [comp] - Performance metrics"
    echo "  /design figma-import [file_id]   - Import from Figma (Phase 5)"
    echo ""
    echo "Phase 4 Active - Full proactive generation enabled"
    ;;
esac
