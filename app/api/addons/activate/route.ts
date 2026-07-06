// app/api/addons/activate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ADDON_CAPABILITIES } from "@/lib/addonCapabilities";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { addon, workspaceId } = await req.json();

    if (!addon || !workspaceId) {
      return NextResponse.json(
        { success: false, error: "addon and workspaceId are required" },
        { status: 400 }
      );
    }

    // ⭐ Correct validation — use ADDON_CAPABILITIES keys
    const validAddonKeys = Object.keys(ADDON_CAPABILITIES);

    if (!validAddonKeys.includes(addon)) {
      return NextResponse.json(
        { success: false, error: "Invalid addon key" },
        { status: 400 }
      );
    }

    // Activate addon
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        addons: {
          push: addon,
        },
      },
    });

    return NextResponse.json({
      success: true,
      activated: addon,
    });
  } catch (error) {
    console.error("ADDON ACTIVATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to activate addon" },
      { status: 500 }
    );
  }
}
