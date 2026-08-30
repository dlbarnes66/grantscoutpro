"use client";

import { useState } from "react";

import SectionNav from "@/components/narratives/SectionNav";
import { SectionEditor } from "@/components/narratives/SectionEditor";
import { AIDraftingPanel } from "@/components/narratives/AIDraftingPanel";
import VersionHistory from "@/components/narratives/VersionHistory";

export default function NarrativeBuilderPage({
  params,
}: {
  params: { narrativeId: string };
}) {
  const [sections, setSections] = useState([
    {
      id: "overview",
      title: "Project Overview",
      content: "",
    },
    {
      id: "needs",
      title: "Needs Statement",
      content: "",
    },
    {
      id: "approach",
      title: "Project Approach",
      content: "",
    },
    {
      id: "impact",
      title: "Expected Impact",
      content: "",
    },
    {
      id: "evaluation",
      title: "Evaluation Plan",
      content: "",
    },
  ]);

  const [activeSection, setActiveSection] =
    useState("overview");

  const [versions] = useState([
    {
      id: "1",
      date: new Date().toLocaleDateString(),
    },
  ]);

  function handleSectionChange(updated: any[]) {
    setSections(updated);
  }

  function handleDraftGenerated(draft: string) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === activeSection
          ? {
              ...section,
              content: draft,
            }
          : section
      )
    );
  }

  function handleVersionSelect(versionId: string) {
    console.log("Selected version:", versionId);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
      <div className="xl:col-span-1">
        <SectionNav
          onSelectAction={setActiveSection}
        />
      </div>

      <div className="space-y-6 xl:col-span-2">
        <SectionEditor
          sections={sections}
          onChangeAction={handleSectionChange}
        />

        <VersionHistory
          versions={versions}
          onSelectAction={handleVersionSelect}
        />
      </div>

      <div className="xl:col-span-1">
        <AIDraftingPanel
          onGenerateAction={handleDraftGenerated}
        />
      </div>
    </div>
  );
}