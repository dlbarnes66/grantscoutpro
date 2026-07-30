"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center p-10">
      <SignIn afterSignInUrl="/" afterSignUpUrl="/" />
    </div>
  );
}
