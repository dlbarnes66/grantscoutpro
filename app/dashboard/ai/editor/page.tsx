import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AIEditorPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "AI Tools", href: "/dashboard/ai" },
        { label: "Editor" }
      ]} />

      <h1 className="text-3xl font-bold text-white mb-6">AI Editor</h1>

      <Textarea
        placeholder="Paste text to edit..."
        className="h-48 mb-6"
      />

      <Button variant="primary">Edit Text</Button>

      <Card className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-3">Edited Text</h3>
        <p className="text-slate-400">AI-edited text will appear here.</p>
      </Card>
    </div>
  );
}
