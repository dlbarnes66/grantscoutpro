#!/bin/bash

echo "🔧 GrantScout Pro — Global Auth Repair Script"
echo "---------------------------------------------"

API_DIR="./src/app/api"

echo "📌 Target directory: $API_DIR"
echo ""

# 1. Replace incorrect auth imports with the correct Clerk import
echo "🔄 Fixing auth imports..."
grep -rl "import { auth }" $API_DIR | while read -r file; do
  sed -i '' 's|import { auth }.*|import { auth } from "@clerk/nextjs/server";|g' "$file"
done

# 2. Insert 'await' before auth() everywhere
echo "🔄 Adding 'await' to auth() calls..."
grep -rl "auth()" $API_DIR | while read -r file; do
  sed -i '' 's|auth()|await auth()|g' "$file"
done

# 3. Fix destructuring: { userId } = auth() → { userId } = await auth()
echo "🔄 Fixing destructuring patterns..."
grep -rl "const { userId" $API_DIR | while read -r file; do
  sed -i '' 's|const { userId|const { userId, sessionClaims|g' "$file"
done

# 4. Remove duplicate auth imports
echo "🔄 Removing duplicate auth imports..."
grep -rl "import { auth }" $API_DIR | while read -r file; do
  # Remove any duplicate lines
  awk '!seen[$0]++' "$file" > tmp && mv tmp "$file"
done

echo ""
echo "✅ Global auth repair complete."
echo "🚀 Your API folder should now be dramatically cleaner."
echo "---------------------------------------------"
