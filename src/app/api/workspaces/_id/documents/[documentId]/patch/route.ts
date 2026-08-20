import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function GET(
  _req: Request,
  { params }: { params: Params }
) {
  const { id, documentId } = params;

  return NextResponse.json({
    success: true,
    routes: {
      list: `/api/workspaces/${id}/documents/${documentId}/patch/list`,
      create: `/api/workspaces/${id}/documents/${documentId}/patch/create`,
      apply: `/api/workspaces/${id}/documents/${documentId}/patch/apply`,
    },
  });
}
