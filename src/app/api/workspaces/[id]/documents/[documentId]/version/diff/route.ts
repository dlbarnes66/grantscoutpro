import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { a, b } = await req.json().catch(() => ({}));
  if (!a || !b) {
    return NextResponse.json({ error: "Missing version IDs" }, { status: 400 });
  }

  try {
    const versions = await prisma.documentVersion.findMany({
      where: { id: { in: [a, b] } },
    });

    if (versions.length !== 2) {
      return NextResponse.json({ error: "Versions not found" }, { status: 404 });
    }

    const v1 = versions.find((v) => v.id === a)!;
    const v2 = versions.find((v) => v.id === b)!;

    const contentA =
      typeof v1.content === "string"
        ? v1.content
        : JSON.stringify(v1.content ?? "");
    const contentB =
      typeof v2.content === "string"
        ? v2.content
        : JSON.stringify(v2.content ?? "");

    const linesA = contentA.split("\n");
    const linesB = contentB.split("\n");

    const maxLen = Math.max(linesA.length, linesB.length);

    const diff = Array.from({ length: maxLen }).map((_, i) => ({
      line: i + 1,
      old: linesA[i] ?? "",
      new: linesB[i] ?? "",
      changed: (linesA[i] ?? "") !== (linesB[i] ?? ""),
    }));

    return NextResponse.json({ success: true, diff });
  } catch (err: any) {
    console.error("VERSION DIFF ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
