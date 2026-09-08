"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { HelpCircle, X, Send, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content: "Hi! Ask me how to do something in Grant Scout Pro - I can explain any page or feature.",
};

// Maps a pathname to the page-context key the help endpoint understands
// (src/lib/ai/helpAssistant.ts PAGE_GUIDANCE), so answers can reference
// what's actually on screen without the widget needing per-page wiring.
function pageKeyFromPathname(pathname: string): string {
  if (/\/crm(\/|$)/.test(pathname)) return "crm";
  if (/\/grants\/.*\/negotiation/.test(pathname)) return "negotiation";
  if (/\/grants(\/|$)/.test(pathname)) return "grants";
  if (/\/documents(\/|$)/.test(pathname)) return "documents";
  if (/\/workspace-billing(\/|$)/.test(pathname)) return "billing";
  if (/\/settings(\/|$)/.test(pathname)) return "settings";
  if (/\/activity(\/|$)/.test(pathname)) return "activity";
  if (/\/search(\/|$)/.test(pathname)) return "search";
  if (/\/(insights|intelligence)(\/|$)/.test(pathname)) return "insights";
  if (/\/workspace\/[^/]+\/?$/.test(pathname)) return "dashboard";
  return "general";
}

export default function WorkspaceHelpChatWidget({ workspaceId }: { workspaceId: string }) {
  const pathname = usePathname() || "";
  const page = pageKeyFromPathname(pathname);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Rendered via a portal straight onto document.body (see the return
  // statement below) so this floating widget's `fixed` positioning can
  // never be hijacked by an ancestor further up the tree (a transform,
  // filter, or backdrop-blur anywhere between here and <body> would
  // otherwise quietly turn "fixed" into "fixed relative to that
  // ancestor" per the CSS spec, which is exactly the kind of thing that
  // can land this in the wrong corner of the screen). Portals need
  // `document` to exist, so it only renders client-side after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/chat/help`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, page }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 flex h-[460px] w-[340px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B1B33] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <span className="text-[14px] font-semibold text-white">How can I help?</span>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white" aria-label="Close chat">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-snug ${
                  m.role === "user"
                    ? "self-end bg-[#00E5FF] text-[#06131F]"
                    : "self-start bg-white/[0.06] text-slate-200"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 self-start text-[12px] text-slate-500">
                <Loader2 size={12} className="animate-spin" /> Thinking...
              </div>
            )}
            {error && <div className="text-[12px] text-red-400">{error}</div>}
          </div>

          <div className="flex gap-2 border-t border-white/[0.08] p-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask how to do something..."
              className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="flex w-9 items-center justify-center rounded-md bg-[#00E5FF] text-[#06131F] disabled:opacity-50"
              aria-label="Send"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={`ml-auto flex h-13 w-13 items-center justify-center rounded-full bg-[#00E5FF] text-[#06131F] shadow-xl transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-30 hover:opacity-100 focus:opacity-100"
        }`}
        style={{ width: 52, height: 52 }}
        aria-label={open ? "Close help" : "Open help"}
      >
        {open ? <X size={20} /> : <HelpCircle size={20} />}
      </button>
    </div>,
    document.body
  );
}
