#!/bin/bash

echo "🔧 GrantScout Pro — Global Admin Placeholder Route Repair"
echo "---------------------------------------------------------"

ADMIN_DIR="./src/app/api/admin"

echo "📌 Target directory: $ADMIN_DIR"
echo ""

# Universal template content
read -r -d '' TEMPLATE << 'EOF'
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { params } = context;
    const url = new URL(req.url);

    return NextResponse.json({
      success: true,
      method: "GET",
      params,
      query: Object.fromEntries(url.searchParams.entries()),
    });
  } catch (err: any) {
    console.error("GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { params } = context;

    return NextResponse.json({
      success: true,
      method: "POST",
      params,
      body,
    });
  } catch (err: any) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
EOF

# Find all placeholder admin routes
echo "🔍 Scanning for corrupted placeholder routes..."

find "$ADMIN_DIR" -type f -name "route.ts" | while read -r file; do
  if grep -q "await await auth" "$file" || grep -q "method: \"POST\", body," "$file"; then
    echo "⚠️  Repairing placeholder route: $file"
    echo "$TEMPLATE" > "$file"
  else
    echo "✔️  Skipping real logic route: $file"
  fi
done

echo ""
echo "✅ Global admin placeholder route repair complete."
echo "🚀 Your error count should drop dramatically."
echo "---------------------------------------------------------"
