"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reset your password</h1>
      <p className="text-sm text-slate-400">
        Enter your email and we’ll send you a reset link.
      </p>

      <form className="space-y-4">
        <div>
          <label className="text-sm">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium"
        >
          Send Reset Link
        </button>
      </form>

      <div className="text-sm text-slate-400">
        <Link href="/login" className="hover:text-slate-200">
          Back to login
        </Link>
      </div>
    </div>
  );
}
