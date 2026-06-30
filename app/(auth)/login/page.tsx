"use client";

import Link from "next/link";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Welcome back</h1>
      <p className="text-sm text-slate-400">
        Log in to your GrantScout Pro account.
      </p>

      <form className="space-y-4">
        <div>
          <label className="text-sm">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium"
        >
          Log In
        </button>
      </form>

      <OAuthButtons />

      <div className="text-sm text-slate-400 flex justify-between">
        <Link href="/forgot-password" className="hover:text-slate-200">
          Forgot password
        </Link>
        <Link href="/signup" className="hover:text-slate-200">
          Create account
        </Link>
      </div>
    </div>
  );
}
