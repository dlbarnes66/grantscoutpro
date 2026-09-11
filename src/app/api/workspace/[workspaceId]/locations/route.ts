import { NextRequest, NextResponse } from "next/server";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    workspaceId: string;
  }>;
}

// GET — fetch all workspace locations
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { workspaceId } = await params;
    await requireUser();
    await requireWorkspaceMember(workspaceId);

    const locations = await prisma.workspaceLocation.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ locations });
  } catch (err: any) {
    console.error("WORKSPACE LOCATIONS GET ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// POST — add a new location
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { workspaceId } = await params;
    await requireUser();
    await requireWorkspaceMember(workspaceId);

    const body = await req.json().catch(() => ({}));

    if (!body.city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const location = await prisma.workspaceLocation.create({
      data: {
        workspaceId,
        city: body.city ?? "",
        state: body.state ?? "",
        zip: body.zip ?? "",
        county: body.county ?? "",
        country: body.country ?? "USA",
        timezone: body.timezone ?? "",
      },
    });

    return NextResponse.json({ location }, { status: 201 });
  } catch (err: any) {
    console.error("WORKSPACE LOCATIONS POST ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// DELETE — remove a location
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { workspaceId } = await params;
    await requireUser();
    await requireWorkspaceMember(workspaceId);

    const body = await req.json().catch(() => ({}));

    if (!body.id) {
      return NextResponse.json({ error: "Missing location id" }, { status: 400 });
    }

    await prisma.workspaceLocation.delete({
      where: { id: body.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE LOCATIONS DELETE ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
