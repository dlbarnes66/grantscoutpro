#!/bin/bash

echo "🧹 Removing stray ') {' lines from route.ts files..."

find src/app -type f -name "route.ts" | while read file; do
  echo "Fixing $file"
  sed -i '' '/^) *{$/d' "$file"
done

echo "✅ Broken line cleanup complete."
