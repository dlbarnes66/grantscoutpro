export default function SectionCard({
  section,
  workspaceId,
  grantId
}: {
  section: {
    id: string;
    title: string;
    purpose: string;
    order: number;
  };
  workspaceId: string;
  grantId: string;
}) {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm space-y-3">
      <h2 className="text-xl font-semibold">
        {section.order}. {section.title}
      </h2>

      <p className="text-gray-700">{section.purpose}</p>

      <a
        href={`/dashboard/workspace/${workspaceId}/grant/${grantId}/sections/${section.id}`}
        className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold"
      >
        Open Section
      </a>
    </div>
  );
}
