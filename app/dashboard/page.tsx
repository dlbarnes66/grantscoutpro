import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Dashboard" },
        ]}
      />

      <h1 className="text-3xl font-bold text-white mb-2">
        Welcome back, Darryl
      </h1>
      <p className="text-slate-400 mb-8">
        Your personalized grant insights and tools are ready.
      </p>

      <div className="flex flex-wrap gap-4 mb-10">
        <Button variant="primary">Search Grants</Button>
        <Button variant="secondary">Write with AI</Button>
        <Button variant="primary">Compare Grants</Button>
      </div>

      <FeatureGrid />
    </div>
  );
}
