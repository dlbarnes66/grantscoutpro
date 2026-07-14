import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function DashboardActivityPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Activity" }]} />

      <h1 className="text-3xl font-bold text-white mb-6">Recent Activity</h1>

      <Card>
        <p className="text-slate-300">
          Your recent actions, updates, and workspace events will appear here.
        </p>
      </Card>
    </div>
  );
}
