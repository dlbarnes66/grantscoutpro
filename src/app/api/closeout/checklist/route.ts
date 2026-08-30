import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

const checklistStore = new Map<string, ChecklistItem[]>();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const closeoutId = url.searchParams.get("closeoutId");

  if (!closeoutId)
    return NextResponse.json({ error: "closeoutId required" }, { status: 400 });

  const items =
    checklistStore.get(closeoutId) ??
    [
      { id: "final-report", label: "Final Report Completed", done: false },
      { id: "financials", label: "Financial Reconciliation Completed", done: false },
      { id: "assets", label: "Asset Reporting Completed", done: false },
      { id: "compliance", label: "Compliance Checks Passed", done: false }
    ];

  return NextResponse.json({ closeoutId, items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const closeoutId = body.closeoutId;
  const items: ChecklistItem[] = body.items ?? [];

  if (!closeoutId)
    return NextResponse.json({ error: "closeoutId required" }, { status: 400 });

  checklistStore.set(closeoutId, items);

  return NextResponse.json({ closeoutId, items });
}
