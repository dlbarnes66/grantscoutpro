import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Grant Scout Pro is built by a team that knows the grant process from both sides. Learn about our mission to make federal, state, and foundation funding easier to find and win.",
  openGraph: {
    title: "About Grant Scout Pro",
    description:
      "Learn about the team and mission behind Grant Scout Pro, the AI-powered grant discovery and application platform for nonprofits.",
    url: "https://www.grantscoutpro.com/about",
    siteName: "Grant Scout Pro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Grant Scout Pro",
    description:
      "Learn about the team and mission behind Grant Scout Pro, the AI-powered grant discovery and application platform for nonprofits.",
    images: ["/og-image.png"],
  },
};

export default function AboutPage() {
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
          maxWidth: "900px",
          margin: "0 auto",
          padding: "100px 60px 120px",
        }}
      >
        <a
          href="/"
          style={{
            color: "#CBD5E1",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← Back to Home
        </a>

        <h1
          style={{
            fontSize: "56px",
            fontWeight: 800,
            marginTop: "24px",
            marginBottom: "24px",
          }}
        >
          About GrantScout Pro
        </h1>

        <p
          style={{
            fontSize: "22px",
            color: "#CBD5E1",
            lineHeight: 1.6,
            marginBottom: "24px",
          }}
        >
          Grant funding is out there, but finding it, qualifying for it, and
          writing a competitive proposal takes time most nonprofit teams
          don't have. GrantScout Pro was built to close that gap.
        </p>

        <p
          style={{
            fontSize: "20px",
            color: "#CBD5E1",
            lineHeight: 1.6,
            marginBottom: "24px",
          }}
        >
          We bring federal, state, and foundation grant data into a single
          workspace, match opportunities to your organization's mission and
          programs, and use AI to help you draft narratives, budgets, and
          supporting documents, so your team can spend less time searching
          and more time serving the people you exist to help.
        </p>

        <p
          style={{
            fontSize: "20px",
            color: "#CBD5E1",
            lineHeight: 1.6,
            marginBottom: "48px",
          }}
        >
          GrantScout Pro is built and operated for nonprofit and mission-driven
          teams who need a faster, more organized way to win the funding that
          keeps their work moving.
        </p>

        <div style={{ display: "flex", gap: "16px" }}>
          <a
            href="/sign-up"
            style={{
              background: "#F5C542",
              color: "#071633",
              border: "none",
              borderRadius: "12px",
              padding: "16px 28px",
              fontSize: "18px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Start Free Trial
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
              fontSize: "18px",
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
  );
}
