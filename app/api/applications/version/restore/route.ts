import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { versionId, applicationId } = await req.json();

    if (!versionId || !applicationId) {
      return NextResponse.json(
        { error: "versionId and applicationId are required" },
        { status: 400 }
      );
    }

    const version = await prisma.applicationVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { content: version.content },
    });

    return NextResponse.json(
      { message: "Application restored successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error restoring application:", error);
    return NextResponse.json(
      { error: "Failed to restore application" },
      { status: 500 }
    );
  }
}
