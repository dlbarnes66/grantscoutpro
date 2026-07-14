import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function DashboardRecommendationsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Recommendations" }]} />

      <h1 className="text-3xl font-bold text-white mb-6">Recommended Grants</h1>

      <Card>
        <p className="text-slate-300">
          AI‑powered recommended grants will appear here.
        </p>
      </Card>
    </div>
  );
}
