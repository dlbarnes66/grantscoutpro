import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { applicationId, content } = await req.json();

    if (!applicationId || !content) {
      return NextResponse.json(
        { error: "applicationId and content are required" },
        { status: 400 }
      );
    }

    // Get the latest version number
    const lastVersion = await prisma.applicationVersion.findFirst({
      where: { applicationId },
      orderBy: { versionNumber: "desc" },
    });

    const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    const version = await prisma.applicationVersion.create({
      data: {
        versionNumber: nextVersionNumber,
        content,
        application: {
          connect: { id: applicationId },
        },
      },
    });

    return NextResponse.json({ version }, { status: 200 });
  } catch (error) {
    console.error("Error saving application version:", error);
    return NextResponse.json(
      { error: "Failed to save version" },
      { status: 500 }
    );
  }
}
