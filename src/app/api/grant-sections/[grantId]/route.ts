import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
  const { grantId } = params;

  try {
    const sections = await prisma.grantSection.findMany({
      where: { grantId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(sections);
  } catch (err) {
    console.error("SECTIONS GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load sections" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: any) {
  const { grantId } = params;
  const { title, content } = await req.json();

  try {
    const count = await prisma.grantSection.count({ where: { grantId } });

    const section = await prisma.grantSection.create({
      data: {
        grantId,
        title,
        content,
        order: count,
      },
    });

    return NextResponse.json(section);
  } catch (err) {
    console.error("SECTIONS POST ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
