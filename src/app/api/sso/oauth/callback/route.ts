export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




async function fetchToken(provider: string, code: string) {
  const endpoints: Record<string, string> = {
    google: "https://oauth2.googleapis.com/token",
    azure: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    okta: `${process.env.OKTA_DOMAIN}/oauth2/v1/token`,
  };

  const params = new URLSearchParams({
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/sso/oauth/callback`,
    grant_type: "authorization_code",
    client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`]!,
    client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]!,
  });

  const res = await fetch(endpoints[provider], {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  return await res.json();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const provider = url.searchParams.get("provider");

    if (!code || !provider) {
      return NextResponse.json({ error: "Missing code or provider" });
    }

    const token = await fetchToken(provider, code);

    const idToken = JSON.parse(
      Buffer.from(token.id_token.split(".")[1], "base64").toString()
    );

    const email = idToken.email;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: idToken.name ?? email.split("@")[0],
          role: "member",
        },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
