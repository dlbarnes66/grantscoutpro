import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type LeadStatus = "new" | "qualified" | "lost";

type Lead = {
  id: string;
  name: string;
  email: string;
  organization?: string;
  status: LeadStatus;
  createdAt: string;
};

const leadStore: Lead[] = [];

export async function GET() {
  return NextResponse.json({ leads: leadStore });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const name = body.name;
  const email = body.email;
  const organization = body.organization;

  if (!name || !email) {
    return NextResponse.json(
      { error: "name and email required" },
      { status: 400 }
    );
  }

  const lead: Lead = {
    id: crypto.randomUUID(),
    name,
    email,
    organization,
    status: "new",
    createdAt: new Date().toISOString()
  };

  leadStore.push(lead);

  return NextResponse.json({ lead });
}
