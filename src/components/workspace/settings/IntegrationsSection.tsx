"use client";

import { useEffect, useState } from "react";

type ProviderField = {
  key: string;
  label: string;
  placeholder?: string;
  secret: boolean;
  type: "text" | "select";
  options?: string[];
};

type Connection = {
  status: "saved" | "connected" | "invalid";
  lastCheckedAt: string | null;
  lastError: string | null;
  maskedValues: Record<string, string> | null;
};

type ProviderRow = {
  id: string;
  name: string;
  category: string;
  authType: "api_key" | "oauth";
  hasLiveValidation: boolean;
  fields: ProviderField[];
  docsUrl?: string;
  helpText?: string;
  connection: Connection | null;
};

function StatusBadge({ provider }: { provider: ProviderRow }) {
  if (provider.authType === "oauth") {
    return (
      <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
        Coming soon
      </span>
    );
  }

  const status = provider.connection?.status;

  if (status === "connected") {
    return (
      <span className="rounded-full bg-emerald-900/60 px-3 py-1 text-xs font-medium text-emerald-300">
        Connected
      </span>
    );
  }
  if (status === "invalid") {
    return (
      <span className="rounded-full bg-red-900/60 px-3 py-1 text-xs font-medium text-red-300">
        Key rejected
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="rounded-full bg-amber-900/60 px-3 py-1 text-xs font-medium text-amber-300">
        Saved (unverified)
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
      Not connected
    </span>
  );
}

function ProviderCard({
  provider,
  workspaceId,
  onChanged,
}: {
  provider: ProviderRow;
  workspaceId: string;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider.id, values }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      setOpen(false);
      setValues({});
      onChanged();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm(`Remove your saved ${provider.name} key from this workspace?`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/integrations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to disconnect");
      onChanged();
    } catch (err: any) {
      setError(err.message || "Failed to disconnect");
    } finally {
      setSaving(false);
    }
  };

  const isOauth = provider.authType === "oauth";

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{provider.name}</p>
          {provider.connection?.status === "invalid" && provider.connection.lastError && (
            <p className="mt-1 text-xs text-red-300">{provider.connection.lastError}</p>
          )}
          {provider.helpText && !provider.connection && (
            <p className="mt-1 text-xs text-slate-400">{provider.helpText}</p>
          )}
        </div>
        <StatusBadge provider={provider} />
      </div>

      {!isOauth && (
        <div className="mt-3">
          {provider.connection?.maskedValues && !open && (
            <div className="mb-2 flex flex-wrap gap-2 text-xs text-slate-400">
              {provider.fields.map((f) => (
                <span key={f.key} className="rounded bg-slate-900 px-2 py-1">
                  {f.label}: {provider.connection?.maskedValues?.[f.key] || "—"}
                </span>
              ))}
            </div>
          )}

          {open ? (
            <div className="space-y-2">
              {provider.fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      value={values[field.key] || field.options?.[0] || ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
                    >
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.secret ? "password" : "text"}
                      value={values[field.key] || ""}
                      placeholder={field.placeholder}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                    />
                  )}
                </div>
              ))}

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded bg-[#F5C542] px-3 py-1.5 text-sm font-semibold text-[#071633] disabled:opacity-50"
                >
                  {saving ? "Saving..." : provider.hasLiveValidation ? "Save & Verify" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                  }}
                  className="rounded border border-slate-600 px-3 py-1.5 text-sm text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-400"
              >
                {provider.connection ? "Update Key" : "Connect"}
              </button>
              {provider.connection && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={saving}
                  className="text-sm text-red-400 hover:underline disabled:opacity-50"
                >
                  Disconnect
                </button>
              )}
              {provider.docsUrl && (
                <a
                  href={provider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Where do I get this?
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {isOauth && (
        <p className="mt-3 text-xs text-slate-500">
          Requires an OAuth login, not a pasted key — not available yet.
        </p>
      )}
    </div>
  );
}

export default function IntegrationsSection({ workspaceId }: { workspaceId: string }) {
  const [providers, setProviders] = useState<ProviderRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/integrations`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load integrations");
      setProviders(json.providers);
    } catch (err: any) {
      setError(err.message || "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  if (loading) return <p className="text-sm text-slate-400">Loading integrations...</p>;
  if (error)
    return (
      <div className="rounded border border-red-800 bg-red-950/50 p-3 text-sm text-red-300">{error}</div>
    );
  if (!providers) return null;

  const byCategory = new Map<string, ProviderRow[]>();
  for (const p of providers) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category)!.push(p);
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-400">
        Bring your own API keys — everything here stays scoped to this workspace and is encrypted
        before it's stored. Only workspace owners and admins can view or change these.
      </p>

      {Array.from(byCategory.entries()).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{category}</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                workspaceId={workspaceId}
                onChanged={load}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
