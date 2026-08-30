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

  const doc: IndexedDoc = body.doc;

  if (!doc || !doc.id) {
    return NextResponse.json({ error: "doc with id is required" }, { status: 400 });
  }

  indexStore.push(doc);

  return NextResponse.json({ indexed: doc.id });
}

export async function GET() {
  return NextResponse.json({ index: indexStore });
}
