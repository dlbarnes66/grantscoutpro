import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GrantLeadStatus = "new" | "reviewing" | "discarded";

type GrantLead = {
  id: string;
  title: string;
  funderName: string;
  url?: string;
  deadline?: string;
  status: GrantLeadStatus;
  organizationId?: string;
  createdAt: string;
};

const grantLeadStore: GrantLead[] = [];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const organizationId = url.searchParams.get("organizationId");

  const leads = organizationId
    ? grantLeadStore.filter((l) => l.organizationId === organizationId)
    : grantLeadStore;

  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const title = body.title;
  const funderName = body.funderName;
  const urlStr = body.url;
  const deadline = body.deadline;
  const organizationId = body.organizationId;

  if (!title || !funderName) {
    return NextResponse.json(
      { error: "title and funderName required" },
      { status: 400 }
    );
  }

  const lead: GrantLead = {
    id: crypto.randomUUID(),
    title,
    funderName,
    url: urlStr,
    deadline,
    status: "new",
    organizationId,
    createdAt: new Date().toISOString()
  };

  grantLeadStore.push(lead);

  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const id = body.id;
  const status: GrantLeadStatus | undefined = body.status;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const lead = grantLeadStore.find((l) => l.id === id);
  if (!lead) {
    return NextResponse.json({ error: "lead not found" }, { status: 404 });
  }

  if (status) lead.status = status;

  return NextResponse.json({ lead });
}
