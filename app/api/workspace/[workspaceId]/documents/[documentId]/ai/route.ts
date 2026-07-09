import { NextResponse } from "next/server";
import { runDocumentTool } from "@/lib/ai/document-tools";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string; documentId: string } }
) {
  try {
    const { tool } = await req.json();

    const result = await runDocumentTool({
      workspaceId: params.workspaceId,
      documentId: params.documentId,
      tool,
    });

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Document AI error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
