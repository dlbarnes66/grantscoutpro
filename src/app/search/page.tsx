"use client";

import { useState } from "react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs
        items={[
          {
            label: "Search Grants",
          },
        ]}
      />

      <h1 className="mb-6 text-3xl font-bold text-white">
        Search Grants
      </h1>

      <div className="mb-8 flex items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword, category, location..."
        />

        <Button
          variant="primary"
          onClickAction={() => {}}
          icon={undefined}
          className=""
        >
          Search
        </Button>
      </div>

      <Card>
        <h3 className="text-xl font-semibold text-white">
          Example Grant Title
        </h3>

        <p className="mt-2 text-slate-400">
          Short description of the grant opportunity goes here.
        </p>

        <div className="mt-4 flex gap-4">
          <Button
            variant="secondary"
            onClickAction={() => {}}
            icon={undefined}
            className=""
          >
            View Details
          </Button>

          <Button
            variant="primary"
            onClickAction={() => {}}
            icon={undefined}
            className=""
          >
            Save Grant
          </Button>
        </div>
      </Card>
    </div>
  );
}