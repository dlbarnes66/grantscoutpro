export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  const { provider } = await req.json();

  const providers: Record<string, string> = {
    google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/api/sso/oauth/callback&response_type=code&scope=openid email profile`,
    azure: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize?client_id=${process.env.AZURE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/api/sso/oauth/callback&response_type=code&scope=openid email profile`,
    okta: `${process.env.OKTA_DOMAIN}/oauth2/v1/authorize?client_id=${process.env.OKTA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/api/sso/oauth/callback&response_type=code&scope=openid email profile`,
  };

  return NextResponse.json({
    redirect: providers[provider],
  });
}
