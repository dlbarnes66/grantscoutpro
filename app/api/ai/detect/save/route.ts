import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { grants, workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(grants)) {
      return NextResponse.json(
        { error: "grants[] is required" },
        { status: 400 }
      );
    }

    const saved = [];

    for (const g of grants) {
      const entry = await prisma.grant.create({
        data: {
          title: g.title ?? "",
          agency: g.agency ?? "",
          deadline: g.deadline ?? null,
          amount: g.amount ?? null,
          workspaceId,
        },
      });

      saved.push(entry);
    }

    return NextResponse.json({ saved });
  } catch (err: any) {
    console.error("AI detect save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
