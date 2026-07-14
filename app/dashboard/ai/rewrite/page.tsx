import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AIRewritePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "AI Tools", href: "/dashboard/ai" },
        { label: "Rewrite" }
      ]} />

      <h1 className="text-3xl font-bold text-white mb-6">AI Rewrite Tool</h1>

      <Textarea
        placeholder="Paste text to rewrite..."
        className="h-48 mb-6"
      />

      <Button variant="primary">Rewrite Text</Button>

      <Card className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-3">Rewritten Text</h3>
        <p className="text-slate-400">AI rewritten text will appear here.</p>
      </Card>
    </div>
  );
}
