"use client";

export default function NarrativeEditor({
  text,
  onChangeAction
}: {
  text: string;
  onChangeAction: (t: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <textarea
        value={text}
        onChange={(e) => onChangeAction(e.target.value)}
        className="w-full h-96 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-300"
      />
    </div>
  );
}
