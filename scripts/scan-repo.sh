#!/bin/bash

echo "=== SCANNING REPO FOR PATH ISSUES ==="

echo ""
echo "Checking for folders with accidental spaces..."
find app -type d -name "* *"

echo ""
echo "Checking for trailing spaces..."
find app -type d -name "* "

echo ""
echo "Checking for missing slashes (workspaceIdrecommended)..."
find app -type d -name "*[workspaceId]recommended"

echo ""
echo "Checking for leftover [id] folders..."
find app -type d -name "[id]"

echo ""
echo "Checking for uppercase dynamic slugs..."
find app -type d -regex ".*\[[A-Z].*\]"

echo ""
echo "Checking for missing imports..."
find app -type f -name "*.tsx" -o -name "*.ts" | while read file; do
  grep -E "import .* from ['\"](\./|\../)" "$file" | while read line; do
    path=$(echo "$line" | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/")
    fullpath="$(dirname "$file")/$path"
    if ! ls $fullpath* >/dev/null 2>&1; then
      echo "Missing import in $file → $path"
    fi
  done
done

echo ""
echo "=== SCAN COMPLETE ==="
