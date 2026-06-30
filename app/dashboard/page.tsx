import { QuickActions } from "@/components/dashboard/QuickActions";
import { AIAssistantPanel } from "@/components/dashboard/AIAssistantPanel";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { KPISnapshot } from "@/components/dashboard/KPISnapshot";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Welcome back, Darryl
        </h1>
        <p className="text-sm text-slate-400">
          Your AI grant intelligence dashboard is ready.
        </p>
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <PipelineOverview />
          <RecentActivity />
        </div>

        <div className="space-y-6">
          <AIAssistantPanel />
          <KPISnapshot />
        </div>
      </div>
    </div>
  );
}
