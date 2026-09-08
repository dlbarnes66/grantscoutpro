import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

// Same fix as recommendations/route.ts: no [workspaceId] segment in this
// file's path, so workspaceId has to come from the query string, not
// `params` (which was always empty, silently disabling the workspace scope
// on the query below).
export async function GET(req: Request) {
  try {
    await requireUser();

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "";
    const q = searchParams.get("q") || "";

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    await requireWorkspaceMember(workspaceId);

    const results = await prisma.grant.findMany({
      where: {
        workspaceId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { summary: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { agency: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 50,
    });

    return NextResponse.json(results);
  } catch (err: any) {
    const message = err?.message || "Failed to search grants.";
    const status = message.startsWith("Unauthorized") ? 401 : message.includes("access") ? 403 : 500;
    if (status === 500) console.error("GRANT SEARCH ERROR:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
