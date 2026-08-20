import useSWRMutation from "swr/mutation";

async function sendRequest(url: string, { arg }: any) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  });
  return res.json();
}

export function useGrantSearch() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "/api/grants/search",
    sendRequest
  );

  return {
    search: trigger,
    results: data,
    loading: isMutating,
    error,
  };
}
