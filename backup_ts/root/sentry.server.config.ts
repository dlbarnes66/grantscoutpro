import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c9f64a144feec63d384b13badcba72ad@o4511588676272128.ingest.us.sentry.io/4511588705959936",
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,

  integrations(integrations) {
    // Remove Redis instrumentation — this is what breaks BullMQ
    return integrations.filter((integration) => integration.name !== "Redis");
  },
});
