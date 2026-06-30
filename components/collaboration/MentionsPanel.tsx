export function MentionsPanel({ mentions }: { mentions: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Mentions
      </h2>

      <ul className="space-y-4 text-sm text-slate-300">
        {mentions.map((m) => (
          <li key={m.id} className="rounded-lg bg-slate-800 p-4 space-y-1">
            <div className="font-semibold text-slate-100">
              {m.from} → {m.to}
            </div>
            <div>{m.text}</div>
            <div className="text-xs text-slate-500">{m.timestamp}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
