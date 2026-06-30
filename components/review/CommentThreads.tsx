export function CommentThreads({ comments }: { comments: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Reviewer Comments
      </h2>

      <ul className="space-y-4">
        {comments.map((c, i) => (
          <li key={i} className="rounded-lg bg-slate-800 p-4 space-y-1">
            <div className="text-sm font-semibold text-slate-100">
              {c.reviewer}
            </div>
            <div className="text-sm text-slate-300">{c.text}</div>
            <div className="text-xs text-slate-500">{c.timestamp}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
