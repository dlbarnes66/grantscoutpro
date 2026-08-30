#!/usr/bin/env bash
set -euo pipefail

# Root of your AI routes – change if yours is just `app/api/ai`
AI_ROOT="src/app/api/ai"

# Folder to stash deleted placeholders (safety net)
TRASH_DIR="$AI_ROOT/_placeholder_trash"
mkdir -p "$TRASH_DIR"

echo "Scanning for placeholder AI routes in: $AI_ROOT"
echo "Moving matched files to: $TRASH_DIR"
echo

# Rule for placeholder files:
# - Contains the broken POST pattern: method: "POST", body,
# - Contains console.error("POST ERROR:", err);
# - Does NOT contain 'OpenAI' (so we don't touch real AI logic)
grep -RIl 'method: "POST"' "$AI_ROOT" | while read -r file; do
  if grep -q 'console.error("POST ERROR:", err);' "$file" && \
     ! grep -q 'OpenAI' "$file"; then
    echo "Placeholder detected → $file"
    mv "$file" "$TRASH_DIR/"
  fi
done

echo
echo "Done. Placeholders moved to: $TRASH_DIR"
echo "Your real AI logic files (with OpenAI calls) are untouched."
