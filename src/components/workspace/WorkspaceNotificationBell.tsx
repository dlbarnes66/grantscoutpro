"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// A grant_match notification's type is "grant_match:<grantId>" (see
// src/lib/grants/runGrantScan.ts) so the grant it's about can be found
// without a separate join - this parses that back out.
function grantIdFromType(type: string): string | null {
  const match = type.match(/^grant_match:(.+)$/);
  return match ? match[1] : null;
}

export default function WorkspaceNotificationBell({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function loadUnreadCount() {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/notifications/unread-count`);
      const data = await res.json();
      if (res.ok) setUnread(data.unread || 0);
    } catch {
      // best-effort - the bell just won't show a badge
    }
  }

  async function loadList() {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/notifications/list`);
      const data = await res.json();
      if (res.ok) setNotifications((data.notifications || []).slice(0, 15));
    } catch {
      // best-effort
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!workspaceId) return;
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      await loadList();
      if (unread > 0) {
        fetch(`/api/workspaces/${workspaceId}/notifications/mark-read`, { method: "POST" }).catch(() => {});
        setUnread(0);
      }
    }
  }

  function handleClickNotification(n: Notification) {
    const grantId = grantIdFromType(n.type);
    setOpen(false);
    if (grantId) {
      router.push(`/workspace/${workspaceId}/grants/${grantId}`);
    } else {
      router.push(`/workspace/${workspaceId}/notifications`);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#00E5FF] px-1 text-[10px] font-semibold text-[#06131F]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B1B33] shadow-2xl">
          <div className="border-b border-white/[0.08] px-4 py-3">
            <span className="text-[13px] font-semibold text-white">Notifications</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && <p className="px-4 py-4 text-[12.5px] text-slate-500">Loading...</p>}
            {!loading && notifications.length === 0 && (
              <p className="px-4 py-4 text-[12.5px] text-slate-500">No notifications yet.</p>
            )}
            {!loading &&
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className="block w-full min-w-0 border-b border-white/[0.04] px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <p className="whitespace-normal break-words text-[12.5px] leading-snug text-slate-200">{n.message}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
                </button>
              ))}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              router.push(`/workspace/${workspaceId}/notifications`);
            }}
            className="block w-full py-2 text-center text-[12.5px] text-[#00E5FF] hover:bg-white/[0.04]"
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
}
