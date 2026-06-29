import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { rows } = await req.json();

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Missing rows" }, { status: 400 });
    }

    const header = Object.keys(rows[0]).join(",");
    const body = rows.map((r) => Object.values(r).join(",")).join("\n");

    const csv = `${header}\n${body}`;
    const base64 = Buffer.from(csv).toString("base64");

    return NextResponse.json({ base64 });
  } catch (err: any) {
    console.error("CSV report error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
