import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Features",
  description:
    "AI-powered grant matching, deadline tracking, collaborative proposal writing, and auto-populated federal forms (SF-424 and more) — see everything Grant Scout Pro can do.",
  openGraph: {
    title: "Grant Scout Pro Features",
    description:
      "AI-powered grant matching, deadline tracking, collaborative proposal writing, and auto-populated federal forms.",
    url: "https://www.grantscoutpro.com/features",
    siteName: "Grant Scout Pro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grant Scout Pro Features",
    description:
      "AI-powered grant matching, deadline tracking, collaborative proposal writing, and auto-populated federal forms.",
    images: ["/og-image.png"],
  },
};

export default async function FeaturesPage() {
  const { userId } = await auth();

  return (
    <div className="py-24 text-center">
      <h1 className="text-5xl font-bold text-white">Features</h1>
      <p className="mt-4 text-xl text-zinc-300">
        Explore everything GrantScout Pro can do.
      </p>
    </div>
  );
}
