import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasNonprofitAccess } from "@/lib/nonprofit/entitlement";
import { SAFE_ID, nonprofitOsAuthorized } from "@/lib/nonprofit/internalAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Server-to-server only, read-only: lets the Nonprofit Management app import
// a workspace's grant opportunities into its grant pipeline. Answers only for
// workspaces with an active "nonprofit" addon. Same shared secret as
// ../entitlement.
//
//   GET ?workspaceId=<id>[&q=<title search>]   -> up to 50 grants, saved ones first
//   GET ?workspaceId=<id>&grantId=<id>         -> that one grant (must belong to the workspace)

type Row = {
  id: string;
  title: string;
  agency: string | null;
  foundationName: string | null;
  source: string;
  amount: number | null;
  amountMax: number | null;
  awardCeiling: number | null;
  deadline: Date | null;
  url: string | null;
  summary: string | null;
  _count: { SavedGrant: number };
};

function shape(g: Row) {
  return {
    id: g.id,
    title: g.title,
    funder: g.foundationName || g.agency || null,
    source: g.source,
    amount: g.amount ?? g.awardCeiling ?? g.amountMax ?? null,
    deadline: g.deadline ? g.deadline.toISOString().slice(0, 10) : null,
    url: g.url,
    summary: g.summary ? g.summary.slice(0, 1000) : null,
    saved: g._count.SavedGrant > 0,
  };
}

const select = {
  id: true,
  title: true,
  agency: true,
  foundationName: true,
  source: true,
  amount: true,
  amountMax: true,
  awardCeiling: true,
  deadline: true,
  url: true,
  summary: true,
  _count: { select: { SavedGrant: true } },
} as const;

export async function GET(req: NextRequest) {
  const ok = nonprofitOsAuthorized(req);
  if (ok === null) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId") ?? "";
  const grantId = req.nextUrl.searchParams.get("grantId");
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (!SAFE_ID.test(workspaceId) || (grantId !== null && !SAFE_ID.test(grantId))) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }

  try {
    if (!(await hasNonprofitAccess(workspaceId))) {
      return NextResponse.json({ error: "This workspace doesn't have the Nonprofit Management add-on" }, { status: 403 });
    }

    if (grantId) {
      const g = await prisma.grant.findFirst({ where: { id: grantId, workspaceId }, select });
      return NextResponse.json({ grant: g ? shape(g as Row) : null });
    }

    const rows = await prisma.grant.findMany({
      where: { workspaceId, ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}) },
      select,
      orderBy: [{ SavedGrant: { _count: "desc" } }, { deadline: { sort: "asc", nulls: "last" } }],
      take: 50,
    });
    return NextResponse.json({ grants: rows.map((g) => shape(g as Row)) });
  } catch (err: any) {
    console.error("NONPROFIT-OS GRANTS ERROR:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
