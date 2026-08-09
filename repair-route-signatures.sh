#!/bin/bash

echo "🔧 Starting SAFE route signature repair..."
echo "This will ONLY modify route.ts files and ONLY fix signatures."

# Find all route.ts files
ROUTES=$(find src/app -type f -name "route.ts")

for file in $ROUTES; do
  echo "⚙️ Repairing $file"

  # 1. Remove corrupted lines introduced by previous scripts
  sed -i '' \
    -e '/req: Request,/d' \
    -e '/context: { params: {}/d' \
    -e '/context: { params: {} }/d' \
    -e '/context: { params: {} }/d' \
    -e '/params = await (context as any).params/d' \
    -e '/Left side of comma operator/d' \
    "$file"

  # 2. Ensure correct imports exist
  grep -q "NextRequest" "$file"
  if [ $? -ne 0 ]; then
    sed -i '' '1s/^/import { NextRequest, NextResponse } from "next\/server";\n/' "$file"
  fi

  # 3. Fix GET signature
  sed -i '' \
    -e 's/export async function GET.*/export async function GET(req: NextRequest, context: { params: Record<string, string> }) {/' \
    "$file"

  # 4. Fix POST signature
  sed -i '' \
    -e 's/export async function POST.*/export async function POST(req: NextRequest, context: { params: Record<string, string> }) {/' \
    "$file"

  # 5. Insert params extraction if missing
  grep -q "const { params } = context" "$file"
  if [ $? -ne 0 ]; then
    sed -i '' \
      -e '/export async function GET/a\
  const { params } = context;
      ' \
      -e '/export async function POST/a\
  const { params } = context;
      ' \
      "$file"
  fi

done

echo "✅ SAFE route signature repair complete."
echo "👉 Now run: rm -rf .next && npm run build"
