"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewApplicationPage({ params }: any) {
  const { workspaceId, grantId } = params;
  const router = useRouter();

  const [content, setContent] = useState("");

  async function createApplication() {
    const res = await fetch(`/api/grant/${grantId}/application`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });

    const data = await res.json();
    router.push(`/dashboard/${workspaceId}/grant/${grantId}/application/${data.id}`);
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-100">New Application</h1>

      <textarea
        className="w-full rounded border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100 h-60"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your application here…"
      />

      <button
        onClick={createApplication}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Create Application
      </button>
    </div>
  );
}
