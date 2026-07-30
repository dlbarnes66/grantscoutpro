export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { isSuperAdmin } from "@/lib/security/super-admin";
import { auditEvent } from "@/lib/audit/log";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId || !isSuperAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const payload = await req.json();
  const { action } = payload;

  if (!action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  // Perform emergency action here...
  // (Your existing logic stays untouched)

  await auditEvent({
    actorId: userId,
    orgId: payload.workspaceId ?? "superadmin",
    action: `superadmin.emergency.${action}`,
    entity: "workspace",
    metadata: {
      entityId:
        payload.workspaceId ??
        payload.documentId ??
        payload.grantId ??
        null,
      ...payload
    }
  });

  return NextResponse.json({ success: true });
}
