"use client";

export default function PricingPreview() {
  const tiers = [
    {
      name: "Starter",
      price: "$29/mo",
      items: ["3 team members", "10 AI documents/mo", "Grant search", "Basic insights"],
    },
    {
      name: "Team",
      price: "$79/mo",
      items: ["10 team members", "Unlimited documents", "Reviewer simulation", "Collaboration tools"],
    },
    {
      name: "Pro",
      price: "$149/mo",
      items: ["Unlimited team", "Advanced insights", "Compliance scoring", "Multi‑year impact analysis"],
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 text-center">
          Simple, Transparent Pricing
        </h2>

        <div className="mt-16 grid md:grid-cols-3 gap-12">
          {tiers.map((tier) => (
            <div key={tier.name} className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
              <p className="mt-2 text-xl text-blue-600 font-semibold">{tier.price}</p>

              <ul className="mt-6 space-y-3 text-gray-700">
                {tier.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>

              <a
                href="/pricing"
                className="mt-8 block text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Choose Plan
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
