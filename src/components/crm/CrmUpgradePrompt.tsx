"use client";

import { useState } from "react";
import { Handshake, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";

export default function CrmUpgradePrompt({ workspaceId }: { workspaceId: string }) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/addons/crm/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to start checkout");
      if (json.url) window.location.href = json.url;
    } catch (err: any) {
      setError(err?.message || "Failed to start checkout");
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#00E5FF]/10">
        <Handshake size={18} className="text-[#00E5FF]" />
      </div>
      <h2 className="text-[15px] font-semibold text-white">CRM isn't included in your plan</h2>
      <p className="mx-auto mt-2 max-w-sm text-[13px] text-slate-400">
        The funder/donor CRM comes with the Enterprise plan, or you can add it to any plan on its own.
      </p>

      <div className="mx-auto mt-5 inline-flex rounded-md border border-white/[0.08] p-0.5 text-[12.5px]">
        <button
          onClick={() => setInterval("monthly")}
          className={`rounded px-3 py-1 ${interval === "monthly" ? "bg-white/[0.08] text-white" : "text-slate-400"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval("yearly")}
          className={`rounded px-3 py-1 ${interval === "yearly" ? "bg-white/[0.08] text-white" : "text-slate-400"}`}
        >
          Yearly
        </button>
      </div>

      {error && <p className="mt-3 text-[12.5px] text-red-400">{error}</p>}

      <button
        onClick={upgrade}
        disabled={loading}
        className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-4 py-2 text-[13px] font-medium text-[#06131F] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading && <Loader2 size={13} className="animate-spin" />}
        Add CRM
      </button>

      <p className="mt-3 text-[11.5px] text-slate-600">
        Only the workspace owner can manage billing. Already on Enterprise? This should update automatically -
        contact support if it doesn't.
      </p>
    </Card>
  );
}
