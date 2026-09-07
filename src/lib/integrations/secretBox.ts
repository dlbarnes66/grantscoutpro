// src/lib/integrations/secretBox.ts
//
// Encrypts/decrypts the third-party API keys clients paste into their
// own workspace's Integrations settings (see WorkspaceIntegration in
// prisma/schema.prisma). These are live credentials to services like
// Stripe and Slack, so they're never written to the database in
// plaintext - only this module's AES-256-GCM ciphertext is stored.
//
// Requires INTEGRATION_ENCRYPTION_KEY in the environment: a long
// random secret (e.g. `openssl rand -hex 32`). Deliberately fails
// closed - if that var isn't set, we throw rather than silently
// falling back to storing plaintext.

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY is not set. Generate one with `openssl rand -hex 32` " +
        "and add it to your environment before saving any integration credentials."
    );
  }
  // Derive a 32-byte key regardless of the secret's own length/format.
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts an arbitrary JSON-serializable value (typically the field
 * values a provider's form collected, e.g. { apiKey: "sk_live_..." })
 * into a single base64 string safe to store in the database.
 */
export function encryptJson(value: unknown): string {
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

/**
 * Reverses encryptJson. Throws if the payload was tampered with, is
 * corrupt, or was encrypted under a different INTEGRATION_ENCRYPTION_KEY.
 */
export function decryptJson<T = Record<string, string>>(payload: string): T {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, IV_LENGTH);
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}

/**
 * A safe-to-display hint for a stored secret field, e.g. "••••••wxyz" -
 * so the UI can show a key is saved without ever re-sending the real
 * value to the browser.
 */
export function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `••••${value.slice(-4)}`;
}
