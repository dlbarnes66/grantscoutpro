import { NextResponse } from "next/server";
import { ingestFile } from "@/lib/ai/ingest-file";
import { sendNotification } from "@/lib/notifications/sendNotification";
import { logActivity } from "@/lib/ai/activity-log";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";
import { checkUsage } from "@/lib/billing/check-usage";
import { incrementUsage } from "@/lib/billing/increment-usage";

export async function POST(req: Request, { params }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const usage = await checkUsage(params.workspaceId, "uploads");
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Upload limit reached",
          upgrade: true,
          plan: usage.plan,
          limit: usage.limit,
        },
        { status: 402 }
      );
    }

    const result = await ingestFile(params.workspaceId, file);

    await incrementUsage(params.workspaceId, "uploads");

    await logActivity(params.workspaceId, "file_uploaded", {
      fileId: result.fileId,
      fileName: file.name,
      size: file.size,
    });

    return NextResponse.json({ success: true, fileId: result.fileId });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
