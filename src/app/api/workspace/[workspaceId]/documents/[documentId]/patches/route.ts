import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ----------------------
// GET PATCHES
// ----------------------
export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params;
    const url = new URL(req.url);

    const documentId =
      params.documentId ||
      params.id ||
      url.searchParams.get("documentId");

    const workspaceId =
      params.workspaceId ||
      url.searchParams.get("workspaceId");

    // ⭐ PLACEHOLDER: your original GET logic goes here
    // Example:
    // const patches = await prisma.documentPatch.findMany({
    //   where: { docId: documentId },
    //   orderBy: { createdAt: "asc" }
    // });

    return NextResponse.json({
      success: true,
      method: "GET",
      documentId,
      workspaceId,
      // patches,
    });
  } catch (err: any) {
    console.error("GET ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

// ----------------------
// POST PATCH
// ----------------------
export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params;
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    const documentId =
      params.documentId ||
      params.id ||
      body.documentId ||
      url.searchParams.get("documentId");

    const workspaceId =
      params.workspaceId ||
      body.workspaceId ||
      url.searchParams.get("workspaceId");

    // ⭐ PLACEHOLDER: your original POST logic goes here
    // Example:
    // const newPatch = await prisma.documentPatch.create({
    //   data: {
    //     docId: documentId,
    //     userId: body.userId,
    //     patch: body.patch
    //   }
    // });

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId,
      workspaceId,
      body,
      // newPatch,
    });
  } catch (err: any) {
    console.error("POST ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
