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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const url: string = body.url ?? "";

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${res.status}` },
        { status: 500 }
      );
    }

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const doc: CrawledDoc = {
      id: crypto.randomUUID(),
      url,
      title,
      textSnippet: text.slice(0, 8000),
      createdAt: new Date().toISOString()
    };

    crawlStore.push(doc);

    return NextResponse.json({ doc });
  } catch {
    return NextResponse.json(
      { error: "Network error while crawling URL" },
      { status: 500 }
    );
  }
}
