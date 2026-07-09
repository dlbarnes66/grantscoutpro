export default function PricingPage() {
  return (
    <div className="p-12 space-y-12">
      <h1 className="text-4xl font-bold text-center">Pricing</h1>

      <div className="grid grid-cols-4 gap-8">
        <Plan tier="FEDERAL_ONLY" price="$29/mo" features={["Federal grants"]} />
        <Plan tier="FEDERAL_STATE" price="$49/mo" features={["Federal + State grants"]} />
        <Plan tier="PRO" price="$99/mo" features={["Foundations", "Philanthropic", "AI Matching"]} />
        <Plan tier="ENTERPRISE" price="$199/mo" features={["Everything", "Unlimited Workspaces"]} />
      </div>
    </div>
  );
}

function Plan({ tier, price, features }: any) {
  return (
    <div className="border rounded p-6 text-center">
      <h2 className="text-2xl font-semibold">{tier}</h2>
      <p className="text-xl mt-2">{price}</p>

      <ul className="mt-4 space-y-1 text-gray-600">
        {features.map((f: string) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <a
        href="/signup"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded mt-6"
      >
        Choose Plan
      </a>
    </div>
  );
}
