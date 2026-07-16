import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchDocument } from "@/lib/search";
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
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true }
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const cacheKey = `doc:${documentId}:search:${query}`;
    const cached = await cacheGet<any[]>(cacheKey);

    if (cached) {
      return NextResponse.json({
        ok: true,
        count: cached.length,
        results: cached,
        cached: true
      });
    }

    const results = await searchDocument(documentId, query);

    await cacheSet(cacheKey, results);

    return NextResponse.json({
      ok: true,
      count: results.length,
      results,
      cached: false
    });
  } catch (err) {
    console.error("Document semantic search error:", err);
    return NextResponse.json(
      { error: "Failed to perform document search" },
      { status: 500 }
    );
  }
}
