import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function DashboardAIPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "AI Tools" }]} />

      <h1 className="text-3xl font-bold text-white mb-6">AI Tools</h1>

      <Card>
        <p className="text-slate-300">
          AI assistants, analyzers, writers, and intelligence tools will appear here.
        </p>
      </Card>
    </div>
  );
}
