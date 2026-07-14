import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AIProposalPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "AI Tools", href: "/dashboard/ai" },
        { label: "Proposal" }
      ]} />

      <h1 className="text-3xl font-bold text-white mb-6">AI Proposal Generator</h1>

      <Textarea
        placeholder="Describe your project..."
        className="h-48 mb-6"
      />

      <Button variant="primary">Generate Proposal</Button>

      <Card className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-3">Generated Proposal</h3>
        <p className="text-slate-400">AI-generated proposal will appear here.</p>
      </Card>
    </div>
  );
}
