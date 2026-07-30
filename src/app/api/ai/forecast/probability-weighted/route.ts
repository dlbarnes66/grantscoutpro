export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




async function call(path: string, body: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return await res.json();
}

export async function POST(req: Request) {
  try {
    const { grants, profile } = await req.json();

    const probabilities = await call("/api/ai/portfolio/probability", { grants, profile });

    const expectedFunding = probabilities.reduce((sum: number, p: any) => {
      const grant = grants.find((g: any) => g.id === p.grantId);
      return sum + (grant?.amount ?? 0) * p.probability;
    }, 0);

    return NextResponse.json({
      expectedFunding,
      probabilities
    });
  } catch (err: any) {
    console.error("Probability-weighted forecast error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
