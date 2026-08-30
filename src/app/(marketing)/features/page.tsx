import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "GrantScout Pro — Features",
  description: "Explore everything GrantScout Pro can do.",
  openGraph: {
    title: "GrantScout Pro — Features",
    description: "AI grant writing, collaboration tools, reviewer simulation, and more.",
    url: "https://grantscoutpro.com/features",
    siteName: "GrantScout Pro",
    images: [
      {
        url: "/og-features.png",
        width: 1200,
        height: 630,
      },
    ],
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
