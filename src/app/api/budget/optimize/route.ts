import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type BudgetItem = {
  id: string;
  name: string;
  amount: number;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const items: BudgetItem[] = body.items ?? [];

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items array required" }, { status: 400 });
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  // Optimization logic: reduce each line by 5%
  const optimized = items.map((item) => ({
    ...item,
    amount: Math.round(item.amount * 0.95)
  }));

  return NextResponse.json({ items: optimized });
}
