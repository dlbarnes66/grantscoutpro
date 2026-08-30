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

  if (!items.length) {
    return NextResponse.json({ error: "items required" }, { status: 400 });
  }

  const justification = items.map((item) => ({
    id: item.id,
    name: item.name,
    amount: item.amount,
    justification: `The allocation for ${item.name} is essential to ensure successful project implementation and aligns with standard federal grant budgeting guidelines.`
  }));

  return NextResponse.json({ justification });
}
