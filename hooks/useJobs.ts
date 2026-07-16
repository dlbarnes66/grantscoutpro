"use client";

import { useEffect, useState } from "react";

export function useJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/jobs");
    const data = await res.json();

    if (res.ok) {
      setJobs(data.jobs || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return { jobs, loading };
}
