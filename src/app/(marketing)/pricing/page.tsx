import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for nonprofits — plans starting at $29/month with federal grant access, scaling up to state and foundation grants, CRM, and unlimited search.",
  openGraph: {
    title: "Grant Scout Pro Pricing",
    description:
      "Compare Grant Scout Pro plans and find the right fit for your organization's grant program.",
    url: "https://www.grantscoutpro.com/pricing",
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
    title: "Grant Scout Pro Pricing",
    description:
      "Compare Grant Scout Pro plans and find the right fit for your organization's grant program.",
    images: ["/og-image.png"],
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
