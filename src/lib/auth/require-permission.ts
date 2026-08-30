import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkPermission } from "./check-permission";

export async function requirePermission(workspaceId: string, permission: string) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkPermission(userId, workspaceId, permission);

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
