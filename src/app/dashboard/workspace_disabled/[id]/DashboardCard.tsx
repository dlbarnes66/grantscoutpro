export default function DashboardCard({
  title,
  items,
  type
}: {
  title: string;
  items: any[];
  type: "grants" | "deadlines" | "list";
}) {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>

      {type === "grants" &&
        items.map((g) => (
          <div key={g.id} className="p-3 border rounded-md bg-gray-50">
            <h3 className="font-medium">{g.title}</h3>
            <p className="text-sm text-gray-600">{g.summary}</p>
            <p className="text-sm mt-1">
              <strong>Status:</strong> {g.status}
            </p>
            {g.deadline && (
              <p className="text-sm text-red-600">
                <strong>Deadline:</strong> {g.deadline}
              </p>
            )}
          </div>
        ))}

      {type === "deadlines" &&
        items.map((d) => (
          <div key={d.id} className="p-3 border rounded-md bg-gray-50">
            <h3 className="font-medium">{d.title}</h3>
            <p className="text-sm text-red-600">
              <strong>Deadline:</strong> {d.deadline}
            </p>
          </div>
        ))}

      {type === "list" &&
        items.map((item, i) => (
          <p key={i} className="text-gray-700">
            • {item}
          </p>
        ))}
    </div>
  );
}
