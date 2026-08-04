#!/bin/bash

echo "Fixing all typed { params }: { params: {...} } routes..."

grep -R "{ params }: { params:" src/app/api -n | cut -d: -f1 | sort -u | while read file; do
  echo "Fixing $file"

  # Extract dynamic params from folder path
  dir=$(dirname "$file")
  params=()

  while [[ "$dir" != "src/app/api" ]]; do
    base=$(basename "$dir")
    extracted=$(echo "$base" | sed -n 's/\[\(.*\)\]/\1/p')
    if [[ -n "$extracted" ]]; then
      params+=("$extracted")
    fi
    dir=$(dirname "$dir")
  done

  # Build param type
  paramType="Promise<{ "
  for p in "${params[@]}"; do
    paramType+="$p: string; "
  done
  paramType+="}>"

  # Build extraction
  extractLine="const { "
  for p in "${params[@]}"; do
    extractLine+="$p, "
  done
  extractLine+="} = await context.params;"

  # Rewrite GET/POST/PUT/DELETE signatures
  sed -i '' \
    "s/export async function GET.*/export async function GET(req: NextRequest, context: { params: $paramType }) {/" \
    "$file"

  sed -i '' \
    "s/export async function POST.*/export async function POST(req: NextRequest, context: { params: $paramType }) {/" \
    "$file"

  sed -i '' \
    "s/export async function PUT.*/export async function PUT(req: NextRequest, context: { params: $paramType }) {/" \
    "$file"

  sed -i '' \
    "s/export async function DELETE.*/export async function DELETE(req: NextRequest, context: { params: $paramType }) {/" \
    "$file"

  # Replace typed param extraction
  sed -i '' \
    "s/{ params }: { params: {.*} }/$extractLine/" \
    "$file"

  # Ensure NextRequest import
  sed -i '' \
    's/import { NextResponse }/import { NextRequest, NextResponse }/' \
    "$file"
done

echo "All typed params routes updated."
