export function ActivityTimeline({ activity }: { activity: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Activity Timeline
      </h2>

      <ul className="space-y-3 text-sm text-slate-300">
        {activity.map((a) => (
          <li key={a.id} className="flex items-center justify-between">
            <span>{a.text}</span>
            <span className="text-slate-500 text-xs">{a.timestamp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
