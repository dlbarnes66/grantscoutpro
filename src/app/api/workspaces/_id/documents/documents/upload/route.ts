import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { v4 as uuid } from "uuid";

// If you're using a storage provider (S3, R2, etc.),
// plug your upload logic into the placeholder below.

export async function POST(
  req: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    const user = await requireUser(req);
    const workspaceId = params._id;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required." },
        { status: 400 }
      );
    }

    // Ensure user is a member of the workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You do not have access to this workspace." },
        { status: 403 }
      );
    }

    // Expect multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "file is required." },
        { status: 400 }
      );
    }

    const fileId = uuid();
    const fileName = file.name;
    const fileType = file.type || "application/octet-stream";
    const fileSize = file.size;

    // Placeholder: upload file to your storage provider
    // Replace this with your actual upload logic
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Example: store in local /tmp (replace with S3/R2/etc.)
    const storageUrl = `/uploads/${fileId}-${fileName}`;

    // Save metadata in DB
    const document = await prisma.workspaceDocument.create({
      data: {
        id: fileId,
        workspaceId,
        name: fileName,
        type: fileType,
        size: fileSize,
        url: storageUrl,
        uploadedById: user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        url: true,
        createdAt: true,
        updatedAt: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    console.error("Workspace document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document." },
      { status: 500 }
    );
  }
}
