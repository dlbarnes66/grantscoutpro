import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AIMatchingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "AI Tools", href: "/dashboard/ai" },
        { label: "Matching" }
      ]} />

      <h1 className="text-3xl font-bold text-white mb-6">AI Grant Matching</h1>

      <Card>
        <p className="text-slate-300">
          AI grant matching results will appear here.
        </p>
      </Card>
    </div>
  );
}
