export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




async function call(path: string, body: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return await res.json();
}

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();

    if (!goal) {
      return NextResponse.json({ error: "Missing goal" }, { status: 400 });
    }

    // Step 1: Plan
    const plan = await call("/api/ai/agent/plan", { goal });

    let context: any = {};
    const results: any[] = [];

    // Step 2: Execute each step
    for (const step of plan.steps) {
      const exec = await call("/api/ai/agent/execute", {
        step,
        context,
      });

      results.push({
        step,
        result: exec.result,
      });

      context = exec.nextContext ?? context;
    }

    return NextResponse.json({
      goal,
      steps: plan.steps,
      results,
      finalContext: context,
    });
  } catch (err: any) {
    console.error("Agent run error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
