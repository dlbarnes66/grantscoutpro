import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const url = body.url as string | undefined;

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
    return NextResponse.json({ url, html });
  } catch {
    return NextResponse.json(
      { error: "Network error while fetching URL" },
      { status: 500 }
    );
  }
}
