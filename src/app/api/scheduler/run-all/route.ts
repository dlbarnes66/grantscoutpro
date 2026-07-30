export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST() {
  try {
    console.log("Scheduler: run-all triggered");

    // Placeholder — add your job triggers here later
    // Example:
    // await runAllScheduledJobs();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Scheduler run-all error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
