import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GrantScout Pro — Integrations",
  description:
    "Connect GrantScout Pro to the communications, accounting, project management, and fundraising tools your team already uses.",
  openGraph: {
    title: "GrantScout Pro — Integrations",
    description:
      "Connect GrantScout Pro to the tools your team already uses.",
    url: "https://grantscoutpro.com/integrations",
    siteName: "GrantScout Pro",
    images: [
      {
        url: "/og-integrations.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

type Category = {
  name: string;
  description: string;
  tools: string[];
};

const CATEGORIES: Category[] = [
  {
    name: "Communications",
    description: "Keep your team and reviewers in the loop wherever they already talk.",
    tools: ["Slack", "Microsoft Teams", "Gmail", "Outlook"],
  },
  {
    name: "Project Management",
    description: "Turn grant deadlines and tasks into work your team already tracks.",
    tools: ["Asana", "Monday.com", "Trello", "ClickUp"],
  },
  {
    name: "Document Management",
    description: "Keep proposals, attachments, and compliance files in sync with your storage.",
    tools: ["Google Drive", "Dropbox", "Microsoft OneDrive", "Box"],
  },
  {
    name: "Productivity & Office",
    description: "Draft, edit, and export proposal documents in the formats your team lives in.",
    tools: ["Google Workspace", "Microsoft 365"],
  },
  {
    name: "Calendar & Scheduling",
    description: "Sync deadlines, reviews, and reminders straight to your calendar.",
    tools: ["Google Calendar", "Outlook Calendar", "Calendly"],
  },
  {
    name: "E-Signature",
    description: "Route award letters, agreements, and compliance forms for signature.",
    tools: ["DocuSign", "Adobe Acrobat Sign", "Dropbox Sign"],
  },
  {
    name: "Forms & Data",
    description: "Pull application and survey data straight into your grant workspace.",
    tools: ["Google Forms", "Typeform", "Jotform", "Airtable"],
  },
  {
    name: "Accounting",
    description: "Match budgets and awarded funds to the books without double entry.",
    tools: ["QuickBooks Online", "Xero", "Sage Intacct"],
  },
  {
    name: "HR",
    description: "Tie staff time and capacity to the grants they support.",
    tools: ["Gusto", "BambooHR", "Rippling"],
  },
  {
    name: "Fundraising & Donor Management",
    description: "Connect grant revenue to the rest of your fundraising picture.",
    tools: ["Bloomerang", "DonorPerfect", "Neon CRM", "Salesforce Nonprofit Cloud", "Little Green Light"],
  },
  {
    name: "Payments",
    description: "Reconcile disbursements and matching funds as they move.",
    tools: ["Stripe", "PayPal"],
  },
];

export default function IntegrationsPage() {
  return (
    <div
      style={{
        background: "#071633",
        color: "white",
        minHeight: "100vh",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "100px 60px 40px",
        }}
      >
        <a
          href="/"
          style={{ color: "#CBD5E1", textDecoration: "none", fontSize: "14px" }}
        >
          ← Back to Home
        </a>

        <div style={{ maxWidth: "760px", marginTop: "24px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              marginBottom: "20px",
              lineHeight: 1.1,
            }}
          >
            Integrations
          </h1>

          <p
            style={{
              fontSize: "22px",
              color: "#CBD5E1",
              lineHeight: 1.5,
            }}
          >
            GrantScout Pro is built to plug into the tools your team already
            runs on — not replace them. Here's what's on our integration
            roadmap.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px 60px 60px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}
      >
        {CATEGORIES.map((category) => (
          <div
            key={category.name}
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <div
              style={{
                color: "#F5C542",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              {category.name}
            </div>

            <p
              style={{
                color: "#CBD5E1",
                fontSize: "15px",
                lineHeight: 1.5,
                marginBottom: "18px",
              }}
            >
              {category.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {category.tools.map((tool) => (
                <span
                  key={tool}
                  style={{
                    background: "rgba(255,255,255,.06)",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: "999px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    color: "#E2E8F0",
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 60px 120px",
        }}
      >
        <div
          style={{
            background: "#10254D",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "28px",
            padding: "60px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              marginBottom: "16px",
            }}
          >
            Don't see the tool you use?
          </h2>

          <p
            style={{
              color: "#CBD5E1",
              fontSize: "18px",
              maxWidth: "640px",
              margin: "0 auto 32px",
            }}
          >
            Tell us what you'd like GrantScout Pro to connect to and we'll
            factor it into what we build next.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="mailto:dlbarnes@vcgnow.com?subject=Integration%20request"
              style={{
                background: "#F5C542",
                color: "#071633",
                border: "none",
                borderRadius: "12px",
                padding: "16px 28px",
                fontSize: "16px",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Request an Integration
            </a>

            <a
              href="https://calendly.com/dlbarnes-dbglobalinvestments/new-meeting-1"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "transparent",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,.2)",
                borderRadius: "12px",
                padding: "16px 28px",
                fontSize: "16px",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Book Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
