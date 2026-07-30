"use client";

export default function ManualContent({ section }: any) {
  return (
    <div className="col-span-3 border rounded p-6">
      <h1 className="text-2xl font-bold mb-4">{section.title}</h1>

      <div className="space-y-4">
        {section.content.map((paragraph: string, idx: number) => (
          <p key={idx} className="text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
