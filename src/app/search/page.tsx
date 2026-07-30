"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: "Search Grants" }]} />

      <h1 className="text-3xl font-bold text-white mb-6">Search Grants</h1>

      <div className="flex items-center gap-3 mb-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword, category, location..."
        />
        <Button variant="primary">Search</Button>
      </div>

      <Card>
        <h3 className="text-xl font-semibold text-white">
          Example Grant Title
        </h3>
        <p className="text-slate-400 mt-2">
          Short description of the grant opportunity goes here.
        </p>

        <div className="flex gap-4 mt-4">
          <Button variant="secondary">View Details</Button>
          <Button variant="primary">Save Grant</Button>
        </div>
      </Card>
    </div>
  );
}
