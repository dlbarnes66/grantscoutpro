import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getActiveRegion() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/regions/failover`
  );
  const json = await res.json();
  return json.activeRegion;
}

export async function POST(req: Request) {
  try {
    const { path, payload } = await req.json();

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const region = await getActiveRegion();

    if (!region || region === "none") {
      return NextResponse.json(
        { error: "No healthy region available" },
        { status: 503 }
      );
    }

    const url = `https://${region}.yourdomain.com${path}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    return NextResponse.json({
      region,
      result: json,
    });
  } catch (err: any) {
    console.error("Region-aware fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
