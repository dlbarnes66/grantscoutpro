import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function DashboardSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]} />

      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

      <Card>
        <p className="text-slate-300">
          Account, workspace, and system settings will appear here.
        </p>
      </Card>
    </div>
  );
}
