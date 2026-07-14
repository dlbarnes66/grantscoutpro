"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AIWriterPage() {
  const [input, setInput] = useState("");

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "AI Tools", href: "/dashboard/ai" },
          { label: "Writer" },
        ]}
      />

      <h1 className="text-3xl font-bold text-white mb-6">AI Proposal Writer</h1>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe your organization, project, or grant requirements..."
        className="h-48 mb-6"
      />

      <Button variant="primary" className="px-6 py-3 text-lg">
        Generate Proposal
      </Button>

      <Card className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-3">
          AI‑Generated Proposal
        </h3>
        <p className="text-slate-400 leading-relaxed">
          Your generated proposal will appear here.
        </p>
      </Card>
    </div>
  );
}
