import type { Metadata } from "next";
import PricingSection from "../components/PricingSection";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for nonprofits and small businesses — plans starting at $29/month with federal grant access, scaling up to state and foundation grants, AI proposal writing, and unlimited search.",
  alternates: { canonical: "/pricing" },
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

export default function PricingPage() {
  return (
    <div
      style={{
        background: "#071633",
        color: "white",
        minHeight: "100vh",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "100px 60px 0",
        }}
      >
        <a
          href="/"
          style={{
            color: "#CBD5E1",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← Back to Home
        </a>

        <h1
          style={{
            fontSize: "56px",
            fontWeight: 800,
            marginTop: "24px",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Pricing
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#CBD5E1",
            textAlign: "center",
            maxWidth: "620px",
            margin: "0 auto",
          }}
        >
          Professional grant intelligence without the enterprise price.
          Choose the funding universe you want access to.
        </p>
      </div>

      <PricingSection />
    </div>
  );
}
