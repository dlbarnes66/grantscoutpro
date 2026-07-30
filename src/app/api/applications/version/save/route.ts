export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const { applicationId, versionData } = await req.json();

    if (!applicationId || !versionData) {
      return NextResponse.json(
        { success: false, error: "Missing applicationId or versionData" },
        { status: 400 }
      );
    }

    const record = await prisma.applicationVersion.create({
      data: {
        applicationId,
        content: versionData,   // ✔ ONLY VALID FIELD
      },
    });

    return NextResponse.json({
      success: true,
      version: record,
    });
  } catch (err: any) {
    console.error("APPLICATION VERSION SAVE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
