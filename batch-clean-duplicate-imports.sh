#!/bin/bash

echo "🧹 Removing duplicate NextResponse imports..."

find src/app -type f -name "route.ts" | while read file; do
  echo "Fixing $file"

  # If the file already has the combined import, remove the duplicate
  if grep -q "import { NextRequest, NextResponse } from \"next/server\"" "$file"; then
    sed -i '' '/import { NextResponse } from "next\/server";/d' "$file"
  fi
done

echo "✅ Duplicate import cleanup complete."
