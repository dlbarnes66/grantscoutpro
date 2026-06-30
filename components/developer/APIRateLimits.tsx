export function APIRateLimits() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Rate Limits
      </h2>

      <ul className="space-y-2 text-sm text-slate-300">
        <li>• 100 requests / minute</li>
        <li>• 10,000 requests / day</li>
        <li>• Burst limit: 20 requests</li>
      </ul>

      <p className="text-xs text-slate-500">
        These limits will be enforced once backend integration is complete.
      </p>
    </div>
  );
}
