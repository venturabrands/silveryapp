#!/bin/bash
# Runs after every Edit/Write/MultiEdit
# - Formats with oxfmt
# - Lints with oxlint --fix
# - Type checks the affected package
# - Feeds TS errors back to Claude via additionalContext

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Nothing to do
[ -z "$FILE" ] && exit 0
[ ! -f "$FILE" ] && exit 0

EXT="${FILE##*.}"

# Handle non-TS files
case "$EXT" in
  toml)
    oxfmt "$FILE" 2>/dev/null
    exit 0
    ;;
  ts|tsx|js|jsx|mts|cts)
    ;;  # continue below
  *)
    exit 0
    ;;
esac

# --- Format & Lint (always silent, never block) ---
oxfmt "$FILE" 2>/dev/null
oxlint --fix "$FILE" 2>/dev/null

# --- TypeScript check for the affected package ---
# Find the nearest package with a tsconfig.json
PKG_DIR=""
SEARCH="$FILE"
while [[ "$SEARCH" != "/" ]]; do
  SEARCH=$(dirname "$SEARCH")
  if [ -f "$SEARCH/tsconfig.json" ] && [ -f "$SEARCH/package.json" ]; then
    PKG_DIR="$SEARCH"
    break
  fi
done

if [ -z "$PKG_DIR" ]; then
  exit 0
fi

TSC_OUT=$(cd "$PKG_DIR" && pnpm tsc --noEmit 2>&1)
TSC_EXIT=$?

if [ $TSC_EXIT -ne 0 ] && [ -n "$TSC_OUT" ]; then
  # Trim to first 30 errors to avoid flooding context
  TRIMMED=$(echo "$TSC_OUT" | head -60)
  ESCAPED=$(printf '%s' "$TRIMMED" | jq -Rs .)
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "TypeScript errors detected in ${PKG_DIR}. Fix these before continuing:\n${TRIMMED}"
  }
}
EOF
fi

exit 0