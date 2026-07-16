import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { matchDocument } from "@/lib/search";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet } from "@/lib/cache";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = params.id;
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { workspaceId: true }
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (doc.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Document does not belong to this workspace" },
        { status: 403 }
      );
    }

    const cacheKey = `doc:${documentId}:matches`;
    const cached = await cacheGet<any[]>(cacheKey);

    if (cached) {
      return NextResponse.json({
        ok: true,
        count: cached.length,
        matches: cached,
        cached: true
      });
    }

    const results = await matchDocument(documentId, workspaceId);

    await cacheSet(cacheKey, results);

    return NextResponse.json({
      ok: true,
      count: results.length,
      matches: results,
      cached: false
    });
  } catch (err) {
    console.error("Document match error:", err);
    return NextResponse.json(
      { error: "Failed to match document" },
      { status: 500 }
    );
  }
}
