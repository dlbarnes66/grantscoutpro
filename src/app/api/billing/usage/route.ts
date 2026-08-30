import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type UsageRecord = {
  orgId: string;
  metric: string;
  amount: number;
  timestamp: string;
};

const usageStore: UsageRecord[] = [];

export async function POST(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const metric = body.metric;
  const amount = body.amount ?? 1;

  if (!metric) {
    return NextResponse.json({ error: "metric required" }, { status: 400 });
  }

  const record: UsageRecord = {
    orgId,
    metric,
    amount,
    timestamp: new Date().toISOString()
  };

  usageStore.push(record);

  return NextResponse.json({ record });
}

export async function GET() {
  return NextResponse.json({ usage: usageStore });
}
