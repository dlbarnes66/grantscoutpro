// Backup instrumentation file — no Sentry config loaded

export async function register() {
  // Prevent Next.js build errors by keeping this file valid
  // but without importing missing Sentry config files.

  if (process.env.NEXT_RUNTIME === "nodejs") {
    // No-op for backup
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // No-op for backup
  }
}
