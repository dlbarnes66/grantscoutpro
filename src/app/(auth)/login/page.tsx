"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function LoginPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Login</h1>

      <OAuthButtons />

      <Link href="/forgot-password" className="text-blue-600 underline mt-4 inline-block">
        Forgot Password?
      </Link>
    </div>
  );
}
