import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Contact = {
  id: string;
  name: string;
  email: string;
  role?: string;
  organization?: string;
  createdAt: string;
};

const contactStore: Contact[] = [];

export async function GET() {
  return NextResponse.json({ contacts: contactStore });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const name = body.name;
  const email = body.email;
  const role = body.role;
  const organization = body.organization;

  if (!name || !email) {
    return NextResponse.json(
      { error: "name and email required" },
      { status: 400 }
    );
  }

  const contact: Contact = {
    id: crypto.randomUUID(),
    name,
    email,
    role,
    organization,
    createdAt: new Date().toISOString()
  };

  contactStore.push(contact);

  return NextResponse.json({ contact });
}
