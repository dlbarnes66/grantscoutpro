import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const documents = await prisma.file.findMany({
      where: { workspaceId: params.workspaceId },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Document list error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
