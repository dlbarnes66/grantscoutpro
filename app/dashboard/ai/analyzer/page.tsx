import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AIAnalyzerPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "AI Tools", href: "/dashboard/ai" },
        { label: "Analyzer" }
      ]} />

      <h1 className="text-3xl font-bold text-white mb-6">AI Grant Analyzer</h1>

      <Textarea
        placeholder="Paste a grant description or requirements..."
        className="h-48 mb-6"
      />

      <Button variant="primary">Analyze Grant</Button>

      <Card className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-3">Analysis Results</h3>
        <p className="text-slate-400">AI analysis will appear here.</p>
      </Card>
    </div>
  );
}
