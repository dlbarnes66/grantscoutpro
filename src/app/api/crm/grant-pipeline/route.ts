import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const stages = [
  { id: "idea", name: "Idea", order: 1 },
  { id: "drafting", name: "Drafting", order: 2 },
  { id: "internal-review", name: "Internal Review", order: 3 },
  { id: "submitted", name: "Submitted", order: 4 },
  { id: "awarded", name: "Awarded", order: 5 },
  { id: "declined", name: "Declined", order: 6 }
];

export async function GET() {
  return NextResponse.json({ stages });
}
