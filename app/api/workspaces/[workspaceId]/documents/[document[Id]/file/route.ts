import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const files = await prisma.file.findMany({
      where: {
        workspaceId: params.workspaceId,
        documentId: params.documentId
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("Document files fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
