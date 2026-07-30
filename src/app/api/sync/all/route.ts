export const dynamic = "force-dynamic";

// app/api/sync/all/route.ts
import { NextResponse } from "next/server";



interface SyncResults {
  grants?: any;
  users?: any;
  workspaces?: any;
  orgs?: any;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const call = async (path: string, body: any) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.json();
    };

    const results: SyncResults = {};

    if (payload.grants) {
      results.grants = await call("/api/sync/grants", { grants: payload.grants });
    }

    if (payload.users) {
      results.users = await call("/api/sync/users", { users: payload.users });
    }

    if (payload.workspaces) {
      results.workspaces = await call("/api/sync/workspaces", { workspaces: payload.workspaces });
    }

    if (payload.orgs) {
      results.orgs = await call("/api/sync/orgs", { orgs: payload.orgs });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("SYNC ALL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync all data" },
      { status: 500 }
    );
  }
}
