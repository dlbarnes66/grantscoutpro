#!/bin/bash

echo "🔧 GrantScout Pro — Deep Destructuring Repair"
echo "---------------------------------------------"

API_DIR="./src/app/api"

echo "📌 Target directory: $API_DIR"
echo ""

# 1. Remove stray commas AFTER destructuring
echo "🔄 Removing stray commas after destructuring..."
grep -rl "const { userId" $API_DIR | while read -r file; do
  sed -i '' 's/const { userId, sessionClaims } ,/const { userId, sessionClaims }/g' "$file"
  sed -i '' 's/const { userId, sessionClaims },/const { userId, sessionClaims }/g' "$file"
done

# 2. Remove stray commas BEFORE destructuring
echo "🔄 Removing stray commas before destructuring..."
grep -rl ", const { userId" $API_DIR | while read -r file; do
  sed -i '' 's/, const { userId/const { userId/g' "$file"
done

# 3. Remove comma operator after destructuring assignment
echo "🔄 Removing comma operator after destructuring assignment..."
grep -rl "const { userId" $API_DIR | while read -r file; do
  sed -i '' 's/} = await auth(),/} = await auth()/g' "$file"
done

# 4. Remove trailing commas inside destructuring
echo "🔄 Removing trailing commas inside destructuring..."
grep -rl "const { userId" $API_DIR | while read -r file; do
  sed -i '' 's/const { userId, sessionClaims, }/const { userId, sessionClaims }/g' "$file"
done

# 5. Remove duplicate destructuring lines
echo "🔄 Removing duplicate destructuring lines..."
grep -rl "const { userId, sessionClaims" $API_DIR | while read -r file; do
  awk '!seen[$0]++' "$file" > tmp && mv tmp "$file"
done

echo ""
echo "✅ Deep destructuring cleanup complete."
echo "🚀 Error count should drop significantly."
echo "---------------------------------------------"

