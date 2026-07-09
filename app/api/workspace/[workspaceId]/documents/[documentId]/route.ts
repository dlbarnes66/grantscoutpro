import { NextResponse } from "next/server";
import { getDocumentContent } from "@/lib/ai/documents";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; documentId: string } }
) {
  try {
    const content = await getDocumentContent(params.workspaceId, params.documentId);
    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
