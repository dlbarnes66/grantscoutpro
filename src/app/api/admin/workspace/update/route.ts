import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Superadmin edit for a workspace. Sibling to suspend/route.ts and
// delete/route.ts (same auth pattern) - before this route existed, the
// admin workspaces page could only list and JSON.stringify workspaces,
// with no way to actually change anything about one (rename it, adjust
// its plan/seats, or lift a suspension) short of a direct database edit.
// Only accepts a specific allowlist of fields - never the whole body -
// so this can't be used to silently change billing-sensitive fields
// (stripeCustomerId, orgId, etc.) that need their own dedicated flows.
const EDITABLE_FIELDS = ["name", "subscriptionTier", "maxSeats", "billingStatus", "suspended"] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { workspaceId } = body;
  if (!workspaceId || typeof workspaceId !== "string") {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    data.name = name;
  }
  if (typeof body.subscriptionTier === "string" && body.subscriptionTier.trim()) {
    data.subscriptionTier = body.subscriptionTier.trim();
  }
  if (body.maxSeats !== undefined) {
    const maxSeats = Number(body.maxSeats);
    if (!Number.isInteger(maxSeats) || maxSeats < 1) {
      return NextResponse.json({ error: "maxSeats must be a positive whole number" }, { status: 400 });
    }
    data.maxSeats = maxSeats;
  }
  if (typeof body.billingStatus === "string" && body.billingStatus.trim()) {
    data.billingStatus = body.billingStatus.trim();
  }
  if (typeof body.suspended === "boolean") {
    data.suspended = body.suspended;
    data.suspendedAt = body.suspended ? new Date() : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  const existing = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data,
  });

  return NextResponse.json({ success: true, workspace: updated });
}
