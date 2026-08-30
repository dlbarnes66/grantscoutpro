import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type BudgetItem = {
  id: string;
  name: string;
  amount: number;
};

const inMemoryBudgets = new Map<string, BudgetItem[]>();

export async function GET(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);
  const budgetId = url.searchParams.get("budgetId") ?? "";

  if (!budgetId) {
    return NextResponse.json(
      { error: "budgetId is required" },
      { status: 400 }
    );
  }

  const items = inMemoryBudgets.get(budgetId) ?? [];
  return NextResponse.json({ budgetId, items });
}

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const budgetId: string = body.budgetId ?? "";
  const items: BudgetItem[] = body.items ?? [];

  if (!budgetId) {
    return NextResponse.json(
      { error: "budgetId is required" },
      { status: 400 }
    );
  }

  inMemoryBudgets.set(budgetId, items);
  return NextResponse.json({ budgetId, items });
}
