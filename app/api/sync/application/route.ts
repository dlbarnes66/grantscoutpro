// app/api/sync/application/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { applications } = await req.json();

    if (!applications || !Array.isArray(applications)) {
      return NextResponse.json(
        { success: false, error: "Invalid applications payload" },
        { status: 400 }
      );
    }

    const results: any[] = [];

    for (const app of applications) {
      // ⭐ Since externalId does NOT exist in your model,
      // we must match on fields that DO exist.
      const existing = await prisma.application.findFirst({
        where: {
          userId: app.userId,
          grantId: app.grantId,
        },
      });

      if (existing) {
        const updated = await prisma.application.update({
          where: { id: existing.id },
          data: {
            content: app.content ?? existing.content,
            userId: app.userId ?? existing.userId,
            grantId: app.grantId ?? existing.grantId,
          },
        });

        results.push(updated);
      } else {
        const created = await prisma.application.create({
          data: {
            content: app.content ?? "",
            userId: app.userId,
            grantId: app.grantId,
          },
        });

        results.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      applications: results,
    });
  } catch (error) {
    console.error("SYNC APPLICATION ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync applications" },
      { status: 500 }
    );
  }
}
