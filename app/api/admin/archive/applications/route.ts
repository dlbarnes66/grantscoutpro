import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apps = await prisma.applicationHistory.findMany({
      orderBy: { createdAt: "desc" }
    });

    return new Response(JSON.stringify(apps), { status: 200 });
  } catch (error: any) {
    console.error("Application archive error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
