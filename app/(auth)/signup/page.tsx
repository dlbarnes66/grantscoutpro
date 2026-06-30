"use client";

import Link from "next/link";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Create your account</h1>
      <p className="text-sm text-slate-400">
        Start using GrantScout Pro today.
      </p>

      <form className="space-y-4">
        <div>
          <label className="text-sm">Name</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

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
          Create Account
        </button>
      </form>

      <OAuthButtons />

      <div className="text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="hover:text-slate-200">
          Log in
        </Link>
      </div>
    </div>
  );
}
