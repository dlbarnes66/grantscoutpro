"use client";

import { useState } from "react";
import { SectionNav } from "@/components/narratives/SectionNav";
import { SectionEditor } from "@/components/narratives/SectionEditor";
import { AIDraftingPanel } from "@/components/narratives/AIDraftingPanel";
import { VersionHistory } from "@/components/narratives/VersionHistory";

export default function NarrativeBuilderPage({ params }: { params: { id: string } }) {
  const [sections, setSections] = useState([
    { id: "overview", title: "Project Overview", content: "" },
    { id: "needs", title: "Needs Statement", content: "" },
    { id: "approach", title: "Project Approach", content: "" },
    { id: "impact", title: "Expected Impact", content: "" },
    { id: "evaluation", title: "Evaluation Plan", content: "" }
  ]);

  const [activeSection, setActiveSection] = useState("overview");

  const currentSection = sections.find((s) => s.id === activeSection);

  function updateSectionContent(id: string, content: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s))
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-1">
        <SectionNav
          sections={sections}
          active={activeSection}
          onSelect={setActiveSection}
        />
      </div>

      <div className="xl:col-span-2 space-y-6">
        <SectionEditor
          section={currentSection}
          onChange={(content) => updateSectionContent(activeSection, content)}
        />

        <VersionHistory section={currentSection} />
      </div>

      <div className="xl:col-span-1">
        <AIDraftingPanel
          section={currentSection}
          onDraft={(draft) => updateSectionContent(activeSection, draft)}
        />
      </div>
    </div>
  );
}
