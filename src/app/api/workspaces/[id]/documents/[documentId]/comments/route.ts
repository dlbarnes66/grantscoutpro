import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function GET(
  _req: Request,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { id, documentId } = params;

  return NextResponse.json({
    success: true,
    routes: {
      list: `/api/workspaces/${id}/documents/${documentId}/comments/list`,
      create: `/api/workspaces/${id}/documents/${documentId}/comments/create`,
      update: `/api/workspaces/${id}/documents/${documentId}/comments/update`,
      delete: `/api/workspaces/${id}/documents/${documentId}/comments/delete`,
    },
  });
}
