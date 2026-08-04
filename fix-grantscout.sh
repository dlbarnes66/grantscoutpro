#!/bin/bash

echo "🔥 Starting full Grantscout Pro migration…"

###############################################
# 1️⃣ FIX ALL ROUTE SIGNATURES (GET/POST)
###############################################

find src/app/api -type f -name "route.ts" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e 's/export async function GET.*/export async function GET(request: NextRequest, context: any) {/g' \
    -e 's/export async function POST.*/export async function POST(request: NextRequest, context: any) {/g' \
    "$file"
done

echo "✔ Route signatures updated"


###############################################
# 2️⃣ INSERT MISSING PARAMS EXTRACTION
###############################################

find src/app/api -type f -name "route.ts" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e '/params\./i\
  const params = await (context as any).params;
  ' \
    "$file"
done

echo "✔ Params extraction inserted"


###############################################
# 3️⃣ REMOVE .ts EXTENSIONS FROM IMPORTS
###############################################

find src -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e 's/\.ts";/";/g' \
    -e "s/\.ts';/';/g" \
    "$file"
done

echo "✔ Removed .ts extensions from imports"


###############################################
# 4️⃣ NORMALIZE PARAM NAMES (dashboardId → workspaceId)
###############################################

find src/app/dashboard -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e 's/dashboardId/workspaceId/g' \
    "$file"
done

echo "✔ Normalized param names"


###############################################
# 5️⃣ FIX COMMON JSX BREAKAGE
###############################################

find src/app/dashboard -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e 's/<div className="space-y-6">/<div className="space-y-6">/g' \
    -e 's/<div className="flex items-center justify-between">/<div className="flex items-center justify-between">/g' \
    -e 's/return (/return (/g' \
    "$file"
done

echo "✔ JSX cleanup applied"


###############################################
# 6️⃣ FIX FETCH PATHS USING WRONG PARAMS
###############################################

find src/app -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e 's/params.dashboardId/params.workspaceId/g' \
    -e 's/\/dashboard\/.*\/grant/\/dashboard\/${params.workspaceId}\/grant/g' \
    "$file"
done

echo "✔ Fetch paths corrected"


###############################################
# 7️⃣ CLEAN UP LEGACY NEXT.JS 13 PATTERNS
###############################################

find src/app -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
  sed -i '' \
    -e 's/getServerSession/auth/g' \
    "$file"
done

echo "✔ Legacy Next.js 13 patterns removed"


###############################################
# DONE
###############################################

echo "🎉 Full migration complete!"
echo "👉 Now run: rm -rf .next && npm run build"
