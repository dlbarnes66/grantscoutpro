"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function GrantComparePage() {
  const params = useParams();
  const id = params?.id as string;

  const [grant, setGrant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/grants/${id}`);
      const data = await res.json();
      setGrant(data.grant);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center">Loading grant…</Card>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center text-red-600">
          Grant not found.
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-brandBlue">{grant.title}</h1>

      <Card className="p-6 space-y-4">
        <p className="text-gray-700">{grant.summary}</p>

        <Button
          onClick={() => {
            const existing = JSON.parse(localStorage.getItem("compare") || "[]");

            if (!existing.includes(grant.id)) {
              existing.push(grant.id);
              localStorage.setItem("compare", JSON.stringify(existing));
            }

            alert("Added to comparison list!");
          }}
          className="px-4 py-2 bg-brandBlue text-white rounded-lg hover:bg-brandGold hover:text-black transition"
        >
          Compare
        </Button>
      </Card>
    </div>
  );
}
