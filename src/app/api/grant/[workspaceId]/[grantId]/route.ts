import { NextResponse } from "next/server";
import { loadGrant } from "@/app/dashboard/lib/loadGrant";

export async function GET(
  req: Request,
  context: { params: Promise<{ workspaceId: string; grantId: string }> }
) {
  const { workspaceId, grantId } = await context.params;

  const grant = await loadGrant(workspaceId, grantId);

  return NextResponse.json(grant);
}
