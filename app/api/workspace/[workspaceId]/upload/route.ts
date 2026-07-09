import { NextResponse } from "next/server";
import { ingestFile } from "@/lib/ai/ingest-file";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const result = await ingestFile(params.workspaceId, file);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
