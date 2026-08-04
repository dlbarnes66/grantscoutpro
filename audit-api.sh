#!/usr/bin/env bash
set -e

echo "=== API HEALTH AUDIT (src/app/api) ==="

# Run TypeScript once and capture all diagnostics
TS_OUTPUT=$(npx tsc --noEmit --pretty false --project tsconfig.json || true)

# All API route files
API_FILES=$(find src/app/api -type f \( -name "*.ts" -o -name "*.tsx" \))

for file in $API_FILES; do
  # Grab only diagnostics that mention this file
  FILE_DIAGS=$(grep -F "$file" <<< "$TS_OUTPUT" || true)

  if [ -z "$FILE_DIAGS" ]; then
    # No diagnostics at all for this file
    echo -e "\033[37mWHITE  $file\033[0m"
  elif grep -Fq "error TS" <<< "$FILE_DIAGS"; then
    # At least one TS error for this file
    echo -e "\033[31mRED    $file\033[0m"
  else
    # Diagnostics but no "error TS" (treat as warning/info)
    echo -e "\033[33mYELLOW $file\033[0m"
  fi
done
