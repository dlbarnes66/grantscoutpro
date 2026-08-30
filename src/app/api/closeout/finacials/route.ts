import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type FinancialEntry = {
  category: string;
  budgeted: number;
  actual: number;
};

const financialStore = new Map<string, FinancialEntry[]>();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const closeoutId = url.searchParams.get("closeoutId");

  if (!closeoutId)
    return NextResponse.json({ error: "closeoutId required" }, { status: 400 });

  const entries = financialStore.get(closeoutId) ?? [];

  return NextResponse.json({ closeoutId, entries });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const closeoutId = body.closeoutId;
  const entries: FinancialEntry[] = body.entries ?? [];

  if (!closeoutId)
    return NextResponse.json({ error: "closeoutId required" }, { status: 400 });

  financialStore.set(closeoutId, entries);

  return NextResponse.json({ closeoutId, entries });
}
