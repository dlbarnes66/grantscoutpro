import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id, status: "active" },
      include: { workspace: true },
    });

    const summary = await Promise.all(
      memberships.map(async (m) => {
        const documents = await prisma.document.count({
          where: { workspaceId: m.workspaceId },
        });

        return {
          workspaceId: m.workspaceId,
          workspaceName: m.workspace.name,
          documents,
        };
      })
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard summary." },
      { status: 500 }
    );
  }
}
