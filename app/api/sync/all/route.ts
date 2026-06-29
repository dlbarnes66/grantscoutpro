import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const results = {};

    async function call(path: string, data: any) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      return await res.json();
    }

    if (payload.grants) {
      results.grants = await call("/api/sync/grants", { grants: payload.grants });
    }

    if (payload.users) {
      results.users = await call("/api/sync/users", { users: payload.users });
    }

    if (payload.applications) {
      results.applications = await call("/api/sync/applications", {
        applications: payload.applications,
      });
    }

    if (payload.auditLogs) {
      results.auditLogs = await call("/api/sync/audit", {
        logs: payload.auditLogs,
      });
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Master sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
