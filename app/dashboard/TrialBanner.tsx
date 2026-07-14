// app/workspace/[id]/dashboard/TrialBanner.tsx
"use client";

type Props = {
  trialEndAt: string | null;
  isLocked: boolean;
};

export function TrialBanner({ trialEndAt, isLocked }: Props) {
  if (!trialEndAt || isLocked) return null;

  const end = new Date(trialEndAt);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="mb-4 rounded-md border border-yellow-500 bg-yellow-950/40 px-4 py-3 text-sm text-yellow-100">
      <strong className="font-medium">Trial active</strong>{" "}
      — {daysLeft} day{daysLeft !== 1 && "s"} remaining. Upgrade now to avoid losing access.
    </div>
  );
}
