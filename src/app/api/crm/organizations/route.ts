import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Organization = {
  id: string;
  name: string;
  ein?: string;
  mission?: string;
  annualBudget?: number;
  createdAt: string;
};

const orgStore: Organization[] = [];

export async function GET() {
  return NextResponse.json({ organizations: orgStore });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const name = body.name;
  const ein = body.ein;
  const mission = body.mission;
  const annualBudget = body.annualBudget;

  if (!name) {
    return NextResponse.json(
      { error: "name required" },
      { status: 400 }
    );
  }

  const org: Organization = {
    id: crypto.randomUUID(),
    name,
    ein,
    mission,
    annualBudget,
    createdAt: new Date().toISOString()
  };

  orgStore.push(org);

  return NextResponse.json({ organization: org });
}
