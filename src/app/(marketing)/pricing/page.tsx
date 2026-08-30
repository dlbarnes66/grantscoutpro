import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "GrantScout Pro — Pricing",
  description: "Choose the plan that fits your organization.",
  openGraph: {
    title: "GrantScout Pro — Pricing",
    description: "Simple, transparent pricing for nonprofits.",
    url: "https://grantscoutpro.com/pricing",
    siteName: "GrantScout Pro",
    images: [
      {
        url: "/og-pricing.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function PricingPage() {
  const { userId } = await auth();

  return (
    <div className="py-24 text-center">
      <h1 className="text-5xl font-bold text-white">Pricing</h1>
      <p className="mt-4 text-xl text-zinc-300">
        Choose the plan that fits your organization.
      </p>
    </div>
  );
}
