"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, X, Loader2, Trash2 } from "lucide-react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  title: string | null;
  createdAt: string;
  _count?: { deals: number; notes: number };
}

export default function CrmContactsPage() {
  const { workspaceId } = useParams() as { workspaceId: string };

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/contacts?workspaceId=${workspaceId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load contacts");
      setContacts(json.contacts || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (workspaceId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  async function removeContact(id: string) {
    if (!confirm("Delete this contact? This can't be undone.")) return;
    try {
      const res = await fetch(`/api/crm/contacts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete contact");
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to delete contact");
    }
  }

  return (
    <WorkspaceShell title="Contacts" workspaceId={workspaceId}>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[13px] text-slate-500">
          People at funders and donor organizations you're building relationships with.
        </p>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-3 py-1.5 text-[13px] font-medium text-[#06131F] transition-opacity hover:opacity-90"
        >
          <Plus size={14} />
          New Contact
        </button>
      </div>

      {error && <p className="mb-4 text-[13px] text-red-400">{error}</p>}

      {loading ? (
        <p className="text-[13px] text-slate-500">Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[13px] text-slate-500">No contacts yet. Add your first one above.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-white/[0.06]">
            {contacts.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-white">{c.name}</p>
                  <p className="truncate text-[12px] text-slate-500">
                    {[c.title, c.organization].filter(Boolean).join(" @ ") || "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  {c.email && <span className="hidden text-[12.5px] text-slate-400 sm:inline">{c.email}</span>}
                  {!!c._count?.deals && (
                    <span className="text-[11.5px] text-slate-500">{c._count.deals} deal{c._count.deals === 1 ? "" : "s"}</span>
                  )}
                  <button
                    onClick={() => removeContact(c.id)}
                    className="text-slate-500 hover:text-red-400"
                    aria-label="Delete contact"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {showNew && (
        <NewContactModal
          workspaceId={workspaceId}
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            load();
          }}
        />
      )}
    </WorkspaceShell>
  );
}

function NewContactModal({
  workspaceId,
  onClose,
  onCreated,
}: {
  workspaceId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          organization: organization.trim() || undefined,
          title: title.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create contact");
      onCreated();
    } catch (err: any) {
      setError(err?.message || "Failed to create contact");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#0B1B33] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">New Contact</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] text-slate-400">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] text-slate-400">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-slate-400">Organization</label>
              <input
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] text-slate-400">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-slate-400">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
              />
            </div>
          </div>

          {error && <p className="text-[12.5px] text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-md px-3 py-1.5 text-[13px] text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-3 py-1.5 text-[13px] font-medium text-[#06131F] disabled:opacity-50"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Create Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
