"use client";

import { useEffect, useState } from "react";

// Shared across the marketing page and the workspace app shell so both
// collapse to a hamburger/drawer at the same breakpoint. Uses matchMedia
// + a listener (not just a one-time check) so rotating a device or
// resizing a window updates the layout without a reload.
//
// Deliberately implemented as plain JS state driving inline styles at
// the call sites, rather than relying on Tailwind's `md:` responsive
// classes for the actual show/hide mechanics - see the long comment at
// the top of src/app/globals.css for why classes in this app have
// historically been unreliable under Tailwind v4's content-detection
// pipeline, especially in bracketed route folders. Tailwind classes are
// still used for cosmetics elsewhere; this hook exists so the parts of
// the layout that must not silently disappear don't depend on that
// pipeline at all.
export function useIsMobile(breakpointPx: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(mql.matches);

    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [breakpointPx]);

  return isMobile;
}
