import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
  const { applicationId } = params;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  return NextResponse.json(app);
}

export async function PUT(req: Request, { params }: any) {
  const { applicationId } = params;
  const { content } = await req.json();

  // Update main application
  const app = await prisma.application.update({
    where: { id: applicationId },
    data: { content },
  });

  // Create version
  await prisma.applicationVersion.create({
    data: {
      applicationId,
      content,
    },
  });

  return NextResponse.json(app);
}

export async function DELETE(req: Request, { params }: any) {
  const { applicationId } = params;

  await prisma.application.delete({
    where: { id: applicationId },
  });

  return NextResponse.json({ success: true });
}
