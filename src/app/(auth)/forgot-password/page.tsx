"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <p className="mt-4">
        Enter your email to reset your password.
      </p>
      <Link href="/login" className="text-blue-600 underline mt-4 inline-block">
        Back to Login
      </Link>
    </div>
  );
}
