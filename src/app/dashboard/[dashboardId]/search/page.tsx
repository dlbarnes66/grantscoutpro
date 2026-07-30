"use client";

import { useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { GrantList } from "./components/GrantList";

export default function GrantSearchPage({ params }: { params: { workspaceId: string } }) {
  const [grants, setGrants] = useState<any[]>([]);

  async function handleSearch(query: string) {
    const res = await fetch(`/api/search/${params.id}?q=${query}`);
    const data = await res.json();
    setGrants(data);
  }

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <GrantList grants={grants} />
    </div>
  );
}
