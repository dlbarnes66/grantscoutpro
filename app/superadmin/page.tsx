import BillingCockpit from "@/components/superadmin/BillingCockpit";
import AiUsageMonitor from "@/components/superadmin/AiUsageMonitor";
import WorkspaceRepairConsole from "@/components/superadmin/WorkspaceRepairConsole";
import RecoveryToolsPanel from "@/components/superadmin/RecoveryToolsPanel";
import PlatformAnalyticsDashboard from "@/components/superadmin/PlatformAnalyticsDashboard";
import { getAuth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/security/super-admin";

export default async function SuperadminPage() {
  const auth = getAuth();
  const userId = auth.userId;

  if (!userId || !(await isSuperAdmin(userId))) {
    redirect("/"); // or a 403 page
  }

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-4xl font-bold">Super‑Admin Cockpit</h1>
      <p className="text-sm text-gray-600">
        Founder‑level controls for billing, AI usage, repair, recovery, and platform analytics.
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Platform Analytics</h2>
        <PlatformAnalyticsDashboard />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Billing Cockpit</h2>
        <BillingCockpit />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">AI Usage Monitor</h2>
        <AiUsageMonitor />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Workspace Repair Console</h2>
        <WorkspaceRepairConsole />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Recovery Tools</h2>
        <RecoveryToolsPanel />
      </section>
    </div>
  );
}
