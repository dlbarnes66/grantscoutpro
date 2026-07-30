export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, payload } = await req.json();

  switch (action) {
    case "rebuild-search-index":
      return NextResponse.json({ ok: true });

    case "repair-workspace-relations":
      return NextResponse.json({ ok: true });

    case "flush-ai-cache":
      return NextResponse.json({ ok: true });

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
