import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GrantStage =
  | "idea"
  | "drafting"
  | "internal-review"
  | "submitted"
  | "awarded"
  | "declined";

type GrantOpportunity = {
  id: string;
  title: string;
  funderName: string;
  requestedAmount: number;
  organizationId: string;
  leadId?: string;
  stage: GrantStage;
  deadline?: string;
  createdAt: string;
};

const grantOpportunityStore: GrantOpportunity[] = [];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const organizationId = url.searchParams.get("organizationId");

  const opportunities = organizationId
    ? grantOpportunityStore.filter((o) => o.organizationId === organizationId)
    : grantOpportunityStore;

  return NextResponse.json({ opportunities });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const title = body.title;
  const funderName = body.funderName;
  const requestedAmount = body.requestedAmount;
  const organizationId = body.organizationId;
  const leadId = body.leadId;
  const deadline = body.deadline;

  if (!title || !funderName || !organizationId || typeof requestedAmount !== "number") {
    return NextResponse.json(
      { error: "title, funderName, organizationId, requestedAmount required" },
      { status: 400 }
    );
  }

  const opportunity: GrantOpportunity = {
    id: crypto.randomUUID(),
    title,
    funderName,
    requestedAmount,
    organizationId,
    leadId,
    stage: "idea",
    deadline,
    createdAt: new Date().toISOString()
  };

  grantOpportunityStore.push(opportunity);

  return NextResponse.json({ opportunity });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const id = body.id;
  const stage: GrantStage | undefined = body.stage;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const opportunity = grantOpportunityStore.find((o) => o.id === id);
  if (!opportunity) {
    return NextResponse.json({ error: "opportunity not found" }, { status: 404 });
  }

  if (stage) opportunity.stage = stage;

  return NextResponse.json({ opportunity });
}
