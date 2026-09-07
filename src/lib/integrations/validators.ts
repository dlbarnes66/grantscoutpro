// src/lib/integrations/validators.ts
//
// Real, live "does this key actually work" checks - one per provider
// that supports a simple pasted key (see hasLiveValidation in
// providers.ts). Each function makes one lightweight, read-only call
// against that provider's own API using the credentials the client
// just entered, and never persists anything itself; the integrations
// route decides what to do with the result.
//
// Every provider not listed in VALIDATORS below either requires OAuth
// (not applicable) or is a simple-key provider we haven't wired a
// live check for yet - those are saved as-is with status "saved".

export type ValidationResult = { ok: boolean; message?: string };

type Values = Record<string, string>;

async function safeFetch(
  url: string,
  init: RequestInit,
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function validateSlack(values: Values): Promise<ValidationResult> {
  const res = await safeFetch("https://slack.com/api/auth.test", {
    method: "POST",
    headers: { Authorization: `Bearer ${values.botToken}` },
  });
  const json = await res.json().catch(() => ({}));
  if (json.ok) return { ok: true };
  return { ok: false, message: json.error || "Slack rejected this token." };
}

async function validateStripe(values: Values): Promise<ValidationResult> {
  const res = await safeFetch("https://api.stripe.com/v1/balance", {
    headers: { Authorization: `Bearer ${values.secretKey}` },
  });
  if (res.ok) return { ok: true };
  const json = await res.json().catch(() => ({}));
  return { ok: false, message: json?.error?.message || `Stripe returned ${res.status}.` };
}

async function validateAirtable(values: Values): Promise<ValidationResult> {
  const res = await safeFetch("https://api.airtable.com/v0/meta/whoami", {
    headers: { Authorization: `Bearer ${values.personalAccessToken}` },
  });
  if (res.ok) return { ok: true };
  return { ok: false, message: `Airtable returned ${res.status}. Check the token and its scopes.` };
}

async function validateTrello(values: Values): Promise<ValidationResult> {
  const url = `https://api.trello.com/1/members/me?key=${encodeURIComponent(
    values.apiKey
  )}&token=${encodeURIComponent(values.token)}`;
  const res = await safeFetch(url, {});
  if (res.ok) return { ok: true };
  return { ok: false, message: `Trello returned ${res.status}. Check the key and token.` };
}

async function validateAsana(values: Values): Promise<ValidationResult> {
  const res = await safeFetch("https://app.asana.com/api/1.0/users/me", {
    headers: { Authorization: `Bearer ${values.personalAccessToken}` },
  });
  if (res.ok) return { ok: true };
  return { ok: false, message: `Asana returned ${res.status}.` };
}

async function validateClickUp(values: Values): Promise<ValidationResult> {
  const res = await safeFetch("https://api.clickup.com/api/v2/user", {
    headers: { Authorization: values.apiToken },
  });
  if (res.ok) return { ok: true };
  return { ok: false, message: `ClickUp returned ${res.status}.` };
}

async function validateMonday(values: Values): Promise<ValidationResult> {
  const res = await safeFetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: values.apiToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: "query { me { id } }" }),
  });
  const json = await res.json().catch(() => ({}));
  if (res.ok && json?.data?.me?.id) return { ok: true };
  return { ok: false, message: json?.errors?.[0]?.message || `Monday.com returned ${res.status}.` };
}

async function validateCalendly(values: Values): Promise<ValidationResult> {
  const res = await safeFetch("https://api.calendly.com/users/me", {
    headers: { Authorization: `Bearer ${values.personalAccessToken}` },
  });
  if (res.ok) return { ok: true };
  return { ok: false, message: `Calendly returned ${res.status}.` };
}

async function validateTypeform(values: Values): Promise<ValidationResult> {
  const res = await safeFetch("https://api.typeform.com/me", {
    headers: { Authorization: `Bearer ${values.personalAccessToken}` },
  });
  if (res.ok) return { ok: true };
  return { ok: false, message: `Typeform returned ${res.status}.` };
}

async function validateDropbox(values: Values): Promise<ValidationResult> {
  const res = await safeFetch("https://api.dropboxapi.com/2/users/get_current_account", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${values.accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (res.ok) return { ok: true };
  return { ok: false, message: `Dropbox returned ${res.status}.` };
}

async function validatePaypal(values: Values): Promise<ValidationResult> {
  const host =
    values.environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const basicAuth = Buffer.from(`${values.clientId}:${values.clientSecret}`).toString("base64");

  const res = await safeFetch(`${host}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (res.ok) return { ok: true };
  const json = await res.json().catch(() => ({}));
  return {
    ok: false,
    message: json?.error_description || `PayPal returned ${res.status}.`,
  };
}

export const VALIDATORS: Record<string, (values: Values) => Promise<ValidationResult>> = {
  slack: validateSlack,
  stripe: validateStripe,
  airtable: validateAirtable,
  trello: validateTrello,
  asana: validateAsana,
  clickup: validateClickUp,
  monday: validateMonday,
  calendly: validateCalendly,
  typeform: validateTypeform,
  dropbox: validateDropbox,
  paypal: validatePaypal,
};

export async function validateProvider(
  providerId: string,
  values: Values
): Promise<ValidationResult | null> {
  const fn = VALIDATORS[providerId];
  if (!fn) return null;

  try {
    return await fn(values);
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { ok: false, message: "Timed out reaching the provider. Please try again." };
    }
    return { ok: false, message: err?.message || "Could not reach the provider to verify this key." };
  }
}
