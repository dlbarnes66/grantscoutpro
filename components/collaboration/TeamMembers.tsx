export function TeamMembers({ members }: { members: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        Team Members
      </h2>

      <ul className="space-y-3 text-sm text-slate-300">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between">
            <span>{m.name}</span>
            <span className="text-blue-400 font-semibold">{m.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
