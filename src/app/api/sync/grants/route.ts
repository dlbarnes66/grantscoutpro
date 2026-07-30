export const dynamic = "force-dynamic";

// app/api/sync/grants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const { grants } = await req.json();

    if (!grants || !Array.isArray(grants)) {
      return NextResponse.json(
        { success: false, error: "Invalid grants payload" },
        { status: 400 }
      );
    }

    const results: any[] = [];

    for (const g of grants) {
      let existing = null;

      // ⭐ Only match by ID if provided
      if (g.id) {
        existing = await prisma.grant.findUnique({
          where: { id: g.id },
        });
      }

      if (existing) {
        const updated = await prisma.grant.update({
          where: { id: existing.id },
          data: {
            title: g.title ?? existing.title,
            summary: g.summary ?? existing.summary,
            amount: g.amount ?? existing.amount,
            deadline: g.deadline ?? existing.deadline,
            workspaceId: g.workspaceId ?? existing.workspaceId,
          },
        });

        results.push(updated);
      } else {
        // ⭐ workspaceId is REQUIRED in your real Prisma model
        if (!g.workspaceId) {
          throw new Error("workspaceId is required to create a grant");
        }

        const created = await prisma.grant.create({
          data: {
            title: g.title,
            summary: g.summary ?? null,
            amount: g.amount ?? null,
            deadline: g.deadline ?? null,
            workspaceId: g.workspaceId, // ⭐ REQUIRED
          },
        });

        results.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      grants: results,
    });
  } catch (error) {
    console.error("SYNC GRANTS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync grants" },
      { status: 500 }
    );
  }
}
