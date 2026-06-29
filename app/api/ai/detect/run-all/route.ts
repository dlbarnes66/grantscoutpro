import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function call(path: string, body: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return await res.json();
}

export async function POST(req: Request) {
  try {
    const { sources } = await req.json();

    if (!sources || !Array.isArray(sources)) {
      return NextResponse.json({ error: "Missing sources array" }, { status: 400 });
    }

    const results = [];

    for (const src of sources) {
      if (src.type === "text") {
        results.push(await call("/api/ai/detect/text", { text: src.text }));
      }

      if (src.type === "url") {
        results.push(await call("/api/ai/detect/url", { url: src.url }));
      }

      if (src.type === "html") {
        results.push(
          await call("/api/ai/detect/html", {
            url: src.url,
            selector: src.selector,
          })
        );
      }
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Bulk detect error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
