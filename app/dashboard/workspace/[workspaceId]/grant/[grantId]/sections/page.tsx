"use client";

import { useEffect, useState } from "react";
import SectionCard from "./SectionCard";

export default function GrantSectionsPage({
  params
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/grants/${grantId}/sections`);
      const json = await res.json();
      setSections(json.sections || []);
      setLoading(false);
    }
    load();
  }, [grantId]);

  if (loading) {
    return <p className="p-6 text-lg">Loading sections...</p>;
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Grant Sections</h1>

      <a
        href={`/dashboard/workspace/${workspaceId}/grant/${grantId}/sections/create`}
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-semibold"
      >
        + Create New Section
      </a>

      <div className="space-y-4">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            workspaceId={workspaceId}
            grantId={grantId}
          />
        ))}
      </div>
    </div>
  );
}
