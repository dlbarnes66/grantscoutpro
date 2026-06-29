import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { applications } = await req.json();

    if (!applications || !Array.isArray(applications)) {
      return NextResponse.json({ error: "Missing applications array" }, { status: 400 });
    }

    let created = 0;
    let updated = 0;

    for (const app of applications) {
      const existing = await prisma.application.findUnique({
        where: { externalId: app.externalId },
      });

      if (existing) {
        await prisma.application.update({
          where: { id: existing.id },
          data: {
            userId: app.userId,
            grantId: app.grantId,
            status: app.status,
            content: app.content,
          },
        });
        updated++;
      } else {
        await prisma.application.create({
          data: {
            externalId: app.externalId,
            userId: app.userId,
            grantId: app.grantId,
            status: app.status,
            content: app.content,
          },
        });
        created++;
      }
    }

    return NextResponse.json({ created, updated });
  } catch (err: any) {
    console.error("Application sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
