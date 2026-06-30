import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const semantic = await call("/api/ai/matching/semantic", { grants, profile });
    const eligibility = await call("/api/ai/eligibility/bulk", { grants, profile });

    const combined = semantic.matches.map((m: any) => {
      const e = eligibility.find((x: any) => x.grantId === m.grantId);

      return {
        grantId: m.grantId,
        semantic: m.similarity,
        eligibilityScore: e?.eligibilityScore ?? 0,
        combinedScore: m.similarity * 0.6 + (e?.eligibilityScore ?? 0) * 0.4
      };
    });

    return NextResponse.json({ ranked: combined });
  } catch (err: any) {
    console.error("Eligibility-weighted ranking error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
