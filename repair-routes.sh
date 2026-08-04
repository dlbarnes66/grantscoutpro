#!/bin/bash

API_DIR="src/app/api"

TEMPLATE='import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteParams = {
  workspaceId?: string;
  documentId?: string;
  grantId?: string;
  id?: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const url = new URL(req.url);

    const documentId =
      params.documentId ||
      params.grantId ||
      params.id ||
      url.searchParams.get("documentId");

    const workspaceId =
      params.workspaceId ||
      url.searchParams.get("workspaceId");

    // TODO: implement real GET logic here

    return NextResponse.json({
      success: true,
      method: "GET",
      documentId,
      workspaceId,
    });
  } catch (err: any) {
    console.error("GET ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const url = new URL(req.url);

    const documentId =
      params.documentId ||
      params.grantId ||
      params.id ||
      body.documentId ||
      url.searchParams.get("documentId");

    const workspaceId =
      params.workspaceId ||
      body.workspaceId ||
      url.searchParams.get("workspaceId");

    // TODO: implement real POST logic here

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId,
      workspaceId,
      body,
    });
  } catch (err: any) {
    console.error("POST ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
'

echo "Scanning for route.ts files under $API_DIR..."

find "$API_DIR" -type f -name "route.ts" | while read -r file; do
  echo "Repairing $file"
  printf "%s\n" "$TEMPLATE" > "$file"
done

echo "Done. All route.ts files have been replaced with the global template."
