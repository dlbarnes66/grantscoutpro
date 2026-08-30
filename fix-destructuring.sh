#!/bin/bash

echo "🔧 GrantScout Pro — Global Destructuring Repair"
echo "------------------------------------------------"

API_DIR="./src/app/api"

echo "📌 Target directory: $API_DIR"
echo ""

# 1. Fix duplicate sessionClaims inside destructuring
echo "🔄 Removing duplicate sessionClaims..."
grep -rl "sessionClaims" $API_DIR | while read -r file; do
  sed -i '' 's/sessionClaims, sessionClaims/sessionClaims/g' "$file"
done

# 2. Remove trailing commas inside destructuring
echo "🔄 Removing trailing commas inside destructuring..."
grep -rl "const { userId" $API_DIR | while read -r file; do
  sed -i '' 's/const { userId, sessionClaims, }/const { userId, sessionClaims }/g' "$file"
done

# 3. Remove stray commas after destructuring
echo "🔄 Removing stray commas after destructuring..."
grep -rl "const { userId" $API_DIR | while read -r file; do
  sed -i '' 's/const { userId, sessionClaims },/const { userId, sessionClaims }/g' "$file"
done

# 4. Remove stray commas before destructuring
echo "🔄 Removing stray commas before destructuring..."
grep -rl ", const { userId" $API_DIR | while read -r file; do
  sed -i '' 's/, const { userId/const { userId/g' "$file"
done

# 5. Remove any duplicate destructuring lines entirely
echo "🔄 Removing duplicate destructuring lines..."
grep -rl "const { userId, sessionClaims" $API_DIR | while read -r file; do
  awk '!seen[$0]++' "$file" > tmp && mv tmp "$file"
done

echo ""
echo "✅ Destructuring cleanup complete."
echo "🚀 Error count should drop significantly."
echo "------------------------------------------------"
