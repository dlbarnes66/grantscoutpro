import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function ComparePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Compare Grants" },
        ]}
      />

      <h1 className="text-3xl font-bold text-white mb-6">Compare Grants</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-semibold text-white mb-2">Grant A</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Details for Grant A go here.
          </p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-white mb-2">Grant B</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Details for Grant B go here.
          </p>
        </Card>
      </div>

      <Card className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-2">
          AI Comparison Summary
        </h3>
        <p className="text-slate-400 leading-relaxed">
          AI‑generated comparison summary will appear here.
        </p>
      </Card>
    </div>
  );
}
