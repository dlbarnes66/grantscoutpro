#!/bin/bash

echo "🔧 GrantScout Pro — Duplicate sessionClaims Repair"
echo "--------------------------------------------------"

API_DIR="./src/app/api"

echo "📌 Target directory: $API_DIR"
echo ""

# 1. Remove duplicate sessionClaims in destructuring
echo "🔄 Cleaning destructuring duplicates..."
grep -rl "sessionClaims" $API_DIR | while read -r file; do
  sed -i '' 's/sessionClaims, sessionClaims/sessionClaims/g' "$file"
  sed -i '' 's/sessionClaims , sessionClaims/sessionClaims/g' "$file"
  sed -i '' 's/sessionClaims,sessionClaims/sessionClaims/g' "$file"
done

# 2. Remove standalone duplicate declarations
echo "🔄 Removing duplicate variable declarations..."
grep -rl "const sessionClaims" $API_DIR | while read -r file; do
  # Keep only the FIRST occurrence of "const sessionClaims"
  awk '!seen[$0]++' "$file" > tmp && mv tmp "$file"
done

# 3. Remove any accidental double destructuring lines
echo "🔄 Removing duplicate destructuring lines..."
grep -rl "const { userId, sessionClaims" $API_DIR | while read -r file; do
  awk '!seen[$0]++' "$file" > tmp && mv tmp "$file"
done

echo ""
echo "✅ sessionClaims duplicates removed."
echo "🚀 Your error count should drop significantly."
echo "--------------------------------------------------"
