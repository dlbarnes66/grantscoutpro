export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { generateRiskReport } from "@/lib/ai/risk-engine";

export async function POST(req: Request) {
  const { project, grant } = await req.json();

  const report = await generateRiskReport(project, grant);

  return NextResponse.json({ report });
}
