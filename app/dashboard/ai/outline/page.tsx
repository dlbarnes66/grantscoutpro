import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AIOutlinePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "AI Tools", href: "/dashboard/ai" },
        { label: "Outline" }
      ]} />

      <h1 className="text-3xl font-bold text-white mb-6">AI Proposal Outline Generator</h1>

      <Textarea
        placeholder="Describe your project or grant requirements..."
        className="h-48 mb-6"
      />

      <Button variant="primary">Generate Outline</Button>

      <Card className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-3">Generated Outline</h3>
        <p className="text-slate-400">AI-generated outline will appear here.</p>
      </Card>
    </div>
  );
}
