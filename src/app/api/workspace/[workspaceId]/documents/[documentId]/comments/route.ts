import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ----------------------
// GET COMMENTS
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
    // const comments = await prisma.documentComment.findMany({
    //   where: { documentId },
    //   orderBy: { createdAt: "asc" }
    // });

    return NextResponse.json({
      success: true,
      method: "GET",
      documentId,
      workspaceId,
      // comments,
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
// POST COMMENT
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
    // const newComment = await prisma.documentComment.create({
    //   data: {
    //     documentId,
    //     userId: body.userId,
    //     text: body.text,
    //     selection: body.selection
    //   }
    // });

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId,
      workspaceId,
      body,
      // newComment,
    });
  } catch (err: any) {
    console.error("POST ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
