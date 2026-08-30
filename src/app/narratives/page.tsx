"use client";

import { useState } from "react";
import { NarrativeEditor } from "@/components/narratives/NarrativeEditor";

export default function NarrativePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-100">
        Narrative Editor
      </h1>

      <NarrativeEditor
        title={title}
        content={content}
        onChangeTitleAction={setTitle}
        onChangeContentAction={setContent}
      />
    </div>
  );
}