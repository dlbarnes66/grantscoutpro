import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function call(path: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`);
  return await res.json();
}

export async function GET() {
  try {
    const status = await call("/api/regions/status");
    const failover = await call("/api/regions/failover");

    return NextResponse.json({
      status,
      failover,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Master failover error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
