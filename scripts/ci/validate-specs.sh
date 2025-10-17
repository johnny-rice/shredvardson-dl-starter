#!/bin/bash
set -euo pipefail

# Source shared libraries
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
source "$SCRIPT_DIR/lib/error-reporter.sh"

# Help text
show_help() {
  cat <<EOF
Usage: validate-specs.sh [DIRECTORY]

Validate spec directory structure and content.

Arguments:
  DIRECTORY    Path to specs directory (default: specs/)

Options:
  -h, --help   Show this help message

Exit codes:
  0  All specs valid
  1  Validation failed

Examples:
  ./validate-specs.sh
  ./validate-specs.sh specs/
  ./validate-specs.sh path/to/specs/

EOF
}

# Parse arguments
SPECS_DIR="${1:-specs}"

if [ "$SPECS_DIR" = "-h" ] || [ "$SPECS_DIR" = "--help" ]; then
  show_help
  exit 0
fi

# Check if specs directory exists
if [ ! -d "$SPECS_DIR" ]; then
  log_info "No specs directory found at: $SPECS_DIR"
  log_info "Skipping spec validation"
  exit 0
fi

# Validate each spec directory
validation_failed=0

for spec_dir in "$SPECS_DIR"/*/; do
  if [ -d "$spec_dir" ]; then
    spec_name=$(basename "$spec_dir")
    echo "Validating spec: $spec_name"

    # Check naming convention (should start with three digits)
    if ! echo "$spec_name" | grep -q "^[0-9]\{3\}-"; then
      report_ci_error "Spec directory $spec_name does not follow naming convention (###-name)" "spec-validation"
      validation_failed=1
      continue
    fi

    # Check for required files
    required_files=("README.md" "DESIGN.md")
    for file in "${required_files[@]}"; do
      if [ ! -f "$spec_dir$file" ]; then
        report_ci_error "Missing required file: $spec_dir$file" "spec-validation"
        validation_failed=1
        continue 2
      fi
    done

    # Validate README.md structure
    if ! grep -q "^# Spec" "$spec_dir/README.md"; then
      report_ci_error "Spec README.md missing proper header: $spec_dir/README.md" "spec-validation"
      validation_failed=1
      continue
    fi

    # Check for status metadata
    if ! grep -q "Status:" "$spec_dir/README.md"; then
      report_ci_error "Spec README.md missing status field: $spec_dir/README.md" "spec-validation"
      validation_failed=1
      continue
    fi

    log_info "Spec $spec_name structure validated"
  fi
done

if [ $validation_failed -eq 0 ]; then
  report_ci_success "All specs validated successfully"
  exit 0
else
  exit 1
fi