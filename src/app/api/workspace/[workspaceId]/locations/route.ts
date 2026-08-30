import { NextRequest, NextResponse } from "next/server";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    workspaceId: string;
  };
}

// GET — fetch all workspace locations
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  const user = await requireUser();
  await requireWorkspaceMember(params.workspaceId);

  const locations = await prisma.workspaceLocation.findMany({
    where: { workspaceId: params.workspaceId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ locations });
}

// POST — add a new location
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  const user = await requireUser();
  await requireWorkspaceMember(params.workspaceId);

  const body = await req.json();

  const location = await prisma.workspaceLocation.create({
    data: {
      workspaceId: params.workspaceId,
      city: body.city ?? "",
      state: body.state ?? "",
      zip: body.zip ?? "",
      county: body.county ?? "",
      country: body.country ?? "USA",
      timezone: body.timezone ?? "",
    },
  });

  return NextResponse.json({ location }, { status: 201 });
}

// DELETE — remove a location
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  const user = await requireUser();
  await requireWorkspaceMember(params.workspaceId);

  const body = await req.json();

  if (!body.id) {
    return NextResponse.json(
      { error: "Missing location id" },
      { status: 400 }
    );
  }

  await prisma.workspaceLocation.delete({
    where: { id: body.id },
  });

  return NextResponse.json({ success: true });
}
