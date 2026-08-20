"use client";

import { useEffect, useState } from "react";
import { WorkspaceLocation } from "@/types/workspace";

interface UseWorkspaceLocationsResult {
  location: WorkspaceLocation | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useWorkspaceLocations(
  workspaceId: string
): UseWorkspaceLocationsResult {
  const [location, setLocation] = useState<WorkspaceLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspace/${workspaceId}/locations`);

      if (!res.ok) {
        setLocation(null);
      } else {
        const data = await res.json();

        // Single primary location: take the first from the array
        const first = data.locations?.[0] ?? null;
        setLocation(first);
      }
    } catch {
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchLocations();
    }
  }, [workspaceId]);

  return {
    location,
    loading,
    refresh: fetchLocations,
  };
}
