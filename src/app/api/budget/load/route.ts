import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type BudgetItem = {
  id: string;
  name: string;
  amount: number;
};

const budgetStore = new Map<string, BudgetItem[]>();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const budgetId = url.searchParams.get("budgetId");

  if (!budgetId) {
    return NextResponse.json({ error: "budgetId required" }, { status: 400 });
  }

  const items = budgetStore.get(budgetId) ?? [];

  return NextResponse.json({ budgetId, items });
}
