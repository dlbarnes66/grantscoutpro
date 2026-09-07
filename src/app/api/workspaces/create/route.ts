import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import { logActivity } from "@/lib/ai/activity-log";
import { checkRateLimit } from "@/lib/rateLimit";
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
    if (!body || !body.name) {
      return NextResponse.json({ error: "Missing workspace name" }, { status: 400 });
    }

    const slug = slugify(body.name, { lower: true, strict: true });

    const workspace = await prisma.workspace.create({
      data: {
        name: body.name,
        slug,
        ownerId: userId,
      },
    });

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
        plan: "free",
      },
    });

    await logActivity(workspace.id, "workspace_created", { name: workspace.name }, userId).catch(
      (err) => console.error("Failed to log workspace activity \"workspace_created\":", err)
    );

    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    console.error("WORKSPACE CREATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
