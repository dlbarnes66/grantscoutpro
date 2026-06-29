import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { method, url, body } = await req.json();

    if (!method || !url) {
      return NextResponse.json(
        { error: "Missing method or url" },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      data,
    });
  } catch (err: any) {
    console.error("Playground error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
