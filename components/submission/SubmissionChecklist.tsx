export function SubmissionChecklist({ checklist }: { checklist: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Submission Checklist
      </h2>

      <ul className="space-y-3 text-sm">
        {checklist.map((item) => (
          <li key={item.id} className="flex items-center justify-between">
            <span className="text-slate-300">{item.label}</span>
            <span
              className={
                item.done
                  ? "text-green-400 font-semibold"
                  : "text-red-400 font-semibold"
              }
            >
              {item.done ? "✔ Done" : "✘ Missing"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
