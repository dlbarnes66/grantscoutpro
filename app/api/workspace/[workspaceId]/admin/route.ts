import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const workspaceId = params.workspaceId;

    const users = await prisma.workspaceUser.findMany({
      where: { workspaceId },
      include: { user: true }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin Load Error:", error);
    return NextResponse.json(
      { error: "Failed to load admin data" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const workspaceId = params.workspaceId;
    const { userId, role } = await req.json();

    const updated = await prisma.workspaceUser.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId
        }
      },
      data: { role }
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Admin Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
