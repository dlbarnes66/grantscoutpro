import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_WORKSPACE_ID = "admin-workspace";

export async function POST(req: Request) {
  try {
    const { grants } = await req.json();

    if (!Array.isArray(grants)) {
      return NextResponse.json(
        { error: "Invalid payload: 'grants' must be an array" },
        { status: 400 }
      );
    }

    let created = 0;

    for (const grant of grants) {
      if (!grant.title) continue;

      await prisma.grant.create({
        data: {
          title: grant.title,
          deadline: grant.deadline ? new Date(grant.deadline) : null,

          // REQUIRED RELATION — your schema demands this
          workspace: {
            connect: { id: DEFAULT_WORKSPACE_ID },
          },
        },
      });

      created++;
    }

    return NextResponse.json({ created });
  } catch (err: any) {
    console.error("Grant scrape error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
