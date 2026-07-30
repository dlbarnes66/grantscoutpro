"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function PricingPage() {
  return (
    <div className="px-8 py-24 max-w-6xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">Pricing</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Simple, transparent pricing for nonprofits, governments, and foundations.
        </p>
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <PricingCard
          title="Starter"
          price="$29/mo"
          features={[
            "Grant search",
            "Basic filters",
            "Save grants",
            "Email alerts",
          ]}
        />

        <PricingCard
          title="Pro"
          price="$79/mo"
          highlight
          features={[
            "AI grant matching",
            "GrantRadar scoring",
            "Workspace collaboration",
            "Unlimited saved grants",
            "Priority support",
          ]}
        />

        <PricingCard
          title="Enterprise"
          price="Custom"
          features={[
            "Multi‑department access",
            "Custom integrations",
            "Dedicated support",
            "Advanced analytics",
          ]}
        />
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  features,
  highlight,
}: {
  title: string;
  price: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-xl p-8 shadow-sm ${
        highlight ? "border-blue-600 shadow-lg" : "border-gray-200"
      }`}
    >
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-4">{price}</p>

      <ul className="mt-6 space-y-2 text-gray-600">
        {features.map((f, i) => (
          <li key={i}>• {f}</li>
        ))}
      </ul>

      <a
        href="/sign-up"
        className={`mt-8 inline-block w-full text-center py-3 rounded-lg ${
          highlight
            ? "bg-blue-600 text-white"
            : "bg-gray-900 text-white hover:bg-black"
        }`}
      >
        Get Started
      </a>
    </div>
  );
}
