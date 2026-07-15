import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/search";

export async function POST(req: Request) {
  try {
    const { workspaceId, query } = await req.json();

    if (!workspaceId || !query) {
      return NextResponse.json(
        { error: "workspaceId and query are required" },
        { status: 400 }
      );
    }

    const results = await semanticSearch(workspaceId, query);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
