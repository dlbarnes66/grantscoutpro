"use client";

export function HelpContent({ section }: { section: any }) {
  if (!section) {
    return (
      <div className="text-slate-400">
        Select a topic from the left to view help content.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-100">{section.title}</h2>

      {section.content.map((paragraph: string, idx: number) => (
        <p key={idx} className="text-slate-300 leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
