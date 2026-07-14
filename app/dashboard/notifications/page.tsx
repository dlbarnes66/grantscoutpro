import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function DashboardNotificationsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]} />

      <h1 className="text-3xl font-bold text-white mb-6">Notifications</h1>

      <Card>
        <p className="text-slate-300">
          All system and workspace notifications will appear here.
        </p>
      </Card>
    </div>
  );
}
