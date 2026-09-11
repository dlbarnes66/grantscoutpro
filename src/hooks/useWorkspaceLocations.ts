"use client";

import { useCallback, useEffect, useState } from "react";
import { WorkspaceLocation } from "@/types/workspace";

export interface NewWorkspaceLocationInput {
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  country?: string;
  timezone?: string;
}

interface UseWorkspaceLocationsResult {
  locations: WorkspaceLocation[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addLocation: (input: NewWorkspaceLocationInput) => Promise<boolean>;
  removeLocation: (id: string) => Promise<boolean>;
}

// Organizations can (and often do) operate in more than one place - a
// nonprofit with a home office plus program sites in other counties or
// states, for example. The API (/api/workspace/[workspaceId]/locations)
// has always supported a full list; this hook used to only ever hand back
// the first one, which is why the Location Intelligence page had nowhere
// to add a second (or third) location.
export function useWorkspaceLocations(
  workspaceId: string
): UseWorkspaceLocationsResult {
  const [locations, setLocations] = useState<WorkspaceLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspace/${workspaceId}/locations`);

      if (!res.ok) {
        setLocations([]);
      } else {
        const data = await res.json();
        setLocations(Array.isArray(data.locations) ? data.locations : []);
      }
    } catch {
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      fetchLocations();
    }
  }, [workspaceId, fetchLocations]);

  const addLocation = useCallback(
    async (input: NewWorkspaceLocationInput) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`/api/workspace/${workspaceId}/locations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Failed to add location.");
          return false;
        }

        await fetchLocations();
        return true;
      } catch {
        setError("Failed to add location.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [workspaceId, fetchLocations]
  );

  const removeLocation = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const res = await fetch(`/api/workspace/${workspaceId}/locations`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Failed to remove location.");
          return false;
        }

        setLocations((prev) => prev.filter((loc) => loc.id !== id));
        return true;
      } catch {
        setError("Failed to remove location.");
        return false;
      }
    },
    [workspaceId]
  );

  return {
    locations,
    loading,
    saving,
    error,
    refresh: fetchLocations,
    addLocation,
    removeLocation,
  };
}
