import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeProfilePatch, serializeProfileForClient } from "@/lib/profile/profilePatch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

// This profile is org-level (grant matching runs off the workspace
// owner's UserProfile, see runGrantScan.ts), not per-member - so any
// member can view it, but only the workspace owner or an admin can
// edit it. Resolving through the workspace (rather than trusting the
// caller's own userId) is what lets an admin who isn't the owner edit
// it at all, and stops a non-owner member's own blank UserProfile from
// ever getting created or returned here by mistake.
async function loadWorkspaceAndRole(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: true },
  });

  if (!workspace || workspace.deletedAt) return { workspace: null, me: null };

  const me =
    workspace.ownerId === userId
      ? { role: "owner" as const }
      : workspace.members.find((m) => m.userId === userId) ?? null;

  return { workspace, me };
}

function isOwnerOrAdmin(role: string | undefined | null) {
  return role === "owner" || role === "admin";
}

function serializeProfile(
  profile: Awaited<ReturnType<typeof prisma.userProfile.findUnique>>,
  organizationType: string
) {
  return serializeProfileForClient(profile as Record<string, any> | null, organizationType);
}

export async function GET(_req: NextRequest, { params: paramsPromise }: { params: Promise<Params> }) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspace, me } = await loadWorkspaceAndRole(params.id, userId);

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!me) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId: workspace.ownerId } });
    const organizationType = workspace.organizationTypeOverride || profile?.organizationType || "";

    return NextResponse.json({
      success: true,
      profile: serializeProfile(profile, organizationType),
      canEdit: isOwnerOrAdmin(me.role),
      organizationTypeIsOverride: !!workspace.organizationTypeOverride,
    });
  } catch (err: any) {
    console.error("WORKSPACE PROFILE GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Lets an owner or admin fill in (or fix) anything the onboarding flow
// offered - including fields onboarding itself never got around to
// saving (organization type, EIN/UEI, budget, focus areas, state, goals,
// etc. - see runGrantScan.ts, which needs `state` set to turn on
// state-grant scanning). Every field is optional and only the keys
// present in the body are touched, so partial saves from a form that
// only shows a subset at a time are safe.
// "organizationType" is handled separately in PATCH below - it writes
// to Workspace.organizationTypeOverride, not UserProfile, so a workspace
// can have its own type independent of the owner's other workspaces.
export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<Params> }) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspace, me } = await loadWorkspaceAndRole(params.id, userId);

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!me || !isOwnerOrAdmin(me.role)) {
      return NextResponse.json(
        { error: "Only workspace owners or admins can edit the organization profile." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const patch = sanitizeProfilePatch(body);
    if ("error" in patch) {
      return NextResponse.json({ error: patch.error }, { status: 400 });
    }
    const data = patch.data;

    if ("organizationType" in body) {
      const value = body.organizationType;
      if (value !== null && typeof value !== "string") {
        return NextResponse.json({ error: "organizationType must be a string" }, { status: 400 });
      }
      const trimmed = typeof value === "string" ? value.trim() : "";
      // Empty string means "clear the override, inherit the account
      // default" rather than "set the type to blank".
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { organizationTypeOverride: trimmed.length ? trimmed : null },
      });
    }

    const updated = await prisma.userProfile.upsert({
      where: { userId: workspace.ownerId },
      update: data,
      create: { userId: workspace.ownerId, ...data },
    });

    const freshWorkspace = await prisma.workspace.findUnique({
      where: { id: workspace.id },
      select: { organizationTypeOverride: true },
    });
    const organizationType = freshWorkspace?.organizationTypeOverride || updated.organizationType || "";

    return NextResponse.json({ success: true, profile: serializeProfile(updated, organizationType) });
  } catch (err: any) {
    console.error("WORKSPACE PROFILE PATCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
