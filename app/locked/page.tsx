// app/locked/page.tsx
export default function LockedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Workspace Locked</h1>
        <p className="text-sm text-slate-300">
          Your 14‑day free trial has ended. Upgrade to a paid subscription to regain access.
        </p>
        <a
          href="/billing"
          className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Go to Billing
        </a>
      </div>
    </div>
  );
}
