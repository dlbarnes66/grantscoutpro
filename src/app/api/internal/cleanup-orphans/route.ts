import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST() {
  try {
    const admin = await requireUser();

    // Ensure platform admin
    const isAdmin = await prisma.user.findFirst({
      where: { id: admin.id, role: "platform_admin" },
      select: { id: true }
    });

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      // Orphaned document shares
      await tx.documentShare.deleteMany({
        where: { document: null }
      });

      // Orphaned document presence
      await tx.documentPresence.deleteMany({
        where: { document: null }
      });

      // Orphaned document messages
      await tx.documentMessage.deleteMany({
        where: { document: null }
      });

      // Orphaned embeddings
      await tx.documentEmbedding.deleteMany({
        where: { document: null }
      });

      // Orphaned workspace activities
      await tx.workspaceDocumentActivity.deleteMany({
        where: { document: null }
      });
    });

    await prisma.internalActivity.create({
      data: {
        adminId: admin.id,
        type: "cleanup_orphans",
        description: "Orphaned records cleaned"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cleanup Orphans Error:", error);
    return NextResponse.json({ error: "Failed to clean orphaned records." }, { status: 500 });
  }
}
