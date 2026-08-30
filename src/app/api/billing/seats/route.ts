import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SeatRecord = {
  orgId: string;
  seats: number;
};

const seatStore = new Map<string, SeatRecord>();

export async function POST(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const seats = body.seats;

  if (typeof seats !== "number") {
    return NextResponse.json({ error: "seats required" }, { status: 400 });
  }

  seatStore.set(orgId, { orgId, seats });

  return NextResponse.json({ orgId, seats });
}

export async function GET(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = seatStore.get(orgId) ?? { orgId, seats: 1 };

  return NextResponse.json(record);
}
