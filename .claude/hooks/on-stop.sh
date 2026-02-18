#!/bin/bash
# Runs when Claude finishes a task (Stop event)
# - Finds packages with git-changed files
# - Runs tests for those packages only
# - exit 2 = block Stop and send failures back to Claude to fix

CHANGED_PKGS=$(git diff --name-only HEAD 2>/dev/null | grep -oP '^(apps|packages)/[^/]+' | sort -u)

# Nothing changed tracked by git yet (new files, etc) — also check staged
if [ -z "$CHANGED_PKGS" ]; then
  CHANGED_PKGS=$(git diff --name-only --cached 2>/dev/null | grep -oP '^(apps|packages)/[^/]+' | sort -u)
fi

[ -z "$CHANGED_PKGS" ] && exit 0

FAILED=0
ERRORS=""

for PKG in $CHANGED_PKGS; do
  [ ! -f "$PKG/package.json" ] && continue

  # Skip if no test script defined
  if ! grep -q '"test"' "$PKG/package.json" 2>/dev/null; then
    continue
  fi

  echo "Running tests: $PKG"
  OUTPUT=$(cd "$PKG" && pnpm test --run 2>&1)
  STATUS=$?

  if [ $STATUS -ne 0 ]; then
    FAILED=1
    ERRORS+="=== FAILED: $PKG ===\n"
    # Last 30 lines is usually where the actual failure is
    ERRORS+=$(echo "$OUTPUT" | tail -30)
    ERRORS+="\n\n"
  else
    echo "✓ $PKG"
  fi
done

if [ $FAILED -ne 0 ]; then
  # exit 2 blocks Claude from stopping — it re-enters the loop to fix failures
  printf "Tests failed. Fix these before finishing:\n\n%b" "$ERRORS" >&2
  exit 2
fi

exit 0