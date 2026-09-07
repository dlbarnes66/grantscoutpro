import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// A faulty API route used to test that server-side errors actually
// reach Sentry (sentry.server.config.ts / instrumentation.ts).
// Intentionally unauthenticated and intentionally throws -- this is
// the standard Sentry-generated diagnostic route, not a real feature.
export async function GET() {
  throw new SentryExampleAPIError("This error is raised on the backend called by the example page.");
}
