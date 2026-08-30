import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ecosystem = "", org = {} } = await req.json().catch(() => ({}));

  const prompt = `
Map the opportunity ecosystem.

Ecosystem:
${ecosystem}

Organization:
${JSON.stringify(org, null, 2)}

Return JSON with:
- ecosystemMap
- keyPlayers
- gaps
- strategicEntryPoints
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, map: result });
}
