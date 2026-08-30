import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type BudgetItem = {
  id: string;
  name: string;
  amount: number;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const total = Number(body.total ?? 50000);

  // Realistic allocation logic
  const generated: BudgetItem[] = [
    {
      id: crypto.randomUUID(),
      name: "Personnel",
      amount: Math.round(total * 0.55)
    },
    {
      id: crypto.randomUUID(),
      name: "Supplies & Materials",
      amount: Math.round(total * 0.15)
    },
    {
      id: crypto.randomUUID(),
      name: "Travel",
      amount: Math.round(total * 0.10)
    },
    {
      id: crypto.randomUUID(),
      name: "Contractual / Consultants",
      amount: Math.round(total * 0.10)
    },
    {
      id: crypto.randomUUID(),
      name: "Other Direct Costs",
      amount: Math.round(total * 0.10)
    }
  ];

  return NextResponse.json({ items: generated });
}
