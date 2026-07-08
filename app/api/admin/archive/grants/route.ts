import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const archived = await prisma.grant.findMany({
      orderBy: { createdAt: "desc" }
    });

    return new Response(JSON.stringify(archived), { status: 200 });
  } catch (error: any) {
    console.error("Grant archive error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

