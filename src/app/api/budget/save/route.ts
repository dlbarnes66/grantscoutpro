import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type BudgetItem = {
  id: string;
  name: string;
  amount: number;
};

const budgetStore = new Map<string, BudgetItem[]>();

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const budgetId = body.budgetId;
  const items: BudgetItem[] = body.items ?? [];

  if (!budgetId) {
    return NextResponse.json({ error: "budgetId required" }, { status: 400 });
  }

  budgetStore.set(budgetId, items);

  return NextResponse.json({ budgetId, items });
}
