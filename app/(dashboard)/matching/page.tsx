"use client";

import GrantMatchingForm from "@/components/GrantMatchingForm";
import GrantMatchingResults from "@/components/GrantMatchingResults";

export default function GrantMatchingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <GrantMatchingForm />
      <GrantMatchingResults />
    </div>
  );
}
