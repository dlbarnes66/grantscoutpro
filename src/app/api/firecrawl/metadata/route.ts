import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CrawledDoc = {
  id: string;
  url: string;
  title: string;
  textSnippet: string;
  createdAt: string;
};

const crawlStore: CrawledDoc[] = [];

export async function GET(req: NextRequest) {
  const urlObj = new URL(req.url);
  const id = urlObj.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const doc = crawlStore.find((d) => d.id === id);

  if (!doc) {
    return NextResponse.json({ error: "document not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: doc.id,
    url: doc.url,
    title: doc.title,
    createdAt: doc.createdAt,
    length: doc.textSnippet.length
  });
}
