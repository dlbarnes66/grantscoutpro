"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState } from "react";
import NarrativeEditor from "@/components/narratives/NarrativeEditor";

export default function NarrativePage() {
  const [text, setText] = useState("");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-100">Narrative Editor</h1>

      <NarrativeEditor text={text} onChange={setText} />
    </div>
  );
}
