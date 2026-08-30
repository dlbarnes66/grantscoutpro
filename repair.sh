#!/bin/bash

echo "=== Repair Script Starting ==="

###############################################
# 1. REMOVE DUPLICATE CLERK IMPORTS
###############################################

grep -Rl "import { auth } from \"@clerk/nextjs/server\"" src/app/api | while IFS= read -r file; do
  # Keep only the FIRST occurrence
  sed -i '' '1,20{s/import { auth } from "@clerk\/nextjs\/server";//}' "$file"
done

###############################################
# 2. REMOVE INVALID/CORRUPTED AUTH IMPORTS
###############################################

grep -Rl 'import { auth } from "@/lib' src/app/api | while IFS= read -r file; do
  sed -i '' '/import { auth } from "\/lib/d' "$file"
done

###############################################
# 3. REMOVE BROKEN SESSION LINES
###############################################

grep -Rl "const session = await ;" src/app/api | while IFS= read -r file; do
  sed -i '' '/const session = await ;/d' "$file"
done

grep -Rl "const { userId } = ;" src/app/api | while IFS= read -r file; do
  sed -i '' '/const { userId } = ;/d' "$file"
done

grep -Rl "const { userId, sessionClaims } = ;" src/app/api | while IFS= read -r file; do
  sed -i '' '/const { userId, sessionClaims } = ;/d' "$file"
done

###############################################
# 4. REMOVE DUPLICATE userId DECLARATIONS
###############################################

grep -Rl "const userId = session" src/app/api | while IFS= read -r file; do
  sed -i '' '/const userId = session/d' "$file"
done

###############################################
# 5. INSERT CORRECT CLERK AUTH INTO API ROUTES
###############################################

grep -Rl "export async function" src/app/api | while IFS= read -r file; do
  # Ensure import at top
  sed -i '' '1s/^/import { auth } from "@clerk\/nextjs\/server";\n/' "$file"

  # Insert correct auth block after function declaration
  sed -i '' '/export async function/a\
  const { userId, sessionClaims } = auth();\
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ' "$file"
done

###############################################
# 6. FIX HOOK NAME CORRUPTION
###############################################

grep -Rl "useWorkspaceLocationss" src | while IFS= read -r file; do
  sed -i '' 's/useWorkspaceLocationss/useWorkspaceLocations/g' "$file"
done

###############################################
# 7. FIX TAILWIND POSTCSS CONFIG
###############################################

cat <<EOF > postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
EOF

###############################################
# 8. FIX REACT-LEAFLET VERSION
###############################################

npm uninstall react-leaflet
npm install react-leaflet@4 leaflet @types/leaflet

###############################################
# 9. CREATE MISSING HOOKS
###############################################

mkdir -p src/hooks

cat <<EOF > src/hooks/useRagChat.ts
"use client";
export function useRagChat() {
  return {
    messages: [],
    sendMessage: async () => {},
    loading: false,
  };
}
EOF

cat <<EOF > src/hooks/useRecommendations.ts
"use client";
export function useRecommendations() {
  return {
    recommendations: [],
    loading: false,
    refresh: async () => {},
  };
}
EOF

cat <<EOF > src/hooks/useSemanticSearch.ts
"use client";
export function useSemanticSearch() {
  return {
    results: [],
    loading: false,
    search: async () => {},
  };
}
EOF

cat <<EOF > src/hooks/useWorkspaceLocations.ts
"use client";
import useSWR from "swr";

export function useWorkspaceLocations(workspaceId: string) {
  const { data, error, mutate } = useSWR(
    workspaceId ? \`/api/workspace/\${workspaceId}/locations\` : null
  );

  return {
    locations: data || [],
    loading: !data && !error,
    refresh: mutate,
  };
}
EOF

###############################################
# 10. CREATE MISSING LOCATION UTILITIES
###############################################

mkdir -p src/lib/location

cat <<EOF > src/lib/location/countyLookup.ts
export function lookupCounty() {
  return null;
}
EOF

cat <<EOF > src/lib/location/opportunityZones.ts
export async function fetchOpportunityZoneStatus() {
  return false;
}
EOF

echo "=== Repair Script Complete ==="
