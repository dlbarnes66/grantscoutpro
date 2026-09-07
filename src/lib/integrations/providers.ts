// src/lib/integrations/providers.ts
//
// The full integrations catalog shown in Settings > Integrations,
// grouped the same way as the public /integrations marketing page.
// This is the single source of truth for what fields each provider's
// "bring your own API key" form asks for, and whether we can actually
// call that provider's API to confirm a saved key works.
//
// authType:
//   "api_key" - the provider issues a static token/key a client can
//               paste in directly. We can store (and often verify)
//               these ourselves.
//   "oauth"   - the provider requires an interactive OAuth login
//               (Google, Microsoft, QuickBooks, DocuSign, Salesforce,
//               etc.) that can't be satisfied by pasting a key. These
//               show as "Coming soon" until we build a real OAuth flow
//               for that specific provider.
//
// hasLiveValidation: true means src/lib/integrations/validators.ts has
// a real function that calls the provider's API to confirm the saved
// credentials work. False means the key is stored but its status stays
// "saved" (untested) until that provider gets a validator.

export type ProviderField = {
  key: string;
  label: string;
  placeholder?: string;
  secret?: boolean; // rendered as a password input, masked once saved
  type?: "text" | "select";
  options?: string[];
};

export type Provider = {
  id: string;
  name: string;
  category: string;
  authType: "api_key" | "oauth";
  hasLiveValidation: boolean;
  fields: ProviderField[];
  docsUrl?: string;
  helpText?: string;
};

export const CATEGORIES = [
  "Communications",
  "Project Management",
  "Document Management",
  "Productivity & Office",
  "Calendar & Scheduling",
  "E-Signature",
  "Forms & Data",
  "Accounting",
  "HR",
  "Fundraising & Donor Management",
  "Payments",
] as const;

export const PROVIDERS: Provider[] = [
  // Communications
  {
    id: "slack",
    name: "Slack",
    category: "Communications",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [
      {
        key: "botToken",
        label: "Bot User OAuth Token",
        placeholder: "xoxb-...",
        secret: true,
      },
    ],
    docsUrl: "https://api.slack.com/apps",
    helpText: "Create a Slack app, add a bot token scope, and install it to your workspace to get this token.",
  },
  { id: "msteams", name: "Microsoft Teams", category: "Communications", authType: "oauth", hasLiveValidation: false, fields: [] },
  { id: "gmail", name: "Gmail", category: "Communications", authType: "oauth", hasLiveValidation: false, fields: [] },
  { id: "outlook-mail", name: "Outlook", category: "Communications", authType: "oauth", hasLiveValidation: false, fields: [] },

  // Project Management
  {
    id: "asana",
    name: "Asana",
    category: "Project Management",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [{ key: "personalAccessToken", label: "Personal Access Token", secret: true }],
    docsUrl: "https://app.asana.com/0/my-apps",
  },
  {
    id: "monday",
    name: "Monday.com",
    category: "Project Management",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [{ key: "apiToken", label: "API Token", secret: true }],
    docsUrl: "https://developer.monday.com/api-reference/docs/authentication",
  },
  {
    id: "trello",
    name: "Trello",
    category: "Project Management",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [
      { key: "apiKey", label: "API Key" },
      { key: "token", label: "Token", secret: true },
    ],
    docsUrl: "https://trello.com/power-ups/admin",
  },
  {
    id: "clickup",
    name: "ClickUp",
    category: "Project Management",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [{ key: "apiToken", label: "API Token", placeholder: "pk_...", secret: true }],
    docsUrl: "https://app.clickup.com/settings/apps",
  },

  // Document Management
  { id: "google-drive", name: "Google Drive", category: "Document Management", authType: "oauth", hasLiveValidation: false, fields: [] },
  {
    id: "dropbox",
    name: "Dropbox",
    category: "Document Management",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [{ key: "accessToken", label: "Access Token", secret: true }],
    docsUrl: "https://www.dropbox.com/developers/apps",
    helpText: "Generate an access token for your own account from the App Console.",
  },
  { id: "onedrive", name: "Microsoft OneDrive", category: "Document Management", authType: "oauth", hasLiveValidation: false, fields: [] },
  { id: "box", name: "Box", category: "Document Management", authType: "oauth", hasLiveValidation: false, fields: [] },

  // Productivity & Office
  { id: "google-workspace", name: "Google Workspace", category: "Productivity & Office", authType: "oauth", hasLiveValidation: false, fields: [] },
  { id: "microsoft-365", name: "Microsoft 365", category: "Productivity & Office", authType: "oauth", hasLiveValidation: false, fields: [] },

  // Calendar & Scheduling
  { id: "google-calendar", name: "Google Calendar", category: "Calendar & Scheduling", authType: "oauth", hasLiveValidation: false, fields: [] },
  { id: "outlook-calendar", name: "Outlook Calendar", category: "Calendar & Scheduling", authType: "oauth", hasLiveValidation: false, fields: [] },
  {
    id: "calendly",
    name: "Calendly",
    category: "Calendar & Scheduling",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [{ key: "personalAccessToken", label: "Personal Access Token", secret: true }],
    docsUrl: "https://calendly.com/integrations/api_webhooks",
  },

  // E-Signature
  { id: "docusign", name: "DocuSign", category: "E-Signature", authType: "oauth", hasLiveValidation: false, fields: [] },
  { id: "adobe-sign", name: "Adobe Acrobat Sign", category: "E-Signature", authType: "oauth", hasLiveValidation: false, fields: [] },
  {
    id: "dropbox-sign",
    name: "Dropbox Sign",
    category: "E-Signature",
    authType: "api_key",
    hasLiveValidation: false,
    fields: [{ key: "apiKey", label: "API Key", secret: true }],
    docsUrl: "https://app.hellosign.com/home/myAccount#api",
    helpText: "We'll save this key, but haven't wired up live verification for it yet.",
  },

  // Forms & Data
  { id: "google-forms", name: "Google Forms", category: "Forms & Data", authType: "oauth", hasLiveValidation: false, fields: [] },
  {
    id: "typeform",
    name: "Typeform",
    category: "Forms & Data",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [{ key: "personalAccessToken", label: "Personal Access Token", secret: true }],
    docsUrl: "https://admin.typeform.com/account#/section/tokens",
  },
  {
    id: "jotform",
    name: "Jotform",
    category: "Forms & Data",
    authType: "api_key",
    hasLiveValidation: false,
    fields: [{ key: "apiKey", label: "API Key", secret: true }],
    docsUrl: "https://www.jotform.com/myaccount/api",
    helpText: "We'll save this key, but haven't wired up live verification for it yet.",
  },
  {
    id: "airtable",
    name: "Airtable",
    category: "Forms & Data",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [{ key: "personalAccessToken", label: "Personal Access Token", secret: true }],
    docsUrl: "https://airtable.com/create/tokens",
  },

  // Accounting
  { id: "quickbooks", name: "QuickBooks Online", category: "Accounting", authType: "oauth", hasLiveValidation: false, fields: [] },
  { id: "xero", name: "Xero", category: "Accounting", authType: "oauth", hasLiveValidation: false, fields: [] },
  { id: "sage-intacct", name: "Sage Intacct", category: "Accounting", authType: "oauth", hasLiveValidation: false, fields: [] },

  // HR
  { id: "gusto", name: "Gusto", category: "HR", authType: "oauth", hasLiveValidation: false, fields: [] },
  {
    id: "bamboohr",
    name: "BambooHR",
    category: "HR",
    authType: "api_key",
    hasLiveValidation: false,
    fields: [
      { key: "subdomain", label: "Company Subdomain", placeholder: "yourcompany" },
      { key: "apiKey", label: "API Key", secret: true },
    ],
    docsUrl: "https://www.bamboohr.com/resources/api-documentation",
    helpText: "We'll save this key, but haven't wired up live verification for it yet.",
  },
  { id: "rippling", name: "Rippling", category: "HR", authType: "oauth", hasLiveValidation: false, fields: [] },

  // Fundraising & Donor Management
  {
    id: "bloomerang",
    name: "Bloomerang",
    category: "Fundraising & Donor Management",
    authType: "api_key",
    hasLiveValidation: false,
    fields: [{ key: "apiKey", label: "API Key", secret: true }],
    helpText: "We'll save this key, but haven't wired up live verification for it yet.",
  },
  {
    id: "donorperfect",
    name: "DonorPerfect",
    category: "Fundraising & Donor Management",
    authType: "api_key",
    hasLiveValidation: false,
    fields: [{ key: "apiKey", label: "API Key", secret: true }],
    helpText: "We'll save this key, but haven't wired up live verification for it yet.",
  },
  {
    id: "neoncrm",
    name: "Neon CRM",
    category: "Fundraising & Donor Management",
    authType: "api_key",
    hasLiveValidation: false,
    fields: [
      { key: "orgId", label: "Organization ID" },
      { key: "apiKey", label: "API Key", secret: true },
    ],
    helpText: "We'll save this key, but haven't wired up live verification for it yet.",
  },
  { id: "salesforce-npsp", name: "Salesforce Nonprofit Cloud", category: "Fundraising & Donor Management", authType: "oauth", hasLiveValidation: false, fields: [] },
  {
    id: "littlegreenlight",
    name: "Little Green Light",
    category: "Fundraising & Donor Management",
    authType: "api_key",
    hasLiveValidation: false,
    fields: [{ key: "apiKey", label: "API Key", secret: true }],
    helpText: "We'll save this key, but haven't wired up live verification for it yet.",
  },

  // Payments
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [{ key: "secretKey", label: "Secret Key", placeholder: "sk_live_... or sk_test_...", secret: true }],
    docsUrl: "https://dashboard.stripe.com/apikeys",
  },
  {
    id: "paypal",
    name: "PayPal",
    category: "Payments",
    authType: "api_key",
    hasLiveValidation: true,
    fields: [
      { key: "clientId", label: "Client ID" },
      { key: "clientSecret", label: "Client Secret", secret: true },
      { key: "environment", label: "Environment", type: "select", options: ["sandbox", "live"] },
    ],
    docsUrl: "https://developer.paypal.com/dashboard/applications",
  },
];

export function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function providersByCategory(): Record<string, Provider[]> {
  const map: Record<string, Provider[]> = {};
  for (const category of CATEGORIES) map[category] = [];
  for (const provider of PROVIDERS) {
    (map[provider.category] ||= []).push(provider);
  }
  return map;
}
