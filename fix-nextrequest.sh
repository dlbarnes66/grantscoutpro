#!/bin/zsh

echo "🔧 Fixing NextRequest imports in all route.ts files..."

# 1. Add import at top ONLY if missing
find src/app/api -type f -name "route.ts" | while read file; do
  if ! grep -q "NextRequest" "$file"; then
    echo "Adding import to $file"
    sed -i '' '1s/^/import { NextRequest, NextResponse } from "next/server";\n/' "$file"
  fi
done

# 2. Remove duplicate imports
grep -rl 'import { NextRequest' src/app/api | while read file; do
  echo "Cleaning duplicates in $file"
  # Remove any duplicate lines AFTER the first
  awk '!seen[$0]++' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
done

# 3. Fix all GET/POST signatures to use NextRequest + context.params
grep -rl 'export async function GET' src/app/api | while read file; do
  sed -i '' 's/export async function GET([^)]*)/export async function GET(req: NextRequest, context: { params: Record<string, string> })/' "$file"
done

grep -rl 'export async function POST' src/app/api | while read file; do
  sed -i '' 's/export async function POST([^)]*)/export async function POST(req: NextRequest, context: { params: Record<string, string> })/' "$file"
done

echo "✅ All route.ts files patched."
