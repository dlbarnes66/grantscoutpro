import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function useLocationIntelligence(workspaceLocationId) {
  const { data, error, isLoading, mutate } = useSWR(
    workspaceLocationId
      ? `/api/location/intelligence?workspaceLocationId=${workspaceLocationId}`
      : null,
    fetcher
  );

  return {
    intelligence: data,
    loading: isLoading,
    error,
    refresh: async () => {
      await fetch(`/api/location/intelligence`, {
        method: "POST",
        body: JSON.stringify({ workspaceLocationId }),
      });
      mutate();
    },
  };
}
