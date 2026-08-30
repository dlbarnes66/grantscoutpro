import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type IndexedDoc = {
  id: string;
  url: string;
  title: string;
  textSnippet: string;
  createdAt: string;
};

const indexStore: IndexedDoc[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query: string = body.query ?? "";

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const q = query.toLowerCase();

  const results = indexStore.filter(
    (doc) =>
      doc.title.toLowerCase().includes(q) ||
      doc.textSnippet.toLowerCase().includes(q)
  );

  return NextResponse.json({ query, results });
}
