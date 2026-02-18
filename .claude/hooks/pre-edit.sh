#!/bin/bash
# Runs before every Edit/Write/MultiEdit
# - Blocks edits to sensitive files
# - Blocks direct commits to main branch

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

deny() {
  local REASON="$1"
  cat <<EOF >&2
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "$REASON"
  }
}
EOF
  exit 2
}

# --- Block sensitive files ---
if [ -n "$FILE" ]; then
  BASENAME=$(basename "$FILE")
  case "$BASENAME" in
    .env|.env.local|.env.production|.env.*.local)
      deny "Cannot edit $BASENAME — contains secrets. Edit manually."
      ;;
  esac

  # Block lock files (Claude shouldn't touch these)
  case "$BASENAME" in
    pnpm-lock.yaml|package-lock.json|yarn.lock)
      deny "Cannot edit $BASENAME — lock files are managed by the package manager, not manually."
      ;;
  esac
fi

# --- Block commits directly to main ---
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
if [ "$TOOL" = "Bash" ]; then
  CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
  BRANCH=$(git branch --show-current 2>/dev/null)

  if [[ "$BRANCH" == "main" ]] && echo "$CMD" | grep -qE 'git (commit|push)'; then
    deny "On main branch. Create a feature branch first: git checkout -b feat/your-feature"
  fi

  # Block rm -rf
  if echo "$CMD" | grep -qE 'rm\s+-rf\s+/|rm\s+-rf\s+~'; then
    deny "Blocked dangerous rm -rf targeting root or home directory."
  fi
fi

exit 0