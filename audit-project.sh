#!/bin/bash

# Full repo audit for TypeScript health
# Colors:
#   WHITE  = not part of TS project
#   GREEN  = clean
#   YELLOW = warnings
#   RED    = errors

TS_OUTPUT=$(npx tsc --noEmit --pretty false --project tsconfig.json)

ALL_FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \))

echo ""
echo "=== PROJECT HEALTH AUDIT ==="
echo ""

for file in $ALL_FILES; do
  # Normalize path for matching
  CLEAN_PATH="${file#./}"

  # Not part of TS project
  if ! grep -q "$CLEAN_PATH" <<< "$TS_OUTPUT"; then
    echo -e "\033[37mWHITE  $CLEAN_PATH\033[0m"
    continue
  fi

  # Errors
  if grep -q "$CLEAN_PATH" <<< "$TS_OUTPUT" && grep -q "error TS" <<< "$TS_OUTPUT"; then
    echo -e "\033[31mRED    $CLEAN_PATH\033[0m"
    continue
  fi

  # Warnings (TS doesn't always separate these cleanly)
  if grep -q "$CLEAN_PATH" <<< "$TS_OUTPUT" && grep -q "warning" <<< "$TS_OUTPUT"; then
    echo -e "\033[33mYELLOW $CLEAN_PATH\033[0m"
    continue
  fi

  # Clean
  echo -e "\033[32mGREEN  $CLEAN_PATH\033[0m"
done

echo ""
echo "=== AUDIT COMPLETE ==="
echo ""
