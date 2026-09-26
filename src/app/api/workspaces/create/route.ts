import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import { logActivity } from "@/lib/ai/activity-log";
import { checkRateLimit } from "@/lib/rateLimit";
import { ensureUserOrg, countWorkspacesForOwner } from "@/lib/workspace/orgAccess";
import { getPlan, getWorkspaceLimitLabel, isAtWorkspaceLimit } from "@/lib/plans";
import { ORG_TYPES } from "@/lib/grants/orgType";
import slugify from "slugify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Clerk handles the actual account signup abuse protection (bot
// detection, email verification). This is the app-side surface right
// after that: an authenticated user spinning up workspaces, each of
// which gets a free WorkspaceBilling row and its own manual-search/AI
// allowances. Capped per-user so that isn't a free way to multiply
// those allowances.
const WORKSPACE_CREATES_PER_HOUR = 5;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rl = await checkRateLimit(`workspace-create:${userId}`, WORKSPACE_CREATES_PER_HOUR, 60 * 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `You can create at most ${WORKSPACE_CREATES_PER_HOUR} workspaces per hour. Please try again shortly.` },
        { status: 429 }
      );
    }

    // Make sure our User table actually has a row for this Clerk user before
    // anything below tries to point a foreign key at it.
    await ensureUser();

    const body = await req.json().catch(() => null);
    const trimmedName = typeof body?.name === "string" ? body.name.trim() : "";
    if (!trimmedName) {
      return NextResponse.json({ error: "Missing workspace name" }, { status: 400 });
    }
    if (!body.organizationType || !ORG_TYPES.includes(body.organizationType)) {
      return NextResponse.json({ error: "Choose an organization type for this workspace" }, { status: 400 });
    }

    // Plans attach to the account (Org), not to any one workspace - Basic
    // gets 1 workspace, Team 3, Business 6, Enterprise 100. Find or create
    // that Org, then enforce its workspace limit before creating another.
    const org = await ensureUserOrg(userId);
    const plan = getPlan(org.tier);
    const existingCount = await countWorkspacesForOwner(userId);

    if (isAtWorkspaceLimit(plan, existingCount)) {
      return NextResponse.json(
        {
          error: `Your ${plan.name} plan includes ${getWorkspaceLimitLabel(plan).toLowerCase()}. Upgrade your plan to create another.`,
        },
        { status: 403 }
      );
    }

    // slug has no user-facing meaning today (not used in any route or
    // shared link - see src/lib/grants/orgType.ts's sibling helpers for
    // what actually is user-facing), it just has to be unique. Two
    // workspaces with the same or similar name (easy to do once someone
    // has both a nonprofit and a for-profit workspace) previously threw
    // a raw Prisma unique-constraint error straight to the UI - retry
    // with a short random suffix instead of failing the whole request.
    const baseSlug = slugify(trimmedName, { lower: true, strict: true }) || `workspace-${Date.now()}`;

    let workspace: Awaited<ReturnType<typeof prisma.workspace.create>> | null = null;
    let slugAttempt = baseSlug;
    for (let attempt = 0; attempt < 5 && !workspace; attempt++) {
      try {
        workspace = await prisma.workspace.create({
          data: {
            name: trimmedName,
            slug: slugAttempt,
            ownerId: userId,
            orgId: org.id,
            // Set from the start rather than left null (which would mean
            // "inherit the owner's account default" - see
            // resolveOrganizationType in @/lib/grants/orgType). This is
            // what lets one owner run a for-profit workspace alongside
            // nonprofit ones without them sharing eligibility/search
            // behavior.
            organizationTypeOverride: body.organizationType,
          },
        });
      } catch (err: any) {
        const isSlugCollision =
          err?.code === "P2002" &&
          Array.isArray(err?.meta?.target) &&
          err.meta.target.includes("slug");
        if (!isSlugCollision || attempt === 4) throw err;
        slugAttempt = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      }
    }
    if (!workspace) {
      return NextResponse.json({ error: "Couldn't create workspace - please try a different name." }, { status: 500 });
    }

    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: "owner",
      },
    });
    await prisma.workspaceBilling.create({
      data: {
        workspaceId: workspace.id,
        plan: org.tier ?? "basic",
      },
    });

    await logActivity(workspace.id, "workspace_created", { name: workspace.name }, userId).catch(
      (err) => console.error("Failed to log workspace activity \"workspace_created\":", err)
    );

    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    console.error("WORKSPACE CREATE ERROR:", err);
    // Same temporary diagnostic as the negotiation routes: include the
    // error name and a few stack frames so a failure here is
    // diagnosable from the UI alone.
    const where =
      err instanceof Error && err.stack
        ? " [" + err.name + ": " + err.stack.split("\n").slice(1, 4).map((l: string) => l.trim()).join(" | ") + "]"
        : "";
    return NextResponse.json({ error: (err?.message || "Something went wrong.") + where }, { status: 500 });
  }
}
