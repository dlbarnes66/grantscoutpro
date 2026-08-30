import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ScrapedDoc = {
  id: string;
  url: string;
  title: string;
  textSnippet: string;
  createdAt: string;
};

const scrapedStore: ScrapedDoc[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const url: string = body.url ?? "";
  const title: string = body.title ?? "";
  const textSnippet: string = body.textSnippet ?? "";

  if (!url || !textSnippet) {
    return NextResponse.json(
      { error: "url and textSnippet are required" },
      { status: 400 }
    );
  }

  const doc: ScrapedDoc = {
    id: crypto.randomUUID(),
    url,
    title,
    textSnippet,
    createdAt: new Date().toISOString()
  };

  scrapedStore.push(doc);

  return NextResponse.json({ doc });
}

export async function GET() {
  return NextResponse.json({ docs: scrapedStore });
}
