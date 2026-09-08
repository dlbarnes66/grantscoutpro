"use client"

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Suspense } from "react";
import ComparePageInner from "./ComparePageInner";

export default function ComparePage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <ComparePageInner />
    </Suspense>
  );
}
