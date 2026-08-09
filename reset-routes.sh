#!/bin/zsh

echo "🔧 Resetting ALL route.ts files to clean Next.js 16 template..."

TEMPLATE='import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Record<string, string> }) {
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

export async function POST(req: NextRequest, context: { params: Record<string, string> }) {
  try {
    const { params } = context;
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      method: "POST",
      params,
      query: Object.fromEntries(url.searchParams.entries()),
      body,
    });
  } catch (err: any) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
'

# Loop through all route.ts files
find src/app/api -type f -name "route.ts" | while read file; do
  echo "⚡ Resetting $file"
  echo "$TEMPLATE" > "$file"
done

echo "✅ All route.ts files have been reset."
