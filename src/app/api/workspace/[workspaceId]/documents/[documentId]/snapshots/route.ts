import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ----------------------
// GET SNAPSHOTS
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
    // const snapshots = await prisma.documentSnapshot.findMany({
    //   where: { docId: documentId },
    //   orderBy: { createdAt: "desc" }
    // });

    return NextResponse.json({
      success: true,
      method: "GET",
      documentId,
      workspaceId,
      // snapshots,
    });
  } catch (err: any) {
    console.error("GET SNAPSHOTS ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

// ----------------------
// POST SNAPSHOT
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
    // const newSnapshot = await prisma.documentSnapshot.create({
    //   data: {
    //     docId: documentId,
    //     userId: body.userId,
    //     content: body.content
    //   }
    // });

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId,
      workspaceId,
      body,
      // newSnapshot,
    });
  } catch (err: any) {
    console.error("POST SNAPSHOT ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
