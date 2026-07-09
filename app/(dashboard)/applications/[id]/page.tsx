"use client";

import { useEffect, useState } from "react";

export default function ApplicationBuilderPage({ params }: any) {
  const appId = params.id;

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/applications/detail", {
        method: "POST",
        body: JSON.stringify({ applicationId: appId }),
      });

      const data = await res.json();
      setApp(data.application);
      setLoading(false);
    }

    load();
  }, [appId]);

  if (loading) return <div className="p-6">Loading application…</div>;
  if (!app) return <div className="p-6">Application not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{app.grantTitle}</h1>

      <div className="space-y-4">
        {app.sections.map((section: any) => (
          <a
            key={section.id}
            href={`/applications/${appId}/sections/${section.id}`}
            className="block border rounded p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold">{section.title}</h2>
            <p className="text-sm text-gray-600">
              {section.wordCount} words • Updated{" "}
              {new Date(section.updatedAt).toLocaleDateString()}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
