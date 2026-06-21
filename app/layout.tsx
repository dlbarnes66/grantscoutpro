import "./globals.css";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Providers } from "./providers";
import * as Sentry from "@sentry/nextjs";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return {
    title: "GrantRadar",
    description: "AI-powered grant monitoring, eligibility tracking, and funding intelligence.",
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Providers>
          <nav className="bg-white shadow px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">
              <Link href="/">GrantRadar</Link>
            </h1>

            <div className="flex gap-6 text-sm font-medium items-center">
              <Link href="/jobs" className="hover:text-blue-600">
                Jobs
              </Link>
              <Link href="/search" className="hover:text-blue-600">
                AI Search
              </Link>
              <Link href="/index" className="hover:text-blue-600">
                Index URL
              </Link>

              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </nav>

          <main className="max-w-4xl mx-auto py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
