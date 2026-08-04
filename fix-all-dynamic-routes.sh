#!/bin/bash

echo "Fixing ALL dynamic route signatures (multi-param aware)..."

find src/app/api -type f -name "route.ts" | while read file; do
  dir=$(dirname "$file")

  # Collect ALL dynamic params in the folder path
  params=()
  while [[ "$dir" != "src/app/api" ]]; do
    base=$(basename "$dir")
    extracted=$(echo "$base" | sed -n 's/\[\(.*\)\]/\1/p')
    if [[ -n "$extracted" ]]; then
      params+=("$extracted")
    fi
    dir=$(dirname "$dir")
  done

  if [[ ${#params[@]} -gt 0 ]]; then
    echo "Fixing $file (params: ${params[*]})"

    # Build the Promise<{ param1: string; param2: string; }>
    paramType="Promise<{ "
    for p in "${params[@]}"; do
      paramType+="$p: string; "
    done
    paramType+="}>"

    # Build the extraction line
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

    # Replace ANY old param extraction
    sed -i '' \
      "s/const {.*params.*/$extractLine/" \
      "$file"

    # Ensure NextRequest is imported
    sed -i '' \
      's/import { NextResponse }/import { NextRequest, NextResponse }/' \
      "$file"
  fi
done

echo "All dynamic routes updated."
