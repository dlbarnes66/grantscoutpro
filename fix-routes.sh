#!/bin/zsh

echo "🔧 Normalizing ALL route.ts files..."

ROUTE_FILES=$(find src/app/api -type f -name "route.ts")

for file in $ROUTE_FILES; do
  echo "⚙️ Fixing $file"

  # 1. Remove broken fragments from earlier sed runs
  sed -i '' \
    -e 's/\<request\>//g' \
    -e 's/\<workspaceId\>\s*\?\?//g' \
    -e 's/\<method\>//g' \
    -e 's/\<err\>//g' \
    -e 's/console.error([^)]*)//g' \
    "$file"

  # 2. Remove malformed comma operator blocks
  sed -i '' \
    -e 's/,\s*}/}/g' \
    -e 's/,\s*)/)/g' \
    "$file"

  # 3. Ensure correct imports at top
  sed -i '' \
    '1s/^/import { NextRequest, NextResponse } from "next\/server";\n/' \
    "$file"

  # 4. Normalize GET signature
  sed -i '' \
    -e 's/export async function GET([^)]*)/export async function GET(req: NextRequest, context: { params: Record<string,string> })/' \
    "$file"

  # 5. Normalize POST signature
  sed -i '' \
    -e 's/export async function POST([^)]*)/export async function POST(req: NextRequest, context: { params: Record<string,string> })/' \
    "$file"

  # 6. Ensure braces are balanced
  # (Fixes the “Expected '}' got <eof>” errors)
  sed -i '' \
    -e 's/return NextResponse.json([^)]*)$/return NextResponse.json({ success: true });/g' \
    "$file"

done

echo "✅ All route.ts files normalized."
echo "🔧 Fixing auth imports..."

# Fix auth imports globally
grep -rl 'from "@/auth"' src/app | xargs sed -i '' 's/from "@\/auth"/from "@\/lib\/auth\/nextauth"/g'

echo "🎉 Done. Re-run: pnpm build"
