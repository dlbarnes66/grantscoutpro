"use client";

import { HelpHeader } from "../components/HelpHeader";
import { HelpSidebar } from "../components/HelpSidebar";
import { HelpContent } from "../components/HelpContent";

export default function HelpSupportPage() {
  return (
    <div className="p-6 space-y-6">
      <HelpHeader />

      <div className="flex gap-6">
        <HelpSidebar
          sections={[]}
          onSelect={() => {}}
        />

        <div className="flex-1">
          <HelpContent section={null} />
        </div>
      </div>
    </div>
  );
}
