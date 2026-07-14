import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function DashboardSearchHistoryPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Search History" }]} />

      <h1 className="text-3xl font-bold text-white mb-6">Search History</h1>

      <Card>
        <p className="text-slate-300">
          Your past searches will appear here.
        </p>
      </Card>
    </div>
  );
}
