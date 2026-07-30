export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseStringPromise } from "xml2js";




export async function POST(req: Request) {
  try {
    const xml = await req.text();
    const parsed = await parseStringPromise(xml);

    const assertion =
      parsed["samlp:Response"]["saml:Assertion"][0]["saml:AttributeStatement"][0];

    const email =
      assertion["saml:Attribute"].find((a: any) => a.$.Name === "email")
        ?.["saml:AttributeValue"][0] ?? null;

    if (!email) {
      return NextResponse.json({ error: "Email not found in SAML assertion" });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0],
          role: "member",
        },
      });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err: any) {
    console.error("SAML ACS error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
