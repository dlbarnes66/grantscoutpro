"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useWorkspaceLocations } from "@/hooks/useWorkspaceLocations";
import LocationIntelligenceCard from "@/components/intelligence/LocationIntelligenceCard";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

function AddLocationForm({
  onAdd,
  saving,
}: {
  onAdd: (input: { city: string; state: string; zip: string; county: string; country: string }) => Promise<boolean>;
  saving: boolean;
}) {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [county, setCounty] = useState("");
  const [open, setOpen] = useState(false);

  const canSubmit = city.trim().length > 0 && state.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const ok = await onAdd({
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      county: county.trim(),
      country: "USA",
    });

    if (ok) {
      setCity("");
      setState("");
      setZip("");
      setCounty("");
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:border-white/[0.2]"
      >
        <Plus size={14} /> Add Location
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[12px] text-slate-400">City *</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full rounded-md border border-white/[0.1] bg-[#0A1A2F] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
            placeholder="Mobile"
          />
        </div>

        <div>
          <label className="mb-1 block text-[12px] text-slate-400">State *</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="w-full rounded-md border border-white/[0.1] bg-[#0A1A2F] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
          >
            <option value="">Select</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[12px] text-slate-400">ZIP</label>
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="w-full rounded-md border border-white/[0.1] bg-[#0A1A2F] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
            placeholder="36601"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[12px] text-slate-400">County</label>
        <input
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          className="w-full max-w-xs rounded-md border border-white/[0.1] bg-[#0A1A2F] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
          placeholder="Mobile County"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={!canSubmit || saving}
          className="flex items-center gap-2 rounded-md bg-[#00E5FF] px-4 py-2 text-[13px] font-semibold text-[#06131F] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Saving..." : "Save Location"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-4 py-2 text-[13px] text-slate-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function WorkspaceIntelligencePage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const { locations, loading, saving, error, addLocation, removeLocation } =
    useWorkspaceLocations(workspaceId);

  return (
    <WorkspaceShell title="Location Intelligence" workspaceId={workspaceId}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Location Intelligence Dashboard</h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Add every city or county your organization operates in - grant matching and
            demographic insights are calculated per location, not just one.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <AddLocationForm onAdd={addLocation} saving={saving} />
        {error && <p className="mt-2 text-[13px] text-red-400">{error}</p>}
      </div>

      {loading && <div className="text-slate-400">Loading workspace locations…</div>}

      {!loading && locations.length === 0 && (
        <div className="text-slate-400">
          No locations yet. Add your first one above to start seeing demographic and
          opportunity-zone insights for it.
        </div>
      )}

      {!loading && locations.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {locations.map((location) => (
            <LocationIntelligenceCard
              key={location.id}
              location={location}
              onDelete={removeLocation}
            />
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}
