"use client";

import manual from "@/lib/manual/manual.json";

export default function ManualPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">GrantScout Manual</h1>

      <div className="space-y-4">
        {manual.sections.map((section) => (
          <div key={section.id} className="bg-slate-800 p-4 rounded">
            <h2 className="text-xl font-semibold text-slate-200 mb-2">
              {section.title}
            </h2>

            {section.content.map((paragraph, idx) => (
              <p key={idx} className="text-slate-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
