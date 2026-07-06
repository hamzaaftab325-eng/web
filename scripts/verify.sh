#!/bin/bash
# Pre-commit verification script for Aura Living
# Run before declaring any phase complete.
# Exits with error code 1 if any check fails.

set -e

echo "━━━ Aura Living Pre-Commit Verification ━━━"
echo ""

# 1. Check for inline styles
echo "1. Checking for inline styles..."
INLINE_COUNT=$(rg -c 'style=\{\{' src/components/aura/ src/hooks/ src/lib/ src/store/ src/app/ 2>/dev/null | wc -l || echo "0")
if [ "$INLINE_COUNT" -gt "0" ]; then
  echo "   ✗ FAIL: Found $INLINE_COUNT files with inline styles:"
  rg -n 'style=\{\{' src/components/aura/ src/hooks/ src/lib/ src/store/ src/app/ 2>/dev/null
  exit 1
fi
echo "   ✓ PASS: Zero inline styles"

# 2. Check for console.log
echo "2. Checking for console.log..."
CONSOLE_COUNT=$(rg -c 'console\.log' src/components/aura/ src/hooks/ src/lib/api/ src/store/ 2>/dev/null | wc -l || echo "0")
if [ "$CONSOLE_COUNT" -gt "0" ]; then
  echo "   ✗ FAIL: Found console.log in $CONSOLE_COUNT files"
  rg -n 'console\.log' src/components/aura/ src/hooks/ src/lib/api/ src/store/ 2>/dev/null
  exit 1
fi
echo "   ✓ PASS: Zero console.log"

# 3. Check for TODO comments
echo "3. Checking for TODO comments..."
TODO_COUNT=$(rg -c 'TODO|FIXME|HACK' src/components/aura/ src/hooks/ src/lib/ src/store/ 2>/dev/null | wc -l || echo "0")
if [ "$TODO_COUNT" -gt "0" ]; then
  echo "   ✗ FAIL: Found TODO/FIXME/HACK in $TODO_COUNT files"
  exit 1
fi
echo "   ✓ PASS: Zero TODO comments"

# 4. Check for any types (excluding comment lines starting with //)
echo "4. Checking for 'any' types..."
ANY_RESULTS=$(rg -n ': any[;,)\s]|as any[;\s)]|<any>' src/components/aura/ src/hooks/ src/lib/api/ src/store/ -g '*.ts' -g '*.tsx' 2>/dev/null | grep -v '^\s*//' | grep -v '//' || true)
if [ -n "$ANY_RESULTS" ]; then
  echo "   ✗ FAIL: Found 'any' types:"
  echo "$ANY_RESULTS"
  exit 1
fi
echo "   ✓ PASS: Zero 'any' types"

# 5. Run ESLint
echo "5. Running ESLint..."
LINT_OUTPUT=$(bun run lint 2>&1)
LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -E '^\s+\d+:\d+\s+error' | wc -l || echo "0")
if [ "$LINT_ERRORS" -gt "0" ]; then
  echo "   ✗ FAIL: ESLint has $LINT_ERRORS errors"
  echo "$LINT_OUTPUT" | grep -E '^\s+\d+:\d+\s+error'
  exit 1
fi
echo "   ✓ PASS: ESLint clean (0 errors)"

# 6. Run TypeScript check
echo "6. Running TypeScript check..."
TS_OUTPUT=$(npx tsc --noEmit 2>&1 || true)
TS_ERRORS=$(echo "$TS_OUTPUT" | grep '^src/' | wc -l | tr -d ' ')
if [ "$TS_ERRORS" -gt "0" ]; then
  echo "   ✗ FAIL: TypeScript has $TS_ERRORS errors"
  echo "$TS_OUTPUT" | grep '^src/'
  exit 1
fi
echo "   ✓ PASS: TypeScript clean (0 errors)"

echo ""
echo "━━━ All checks passed ✓ ━━━"
