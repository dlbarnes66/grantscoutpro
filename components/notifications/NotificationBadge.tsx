"use client";

export default function NotificationBadge({ count }: { count: number }) {
  return (
    <div className="relative">
      <span className="material-icons text-slate-300">notifications</span>

      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
          {count}
        </span>
      )}
    </div>
  );
}
