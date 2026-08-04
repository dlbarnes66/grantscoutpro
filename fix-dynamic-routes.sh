#!/bin/bash

echo "Fixing all Next.js 16 dynamic route signatures..."

find src/app/api -type f -name "route.ts" | while read file; do
  dir=$(dirname "$file")
  param=$(basename "$dir" | sed -n 's/\[\(.*\)\]/\1/p')

  if [ -n "$param" ]; then
    echo "Fixing $file (param: $param)"

    # Replace old signature with new Next.js 16 signature
    sed -i '' \
      "s/export async function GET(.*{ params }.*{/export async function GET(req: NextRequest, context: { params: Promise<{ $param: string }> }) {/" \
      "$file"

    sed -i '' \
      "s/export async function POST(.*{ params }.*{/export async function POST(req: NextRequest, context: { params: Promise<{ $param: string }> }) {/" \
      "$file"

    sed -i '' \
      "s/export async function PUT(.*{ params }.*{/export async function PUT(req: NextRequest, context: { params: Promise<{ $param: string }> }) {/" \
      "$file"

    sed -i '' \
      "s/export async function DELETE(.*{ params }.*{/export async function DELETE(req: NextRequest, context: { params: Promise<{ $param: string }> }) {/" \
      "$file"

    # Replace old param extraction
    sed -i '' \
      "s/const { $param } = params;/const { $param } = await context.params;/" \
      "$file"
  fi
done

echo "All dynamic routes updated."
