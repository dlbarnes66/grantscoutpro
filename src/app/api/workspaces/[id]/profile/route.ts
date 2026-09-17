import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

function serializeProfile(profile: Awaited<ReturnType<typeof prisma.userProfile.findUnique>>) {
  return {
    organizationName: profile?.organizationName ?? "",
    organizationType: profile?.organizationType ?? "",
    mission: profile?.mission ?? "",
    website: profile?.website ?? "",

    linkedin: profile?.linkedin ?? "",
    facebook: profile?.facebook ?? "",
    instagram: profile?.instagram ?? "",

    country: profile?.country ?? "",
    state: profile?.state ?? "",
    city: profile?.city ?? "",

    nonprofitStatus: profile?.nonprofitStatus ?? "",
    ein: profile?.ein ?? "",
    uei: profile?.uei ?? "",

    staffSize: profile?.staffSize ?? null,
    annualBudget: profile?.annualBudget ?? null,
    budgetRange: profile?.budgetRange ?? "",
    grantExperience: profile?.grantExperience ?? "",

    focusAreas: profile?.focusAreas ?? [],
    populationsServed: profile?.populationsServed ?? [],
    geographicService: profile?.geographicService ?? [],
    serviceScope: profile?.serviceScope ?? "",

    pastGrants: profile?.pastGrants ?? "",
    pastWins: profile?.pastWins ?? null,
    pastLosses: profile?.pastLosses ?? null,

    strategicGoals: profile?.strategicGoals ?? "",
    priorityAreas: profile?.priorityAreas ?? "",
  };
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

    return NextResponse.json({
      success: true,
      profile: serializeProfile(profile),
      canEdit: isOwnerOrAdmin(me.role),
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
const STRING_FIELDS = [
  "organizationName",
  "organizationType",
  "mission",
  "website",
  "linkedin",
  "facebook",
  "instagram",
  "country",
  "state",
  "city",
  "nonprofitStatus",
  "ein",
  "uei",
  "budgetRange",
  "serviceScope",
  "grantExperience",
  "pastGrants",
  "strategicGoals",
  "priorityAreas",
] as const;

const INT_FIELDS = ["staffSize", "annualBudget", "pastWins", "pastLosses"] as const;

const STRING_ARRAY_FIELDS = ["focusAreas", "populationsServed", "geographicService"] as const;

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

    const data: Record<string, any> = {};

    for (const field of STRING_FIELDS) {
      if (field in body) {
        const value = body[field];
        if (value === null) {
          data[field] = null;
        } else if (typeof value === "string") {
          const trimmed = value.trim();
          data[field] = trimmed.length ? trimmed : null;
        } else {
          return NextResponse.json({ error: `${field} must be a string` }, { status: 400 });
        }
      }
    }

    for (const field of INT_FIELDS) {
      if (field in body) {
        const value = body[field];
        if (value === null || value === "") {
          data[field] = null;
        } else {
          const n = Number(value);
          if (!Number.isFinite(n)) {
            return NextResponse.json({ error: `${field} must be a number` }, { status: 400 });
          }
          data[field] = Math.trunc(n);
        }
      }
    }

    for (const field of STRING_ARRAY_FIELDS) {
      if (field in body) {
        const value = body[field];
        if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
          return NextResponse.json({ error: `${field} must be an array of strings` }, { status: 400 });
        }
        data[field] = value.map((v) => v.trim()).filter(Boolean);
      }
    }

    const updated = await prisma.userProfile.upsert({
      where: { userId: workspace.ownerId },
      update: data,
      create: { userId: workspace.ownerId, ...data },
    });

    return NextResponse.json({ success: true, profile: serializeProfile(updated) });
  } catch (err: any) {
    console.error("WORKSPACE PROFILE PATCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
