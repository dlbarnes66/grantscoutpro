import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const embeddings = await prisma.embedding.findMany({
      where: {
        workspaceId: params.workspaceId,
        documentId: params.documentId
      }
    });

    const docEmbedding = await prisma.documentEmbedding.findUnique({
      where: { documentId: params.documentId }
    });

    return NextResponse.json({
      embeddings,
      documentEmbedding: docEmbedding
    });
  } catch (error: any) {
    console.error("Document embeddings fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
