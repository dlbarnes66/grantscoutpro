import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AssetItem = {
  id: string;
  name: string;
  value: number;
  status: string;
};

const assetStore = new Map<string, AssetItem[]>();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const closeoutId = url.searchParams.get("closeoutId");

  if (!closeoutId)
    return NextResponse.json({ error: "closeoutId required" }, { status: 400 });

  const assets = assetStore.get(closeoutId) ?? [];

  return NextResponse.json({ closeoutId, assets });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const closeoutId = body.closeoutId;
  const assets: AssetItem[] = body.assets ?? [];

  if (!closeoutId)
    return NextResponse.json({ error: "closeoutId required" }, { status: 400 });

  assetStore.set(closeoutId, assets);

  return NextResponse.json({ closeoutId, assets });
}
