export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { matchGrants } from "@/lib/ai/match-engine";

export async function POST(req: Request) {
  const { project, grants } = await req.json();

  const results = await matchGrants(project, grants);

  return NextResponse.json({ results });
}
