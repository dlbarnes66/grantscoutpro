"use client";

import { useState } from "react";
import manual from "@/lib/manual/manual.json";

import { HelpHeader, HelpSidebar, HelpContent } from "./components";

export default function HelpPage() {
  const [selectedSection, setSelectedSection] = useState<any>(null);

  const sections = manual.sections ?? [];

  return (
    <div className="p-6 space-y-6">
      <HelpHeader />

      <div className="flex gap-6">
        <HelpSidebar
          sections={sections}
          onSelect={(section: any) => setSelectedSection(section)}
        />

        <div className="flex-1">
          <HelpContent section={selectedSection} />
        </div>
      </div>
    </div>
  );
}
