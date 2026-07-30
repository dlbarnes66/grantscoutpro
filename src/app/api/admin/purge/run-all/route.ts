export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




async function call(path: string, body: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return await res.json();
}

export async function POST(req: Request) {
  try {
    const { grantDays, appDays, userDays, auditDays } = await req.json();

    const results = {
      grants: await call("/api/admin/archive/grants", { days: grantDays }),
      applications: await call("/api/admin/archive/applications", {
        days: appDays,
      }),
      users: await call("/api/admin/purge/users", { days: userDays }),
      audit: await call("/api/admin/archive/audit", { days: auditDays }),
    };

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Master purge error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
