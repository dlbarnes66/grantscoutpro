"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useEffect, useState } from "react";
import { Loader2, Ban } from "lucide-react";

interface PilotOrg {
  id: string;
  name: string;
  tier: string | null;
  pilotTier: string | null;
  pilotStart: string | null;
  pilotEndsAt: string | null;
  users: { id: string; email: string | null; name: string | null }[];
}

const TIER_OPTIONS = ["basic", "team", "business", "enterprise"];

function daysRemaining(endsAt: string | null): number | null {
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export default function AdminPilotsPage() {
  const [orgs, setOrgs] = useState<PilotOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("business");
  const [durationDays, setDurationDays] = useState("60");
  const [granting, setGranting] = useState(false);
  const [endingId, setEndingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pilot");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setOrgs(Array.isArray(json.orgs) ? json.orgs : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load pilots");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setGranting(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tier, durationDays: Number(durationDays) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to grant pilot");
      setNotice(`${email.trim()} is now on a ${tier} pilot for ${durationDays} days.`);
      setEmail("");
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to grant pilot");
    } finally {
      setGranting(false);
    }
  }

  async function handleEnd(orgId: string) {
    if (!confirm("End this pilot now? The account reverts to its normal tier immediately.")) return;
    setEndingId(orgId);
    setError(null);
    try {
      const res = await fetch("/api/admin/pilot", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to end pilot");
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to end pilot");
    } finally {
      setEndingId(null);
    }
  }

  const inputClass =
    "rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50";

  return (
    <div className="min-h-screen bg-[#0A1A2F] p-6 text-white">
      <h1 className="text-2xl font-bold">Pilot Program</h1>
      <p className="mt-1 text-[13px] text-slate-400">
        Grant a client free access to a plan tier for a fixed number of days, no Stripe charge involved. Their
        account automatically reverts to its normal tier the moment the pilot ends - nothing to remember. They see an
        in-app warning starting 10 days before it ends.
      </p>

      {error && <p className="mt-4 text-[13px] text-red-400">{error}</p>}
      {notice && <p className="mt-4 text-[13px] text-emerald-400">{notice}</p>}

      <form onSubmit={handleGrant} className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-white/[0.08] p-4">
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-slate-400">Client email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@nonprofit.org"
            className={`${inputClass} w-64`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-slate-400">Tier</label>
          <select value={tier} onChange={(e) => setTier(e.target.value)} className={inputClass}>
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-slate-400">Duration (days)</label>
          <input
            type="number"
            min={1}
            max={365}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className={`${inputClass} w-24`}
          />
        </div>
        <button
          type="submit"
          disabled={granting}
          className="rounded-md bg-[#00E5FF] px-4 py-2 text-[13px] font-medium text-[#0A1A2F] disabled:opacity-50"
        >
          {granting ? "Granting..." : "Grant Pilot"}
        </button>
        <p className="w-full text-[12px] text-slate-500">
          The client must already have a Grant Scout Pro account (they sign up free at grantscoutpro.com/sign-up) -
          this just upgrades their existing account.
        </p>
      </form>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-white/[0.08]">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-slate-400">
                <th className="px-3 py-2 font-medium">Org</th>
                <th className="px-3 py-2 font-medium">Owner Email</th>
                <th className="px-3 py-2 font-medium">Pilot Tier</th>
                <th className="px-3 py-2 font-medium">Started</th>
                <th className="px-3 py-2 font-medium">Ends</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => {
                const remaining = daysRemaining(org.pilotEndsAt);
                const active = remaining !== null && remaining > 0;
                return (
                  <tr key={org.id} className="border-b border-white/[0.05] last:border-0">
                    <td className="px-3 py-2">{org.name}</td>
                    <td className="px-3 py-2 text-slate-400">{org.users[0]?.email || "—"}</td>
                    <td className="px-3 py-2 capitalize">{org.pilotTier}</td>
                    <td className="px-3 py-2 text-slate-400">
                      {org.pilotStart ? new Date(org.pilotStart).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {org.pilotEndsAt ? new Date(org.pilotEndsAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {active ? (
                        <span className={remaining! <= 10 ? "text-amber-400" : "text-emerald-400"}>
                          {remaining} day{remaining === 1 ? "" : "s"} left
                        </span>
                      ) : (
                        <span className="text-slate-500">Ended</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {active && (
                        <button
                          onClick={() => handleEnd(org.id)}
                          disabled={endingId === org.id}
                          title="End pilot now"
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          <Ban size={14} /> End
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {orgs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No pilots granted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
