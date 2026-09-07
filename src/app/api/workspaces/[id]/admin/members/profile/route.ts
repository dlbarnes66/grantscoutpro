import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/ai/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

function logActivitySafe(workspaceId: string, action: string, metadata: any, userId?: string) {
  return logActivity(workspaceId, action, metadata, userId).catch((err) => {
    console.error(`Failed to log workspace activity "${action}":`, err);
  });
}

async function loadWorkspaceAndRole(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: true },
  });

  if (!workspace) return { workspace: null, me: null };

  const me =
    workspace.ownerId === userId
      ? { role: "owner" as const }
      : workspace.members.find((m) => m.userId === userId);

  return { workspace, me };
}

// Every field this endpoint is allowed to write on UserProfile. Kept as
// an allowlist so an admin request body can never smuggle in a write to
// an unrelated column via prisma's spread-friendly `update` shape.
const PROFILE_FIELDS = [
  "organizationName",
  "organizationType",
  "mission",
  "website",
  "country",
  "state",
  "city",
  "nonprofitStatus",
  "ein",
  "staffSize",
  "annualBudget",
  "grantExperience",
  "focusAreas",
  "populationsServed",
  "geographicService",
  "pastGrants",
  "pastWins",
  "pastLosses",
  "strategicGoals",
  "priorityAreas",
] as const;

function pickProfileFields(input: any): Record<string, any> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, any> = {};
  for (const key of PROFILE_FIELDS) {
    if (input[key] === undefined) continue;
    out[key] = input[key];
  }
  return out;
}

// PATCH { userId, name?, image?, profile?: {...} } -> an owner or admin
// editing another member's basic account info and organization profile
// (the same fields the member could edit about themselves from their
// own Settings page).
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, me } = await loadWorkspaceAndRole(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    if (!me || (me.role !== "owner" && me.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const targetUserId = typeof body?.userId === "string" ? body.userId : "";
    if (!targetUserId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const isTargetMember =
      targetUserId === workspace.ownerId || workspace.members.some((m) => m.userId === targetUserId);
    if (!isTargetMember) {
      return NextResponse.json({ error: "That user is not a member of this workspace" }, { status: 404 });
    }

    const userUpdate: Record<string, any> = {};
    if (typeof body.name === "string") userUpdate.name = body.name.trim() || null;
    if (typeof body.image === "string") userUpdate.image = body.image.trim() || null;

    const profileUpdate = pickProfileFields(body.profile);

    const [updatedUser, updatedProfile] = await Promise.all([
      Object.keys(userUpdate).length
        ? prisma.user.update({ where: { id: targetUserId }, data: userUpdate })
        : prisma.user.findUnique({ where: { id: targetUserId } }),
      prisma.userProfile.upsert({
        where: { userId: targetUserId },
        update: profileUpdate,
        create: { userId: targetUserId, ...profileUpdate },
      }),
    ]);

    await logActivitySafe(
      params.id,
      "member_profile_updated",
      { targetUserId, fields: [...Object.keys(userUpdate), ...Object.keys(profileUpdate)] },
      userId
    );

    return NextResponse.json({ success: true, user: updatedUser, profile: updatedProfile });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN MEMBER PROFILE PATCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET ?userId=... -> load one member's current profile so the admin's
// edit form can be pre-filled.
export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, me } = await loadWorkspaceAndRole(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    if (!me || (me.role !== "owner" && me.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUserId = req.nextUrl.searchParams.get("userId") || "";
    const isTargetMember =
      targetUserId === workspace.ownerId || workspace.members.some((m) => m.userId === targetUserId);
    if (!targetUserId || !isTargetMember) {
      return NextResponse.json({ error: "That user is not a member of this workspace" }, { status: 404 });
    }

    const [user, profile] = await Promise.all([
      prisma.user.findUnique({ where: { id: targetUserId } }),
      prisma.userProfile.findUnique({ where: { userId: targetUserId } }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, image: user.image },
      profile: profile || null,
    });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN MEMBER PROFILE GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
