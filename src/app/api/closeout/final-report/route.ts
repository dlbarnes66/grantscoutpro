import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const finalReportStore = new Map<string, string>();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const closeoutId = url.searchParams.get("closeoutId");

  if (!closeoutId)
    return NextResponse.json({ error: "closeoutId required" }, { status: 400 });

  const report = finalReportStore.get(closeoutId) ?? "";

  return NextResponse.json({ closeoutId, report });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const closeoutId = body.closeoutId;
  const report = body.report ?? "";

  if (!closeoutId)
    return NextResponse.json({ error: "closeoutId required" }, { status: 400 });

  finalReportStore.set(closeoutId, report);

  return NextResponse.json({ closeoutId, report });
}
