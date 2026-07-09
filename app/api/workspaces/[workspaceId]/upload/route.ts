import { NextResponse } from "next/server";
import { ingestFile } from "@/lib/ai/ingest-file";
import { sendNotification } from "@/lib/notifications/sendNotification";
import { logActivity } from "@/lib/ai/activity-log";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // ⭐ Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // ⭐ Ingest file into your AI pipeline
    const result = await ingestFile(params.workspaceId, file);

    // ⭐ Log activity
    await logActivity(params.workspaceId, "file_uploaded", {
      fileId: result.fileId,
      fileName: file.name,
      size: file.size,
    });

    // ⭐ Send notification
    await sendNotification(
      params.workspaceId,
      "file_uploaded",
      `Uploaded file: ${file.name}`,
      {
        fileId: result.fileId,
        fileName: file.name,
        size: file.size,
      }
    );

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
