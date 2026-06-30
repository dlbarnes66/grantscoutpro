"use client";

export function RequiredAttachments({ attachments }: { attachments: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Required Attachments
      </h2>

      <ul className="space-y-3 text-sm text-slate-300">
        {attachments.map((a) => (
          <li key={a.id} className="flex items-center justify-between">
            <span>{a.name}</span>
            <span
              className={
                a.uploaded
                  ? "text-green-400 font-semibold"
                  : "text-red-400 font-semibold"
              }
            >
              {a.uploaded ? "Uploaded" : "Missing"}
            </span>
          </li>
        ))}
      </ul>

      <button className="rounded-md bg-slate-800 hover:bg-slate-700 transition px-3 py-2 text-sm font-medium">
        Upload Attachments
      </button>
    </div>
  );
}
