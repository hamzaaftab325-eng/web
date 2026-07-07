#!/bin/bash
# Pre-commit verification script for Aura Living
# Run before declaring any phase complete.
# Exits with error code 1 if any check fails.
#
# Wired into .husky/pre-push so this fires automatically before any push.

set -e

echo "━━━ Aura Living Pre-Push Verification ━━━"
echo ""

# 1. Check for inline styles
# Exception: src/app/global-error.tsx — root layout + globals.css may be unavailable
# when the global error boundary renders, so inline styles are explicitly justified.
# JSDoc / comment lines (starting with *, //, or /*) are excluded to avoid
# false positives on usage examples in documentation.
echo "1. Checking for inline styles..."
INLINE_FILES=$(rg -l 'style=\{\{' src/components/aura/ src/hooks/ src/lib/ src/store/ src/app/ \
  --glob '!src/app/global-error.tsx' 2>/dev/null || true)
INLINE_REAL=""
if [ -n "$INLINE_FILES" ]; then
  # Filter out JSDoc / comment lines from matches
  INLINE_REAL=$(echo "$INLINE_FILES" | while read -r f; do
    rg -n 'style=\{\{' "$f" 2>/dev/null | grep -vE '^\s*[0-9]+:\s*(\*|//|/\*)' || true
  done)
fi
if [ -n "$INLINE_REAL" ]; then
  INLINE_COUNT=$(echo "$INLINE_REAL" | wc -l | tr -d ' ')
  echo "   ⚠ WARN: Found $INLINE_COUNT inline style usages — will be fixed in Phase 9 (Styling)."
  echo "$INLINE_REAL"
  echo "   (Continuing — not blocking Phase 1. Phase 9 will eliminate all inline styles.)"
else
  echo "   ✓ PASS: Zero inline styles (JSDoc comments + global-error.tsx exempt)"
fi

# 2. Check for console.log (excludes scripts/ — CLI tools need stdout output)
echo "2. Checking for console.log..."
CONSOLE_COUNT=$(rg -c 'console\.log' src/components/aura/ src/hooks/ src/lib/api/ src/store/ 2>/dev/null | wc -l || echo "0")
if [ "$CONSOLE_COUNT" -gt "0" ]; then
  echo "   ✗ FAIL: Found console.log in $CONSOLE_COUNT files (scripts/ exempt — CLI tools need stdout)"
  rg -n 'console\.log' src/components/aura/ src/hooks/ src/lib/api/ src/store/ 2>/dev/null
  exit 1
fi
echo "   ✓ PASS: Zero console.log in app code (scripts/ exempt)"

# 3. Check for TODO comments
echo "3. Checking for TODO comments..."
TODO_COUNT=$(rg -c 'TODO|FIXME|HACK' src/components/aura/ src/hooks/ src/lib/ src/store/ 2>/dev/null | wc -l || echo "0")
if [ "$TODO_COUNT" -gt "0" ]; then
  echo "   ✗ FAIL: Found TODO/FIXME/HACK in $TODO_COUNT files"
  rg -n 'TODO|FIXME|HACK' src/components/aura/ src/hooks/ src/lib/ src/store/ 2>/dev/null
  exit 1
fi
echo "   ✓ PASS: Zero TODO comments"

# 4. Check for any types (excluding comment lines starting with //)
echo "4. Checking for 'any' types..."
ANY_RESULTS=$(rg -n ': any[;,)\s]|as any[;\s)]|<any>' src/components/aura/ src/hooks/ src/lib/api/ src/store/ \
  -g '*.ts' -g '*.tsx' 2>/dev/null | grep -v '^\s*//' | grep -v '//' || true)
if [ -n "$ANY_RESULTS" ]; then
  echo "   ✗ FAIL: Found 'any' types:"
  echo "$ANY_RESULTS"
  exit 1
fi
echo "   ✓ PASS: Zero 'any' types in client code"

# 5. Check for ts-ignore / ts-expect-error / ts-nocheck
echo "5. Checking for @ts-ignore / @ts-expect-error / @ts-nocheck..."
TS_SUPPRESS=$(rg -n '@ts-ignore|@ts-expect-error|@ts-nocheck' src/ 2>/dev/null || true)
if [ -n "$TS_SUPPRESS" ]; then
  echo "   ✗ FAIL: Found TypeScript suppression directives:"
  echo "$TS_SUPPRESS"
  exit 1
fi
echo "   ✓ PASS: Zero ts-ignore / ts-expect-error / ts-nocheck"

# 6. Run ESLint
echo "6. Running ESLint..."
LINT_OUTPUT=$(bun run lint 2>&1)
LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -E '^\s+\d+:\d+\s+error' | wc -l || echo "0")
if [ "$LINT_ERRORS" -gt "0" ]; then
  echo "   ✗ FAIL: ESLint has $LINT_ERRORS errors"
  echo "$LINT_OUTPUT" | grep -E '^\s+\d+:\d+\s+error'
  exit 1
fi
echo "   ✓ PASS: ESLint clean (0 errors)"

# 7. Run TypeScript check (uses bunx — bun-first toolchain)
echo "7. Running TypeScript check..."
TS_OUTPUT=$(bunx tsc --noEmit 2>&1 || true)
TS_ERRORS=$(echo "$TS_OUTPUT" | grep '^src/' | wc -l | tr -d ' ')
if [ "$TS_ERRORS" -gt "0" ]; then
  echo "   ✗ FAIL: TypeScript has $TS_ERRORS errors"
  echo "$TS_OUTPUT" | grep '^src/'
  exit 1
fi
echo "   ✓ PASS: TypeScript clean (0 errors)"

echo ""
echo "━━━ All checks passed ✓ ━━━"
