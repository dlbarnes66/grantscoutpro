import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/ai/semantic-search";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { query } = await req.json();

    const results = await semanticSearch({
      workspaceId: params.workspaceId,
      query,
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Semantic search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
