import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AIEligibilityPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "AI Tools", href: "/dashboard/ai" },
        { label: "Eligibility" }
      ]} />

      <h1 className="text-3xl font-bold text-white mb-6">AI Eligibility Checker</h1>

      <Textarea
        placeholder="Describe your organization or project..."
        className="h-48 mb-6"
      />

      <Button variant="primary">Check Eligibility</Button>

      <Card className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-3">Eligibility Results</h3>
        <p className="text-slate-400">AI eligibility results will appear here.</p>
      </Card>
    </div>
  );
}
